import { ReactElement, useReducer } from "react";
import { workflowContext } from "../../contextAPI/workflowContext";
import {
  initialState,
  workflowReducer,
} from "../../contextAPI/workflowReducer";
import WorkflowStartPage from "../components/WorkflowStartPage/WorkflowStartPage";

export default function Main(): ReactElement {
  const [state, dispatch] = useReducer(workflowReducer, initialState);

  return (
    <workflowContext.Provider value={{ state, dispatch }}>
      <WorkflowStartPage />
    </workflowContext.Provider>
  );
}
