import { ReactElement, useState } from "react";
import {
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@material-ui/core";
import "./AddAssigneeDialog.scss";
import ProjectUserSelect from "src/modules/shared/components/ProjectUserSelect/ProjectUserSelect";
import { match, useRouteMatch } from "react-router-dom";
import { EditViewFormParams } from "../../models/form";
import CloseIcon from "@material-ui/icons/Close";
import DateFnsUtils from "@date-io/date-fns";
import moment from "moment";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import GlobalKeyboardDatePicker from "src/modules/shared/components/GlobalDatePicker/GlobalKeyboardDatePicker";

type Props = {
  isOpen: boolean;
  save: (argNewValue: Array<any>, dueDate: string | null) => void;
  cancel: () => void;
  workflowEnabled?: boolean | null;
  inDueDate?: string | null;
  inAssignees?: Array<string>;
};

const today = moment().format("YYYY-MM-DD");
const AddAssigneeDialog = ({
  isOpen,
  cancel,
  save,
  inDueDate = null,
  inAssignees = [],
  workflowEnabled = true,
}: Props): ReactElement => {
  const [activeStepAssignee, setactiveStepAssignee] = useState<Array<any>>(
    () => {
      //this is the expected
      return inAssignees.map((a: any) => {
        return {
          ...a.user,
          id: a.assignee,
          name: `${a.user?.firstName} ${a.user?.lastName}`,
        };
      });
    }
  );
  const [dueDate, setDueDate] = useState<string | null>(inDueDate);
  const [dateOpen, setDateOpen] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const pathMatch: match<EditViewFormParams> = useRouteMatch();

  const handleClose = () => {
    cancel();
  };
  const saveChanges = () => {
    const usersList = activeStepAssignee.map((item) => item.id);
    save(usersList, dueDate);
  };

  const saveAssigne = (argUsers: Array<any>) => {
    setactiveStepAssignee([...argUsers, ...activeStepAssignee]);
  };

  const closeAddOption = () => {
    // setIsAdduserOpen(false);
  };

  const removeAssignee = (argIndex: number) => {
    activeStepAssignee.splice(argIndex, 1);
    setactiveStepAssignee([...activeStepAssignee]);
  };

  return (
    <Dialog
      fullWidth={true}
      maxWidth={"xs"}
      disableBackdropClick={true}
      open={isOpen}
      onClose={handleClose}
      className="actionDialog"
    >
      {!workflowEnabled && (
        <div className="addDueDateSection">
          <DialogTitle className="addDueDateSection_header">
            Pick Due Date
          </DialogTitle>
          <DialogContent>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <GlobalKeyboardDatePicker
                className="addDueDateSection_datePicker"
                data-testid="status-delayed-date"
                inputVariant="outlined"
                value={dueDate}
                InputProps={{
                  onClick: () => setDateOpen(true),
                  placeholder: "Select date",
                  readOnly: true,
                }}
                onChange={(e: any) => {
                  setDueDate(moment(e).format("YYYY-MM-DD"));
                }}
                format="dd MMM, yyyy"
                name="date"
                minDate={today}
                maxDate={"2099-01-01"}
                open={dateOpen}
                onClose={() => setDateOpen(false)}
                error={false}
                helperText={null}
              />
            </MuiPickersUtilsProvider>
          </DialogContent>
        </div>
      )}
      <div className="addAssigneeSection">
        <DialogTitle className="addAssigneeSection_header">
          Pick Assignee
        </DialogTitle>
        <DialogContent className="addAssigneeSection__body">
          <div className="addAssigneeSection__body__item">
            <ProjectUserSelect
              userIds={activeStepAssignee.map((item) => item.id)}
              feature={Number(pathMatch.params.featureId)}
              save={saveAssigne}
              closeUserSelect={closeAddOption}
            />
          </div>
          <div className="addAssigneeSection__body__list">
            {activeStepAssignee.map((assignee: any, index: number) => (
              <div
                className="addAssigneeSection__body__list__info"
                key={assignee.id}
              >
                <Avatar alt="{assignee.name}" src="" />
                <div className="addAssigneeSection__body__list__info__name">
                  {assignee.name}
                </div>
                <div
                  className="addAssigneeSection__body__list__info__close"
                  data-testid="addassignee-removeAssignee"
                >
                  <IconButton onClick={() => removeAssignee(index)}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </div>
      <DialogActions className="controls">
        <Button onClick={handleClose} className="btn-secondary">
          Close
        </Button>
        <Button
          onClick={saveChanges}
          className="btn-primary"
          disabled={
            activeStepAssignee.length === 0 ||
            (!workflowEnabled && dueDate === null)
          }
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddAssigneeDialog;
