import DateFnsUtils from '@date-io/date-fns';
import {
  Avatar,
  Button,
  DialogTitle,
  IconButton,
  Tooltip,
} from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import LinearProgress from '@material-ui/core/LinearProgress';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import CancelIcon from '@material-ui/icons/Cancel';
import InfoIcon from '@material-ui/icons/Info';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { gantt } from 'dhtmlx-gantt';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import SupplierSelect from 'src/modules/dynamicScheduling/components/SupplierSelect/SupplierSelect';
import { endDateDecreaseByOneDay } from 'src/modules/dynamicScheduling/utils/ganttConfig';
import AddAssignee from '../../../../../../assets/images/add_assignee.svg';
import { stateContext } from '../../../../../root/context/authentication/authContext';
import SelectListGroup from '../../../../components/SelectCustom/SelectCustom';
import SelectAssignee from '../../../../components/SingleUserSelect/SingleUserSelect';
import TextFieldCustom from '../../../../components/TextFieldCustom/TextFieldCustom';
import EditProjectPlanContext from '../../../../context/editProjectPlan/editProjectPlanContext';
import ProjectPlanContext from '../../../../context/projectPlan/projectPlanContext';
import { permissionKeys } from '../../../../permission/scheduling';
import {
  transformDate,
  transformDateToString,
} from '../../../../utils/ganttDataTransformer';
import EditProjectPlanButtonCalendar from '../editProjectPlanButtonCalendar/editProjectPlanButtonCalendar';
import EditTaskDetailsViewRightPanel from '../EditTaskDetailsViewRightPanel/EditTaskDetailsViewRightPanel';
import { AssigneeType } from '../MenuOperation/PublishedTaskMenu';
import StartTaskComponentPopup from '../StartTaskComponentPopup/StartTaskComponentPopup';
import './EditTaskDetails.scss';

function LinearProgressWithLabel(props: any) {
  return (
    <Box display="flex" alignItems="center" flexDirection="column" p={3}>
      <Box width="100%" mr={3}>
        <Typography
          variant="body2"
          color="textSecondary"
          style={{
            color: '#0C4A47',
            position: 'relative',
            right: '7px',
            fontWeight: 500,
          }}
        >
          Progress : {`${Math.round(props.value)}%`}
        </Typography>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box minWidth={35}></Box>
    </Box>
  );
}

