import React, { ReactElement, useContext, useEffect } from "react";
import { workflowContext } from "../../../contextAPI/workflowContext";
import ReactFlow, {
  addEdge,
  Controls,
  Handle,
  Position,
  ReactFlowProvider,
} from "react-flow-renderer";
import { useHistory } from "react-router-dom";
import {
  setOutcomeData,
  updateStepPositionOnDrag,
} from "../../../contextAPI/action";
import { Box, Button } from "@material-ui/core";
import "./WorkflowEditor.scss";
import OutcomePopup from "../../components/OutcomePopup/OutcomePopup";
import { stateContext } from "../../../../root/context/authentication/authContext";
import {
  setEdgeCenter,
  setIsLoading,
} from "../../../../root/context/authentication/action";
import AddCircleIcon from "@material-ui/icons/Add";
import { client } from "../../../../../services/graphql";
import {
  FETCH_WORKFLOW_LIST_BY_NAME,
  CREATE_WORKFLOW_TEMPLATE_DEFINITION,
  UPDATE_ACTIVE_STATUS_FOR_CLONED_TEMPLATE,
  CREATE_STEPS_AND_OUTCOMES,
  UPDATE_WORKFLOW_STEPS,
  UPDATE_WORKFLOW_OUTCOMES,
  UPDATE_WORKFLOW_TEMPLATE,
  FETCH_RUNTIME_INFO_DATA_FOR_WF_TEMPLATE_ID,
} from "../../../graphql/queries/workflow";
import { WorkflowTemplateRoles } from "../../../../../utils/role";
import {
  WorkflowStepDefinition,
  WorkflowConfigurationSnapshot,
} from "../../../constants/types";
import Notify, {
  AlertTypes,
} from "../../../../shared/components/Toaster/Toaster";
import ConfirmDialog from "../../../../shared/components/ConfirmDialog/ConfirmDialog";
import CustomOutcome from "../../components/CustomOutcome/CustomOutcome";
import { useLocation, useParams } from "react-router-dom";
import { decodeExchangeToken } from "../../../../../services/authservice";
import {
  canCreateWorkflowTemplates,
  canUpdateWorkflowTemplates,
} from "../../../roles/permissions";

