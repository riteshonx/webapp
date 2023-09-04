import { ReactElement, useReducer } from "react";
import { workflowContext } from "../../../contextAPI/workflowContext";
import {
  workflowReducer,
  initialState,
} from "../../../contextAPI/workflowReducer";
import WorkflowViewStartStep from "../../components/WorkflowViewStartStep/WorkflowViewStartStep";

export default function Main(): ReactElement {
  const [state, dispatch] = useReducer(workflowReducer, initialState);
  return (
    <workflowContext.Provider value={{ state, dispatch }}>
      <WorkflowViewStartStep />
    </workflowContext.Provider>
  );
}
