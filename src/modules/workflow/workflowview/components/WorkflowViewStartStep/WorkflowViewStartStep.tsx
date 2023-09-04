import { Box, Button } from "@material-ui/core";
import { ArrowBackIos } from "@material-ui/icons";
import React, { ReactElement, useContext } from "react";
import { outComeLabelStyles, stepStyles } from "../../../container/utils";
import { useHistory } from "react-router-dom";
import {
  setOutcomeData,
  setStepData,
  setUpdatesDone,
  setWorkflowTemplateConfigFromDB,
} from "../../../contextAPI/action";
import { workflowContext } from "../../../contextAPI/workflowContext";
import WorkflowEditor from "../../pages/WorkflowEditor/WorkflowEditor";
import CreateStepDesign from "../CreateStepDesign/CreateStepDesign";
import "./WorkflowViewStartStep.scss";
import { useParams } from "react-router-dom";
import { WorkflowTemplateRoles } from "../../../../../utils/role";
import { useLazyQuery } from "@apollo/client";
import { setIsLoading } from "../../../../root/context/authentication/action";
import { FETCH_WORKFLOW_DETAILS } from "../../../graphql/queries/workflow";
import { stateContext } from "../../../../root/context/authentication/authContext";
import ConfirmDialog from "../../../../shared/components/ConfirmDialog/ConfirmDialog";
import InputField from "../BootstarpInputField/InputField";
import {
  canCreateWorkflowTemplates,
  canUpdateWorkflowTemplates,
} from "../../../roles/permissions";

export interface TemplateId {
  id: string;
}

