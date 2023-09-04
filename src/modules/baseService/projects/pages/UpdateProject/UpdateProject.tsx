import Button from '@material-ui/core/Button';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { match, useHistory, useRouteMatch } from 'react-router-dom';
import {
  CREATE_PROJECT_LOCATIOn,
  FETCH_PROJECT_BY_ID,
  LOAD_USER_PORTFOLIOS,
  UPDATE_PROJECT_DETAILS,
  UPDATE_PROJECT_LOCATION,
  UPDATE_PROJECT_WITH_PORTFOLIO,
} from '../../../../../graphhql/queries/projects';
import { postApi } from '../../../../../services/api';
import {
  decodeExchangeToken,
  decodeProjectExchangeToken,
  getExchangeToken,
} from '../../../../../services/authservice';
import { client } from '../../../../../services/graphql';
import {
  myProjectRole,
  ProjectSetupRolesKeys,
  tenantProjectRole,
} from '../../../../../utils/role';
import {
  setIsLoading,
  setProjectToken,
  updateProjectList,
} from '../../../../root/context/authentication/action';
import { stateContext } from '../../../../root/context/authentication/authContext';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog/ConfirmDialog';
import Notification, {
  AlertTypes,
} from '../../../../shared/components/Toaster/Toaster';
import { canUpdateProject } from '../../../roles/utils/permission';
import ProjectDetails from '../../components/ProjectDetails/ProjectDetails';
import ProjectInfo from '../../components/ProjectInfo/ProjectInfo';
import ProjectMember from '../../components/ProjectMember/ProjectMember';
import {
  resetProjectDetails,
  setProjecDetailsDirty,
  setProjectDetails,
  setProjectInfo,
  setProjectMetricsDetails,
  setProjectSettingToken,
  setProjectUpdatePermission,
} from '../../Context/ProjectDetailsActions';
import { projectDetailsContext } from '../../Context/ProjectDetailsContext';
import './UpdateProject.scss';
export interface Params {
  projectId: string;
}

export interface Metrics {
  ProjectCurrencies: string;
  ProjectMeasurements: string;
  ProjectStages: string;
  ProjectTemperatures: string;
  ProjectTypes: string;
}

export interface Info {
  ProjectAddress: any;
  ProjectCode: string;
  ProjectName: string;
}

interface message {
  header: string;
  text: string;
  cancel: string;
  proceed: string;
}

const confirmMessage: message = {
  header: 'Are you sure?',
  text: `If you cancel now, your updates won’t be saved.`,
  cancel: 'Go back',
  proceed: "Yes, I'm sure",
};

