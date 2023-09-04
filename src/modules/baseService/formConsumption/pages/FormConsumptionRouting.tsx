import React, { lazy, ReactElement, useReducer } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { projectContext } from "../Context/projectContext";
import { projectReducer, projectInitialState } from "../Context/projectReducer";
const EditRfi = lazy(() => import("./EditRfi/EditRfi"));
const ViewRfi = lazy(() => import("./ViewRfi/ViewRfi"));
const FeatureFormsLanding = lazy(
  () => import("./FeatureFormsLanding/FeatureFormsLanding")
);
const CreateRfi = lazy(() => import("./CreateRfi/CreateRfi"));

export default function FormConsumptionRouting(): ReactElement {
  const [projectState, projectDispatch] = useReducer(
    projectReducer,
    projectInitialState
  );

  return (
    <projectContext.Provider value={{ projectState, projectDispatch }}>
      <Switch>
        <Route
          path={"/base/projects/:id/form/:featureId/create"}
          component={CreateRfi}
        ></Route>
        <Route
          path={"/base/projects/:id/form/:featureId/edit/:formId"}
          component={EditRfi}
        ></Route>
        <Route
          path={"/base/projects/:id/form/:featureId/view/:formId"}
          component={ViewRfi}
        ></Route>
        <Route
          exact
          path={"/base/projects/:id/form/:featureId"}
          component={FeatureFormsLanding}
        ></Route>
        <Route path="*">
          <Redirect to={"/base/projects/:id/form/:featureId"} />
        </Route>
      </Switch>
    </projectContext.Provider>
  );
}
