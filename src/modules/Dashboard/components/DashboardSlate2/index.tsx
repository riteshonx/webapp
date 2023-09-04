import { ReactElement, useReducer } from "react";
import { dashboardContext } from "../../contextAPI/dashboardContext";
import {
  initialState,
  dashboardReducer,
} from "../../contextAPI/dashboardReducer";
import CirclularMenu from "../CircularMenu";

export default function Main(): ReactElement {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  return (
    <dashboardContext.Provider value={{ state, dispatch }}>
      <CirclularMenu />
    </dashboardContext.Provider>
  );
}
