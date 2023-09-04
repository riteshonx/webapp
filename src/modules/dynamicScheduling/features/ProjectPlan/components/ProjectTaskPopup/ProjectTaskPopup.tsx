import DateFnsUtils from '@date-io/date-fns';
import Button from '@material-ui/core/Button';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { gantt } from 'dhtmlx-gantt';
import React, { useContext, useEffect, useState } from 'react';
import GlobalKeyboardDatePicker from 'src/modules/shared/components/GlobalDatePicker/GlobalKeyboardDatePicker';
import ProjectPlanContext from '../../../../context/projectPlan/projectPlanContext';
import './ProjectTaskPopup.scss';

interface IProps {
  isOpen: boolean;

  close: () => void;
  task: any;
}

const ProjectTaskPopup = ({ isOpen, close, task }: IProps) => {
  const [fullWidth] = React.useState(true);
  const [maxWidth] = React.useState<DialogProps['maxWidth']>('xs');
  const projectPlanContext = useContext(ProjectPlanContext);
  const {
    currentTask,
    projectScheduleMetadata,
    updateProjectScheduleMetaData,
  } = projectPlanContext;
  const [contractualDates, setContractualDates] = useState<any>({
    contractualStartDate: null,
    contractualEndDate: null,
    update: false,
  });

  useEffect(() => {
    setContractualDates({
      contractualStartDate: projectScheduleMetadata.contractualStartDate,
      contractualEndDate: projectScheduleMetadata.contractualEndDate,
      update: false,
    });
  }, [projectScheduleMetadata]);

  useEffect(() => {
    if (
      contractualDates.contractualStartDate &&
      contractualDates.contractualEndDate &&
      contractualDates.update
    ) {
      updateProjectScheduleMetaData(contractualDates);
    }
  }, [contractualDates]);
  const shouldDisableDate = (day: MaterialUiPickersDate) => {
    return !gantt.isWorkTime(day);
  };

  const onDateChangeHandler = (d: any, target: any) => {
    setContractualDates({ ...contractualDates, [target]: d, update: true });
  };

  const getDateInString = (d: Date, dateType: string | null = null) => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const date = new Date(d);

    if (dateType === 'end_date') {
      date.setDate(new Date(d).getDate() - 1);
    }

    let stringDate = '';
    try {
      if (d) {
        stringDate =
          date.getDate() +
          ' ' +
          months[date.getMonth()] +
          ' ' +
          date.getFullYear();
        return stringDate;
      } else {
        return '---';
      }
    } catch (error: any) {
      return '---';
    }
  };
  return (
    <React.Fragment>
      <Dialog
        data-testid="project-task-popup"
        className="project-task-popup"
        fullWidth={fullWidth}
        maxWidth={maxWidth}
        disableBackdropClick={true}
        open={isOpen}
        aria-labelledby="max-width-dialog-title"
      >
        <DialogTitle
          data-testid="project-task-popup-title"
          className="project-task-popup__header"
          id="max-width-dialog-title"
        >
          <div className="project-task-popup__header__title-btn">
            <Button
              data-testid="close-button"
              variant="outlined"
              className="btn-secondary project-task-popup__header__title-btn-close"
              onClick={close}
            >
              X
            </Button>
          </div>

          <div className="project-task-popup__header__title-text">
            <span>{currentTask.text}</span>
          </div>
        </DialogTitle>
        <DialogContent
          className="project-task-popup__body"
          data-testid="project-task-popup-content"
        >
          <div className="project-task-popup__body-content-grid-container">
            <div className="project-task-popup__body-content-grid-left">
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <div className="">
                  <label className="form-label" htmlFor="contractualStartDate">
                    Baseline Start Date
                  </label>
                  <GlobalKeyboardDatePicker
                    data-testid="baseline_start_date"
                    className="project-task-popup__body-content-datepicker project-task-popup__body-content-grid-left-contractualStartDate"
                    variant="inline"
                    inputVariant="outlined"
                    value={new Date(contractualDates.contractualStartDate)}
                    onChange={(d: any) => {
                      onDateChangeHandler(d, 'contractualStartDate');
                    }}
                    format="dd-MM-yyyy"
                    name="contractualStartDate"
                    placeholder="Pick a date"
                    KeyboardButtonProps={{
                      'aria-label': 'change date',
                    }}
                    shouldDisableDate={shouldDisableDate}
                    disabled={gantt.config.readonly}
                  />
                </div>

                <div className="">
                  <label className="form-label" htmlFor="contractualEndDate">
                    Baseline End Date
                  </label>
                  <GlobalKeyboardDatePicker
                    data-testid="baseline_end_date"
                    className="project-task-popup__body-content-datepicker"
                    variant="inline"
                    inputVariant="outlined"
                    value={new Date(contractualDates.contractualEndDate)}
                    format="dd-MM-yyyy"
                    name="contractualEndDate"
                    placeholder="Pick a date"
                    onChange={(d: any) => {
                      onDateChangeHandler(d, 'contractualEndDate');
                    }}
                    KeyboardButtonProps={{
                      'aria-label': 'change date',
                    }}
                    shouldDisableDate={shouldDisableDate}
                    disabled={gantt.config.readonly}
                    minDate={new Date(contractualDates.contractualStartDate)}
                  />
                </div>
              </MuiPickersUtilsProvider>

              <div className="project-task-popup__body-content-grid-left-plannedActualDates">
                <table className="project-task-popup__body-content-grid-left-plannedActualDates__table">
                  <tr className="project-task-popup__body-content-grid-left-plannedActualDates__table__head">
                    <th className="project-task-popup__body-content-grid-left-plannedActualDates__table__head__th"></th>
                    <th className="project-task-popup__body-content-grid-left-plannedActualDates__table__head__th project-task-popup__body-content-grid-left-plannedActualDates__table__head__th-1">
                      Planned
                    </th>
                    <th className="project-task-popup__body-content-grid-left-plannedActualDates__table__head__th project-task-popup__body-content-grid-left-plannedActualDates__table__head__th-2 ">
                      Actual
                    </th>
                  </tr>

                  <tr className="project-task-popup__body-content-grid-left-plannedActualDates__table__body">
                    <td className="project-task-popup__body-content-grid-left-plannedActualDates__table__body__td project-task-popup__body-content-grid-left-plannedActualDates__table__body__td-1">
                      Start Date
                    </td>
                    <td className="project-task-popup__body-content-grid-left-plannedActualDates__table__body__td">
                      {' '}
                      {getDateInString(currentTask.plannedStartDate)}
                    </td>
                    <td className="project-task-popup__body-content-grid-left-plannedActualDates__table__body__td">
                      {''}
                      {getDateInString(currentTask.actualStartDate)}
                    </td>
                  </tr>
                  <tr className="project-task-popup__body-content-grid-left-plannedActualDates__table__body">
                    <td className="project-task-popup__body-content-grid-left-plannedActualDates__table__body__td project-task-popup__body-content-grid-left-plannedActualDates__table__body__td-1">
                      End Date
                    </td>
                    <td className="project-task-popup__body-content-grid-left-plannedActualDates__table__body__td">
                      {' '}
                      {getDateInString(currentTask.plannedEndDate)}
                    </td>
                    <td className="project-task-popup__body-content-grid-left-plannedActualDates__table__body__td">
                      {' '}
                      {getDateInString(currentTask.actualEndDate)}
                    </td>
                  </tr>
                </table>
              </div>
            </div>
            {/* <div className="project-task-popup__body-content-grid-right"></div> */}
          </div>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default ProjectTaskPopup;
