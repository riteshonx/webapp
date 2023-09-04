import { Close } from "@material-ui/icons";
import "./CloseButton.scss";

const CloseButton = ({ onHandleClose, color }: any) => (
  <div className="closeButton" style = {{color:color}}>
    <Close onClick={onHandleClose} />
  </div>
);

export default CloseButton;
