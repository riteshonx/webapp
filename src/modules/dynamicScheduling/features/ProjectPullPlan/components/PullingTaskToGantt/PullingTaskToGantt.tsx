import DateFnsUtils from '@date-io/date-fns';
import { Avatar, TextField } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { gantt } from 'dhtmlx-gantt';
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import NumberFormat from 'react-number-format';
import GlobalKeyboardDatePicker from 'src/modules/shared/components/GlobalDatePicker/GlobalKeyboardDatePicker';
import { v4 as uuidv4 } from 'uuid';
import { decodeToken } from '../../../../../../services/authservice';
import SelectParentTask from '../../../../components/SelectParentTasks/SelectParentTasks';
import ProjectPlanContext from '../../../../context/projectPlan/projectPlanContext';
import { getTaskTypeName } from '../../../../utils/ganttConfig';
import { transformDateToString } from '../../../../utils/ganttDataTransformer';
import './PullingTaskToGantt.scss';

function PullingTaskToGantt(props: any): ReactElement {
  const [pulledTask, setPulledTask] = useState<any>(null);
  const [startTime, setStartTime] = useState<any>(null);
  const [parentName, setParentName] = useState('');
  const [parentId, setParentId] = useState('');
  const [excludeParentTask, setExcludeParentTask] = useState<any>(['task']);
  const projectPlanContext = useContext(ProjectPlanContext);
  const { newTasksAssignee, setNewTasksAssignee } = projectPlanContext;

  const onClose = () => {
    props.close(false);
  };

  useEffect(() => {
    const pTask = {...props.pulledTask}
    console.log(pTask);
    if(pTask.taskType == 'milestone' 
      || pTask.taskType == 'wbs'
      ||  pTask.taskType == 'project_phase')
    pTask.tenantAssociation = null;
    setPulledTask({ ...pTask });
    getParentId();
  }, []);

  useEffect(() => {
    if (pulledTask) getParentId();
  }, [pulledTask]);

  useEffect(() => {
    if (parentId) {
      const parentTask = gantt.getTask(parentId);
      const childTasks = gantt.getChildren(parentId);
      if (childTasks.length >= 1) {
        const d = gantt.getTask(childTasks[childTasks.length - 1]).end_date;

        // const d1 = moment.utc(d).add(1, 'd').format('YYYY/MM/DD');
        const start_date = new Date(d.valueOf() - 1);
        start_date.setHours(0);
        start_date.setMinutes(0);
        start_date.setSeconds(0);
        changeInStartTime(start_date);
      } else {
        changeInStartTime(parentTask.start_date);
      }
    }
  }, [parentId]);

  const getParentId = () => {
    switch (pulledTask?.taskType) {
      case 'milestone': {
        setExcludeParentTask(['wbs', 'work_package', 'task', 'milestone']);
        break;
      }

      case 'project_phase': {
        setExcludeParentTask(['wbs', 'work_package', 'task', 'milestone']);
        break;
      }

      case 'wbs': {
        setExcludeParentTask(['work_package', 'task', 'milestone']);
        break;
      }

      case 'work_package': {
        setExcludeParentTask(['task', 'milestone']);
        break;
      }

      case 'task': {
        setExcludeParentTask(['milestone']);
        break;
      }
    }
  };

  const addTaskToGantt = () => {
    const newTaskId = uuidv4();
    const taskTypeName = getTaskTypeName(pulledTask.taskType);
    gantt?.addTask(
      {
        id: newTaskId,
        text: pulledTask.taskName,
        start_date: transformDateToString(startTime),
        duration: pulledTask.duration,
        type: pulledTask.taskType,
        typeName: taskTypeName,
        createdBy: decodeToken().userId,
        status: 'To-Do',
        assignedTo:
          pulledTask.taskType == 'task' 
            || pulledTask.taskType == 'work_package'
              ? pulledTask?.createdBy : null,
        assigneeName:
        pulledTask.taskType == 'task' 
          || pulledTask.taskType == 'work_package'
            ? getAssigneeName(pulledTask)
            : '-',
        plannedDuration: pulledTask.duration,
      },
      parentId
    );
    if (pulledTask.taskType == 'task' 
      || pulledTask.taskType == 'work_package') {
      pulledTask?.createdBy
        ? setNewTasksAssignee([
            ...newTasksAssignee,
            { taskId: newTaskId, assigneeId: pulledTask?.createdBy },
          ])
        : null;
    }
    gantt.selectTask(newTaskId);
    gantt.showTask(newTaskId);
    props.close(true);
  };

  const getAssigneeName = (pulledTask: any) => {
    if (pulledTask) {
      const name = pulledTask?.tenantAssociation?.user?.firstName
        ? `${pulledTask?.tenantAssociation?.user?.firstName || ''} ${
            pulledTask?.tenantAssociation?.user?.lastName || ''
          }`
        : pulledTask?.tenantAssociation?.user?.email?.split('@')[0];
      return name;
    }
  };

  const changeInStartTime = (argValue: any) => {
    setStartTime(argValue);
  };

  const setValue = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setPulledTask({ ...pulledTask, [event.target.name]: event.target.value });
  };

  const shouldDisableDate = (day: MaterialUiPickersDate) => {
    return !gantt.isWorkTime(day);
  };

  return (
    <Dialog
      className="PullingTaskToGantt"
      data-testid="pulling-task-popup"
      open={props.open}
      area-labelledby="form-dialog-title"
      PaperComponent={DraggableDialogComponent}
      maxWidth="xs"
      fullWidth={true}
      disableBackdropClick={true}
    >
      <DialogTitle
        style={{ cursor: 'move', backgroundColor: '#FAFAFA' }}
        id="draggable-dialog-title"
      ></DialogTitle>
      <DialogContent className="PullingTaskToGantt__content">
        <div className="PullingTaskToGantt__content__name">
          <label className="PullingTaskToGantt__content__name__label">
            Name <span>*</span>
          </label>
          <TextField
            className="PullingTaskToGantt__content__name__input"
            id="Label-Name"
            name="taskName"
            variant="outlined"
            value={pulledTask?.taskName}
            type="text"
            fullWidth
            onChange={(e) => setValue(e)}
          />
          {pulledTask?.taskName?.length > 20 && 
            <span className="PullingTaskToGantt__content__name__error">Maximum 20 characters is allowed</span>}
        </div>
        <div className="PullingTaskToGantt__content__parent">
          <label className="PullingTaskToGantt__content__parent__label">
            Parent Acitivity <span>*</span>
          </label>
          <SelectParentTask
            selectParent={(id: string) => setParentId(id)}
            excludeParentTask={excludeParentTask}
          ></SelectParentTask>
        </div>
        <div className="PullingTaskToGantt__content__time">
          <div
            className="PullingTaskToGantt__content__time__date"
            style={{
              flexBasis: `${
                pulledTask?.taskType !== 'milestone' ? '50%' : '100%'
              }`,
            }}
          >
            <label className="PullingTaskToGantt__content__time__date__label">
              Start date <span>*</span>
            </label>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <GlobalKeyboardDatePicker
                data-testid="end_date"
                variant="inline"
                inputVariant="outlined"
                value={startTime}
                onChange={(d: any) => {
                  changeInStartTime(d);
                }}
                format="dd MMM yyyy"
                name="startdate"
                placeholder="Select Date"
                shouldDisableDate={shouldDisableDate}
                KeyboardButtonProps={{
                  'aria-label': 'change date',
                }}
              />
            </MuiPickersUtilsProvider>
          </div>
          {pulledTask?.taskType !== 'milestone' ? (
            <div className="PullingTaskToGantt__content__time__duration">
              <label className="PullingTaskToGantt__content__time__duration__label">
                Duration
              </label>
              <div className="PullingTaskToGantt__content__time__duration__field">
                <TextField
                  className="PullingTaskToGantt__content__time__duration__field__input"
                  id="Label-Name"
                  variant="outlined"
                  name="duration"
                  value={pulledTask?.duration}
                  type="text"
                  fullWidth
                  onChange={(e) => setValue(e)}
                  placeholder="Enter duration in no of "
                  InputProps={{
                    inputComponent: NumberFormatCustom,
                  }}
                />
                <div className="PullingTaskToGantt__content__time__duration__field__label">
                  Days
                </div>
              </div>
            </div>
          ) : (
            ''
          )}
        </div>
        {pulledTask?.tenantAssociation && 
          <div className="PullingTaskToGantt__content__user">
            <div className="PullingTaskToGantt__content__user__left">
              <Avatar
                src="/"
                className="PullingTaskToGantt__content__user__left__avatar"
                data-testid="user"
              />
            <div className="PullingTaskToGantt__content__user__left__name">
              {getAssigneeName(pulledTask)}
              {pulledTask?.tenantAssociation?.user?.jobTitle ? (
                <span>, {pulledTask?.tenantAssociation?.user?.jobTitle}</span>
              ) : (
                ''
              )}
            </div>
          </div>
        </div>}

        <div className="PullingTaskToGantt__content__action">
          <Button
            data-testid="create-pulltask-cancel"
            variant="outlined"
            className="btn-text PullingTaskToGantt__content__action__btn"
            onClick={onClose}
            size="small"
          >
            Cancel
          </Button>
          <Button
            data-testid="create-pulltask-add"
            variant="outlined"
            className="btn-primary"
            onClick={addTaskToGantt}
            disabled={
              startTime &&
              pulledTask.taskName &&
              pulledTask.taskName.length <= 20 &&
              parentId &&
              (pulledTask.taskType == 'milestone' || pulledTask.duration)
                ? false
                : true
            }
            size="small"
          >
            Add
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PullingTaskToGantt;

function NumberFormatCustom(props: any) {
  const { inputRef, onChange, ...other } = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: values.value,
          },
        });
      }}
      inputMode="numeric"
      allowNegative={false}
      allowLeadingZeros={false}
      decimalScale={0}
      margin="normal"
      InputLabelProps={{
        shrink: true,
      }}
      name="duration"
      max={999}
      isAllowed={(values) => {
        const { floatValue } = values;
        if (floatValue !== undefined)
          return floatValue > 0 && floatValue < 1000;
        else return true;
      }}
    />
  );
}

function DraggableDialogComponent(props: any) {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} />
    </Draggable>
  );
}
