import DateFnsUtils from '@date-io/date-fns';
import {
  Avatar,
  Button,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import CloseIcon from '@material-ui/icons/Cancel';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { gantt } from 'dhtmlx-gantt';
import moment from 'moment';
// import InputLabel from '@material-ui/core/InputLabel';
// import TextField from '@material-ui/core/TextField';
import React, { useEffect, useState } from 'react';
import GlobalKeyboardDatePicker from '../../../shared/components/GlobalDatePicker/GlobalKeyboardDatePicker';
import SelectListGroup from '../SelectCustom/SelectCustom';
import SelectWPRecipe from '../SelectWPRecipe/SelectWPRecipe';
import SelectAssignee from '../SingleUserSelect/SingleUserSelect';
import TextFieldCustom from '../TextFieldCustom/TextFieldCustom';
import './CreateTask.scss';

const CreateTask = (props: any) => {
  const theme = useTheme();

  const [disableAdd, setDisableAdd] = useState(true);
  const [startDate, setStartDate] = useState<any>(null);
  const [endDate, setEndDate] = useState<any>(null);
  const [duration, setDuration] = useState<any>(1);
  const [typeOptions, setTypeOptions] = useState<any>(null);
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<any>({
    start_date: '',
    duration: '',
    end_date: '',
    name: '',
  });
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState<any>(null);
  const [selectedWP, setSelectedWP] = useState('');

  const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));
  const {
    onCloseLightBox,
    task,
    onChangeHandler,
    onDateChangeHandler,
    setCurrentTask,
    setGanttAction,
  } = props;
  const { type, parent: parentId, isFloated, start_date } = task;

  useEffect(() => {
    if (start_date) {
      onStartDateChangeHandler(start_date);
    }
  }, [start_date]);

  useEffect(() => {
    setTypeOptions(getTaskTypeOptions());
  }, [type]);

  useEffect(() => {
    // do nothing

    if (
      (type === 'task' || type === 'work_package') &&
      startDate &&
      duration &&
      text
    ) {
      setDisableAdd(false);
    } else if (
      (type === 'project_phase' || type === 'wbs') &&
      startDate &&
      text
    ) {
      setDisableAdd(false);
      // if (endDate === null || isNaN(new Date(endDate).getTime())) {
      //   setDisableAdd(true);
      //   return;
      // }

      if (errors.name.length > 0) {
        setDisableAdd(true);
      }
    } else if (type === 'milestone' && startDate && text) {
      setDisableAdd(false);
      setDuration(0);
    } else {
      setDisableAdd(true);
    }

    if (startDate === null || isNaN(startDate.getTime())) {
      setDisableAdd(true);
      return;
    }
  }, [startDate, endDate, duration, text, type]);

  const onKeyDown = (e: any) => {
    if (e.charCode === 45) {
      e.preventDefault();
      return false;
    }

    try {
      if (e.charCode === 48 && !duration) {
        e.preventDefault();
        return false;
      }
    } catch (e) {}
  };

  const onChange = (event: any) => {
    if (event.target.name === 'text') {
      try {
        if (event.target.value.trim()) {
          setText(event.target.value);
          if (
            type === 'project_phase' &&
            gantt
              .getTaskBy('type', 'project_phase')
              .filter(
                (task) =>
                  task.text != null &&
                  task.text.trim().toLowerCase() ===
                    event.target.value.trim().toLowerCase()
              ).length > 0
          ) {
            setErrors({
              ...errors,
              name: 'This name has already been used',
            });
          } else {
            setErrors({
              ...errors,
              name: '',
            });
          }
        } else {
          setText('');
          setErrors({
            ...errors,
            name: '',
          });
        }
      } catch (e) {}
    }

    if (event.target.name === 'duration') {
      if (event.target.value <= 0) {
        setDuration(null);
        event.target.value = '';
      } else {
        setDuration(event.target.value);
      }
    }

    if (event.target.name === 'type') {
      setErrors({
        ...errors,
        name: '',
      });
      switch (event.target.value) {
        case 'task':
        case 'work_package':
          setDuration(1);
          break;

        case 'project_phase':
          if (
            gantt
              .getTaskBy('type', 'project_phase')
              .filter((task) => task.text != '' && task.text === text).length >
            0
          ) {
            setErrors({
              ...errors,
              name: 'This name is already have been used',
            });
          } else {
            setErrors({
              ...errors,
              name: '',
            });
          }
          if (startDate) {
            setEndDate(startDate);
            setDuration(
              gantt.calculateDuration({
                start_date: startDate,
                end_date: moment.utc(startDate).add(1, 'd').toDate(),
              })
            );
            onDateChangeHandler(
              new Date(moment(startDate).add(1, 'd').format('YYYY/MM/DD')),
              'end_date',
              'project_phase'
            );
          }

          break;

        case 'wbs':
          if (startDate) {
            setEndDate(startDate);
            const end_date = new Date(
              moment.utc(startDate).add(1, 'd').toDate()
            );

            const duration = gantt.calculateDuration({
              start_date: startDate,
              end_date: end_date,
            });
            setDuration(duration);

            onDateChangeHandler(
              new Date(moment(startDate).add(1, 'd').format('YYYY/MM/DD')),
              'end_date',
              'wbs'
            );
          }
          break;

        default:
        //
      }
    }

    if (
      (event.target.name === 'type' && event.target.value !== 'wbs') ||
      event.target.name !== 'type'
    ) {
      onChangeHandler(event);
    }
  };

  const onStartDateChangeHandler = (d: any) => {
    if (d === null || isNaN(d.getTime())) {
      setStartDate(d);
      setDisableAdd(true);
      return;
    }
    try {
      d.setHours(0);
      d.setMinutes(0);
      d.setSeconds(0);
      setStartDate(d);
      onDateChangeHandler(d, 'start_date', type);
      if (type === 'wbs' || type === 'project_phase') {
        const end_date = gantt.calculateEndDate({
          start_date: new Date(
            `${d.getFullYear()}, ${d.getMonth() + 1}, ${d.getDate()}`
          ),
          duration: duration ? duration : 1,
        });

        setEndDate(moment.utc(end_date).add(-1, 'd'));
        // onDateChangeHandler(end_date, 'end_date');
      }
    } catch (e) {}
  };

  const getTaskTypeOptions = () => {
    // Important note:

    // a phase can have Phase, WBS, WP, Task as its children,
    // a WBS can only have WBS, WP and Task as its children
    // a WP can have only WP and Task as its children
    // A task can only have a task as its child

    // Milestones
    // Milestones will behave like fixed markers on the gantt.

    // Milestones are added under the project level, like phase.

    // Milestones only have one date and are zero duration

    // Milestones do not move with other plan components with auto scheduling. The user will have to move milestones explicitly.

    let type = 'Project';

    if (parentId) {
      type = gantt.getTask(parentId).type;
    }

    switch (type) {
      case 'project_phase':
        // setCurrentTask({ ...task, type: 'wbs' });
        return [
          { value: 'project_phase', label: 'Phase' },
          { value: 'wbs', label: 'Work Breakdown Structure' },
          { value: 'work_package', label: 'Work Package' },
          { value: 'task', label: 'Task' },
        ];

      case 'wbs':
        // setCurrentTask({ ...task, type: 'work_package' });
        return [
          { value: 'wbs', label: 'Work Breakdown Structure' },
          { value: 'work_package', label: 'Work Package' },
          { value: 'task', label: 'Task' },
        ];
      case 'work_package':
        // setCurrentTask({ ...task, type: 'task' });
        return [
          { value: 'work_package', label: 'Work Package' },
          { value: 'task', label: 'Task' },
        ];
      case 'task':
        // setCurrentTask({ ...task, type: '' });
        return [{ value: 'task', label: 'Task' }];

      default:
        // setCurrentTask({ ...task, type: 'project_phase' });
        return [
          { value: 'project_phase', label: 'Phase' },
          { value: 'milestone', label: 'Milestone' },
          { value: 'wbs', label: 'Work Breakdown Structure' },
          { value: 'work_package', label: 'Work Package' },
          { value: 'task', label: 'Task' },
        ];
    }
  };

  const selectAssignee = (argUser: any) => {
    setSelectedAssignee(argUser);
    // setAssigneeOpen(false);
  };

  const removeAssignee = () => {
    setSelectedAssignee('');
    setAssigneeOpen(true);
  };

  const shouldDisableDate = (day: MaterialUiPickersDate) => {
    return !gantt.isWorkTime(day);
  };

  const handleSelectedWp = (wp: any) => {
    if (wp?.text.trim()) {
      if (wp?.id == null) {
        setText(wp.text);
        setSelectedWP('');
        props.onChangeWPRecipeHandler({ text: wp.text });
      } else {
        setSelectedWP(wp);
        setDuration(wp?.duration);
        setText(wp?.text.trim());
        props.onChangeWPRecipeHandler(wp);
      }
    } else {
      setSelectedWP('');
      setText('');
    }
  };

  return (
    <div className="create-task">
      <Dialog
        data-testid="create-popup"
        open={props.open}
        area-labelledby="form-dialog-title"
        maxWidth="xs"
        fullWidth={true}
        disableBackdropClick={true}
        onClose={() => {
          onCloseLightBox('cancel');
          setGanttAction('');
        }}
      >
        <DialogContent>
          <form className="create-task__form">
            <SelectListGroup
              data-testid="type"
              className={`create-task__form u-margin-bottom-medium`}
              onChange={onChange}
              name="type"
              value={type}
              label="Type"
              options={typeOptions}
              required={true}
            ></SelectListGroup>
            {type !== 'work_package' ? (
              <TextFieldCustom
                data-testid="task-name"
                className="create-task__form u-margin-bottom-medium"
                placeholder="Enter Name"
                name="text"
                label="Name"
                value={text}
                onChange={onChange}
                error={errors.name}
                required={true}
                maxLength={50}
                autoFocus
              ></TextFieldCustom>
            ) : (
              <SelectWPRecipe
                selectWP={(wp: any) => {
                  handleSelectedWp(wp);
                }}
              />
            )}

            <div
              className={
                type === 'milestone' ? ' ' : 'create-task__form__duration'
              }
            >
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <div className="create-task__form__duration__startDate">
                  <label className="form-label" htmlFor="start_date">
                    Start Date <span className="required">*</span>
                  </label>
                  <GlobalKeyboardDatePicker
                    data-testid="start_date"
                    className="create-task__form__duration__start-date"
                    variant="inline"
                    inputVariant="outlined"
                    value={startDate}
                    onChange={onStartDateChangeHandler}
                    format="dd-MM-yyyy"
                    name="start_date"
                    placeholder="Pick a date"
                    KeyboardButtonProps={{
                      'aria-label': 'change date',
                    }}
                    shouldDisableDate={shouldDisableDate}
                  />
                </div>
                {/* maxDate=
                {type === 'milestone' ||
                type === 'project_phase' ||
                type === 'wbs'
                  ? end_date
                  : null} */}
                {type === 'project_phase' || type === 'wbs' ? (
                  <div className="create-task__form__duration__startDate">
                    <label className="form-label" htmlFor="end_date">
                      End Date
                    </label>
                    <GlobalKeyboardDatePicker
                      data-testid="end_date"
                      variant="inline"
                      inputVariant="outlined"
                      value={endDate}
                      format="dd-MM-yyyy"
                      name="end_date"
                      placeholder="Pick a date"
                      onChange={(d: any) => {
                        setEndDate(d);
                        if (d === null || isNaN(d?.getTime())) {
                          setDuration(0);
                          onDateChangeHandler(null, 'end_date', type);
                          return;
                        }
                        setDuration(
                          gantt.calculateDuration({
                            start_date: startDate,
                            end_date: moment.utc(d).add(1, 'd').toDate(),
                          })
                        );

                        onDateChangeHandler(
                          new Date(moment.utc(d).add(1, 'd').toDate()),
                          'end_date',
                          type
                        );
                      }}
                      KeyboardButtonProps={{
                        'aria-label': 'change date',
                      }}
                      disabled={!startDate}
                      minDate={startDate}
                      shouldDisableDate={shouldDisableDate}
                    />
                  </div>
                ) : null}
              </MuiPickersUtilsProvider>
              {type === 'work_package' || type === 'task' ? (
                <div className="create-task__form__duration__days">
                  <TextFieldCustom
                    data-testid="duration"
                    placeholder="No. of days"
                    name="duration"
                    type="number"
                    label="Duration "
                    value={duration || ''}
                    onChange={onChange}
                    error={errors.duration}
                    onKeyDown={onKeyDown}
                    required={true}
                    min={1}
                    disabled={selectedWP ? true : false}
                  ></TextFieldCustom>

                  <span className="create-task__form__duration__days__unit">
                    Days
                  </span>
                </div>
              ) : null}
            </div>

            {type === 'task' || type === 'work_package'
              ? !assigneeOpen &&
                !selectedAssignee && (
                  <Button
                    className="btn-text u-margin-top-small create-task__form__owner "
                    size="small"
                    onClick={() => setAssigneeOpen(!assigneeOpen)}
                  >
                    +Add Assignee
                  </Button>
                )
              : null}
            {assigneeOpen && (
              <SelectAssignee
                selectAssignee={selectAssignee}
                selectedAssignee={
                  selectedAssignee
                    ? selectedAssignee
                    : selectedAssignee == null
                    ? null
                    : ''
                }
                closeSelectAssignee={() => setAssigneeOpen(false)}
              />
            )}
            {selectedAssignee && (
              <div className="create-task__form__assignee__info">
                <div className="create-task__form__assignee__info__avatar">
                  <Avatar alt="{assignee.name}" src="" />
                  <IconButton className="create-task__form__assignee__info__avatar__close">
                    <CloseIcon
                      className="create-task__form__assignee__info__avatar__close__icon"
                      fontSize="small"
                      onClick={() => removeAssignee()}
                    />
                  </IconButton>
                </div>

                <div className="create-task__form__assignee__info__name">
                  {selectedAssignee?.name}
                </div>
                <div
                  className="create-task__form__assignee__info__close"
                  data-testid="createTask-removeAssignee"
                ></div>
              </div>
            )}

            <div className="create-task__form__content-bottom u-margin-top-small u-margin-bottom-medium">
              <Button
                data-testid="create-task-cancel"
                variant="outlined"
                className="btn-text create-task__form__cancel"
                onClick={() => {
                  setGanttAction('');
                  onCloseLightBox('cancel');
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-testid="create-task-add"
                variant="outlined"
                className="btn-primary create-task__form__add"
                onClick={() => {
                  setGanttAction('');
                  onCloseLightBox('add', selectedAssignee, selectedWP);
                }}
                disabled={disableAdd}
              >
                Add
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateTask;
