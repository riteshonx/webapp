import React, { lazy, ReactElement, useEffect } from "react";
import { Route, Redirect, Router, Switch, useHistory } from "react-router-dom";
import Grid from "@material-ui/core/Grid";

// import Navbar from './components/Sidebar/Sidebar';
const FormsRouting = lazy(() => import("./forms/pages/FormsRouting"));
const QualityControlRouting = lazy(
  () => import("./qualityControl/QualityControlRouting")
);

const CompaniesRouting = lazy(
  () => import("./companies/pages/CompaniesRouting")
);
const ProjectRouting = lazy(() => import("./projects/pages/ProjectRouting"));
const CustomListRouting = lazy(
  () => import("./customList/pages/CustomListRouting")
);
const FormsConsumptionRouting = lazy(
  () => import("./formConsumption/pages/FormConsumptionRouting")
);
const RolesRouting = lazy(() => import("./roles/pages/RolesRouting"));
const TeammatesRouting = lazy(
  () => import("./teammates/pages/TeammatesRouting")
);
const AddTeammate = lazy(
  () => import("./teammates/pages/AddTeammates/AddTeammate")
);
const EditTeammate = lazy(
  () => import("./teammates/pages/EditTeammates/editTeammates")
);
const WeatherTemplate = lazy(
  ()=>import ('./weatherTemplate/index')
);
export default function BaseLanding(): ReactElement {
  const history = useHistory();

  return (
    <Grid container style={{ height: "100%" }}>
      <Grid item xs={12} style={{ display: "flex", flexGrow: 1 }}>
        <Router history={history}>
          <Switch>
            <Route path={"/base/forms"} component={FormsRouting} />
            <Route
              path={"/base/qualityControl/projects/:projectId"}
              component={QualityControlRouting}
            />
            <Route path={"/base/companies"} component={CompaniesRouting} />
            <Route
              path={"/base/projects/:id/form/:featureId"}
              component={FormsConsumptionRouting}
            />
            <Route path={"/base/project-lists"} component={ProjectRouting} />
            <Route path={"/base/customList"} component={CustomListRouting} />
            <Route path={"/base/roles"} component={RolesRouting} />
            <Route
              path={"/base/teammates/lists"}
              component={TeammatesRouting}
            />
            <Route path={"/base/teammates/invite"} component={AddTeammate} />
            <Route
              path={"/base/teammates/invite/projects/:projectId"}
              component={AddTeammate}
            />
            <Route
              path={"/base/teammates/invite/companies/:companyId"}
              component={AddTeammate}
            ></Route>
            <Route
              path={"/base/teammates/edit/:userId"}
              component={EditTeammate}
            />
            <Route
              path={"/base/weatherTemplate"}
              component={WeatherTemplate}
            />
            <Route exact path={"/base"}>
              <Redirect to="/base/forms"></Redirect>
            </Route>
          </Switch>
        </Router>
      </Grid>
    </Grid>
  );
}
