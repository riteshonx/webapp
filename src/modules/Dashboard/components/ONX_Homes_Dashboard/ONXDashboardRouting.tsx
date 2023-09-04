import { lazy, ReactElement } from "react";
import { Redirect, Route, Router, Switch, useHistory } from "react-router-dom";

const ONXHomesDashboard = lazy(
  () => import("../ONX_Homes_Dashboard/ONXHomesDashboard")
);
const INSPECTION = lazy(() => import("./Components/blockScreen/BlockScreen"));
const INSPECTIONFORM = lazy(
  () => import("../../../inspectionForm/InspectionForm")
);
const CompaniesRouting = lazy(
  () => import("../../../baseService/companies/pages/CompaniesRouting")
);
const ProjectRouting = lazy(
  () => import("../../../baseService/projects/pages/ProjectRouting")
);
const CustomListRouting = lazy(
  () => import("../../../baseService/customList/pages/CustomListRouting")
);
const FormsConsumptionRouting = lazy(
  () =>
    import("../../../baseService/formConsumption/pages/FormConsumptionRouting")
);
const RolesRouting = lazy(
  () => import("../../../baseService/roles/pages/RolesRouting")
);
const TeammatesRouting = lazy(
  () => import("../../../baseService/teammates/pages/TeammatesRouting")
);
const AddTeammate = lazy(
  () => import("../../../baseService/teammates/pages/AddTeammates/AddTeammate")
);
const EditTeammate = lazy(
  () =>
    import("../../../baseService/teammates/pages/EditTeammates/editTeammates")
);

const ONXDashboardRouting = (): ReactElement => {
  const history = useHistory();

  return (
    <Router history={history}>
      <Switch>
        {/* <Route path="/insights" component={INSIGHTS} /> */}
        <Route exact path="/inspection" component={INSPECTION} />
        <Route exact path="/inspectionForm/:id" component={INSPECTIONFORM} />
        <Route exact path="/" component={ONXHomesDashboard} />
        <Route path={"/base/companies"} component={CompaniesRouting} />
        <Route
          path={"/base/projects/:id/form/:featureId"}
          component={FormsConsumptionRouting}
        />
        <Route path={"/base/project-lists"} component={ProjectRouting} />
        <Route path={"/base/customList"} component={CustomListRouting} />
        <Route path={"/base/roles"} component={RolesRouting} />
        {/* <Route path={"/base/teammates/lists"} component={TeammatesRouting} /> */}
        <Route path={"/base/teammates/invite"} component={AddTeammate} />
        <Route
          path={"/base/teammates/invite/projects/:projectId"}
          component={AddTeammate}
        />
        <Route
          path={"/base/teammates/invite/companies/:companyId"}
          component={AddTeammate}
        ></Route>
        <Route path={"/base/teammates/edit/:userId"} component={EditTeammate} />
        <Route exact path={"*"}>
          <Redirect to="/"></Redirect>
        </Route>
      </Switch>
    </Router>
  );
};

export default ONXDashboardRouting;
