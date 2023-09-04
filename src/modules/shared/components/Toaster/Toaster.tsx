import { BehaviorSubject } from 'rxjs';
import { toast, Zoom} from 'react-toastify';
import { ReactElement } from 'react';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import WarningIcon from '@material-ui/icons/Warning';
import CancelIcon from '@material-ui/icons/Cancel';
import InfoIcon from '@material-ui/icons/Info';
import './Toaster.scss';

const notifications = new BehaviorSubject(null);

function SuccessToaster(props: any): ReactElement {
    return (
        <div className="msgtoaster">
           <CheckCircleIcon className="msgtoaster__icon"/> 
           <div className="msgtoaster__text">{props.msg}</div>
        </div>
    )
}

function InfoToaster(props: any): ReactElement {
    return (
        <div className="msgtoaster">
           <InfoIcon className="msgtoaster__icon"/> 
           <div className="msgtoaster__text">{props.msg}</div>
        </div>
    )
}

function WarnToaster(props: any): ReactElement {
    return (
        <div className="msgtoaster">
         <WarningIcon className="msgtoaster__icon"/> 
         <div className="msgtoaster__text"> {props.msg}</div> 
        </div>
    )
}

function ErrorToaster(props: any): ReactElement {
    return (
        <div className="msgtoaster">
         <CancelIcon className="msgtoaster__icon"/> 
         <div className="msgtoaster__text"> {props.msg}</div> 
        </div>
    )
}


class NotificationService {
  notifications = notifications.asObservable();
  configuration = {
    position: toast.POSITION.TOP_RIGHT,
    newestOnTop: true,
    transition: Zoom,
    hideProgressBar:true
  }



  sendNotification = (message: any, type: symbol ) => {
    try {
      if (message) {
        const msg: any = message instanceof String ? message : message.toString();

        switch (type) {
          case AlertTypes.success:
           toast.success(<SuccessToaster msg={msg}/>, this.configuration);
            break;
          case AlertTypes.info:
           toast.info(<InfoToaster msg={msg}/>, this.configuration);
            break;
          case AlertTypes.warn:
           toast.warn(<WarnToaster msg={msg}/>, this.configuration);
            break;
          case AlertTypes.error:
           toast.error(<ErrorToaster msg={msg}/>, this.configuration);
            break;
          default:
           toast(msg, this.configuration);
            break;
        }
      }
    } catch (ex) {
     toast.error(ex.message, this.configuration);
    }
    notifications.next(null);
  }
}

const Notify = new NotificationService();

export default Notify;

export const AlertTypes = Object.freeze({
  success: Symbol('success'),
  info: Symbol('info'),
  warn: Symbol('warn'),
  error: Symbol('error')
});