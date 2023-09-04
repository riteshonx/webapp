import { ReactElement, useReducer } from "react";
import { dashboardContext } from "../../contextAPI/dashboardContext";
import {
  initialState,
  dashboardReducer,
} from "../../contextAPI/dashboardReducer";
import PCLandingPage from "./PCLandingPage";

export default function Main(): ReactElement {
  const [dashboardState, dashboardDispatch] = useReducer(
    dashboardReducer,
    initialState
  );

  return (
    <dashboardContext.Provider value={{ dashboardState, dashboardDispatch }}>
      <PCLandingPage />
    </dashboardContext.Provider>
  );
}
