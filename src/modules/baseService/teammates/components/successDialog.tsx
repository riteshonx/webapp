import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import { blue } from "@material-ui/core/colors";
import { useHistory, useRouteMatch } from "react-router-dom";
import THUMBS_UP from "../../../../assets/images/thumbs-up-left.svg";
import "./successDialog.scss";
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
}

export default function SimpleDialog(props: SimpleDialogProps) {
  const classes = useStyles();
  const { onClose, selectedValue, open, emails } = props;
  const history: any = useHistory();
  const pathMatch: any = useRouteMatch();

  const handleClose = () => {
    // history.push("/base/teammates/lists");
    if (history?.location?.state?.projectId) {
      history.push(
        `/base/project-lists/${history.location.state.projectId}/details`
      );
    } else if (history?.location?.state?.companyId) {
      history.push(
        `/base/companies/${history.location.state.companyId}/details`
      );
    } else {
      history.push("/base/teammates/lists");
    }
  };

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="simple-dialog-title"
      open={open}
    >
      <div className="successDialog__parent">
        <div className="dialog__success">
          <div className="dialog__success__box">
            <img className="img-responsive" src={THUMBS_UP} alt="success" />
          </div>
        </div>
        <h2 className="successDialog__title" id="simple-dialog-title">
          Invite Sent
        </h2>
        <div className="successDialog__worthy">
          We just sent a Slate-worthy invitation to
        </div>
        {emails.map((email: any, index: number) => (
          <div key={index}>{email}</div>
        ))}
        <div style={{ textAlign: "center", paddingTop: 20 }}>
          If teammates are having issues finding an email from us, ask them to
          check their spam folder. We don’t like being sent to spam, but it
          happens to the best of us.
        </div>
        <Button
          onClick={() => handleClose()}
          className="successDialog__soundsGood"
        >
          Sounds Good
        </Button>
      </div>
    </Dialog>
  );
}
