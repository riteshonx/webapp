import React, { ReactElement, useContext, useEffect, useState } from "react";
import { match, useHistory, useRouteMatch } from "react-router-dom";
import projectIcon from "../../../../../assets/images/project.png";
import "./ProjectLists.scss";
import Tooltip from "@material-ui/core/Tooltip";
import { stateContext } from "../../../../root/context/authentication/authContext";
import NoDataMessage from "../../../../shared/components/NoDataMessage/NoDataMessage";
import {
  decodeExchangeToken,
  decodeProjectExchangeToken,
} from "../../../../../services/authservice";
import { postApi } from "../../../../../services/api";
import { setIsLoading } from "../../../../root/context/authentication/action";
import Notification, {
  AlertTypes,
} from "../../../../shared/components/Toaster/Toaster";
import {
  setProjectSettingToken,
  setProjectUpdatePermission,
} from "../../Context/ProjectDetailsActions";
import { projectDetailsContext } from "../../Context/ProjectDetailsContext";
import { canUpdateProject } from "../../../roles/utils/permission";
import { GET_PROJECT_ASSOCIATION_DETAILS } from "../../../../../graphhql/queries/projects";
import {
  myProjectRole,
  tenantProjectRole,
  tenantUserRole,
} from "../../../../../utils/role";
import { client } from "../../../../../services/graphql";

export interface Params {
  projectId: string;
}

const noPermissionMessage = "There are no active projects";

export default function ProjectLists(props: any): ReactElement {
  const [projectList, setProjectList] = useState<Array<any>>([]);
  const { dispatch, state }: any = useContext(stateContext);
  const { projectDetailsDispatch }: any = useContext(projectDetailsContext);
  const [selectedProject, setSelectedProject] = useState<any>();
  const history = useHistory();
  const pathMatch: match<Params> = useRouteMatch();

  useEffect(() => {
    const sortedProjects = props.projectList.sort((a: any, b: any) =>
      a?.name.localeCompare(b?.name, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );
    setProjectList(sortedProjects);
  }, [props.projectList]);

  useEffect(() => {
    setSelectedProject(Number(pathMatch?.params?.projectId));
  }, [Number(pathMatch?.params?.projectId)]);

  const projectDetails = (project: any) => {
    if (project?.id && selectedProject?.id !== project.id) {
      history.push(`/base/project-lists/${project.id}/details`,{from: 'project list'});
      setSelectedProject(Number(pathMatch?.params?.projectId));
      props.updateProject();
    }
  };

  return (
    <div className="projects">
      {projectList?.length > 0 ? (
        <div className="projects__grid">
          {projectList?.map((project) => {
            return (
              <div
                key={project.id}
                className={`projects__users ${
                  Number(pathMatch?.params?.projectId) == project.id
                    ? "projects__users-active"
                    : ""
                }`}
                onClick={() => projectDetails(project)}
              >
                <div className="projects__user-avatar">
                  <img
                    className="avatar-icon"
                    src={projectIcon}
                    alt="user-avatar"
                  />
                </div>
                <div className="projects__user-name">
                  <div>
                    <Tooltip title={project?.name} aria-label="project name">
                      <label>
                        {project?.name && project?.name.length > 20
                          ? `${project?.name.slice(0, 18)} . . .`
                          : project?.name}
                      </label>
                    </Tooltip>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : !state.isLoading ? (
        <div className="noUpdatePermission">
          <div className="no-permission">
            <NoDataMessage message={noPermissionMessage} />
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
