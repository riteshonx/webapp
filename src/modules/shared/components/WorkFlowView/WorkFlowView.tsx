import { Box } from "@material-ui/core";
import React, { ReactElement, useContext, useEffect, useState } from "react";
import ReactFlow, {
  Controls,
  Handle,
  Position,
  ReactFlowProvider,
} from "react-flow-renderer";
import { workFlowContext } from "../../../baseService/context/workflow/workflowContext";
import { stepStyles } from "../../../workflow/container/utils";
import WorkFloweStep from "../WorkFloweStep/WorkFloweStep";
import WorkFlowCustomOutcome from "../WorkFlowCustomOutcome/WorkFlowCustomOutcome";

import "./WorkFlowView.scss";
import { FETCH__PROJECT_ROLE_ABOVE_VIEW } from "../../../baseService/graphql/queries/users";
import { client } from "../../../../services/graphql";
import { myProjectRole } from "../../../../utils/role";
import { setAllowedWorkflowRoles } from "../../../baseService/context/workflow/workflowAction";

function WorkFlowView({ close }: any): ReactElement {
  const [elements, setElements]: any = useState([]);
  const { workFlowState, workFlowDispatch }: any = useContext(workFlowContext);

  useEffect(() => {
    fetchPermittedRoles();
    sessionStorage.removeItem("edgeCenter");
  }, []);

  useEffect(() => {
    if (workFlowState.steps && workFlowState.outcomes) {
      const steps: any = workFlowState.steps.map((item: any) => {
        return {
          id: item.id,
          type: "special",
          position: item.position,
          data: {
            label: (
              <React.Fragment>
                <WorkFloweStep item={item} />
                {item.approved && (
                  <Box className="currentStepNotation">You are here</Box>
                )}
              </React.Fragment>
            ),
          },
          style: {
            ...stepStyles(),
            flexDirection: "column",
            margin: "0",
            padding: item.approved ? "2rem" : "0",
            background: "#A5E67D",
          },
        };
      });
      setElements([...steps, ...workFlowState.outcomes]);
    }
  }, [workFlowState.steps, workFlowState.outcomes]);

  const fetchPermittedRoles = async () => {
    try {
      const permittedRolesResponse: any = await client.query({
        query: FETCH__PROJECT_ROLE_ABOVE_VIEW,
        variables: {
          featureId: [workFlowState.featureType],
        },
        fetchPolicy: "network-only",
        context: { role: myProjectRole.viewMyProjects },
      });
      if (permittedRolesResponse.data.projectPermission.length > 0) {
        const targetList = permittedRolesResponse.data.projectPermission.map(
          (item: any) => item.roleId
        );
        workFlowDispatch(setAllowedWorkflowRoles(targetList));
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const CustomNodeComponent: any = ({ data }: any) => {
    return (
      <>
        {data.label}
        <Handle
          type="source"
          position={Position.Right}
          id="1"
          className={"react-flow__handle__right__new"}
        ></Handle>
        <Handle
          type="target"
          position={Position.Right}
          id="11"
          className={"react-flow__handle__right__new__target1"}
        />
        <Handle
          id="12"
          type="target"
          position={Position.Right}
          className={"react-flow__handle__right__new__target2"}
        />
        <Handle
          id="4"
          isConnectable={true}
          type="target"
          position={Position.Left}
          className={"react-flow__handle__left__new"}
        />
      </>
    );
  };
  const nodeTypes: any = {
    special: CustomNodeComponent,
  };
  const edgeTypes = {
    custom: WorkFlowCustomOutcome,
  };
  const onLoad = (ReactFlowProps: any) => {
    setTimeout(() => ReactFlowProps.fitView(), 200);
  };
  return (
    <Box
      display="flex"
      flexDirection="column"
      // justifyContent="center"
      flexGrow={12}
      className="WorkFlowView__main"
    >
      <Box className="WorkFlowView__main__workflowEditor">
        <ReactFlowProvider>
          <ReactFlow
            id={"reactFlow__Project"}
            elements={elements}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onLoad={onLoad}
            zoomOnPinch={false}
            zoomOnScroll={false}
          >
            <Controls />
          </ReactFlow>
        </ReactFlowProvider>
      </Box>
      {/* <Box
            display="flex"
            justifyContent="flex-end"
            className="WorkFlowView__main__buttonContainer"
          >
            <Button
              className="WorkFlowView__main__buttonContainer__button1"
              onClick={close}
            >
              Cancel
            </Button>
            <Button
              className="WorkFlowView__main__buttonContainer__button2"
              onClick={close}
            >
              Update Assignees
            </Button>
          </Box> */}
    </Box>
  );
}
export default WorkFlowView;
