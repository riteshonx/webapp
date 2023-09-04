import {
  Box,
  Button,
  Checkbox,
  Dialog,
  fade,
  FormControl,
  FormControlLabel,
  InputBase,
  makeStyles,
  MenuItem,
  Select,
  withStyles,
} from "@material-ui/core";
import React, { ReactElement } from "react";
import { CustomPopOver } from "src/modules/shared/utils/CustomPopOver";
import Notify, {
  AlertTypes,
} from "../../../../shared/components/Toaster/Toaster";
import "./WorkflowPopup.scss";

const BootstrapInput = withStyles((theme: any) => ({
  input: {
    position: "relative",
    backgroundColor: theme.palette.common.white,
    fontSize: 14,
    width: "100%",
    height: "3.5rem",
    margin: "0.5rem 0",
    padding: "7px 12px",
    background: "#FFFFFF",
    border: "0.5px solid #828282",
    boxSizing: "border-box",
    borderRadius: "4px",
    transition: theme.transitions.create(["border-color", "box-shadow"]),
    fontFamily: "Poppins",
    "&:focus": {
      boxShadow: `${fade(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
      borderColor: theme.palette.primary.main,
    },
  },
}))(InputBase);

const useStyles: any = makeStyles(() => ({
  dialogPaper: {
    display: "flex",
    background: "linear-gradient(132.77deg, #FCFCFC 11.98%, #F1F1F1 111.18%)",
    border: "0.5px solid #FFFFFF",
    boxSizing: "border-box",
    boxShadow:
      "0px 2px 1px -1px rgba(180, 179, 189, 0.35), 2px 0px 1px rgba(180, 179, 189, 0.24)," +
      " 0px 2px 8px rgba(180, 179, 189, 0.5), inset 1px 2px 0px #FFFFFF",
    borderRadius: "8px",
    minWidth: "42rem",
    minHeight: "30rem",
    padding: "2.5rem 3.5rem",
  },
  checkbox: {
    background: "linear-gradient(120.17deg, #FCFCFC -31.99%, #E2E2E2 102.21%)",
    border: "0.5px solid #CCCCCC",
    boxShadow: "inset 0px 1px 2px rgba(14, 14, 14, 0.55)",
    borderRadius: "4px",
    boxSizing: "border-box",
    width: "1.8rem",
    height: "1.8rem",
  },
}));

export default function WorkflowPopup({
  openDialog,
  handleClose,
  stepName,
  saveEditedText,
  isFinalStep,
  isStartStep,
  stepEditAllowed,
  isIntermediateStep,
}: any): ReactElement {
  const classes: any = useStyles();
  const [editStepName, setEditStepName] = React.useState(false);
  const [stepText, setStepText] = React.useState("");
  const [finalStep, setFinalStep] = React.useState(false);
  const [editsAllowed, setEditsAllowed] = React.useState(false);
  const [enableUpdate, setEnableUpdate] = React.useState({
    stepNameUpdate: false,
    editsAllowedUpdate: false,
    finalStepUpdate: false,
  });
  const popOverclasses = CustomPopOver();

  React.useEffect(() => {
    setStepText(stepName);
    setFinalStep(isFinalStep);
    setEditsAllowed(stepEditAllowed);
  }, [stepName, isFinalStep, stepEditAllowed]);

  const handleChange = (e: any) => {
    const value = e.target.value;
    if (value === stepName) {
      setEnableUpdate({ ...enableUpdate, stepNameUpdate: false });
    } else {
      setEnableUpdate({ ...enableUpdate, stepNameUpdate: true });
    }
    setStepText(value);
  };

  const handleRuleChange = () => {
    if (editsAllowed !== stepEditAllowed) {
      setEnableUpdate({ ...enableUpdate, editsAllowedUpdate: false });
    } else {
      setEnableUpdate({ ...enableUpdate, editsAllowedUpdate: true });
    }
    setEditsAllowed(!editsAllowed);
  };

  const handleStepNameChange = () => {
    if (editStepName) {
      setEditStepName(false);
      setStepText(stepText.trim());
    }
    if (stepText.trim() === "") {
      Notify.sendNotification("Step Name cannot be empty!", AlertTypes.error);
      setEnableUpdate({ ...enableUpdate, stepNameUpdate: false });
      setStepText(stepName);
    }
  };

  return (
    <Dialog
      open={openDialog}
      classes={{ paper: classes.dialogPaper }}
      onClick={handleStepNameChange}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="start"
        className="workflowPopUp__main"
      >
        {!editStepName ? (
          <Box
            className="workflowPopUp__main__header"
            onClick={() => setEditStepName(true)}
          >
            {stepText}
          </Box>
        ) : (
          <BootstrapInput
            fullWidth
            value={stepText}
            onClick={(e: any) => e.stopPropagation()}
            onChange={handleChange}
            onKeyPress={(e: any) => {
              if (e.key === "Enter") {
                handleStepNameChange();
              }
            }}
          />
        )}
        <FormControlLabel
          disabled={isStartStep || isIntermediateStep ? true : false}
          className={
            isStartStep || isIntermediateStep
              ? "workflowPopUp__main__formControl workflowPopUp__main__rules__editsAllowedLabel__disabled"
              : "workflowPopUp__main__formControl"
          }
          control={
            <Checkbox
              checked={finalStep}
              onChange={() => {
                if (finalStep !== isFinalStep) {
                  setEnableUpdate({ ...enableUpdate, finalStepUpdate: false });
                } else {
                  setEnableUpdate({ ...enableUpdate, finalStepUpdate: true });
                }
                setFinalStep(!finalStep);
              }}
              classes={{ root: classes.checkbox }}
              className="workflowPopUp__main__formControl__checkbox"
              name="checkbox"
            />
          }
          label={
            <span className="workflowPopUp__main__formControl__label">
              Set as Final Status
            </span>
          }
        />
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        className="workflowPopUp__main__rules"
      >
        <span className="workflowPopUp__main__rules__header">RULES</span>
        <FormControl>
          <label
            id="editsAllowed"
            className={
              finalStep
                ? "workflowPopUp__main__rules__editsAllowedLabel workflowPopUp__main__rules__editsAllowedLabel__disabled"
                : "workflowPopUp__main__rules__editsAllowedLabel"
            }
          >
            Edits Allowed
          </label>
          <Select
            id="editsAllowed"
            disabled={finalStep ? true : false}
            value={editsAllowed ? "yes" : "no"}
            onChange={handleRuleChange}
            variant="outlined"
            MenuProps={{
              classes: { paper: popOverclasses.root },
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "left",
              },
              transformOrigin: {
                vertical: "top",
                horizontal: "left",
              },
              getContentAnchorEl: null,
            }}
            className={
              finalStep
                ? "workflowPopUp__main__rules__editsAllowedLabel__disabled"
                : ""
            }
          >
            <MenuItem value="yes" className="mat-menu-item-sm">
              Yes
            </MenuItem>
            <MenuItem value="no" className="mat-menu-item-sm">
              No
            </MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="flex-end"
        className="workflowPopUp__main__buttonContainer"
        flexGrow={1}
      >
        <Button
          variant="outlined"
          onClick={(e: any) => {
            handleClose(e);
            setEditStepName(false);
            setStepText(stepName);
            setFinalStep(isFinalStep);
            setEditsAllowed(stepEditAllowed);
            setEnableUpdate({
              stepNameUpdate: false,
              finalStepUpdate: false,
              editsAllowedUpdate: false,
            });
          }}
          className="btn-secondary"
        >
          Cancel
        </Button>
        <Button
          disabled={
            Object.values(enableUpdate).filter((item) => item).length > 0
              ? false
              : true
          }
          variant="contained"
          onClick={() => {
            setEditStepName(false);
            if (!stepText.trim()) {
              setStepText(stepName);
            } else {
              saveEditedText({
                stepText: stepText.trim(),
                isFinalStep: finalStep,
                editsAllowed: editsAllowed,
              });
            }
            setEnableUpdate({
              stepNameUpdate: false,
              finalStepUpdate: false,
              editsAllowedUpdate: false,
            });
          }}
          className="btn-primary"
        >
          Update
        </Button>
      </Box>
    </Dialog>
  );
}