export default function WorkflowEditor(props: any): ReactElement {
  const urlParams: any = useParams();
  const location: any = useLocation();
  const context: any = React.useContext(workflowContext);
  const [showOutcomePopup, setShowOutcomePopup] = React.useState(false);
  const [outcomeName, setOutcomeName]: any = React.useState("");
  const [connectParams, setConnectParams]: any = React.useState({});
  const [showVersioningConfirmation, setShowVersioningConfirmation]: any =
    React.useState(false);
  const { dispatch }: any = useContext(stateContext);
  const history = useHistory();

  const edgeTypes = {
    custom: CustomOutcome,
  };

  useEffect(() => {
    dispatch(setEdgeCenter([]));
  }, []);

  const handleChange = (e: any) => {
    const value = e.target.value;
    setOutcomeName(value.slice(0, 32));
    e.stopPropagation();
  };

  const getWorkflowTemplateConfigurationSnapshot = (
    templateIdParam: number,
    isFormsAssociated: boolean
  ): WorkflowConfigurationSnapshot => {
    const userId = decodeExchangeToken().userId;
    const snapshot: WorkflowConfigurationSnapshot = {
      outcomesToInsert: [],
      stepsToInsert: [],
      outcomesToUpdate: {},
      stepsToUpdate: {},
    };
    const currentStepList = context.state?.stepsData;
    const currentOutcomeList = context.state?.outcomeData;

    if (context.state.enableVersioning && isFormsAssociated) {
      for (const outcomeElement of currentOutcomeList) {
        if (!outcomeElement.isDeleted) {
          snapshot.outcomesToInsert.push({
            name: outcomeElement.label,
            createdBy: userId,
            workflowTemplateId: templateIdParam,
            fromStepDefName: outcomeElement.source,
            toStepDefName: outcomeElement.target,
            updatedBy: userId,
            startx: Number(outcomeElement.sourceHandle),
            starty: 0,
            endx: Number(outcomeElement.targetHandle),
            endy: 0,
            isDeleted: outcomeElement.isDeleted,
          });
        }
      }
      for (const stepElement of currentStepList) {
        if (!stepElement.isDeleted) {
          snapshot.stepsToInsert.push({
            description: stepElement.label,
            name: stepElement.name,
            updatedBy: userId,
            createdBy: userId,
            type: stepElement.stepType,
            workflowTemplateId: templateIdParam,
            posx: stepElement.position.x,
            posy: stepElement.position.y,
            editsAllowed: stepElement.editsAllowed,
            isDeleted: stepElement.isDeleted,
          });
        }
      }
      return snapshot;
    } else {
      for (const outcomeElement of currentOutcomeList) {
        if (!outcomeElement.isDbValue) {
          snapshot.outcomesToInsert.push({
            name: outcomeElement.label,
            createdBy: userId,
            workflowTemplateId: templateIdParam,
            fromStepDefName: outcomeElement.source,
            toStepDefName: outcomeElement.target,
            updatedBy: userId,
            startx: Number(outcomeElement.sourceHandle),
            starty: 0,
            endx: Number(outcomeElement.targetHandle),
            endy: 0,
            isDeleted: outcomeElement.isDeleted,
          });
        } else {
          snapshot.outcomesToUpdate[outcomeElement.id] = {
            name: outcomeElement.label,
            createdBy: userId,
            workflowTemplateId: templateIdParam,
            fromStepDefName: outcomeElement.source,
            toStepDefName: outcomeElement.target,
            updatedBy: userId,
            startx: Number(outcomeElement.sourceHandle),
            starty: 0,
            endx: Number(outcomeElement.targetHandle),
            endy: 0,
            isDeleted: outcomeElement.isDeleted,
          };
        }
      }

      for (const stepElement of currentStepList) {
        if (!stepElement.isDbValue) {
          snapshot.stepsToInsert.push({
            description: stepElement.label,
            name: stepElement.name,
            updatedBy: userId,
            createdBy: userId,
            type: stepElement.stepType,
            workflowTemplateId: templateIdParam,
            posx: stepElement.position.x,
            posy: stepElement.position.y,
            editsAllowed: stepElement.editsAllowed,
            isDeleted: stepElement.isDeleted,
          });
        } else {
          snapshot.stepsToUpdate[stepElement.dbId] = {
            description: stepElement.label,
            name: stepElement.name,
            updatedBy: userId,
            createdBy: userId,
            type: stepElement.stepType,
            workflowTemplateId: templateIdParam,
            posx: stepElement.position.x,
            posy: stepElement.position.y,
            editsAllowed: stepElement.editsAllowed,
            isDeleted: stepElement.isDeleted,
          };
        }
      }
      return snapshot;
    }
  };

  const workflowTemplateValidations = () => {
    const stepsData = context.state.stepsData.filter(
      (step: any) => !step.isDeleted
    );
    const outcomeData = context.state.outcomeData.filter(
      (outcome: any) => !outcome.isDeleted
    );
    let unconnectedData: any = false;
    let finalStepValidation: any = false;
    stepsData
      .map((step: any) => {
        let count = 0;
        return outcomeData
          .map((outcome: any) => {
            if (step.stepType === "start") {
              return step.id === outcome.source;
            } else if (step.stepType === "end") {
              return step.id === outcome.target;
            } else {
              step.id === outcome.source && count++;
              step.id === outcome.target && count++;
              return count >= 2 ? true : false;
            }
          })
          .find((val: any) => val);
      })
      .find((value: any) => {
        if (!value) unconnectedData = true;
      });
    stepsData.forEach((step: any) => {
      if (step.stepType === "end") {
        finalStepValidation = true;
      }
    });
    if (!props.workflowName) {
      Notify.sendNotification("Please enter a workflow name", AlertTypes.error);
      return true;
    }
    if (unconnectedData || !finalStepValidation) {
      !finalStepValidation &&
        Notify.sendNotification(
          "Worfklow cannot be saved without at least one 'Final Step'. Please set one step without any following steps to a 'Final Step'",
          AlertTypes.error
        );
      unconnectedData &&
        Notify.sendNotification(
          "Workflow cannot be saved with unconnected steps in the workflow. Please connect all steps.",
          AlertTypes.error
        );
      return true;
    } else return false;
  };

  const dbValidations = async () => {
    const workflowListResponse: any = await client.query({
      query: FETCH_WORKFLOW_LIST_BY_NAME,
      variables: { workflowName: props.workflowName },
      fetchPolicy: "network-only",
      context: { role: WorkflowTemplateRoles.viewWorkflowTemplate },
    });

    const workflowTemplateItemArray =
      workflowListResponse?.data?.workflowTemplate;

    if (!workflowTemplateItemArray || workflowTemplateItemArray.length > 1) {
      Notify.sendNotification(
        "Workflow name exists already. Please enter a different Workflow name.",
        AlertTypes.error
      );
      dispatch(setIsLoading(false));
      return true;
    } else if (workflowTemplateItemArray.length === 1) {
      if (
        workflowTemplateItemArray[0].id !=
        context?.state?.workflowTemplateConfigFromDB?.id
      ) {
        Notify.sendNotification(
          "Workflow name exists already. Please enter a different Workflow name.",
          AlertTypes.error
        );
        dispatch(setIsLoading(false));
        return true;
      }
    } else {
      return false;
    }
  };

  const createWorkflowTemplate = async () => {
    try {
      const templateUpdateResponse: any = await client.mutate({
        mutation: CREATE_WORKFLOW_TEMPLATE_DEFINITION,
        variables: { workflowName: props.workflowName },
        context: { role: WorkflowTemplateRoles.createWorkflowTemplate },
      });
      return templateUpdateResponse?.data?.insert_workflowTemplate
        ?.returning[0];
    } catch (error) {
      console.log(error);
    }
  };

  const updateActiveStatusForClonedTemplate = async () => {
    const currentWorkflow = location?.state?.detail;
    const rootTemplateId = currentWorkflow?.rootTemplateId;
    const isDefaultWorkflow = currentWorkflow?.isDefault;
    try {
      const templateUpdateResponse: any = await client.mutate({
        mutation: UPDATE_ACTIVE_STATUS_FOR_CLONED_TEMPLATE,
        variables: {
          workflowTemplateId: urlParams?.id,
          workflowName: props.workflowName,
          version: currentWorkflow?.version + 1,
          parentId: urlParams?.id,
          rootTemplateId: rootTemplateId ? rootTemplateId : urlParams?.id,
          isDefaultWorkflow: isDefaultWorkflow,
        },
        context: { role: WorkflowTemplateRoles.createWorkflowTemplate },
      });
      const workflowTemplateId =
        templateUpdateResponse?.data?.insert_workflowTemplate.returning[0]?.id;
      // rootTemplateId = rootTemplateId ? rootTemplateId : urlParams?.id;
      const workflowConfigurationSnapshot =
        getWorkflowTemplateConfigurationSnapshot(workflowTemplateId, true);
      const templateInsertResponse = await client.mutate({
        mutation: CREATE_STEPS_AND_OUTCOMES,
        variables: {
          workflowTemplateId: workflowTemplateId,
          outcomesToInsert: workflowConfigurationSnapshot.outcomesToInsert,
          stepsToInsert: workflowConfigurationSnapshot.stepsToInsert,
        },
        context: { role: WorkflowTemplateRoles.createWorkflowTemplate },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const updateWorkflowTemplate = async (isFormsAssociated: boolean) => {
    try {
      const workflowTemplateId: any = urlParams?.id;
      let rootTemplateId: any = location?.state?.detail?.rootTemplateId;
      const userId = decodeExchangeToken().userId;
      if (isFormsAssociated && context.state.enableVersioning) {
        await updateActiveStatusForClonedTemplate();
        rootTemplateId = rootTemplateId ? rootTemplateId : urlParams?.id;
      } else {
        const workflowConfigurationSnapshot =
          getWorkflowTemplateConfigurationSnapshot(
            workflowTemplateId,
            isFormsAssociated
          );

        await client.mutate({
          mutation: UPDATE_WORKFLOW_TEMPLATE,
          variables: {
            workflowTemplateId: workflowTemplateId,
            templateConfig: {
              name: props.workflowName,
              rootTemplateId: rootTemplateId,
              updatedBy: userId,
            },
          },
          context: { role: WorkflowTemplateRoles.createWorkflowTemplate },
        });

        await client.mutate({
          mutation: CREATE_STEPS_AND_OUTCOMES,
          variables: {
            workflowTemplateId: workflowTemplateId,
            outcomesToInsert: workflowConfigurationSnapshot.outcomesToInsert,
            stepsToInsert: workflowConfigurationSnapshot.stepsToInsert,
          },
          context: { role: WorkflowTemplateRoles.createWorkflowTemplate },
        });

        const updatedSteps = workflowConfigurationSnapshot.stepsToUpdate;
        const updatedOutcomes = workflowConfigurationSnapshot.outcomesToUpdate;
        if (Object.keys(updatedSteps)?.length) {
          Object.keys(updatedSteps).forEach(async (val: any) => {
            await client.mutate({
              mutation: UPDATE_WORKFLOW_STEPS,
              variables: {
                workflowTemplateId: workflowTemplateId,
                stepId: val,
                stepsToUpdate: updatedSteps[val],
              },
              context: { role: WorkflowTemplateRoles.createWorkflowTemplate },
            });
          });
        }

        if (Object.keys(updatedOutcomes)?.length) {
          Object.keys(updatedOutcomes).forEach(async (val: any) => {
            await client.mutate({
              mutation: UPDATE_WORKFLOW_OUTCOMES,
              variables: {
                workflowTemplateId: workflowTemplateId,
                outcomeId: val,
                outcomesToUpdate: updatedOutcomes[val],
              },
              context: { role: WorkflowTemplateRoles.createWorkflowTemplate },
            });
          });
        }
      }
      dispatch(setIsLoading(false));
      history.push("/workflow/list");
      Notify.sendNotification(
        `Workflow ${props.workflowName} saved successfully`,
        AlertTypes.success
      );
    } catch (error) {
      dispatch(setIsLoading(false));
      console.log(error);
    }
  };

  const saveWorkflowTemplate = async () => {
    try {
      const templateUpdateResponse: any = await createWorkflowTemplate();
      const workflowTemplateId = templateUpdateResponse.id;
      dispatch(setIsLoading(true));
      // provide list of steps and outputs
      const workflowConfigurationSnapshot =
        getWorkflowTemplateConfigurationSnapshot(workflowTemplateId, false);
      await client.mutate({
        mutation: CREATE_STEPS_AND_OUTCOMES,
        variables: {
          stepsToInsert: workflowConfigurationSnapshot.stepsToInsert,
          outcomesToInsert: workflowConfigurationSnapshot.outcomesToInsert,
        },
        context: { role: WorkflowTemplateRoles.createWorkflowTemplate },
      });

      dispatch(setIsLoading(false));
      history.push("/workflow/list");
      Notify.sendNotification(
        `Workflow ${props.workflowName} saved successfully`,
        AlertTypes.success
      );
    } catch (error) {
      console.log(error);
      dispatch(setIsLoading(false));
    }
  };

  const handleOutcomePopup = () => {
    setShowOutcomePopup(false);

    const outcomeData = addEdge(
      {
        arrowHeadType: "arrowclosed",
        type: "custom",
        label: outcomeName.trim(),
        labelStyle: {
          fill: "#fff",
          fontFamily: "Poppins",
          fontStyle: "normal",
          fontWeight: "normal",
          fontSize: "1rem",
        },
        labelBgBorderRadius: 4,
        labelBgPadding: [7, 4],
        labelBgStyle: {
          fill: "#000000",
          color: "#fff !important",
          fillOpacity: 1,
        },
        style: { stroke: "#000000" },
        isDbValue: false,
        isDeleted: false,
        ...connectParams,
      },
      []
    );
    context.dispatch(setOutcomeData(outcomeData));
    setConnectParams({});
    setOutcomeName("");
    dispatch(setEdgeCenter([]));
  };

  const handleOutcomePopupClose = () => {
    setShowOutcomePopup(false);
    setConnectParams({});
    setOutcomeName("");
  };

  const onConnect = (params: any) => {
    const duplicateConnection: any = context.state.outcomeData
      .map(
        (outcome: any) =>
          outcome.source === params.source &&
          outcome.target === params.target &&
          !outcome.isDeleted
      )
      .filter((item: any) => item);

    if (duplicateConnection.length > 0) {
      Notify.sendNotification("Steps are already connected", AlertTypes.error);
    } else if (params.source !== params.target) {
      const newName = getUniqueOutcomeName();
      params.name = newName;
      setShowOutcomePopup(true);
      setConnectParams(params);
    }
  };

  const getUniqueOutcomeName = () => {
    const outcomeData = context?.state?.outcomeData;
    const prefix = props.templateId + "_outcome_";
    let index = 0;

    while (index < 1000) {
      const newName = prefix + index;
      if (checkIfStepNameExists(outcomeData, newName)) {
        ++index;
      } else {
        return newName;
      }
    }
    return null;
  };

  const numOfFormsAssociatedValidation = async () => {
    try {
      const response = await client.mutate({
        mutation: FETCH_RUNTIME_INFO_DATA_FOR_WF_TEMPLATE_ID,
        variables: {
          workflowTemplateId: urlParams?.id,
        },
        context: { role: WorkflowTemplateRoles.viewWorkflowTemplate },
      });
      return response?.data?.workflowRuntimeInfo?.length > 0 ? true : false;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const checkIfStepNameExists = (
    itemArray: any[],
    nameParam: string
  ): boolean => {
    if (itemArray == null || itemArray == undefined || itemArray.length < 1) {
      return false;
    }
    for (const item of itemArray) {
      if (item.name == nameParam) {
        return true;
      }
    }
    return false;
  };

  const onNodeDragStop = (node: any) => {
    const stepsData = context.state.stepsData.map((step: any) => {
      return step.id === node.id ? { ...step, position: node.position } : step;
    });
    context.dispatch(updateStepPositionOnDrag(stepsData));
  };

  const CustomNodeComponent: any = ({ data }: any) => {
    const currentStep = data.label.props.currentStep;
    return (
      <>
        {data.label}
        <Handle
          type="source"
          position={Position.Right}
          isConnectable={true}
          id="1"
          className={
            "react-flow__handle__right createStepDesign__main__addedText__handle_" +
            currentStep
          }
        >
          <AddCircleIcon
            style={{
              padding: "0.2rem",
              color: "#fff",
              pointerEvents: "none",
            }}
          />
        </Handle>
        <Handle
          type="target"
          position={Position.Right}
          isConnectable={true}
          id="11"
          className={
            "react-flow__handle__right__target1 createStepDesign__main__addedText__handle_" +
            currentStep
          }
        />
        <Handle
          type="target"
          position={Position.Right}
          isConnectable={true}
          id="12"
          className={
            "react-flow__handle__right__target2 createStepDesign__main__addedText__handle_" +
            currentStep
          }
        />
        <Handle
          id="4"
          isConnectable={true}
          type="target"
          position={Position.Left}
          className={
            "react-flow__handle__left createStepDesign__main__addedText__handle_" +
            currentStep
          }
        />
      </>
    );
  };

  const nodeTypes: any = {
    special: CustomNodeComponent,
  };

  return (
    <React.Fragment>
      <Box
        display="flex"
        flexDirection="column"
        flexGrow={12}
        className="workflowEditor__main"
      >
        <Box flexGrow={1} className="workflowEditor__main__reactFlowContainer">
          <ReactFlowProvider>
            <ReactFlow
              id={"reactFlow__tenant"}
              elements={[
                ...context.state.stepsData.filter(
                  (step: any) => !step.isDeleted
                ),
                ...context.state.outcomeData.filter(
                  (outcome: any) => !outcome.isDeleted
                ),
              ]}
              nodeTypes={nodeTypes}
              zoomOnDoubleClick={false}
              onConnect={
                canCreateWorkflowTemplates || canUpdateWorkflowTemplates
                  ? onConnect
                  : undefined
              }
              onNodeDragStop={(e, node) => onNodeDragStop(node)}
              edgeTypes={edgeTypes}
              elementsSelectable={
                canCreateWorkflowTemplates || canUpdateWorkflowTemplates
                  ? true
                  : false
              }
              nodesConnectable={
                canCreateWorkflowTemplates || canUpdateWorkflowTemplates
                  ? true
                  : false
              }
            >
              <Controls
                showInteractive={
                  canCreateWorkflowTemplates || canUpdateWorkflowTemplates
                    ? true
                    : false
                }
              />
            </ReactFlow>
          </ReactFlowProvider>
        </Box>
        {(canCreateWorkflowTemplates || canUpdateWorkflowTemplates) && (
          <Box
            display="flex"
            justifyContent="flex-end"
            className="workflowEditor__main__buttonContainer"
          >
            <Button
              className="btn-secondary"
              onClick={() => {
                context.state.updatesDone
                  ? props.onCancelClick()
                  : history.push("/workflow/list");
              }}
            >
              Cancel
            </Button>
            <Button
              className="btn-primary"
              onClick={async (e: any) => {
                e.stopPropagation();
                dispatch(setIsLoading(true));
                const dbVal = await dbValidations();
                const workflowValidation = workflowTemplateValidations();
                const isFormsAssociated = urlParams?.id
                  ? await numOfFormsAssociatedValidation()
                  : false;
                if (!workflowValidation && !dbVal) {
                  if (isFormsAssociated && context.state.enableVersioning) {
                    dispatch(setIsLoading(false));
                    setShowVersioningConfirmation(true);
                  } else if (urlParams?.id) {
                    updateWorkflowTemplate(false);
                  } else {
                    saveWorkflowTemplate();
                  }
                } else {
                  dispatch(setIsLoading(false));
                }
              }}
              disabled={context.state.updatesDone ? false : true}
            >
              Save Workflow
            </Button>
          </Box>
        )}
        <OutcomePopup
          open={showOutcomePopup}
          handleOutcomePopup={handleOutcomePopup}
          handleOutcomePopupClose={handleOutcomePopupClose}
          outcomeName={outcomeName}
          handleChange={handleChange}
          connectParams={connectParams}
        />
        <ConfirmDialog
          open={showVersioningConfirmation}
          message={{
            header: "Warning",
            text: "Changes made to the workflow will not affect the already created forms. Are you sure you want to continue?",
            cancel: "Cancel",
            proceed: "Save",
          }}
          proceed={() => {
            dispatch(setIsLoading(true));
            updateWorkflowTemplate(true);
          }}
          close={() => setShowVersioningConfirmation(false)}
        />
      </Box>
    </React.Fragment>
  );
}
