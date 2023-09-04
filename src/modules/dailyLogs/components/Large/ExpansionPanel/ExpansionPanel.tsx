import { ReactElement, useState } from "react";
import Plus from "@material-ui/icons/Add";
import Minus from "@material-ui/icons/Remove";
import "./ExpansionPanel.scss";

function ExpansionPanel(props: any): ReactElement {
  const [open, setOpen] = useState(props.open);
  return (
    <div className="expansion-panel">
      <div className="expansion-panel__header" onClick={() => setOpen(!open)}>
        <h5>{props.title}</h5>
        {open ? <Minus fontSize="small" /> : <Plus fontSize="small" />}
      </div>
      {open && (
        <div className="expansion-panel__content">
          {props.slot.length ? props.slot : "No filter attributes found"}{" "}
        </div>
      )}
    </div>
  );
}

export default ExpansionPanel;
