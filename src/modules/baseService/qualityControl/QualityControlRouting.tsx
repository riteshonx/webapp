import { useReducer, lazy } from "react";
import { Switch, Route } from "react-router-dom";
import { punchListContext } from "./context/context";
import { punchListInitState, punchListReducer } from "./context/reducer";
import useEffectWithToken from "./hooks/useEffectWithToken";

const QualityControlLanding = lazy(
  () => import("./pages/QualityControlLanding/QualityControlLanding")
);

const QualityControlRouting = () => {
  const [punchListState, punchListDispatch] = useReducer(
    punchListReducer,
    punchListInitState
  );

  useEffectWithToken(() => {
    async function fetchData() {
      const prom = new Promise((res: any) => {
        setTimeout(() => res("Done"), 2000);
      });
      const result = await prom;
    }
    fetchData();
  }, []);

  return (
    <punchListContext.Provider value={{ punchListState, punchListDispatch }}>
      <Switch>
        <Route
          path="/base/qualityControl/projects/:projectId/building/:buildingId"
          component={QualityControlLanding}
        />
        <Route
          path="/base/qualityControl/projects/:projectId/building"
          component={QualityControlLanding}
        />
      </Switch>
    </punchListContext.Provider>
  );
};

export default QualityControlRouting;
