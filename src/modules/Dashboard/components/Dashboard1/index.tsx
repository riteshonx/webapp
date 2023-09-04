import { ReactElement, useReducer } from "react";
import { dashboardContext } from "../../contextAPI/dashboardContext";
import {
  initialState,
  dashboardReducer,
} from "../../contextAPI/dashboardReducer";
import Dashboard1 from "./Dashboard1";

export default function Main(): ReactElement {
  const [dashboardState, dashboardDispatch] = useReducer(
    dashboardReducer,
    initialState
  );

  return (
    <dashboardContext.Provider value={{ dashboardState, dashboardDispatch }}>
      <Dashboard1 />
    </dashboardContext.Provider>
  );
}
