import { makeStyles } from "@material-ui/core/styles";
import { lazy, Suspense, useContext } from "react";
import { ReactElement } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import useTokenRefreshWorker from "src/customhooks/useTokenRefreshWorker";
import SideBar from "src/modules/dynamicScheduling/libraries/components/SideBar/SideBar";
import { useIsPCL } from "src/modules/visualize/VisualizeRouting/PCL";
import ONXDashboardRouting from "../../../Dashboard/components/ONX_Homes_Dashboard/ONXDashboardRouting";
import { stateContext } from "../../context/authentication/authContext";
import Fallback from "../Fallback/Fallback";
import NoPermissionPage from "../NoPermission";
import PageNotFound from "../PageNotFound/PageNotFound";

const EQUIPMENTS_MAP = lazy(() => import("src/modules/equipments-map"));
const BASE = lazy(() => import("../../../baseService/BaseRouting"));
const V2VISUALIZE = lazy(
  () => import("src/version2.0_temp/views/Visualize/Visualize")
);
const DRAWINGS = lazy(() => import("../../../drawings/DrawingsRouting"));
const SPECIFICATIONS = lazy(
  () => import("../../../specification/SpecificationRouting")
);
const TASK = lazy(() => import("../../../dynamicScheduling/index"));
const BIM = lazy(() => import("../../../bim/index"));
const WORKFLOW = lazy(() => import("../../../workflow/index"));
const INSIGHTS = lazy(() => import("../../../insights/index"));
const DAILY_LOGS = lazy(() => import("../../../dailyLogs/DailyLogRouting"));
const PRODUCTIVITY_METRICS = lazy(
  () => import("../../../productivityMetrics/index")
);
const SLATE2_DASHBOARD = lazy(
  () => import("../../../Dashboard/components/DashboardSlate2/DashboardSlate2")
);
const COLLABORATE = lazy(
  () =>
    import(
      "../../../Dashboard/components/DashboardSlate2/Components/Collaborate/Collaborate"
    )
);
const SLATE_ASSIST = lazy(
  () =>
    import(
      "../../../Dashboard/components/DashboardSlate2/Components/SlateAssist/SlateAssist"
    )
);
const CLASSIC_DASHBOARD = lazy(
  () => import("../../../Dashboard/components/Dashboard2/index")
);
const DOCUMENTLIBRARY = lazy(() => import("../../../upload/index"));
const DASHBOARD1 = lazy(
  () => import("../../../Dashboard/components/Dashboard3/index")
);
const CONNECTORS = lazy(() => import("../../../connectors/index"));
const CONNECTED_SYSTEMS = lazy(
  () =>
    import(
      "../../../Dashboard/components/DashboardSlate2/Components/ConnectorsScreen/ConnectorsScreen"
    )
);

const AUTO_LINK = lazy(() => import("../../../AutoLink/AutoLink"));

const CDP = lazy(() => import("../../../CDP/views"))

const useStyles = makeStyles(() => ({
  landing: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  header: {
    justifyContent: "space-around",
    alignItems: "center",
  },
  body: {
    display: "flex",
    flex: "1",
    // margin: '10px 20px',
    background: "#FFFFFF",
    boxShadow:
      "0px 12px 16px rgba(0, 0, 0, 0.04), 0px 4px 56px rgba(0, 0, 0, 0.04)",
    borderRadius: "4px",
    flexWrap: "wrap",
  },
  main: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
}));

export default function RootComponent(): ReactElement {
  const classes = useStyles();
  const { state } = useContext(stateContext);

  useTokenRefreshWorker();

  const { isUserPCLButNotAdmin, pclProjectId } = useIsPCL();

  return (
    <div className={classes.landing}>
      <div className={classes.body}>
        <div className={classes.main}>
          {state?.isOnxTenant ? (
            <Suspense fallback={<Fallback />}>
              <ONXDashboardRouting />
            </Suspense>
          ) : (
            <Suspense fallback={<Fallback />}>
              <Switch>
                <Route
                  path="/visualize/:projectId/:locationId?"
                  component={V2VISUALIZE}
                />
                {isUserPCLButNotAdmin && (
                  <>
                    <Route path={["*", "/"]}>
                      <Redirect
                        to={`/visualize${
                          Boolean(pclProjectId) ? `/${pclProjectId}` : ""
                        }`}
                      ></Redirect>
                    </Route>
                  </>
                )}
                <Route path="/base" component={BASE} />
                <Route path="/noPermission" component={NoPermissionPage} />
                <Route path="/pagenotfound" component={PageNotFound} />
                <Route path="/drawings" component={DRAWINGS} />
                <Route path="/specifications" component={SPECIFICATIONS} />
                <Route path="/scheduling" component={TASK} />
                <Route path="/bim" component={BIM} />
                <Route path="/workflow" component={WORKFLOW} />
                <Route path="/insights" component={INSIGHTS} />
                <Route
                  path="/productivityMetrics/:projectId"
                  component={PRODUCTIVITY_METRICS}
                />
                <Route path="/dailyLogs" component={DAILY_LOGS} />
                <Route
                  path="/documentlibrary/:id"
                  component={DOCUMENTLIBRARY}
                />
                <Route path="/productionCenter" component={DASHBOARD1} />
                <Route path="/equipments-map" component={EQUIPMENTS_MAP} />
                <Route path="/sidebar" component={SideBar} />
                <Route path="/slate-assist" component={SLATE_ASSIST} />
                <Route path="/collaborate" component={COLLABORATE} />
                <Route path="/autolink/:projectId" component={AUTO_LINK} />
                <Route path="/connectors" component={CONNECTORS} />
                <Route path="/generator" component={CDP} />
                <Route path="/connectedSystems" component={CONNECTED_SYSTEMS} />
                {state.dashboardType === "classic" ? (
                  <Route path="/" component={CLASSIC_DASHBOARD} />
                ) : (
                  <Route path="/" component={SLATE2_DASHBOARD} />
                )}
                <Route path={"*"}>
                  <Redirect to="/"></Redirect>
                </Route>
              </Switch>
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}
