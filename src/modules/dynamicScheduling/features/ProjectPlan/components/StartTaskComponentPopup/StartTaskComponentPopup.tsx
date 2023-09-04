// import {
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogContentText,
// } from '@material-ui/core';
import DateFnsUtils from '@date-io/date-fns';
import { Button } from '@material-ui/core';
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import React, { useEffect, useState } from 'react';
import GlobalKeyboardDatePicker from 'src/modules/shared/components/GlobalDatePicker/GlobalKeyboardDatePicker';
import { getPreviousWorkingDay } from '../../../../utils/ganttConfig';
import './StartTaskComponentPopup.scss';
const StartTaskComponentPopup = (props: any) => {
  const { status, close, start, currentTask, message, shouldDisableDate } =
    props;
  const [date, setDate] = useState<any>(getPreviousWorkingDay());

  useEffect(() => {
    return () => {
      setDate(null);
    };
  }, []);

  return (
    <div className="task-status">
      <div
        id="myModal"
        className={`task-status__modal ${
          status ? 'task-status__modal-show' : ''
        }`}
      >
        <div
          className={`task-status__modal-content ${
            status === 'Complete' ? 'task-status__modal-content-end' : ''
          }`}
        >
          <p
            className={`task-status__modal-heading  ${
              status === 'Complete' ? 'task-status__modal-heading-end' : ''
            }`}
          >
            {message}
          </p>

          {date && (
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <div className="task-status__modal-content-date">
                <label
                  className="form-label task-status__modal-content-date-label"
                  htmlFor="date"
                >
                  {status === 'In-Progress' ? 'Start Date' : 'End Date'}{' '}
                  <span className="required">*</span>
                </label>
                <GlobalKeyboardDatePicker
                  data-testid="task-status-date"
                  className="task-status__modal-content-date-field"
                  inputVariant="outlined"
                  value={date}
                  onChange={(d: any) => {
                    setDate(d);
                  }}
                  format="dd MMM yyyy"
                  name="date"
                  KeyboardButtonProps={{
                    'aria-label': 'change date',
                  }}
                  maxDate={new Date()}
                  shouldDisableDate={shouldDisableDate}
                  minDate={
                    currentTask.status === 'In-Progress'
                      ? new Date(currentTask.actualStartDate.replace(/-/g, '/'))
                      : '1900-01-01'
                  }
                />
              </div>
            </MuiPickersUtilsProvider>
          )}

          <div className="task-status__modal-footer">
            <Button
              className="btn-secondary task-status__modal-footer-cancel"
              onClick={() => {
                setDate(new Date());
                close();
              }}
            >
              Cancel
            </Button>
            <Button
              className="btn-primary"
              onClick={() => {
                start(date);
                setDate(new Date());
                close();
              }}
              autoFocus
            >
              {status === 'In-Progress' ? 'Start' : 'Confirm'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartTaskComponentPopup;
