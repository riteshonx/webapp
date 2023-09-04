import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  makeStyles,
} from "@material-ui/core";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/EditOutlined";

import React, { ReactElement } from "react";
import {
  cancelStepData,
  deleteStep,
  setStepName,
  setUpdatesDone,
} from "../../../contextAPI/action";
import { workflowContext } from "../../../contextAPI/workflowContext";
import InputField from "../BootstarpInputField/InputField";
import WorkflowPopup from "../WorkflowPopup/WorkflowPopup";
import "./CreateStepDesign.scss";
import ConfirmDialog from "../../../../shared/components/ConfirmDialog/ConfirmDialog";
import {
  canCreateWorkflowTemplates,
  canUpdateWorkflowTemplates,
} from "../../../roles/permissions";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import { setEdgeCenter } from "src/modules/root/context/authentication/action";

function CreateStepDesign({
  currentStep,
  stepDefinitionItem,
}: any): ReactElement {
  const context: any = React.useContext(workflowContext);
  const { dispatch }: any = React.useContext(stateContext);

  const [addStepText, setAddStepText] = React.useState(false);
  const [textAdded, setTextAdded] = React.useState("");
  const [isStartStep, setIsStartStep]: any = React.useState(
    currentStep.includes("_0")
  );
  const [isFinalStep, setIsFinalStep]: any = React.useState(false);
  const [stepEditAllowed, setStepEditAllowed]: any = React.useState(true);
  const [showDeletePopup, setShowDeletePopup] = React.useState(false);
  const [isIntermediateStep, setIsIntermediateStep] = React.useState(false);
  const [openDialog, setOpenDialog] = React.useState(false);

  React.useEffect(() => {
    setTextAdded(
      stepDefinitionItem?.description ? stepDefinitionItem.description : ""
    );
    setStepEditAllowed(
      stepDefinitionItem?.description ? stepDefinitionItem.editsAllowed : true
    );
    if (stepDefinitionItem?.type === "end") {
      setIsFinalStep(true);
    }
    if (stepDefinitionItem?.type === "start") {
      setIsStartStep(true);
    }
    handleEdgePoints(stepDefinitionItem?.type, true);
  }, [stepDefinitionItem]);

  const useStyles: any = makeStyles({
    checkbox: {
      background:
        "linear-gradient(120.17deg, #FCFCFC -31.99%, #E2E2E2 102.21%)",
      border: "0.5px solid #CCCCCC",
      boxShadow: "inset 0px 1px 2px rgba(14, 14, 14, 0.55)",
      borderRadius: "4px",
      boxSizing: "border-box",
      color: "transparent",
      width: "1.8rem",
      height: "1.8rem",
    },
  });

  const handleChangeText = (e: any) => {
    const value = e.target.value;
    setTextAdded(value);
  };

  const handleEdgePoints = (stepType: string, savedData?: boolean) => {
    const element: any = document.getElementsByClassName(
      "createStepDesign__main__addedText__handle_" + currentStep
    );
    for (let i = 0; i < element.length; i++) {
      const data: any = document.getElementsByClassName(
        "createStepDesign__main__addedText__handle_" + currentStep
      )[i];
      if (stepType === "task") {
        data.style.visibility = textAdded || savedData ? "visible" : "hidden";
      } else if (stepType === "start") {
        data.style.visibility =
          (textAdded || savedData) && i === 0 ? "visible" : "hidden";
      } else if (stepType === "end") {
        data.style.visibility =
          (textAdded || savedData) && i === 3 ? "visible" : "hidden";
      } else {
        data.style.visibility = "hidden";
      }
    }
  };

  const saveEditedText = () => {
    const stepsData = context.state.stepsData.map((step: any) => {
      if (step.id === currentStep) {
        return {
          ...step,
          label: textAdded.trim(),
          stepType: isFinalStep ? "end" : isStartStep ? "start" : "task",
        };
      } else {
        return step;
      }
    });
    setAddStepText(true);
    setTextAdded(textAdded.trim());
    context.dispatch(setUpdatesDone({ updates: true, versioning: true }));
    context.dispatch(setStepName(stepsData));
    handleEdgePoints(isFinalStep ? "end" : isStartStep ? "start" : "task");
  };

  const handleUpdatedDataSave = (data: any) => {
    let isStartStep = false;
    const stepsData = context.state.stepsData.map((step: any) => {
      if (step.id === currentStep) {
        isStartStep = step.stepType === "start" ? true : false;
        return {
          ...step,
          label: data.stepText,
          stepType: data.isFinalStep
            ? "end"
            : step.stepType === "start"
            ? "start"
            : "task",
          editsAllowed: data.editsAllowed,
        };
      } else {
        return step;
      }
    });
    setTextAdded(data.stepText);
    setIsFinalStep(data.isFinalStep);
    setStepEditAllowed(data.editsAllowed);
    setOpenDialog(false);
    context.dispatch(setStepName(stepsData));
    handleEdgePoints(data.isFinalStep ? "end" : isStartStep ? "start" : "task");
  };

  const handleCancel = () => {
    const stepsData = context.state.stepsData.filter((step: any) => {
      return step.id !== currentStep;
    });

    const outcomeData = context.state.outcomeData.filter((outcome: any) => {
      return outcome.source !== currentStep && outcome.target !== currentStep;
    });
    context.dispatch(
      cancelStepData({ stepsData: stepsData, outcomeData: outcomeData })
    );
  };

  const handleDeleteStep = () => {
    const stepsData: any = [];
    const outcomeData: any = [];
    context.state.stepsData.forEach((step: any) => {
      if (step.id === currentStep && step.isDbValue) {
        stepsData.push({ ...step, isDeleted: true });
      } else if (step.id !== currentStep) {
        stepsData.push(step);
      }
    });

    context.state.outcomeData.forEach((outcome: any) => {
      if (
        (outcome.source === currentStep || outcome.target === currentStep) &&
        outcome.isDbValue
      ) {
        outcomeData.push({ ...outcome, isDeleted: true });
      } else if (
        outcome.source !== currentStep &&
        outcome.target !== currentStep
      ) {
        outcomeData.push(outcome);
      }
    });

    context.dispatch(
      deleteStep({ stepsData: stepsData, outcomeData: outcomeData })
    );

    setShowDeletePopup(false);
    dispatch(setEdgeCenter([]));
  };

  const handleDeletePopup = () => {
    setShowDeletePopup(!showDeletePopup);
  };

  const classes = useStyles();

  const validateIfIntermediateStep = () => {
    const data = context.state.outcomeData
      .map(
        (outcome: any) => outcome.source === currentStep && !outcome.isDeleted
      )
      .filter((item: any) => item);
    data.length ? setIsIntermediateStep(true) : setIsIntermediateStep(false);
  };

  return (
    <React.Fragment>
      {addStepText || (stepDefinitionItem && stepDefinitionItem.id) ? (
        <Box
          display="flex"
          flexDirection="column"
          flexGrow={1}
          className={"createStepDesign__main createStepDesign__main__addedText"}
          justifyContent="center"
          flexWrap="wrap"
        >
          <Box className="createStepDesign__main__stepTypeContainer">
            {isStartStep ? (
              <Box
                display="flex"
                alignItems="center"
                className="createStepDesign__main__stepType createStepDesign__main__stepType__text1"
              >
                Start
              </Box>
            ) : null}
            {isFinalStep ? (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="flex-end"
                className="createStepDesign__main__stepType createStepDesign__main__stepType__text2"
              >
                <CheckCircleIcon
                  htmlColor="#1F412B"
                  className="createStepDesign__main__stepType__text2__icon"
                />
                Final Step
              </Box>
            ) : null}
          </Box>
          <Box display="flex" flexGrow={1} flexWrap="wrap" alignItems="center">
            <Box className="createStepDesign__main__addedStepName">
              {textAdded}
            </Box>
          </Box>
          {(canCreateWorkflowTemplates || canUpdateWorkflowTemplates) && (
            <Box className="createStepDesign__main__deleteContainer">
              <IconButton
                className="createStepDesign__main__iconButton"
                onClick={() => {
                  setOpenDialog(true);
                  validateIfIntermediateStep();
                }}
              >
                <EditIcon className="createStepDesign__main__deleteIcon"></EditIcon>
              </IconButton>
              <IconButton
                className="createStepDesign__main__iconButton"
                onClick={handleDeletePopup}
                disabled={isStartStep ? true : false}
              >
                <DeleteOutlineIcon className="createStepDesign__main__deleteIcon"></DeleteOutlineIcon>
              </IconButton>
            </Box>
          )}
          <ConfirmDialog
            open={showDeletePopup}
            message={{
              header: "Delete",
              text: "Are you sure you want to delete the step?",
              cancel: "Cancel",
              proceed: "Delete",
            }}
            proceed={handleDeleteStep}
            close={handleDeletePopup}
          />
        </Box>
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          flexGrow={1}
          className="createStepDesign__main"
          justifyContent="center"
          flexWrap="wrap"
        >
          {isStartStep ? (
            <Box
              display="flex"
              className="createStepDesign__main__stepType createStepDesign__main__stepType__text1"
              alignSelf="flex-end"
            >
              Start
            </Box>
          ) : null}
          <Box className="createStepDesign__main__stepName">Step Name</Box>
          <InputField
            placeholder="Enter Name of Step"
            value={textAdded}
            handleChange={handleChangeText}
            onKeyPress={(e: any) => {
              if (e.key === "Enter" && textAdded.trim()) {
                saveEditedText();
              }
            }}
          />
          <Box visibility={isStartStep ? "hidden" : ""}>
            <FormControlLabel
              className="createStepDesign__main__formControl"
              control={
                <Checkbox
                  checked={isFinalStep}
                  onChange={() => setIsFinalStep(!isFinalStep)}
                  classes={{ root: classes.checkbox }}
                  className="createStepDesign__main__formControl__checkbox"
                  name="checkbox"
                  color="primary"
                />
              }
              label={
                <span className="createStepDesign__main__formControl__label">
                  Set as Final Status
                </span>
              }
            />
          </Box>
          <Box
            display="flex"
            justifyContent="flex-end"
            className="createStepDesign__main__buttonContainer"
            marginTop={currentStep === 1 ? "1rem" : undefined}
          >
            <Button
              className="btn-secondary"
              onClick={handleCancel}
              disabled={isStartStep ? true : false}
            >
              Cancel
            </Button>
            <Button
              disabled={textAdded.trim() ? false : true}
              onClick={() => {
                saveEditedText();
              }}
              className="btn-primary"
            >
              Create
            </Button>
          </Box>
        </Box>
      )}
      <WorkflowPopup
        openDialog={openDialog}
        handleClose={(e: any) => {
          setOpenDialog(false);
          e.stopPropagation();
        }}
        stepName={textAdded}
        saveEditedText={handleUpdatedDataSave}
        isFinalStep={isFinalStep}
        isStartStep={isStartStep}
        stepEditAllowed={stepEditAllowed}
        isIntermediateStep={isIntermediateStep}
      />
    </React.Fragment>
  );
}

export default CreateStepDesign;