LinearProgressWithLabel.propTypes = {
  value: PropTypes.number.isRequired,
};
const useStyles = makeStyles({
  root: {
    height: '12px',
    width: '275px',
    borderRadius: '12px',
    right: '11px',
    top: '5px',
    boxShadow: 'inset 0px 1px 2px rgba(46, 100, 117, 0.47)',
    '&.MuiLinearProgress-colorPrimary:not(.MuiLinearProgress-buffer)': {
      backgroundColor: '#D5E3E3',
    },
    '& .MuiLinearProgress-colorPrimary': {
      backgroundColor: '#D5E3E3',
    },
    '& .MuiLinearProgress-barColorPrimary': {
      backgroundColor: 'rgba(140, 203, 203, 0.7)',
    },
  },
});
const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const EditTaskDetails = (props: any) => {
  const editProjectPlanContext = useContext(EditProjectPlanContext);
  const {
    updateParentTaskList,
    parentTasks,
    updateTaskStatus,
    partialMoveTaskInToDo,
    partialUpdateLpsStatus,
    moveTaskToInProgress,
    currentTaskConstraint,
    getConstraintsByTaskId,
    updateStartAndEndDate,
    updateEndDateAndDuration,
    updateActualStartDate,
    updateActualStartDateAndActualEndDate,
    updateActualEndDateAndDuration,
    updateTaskAssignee,
    updateLpsStatus,
    clearEditProjectPlanState,
    currentTaskVariances,
    getVariancesByTaskId,
    updateEstimatedEndDateAndDuration,
    updateResponsibleContractor,
  } = editProjectPlanContext;

  const { state: authState }: any = useContext(stateContext);
  const projectPlanContext = useContext(ProjectPlanContext);

  const { open, onClose } = props;
  const {
    currentTask,
    setCurrentTask,
    partialUpdateTasks,
    projectUser,
    summaryTaskProgress,
  } = projectPlanContext;

  const [taskStatusPopup, setTaskStatusPopup] = useState('');
  const [editDuration, setEditDuration] = useState({
    planned: false,
    actual: false,
    estimated: false,
  });

  const [duration, setDuration] = useState({
    planned: 0,
    actual: 0,
    estimated: 0,
  });
  const [assigneeOpen, setAssigneeOpen] = useState(false);

  const [activityId, setActivityId] = useState('');
  const [showBreadcrumbTaskList, setShowBreadcrumbTaskList] = useState(false);
  const [editMode, setEditMode] = useState(true);
  const [isAssigneeMouseover, setIsAssigneeMouseover] = useState(false);

  const [showLpsStatusList, setshowLpsStatusList] = useState(false);
  const [errors, setErrors] = useState({ activityId: '' });
  const [statusOptions, setStatusOption] = useState([
    { value: 'To-Do', label: 'To-Do' },
    { value: 'readyToGo', label: 'To-Do : Ready to Go' },
    { value: 'committed', label: 'To-Do : Committed' },
    { value: 'In-Progress', label: 'In Progress' },
    { value: 'Complete', label: 'Complete' },
  ]);
  const currentTaskConstraintOpen = currentTaskConstraint.filter(
    (task: any) => task.status === 'open'
  );

  const classes = useStyles();
  useEffect(() => {
    if (currentTask) {
      currentTask.actualEndDate =
        currentTask.actualEndDate == 'NA' ? null : currentTask.actualEndDate;
      currentTask.actualStartDate =
        currentTask.actualStartDate == 'NA'
          ? null
          : currentTask.actualStartDate;
    }
    if (currentTask.status === 'To-Do') {
      setStatusOption([
        { value: 'To-Do', label: 'To-Do' },
        { value: 'readyToGo', label: 'To-Do : Ready to Go' },
        { value: 'committed', label: 'To-Do : Committed' },
        { value: 'In-Progress', label: 'In Progress' },
      ]);
    } else if (currentTask.status === 'In-Progress') {
      setStatusOption([
        { value: 'To-Do', label: 'To-Do' },
        { value: 'readyToGo', label: 'To-Do : Ready to Go' },
        { value: 'committed', label: 'To-Do : Committed' },
        { value: 'In-Progress', label: 'In Progress' },
        { value: 'Complete', label: 'Complete' },
      ]);
    } else if (currentTask.status === 'Complete') {
      setStatusOption([
        { value: 'In-Progress', label: 'In Progress' },
        { value: 'Complete', label: 'Complete' },
      ]);
    }
    setDuration({
      planned: currentTask.duration,
      actual: currentTask.actualDuration,
      estimated: currentTask.estimatedDuration,
    });
  }, [currentTask]);

  useEffect(() => {
    if (currentTask.id) {
      updateParentTaskList(currentTask.id);
    }

    if (currentTask.id && open) {
      gantt.updateTask(currentTask.id, currentTask);
    }
  }, [currentTask]);

  useEffect(() => {
    if (currentTask.id) {
      getConstraintsByTaskId(currentTask.id);
    }
  }, [currentTask]);

  useEffect(() => {
    if (currentTask.type === 'wbs') {
      summaryTaskProgress(currentTask.id);
    }
  }, [currentTask]);
  useEffect(() => {
    if (currentTask.id) {
      getVariancesByTaskId(currentTask.id);
    }
  }, [currentTask]);

  const onChange = (e: any) => {
    if (e.target.name === 'status') {
      switch (e.target.value) {
        case 'To-Do':
          if (currentTask.status === 'To-Do') {
            updateLpsStatus(currentTask.id, null);
          } else {
            partialMoveTaskInToDo(currentTask.id);
          }
          break;

        case 'readyToGo':
        case 'committed':
          if (currentTask.status === 'To-Do') {
            updateLpsStatus(currentTask.id, e.target.value);
          } else {
            partialUpdateLpsStatus(currentTask.id, e.target.value);
          }
          break;

        case 'In-Progress':
          if (currentTask.status === 'To-Do') {
            setTaskStatusPopup('In-Progress');
          } else {
            moveTaskToInProgress(currentTask.id, null);
          }
          break;

        case 'Complete':
          setTaskStatusPopup('Complete');
          break;
      }
    }
  };

  const onBreadcrumbsClick = (task: any) => {
    if (
      task.type === 'work_package' ||
      task.type === 'task' ||
      task.type === 'wbs'
    ) {
      setCurrentTask(task);
    }
  };

  const closeBreadcrumbTaskList = (event: any) => {
    if (
      !event.target.matches('edit-task-details__title__breadcrumb__btn-empty')
    ) {
      const dropdowns = document.getElementsByClassName(
        'edit-task-details__title__breadcrumb__btn-empty-menu'
      );

      for (let i = 0; i < dropdowns.length; i++) {
        const openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          setShowBreadcrumbTaskList(false);
        }
      }
    }
  };

  const closeLpsStatusList = (event: any) => {
    if (
      !event.target.matches(
        'edit-task-details__content--header__bottom-panel__group-1__update-status__dropdown'
      )
    ) {
      const dropdowns = document.getElementsByClassName(
        'edit-task-details__content--header__bottom-panel__group-1__update-status__dropdown-menu'
      );

      for (let i = 0; i < dropdowns.length; i++) {
        const openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          setshowLpsStatusList(false);
        }
      }
    }
  };

  // const closeDatePickerOnOutSideClick = (event: any) => {
  //   const childN = document.getElementsByClassName(
  //     '.MuiPickersBasePicker-container'
  //   );

  //   if (event.target.matches('.MuiPickersBasePicker-container')) {
  //     const childNodeArray = document.getElementsByClassName(
  //       'edit-task-details__content--left-panel__dates__planned-start-date-span'
  //     );
  //     console.log('childNodeArray: ', childNodeArray);
  //   }

  //   if (
  //     !event.target.matches(
  //       '.edit-task-details__content--left-panel__dates__planned-start-date-span'
  //     )
  //   ) {
  //     setOpenDatePicker({ start_date: false });
  //   }
  // };

  const constraintIsOpen = () => {
    return (
      currentTaskConstraint.filter(
        (constraint: any) => constraint.status === 'open'
      ).length > 0
    );
  };

  const shouldDisableDate = (day: MaterialUiPickersDate) => {
    return !gantt.isWorkTime(day);
  };

  const onStartDateChange = (startDate: any) => {
    const end_date = gantt.calculateEndDate({
      start_date: startDate,
      duration: currentTask.duration,
    });
    // comment to don't show updated values
    // setCurrentTask({ ...currentTask, start_date: startDate, end_date });

    const date = new Date(end_date);
    date.setDate(new Date(end_date).getDate() - 1);
    // don't update task on change
    // gantt.updateTask(currentTask.id, {
    //   ...currentTask,
    //   end_date: end_date,
    //   start_date: startDate,
    // });

    updateStartAndEndDate(
      currentTask.id,
      transformDate(startDate),
      transformDateToString(date)
    );
  };

  const onEndDateChange = (endDate: any) => {
    const duration = gantt.calculateDuration({
      start_date: currentTask.start_date,
      end_date: moment(endDate).add(1, 'd').startOf('day').toDate(),
    });
    // don't update current task and task in gantt

    // setCurrentTask({
    //   ...currentTask,
    //   end_date: moment.utc(endDate).add(1, 'd').toDate(),
    //   duration: duration,
    // });
    // gantt.updateTask(currentTask.id, {
    //   ...currentTask,
    //   end_date: moment.utc(endDate).add(1, 'd').toDate(),
    //   duration,
    // });
    updateEndDateAndDuration(currentTask.id, transformDate(endDate), duration);
  };

  const onActualStartDateChange = (startDate: any) => {
    const end_date = gantt.calculateEndDate({
      start_date: startDate,
      duration: currentTask.actualDuration - 1,
    });

    // const date = new Date(end_date);
    // date.setDate(new Date(end_date).getDate() - 1);

    if (currentTask.actualEndDate) {
      // setCurrentTask({
      //   ...currentTask,
      //   actualStartDate: startDate,
      //   actualEndDate: end_date,
      // });
      // gantt.updateTask(currentTask.id, {
      //   ...currentTask,
      //   actualEndDate: end_date,
      //   actualStartDate: startDate,
      // });

      updateActualStartDateAndActualEndDate(
        currentTask.id,
        transformDate(startDate),
        transformDateToString(end_date)
      );
    } else {
      // setCurrentTask({
      //   ...currentTask,
      //   actualStartDate: startDate,
      // });
      // gantt.updateTask(currentTask.id, {
      //   ...currentTask,
      //   actualStartDate: startDate,
      // });

      updateActualStartDate(currentTask.id, transformDate(startDate), null);
    }
  };

  const onActualEndDateChange = (endDate: any) => {
    const duration = gantt.calculateDuration({
      start_date: moment(currentTask.actualStartDate).startOf('day').toDate(),
      end_date: moment(endDate).add(1, 'd').startOf('day').toDate(),
    });

    // const date = new Date(end_date);
    // date.setDate(new Date(end_date).getDate() - 1);

    // setCurrentTask({
    //   ...currentTask,
    //   actualDuration: duration,
    //   actualEndDate: endDate,
    // });
    // gantt.updateTask(currentTask.id, {
    //   ...currentTask,
    //   actualEndDate: endDate,
    //   actualDuration: duration,
    // });

    updateActualEndDateAndDuration(
      currentTask.id,
      transformDate(endDate),
      duration
    );
  };

  const onEstimatedEndDateChange = (endDate: any) => {
    const duration = gantt.calculateDuration({
      start_date: moment(currentTask.actualStartDate).startOf('day').toDate(),
      end_date: moment(endDate).add(1, 'd').startOf('day').toDate(),
    });

    updateEstimatedEndDateAndDuration(
      currentTask.id,
      transformDate(endDate),
      duration
    );
  };

  const saveDuration = (e: any, type: any) => {
    if (e.target.value <= 0) {
      setDuration({
        planned: currentTask.duration,
        actual: currentTask.actualDuration,
        estimated: currentTask.estimatedDuration,
      });
      setEditDuration({ planned: false, actual: false, estimated: false });
      return;
    }
    if (type === 'planned') {
      let end_date: any = gantt.calculateEndDate({
        start_date: currentTask.start_date,
        duration: e.target.value - 1,
      });

      let i = 0;
      while (
        !gantt.isWorkTime(
          gantt.date.add(moment(end_date).startOf('day').toDate(), i, 'day')
        )
      ) {
        i++;
      }

      end_date = gantt.date.add(
        moment(new Date(end_date)).startOf('day').toDate(),
        i,
        'day'
      );

      // don't update task duration

      // gantt.updateTask(currentTask.id, {
      //   ...currentTask,
      //   end_date: gantt.calculateEndDate({
      //     start_date: currentTask.start_date,
      //     duration: e.target.value,
      //   }),
      //   duration: e.target.value,
      // });

      updateEndDateAndDuration(
        currentTask.id,
        transformDateToString(end_date),
        e.target.value
      );
    }

    if (type === 'actual') {
      const end_date = gantt.calculateEndDate({
        start_date: currentTask.start_date,
        duration: e.target.value - 1,
      });

      // don't update task duration on change
      // gantt.updateTask(currentTask.id, {
      //   ...currentTask,
      //   actualEndDate: end_date,
      //   actualDuration: e.target.value,
      // });

      updateActualEndDateAndDuration(
        currentTask.id,
        transformDateToString(end_date),
        e.target.value
      );
    }

    if (type === 'estimated') {
      const end_date = gantt.calculateEndDate({
        start_date: moment(new Date(currentTask.actualStartDate))
          .startOf('day')
          .toDate(),
        duration: e.target.value,
      });

      updateEstimatedEndDateAndDuration(
        currentTask.id,
        transformDateToString(endDateDecreaseByOneDay(end_date)),
        e.target.value
      );
    }

    setEditDuration({ planned: false, actual: false, estimated: false });
  };

  const onDurationChange = (event: any) => {
    if (event.target.value <= 0) {
      setDuration({ ...duration, [event.target.name]: '' });
      event.target.value = '';
    } else {
      setDuration({ ...duration, [event.target.name]: event.target.value });
    }
  };

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

  const selectAssignee = (argUser: AssigneeType | null) => {
    if (!argUser) return;
    setAssigneeOpen(false);
    setCurrentTask({
      ...currentTask,
      assigneeName: argUser.name,
      assignedTo: argUser.id,
    });
    updateTaskAssignee([currentTask.id], argUser.id);
  };

  const removeAssignee = async () => {
    await updateTaskAssignee([currentTask.id], null);
    setCurrentTask({
      ...currentTask,
      assigneeName: '-',
      assignedTo: null,
    });
  };
  const handleNavigate = (id: any) => {
    const protocol = location.protocol;
    const host = location.host;
    const url = `${protocol}//${host}`;
    const targetUrl = `${url}/scheduling/library/recipe-plan/${id}`;
    window.open(targetUrl, '_blank');
  };

  const updateContractor = async (contractorDetail: any) => {
    if (contractorDetail !== null) {
      setCurrentTask({
        ...currentTask,
        responsibleContractor: contractorDetail.id,
        tenantCompanyAssociation: { name: contractorDetail.name },
        responsibleCompany: contractorDetail?.name || '-'
      });
    } else {
      setCurrentTask({ ...currentTask, responsibleContractor: null, tenantCompanyAssociation:null });
    }
    await updateResponsibleContractor(
      currentTask.id,
      contractorDetail ? contractorDetail.id : null
    );
  };
  return (
    <Dialog
      data-testid="edit-task-details"
      open={open}
      onClose={() => {
        setShowBreadcrumbTaskList(false);
        onClose(false);
        setCurrentTask({});
        setEditMode(true);
      }}
      area-labelledby="form-dialog-title"
      maxWidth="xl"
      fullWidth={true}
      disableBackdropClick={true}
      className="edit-task-details"
      onClick={(e: any) => {
        closeBreadcrumbTaskList(e);
        closeLpsStatusList(e);
      }}
    >
      <DialogTitle className="edit-task-details__title">
        {/* <div className="edit-task-details__title"> */}
        <div className="edit-task-details__title__breadcrumb">
          {parentTasks.length > 7 ? (
            <div className="breadcrumb">
              <Button
                variant="outlined"
                className="btn-secondary edit-task-details__title__breadcrumb__btn"
                onClick={() => {
                  onBreadcrumbsClick(parentTasks[0]);
                }}
                disabled={!editMode}
              >
                {' '}
                {parentTasks[0].text}
              </Button>
              <span> &gt; </span>
              <div className="edit-task-details__title__breadcrumb__dropdown">
                <a
                  href="#"
                  className="btn-secondary edit-task-details__title__breadcrumb__btn-empty"
                  onClick={() => {
                    if (!editMode) return;
                    setShowBreadcrumbTaskList(!showBreadcrumbTaskList);
                  }}
                >
                  ...
                </a>
                <div
                  id="myDropdown"
                  className={`edit-task-details__title__breadcrumb__btn-empty-menu ${
                    showBreadcrumbTaskList ? 'show' : ''
                  }`}
                >
                  {parentTasks.map((task: any, index: number) => {
                    if (
                      index != 0 &&
                      index != parentTasks.length - 2 &&
                      index != parentTasks.length - 1
                    ) {
                      return (
                        <a
                          key={task.id}
                          href="#"
                          onClick={() => {
                            if (!editMode) return;
                            setShowBreadcrumbTaskList(false);
                            onBreadcrumbsClick(task);
                          }}
                        >
                          {task.text.length > 20
                            ? task.text.substring(0, 17) + '...'
                            : task.text}
                        </a>
                      );
                    }
                  })}
                </div>
              </div>
              <span> &gt; </span>

              <Button
                variant="outlined"
                className="btn-secondary edit-task-details__title__breadcrumb__btn"
                onClick={() => {
                  onBreadcrumbsClick(parentTasks[parentTasks.length - 2]);
                }}
                disabled={!editMode}
              >
                {' '}
                {parentTasks[parentTasks.length - 2].text}
              </Button>
              <span> &gt; </span>
              <Button
                variant="outlined"
                className="btn-secondary edit-task-details__title__breadcrumb__btn"
                onClick={() => {
                  onBreadcrumbsClick(parentTasks[parentTasks.length - 1]);
                }}
                disabled={!editMode}
              >
                {' '}
                {parentTasks[parentTasks.length - 1].text}
              </Button>
            </div>
          ) : (
            <div className="breadcrumb">
              {parentTasks.map((task: any) => (
                <React.Fragment key={task.id}>
                  <Button
                    key={task.id}
                    variant="outlined"
                    className={`btn-secondary edit-task-details__title__breadcrumb__btn  ${
                      task.type === 'project_phase' || task.type === 'project'
                        ? 'edit-task-details__title__breadcrumb__no-cursor'
                        : ''
                    }`}
                    onClick={() => {
                      onBreadcrumbsClick(task);
                    }}
                    disabled={!editMode}
                  >
                    {' '}
                    {task.text.length > 20
                      ? task.text.substring(0, 17) + '...'
                      : task.text}
                  </Button>
                  {task.id != parentTasks[parentTasks.length - 1].id ? (
                    <span> &gt; </span>
                  ) : null}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
        <Button
          data-testid="close-button"
          variant="outlined"
          className="btn-secondary edit-task-details__title__close"
          onClick={() => {
            setShowBreadcrumbTaskList(false);
            clearEditProjectPlanState();
            onClose(false);
            setCurrentTask({});
            setEditMode(true);
          }}
        >
          X
        </Button>
        {/* </div> */}
      </DialogTitle>
      <DialogContent className="edit-task-details__content">
        <div className="edit-task-details__content--header">
          <Tooltip title={currentTask.text}>
            <span
              data-testid="edit-task-details-task-name"
              className="edit-task-details__content--header__task-name"
            >
              {currentTask.text.length > 60
                ? currentTask.text.substring(0, 57) + '...'
                : currentTask.text}
            </span>
          </Tooltip>

          {currentTask.floatValue === 0 ? (
            <span
              data-testid="edit-task-details-task-critical-flag"
              className="edit-task-details__content--header__critical-flag"
            >
              Critical
            </span>
          ) : (
            ''
          )}

          <div className="edit-task-details__content--header__middle-panel">
            {/* <img
              src={CreatedBy}
              data-testid="created-by"
              alt="Created By"
              className="edit-task-details__content--header__middle-panel__icon"
            ></img> */}
            {/* <img
              data-testid="account-circle"
              src={AccountCircle}
              alt="user"
              className="edit-task-details__content--header__middle-panel__icon"
            ></img>
            <span
              data-testid="created-by-name"
              className="edit-task-details__content--header__middle-panel__created-by"
            >
              {currentTask.createdByFirstName}
            </span> */}

            {/* <img
              data-testid="flag"
              src={Flag}
              alt="flag"
              className="edit-task-details__content--header__middle-panel__icon"
            ></img> */}
          </div>
          <div className="edit-task-details__content--header__bottom-panel">
            <div className="edit-task-details__content--header__bottom-panel__group-1">
              {currentTask.type === 'wbs' ? null : currentTask.status !==
                  'Complete' &&
                permissionKeys(currentTask?.assignedTo).create ? (
                <Button
                  data-testid="edit-task-details-start-task"
                  className="btn-primary edit-task-details__content--header__bottom-panel__group-1__start-task"
                  onClick={() => {
                    setTaskStatusPopup(
                      currentTask.status === 'To-Do'
                        ? 'In-Progress'
                        : 'Complete'
                    );
                  }}
                  disabled={!editMode}
                >
                  {currentTask.status === 'To-Do'
                    ? 'Start Task'
                    : 'Complete Task'}
                </Button>
              ) : null}

              <div className="edit-task-details__content--header__bottom-panel__group-1__update-status__dropdown">
                {currentTask.type === 'wbs' ? null : currentTask.status ===
                    'To-Do' &&
                  permissionKeys(currentTask?.assignedTo).create ? (
                  <Button
                    data-testid="edit-task-details-update-status-button"
                    variant="outlined"
                    className="btn-text edit-task-details__content--header__bottom-panel__group-1__update-status"
                    onClick={() => {
                      setshowLpsStatusList(!showLpsStatusList);
                    }}
                    disabled={!editMode}
                  >
                    {currentTask.lpsStatus ? (
                      <span
                        className={` ${
                          currentTask.lpsStatus === 'readyToGo'
                            ? 'edit-task-details__content--header__bottom-panel__group-1__update-status-reactangle-ready'
                            : 'edit-task-details__content--header__bottom-panel__group-1__update-status-reactangle-commit'
                        }`}
                      ></span>
                    ) : null}
                    {currentTask.lpsStatus === 'readyToGo'
                      ? 'Ready to Go'
                      : currentTask.lpsStatus === 'committed'
                      ? 'Committed'
                      : 'Update Status'}
                  </Button>
                ) : (
                  ''
                )}
                <div
                  id="myDropdown"
                  className={`edit-task-details__content--header__bottom-panel__group-1__update-status__dropdown-menu ${
                    showLpsStatusList ? 'show' : ''
                  }`}
                >
                  <a
                    href="#"
                    onClick={() => {
                      if (currentTask.status === 'To-Do') {
                        updateLpsStatus(currentTask.id, 'readyToGo');
                      } else {
                        partialUpdateLpsStatus(currentTask.id, 'readyToGo');
                      }
                      setshowLpsStatusList(false);
                    }}
                  >
                    <span className="edit-task-details__content--header__bottom-panel__group-1__update-status-reactangle-ready-10"></span>
                    <span>Ready to Go</span>
                  </a>
                  <a
                    href="#"
                    onClick={() => {
                      if (currentTask.status === 'To-Do') {
                        updateLpsStatus(currentTask.id, 'committed');
                      } else {
                        partialUpdateLpsStatus(currentTask.id, 'committed');
                      }
                      setshowLpsStatusList(false);
                    }}
                  >
                    <span className="edit-task-details__content--header__bottom-panel__group-1__update-status-reactangle-commit-10"></span>
                    Commit
                  </a>
                </div>
              </div>
              <div></div>
              <div className="edit-task-details__content--header__bottom-panel__group-1__add-assignee-section">
                <>
                  {currentTask?.assigneeName &&
                    currentTask?.assigneeName != '-' &&
                    !assigneeOpen && (
                      <div
                        className="edit-task-details__content--header__bottom-panel__group-1__assigneeName"
                        onMouseEnter={() => setIsAssigneeMouseover(true)}
                        onMouseLeave={() => setIsAssigneeMouseover(false)}
                      >
                        <Tooltip title={currentTask.assigneeName}>
                          <Avatar alt={currentTask.assigneeName} src="/" />
                        </Tooltip>
                        {isAssigneeMouseover &&
                          authState.projectFeaturePermissons
                            ?.canupdateMasterPlan && (
                            <Tooltip title={`Remove Assignee`}>
                              <IconButton
                                className="edit-task-details__content--header__bottom-panel__group-1__assigneeName__btn"
                                onClick={removeAssignee}
                              >
                                <CancelIcon className="edit-task-details__content--header__bottom-panel__group-1__assigneeName__btn__icon" />
                              </IconButton>
                            </Tooltip>
                          )}
                      </div>
                    )}

                  {!assigneeOpen &&
                    currentTask?.assigneeName == '-' &&
                    authState.projectFeaturePermissons?.canupdateMasterPlan && (
                      <Tooltip title="Add assignee">
                        <img
                          data-testid="edit-task-details-add-assignee"
                          src={AddAssignee}
                          onClick={() => setAssigneeOpen(!assigneeOpen)}
                          alt="assignee"
                          className={`edit-task-details__content--header__bottom-panel__group-1__add-assignee  ${
                            currentTask.status === 'Complete'
                              ? 'edit-task-details__content--header__bottom-panel__group-1__add-assignee__task-completed'
                              : ''
                          }`}
                        ></img>
                      </Tooltip>
                    )}

                  {assigneeOpen && (
                    <SelectAssignee
                      selectAssignee={selectAssignee}
                      closeSelectAssignee={() => setAssigneeOpen(false)}
                    />
                  )}
                </>
              </div>
              <div className="edit-task-details__content--header__bottom-panel__group-1__responsibleSupplier">
                {<SupplierSelect updateContractor={updateContractor} />}
              </div>
            </div>

            {currentTask.recipeSetId && (
              <div className="edit-task-details__content--header__bottom-panel__group-2">
                <span className="edit-task-details__content--header__bottom-panel__group-2__item-1">
                  Recipe Set:
                  {currentTask.recipeSetName && (
                    <Tooltip
                      title={
                        currentTask.recipeSetName
                          ? currentTask.recipeSetName
                          : ''
                      }
                    >
                      <b
                        className="edit-task-details__content--header__bottom-panel__group-2__item-1__recepieset"
                        onClick={() => handleNavigate(currentTask.recipeSetId)}
                      >
                        {currentTask.recipeSetName &&
                        currentTask.recipeSetName.length > 50
                          ? currentTask.recipeSetName.substring(0, 47) + '...'
                          : currentTask.recipeSetName}{' '}
                      </b>
                    </Tooltip>
                  )}
                </span>
                {/* <span className="edit-task-details__content--header__bottom-panel__group-2__item-2">
                Recipe: ____
              </span> */}
              </div>
            )}
          </div>
        </div>
        <div className="edit-task-details__content--left-panel">
          {currentTask.type === 'wbs' ? (
            <LinearProgressWithLabel
              value={currentTask.progress}
              {...props}
              classes={{
                root: classes.root,
              }}
            />
          ) : null}
          {/* <TextFieldCustom
            data-testid="task-activityId"
            className="u-margin-bottom-small u-margin-top-small "
            name="text"
            label="ID"
            value={activityId}
            onChange={onChange}
            error={errors.activityId}
            maxLength={20}
          ></TextFieldCustom>

          <TextFieldCustom
            data-testid="task-details-location"
            className="u-margin-bottom-small u-margin-top-small "
            name="text"
            label="Location"
            value="Location"
            onChange={onChange}
            error={errors.activityId}
            maxLength={20}
            disabled="true"
          ></TextFieldCustom> */}

          {/* remove margin-top-small from selectlistgroup when uncommenting id and location */}
          <SelectListGroup
            data-testid="task-detail-status-dropdown"
            className={`u-margin-bottom-small edit-task-details__content--left-panel__status-dropdown u-margin-top-small`}
            onChange={onChange}
            name="status"
            value={
              currentTask.status === 'To-Do'
                ? currentTask.lpsStatus
                  ? currentTask.lpsStatus
                  : 'To-Do'
                : currentTask.status
            }
            label="Status"
            options={statusOptions}
            disabled={
              !editMode
                ? false
                : currentTask.type === 'wbs' ||
                  !permissionKeys(currentTask?.assignedTo).create
            }
            required={false}
          ></SelectListGroup>

          <div className="edit-task-details__content--left-panel__dates">
            <div className="edit-task-details__content--left-panel__dates__heading">
              <div></div>
              <div className="edit-task-details__content--left-panel__dates__heading__planned-title">
                Planned
              </div>
              <div className="edit-task-details__content--left-panel__dates__heading__estimated-title">
                Estimated
              </div>
              <div className="edit-task-details__content--left-panel__dates__heading__actual-title">
                Actual
              </div>
            </div>
            {/* <div className="edit-task-details__content--left-panel__dates__line"></div> */}
            <hr className="edit-task-details__content--left-panel__dates__line"></hr>
            <div className="edit-task-details__content--left-panel__dates__start-date">
              <div className="edit-task-details__content--left-panel__dates__start-date-title">
                Start
              </div>

              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <EditProjectPlanButtonCalendar
                  className="edit-task-details__content--left-panel__dates__planned-start-date"
                  onChange={onStartDateChange}
                  value={moment(currentTask.plannedStartDate)
                    .startOf('day')
                    .toDate()}
                  format="dd MMM"
                  variant="inline"
                  name="planned-start-date"
                  shouldDisableDate={shouldDisableDate}
                  disabled={currentTask.status !== 'To-Do'}
                  readOnly={
                    currentTask.type === 'wbs'
                      ? true
                      : !permissionKeys(currentTask?.assignedTo).create
                  }
                />
              </MuiPickersUtilsProvider>
              <div className="edit-task-details__content--left-panel__dates__actual-start-date"></div>
              {currentTask.actualStartDate ? (
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <EditProjectPlanButtonCalendar
                    className="edit-task-details__content--left-panel__dates__actual-start-date"
                    onChange={onActualStartDateChange}
                    value={currentTask.actualStartDate.replace(/-/g, '/')}
                    format="dd MMM"
                    variant="inline"
                    shouldDisableDate={shouldDisableDate}
                    readOnly={
                      currentTask.type === 'wbs' ||
                      currentTask.status == 'Complete'
                        ? true
                        : !permissionKeys(currentTask?.assignedTo).create
                    }
                  />
                </MuiPickersUtilsProvider>
              ) : (
                <div className="edit-task-details__content--left-panel__dates__actual-start-date">
                  {' '}
                  --{' '}
                </div>
              )}
            </div>
            <hr className="edit-task-details__content--left-panel__dates__line"></hr>
            <div className="edit-task-details__content--left-panel__dates__end-date">
              <div className="edit-task-details__content--left-panel__dates__end-date-title">
                End
              </div>

              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <EditProjectPlanButtonCalendar
                  className={`edit-task-details__content--left-panel__dates__planned-end-date ${
                    currentTask.status == 'Complete' ? 'ml-15' : ''
                  }`}
                  onChange={onEndDateChange}
                  value={moment(currentTask.plannedEndDate)
                    .startOf('day')
                    .toDate()}
                  format="dd MMM"
                  variant="inline"
                  shouldDisableDate={shouldDisableDate}
                  minDate={moment(currentTask.plannedStartDate)
                    .startOf('day')
                    .toDate()}
                  disabled={currentTask.status !== 'To-Do'}
                  readOnly={
                    currentTask.type === 'wbs'
                      ? true
                      : !permissionKeys(currentTask?.assignedTo).create
                  }
                />
              </MuiPickersUtilsProvider>

              {currentTask.estimatedEndDate ? (
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <EditProjectPlanButtonCalendar
                    className="edit-task-details__content--left-panel__dates__estimated-end-date"
                    onChange={onEstimatedEndDateChange}
                    value={currentTask.estimatedEndDate.replace(/-/g, '/')}
                    format="dd MMM"
                    variant="inline"
                    shouldDisableDate={shouldDisableDate}
                    // maxDate={
                    //   new Date().valueOf() <
                    //   new Date(currentTask.estimatedEndDate).valueOf()
                    //     ? new Date(currentTask.estimatedEndDate)
                    //     : new Date()
                    // }
                    minDate={moment(currentTask.actualStartDate)
                      .startOf('day')
                      .toDate()}
                    readOnly={
                      currentTask.type === 'wbs'
                        ? true
                        : !permissionKeys(currentTask?.assignedTo).create
                    }
                  />
                </MuiPickersUtilsProvider>
              ) : (
                <div
                  className={`edit-task-details__content--left-panel__dates__estimated-end-date ${
                    currentTask.status == 'To-Do'
                      ? 'mr-15'
                      : currentTask.status == 'Complete'
                      ? 'mr-10'
                      : 'ml-10'
                  }`}
                >
                  --
                </div>
              )}

              {currentTask.actualEndDate ? (
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <EditProjectPlanButtonCalendar
                    className="edit-task-details__content--left-panel__dates__actual-end-date"
                    onChange={onActualEndDateChange}
                    value={currentTask.actualEndDate.replace(/-/g, '/')}
                    format="dd MMM"
                    variant="inline"
                    shouldDisableDate={shouldDisableDate}
                    minDate={moment(currentTask.actualStartDate)
                      .startOf('day')
                      .toDate()}
                    readOnly={
                      currentTask.type === 'wbs'
                        ? true
                        : !permissionKeys(currentTask?.assignedTo).create
                    }
                  />
                </MuiPickersUtilsProvider>
              ) : (
                <div className="edit-task-details__content--left-panel__dates__actual-end-date-text">
                  {' '}
                  --{' '}
                </div>
              )}
            </div>
            <hr className="edit-task-details__content--left-panel__dates__line"></hr>
            <div className="edit-task-details__content--left-panel__dates__end-date">
              <div className="edit-task-details__content--left-panel__dates__duration-title">
                Duration
              </div>

              {editDuration.planned && currentTask.type !== 'wbs' ? (
                <div className="edit-task-details__content--left-panel__dates__planned-duration-text-field">
                  <TextFieldCustom
                    data-testid="task-duration"
                    name="planned"
                    value={duration.planned + ''}
                    onChange={onDurationChange}
                    onBlur={(e) => saveDuration(e, 'planned')}
                    min={1}
                    type="number"
                    onKeyDown={onKeyDown}
                  ></TextFieldCustom>{' '}
                  days
                </div>
              ) : (
                <div
                  className="edit-task-details__content--left-panel__dates__planned-duration"
                  onClick={() =>
                    currentTask.status === 'To-Do' &&
                    permissionKeys(currentTask?.assignedTo).create
                      ? setEditDuration({
                          planned: true,
                          actual: false,
                          estimated: false,
                        })
                      : ''
                  }
                >
                  {`${currentTask.plannedDuration}  days`}
                </div>
              )}
              {editDuration.estimated &&
              currentTask.estimatedDuration &&
              currentTask.type !== 'wbs' ? (
                <div className="edit-task-details__content--left-panel__dates__planned-duration-text-field">
                  <TextFieldCustom
                    data-testid="task-estimated-duration"
                    name="estimated"
                    value={duration.estimated + ''}
                    onChange={onDurationChange}
                    onBlur={(e) => saveDuration(e, 'estimated')}
                    min={1}
                    type="number"
                    onKeyDown={onKeyDown}
                  ></TextFieldCustom>{' '}
                  days
                </div>
              ) : (
                <div
                  className={`edit-task-details__content--left-panel__dates__estimated-duration ${
                    currentTask.status == 'Complete'
                      ? 'mr-25'
                      : currentTask.status == 'To-Do'
                      ? 'mr-25'
                      : 'mr-10'
                  }`}
                  onClick={() =>
                    currentTask.status === 'In-Progress' &&
                    permissionKeys(currentTask?.assignedTo).create
                      ? setEditDuration({
                          planned: false,
                          actual: false,
                          estimated: true,
                        })
                      : ''
                  }
                >
                  {`${
                    currentTask.estimatedDuration
                      ? currentTask.estimatedDuration + ' days'
                      : '--'
                  }`}
                </div>
              )}

              {editDuration.actual &&
              currentTask.actualDuration &&
              currentTask.type !== 'wbs' ? (
                <div className="edit-task-details__content--left-panel__dates__planned-duration-text-field">
                  <TextFieldCustom
                    data-testid="task-actual-duration"
                    name="actual"
                    value={duration.actual + ''}
                    onChange={onDurationChange}
                    onBlur={(e) => saveDuration(e, 'actual')}
                    min={1}
                    type="number"
                    onKeyDown={onKeyDown}
                  ></TextFieldCustom>{' '}
                  days
                </div>
              ) : (
                <div
                  className="edit-task-details__content--left-panel__dates__actual-duration"
                  // onClick={() =>
                  //   setEditDuration({ planned: false, actual: true })
                  // }
                >
                  {`${
                    currentTask.actualDuration
                      ? currentTask.actualDuration + ' days'
                      : '--'
                  }`}
                </div>
              )}
            </div>
            <hr className="edit-task-details__content--left-panel__dates__line"></hr>
          </div>
          {partialUpdateTasks.filter(
            (task: any) => task.taskId === currentTask.id
          ).length > 0 && (
            <div className=" u-margin-bottom-small u-margin-top-small edit-task-details__content--left-panel__info">
              <InfoIcon className="edit-task-details__content--left-panel__info-icon" />
              <p className="u-margin-left-small">
                These updates will reflect in the Project schedule as the
                Project Plan and Critical Path are updated
              </p>
            </div>
          )}
          <div className=" u-margin-bottom-small edit-task-details__content--left-panel__float-log">
            <span className="edit-task-details__content--left-panel__float-log__float">
              Float: {currentTask.floatValue} days{' '}
            </span>
            {/* <Button className="btn-secondary edit-task-details__content--left-panel__float-log__log">
              View Log
            </Button> */}
          </div>
        </div>
        <div className="edit-task-details__content--right-panel">
          <EditTaskDetailsViewRightPanel
            editMode={editMode}
            setEditMode={setEditMode}
            constraintCount={currentTaskConstraintOpen.length}
            varianceCount={currentTaskVariances.length}
          />
        </div>

        {taskStatusPopup && (
          <StartTaskComponentPopup
            status={taskStatusPopup}
            close={() => {
              setTaskStatusPopup('');
            }}
            currentTask={currentTask}
            shouldDisableDate={shouldDisableDate}
            start={(date: any) => {
              updateTaskStatus(currentTask.id, taskStatusPopup, date);
            }}
            message={
              taskStatusPopup === 'In-Progress'
                ? 'You are about to start this task. Please confirm start date'
                : 'Please confirm End date'
            }
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskDetails;
