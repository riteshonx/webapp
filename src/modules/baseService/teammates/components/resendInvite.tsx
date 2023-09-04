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
import THUMBS_UP from "../../../../assets/images/thumbs-up-left.svg"
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
  selectedValue?: string;
  onClose?: (value: string) => void;
  emails?: any;
  closeInvite?: () => void;

}

export default function SimpleDialog(props: SimpleDialogProps) {
  const classes = useStyles();
  const { onClose, selectedValue, open, emails, closeInvite } = props;
  const history : any = useHistory();
  const pathMatch:any= useRouteMatch();
  const [resendSuccess, setResendSuccess] = useState(false)
  
  const handleClose = () => {
    closeInvite && closeInvite()
  };

  const handleInvite = async () => {

   
    const tenantId = decodeExchangeToken().tenantId;
    const url = `V1/user/email/INVITATION`;


    const data = {
        email : emails,
        tenant : tenantId 
    }

    try {
      const response = await postApiWithEchange(url, data);
      if (response && response.success == "SUCCESSFUL_EMAIL_TRIGGER") {
        setResendSuccess(true)
        setTimeout(() => {
            setResendSuccess(false)
            closeInvite && closeInvite()
        }, 2000)
      }
    } catch (error) {
      console.log(error);
      return error?.response?.data?.message;
    }
  }

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="simple-dialog-title"
      open={props.open}
    >
     {!resendSuccess && <div className="successDialog__parent">
        <h2 className="successDialog__title" id="simple-dialog-title">
          Resend Invite ?
        </h2>
        <div style={{ textAlign: "center", padding: 20, maxWidth : "350px"}}>
        If your teammate hasn’t received their account activation email for some reason,
         you can resend it right here.


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
          Let's resend
        </Button>
        </div>
      </div>
   }
   {resendSuccess && 
  <div style={{padding : 40}} className="successDialog__parent">
  <img
    className="successDialog__avatar"
    src={
      THUMBS_UP
    }
    alt="user-avatar"
  />
  <h2 className="successDialog__title" id="simple-dialog-title">
    Invitation Sent!
  </h2>
</div>
       }
    </Dialog>
  );
}
