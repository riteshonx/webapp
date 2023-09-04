import { Box, Button, Dialog, makeStyles } from "@material-ui/core";
import React, { ReactElement } from "react";
import { workflowContext } from "../../../contextAPI/workflowContext";
import InputField from "../BootstarpInputField/InputField";
import "./OutcomePopup.scss";

function OutcomePopup({
  open,
  handleOutcomePopup,
  handleOutcomePopupClose,
  outcomeName,
  handleChange,
  connectParams,
}: any): ReactElement {
  const context: any = React.useContext(workflowContext);

  const [displayError, setDisplayError] = React.useState(false);

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
      minWidth: "30rem",
      minHeight: "16rem",
    },
  }));

  const onFocus = () => {
    displayError && setDisplayError(false);
  };

  const validateOutcomeName = () => {
    const sourceStep =
      context.state.outcomeData?.length &&
      context.state.outcomeData.filter(
        (outcome: any) =>
          outcome.source === connectParams?.source && !outcome.isDeleted
      );
    const isDuplicateOutcome =
      sourceStep?.length &&
      sourceStep
        .map(
          (sourceOutcome: any) =>
            sourceOutcome.label.trim().toLowerCase() ===
            outcomeName.trim().toLowerCase()
        )
        .filter((item: any) => item);
    return isDuplicateOutcome?.length ? true : false;
  };

  const classes: any = useStyles();
  return (
    <Dialog open={open} classes={{ paper: classes.dialogPaper }}>
      <Box
        display="flex"
        flexDirection="column"
        flexGrow={1}
        className="outcomePopup__main"
        justifyContent="center"
        flexWrap="wrap"
      >
        <Box className="outcomePopup__main__inputlabel">Outcome Label</Box>
        <InputField
          placeholder="Enter Outcome Label Name"
          value={outcomeName}
          handleChange={handleChange}
          displayError={displayError}
          onFocus={onFocus}
          onKeyPress={(e: any) => {
            if (e.key === "Enter" && outcomeName.trim()) {
              if (!validateOutcomeName()) {
                handleOutcomePopup();
                setDisplayError(false);
              } else setDisplayError(true);
            }
          }}
        />
        <Box
          className="outcomePopup__main__inputError"
          visibility={displayError ? "" : "hidden"}
        >
          Outcome label has to be unique between two steps in workflow
        </Box>
        <Box
          display="flex"
          justifyContent="flex-end"
          className="outcomePopup__main__buttonContainer"
        >
          <Button
            className="outcomePopup__main__buttonContainer__button1"
            onClick={() => {
              handleOutcomePopupClose();
              setDisplayError(false);
            }}
          >
            Cancel
          </Button>
          <Button
            className={
              outcomeName.trim()
                ? "outcomePopup__main__buttonContainer__button2"
                : "outcomePopup__main__buttonContainer__button2 outcomePopup__main__buttonContainer__button2__disabled"
            }
            disabled={outcomeName.trim() ? false : true}
            onClick={() => {
              if (outcomeName.trim() && !validateOutcomeName()) {
                handleOutcomePopup();
                setDisplayError(false);
              } else setDisplayError(true);
            }}
          >
            Add
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}

export default OutcomePopup;
