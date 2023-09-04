import React, {useState} from "react";
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
import { useHistory , useRouteMatch } from "react-router-dom";
import { postApiWithEchange } from "../../../../services/api";

import "./successDialog.scss";
import { decodeExchangeToken } from "../../../../services/authservice";
const useStyles = makeStyles({
  avatar: {
    backgroundColor: blue[100],
    color: blue[600],
  },
});

export interface SimpleDialogProps {
  open: boolean;
  onClose?: (value: string) => void;
  closeInvite?: () => void;
  type?:string
  reactivate?:()=>void
  deactivate?:()=>void
}

export default function SimpleDialog(props: SimpleDialogProps) {
  const classes = useStyles();
  const { onClose, open, closeInvite, type, reactivate,deactivate } = props;
  const history : any = useHistory();
  const pathMatch:any= useRouteMatch();
  const [resendSuccess, setResendSuccess] = useState(false)
  
  const handleClose = () => {
    closeInvite && closeInvite()
  };

  const handleInvite = async () => {
   if(type == "activate"){
    reactivate && reactivate()
   }else {
    deactivate && deactivate()
   }
  }

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="simple-dialog-title"
      open={props.open}
    >
     {!resendSuccess && 
        <div className="successDialog__parent">
        <h2 className="successDialog__title" id="simple-dialog-title">
          {type === "activate" ? `Just confirming` : `Are you sure ?`}
        </h2>
        <div style={{ textAlign: "center", padding: 20, maxWidth : "350px"}}>
       {type == "deactivate" ? `Deactivated teammates will lose access to projects and will be unable to sign in.
        You will be able to reactivate them at any time.` : `
        Reactivated teammates will regain access to assigned projects and will be able to sign in again using their past login credentials.`}

        </div>
        <div style={{display : "flex", flexDirection : "row", flex : 1}}>
        <Button
        style={{textTransform : "none"}}
          onClick={() => handleClose()}
          className="successDialog__soundsGood"
        >
         Go back
        </Button>
        <Button
        style={{textTransform : "none", marginLeft : 10}}
          onClick={() => handleInvite()}
          className="successDialog__soundsGood"
        >
         {type == "activate" ? "Sounds good" :` Yes, I'm sure`}
        </Button>
        </div>
      </div>
   }
    </Dialog>
  );
}
