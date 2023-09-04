import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import React, { ReactElement, useContext, useState } from 'react';
import { match, Router, useHistory, useRouteMatch } from 'react-router-dom';
import { postApi } from '../../../../../services/api';
import {
  decodeExchangeToken,
  decodeProjectExchangeToken,
} from '../../../../../services/authservice';
import { features } from '../../../../../utils/constants';
import {
  setEditMode,
  setIsLoading,
  setProjectToken,
} from '../../../../root/context/authentication/action';
import { stateContext } from '../../../../root/context/authentication/authContext';
import ProjectSettingsRouting from '../../../projectSettings/pages/ProjectSettingsRouting';
import ProjectSettingsSideBar from '../../components/ProjectSettingsSideBar/ProjectSettingsSideBar';
import {
  resetProjectDetails,
  setProjectPermission,
  setProjectSettingToken,
} from '../../Context/ProjectDetailsActions';
import { projectDetailsContext } from '../../Context/ProjectDetailsContext';
import { Roles } from '../../utils/helper';
import './ProjectSettings.scss';

export interface Params {
  projectId: string;
}

export default function ProjectSettings(): ReactElement {
  const pathMatch: match<Params> = useRouteMatch();
  const history = useHistory();
  const [fetchingToken, setFetchingToken] = useState(true);
  const { dispatch }: any = useContext(stateContext);
  const { projectDetailsDispatch }: any = useContext(projectDetailsContext);

  React.useEffect(() => {
    fetchProjectExchangeToken();
  }, []);

  const fetchProjectExchangeToken = async () => {
    try {
      dispatch(setIsLoading(true));
      setFetchingToken(true);
      const ProjectToken: any = {
        tenantId: Number(decodeExchangeToken().tenantId),
        projectId: Number(pathMatch.params.projectId),
        features: [features.PROJECTSETUP, features.MASTERPLAN, features.BIM, features.DRAWINGS, features.SPECIFICATIONS,features.DAILYLOG, features.DMS,features.PLANCOMPONENT, features.FORMS],
      };
      const projectTokenResponse = await postApi(
        'V1/user/login/exchange',
        ProjectToken
      );
      projectDetailsDispatch(
        setProjectSettingToken(projectTokenResponse.success)
      );
      dispatch(setProjectToken(projectTokenResponse.success));
      setPermission(projectTokenResponse.success);
      dispatch(setIsLoading(false));
      setFetchingToken(false);
    } catch (error) {
      setPermission('');
      setFetchingToken(false);
      dispatch(setIsLoading(false));
    }
  };

  const setPermission = (argProjectToken: string) => {
    const allowedRoles =
      decodeProjectExchangeToken(argProjectToken).allowedRoles;
    const targetPermission: any = {};

    for (const [key, value] of Object.entries(Roles)) {
      const permission = allowedRoles.indexOf(value) > -1;
      targetPermission[
        `can${key[0].toLocaleUpperCase()}${key.slice(1, key.length)}`
      ] = permission;
    }

    projectDetailsDispatch(setProjectPermission(targetPermission));
  };

  const navigateback = () => {
    dispatch(setEditMode(false));
    history.push(`/base/project-lists/`);
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
  };

  return !fetchingToken ? (
    <div className="projectSettings">
      <div className="projectSettings__leftNav">
        <ProjectSettingsSideBar />
      </div>
      <div className="projectSettings__rightSide">
        <Router history={history}>
          <ProjectSettingsRouting />
        </Router>
        <span className="closeIcon">
          <HighlightOffIcon
            data-testid={'close-update'}
            onClick={navigateback}
          />
        </span>
      </div>
    </div>
  ) : (
    <></>
  );
}
