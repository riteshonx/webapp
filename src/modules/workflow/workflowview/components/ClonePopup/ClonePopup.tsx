import { Box, Button, Dialog, makeStyles } from "@material-ui/core";
import React, { ReactElement } from "react";
import { workflowContext } from "../../../contextAPI/workflowContext";
import InputField from "../BootstarpInputField/InputField";
import "./ClonePopup.scss";

function ClonePopup({
  open,
  handleClonePopup,
  handleCloneWorkflowCreation,
  currentWorkflowId,
}: any): ReactElement {
  const useStyles: any = makeStyles(() => ({
    dialogPaper: {
      display: "flex",
      border: "0.5px solid #FFFFFF",
      boxSizing: "border-box",
      minWidth: "35rem",
      minHeight: "18rem",
    },
  }));

  const [workflowName, setWorkflowName] = React.useState("");
  const [error, setError] = React.useState("");

  const handleWorkflowNameChange = (e: any) => {
    const value = e.target.value;
    setWorkflowName(value);
    setError("");
  };

  const onFocus = () => {
    if (error) {
      setError("");
    }
  };

  const handleCloneWorkflowSave = async () => {
    const response = await handleCloneWorkflowCreation(
      workflowName,
      currentWorkflowId
    );
    if (response === true) {
      handleClonePopup();
      setError("");
      setWorkflowName("");
    } else {
      setError(response);
    }
  };

  const classes: any = useStyles();
  return (
    <Dialog open={open} classes={{ paper: classes.dialogPaper }}>
      <Box
        display="flex"
        flexDirection="column"
        flexGrow={1}
        className="cloneWorkflowPopup__main"
        flexWrap="wrap"
      >
        <span className="cloneWorkflowPopup__main__label">
          Enter Workflow name
        </span>
        <InputField
          onFocus={onFocus}
          value={workflowName}
          handleChange={handleWorkflowNameChange}
          displayError={error ? true : false}
          workflowName={error ? true : false}
          onKeyPress={(e: any) => {
            if (e.key === "Enter" && workflowName.trim()) {
              handleCloneWorkflowSave();
            }
          }}
        />
        <span className="cloneWorkflowPopup__main__error">{error}</span>
        <Box
          display="flex"
          justifyContent="flex-end"
          alignItems="flex-end"
          className="cloneWorkflowPopup__main__buttonContainer"
          flexGrow={1}
        >
          <Button
            className="cloneWorkflowPopup__main__buttonContainer__button1"
            onClick={() => {
              handleClonePopup();
              setError("");
            }}
          >
            Cancel
          </Button>
          <Button
            className={
              workflowName.trim()
                ? "cloneWorkflowPopup__main__buttonContainer__button2"
                : "cloneWorkflowPopup__main__buttonContainer__button2 cloneWorkflowPopup__main__buttonContainer__button2__disable"
            }
            onClick={handleCloneWorkflowSave}
            disabled={workflowName.trim() ? false : true}
          >
            Clone
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}

export default ClonePopup;