function WorkflowViewStartStep(): ReactElement {
  const history = useHistory();
  const context: any = React.useContext(workflowContext);
  const urlParams: any = useParams();
  const [editWorkflowName, setEditWorkflowName] = React.useState(false);
  const [templateId, setTemplateId] = React.useState("");
  const [showCancelPopup, setShowCancelPopup] = React.useState(false);

  const [workflowName, setWorkflowName] = React.useState("");
  const { dispatch }: any = useContext(stateContext);
  const [showWorkflowEditor, setShowWorkflowEditor]: any =
    React.useState(false);

  const handleWorkflowNameChange = (e: any) => {
    const value = e.target.value;
    if (value !== workflowName) {
      context.dispatch(
        setUpdatesDone({
          updates: true,
          versioning: context.state.enableVersioning,
        })
      );
    }
    setWorkflowName(value);
  };

  const [getWorkflowTemplateDetails, { loading, data, error }] = useLazyQuery(
    FETCH_WORKFLOW_DETAILS,
    {
      fetchPolicy: "network-only",
      context: {
        role: WorkflowTemplateRoles.viewWorkflowTemplate,
        token: "",
      },
    }
  );

  const getWorkflowDetails = (workflowId: number) => {
    setShowWorkflowEditor(false);
    getWorkflowTemplateDetails({
      variables: {
        workflowTemplateId: workflowId,
      },
    });
  };

  const loadWorkflowDetails = (workflowData: any) => {
    const stepDetails = workflowData[0]?.workflowTemplateStepDefs;
    if (
      data.workflowTemplate &&
      data.workflowTemplate.length &&
      data.workflowTemplate[0].name
    ) {
      setWorkflowName(data.workflowTemplate[0].name);
      setEditWorkflowName(true);
    }

    if (
      stepDetails === null ||
      stepDetails === undefined ||
      !(stepDetails.length >= 0)
    ) {
      return;
    }
    for (const stepDefinitionItem of stepDetails) {
      let stepName = stepDefinitionItem?.name;
      if (stepName == undefined) {
        stepName = "";
      }
      addNewStep(stepDefinitionItem);
    }
    for (const stepDefinitionItem of stepDetails) {
      if (stepDefinitionItem.wFFromStepDefOutcomes.length) {
        const outcomeData: any = [];
        stepDefinitionItem.wFFromStepDefOutcomes.forEach((outcome: any) => {
          const updatedData = {
            id: outcome.id,
            name: outcome.name,
            source: outcome.fromStepDefName,
            sourceHandle: outcome.startx,
            target: outcome.toStepDefName,
            targetHandle: outcome.endx,
            label: outcome.name,
            isDbValue: true,
            isDeleted: outcome.isDeleted,
            ...outComeLabelStyles(),
          };
          outcomeData.push(updatedData);
        });
        context.dispatch(setOutcomeData(outcomeData));
      }
    }

    setShowWorkflowEditor(true);
    context.dispatch(setWorkflowTemplateConfigFromDB(workflowData[0]));
  };

  React.useEffect(() => {
    if (data && data?.workflowTemplate?.length > 0 && !loading) {
      dispatch(setIsLoading(false));
      loadWorkflowDetails(data.workflowTemplate);
    } else if (!loading && data?.workflowTemplate !== undefined) {
      dispatch(setIsLoading(false));
      history.push("/workflow");
    }
  }, [data, loading, error]);

  React.useEffect(() => {
    if (Number(urlParams?.id)) {
      dispatch(setIsLoading(true));
      getWorkflowDetails(Number(urlParams?.id));
    } else if (!canCreateWorkflowTemplates && !canUpdateWorkflowTemplates) {
      history.push("/workflow");
    } else if (urlParams?.id !== undefined) {
      history.push("/workflow");
    }
    return () => {
      return;
    };
  }, []);

  const onBlur = () => {
    if (workflowName) {
      setEditWorkflowName(true);
    }
  };

  const getUniqueStepName = (itemArray: any[]) => {
    const prefix = templateId + "_step_";
    let index = 0;

    while (index < 1000) {
      const newName = prefix + index;
      if (checkIfStepNameExists(itemArray, newName)) {
        ++index;
      } else {
        return newName;
      }
    }
    return "";
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

  const addNewStep = (stepDefinitionItem: any) => {
    if (stepDefinitionItem?.id) {
      const steps = {
        id: stepDefinitionItem.name,
        name: stepDefinitionItem.name,
        label: stepDefinitionItem.description,
        stepType: stepDefinitionItem.type,
        type: "special",
        data: {
          label: (
            <CreateStepDesign
              currentStep={stepDefinitionItem.name}
              stepDefinitionItem={stepDefinitionItem}
            />
          ),
        },
        style: stepStyles(),

        position: {
          x: stepDefinitionItem.posx,
          y: stepDefinitionItem.posy,
        },
        dbId: stepDefinitionItem.id,
        isDbValue: true,
        isDeleted: stepDefinitionItem.isDeleted,
      };
      context.dispatch(setStepData(steps));
    } else {
      let newName = stepDefinitionItem?.name;
      if (newName == null || newName == undefined || newName == "") {
        newName = getUniqueStepName(context?.state?.stepsData);
      }
      const steps = {
        id: newName,
        name: newName,
        type: "special",
        data: {
          label: (
            <CreateStepDesign currentStep={newName} stepDefinitionItem={""} />
          ),
        },
        style: stepStyles(),
        position: {
          x: context.state.currentStep === 1 ? 50 : 200,
          y: context.state.currentStep === 1 ? 50 : 200,
        },
        isDbValue: false,
        isDeleted: false,
      };
      context.dispatch(setStepData(steps));
    }
  };

  const onCancelClick = () => {
    setShowCancelPopup(!showCancelPopup);
  };

  const onNavigateToListScreen = () => {
    history.push("/workflow/list");
    setShowCancelPopup(false);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      className="workflowViewStartStep__main"
      onClick={() => {
        if (!editWorkflowName) onBlur();
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        className="workflowViewStartStep__main__header"
      >
        <Box display="flex" alignItems="center">
          <ArrowBackIos
            className="workflowViewStartStep__main__header__icon"
            onClick={() =>
              context.state.updatesDone &&
              (canCreateWorkflowTemplates || canUpdateWorkflowTemplates)
                ? onCancelClick()
                : history.push("/workflow/list")
            }
          />
          {editWorkflowName ? (
            <Box
              className={
                canCreateWorkflowTemplates || canUpdateWorkflowTemplates
                  ? "workflowViewStartStep__main__header__text"
                  : "workflowViewStartStep__main__header__text__disableEdit"
              }
              onClick={() => {
                canCreateWorkflowTemplates || canUpdateWorkflowTemplates
                  ? setEditWorkflowName(false)
                  : undefined;
              }}
            >
              {workflowName}
            </Box>
          ) : (
            <InputField
              type="text"
              onClick={(e: any) => e.stopPropagation()}
              onKeyPress={(e: any) => {
                if (e.key === "Enter" && !editWorkflowName) {
                  onBlur();
                }
              }}
              placeholder="Enter Workflow Name"
              handleChange={handleWorkflowNameChange}
              className="workflowViewStartStep__main__header__textField"
              value={workflowName}
              displayError={workflowName ? false : true}
            />
          )}
        </Box>
        {showWorkflowEditor && canCreateWorkflowTemplates ? (
          <Button className="btn-primary" onClick={() => addNewStep("")}>
            Add Step
          </Button>
        ) : null}
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        flexGrow={1}
        alignItems="center"
        justifyContent="center"
        className="workflowViewStartStep__main__body"
      >
        {!showWorkflowEditor && !urlParams?.id ? (
          <Box display="flex" flexDirection="column" alignItems="center">
            <Box
              display="flex"
              flexWrap="wrap"
              alignItems="center"
              justifyContent="center"
              flexDirection="column"
              className="workflowViewStartStep__main__body__text"
            >
              Start your workflow by adding the first step
            </Box>
            <Button
              className="btn-primary"
              onClick={() => {
                addNewStep("");
                setShowWorkflowEditor(true);
              }}
            >
              Add First Step
            </Button>
          </Box>
        ) : (
          <WorkflowEditor
            showCancelPopup={showCancelPopup}
            onCancelClick={onCancelClick}
            onNavigateToListScreen={onNavigateToListScreen}
            templateId={templateId}
            workflowName={workflowName}
          />
        )}
      </Box>
      <ConfirmDialog
        open={showCancelPopup}
        message={{
          header: "Warning",
          text: "Any unsaved changes will be lost. Are you sure you want to continue?",
          cancel: "No",
          proceed: "Yes",
        }}
        proceed={() => {
          onNavigateToListScreen();
        }}
        close={onCancelClick}
      />
    </Box>
  );
}

export default WorkflowViewStartStep;
