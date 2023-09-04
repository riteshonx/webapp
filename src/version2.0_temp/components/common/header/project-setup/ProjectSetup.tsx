import React, { ReactElement, useContext, useEffect } from 'react';
import {
  ExchangeToken,
  exchangeTokenFeatures,
} from 'src/modules/authentication/utils';
import { genFetchProjectNames } from 'src/services/projectServices';

import { useHistory } from 'react-router-dom';
import { postApi } from 'src/services/api';

import {
  decodeToken,
  getAllExchangeToken,
  setActiveTenantId,
  setExchangeToken,
} from 'src/services/authservice';

import {
  setCurrentLevel,
  setIsLoading,
  setSelectedMenu,
} from 'src/modules/root/context/authentication/action';

import { stateContext } from 'src/modules/root/context/authentication/authContext';
import DropdownSearch from '../../dropdownSearch/dropdownSearch';

// import { genPreference, genTenantDetails, genTenantRole } from './project-util';

import { usePortfolios } from './usePortfolio';
import { usePortfolioSelection } from './usePortfolioSelection';
import { useProjectSelection } from './useProjectSelection';
import { useFetchProjectToken } from './useFetchProjectToken';
import { useFetchProjects } from './useFetchProjects';

function ProjectSetup(): ReactElement {
  const { dispatch, state }: any = useContext(stateContext);
  const history = useHistory();
  const pathname = decodeURI(window.location.pathname.split('/v2')[1]);
  // const urlPathName = window.location.pathname.split('/v2');
  // const [selectedProjectId, setSelectedProjectId] = useState(-1);
  // const { adminUser } = decodeToken();
  const { fetchProjectToken } = useFetchProjectToken();
  const { openDropdown, handleProjectSelection, isOpenDropdown } =
    useProjectSelection();
  const { getPortfolios } = usePortfolios();
  const {
    openPortfolioDropdown,
    handlePortfolioSelection,
    isOpenPortfolioDropdown,
  } = usePortfolioSelection();
  const { getProjects } = useFetchProjects();
  const getValuesFromHistory = (): {
    projectId: number;
    menuType: string;
  } => {
    const menuType = 'Home';
    const projectId = window.location.pathname.split('/')[2];

    if (isNaN(parseInt(projectId))) {
      return { projectId: -1, menuType };
    }

    return { projectId: parseInt(projectId), menuType };
  };

  const getActiveTenant = async () => {
    try {
      const { projectId, menuType } = getValuesFromHistory();
      const selectedProject = sessionStorage.getItem('selectedProject');
      if (
        selectedProject &&
        projectId === JSON.parse(selectedProject)?.projectId
      ) {
        getPortfolios(projectId);
        return;
      } else if (projectId < 0) {
        getPortfolios(projectId);
        return;
      } else if (projectId > 0) {
        sessionStorage.removeItem('selectedProject');
      }

      dispatch(setIsLoading(true));
      const projectNamesResponse = await genFetchProjectNames([projectId]);
      if (projectNamesResponse?.data?.project?.length) {
        getPortfolios(projectId);
        dispatch(setCurrentLevel('project'));
        dispatch(setSelectedMenu(menuType));
        sessionStorage.setItem('selectedMenu', menuType);
        return;
      } else {
        if (!getAllExchangeToken()) {
          getPortfolios(projectId);
          return;
        }
        let allTokens = JSON.parse(getAllExchangeToken());
        allTokens = Object.entries(allTokens);
        let targetActiveTenantFound = false;
        let targetTenant;
        for (let start = 0; start < allTokens.length; start++) {
          // what is this i
          const response = await genFetchProjectNames(
            [projectId],
            allTokens[start][1]
          );
          if (response?.data?.project?.length) {
            targetActiveTenantFound = true;
            targetTenant = response?.data?.project[0];

            break;
          }
        }
        dispatch(setIsLoading(false));
        if (targetActiveTenantFound) {
          setActiveTenantId(
            targetTenant?.tenantId,
            targetTenant?.tenantCompany
          );
          dispatch(setCurrentLevel('project'));
          dispatch(setSelectedMenu(menuType));
          sessionStorage.setItem('selectedMenu', menuType);
          getPortfolios(projectId);
        } else {
          checkOtherTenants(projectId, menuType);
        }
      }
    } catch (error) {
      dispatch(setIsLoading(false));
      console.error(error);
    }
  };

  const checkOtherTenants = async (projectId: number, menuType: string) => {
    const allTokens = JSON.parse(getAllExchangeToken());
    if (decodeToken().tenants.length > Object.entries(allTokens).length) {
      const tenants = Object.entries(allTokens).map((allToken: any) =>
        Number(allToken[0])
      ); // use token as param

      const userTenantIds = decodeToken().tenants.filter((eToken: any) => {
        return tenants.indexOf(eToken.id) == -1;
      });

      const promiseList = [];
      for (let i = 0; i < userTenantIds.length; i++) {
        const exchangeToken: ExchangeToken = {
          tenantId: Number(userTenantIds[i].id),
          features: exchangeTokenFeatures,
        };
        promiseList.push(postApi('V1/user/login/exchange', exchangeToken));
      }

      dispatch(setIsLoading(true));
      const responseList = await Promise.all(promiseList);
      for (let i = 0; i < responseList.length; i++) {
        setExchangeToken(responseList[i].success, Number(userTenantIds[i].id));
      }

      let targetActiveTenantFound = false;
      let targetTenant;
      for (let i = 0; i < responseList.length; i++) {
        const response = await genFetchProjectNames(
          [projectId],
          responseList[i].success
        );
        if (response?.data?.project?.length) {
          targetActiveTenantFound = true;
          targetTenant = response?.data?.project[0];
          break;
        }
      }

      dispatch(setIsLoading(false));

      if (targetActiveTenantFound) {
        setActiveTenantId(targetTenant?.tenantId, targetTenant?.tenantCompany);
        dispatch(setCurrentLevel('project'));
        dispatch(setSelectedMenu(menuType));
        sessionStorage.setItem('selectedMenu', menuType);
      } else {
        history.push('/v2');
        dispatch(setSelectedMenu('Home'));
        sessionStorage.setItem('selectedMenu', 'Home');
      }
    } else {
      history.push('/v2');
      dispatch(setSelectedMenu('Home'));
      sessionStorage.setItem('selectedMenu', 'Home');
    }
    getPortfolios(projectId);
  };

  useEffect(() => {
    if (state.tenantSwitch) {
      getPortfolios();
    }
  }, [state.tenantSwitch]);

  useEffect(() => {
    getActiveTenant();

    //NOTE: need this code for production-center & generating widgets
    // genPreference(dispatch, state);

    // genTenantDetails().then((res: boolean) => {
    // 	if (history.location.pathname.includes('/productionCenter')) {
    // 		if (!res) {
    // 			dispatch(setSelectedMenu('Home'));
    // 			sessionStorage.setItem('selectedMenu', 'Home');
    // 			history.push('/v2');
    // 		}
    // 	}
    // });
    // genTenantRole();
  }, []);

  useEffect(() => {
    state.currentPortfolio?.portfolioId && getProjects();
  }, [state.currentPortfolio, state.getProjectList]);

  useEffect(() => {
    if (state?.currentProject && state.currentProject?.projectName !== 'All') {
      // setSelectedProjectId(state.currentProject.projectId);
      fetchProjectToken(state.currentProject.projectId);
    } else {
      // setSelectedProjectId(-1);
    }
  }, [state.currentProject]);

  const projectOptions = state.projectList.map((option: any) => {
    if (state?.isOnxTenant) {
      return (
        option.projectId !== 0 && {
          ...option,
          projectName: option.projectName,
        }
      );
    } else {
      return {
        ...option,
        projectName: option.projectName,
      };
    }
  });

  const portfolioOptions: [
    {
      portfolioId: number;
      portfolioName: string;
      projectInfos: [any];
    }
  ] = state.portfolioList?.length
    ? state.portfolioList.map((option: any) => {
        return {
          ...option,
          portfolioName: option.portfolioName,
        };
      })
    : [];

  return (
    <>
      <div className="header__left__portfolio">
        <>
          <div
            className="header__left__portfolio__title"
            data-testid={`header-portfolio`}
          >
            Portfolio
          </div>
          <DropdownSearch
            open={isOpenPortfolioDropdown}
            selectedValue={state.currentPortfolio}
            handleDropDownClick={openPortfolioDropdown}
            options={portfolioOptions}
            optionLabel={'portfolioName'}
            handleDropdownSelectionChange={handlePortfolioSelection}
            isDisabled={state.currentLevel !== 'tenant' ? false : true}
            type={'portfolio'}
            transparent={pathname === '' && state.projectList?.length === 1}
            isOnxTenant={state.isOnxTenant}
          />
        </>
        <>
          <div
            className="header__left__portfolio__title"
            data-testid={`header-portfolio-project`}
          >
            Project
          </div>
          <div>
            <DropdownSearch
              open={isOpenDropdown}
              selectedValue={state.currentProject}
              handleDropDownClick={openDropdown}
              options={projectOptions}
              optionLabel={'projectName'}
              handleDropdownSelectionChange={handleProjectSelection}
              isDisabled={
                state.projectList?.length > 1 && state.currentLevel !== 'tenant'
                  ? false
                  : true
              }
              transparent={pathname === '' && state.projectList?.length === 1}
              type={'project'}
              isOnxTenant={state.isOnxTenant}
            />
          </div>
        </>
      </div>
    </>
  );
}

export default ProjectSetup;
