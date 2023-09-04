import React, {
  lazy,
  ReactElement,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import { projectDetailsContext } from "../Context/ProjectDetailsContext";
import {
  projectDetailsInitialState,
  ProjectDetailsReducer,
} from "../Context/ProjectDetailsReducer";
const Projects = lazy(() => import("./ProjectsLanding/ProjectsLanding"));
const ProjectSettings = lazy(() => import("./ProjectSettings/ProjectSettings"));

export default function ProjectRouting(): ReactElement {
  const [projectDetailsState, projectDetailsDispatch] = useReducer(
    ProjectDetailsReducer,
    projectDetailsInitialState
  );
  const { state } = useContext(stateContext);

  return (
    <projectDetailsContext.Provider
      value={{ projectDetailsState, projectDetailsDispatch }}
    >
      <Switch>
        <Route
          path={"/base/project-lists/:projectId"}
          component={ProjectSettings}
        ></Route>
        {!state?.isOnxTenant && (
          <Route
            exact
            path={"/base/project-lists"}
            component={Projects}
          ></Route>
        )}
        {state?.isOnxTenant ? (
          <Route exact path={"*"}>
            <Redirect to="/"></Redirect>
          </Route>
        ) : (
          <Route path="*">
            <Redirect to={"/base/project-lists"} />
          </Route>
        )}
      </Switch>
    </projectDetailsContext.Provider>
  );
}
