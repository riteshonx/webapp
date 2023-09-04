import React, {
  lazy,
  createContext,
  useEffect,
  useReducer,
  useContext,
  Dispatch,
} from "react";
import { Switch, Route } from "react-router-dom";
import reducer, {
  DailyLogReducerAction,
  DailyLogReducerState,
} from "./reducer/DailyLogReducer";
import { initialDailyLogReducerState } from "./seedData";
import {
  findUnique,
  generateDateFilterData,
  generateUserFilterData,
} from "./utils";
import { fetchFilterUsersList } from "./common/requests";
import { setListViewFilterList, setTriggerFilterFetch } from "./actions";
import { stateContext } from "src/modules/root/context/authentication/authContext";

const AddDailyLog = lazy(() => import("./pages/AddDailyLog/AddDailyLog"));
const ViewDailyLog = lazy(() => import("./pages/ViewDailyLog/ViewDailyLog"));
const ListDailyLogs = lazy(() => import("./pages/ListDailyLogs/ListDailyLogs"));
const ViewDailyLogSummary = lazy(
  () => import("./pages/ViewDailyLogSummary/ViewDailyLogSummary")
);

export function createCtx<StateType, ActionType>(
  reducer: React.Reducer<StateType, ActionType>,
  initialState: StateType
) {
  const defaultDispatch: React.Dispatch<ActionType> = () => initialState;
  const ctx = React.createContext({
    state: initialState,
    dispatch: defaultDispatch,
  });
  function Provider(props: React.PropsWithChildren<any>) {
    const [state, dispatch] = React.useReducer<
      React.Reducer<StateType, ActionType>
    >(reducer, initialState);
    return <ctx.Provider value={{ state, dispatch }} {...props} />;
  }
  return [ctx, Provider] as const;
}

type DailyLogContextType = {
  state: DailyLogReducerState;
  dispatch: Dispatch<DailyLogReducerAction>;
};

export const DailyLogContext = createContext<DailyLogContextType>({
  state: initialDailyLogReducerState,
  dispatch: () => {
    //to avoid linting error
  },
});

const DailyLogRouting = () => {
  const [state, dispatch] = useReducer(reducer, initialDailyLogReducerState);
  const {
    listView: {
      filters: { triggerFetch },
    },
  } = state;
  const { state: globalState }: any = useContext(stateContext);

  useEffect(() => {
    async function fetchFilterData() {
      const usersList = await fetchFilterUsersList();
      const createdByGroup = findUnique(usersList, "createdByUser");
      const filterUser = createdByGroup.map((item: any) =>
        generateUserFilterData(
          item.firstName + " " + item.lastName,
          false,
          item.id
        )
      );
      const filterCreatedOn = [generateDateFilterData("Created On", "")];
      const filterList = {
        User: { options: filterUser },
        Date: { options: filterCreatedOn },
      };
      dispatch(setListViewFilterList(filterList));
      dispatch(setTriggerFilterFetch(false));
    }
    if (globalState?.selectedProjectToken) {
      if (triggerFetch) fetchFilterData();
    }
  }, [triggerFetch, globalState?.selectedProjectToken]);

  return (
    <DailyLogContext.Provider value={{ state, dispatch }}>
      <Switch>
        <Route
          path="/dailyLogs/projects/:projectId/update/:formId"
          component={AddDailyLog}
        />
        <Route
          path="/dailyLogs/projects/:projectId/update"
          component={AddDailyLog}
        />
        <Route
          path="/dailyLogs/projects/:projectId/summary/:dailyLogDate"
          component={ViewDailyLogSummary}
        />
        <Route
          path="/dailyLogs/projects/:projectId/view/:userId/:dailyLogDate/:formId"
          component={ViewDailyLog}
        />
        <Route
          path="/dailyLogs/projects/:projectId/view/:userId/:dailyLogDate"
          component={ViewDailyLog}
        />
        <Route
          path="/dailyLogs/projects/:projectId"
          component={ListDailyLogs}
        />
      </Switch>
    </DailyLogContext.Provider>
  );
};

export default DailyLogRouting;
