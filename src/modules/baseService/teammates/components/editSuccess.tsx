import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Avatar from "@material-ui/core/Avatar";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import PersonIcon from "@material-ui/icons/Person";
import AddIcon from "@material-ui/icons/Add";
import Typography from "@material-ui/core/Typography";
import { blue } from "@material-ui/core/colors";
import { useHistory, useRouteMatch } from "react-router-dom";
import "./successDialog.scss";
import { useEffect } from "react";
import THUMBS_UP from "../../../../assets/images/thumbs-up-left.svg"


const useStyles = makeStyles({
  avatar: {
    backgroundColor: blue[100],
    color: blue[600],
  },
});

export interface SimpleDialogProps {
  open: boolean;
  onClose?: (value: string) => void;
}

export default function SimpleDialog(props: SimpleDialogProps) {
  const classes = useStyles();
  const { onClose, open } = props;
  const history: any = useHistory();

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        history.push("/base/teammates/lists");
      }, 1500);
    }
  }, [open]);

  return (
    <Dialog
      onClose={onClose}
      aria-labelledby="simple-dialog-title"
      open={open}
    >
      <div className="successDialog__parent">
        <div className="successDialog__editBox">
            <div className="dialog__success">
                      <div className="dialog__success__box">
                          <img className="img-responsive" src={THUMBS_UP} alt="success" />
                      </div>
                  </div>
        <h2 className="successDialog__title" id="simple-dialog-title">
          Updates made !
        </h2>
        </div>
      </div>
    </Dialog>
  );
}
