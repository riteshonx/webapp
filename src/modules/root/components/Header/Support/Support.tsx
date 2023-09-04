import { Dialog, makeStyles } from "@material-ui/core";
import { ReactElement } from "react";
import "./Support.scss";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    maxHeight: "70%",
    minHeight: "70%",
    minWidth: "45%",
    maxWidth: "45%",
    overflow: "hidden",
  },
}));

function Support({ open, handleClose }: any): ReactElement {
  const classes = useStyles();
  return (
    <Dialog
      classes={{ paper: classes.dialogPaper }}
      onClose={handleClose}
      open={open}
    >
      <div className={"support-main"}>
        <div className={"support-main__text1"}>Please drop us an email</div>
        <div className={"support-main__text2"}>support@slate.ai</div>
        <div className={"support-main__buildVersion"}>
          Version::
          <span>{process.env["REACT_APP_BUILDTAG"]}</span>
        </div>
      </div>
    </Dialog>
  );
}

export default Support;
