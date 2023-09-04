import { Close } from "@material-ui/icons";
import { ReactElement } from "react";
import './modal.scss'
interface ICdpModal {
  title: string;
  children: ReactElement;
  onClose?: any;
}
function CdpModal ({
  title,
  children,
  onClose
}: ICdpModal): ReactElement {
  return <div className="cdp-modal">
    <div className="cdp-modal-content">
      <div className="cdp-modal-title">
        {title}
      </div>
      <div className="cdp-modal-close" onClick={onClose} >
        <Close />
      </div>
      <div className="cdp-modal-children">
        {children}
      </div>
    </div>
  </div>
}

export default CdpModal