export default function UpdateProject(props: any): ReactElement {
  const { projectDetailsState, projectDetailsDispatch }: any = useContext(
    projectDetailsContext
  );
  const { state, dispatch }: any = useContext(stateContext);
  const [projectTab, setProjectTab] = useState('DETAILS');
  const [updatedDetails, setUpdatedDetails] = useState<any>();
  const history = useHistory();
  const pathMatch: match<Params> = useRouteMatch();
  const [confirmOpen, setconfirmOpen] = useState(false);
  const [isPartOf, setIsPartOf] = useState(false);
  const [portfolioValue, setPortfolioValue] = useState<Array<any>>([]);

  useEffect(() => {
    projectDetailsDispatch(
      resetProjectDetails({
        projectDetails: [],
        projectInfo: null,
        projectMetricsDetails: null,
        projectDetailsDirty: false,
        projectDetailsView: null,
        projectToken: null,
        projectPermission: {},
      })
    );
    if (projectDetailsState?.projectDetailsView) {
      setProjectTab(projectDetailsState?.projectDetailsView);
    }
    fetchUserPortfolios();
  }, []);

  useEffect(() => {
    if (projectDetailsState.projectToken) {
      if (projectDetailsState.projectToken !== 'EMPTY') {
        const projectID = decodeProjectExchangeToken(
          projectDetailsState.projectToken
        )?.projectId;
        if (
          Number(pathMatch?.params?.projectId) &&
          projectDetailsState.projectToken &&
          projectID == pathMatch?.params?.projectId
        ) {
          fetchProjectDetail(Number(pathMatch?.params?.projectId));
        }
      } else if (Number(pathMatch?.params?.projectId)) {
        fetchProjectDetail(Number(pathMatch?.params?.projectId));
      }
    }
  }, [Number(pathMatch?.params?.projectId), projectDetailsState.projectToken]);

  useEffect(() => {
    if (
      projectDetailsState?.projectUpdatePermission
        ?.canViewProjectTemplateAssociation
    ) {
      setIsPartOf(true);
    } else {
      setIsPartOf(false);
    }
  }, [
    state.projects,
    Number(pathMatch?.params?.projectId),
    projectDetailsState.projectToken,
  ]);

  useEffect(() => {
    fetchProjectToken();
  }, [state.projects, Number(pathMatch?.params?.projectId)]);

  const fetchProjectToken = async () => {
    if (Number(pathMatch.params.projectId)) {
      try {
        dispatch(setIsLoading(true));
        const ProjectToken: any = {
          tenantId: Number(decodeExchangeToken().tenantId),
          projectId: Number(pathMatch.params.projectId),
          features: ['FORMS', 'PROJECT_SETUP'],
        };
        const projectTokenResponse = await postApi(
          'V1/user/login/exchange',
          ProjectToken
        );
        dispatch(setProjectToken(projectTokenResponse.success));
        setUpdatePermission(projectTokenResponse.success);
        projectDetailsDispatch(
          setProjectSettingToken(projectTokenResponse.success)
        );

        dispatch(setIsLoading(false));
      } catch (error) {
        const targetPermission: any = {};
        dispatch(setIsLoading(false));
        for (const [key, value] of Object.entries(ProjectSetupRolesKeys)) {
          targetPermission[
            `can${key[0].toLocaleUpperCase()}${key.slice(1, key.length)}`
          ] = false;
        }
        projectDetailsDispatch(setProjectSettingToken('EMPTY'));
        projectDetailsDispatch(setProjectUpdatePermission(targetPermission));
      }
    }
  };

  const fetchUserPortfolios = async () => {
    try {
      const role = decodeExchangeToken().allowedRoles.includes(
        tenantProjectRole.viewTenantProjects
      )
        ? tenantProjectRole.viewTenantProjects
        : myProjectRole.viewMyProjects;
      const projectsResponse = await client.query({
        query: LOAD_USER_PORTFOLIOS,
        fetchPolicy: 'network-only',
        context: { role },
      });
      const portfolios: Array<any> = [];
      if (projectsResponse.data.portfolio.length > 0) {
        portfolios.push(...projectsResponse.data.portfolio);
      }
      setPortfolioValue(portfolios);
    } catch (error) {
      console.log(error);
    }
  };

  const setUpdatePermission = (projectToken?: any) => {
    const targetPermission: any = {};
    if (projectToken) {
      const allowedRoles =
        decodeProjectExchangeToken(projectToken).allowedRoles;
      for (const [key, value] of Object.entries(ProjectSetupRolesKeys)) {
        const permission = allowedRoles.indexOf(value) > -1;
        targetPermission[
          `can${key[0].toLocaleUpperCase()}${key.slice(1, key.length)}`
        ] = permission;
      }
      projectDetailsDispatch(setProjectUpdatePermission(targetPermission));
    } else {
      for (const [key, value] of Object.entries(ProjectSetupRolesKeys)) {
        targetPermission[
          `can${key[0].toLocaleUpperCase()}${key.slice(1, key.length)}`
        ] = false;
      }
      projectDetailsDispatch(setProjectUpdatePermission(targetPermission));
    }
  };

  const navigateback = () => {
    if (projectDetailsState?.projectDetailsDirty) {
      setconfirmOpen(projectDetailsState?.projectDetailsDirty);
    } else {
      props.closeUpdateSideBar();
      history.push(
        `/base/project-lists/${Number(pathMatch?.params?.projectId)}`
      );
    }
  };

  const toggleView = (viewType: string) => {
    if (viewType === 'TEAMS' && projectDetailsState?.projectMetricsDetails) {
      projectDetailsDispatch(
        setProjectMetricsDetails(projectDetailsState?.projectMetricsDetails)
      );
      setProjectTab(viewType);
    }
    if (viewType === 'SETTINGS') {
      if (isPartOf) {
        history.push(
          `/base/project-lists/${Number(
            pathMatch?.params?.projectId
          )}/settings/form-association`
        );
        setProjectTab(viewType);
      }
    } else {
      setProjectTab(viewType);
    }
  };

  const handleConfirmBoxClose = () => {
    setconfirmOpen(false);
    projectDetailsDispatch(setProjecDetailsDirty(false));
    history.push(`/base/project-lists/${Number(pathMatch?.params?.projectId)}`);
  };

  const cancelUpdate = () => {
    projectDetailsDispatch(setProjecDetailsDirty(false));
    props.closeUpdateSideBar();
  };

  const updateProjectDetails = (argFormValues: any, argAddressId: number) => {
    const metrics = projectDetailsState?.projectMetricsDetails;
    const info = projectDetailsState?.projectInfo;
    const details = projectDetailsState?.projectDetails;
    let location = '';
    if (argFormValues.location) {
      location = `${argFormValues?.location?.lat || '0'},${
        argFormValues?.location?.lng || '0'
      }`;
    } else {
      location = `0,0`;
    }
    const payload: any = {
      id: Number(pathMatch?.params?.projectId),
      name: info?.ProjectName?.trim(),
      address: {},
      config: {
        projectCode: info?.ProjectCode?.trim() || '',
        stage: metrics?.ProjectStages,
        type: metrics?.ProjectTypes,
      },
      metrics: {
        currency: metrics?.ProjectCurrencies,
        temprature: metrics?.ProjectTemperatures,
        timeZone: '',
        unitOfMeasurement: metrics?.ProjectMeasurements,
      },
      startDate: info?.ProjectStartdate
        ? info.ProjectStartdate
        : details[0].startDate,
      endDate: info?.ProjectEnddate ? info.ProjectEnddate : details[0].endDate,
      location,
    };
    updateProjectDetail(payload, info.ProjectPortfolio);
    if (argAddressId > 0) {
      updateAddressValues(argAddressId, argFormValues);
    } else {
      addProjectLocation(argFormValues);
    }
    // call API
  };

  const addProjectLocation = async (argFormValues: any) => {
    try {
      await client.mutate({
        mutation: CREATE_PROJECT_LOCATIOn,
        variables: {
          object: {
            addressLine1: argFormValues.addressLine1,
            addressLine2: argFormValues.addressLine2,
            fullAddress: argFormValues.fullAddress,
            city: argFormValues.city,
            country: argFormValues.country,
            postalCode: argFormValues.postalCode,
            projectId: Number(pathMatch?.params?.projectId),
            state: argFormValues.state,
            streetNo: argFormValues.streetno,
          },
        },
        context: { role: tenantProjectRole.createTenantProject },
      });
    } catch (error: any) {
      console.log(error);
    }
  };

  const updateAddressValues = async (
    argAddressId: number,
    argFormValues: any
  ) => {
    try {
      const role = !canUpdateProject
        ? myProjectRole.updateMyProject
        : tenantProjectRole.updateTenantProject;
      const token = !canUpdateProject
        ? projectDetailsState.projectToken
        : undefined;
      const response = await client.mutate({
        mutation: UPDATE_PROJECT_LOCATION,
        variables: {
          id: argAddressId,
          addressLine1: argFormValues.addressLine1,
          addressLine2: argFormValues.addressLine2.trim(),
          streetNo: argFormValues.streetno.trim(),
          city: argFormValues.city.trim(),
          country: argFormValues.country.trim(),
          state: argFormValues.state.trim(),
          postalCode: argFormValues.postalCode.trim(),
          fullAddress: argFormValues.fullAddress,
          countryShortCode: argFormValues.countryShortCode,
        },
        context: { role, token },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const updateProjectDetail = async (payload: any, portfolioInfo: any) => {
    try {
      dispatch(setIsLoading(true));
      const role = !canUpdateProject
        ? myProjectRole.updateMyProject
        : tenantProjectRole.updateTenantProject;
      const token = !canUpdateProject
        ? projectDetailsState.projectToken
        : undefined;
      const formUpdateResponse: any = await client.mutate({
        mutation: UPDATE_PROJECT_DETAILS,
        variables: {
          id: payload.id,
          address: payload.address,
          config: payload.config,
          metrics: payload.metrics,
          name: payload.name,
          userId: decodeExchangeToken().userId,
          startDate: payload.startDate,
          endDate: payload.endDate,
          location: payload.location,
        },
        context: { role, token },
      });
      Notification.sendNotification(
        'Project updated successfully',
        AlertTypes.success
      );
      projectDetailsDispatch(setProjecDetailsDirty(false));
      if (portfolioInfo) updatePortfolioToProject(portfolioInfo);
      else props.refresh();
      setconfirmOpen(false);
      props.closeUpdateSideBar();
      dispatch(setIsLoading(false));
    } catch (err: any) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(err, AlertTypes.warn);
      console.log(err);
    }
  };

  const updatePortfolioToProject = async (ProjectPortfolio?: any) => {
    const projectId = Number(pathMatch?.params?.projectId);
    const uniqueUpdatededProjects: Array<any> = [];
    const portfolioSelectedArr: Array<any> = [];
    let portfolioUpdatedArr: Array<any> = [];
    let hasEmptyPortfolio = true;
    const role = !canUpdateProject
      ? myProjectRole.updateMyProject
      : tenantProjectRole.updateTenantProject;
    const token = !canUpdateProject
      ? projectDetailsState.projectToken
      : undefined;
    if (ProjectPortfolio && ProjectPortfolio.length) {
      ProjectPortfolio.forEach((item: any) => {
        portfolioValue.forEach((item1: any) => {
          if (item1.name === item) {
            let obj = {};
            obj = { name: item1.name, id: item1.id };
            portfolioSelectedArr.push(obj);
          }
        });
      });
      portfolioUpdatedArr = [...portfolioSelectedArr];
      if (
        projectDetailsState?.projectDetails?.length &&
        projectDetailsState?.projectDetails[0]?.projectPortfolioAssociations
          ?.length
      ) {
        hasEmptyPortfolio = false;
        projectDetailsState?.projectDetails[0]?.projectPortfolioAssociations.forEach(
          (item2: any) => {
            let obj1 = {};
            obj1 = { name: item2.portfolio.name, id: item2.portfolioId };
            portfolioUpdatedArr.push(obj1);
          }
        );
      }
      for (let i = 0; i < portfolioUpdatedArr.length; i++) {
        const isPrevious = !hasEmptyPortfolio
          ? projectDetailsState?.projectDetails[0]?.projectPortfolioAssociations.find(
              (temp1: any) => {
                return portfolioUpdatedArr[i].id == temp1.portfolioId;
              }
            )
          : false;
        const isCurrent = portfolioSelectedArr.find((temp: any) => {
          return portfolioUpdatedArr[i].id == temp.id;
        });

        if (!isPrevious && isCurrent) {
          if (uniqueUpdatededProjects?.length) {
            const hasExist = uniqueUpdatededProjects.find((temp2: any, i2) => {
              return portfolioUpdatedArr[i].id == temp2.portfolioId;
            });
            if (!hasExist)
              uniqueUpdatededProjects.push({
                portfolioId: portfolioUpdatedArr[i].id,
                projectId: projectId,
                deleted: false,
              });
          } else {
            uniqueUpdatededProjects.push({
              portfolioId: portfolioUpdatedArr[i].id,
              projectId: projectId,
              deleted: false,
            });
          }
        } else if (isPrevious && !isCurrent) {
          if (uniqueUpdatededProjects?.length) {
            const hasExist1 = uniqueUpdatededProjects.find((temp2: any, i2) => {
              return portfolioUpdatedArr[i].id == temp2.portfolioId;
            });
            if (!hasExist1)
              uniqueUpdatededProjects.push({
                portfolioId: portfolioUpdatedArr[i].id,
                projectId: projectId,
                deleted: true,
              });
          } else {
            uniqueUpdatededProjects.push({
              portfolioId: portfolioUpdatedArr[i].id,
              projectId: projectId,
              deleted: true,
            });
          }
        } else if (isPrevious && isCurrent) {
          if (uniqueUpdatededProjects?.length) {
            const hasExist2 = uniqueUpdatededProjects.find((temp2: any, i2) => {
              return portfolioUpdatedArr[i].id == temp2.portfolioId;
            });
            if (!hasExist2)
              uniqueUpdatededProjects.push({
                portfolioId: portfolioUpdatedArr[i].id,
                projectId: projectId,
                deleted: false,
              });
          } else {
            uniqueUpdatededProjects.push({
              portfolioId: portfolioUpdatedArr[i].id,
              projectId: projectId,
              deleted: false,
            });
          }
        }
      }
    } else if (
      projectDetailsState?.projectDetails?.length &&
      projectDetailsState?.projectDetails[0]?.projectPortfolioAssociations
        ?.length
    ) {
      for (
        let j = 0;
        j <
        projectDetailsState.projectDetails[0].projectPortfolioAssociations
          .length;
        j++
      ) {
        if (
          projectDetailsState.projectDetails[0].projectPortfolioAssociations[j]
            .portfolio.name
        ) {
          uniqueUpdatededProjects.push({
            portfolioId:
              projectDetailsState.projectDetails[0]
                .projectPortfolioAssociations[j].portfolioId,
            projectId: projectId,
            deleted: true,
          });
        }
      }
    }
    try {
      dispatch(setIsLoading(true));
      const promiseList: any = [];
      promiseList.push(
        client.mutate({
          mutation: UPDATE_PROJECT_WITH_PORTFOLIO,
          variables: {
            objects: uniqueUpdatededProjects,
          },
          context: { role, token },
        })
      );
      await Promise.all(promiseList);
      dispatch(updateProjectList(!state.getProjectList));
      dispatch(setIsLoading(false));
      setTimeout(() => {
        props.refresh();
      }, 1000);
    } catch (err: any) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(err, AlertTypes.warn);
    }
  };

  const fetchProjectDetail = async (projectId: number) => {
    try {
      dispatch(setIsLoading(true));
      const role = decodeExchangeToken().allowedRoles.includes(
        tenantProjectRole.viewTenantProjects
      )
        ? tenantProjectRole.viewTenantProjects
        : myProjectRole.viewMyProjects;
      const token = decodeExchangeToken().allowedRoles.includes(
        tenantProjectRole.viewTenantProjects
      )
        ? getExchangeToken()
        : projectDetailsState.projectToken !== 'EMPTY' &&
          decodeProjectExchangeToken(
            projectDetailsState.projectToken
          ).allowedRoles.includes(tenantProjectRole.viewTenantProjects)
        ? projectDetailsState.projectToken
        : getExchangeToken();
      const projectsResponse = await client.query({
        query: FETCH_PROJECT_BY_ID,
        variables: {
          id: projectId,
          userId: decodeExchangeToken().userId,
        },
        fetchPolicy: 'network-only',
        context: { role, token },
      });
      const projects: Array<any> = [];
      if (projectsResponse.data.project.length > 0) {
        projects.push(...projectsResponse.data.project);
      }
      projectDetailsDispatch(setProjectDetails(projects));
      const projectMetrics: Metrics = {
        ProjectCurrencies: projects[0]?.metrics?.currency,
        ProjectMeasurements: projects[0]?.metrics?.unitOfMeasurement,
        ProjectStages: projects[0]?.config?.stage,
        ProjectTemperatures: projects[0]?.metrics?.temprature,
        ProjectTypes: projects[0]?.config?.type,
      };
      const projectInfo: Info = {
        ProjectAddress: projects[0]?.address,
        ProjectCode: projects[0]?.config?.projectCode,
        ProjectName: projects[0]?.name,
      };
      projectDetailsDispatch(setProjectInfo(projectInfo));
      projectDetailsDispatch(setProjectMetricsDetails(projectMetrics));
      dispatch(setIsLoading(false));
    } catch (error) {
      console.log(error);
      dispatch(setIsLoading(false));
    }
  };

  const renderProjectDetailsComponent = () => {
    switch (projectTab) {
      case 'DETAILS':
        return <ProjectDetails />;
      case 'TEAMS':
        return <ProjectMember />;
      // case 'SETTINGS': return <ProjectSettings />;
      default:
        return <ProjectDetails />;
    }
  };

  return (
    <div className={`updateProject`}>
      {projectTab === 'DETAILS' && (
        <div className="updateProject__inactive"></div>
      )}
      <div
        className={`${
          projectTab === 'DETAILS' ? 'smallSideBar' : 'fullSideBar'
        }`}
      >
        <span className="closeIcon">
          <HighlightOffIcon
            data-testid={'close-update'}
            onClick={navigateback}
          />
        </span>

        <div
          className="updateProject__info"
          style={{ flexBasis: `${projectTab === 'DETAILS' ? '50%' : '25%'}` }}
        >
          <ProjectInfo
            portfolioValue={portfolioValue}
            updateProject={updateProjectDetails}
            navBack={navigateback}
          />
        </div>
        <div
          className="updateProject__details"
          style={{ flexBasis: `${projectTab === 'DETAILS' ? '50%' : '75%'}` }}
        >
          <div className="updateProject__details__toggle">
            <div className="updateProject__details__toggle__header">
              <div className="updateProject__details__toggle__toggle-btn">
                {projectTab === 'DETAILS' ? (
                  <Button
                    data-testid={'deatails-view'}
                    variant="outlined"
                    className="toggle-primary"
                    onClick={() => toggleView('DETAILS')}
                  >
                    Details
                  </Button>
                ) : (
                  <div
                    className="updateProject__details__toggle__g-view"
                    onClick={() => toggleView('DETAILS')}
                  >
                    Details
                  </div>
                )}
              </div>

              <div className="updateProject__details__toggle__toggle-btn">
                {projectTab === 'TEAMS' ? (
                  <Button
                    data-testid={'teams-view'}
                    variant="outlined"
                    className="toggle-primary"
                    onClick={() => toggleView('TEAMS')}
                  >
                    Teams
                  </Button>
                ) : (
                  <div
                    className="updateProject__details__toggle__g-view"
                    onClick={() => toggleView('TEAMS')}
                  >
                    Teams
                  </div>
                )}
              </div>
              {isPartOf ? (
                <div className="updateProject__details__toggle__toggle-btn">
                  {projectTab === 'SETTINGS' ? (
                    <Button
                      data-testid={'teams-view'}
                      variant="outlined"
                      className="toggle-primary"
                      disabled={true}
                      onClick={() => toggleView('SETTINGS')}
                    >
                      Settings
                    </Button>
                  ) : (
                    <div
                      className="updateProject__details__toggle__g-view"
                      onClick={() => toggleView('SETTINGS')}
                    >
                      Settings
                    </div>
                  )}
                </div>
              ) : (
                ''
              )}
            </div>
          </div>

          <div className="updateProject__details__detailsContainer">
            {renderProjectDetailsComponent()}
          </div>
        </div>
        {confirmOpen ? (
          <ConfirmDialog
            open={confirmOpen}
            message={confirmMessage}
            close={handleConfirmBoxClose}
            proceed={cancelUpdate}
          />
        ) : (
          ''
        )}
      </div>
    </div>
  );
}

{
  /* <div onClick={navigateback}>CLose</div> */
}
