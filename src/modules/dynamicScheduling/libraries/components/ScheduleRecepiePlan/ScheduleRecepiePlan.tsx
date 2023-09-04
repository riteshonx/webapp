import {
  Button,
  FormControl,
  Popover,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { gantt } from 'dhtmlx-gantt';
import React, { useContext, useEffect, useState, useRef } from 'react';
import { match, useHistory, useRouteMatch } from 'react-router-dom';
import useBeforeunload from 'src/customhooks/useUnload';
import { setEditMode } from 'src/modules/root/context/authentication/action';
import { v4 as uuidv4 } from 'uuid';
import AutoScheduleImg from '../../../../../assets/images/auto-schedule.svg';
import {
  decodeExchangeToken,
  decodeToken,
} from '../../../../../services/authservice';
import { client } from '../../../../../services/graphql';
import { stateContext } from '../../../../root/context/authentication/authContext';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog/ConfirmDialog';
import { CustomPopOver } from '../../../../shared/utils/CustomPopOver';
import Gantt from '../../../components/Gantt/Gantt';
import EditRecipeTaskState from '../../../context/editRecipeTask/editRecipeTaskState';
import RecipeDetailsContext from '../../../context/Recipe/RecipeContext';
import UpdateLink from '../../../features/ProjectPlan/components/UpdateLink/UpdateLink';
import { updateParents } from '../../../utils/ganttConfig';
import { ganttToPayload } from '../../../utils/recepieGanttDataTransformer';
import { GET_RECIPE_LIST } from '../../grqphql/queries/recipe';
import CreateRecipeTask from '../CreateRecipeTask/CreateRecipeTask';
import EditRecipeTaskDetails from './EditRecipeTaskDetails/EditRecipeTaskDetails';
import RecepiePopover from './RecepiePopover/RecepiePopover'
import './ScheduleRecepiePlan.scss';
let ganttEvents: any = {};

export interface Params {
  id: any;
}

let metaData: any = null;

const useStyles = makeStyles((theme) => ({
  noMaxWidth: {
    maxWidth: 'none',
  },
}));

const ScheduleRecepiePlan = (props: any) => {
  const tooltipClass = useStyles(); // css for tooltip
  const pathMatch: match<Params> = useRouteMatch();
  const [anchorE1, setAnchorE1] =
    React.useState<HTMLButtonElement | null>(null);
  const [ganttAction, setGanttAction] = useState('');

  const [defaultTypeValue, setdefaultTypeValue] = useState(0);
  const [recipeNameValue, setdefaultNameValue] = useState('');
  const [descriptionValue, setDescriptionValue] = useState('');
  const [taskId, setTaskId] = useState<number | string>('');
  const [editRecipeName, setEditRecipeName] = useState<boolean>(false);
  const [editTaskDetail, setEditTaskDetail] = useState<boolean>(false);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: null | number;
    mouseY: null | number;
    menu: null | string;
  }>({
    mouseX: null,
    mouseY: null,
    menu: null,
  });

  const { state: authState, dispatch }: any = useContext(stateContext);
  const recipeDetailsContext = useContext(RecipeDetailsContext);

  const {
    recipeDetails,
    recipePlan,
    currentTask,
    recipeMetaData,
    getRecipePlan,
    setCurrentTask,
    saveRecipePlan,
    refreshRecipePlan,
    getRecipeMetaData,
    editRecipeMetaData,
    setNavigatingBack,
    navigatingStatus,
    deleteTasks,
  } = recipeDetailsContext;

  const defaultType: any[] = [
    {
      label: 'Work Package',
      value: 'work_package',
      Disbaled: false,
    },
    {
      label: 'Task',
      value: 'task',
      Disbaled: false,
    },
  ];

  const recipeTypeOptions: any[] = [
    {
      label: 'Non IC',
      value: 'Non IC',
      index: 0,
    },
    {
      label: 'IC',
      value: 'IC',
      index: 1,
    },
  ];

  const [recipeTaskData, setRecipeTaskData] = useState(recipePlan);
  const [linkData, setLinkData] = useState<any>({
    linkId: '',
    predecessor: '',
    successor: '',
    type: '',
    lag: '',
  });

  const [showAddTaskButton, setShowAddTaskButton] = useState(false);
  const [typeOptions, setTypeOptions] = useState(defaultType);
  const openFloatBtn = Boolean(anchorE1);
  const [lagData, setLagData] = useState(0);
  const idFloatBtn = openFloatBtn ? 'simple-popover' : undefined;
  const [typeSelected, setTypeSelected] = useState('');
  const [isTaskSelected, setIsTaskSelected] = useState(false);
  const [isUniqueName, setIsUniqueName] = useState(true);
  const [recipeNameExceed, setRecipeNameExceed] = useState(false);
  const [isEditingRecipe, setIsEditingRecipe] = useState(false);
  const [descriptionExceed, setDescriptionExceed] = useState(false);
  const [confirmErrorMessage, setConfirmErrorMessage] = useState<any>({
    open: false,
    text: '',
    proceed: 'Ok',
  });
  const [navigateConfirmMessage, setNavigateConfirmMessage] = useState<any>({
    open: false,
    text: '',
    proceed: 'Continue',
  });

  // const recipeData = useContext(RecipeContext);
  const [recipeData, setRecipeData] = useState([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [linkId, setLinkId] = useState<number | string>('');
  const [isUpdateLink, setIsUpdateLink] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const classes = CustomPopOver();
  const history = useHistory();
  const popoverRef: any = useRef(null);

  const [popoverObject, setPopoverObject] = useState({
    taskId: '',
    direction: 'top-left',
    pointerX: 0,
    pointerY: 0,
    text: '',
    style: {
      display: 'none',
      top: '0px',
      left: '0px',
    },
  });

  useEffect(() => {
    gantt.clearAll();
    gantt.deleteCalendar('global');
    gantt.config.work_time = false;
    gantt.config.correct_work_time = false;
    ganttDetachEvent();
    ganttAttachEvent();
    getRecipePlan(Number(pathMatch?.params?.id));
    getRecipeMetaData(Number(pathMatch?.params?.id));
    gantt.config.start_date = new Date(2020, 11, 31);
    gantt.config.end_date = new Date(2023, 12, 1);
    gantt.plugins({
      auto_scheduling: true,
    });
    getRecipeList();

    return () => {
      gantt.config.scale_height = 0;
      ganttDetachEvent();
      gantt.clearAll();
      authState.editMode ? publishedOnClose() : null;
      dispatch(setEditMode(false));
    };
  }, []);

  useEffect(() => {
    switch (typeSelected) {
      case 'work_package': {
        const dataProject: any = [
          { value: 'work_package', label: 'Work Package', Disbaled: false },
          { value: 'task', label: 'Task', Disbaled: false },
        ];
        setTypeOptions(dataProject);
        return;
      }

      case 'task': {
        const dataTask: any = [
          { value: 'task', label: 'Task', Disbaled: false },
        ];
        setTypeOptions(dataTask);
        return;
      }

      default: {
        const dataDefault: any = [
          { value: 'work_package', label: 'Work Package', Disbaled: false },
          { value: 'task', label: 'Task', Disbaled: false },
        ];
        setTypeOptions(dataDefault);
      }
    }
  }, [typeSelected]);

  useEffect(() => {
    metaData = recipeMetaData;
    // setIsEditingRecipe(false);
    if (
      recipeMetaData &&
      Number(pathMatch?.params?.id) &&
      decodeExchangeToken().allowedRoles.includes('updateTenantTask')
    ) {
      if (
        decodeToken().userId != recipeMetaData?.edited_by &&
        recipeMetaData?.status == 'draft' &&
        Number(pathMatch?.params?.id) == recipeMetaData?.id &&
        decodeExchangeToken().allowedRoles.includes('updateTenantTask')
      ) {
        let editingUser = 'Someone';
        if (
          recipeMetaData?.tenantAssociationByEditedByTenantid?.user?.firstName
        ) {
          editingUser =
            recipeMetaData?.tenantAssociationByEditedByTenantid?.user
              ?.firstName +
            ' ' +
            recipeMetaData?.tenantAssociationByEditedByTenantid?.user?.lastName;
        } else {
          editingUser =
            recipeMetaData?.tenantAssociationByEditedByTenantid?.user?.email.split(
              '@'
            )[0];
        }
        setIsEditingRecipe(true);
        setConfirmErrorMessage({
          open: true,
          header: 'Warning',
          text:
            editingUser +
            " is already editing the Schedule Recipe. You can't edit the recipe at this time.",
          proceed: 'Ok',
        });
        return;
      } else if (
        !isEditingRecipe &&
        Number(pathMatch?.params?.id) == recipeMetaData?.id &&
        decodeExchangeToken().allowedRoles.includes('updateTenantTask')
      ) {
        editRecipeMetaData(
          'draft',
          decodeToken().userId,
          Number(pathMatch?.params?.id)
        );
        // setIsEditingRecipe(false);
      }
    }

    if (
      recipeMetaData?.status === 'draft' &&
      decodeExchangeToken().allowedRoles.includes('updateTenantTask')
    ) {
      setdefaultNameValue(recipeMetaData?.recipeName);
      setDescriptionValue(recipeMetaData?.description);
      setdefaultTypeValue(recipeMetaData?.recipeType == 'Non IC' ? 0 : 1);
      gantt.config.readonly = false;
      setShowAddTaskButton(true);
      gantt.render();
    } else {
      gantt.config.readonly = true;
      setShowAddTaskButton(false);
      gantt.render();
    }
  }, [recipeMetaData]);

  useBeforeunload((event: any) => {
    if (authState.editMode) {
      event.preventDefault();
      window.addEventListener('unload', publishedOnClose);
    }
  });

  useEffect(() => {
    detachOnTaskClick();
    ganttEvents = {
      ...ganttEvents,
      onTaskClick: attachOnTaskClick(),
    };
  }, [currentTask]);

  useEffect(() => {
    setRecipeTaskData(recipePlan);
  }, [recipePlan]);

  useEffect(() => {
    setRecipeData(recipeData);
  }, [recipeData]);

  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event: any) {
      if (popoverRef?.current && !popoverRef?.current?.contains(event.target)) {
        closeTaskDetailsPopover();
      }
    }
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popoverRef]);

  const openTaskDetailsPopover = (taskId: string, event: any) => {
    // Below check differentiates click of activity panel and Gantt chart
    const isChartTimelineClick = gantt.utils.dom.closest(
      event.target,
      '.gantt_task_line'
    );
    if (isChartTimelineClick) {
      event.stopPropagation && event.stopPropagation();
      let xPos = event.clientX;
      let yPos = event.clientY;
      let direction = '';
      const modalWidth = 300;
      const modalHeight = 60;
      const screenWidth = window.innerWidth;
      if (xPos + modalWidth > screenWidth) {
        xPos = xPos + 20 - modalWidth + 'px';
        direction = 'right';
      } else {
        xPos = xPos - 20 + 'px';
        direction = 'left';
      }

      if (yPos - modalHeight - 60 < 0) {
        yPos = yPos + 10 + 'px';
        direction += '-bottom';
      } else {
        yPos = yPos - 10 - modalHeight + 'px';
        direction += '-top';
      }
      setPopoverObject({
        taskId: taskId,
        direction: direction,
        pointerX: event.clientX,
        pointerY: event.clientY,
        text: gantt.getTask(taskId).text,
        style: {
          display: 'block',
          top: yPos,
          left: xPos,
        },
      });
    }
  };

  const closeTaskDetailsPopover = () => {
    setPopoverObject({
      taskId: '',
      direction: 'top-left',
      pointerX: 0,
      pointerY: 0,
      text: '',
      style: {
        display: 'none',
        top: '0px',
        left: '0px',
      },
    });
  };

  const openMoreDetailTask = (id: string) => {
    closeTaskDetailsPopover()
    if (popoverObject.taskId !== '') {
      setCurrentTask(gantt.getTask(popoverObject.taskId));
      setEditTaskDetail(true);
    }
  };

  // *************************** Attach Gantt Event Start ******************************

  const publishedOnClose = () => {
    dispatch(setEditMode(false));
    if (
      metaData &&
      metaData.status === 'draft' &&
      decodeToken().userId == metaData?.edited_by
    ) {
      editRecipeMetaData(
        'published',
        decodeToken().userId,
        Number(pathMatch?.params?.id),
        metaData?.recipeName,
        metaData?.description,
        metaData?.recipeType
      );
    }
    metaData = null;
  };

  const ganttAttachEvent = () => {
    // attachOnBeforeTaskAdd();
    ganttEvents = {
      ...ganttEvents,
      onTaskCreated: attachOnTaskCreated(),
      onAfterTaskAdd: attachOnAfterTaskAdd(),
      onTaskDrag: attachOnTaskDrag(),
      onAfterTaskDrag: attachOnAfterTaskDrag(),
      onBeforeLightBox: attachOnBeforeLightBox(),
      onAfterLinkAdd: attachOnAfterLinkAdd(),
      onBeforeLinkAdd: attachOnBeforeLinkAdd(),
      onLinkDblClick: attachOnLinkDoubleClick(),
      onContextMenu: attachOnContextMenu(),
      onParse: attachOnParse(),
      onLinkCreated: attachOnLinkCreated(),
      onTaskClick: attachOnTaskClick(),
      onAfterTaskDelete: attachOnAfterTaskDelete(),
      onAfterAutoSchedule: attachOnAfterAutoSchedule(),
      onGanttReady: attachOnGanttReady(),
      onAfterTaskUpdate: attachOnAfterTaskUpdate(),
      onTaskDoubleClick: attachOnTaskDoubleClick(),
      onGanttScroll: attachOnScroll()
    };
  };

  const attachOnScroll = () => {
    return  gantt.attachEvent('onGanttScroll', () => {
        closeTaskDetailsPopover()
      },
      {}
    )
  }

  const attachOnBeforeLinkAdd = () => {
    return gantt.attachEvent(
      'onBeforeLinkAdd',
      (id: string | number, link: any) => {
        // Milestones can’t be linked to other plan components on the gantt
        if (
          gantt.getTask(link.source).parent.toString() === '0' ||
          gantt.getTask(link.target).parent.toString() === '0'
        ) {
          return false;
        }

        if (gantt.isCircularLink(link)) {
          setConfirmErrorMessage({
            open: true,
            header: 'Warning',
            text: 'The relationship you are trying to create is causing circular relationships. Please check the existing relationships',
            proceed: 'Ok',
          });

          return false;
        }

        const source = gantt.getTask(link.source);
        const target = gantt.getTask(link.target);

        const temp = source.$source.filter(
          (e: any) => target.$target.indexOf(e) !== -1
        );
        link.createdBy = decodeToken().userId;
        link.color = 'black';
        return !temp.length;
      },
      {}
    );
  };

  const attachOnAfterLinkAdd = () => {
    return gantt.attachEvent(
      'onAfterLinkAdd',
      (id: string | number, link: any) => {
        try {
          dispatch(setEditMode(true));
          gantt.changeLinkId(id, uuidv4());
        } catch (e) {}
        return true;
      },
      {}
    );
  };

  const attachOnTaskCreated = () => {
    return gantt.attachEvent(
      'onTaskCreated',
      (task: any) => {
        task.text = '';
        task.status = 'To-Do';
        if (!task.type) {
          task.type = 'task';
        }

        task.createdBy = decodeToken().userId;
        task.id = uuidv4();
        task.start_date = gantt.getTask(task.parent).start_date;

        // if(parent && parent?.type == "work_package" && parent.parent != 0 &&  task.type == 'work_package') {
        //   const dataProject: any = [
        //     { name: 'task', label: 'Task',  Disbaled: false },
        //   ];

        //   setTypeOptions(dataProject);
        //  }

        // task.start_date = new Date();
        setGanttAction('create');
        setCurrentTask(task);
        dispatch(setEditMode(true));
        return true;
      },
      {}
    );
  };

  const attachOnBeforeLightBox = () => {
    return gantt.attachEvent(
      'onBeforeLightbox',
      (id: any) => {
        const task = gantt.getTask(id);
        if (task.$new) {
          const parentTask = gantt.getTask(task.parent);
          const childTasks = gantt.getChildren(task.parent);
          const parentTaskType =
            task.parent != 0 ? gantt.getTask(task.parent).type : '';

          if (!task.isFloated) {
            switch (parentTaskType) {
              case 'work_package':
                task.type = 'task';
                break;
              case 'task':
                task.type = 'task';
                break;

              default:
                task.type = 'work_package';
                break;
            }
          }

          //task.type = 'project_phase';
          task.duration = null;
          // task.start_date = gantt.getTask(task.parent).start_date;
          //task.start_date = new Date();
          task.end_date = null;

          if (childTasks.length > 1) {
            const d = gantt.getTask(childTasks[childTasks.length - 2]).end_date;

            // const d1 = moment.utc(d).add(1, 'd').format('YYYY/MM/DD');
            task.start_date = new Date(d.valueOf() - 1);
            task.start_date.setHours(0);
            task.start_date.setMinutes(0);
            task.start_date.setSeconds(0);
          } else {
            task.start_date = parentTask.start_date;
          }

          setCurrentTask(task);

          return false;
        }

        return true;
      },
      {}
    );
  };

  const attachOnBeforeTaskAdd = () => {
    return gantt.attachEvent(
      'onBeforeTaskAdd',
      (id: string | number, task: any) => {
        return true;
      },
      {}
    );
  };

  const attachOnAfterTaskAdd = () => {
    return gantt.attachEvent(
      'onAfterTaskAdd',
      (id: string | number, task: any) => {
        dispatch(setEditMode(true));
        task.floatValue = gantt.getTotalSlack(task?.id);
        updateParents(task?.id);

        const parent = gantt.getTask(task.parent);
        const allTask = gantt.getTaskByTime();
        const wpExist = allTask.filter(
          (item: any) => item.id == task.parent && 'work_package' == item.type
        );
        const taskExist = allTask.filter(
          (item: any) => item.id == task.parent && 'task' == item.type
        );
        if (parent.parent != 0) {
          if (
            (task && task?.type == 'task') ||
            (task &&
              task?.type == 'work_package' &&
              (wpExist.length > 0 ||
                gantt.getTask(task.parent).type == 'work_package'))
          ) {
            if (
              task?.type != 'task' &&
              task &&
              task?.type == 'work_package' &&
              taskExist.length == 0 &&
              taskExist.filter((item: any) => item.type == 'task').length == 0
            ) {
              const dataProject: any = [
                { value: 'task', label: 'Task', Disbaled: false },
              ];
              setIsTaskSelected(false);
              setTypeOptions(dataProject);
              setTypeSelected('task');
            } else {
              setIsTaskSelected(true);
            }
          } else {
            setIsTaskSelected(false);
            setTypeSelected(task?.type);
          }
        }
      },
      {}
    );
  };

  const attachOnTaskDrag = () => {
    return gantt.attachEvent(
      'onTaskDrag',
      function (id: string | number, mode: any, task: any, original: any) {
        //any custom logic here
        //   if(task.parent != 0) {
        if (task.duration == 0) {
          task.duration = 1;
          if (original.start_date == task.start_date) {
            task.end_date.setDate(task.start_date.getDate() + 1);
          } else {
            task.start_date.setDate(task.start_date.getDate() - 1);
          }
        }
        updateParents(id);
        // }
      },
      {}
    );
  };

  const attachOnAfterTaskDrag = () => {
    return gantt.attachEvent(
      'onAfterTaskDrag',
      (id: string | number, mode: any, task: any, original: any) => {
        dispatch(setEditMode(true));
        // do nothing
        /// if(task.parent != 0) {
        //updateParents(task?.id);
        updateParents(id);
        // }
      },
      {}
    );
  };

  const attachOnTaskDoubleClick = () => {
    return gantt.attachEvent(
      'onTaskDblClick',
      (id: string | number, event: any) => {
        closeTaskDetailsPopover()
        if (event.target.classList.value == 'gantt_task_content') {
          setCurrentTask(gantt.getTask(id));
          setEditTaskDetail(true);
        }
        return false;
      },
      {}
    );
  };

  const attachOnLinkDoubleClick = () => {
    return gantt.attachEvent(
      'onLinkDblClick',
      (id: string | number, event: any) => {
        // do nothing
      },
      {}
    );
  };

  const attachOnContextMenu = () => {
    return gantt.attachEvent(
      'onContextMenu',
      (taskId: string, linkId: string, event: any) => {
        // if (taskId) {
        //   if (
        //     gantt.getTask(taskId)?.type == 'task' ||
        //     gantt.getTask(taskId)?.type == 'work_package'
        //   ) {
        //     setContextMenu({
        //       mouseX: event.clientX - 2,
        //       mouseY: event.clientY - 4,
        //       menu: 'constraint',
        //     });
        //     setTaskId(taskId);
        //     return false;
        //   }
        // }
        if (gantt.config.readonly) {
          return false;
        }
        if (linkId) {
          setContextMenu({
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
            menu: 'link',
          });

          // const hasLag = gantt
          //   .getLinks()
          //   .filter((item) => item.id == gantt.getLink(linkId).id);

          // let lag = 0;

          // const targetStartDate = gantt.getTask(
          //   gantt.getLink(linkId).target
          // ).start_date;
          // const targetEndDate = gantt.getTask(
          //   gantt.getLink(linkId).target
          // ).end_date;
          // const sourceStartDate = gantt.getTask(
          //   gantt.getLink(linkId).source
          // ).start_date;
          // const sourceEndDate = gantt.getTask(
          //   gantt.getLink(linkId).source
          // ).end_date;

          // switch (gantt.getLink(linkId).type) {
          //   case '0':
          //     lag = gantt.calculateDuration({
          //       start_date: new Date(sourceEndDate),
          //       end_date: new Date(targetStartDate),
          //       /*,task: task*/
          //     });
          //     // (targetStartDate.getTime() - sourceEndDate.getTime()) /
          //     //  (1000 * 3600 * 24);
          //     break;
          //   case '1':
          //     lag = gantt.calculateDuration({
          //       start_date: new Date(sourceStartDate),
          //       end_date: new Date(targetStartDate),
          //       /*,task: task*/
          //     });
          //     // (targetStartDate.getTime() - sourceStartDate.getTime()) /
          //     // (1000 * 3600 * 24);
          //     break;
          //   case '2':
          //     lag = gantt.calculateDuration({
          //       start_date: new Date(sourceEndDate),
          //       end_date: new Date(targetEndDate),
          //       /*,task: task*/
          //     });
          //     // (targetEndDate.getTime() - sourceEndDate.getTime()) /
          //     // (1000 * 3600 * 24);
          //     break;
          //   case '3':
          //     lag = gantt.calculateDuration({
          //       start_date: new Date(sourceStartDate),
          //       end_date: new Date(targetEndDate),
          //       /*,task: task*/
          //     });
          //     // (targetEndDate.getTime() - sourceStartDate.getTime()) /
          //     // (1000 * 3600 * 24);
          //     break;
          // }

          // setLagData(lag);
          setLinkData({
            linkId: linkId,
            predecessor: gantt.getTask(gantt.getLink(linkId).source).text,
            successor: gantt.getTask(gantt.getLink(linkId).target).text,
            type: gantt.getLink(linkId).type,
            lag: gantt.getLink(linkId).lag,
          });
          setLinkId(linkId);
          setTaskId('');
          return false;
        }

        if (taskId) {
          if (gantt.getTask(taskId).parent.toString() === '0') {
            return true;
          }
          setContextMenu({
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
            menu: 'task',
          });
          setTaskId(taskId);
          return false;
        }
        return true;
      },
      {}
    );
  };

  const attachOnLinkCreated = () => {
    return gantt.attachEvent(
      'onLinkCreated',
      (link) => {
        // do nothing
        dispatch(setEditMode(true));
        return true;
      },
      {}
    );
  };

  const attachOnTaskClick = () => {
    return gantt.attachEvent(
      'onTaskClick',
      (id, e) => {
        openTaskDetailsPopover(id, e)
        // do nothing
        const typInfo = id != null ? gantt.getTask(id) : null;

        const timelineClick = gantt.utils.dom.closest(
          e.target,
          '.gantt_task_line'
        );
        if (
          timelineClick &&
          (gantt.getTask(id).type === gantt.config.types.work_package ||
            gantt.getTask(id).type === gantt.config.types.task)
        ) {
          setCurrentTask(gantt.getTask(id));
        }

        if (typInfo?.type == 'task') {
          setIsTaskSelected(true);
          setTypeSelected('task');
        } else {
          setIsTaskSelected(false);
          setTypeSelected(typInfo?.type);
        }

        gantt.selectTask(id);
        const button = e.target.closest('[data-action]');
        if (button) {
          const action = button.getAttribute('data-action');
          switch (action) {
            case 'add':
              gantt.createTask(null, id);
              break;
          }
          return false;
        }

        return true;
      },
      {}
    );
  };

  const attachOnAfterTaskDelete = () => {
    return gantt.attachEvent(
      'onAfterTaskDelete',
      (id: string | number, item: any) => {
        // do nothing
        try {
          dispatch(setEditMode(true));
          if (gantt.getChildren(item.parent).length > 0) {
            updateParents(gantt.getChildren(item.parent)[0]);
          }
        } catch (e) {}

        return true;
      },
      {}
    );
  };

  const attachOnBeforeGanttRender = () => {
    gantt.attachEvent(
      'onBeforeGanttRender',
      () => {
        // do nothing
        gantt.config.fit_tasks = true;
      },
      {}
    );
  };

  const attachOnAfterAutoSchedule = () => {
    return gantt.attachEvent(
      'onAfterAutoSchedule',
      () => {
        // do nothing
      },
      {}
    );
  };

  const attachOnParse = () => {
    return gantt.attachEvent(
      'onParse',
      () => {
        // do nothing
      },
      {}
    );
  };

  const attachOnGanttReady = () => {
    return gantt.attachEvent(
      'onGanttReady',
      () => {
        // do nothing
        gantt.ext.inlineEditors.attachEvent(
          'onBeforeEditStart',
          (state: any) => {
            const task = gantt.getTask(state.id).type == 'project';
            if (task) {
              return false;
            }
            return true;
          }
        );
      },
      {}
    );
  };

  const attachOnAfterTaskUpdate = () => {
    return gantt.attachEvent(
      'onAfterTaskUpdate',
      (id: string | number, mode: any, task: any, original: any) => {
        dispatch(setEditMode(true));
        //any custom logic here
        updateParents(id);
        return true;
      },
      {}
    );
  };

  // *************************** Attach Gantt Event End ******************************

  // ************************** Detach Gantt Event Start *******************************

  const ganttDetachEvent = () => {
    detachOnAfterTaskAdd();
    detachOnTaskDrag();
    detachOnAfterTaskDrag();
    detachOnBeforeLightBox();
    detachOnBeforeLinkAdd();
    detachOnAfterLinkAdd();
    detachOnTaskCreated();
    detachOnLinkDblClick();
    detachOnContextMenu();
    detachOnParse();
    detachOnLinkCreated();
    detachOnTaskClick();
    detachOnAfterTaskDelete();
    detachOnAfterAutoSchedule();
    detachOnGanttReady();
    detachOnAfterTaskUpdate();
    detachOnTaskDoubleClick();
    detachOnScroll()
  };

  const detachOnScroll = () => {
    if (ganttEvents.onGanttScroll) {
      gantt.detachEvent(ganttEvents.onGanttScroll)
    }
  }

  const detachOnLinkDblClick = () => {
    if (ganttEvents.onLinkDblClick) {
      gantt.detachEvent(ganttEvents.onLinkDblClick);
    }
  };

  const detachOnTaskDblClick = () => {
    if (ganttEvents.onTaskDblClick) {
      gantt.detachEvent(ganttEvents.onTaskDblClick);
    }
  };

  const detachOnTaskCreated = () => {
    if (ganttEvents.onTaskCreated) {
      gantt.detachEvent(ganttEvents.onTaskCreated);
    }
  };

  const detachOnAfterTaskAdd = () => {
    if (ganttEvents.onAfterTaskAdd) {
      gantt.detachEvent(ganttEvents.onAfterTaskAdd);
    }
  };

  const detachOnTaskDrag = () => {
    if (ganttEvents.onTaskDrag) {
      gantt.detachEvent(ganttEvents.onAfterTaskAdd);
    }
  };

  const detachOnAfterTaskDrag = () => {
    if (ganttEvents.onAfterTaskDrag) {
      gantt.detachEvent(ganttEvents.onAfterTaskDrag);
    }
  };

  const detachOnBeforeLightBox = () => {
    if (ganttEvents.onBeforeLightBox) {
      gantt.detachEvent(ganttEvents.onBeforeLightBox);
    }
  };

  const detachOnBeforeLinkAdd = () => {
    if (ganttEvents.onBeforeLinkAdd) {
      gantt.detachEvent(ganttEvents.onBeforeLinkAdd);
    }
  };

  const detachOnAfterLinkAdd = () => {
    if (ganttEvents.onAfterLinkAdd) {
      gantt.detachEvent(ganttEvents.onAfterLinkAdd);
    }
  };

  const detachOnContextMenu = () => {
    if (ganttEvents.onContextMenu) {
      gantt.detachEvent(ganttEvents.onContextMenu);
    }
  };

  const detachOnParse = () => {
    if (ganttEvents.onParse) {
      gantt.detachEvent(ganttEvents.onParse);
    }
  };

  const detachOnLinkCreated = () => {
    if (ganttEvents.onLinkCreated) {
      gantt.detachEvent(ganttEvents.onLinkCreated);
    }
  };

  const detachOnTaskClick = () => {
    if (ganttEvents.onTaskClick) {
      gantt.detachEvent(ganttEvents.onTaskClick);
    }
  };

  const detachOnAfterTaskDelete = () => {
    if (ganttEvents.onAfterTaskDelete) {
      gantt.detachEvent(ganttEvents.onAfterTaskDelete);
    }
  };

  const detachOnAfterAutoSchedule = () => {
    if (ganttEvents.onAfterAutoSchedule) {
      gantt.detachEvent(ganttEvents.onAfterAutoSchedule);
    }
  };

  const detachOnGanttReady = () => {
    if (ganttEvents.onGanttReady) {
      gantt.detachEvent(ganttEvents.onGanttReady);
    }
  };

  const detachOnAfterTaskUpdate = () => {
    if (ganttEvents.onAttachOnAfterTaskUpdate) {
      gantt.detachEvent(ganttEvents.onAttachOnAfterTaskUpdate);
    }
  };

  const detachOnTaskDoubleClick = () => {
    if (ganttEvents.onTaskDoubleClick) {
      gantt.detachEvent(ganttEvents.onTaskDoubleClick);
    }
  };

  // ************************** Detach Gantt Event End *****************************

  const onContextMenuClose = () => {
    setContextMenu({
      mouseX: null,
      mouseY: null,
      menu: null,
    });
  };

  const onContextMenuLinkClick = (action: string) => {
    switch (action) {
      case 'delete':
        setDeleteConfirmation(true);
    }
  };

  const cancelDelete = () => {
    if (contextMenu.menu === 'link') {
      setLinkId('');
      onContextMenuClose();
    }

    if (contextMenu.menu === 'task') {
      setTaskId('');
      onContextMenuClose();
    }
    setDeleteConfirmation(false);
  };

  const deleteLink = () => {
    gantt.deleteLink(linkId);
    cancelDelete();
  };

  const deleteTask = () => {
    deleteTasks([...gantt.getChildren(taskId), taskId]);
    gantt.deleteTask(taskId);
    cancelDelete();
  };

  const onContextMenuTaskClick = (action: string) => {
    switch (action) {
      case 'delete': {
        setDeleteConfirmation(true);
        return;
      }
      case 'link': {
        setIsUpdateLink(true);
        return;
      }
    }
    // onContextMenuClose();
  };

  const cancelUpdateLink = () => {
    setIsUpdateLink(false);
    cancelDelete();
  };

  const updateLink = (event: any) => {
    const link = gantt.getLink(event.linkId);
    // link.lag = +event.lag;
    // link.lag = 0;
    link.type = event.type;
    gantt.updateLink(event.linkId);

    // if (event.lag < 0) {
    //   const targetStartDate = gantt.getTask(
    //     gantt.getLink(linkId).target
    //   ).start_date;
    //   const targetEndDate = gantt.getTask(
    //     gantt.getLink(linkId).target
    //   ).end_date;
    //   const totalLead = link.lag - lagData;

    //   targetEndDate.setDate(targetEndDate.getDate() + totalLead);
    //   gantt.getTask(gantt.getLink(linkId).target).end_date = targetEndDate;

    //   targetStartDate.setDate(targetStartDate.getDate() + totalLead);
    //   gantt.getTask(gantt.getLink(linkId).target).start_date = targetStartDate;
    // } else {
    //   const targetStartDate = gantt.getTask(
    //     gantt.getLink(linkId).target
    //   ).start_date;
    //   const targetEndDate = gantt.getTask(
    //     gantt.getLink(linkId).target
    //   ).end_date;

    //   const totalLag =
    //     link.lag > lagData ? link.lag - lagData : link.lag - lagData;
    //   targetStartDate.setDate(targetStartDate.getDate() + totalLag);
    //   targetEndDate.setDate(targetEndDate.getDate() + totalLag);

    //   gantt.getTask(gantt.getLink(linkId).target).start_date = targetStartDate;
    //   gantt.getTask(gantt.getLink(linkId).target).end_date = targetEndDate;
    // }
    // gantt.updateTask(
    //   gantt.getLink(linkId).target,
    //   gantt.getTask(gantt.getLink(linkId).target)
    // );
    setIsUpdateLink(false);
    cancelDelete();
    // gantt.getTask(taskId).text = "Task #13"; //changes task's data
  };

  const floatBtnAddTask = (type: string, index: any) => {
    handleCloseFloatBtn();
    const selectedParentId = gantt.getSelectedId();
    //  const allTask: any = gantt.getTaskByTime();
    const taskId = gantt.createTask(
      {
        text: 'New' + typeOptions[index].label,
        isFloated: true,
        type: typeOptions[index].value,
      },
      selectedParentId ? selectedParentId : gantt?.getTaskByIndex(0)?.id
    );
    // }
  };

  const handleClickFloatBtn = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (
      gantt.getSelectedId() &&
      gantt.getTask(gantt.getSelectedId()).parent != 0
    ) {
      const typInfo = gantt.getTask(gantt.getSelectedId());
      if (
        typInfo?.type == 'work_package' &&
        gantt.getTask(typInfo?.parent)?.type == 'work_package'
      ) {
        setTypeOptions([{ value: 'task', label: 'Task', Disbaled: false }]);
        setTypeSelected('task');
      } else {
        setTypeSelected(typInfo?.type);
      }
    }

    setAnchorE1(event.currentTarget);
  };

  const handleCloseFloatBtn = () => {
    // const dataProject: any = [
    //   { value: 'work_package', label: 'Work Package',  Disbaled: false },
    //   { value: 'task', label: 'Task',  Disbaled: false },

    // ];
    // setTypeOptions(dataProject);
    setAnchorE1(null);
  };

  const onChangeHandler = (event: any) => {
    let end_date = currentTask.end_date;

    if (
      (currentTask.type === 'work_package' || currentTask.type === 'task') &&
      event.formattedValue &&
      currentTask.start_date &&
      event.value !== ''
    ) {
      end_date = gantt.calculateEndDate({
        start_date: currentTask.start_date,
        duration: event.formattedValue,
      });
    }

    setCurrentTask({
      ...currentTask,
      [event.formattedValue == '' || event.formattedValue
        ? 'duration'
        : event.target.name]:
        event.formattedValue || event.formattedValue == ''
          ? event.formattedValue
          : event.target.value,
      end_date,
    });
  };

  const getMessage = (action: string) => {
    if (action === 'delete') {
      if (linkId) {
        try {
          const link = gantt.getLink(linkId);
          const sourceTaskName = gantt.getTask(link.source).text;
          const targetTaskName = gantt.getTask(link.target).text;

          return `Would you like to delete dependency from ${sourceTaskName} to ${targetTaskName} ?`;
        } catch (e) {}
      }

      if (taskId) {
        try {
          // const taskName = gantt.getTask(taskId).text;

          return `All information about this task will be lost. Are you sure you want to delete the selected items?`;
        } catch (e) {}
      }
    }
  };

  const onCloseLightBox = (action: string, assignee: any = '') => {
    const task = { ...currentTask };
    if (action === 'add') {
      delete task.$new;
      // if (task.type.indexOf('_') != -1) {
      //   const type =
      //     task.type.split('_')[0].charAt(0).toUpperCase() +
      //     task.type.split('_')[0].slice(1) +
      //     ' ' +
      //     task.type.split('_')[1].charAt(0).toUpperCase() +
      //     task.type.split('_')[1].slice(1);
      // } else {
      //   setIsTaskSelected(false);
      // }
      gantt.addTask(task);
      if (task?.type == 'task') gantt.selectTask(gantt.getTaskByIndex(0).id);
    } else {
      gantt.deleteTask(task.id);
      setTypeSelected('');
    }

    setCurrentTask({});
    setGanttAction('');
  };

  const savePlan = () => {
    const tasks = gantt.getTaskByTime();
    const links: any = gantt.getLinks();
    setIsSaving(true);
    links.forEach((element: any) => {
      element.recipeSetId = Number(pathMatch?.params?.id);
    });

    saveRecipePlan(
      ganttToPayload(tasks, links),
      decodeToken().userId,
      Number(pathMatch?.params?.id),
      recipeNameValue,
      descriptionValue,
      recipeTypeOptions[defaultTypeValue].label
    );
    metaData = null;
    dispatch(setEditMode(false));
  };

  const editRecipePlan = () => {
    editRecipeMetaData(
      'draft',
      decodeToken().userId,
      Number(pathMatch?.params?.id)
    );
    // window.location.reload();
  };

  const discardChanges = () => {
    if (decodeExchangeToken().allowedRoles.includes('updateTenantTask')) {
      getRecipePlan(Number(pathMatch?.params?.id));
      setNavigatingBack(false);
      editRecipeMetaData(
        'published',
        decodeToken().userId,
        Number(pathMatch?.params?.id),
        recipeMetaData?.recipeName,
        recipeMetaData?.description,
        recipeMetaData?.recipeType
      );
    }
    dispatch(setEditMode(false));
    setTimeout(() => {
      history.push('/scheduling/library/recipes');
    }, 1000);
  };

  const handleTypeChange = (index: any) => {
    dispatch(setEditMode(true));
    setdefaultTypeValue(index);
  };

  const handleDescriptionChange = (description: any) => {
    dispatch(setEditMode(true));
    setDescriptionValue(description.target.value);
    if (description.target.value.trim().length > 1000) {
      setDescriptionExceed(true);
    } else {
      setDescriptionExceed(false);
    }
  };

  const getRecipeList = async () => {
    try {
      //  dispatch(setIsLoading(true));
      const response: any = await client.query({
        query: GET_RECIPE_LIST,
        variables: {
          limit: 1000,
          offset: 0,
          recipeName: `%${''}%`,
        },
        fetchPolicy: 'network-only',
        context: { role: 'viewTenantTask' },
      });
      const recipeList: any = [];
      response.data.scheduleRecipeSet.forEach((item: any) => {
        const newRecipe: any = {
          createdBy: item.createdBy,
          description: item.description,
          recipeType: item.recipeType,
          recipeName: item.recipeName,
          updatedBy: item.updatedBy,
          duration: item.recipeTasks[0].duration,
          id: item.id,
          createdByUserFullName:
            item?.user?.firstName + ' ' + item?.user?.lastName,
        };
        recipeList.push(newRecipe);
      });
      setRecipeData(recipeList);
      //  dispatch(setIsLoading(false));
    } catch (error: any) {
      console.log(error.message);
      //   dispatch(setIsLoading(false));
    }
  };

  const handleNameChange = (name: any) => {
    dispatch(setEditMode(true));
    const isUnique = recipeData.filter(
      (e: any) =>
        e.recipeName.trim().toLowerCase() ===
        name.target.value.trim().toLowerCase()
    );
    if (
      isUnique.length != 0 &&
      recipeMetaData?.recipeName.trim().toLowerCase() !=
        name.target.value.trim().toLowerCase()
    ) {
      setIsUniqueName(false);
    } else {
      setIsUniqueName(true);
    }
    if (name.target.value.length > 1000) {
      setRecipeNameExceed(true);
    } else {
      setRecipeNameExceed(false);
    }
    setdefaultNameValue(name.target.value);
    recipeTaskData.data[0].text = name.target.value;
    setRecipeTaskData(recipeTaskData);
    gantt.render();
  };

  // const backButton = () => {
  //   if(recipeMetaData?.status === 'draft' &&
  //   (gantt.getTaskByTime().length > recipePlan?.data?.length ||
  //    recipeMetaData?.recipeName != recipeNameValue ||
  //    recipeMetaData?.description != descriptionValue ||
  //    recipeMetaData?.recipeType != recipeTypeOptions[defaultTypeValue].label)) {
  //   setNavigateConfirmMessage({
  //     open: true,
  //     header: 'Confirmation',
  //     text: 'You are moving away from this page. Any changes will be lost. Do you want to ?',
  //     proceed: 'Continue',
  //   });
  // } else {
  //    history.goBack()
  // }

  // }

  const proceedButton = () => {
    // setNavigatingWithChanges(false);
    // setNavigateConfirmMessage({
    //   open: false,
    //   header: '',
    //   text: '',
    //   proceed: 'Continue',
    // });

    // if(navigatingStatus == true &&  decodeExchangeToken().allowedRoles.includes("updateTenantTask")) {
    //   editRecipeMetaData("published", decodeToken().userId, Number(pathMatch?.params?.id),recipeMetaData?.recipeName, recipeMetaData?.description, recipeMetaData?.recipeType);
    // }
    history.goBack();
  };

  const alertUser = (e: any) => {
    e.preventDefault();
    e.returnValue = '';
  };

  const autoSchedule = () => {
    gantt.autoSchedule();
    // calculateTotalFloat();
  };

  const onNameClick = () => {
    if (
      recipeMetaData?.status == 'draft' &&
      !isEditingRecipe &&
      decodeExchangeToken().allowedRoles.includes('updateTenantTask')
    ) {
      setEditRecipeName(true);
    }
  };

  return (
    <div className="scheduleRecepiePlan">
      <div className="scheduleRecepiePlan__metadata">
        <div className="scheduleRecepiePlan__metadata__header">
          <div className="scheduleRecepiePlan__metadata__header__left">
            <div className="scheduleRecepiePlan__metadata__header__left__navBack">
              <ArrowBackIosIcon onClick={proceedButton} />
            </div>
            {!editRecipeName ? (
              <Tooltip
                title={recipeTaskData?.data[0]?.text}
                classes={{ tooltip: tooltipClass.noMaxWidth }}
              >
                <span
                  className="scheduleRecepiePlan__metadata__header__left__pointer "
                  onClick={onNameClick}
                >
                  {' '}
                  {recipeNameValue}
                </span>
              </Tooltip>
            ) : (
              <div className="scheduleRecepiePlan__metadata__header__left__navBackWithMargin">
                <TextField
                  autoFocus
                  variant="outlined"
                  onChange={handleNameChange}
                  value={recipeNameValue}
                  className={
                    'scheduleRecepiePlan__metadata__action__input__textfield scheduleRecepiePlan__metadata__action__input__textfield__name'
                  }
                  onBlur={() => {
                    setEditRecipeName(false);
                  }}
                />
              </div>
            )}{' '}
            {!isUniqueName && recipeMetaData?.status == 'draft' && (
              <div className="scheduleRecepiePlan__metadata__action__input__textfield__warning">
                Recipe Name must be unique
              </div>
            )}
            {recipeNameExceed && recipeMetaData?.status == 'draft' && (
              <div className="scheduleRecepiePlan__metadata__action__input__textfield__warning">
                Maximum 1000 characters are allowed
              </div>
            )}
            {!recipeNameExceed &&
              recipeNameValue.trim() == '' &&
              recipeMetaData?.status == 'draft' &&
              decodeExchangeToken().allowedRoles.includes('updateTenantTask') &&
              authState.editMode && (
                <div className="scheduleRecepiePlan__metadata__action__input__textfield__warning">
                  Recipe Name is required.
                </div>
              )}
          </div>

          <div className="scheduleRecepiePlan__metadata__header__right">
            {recipeMetaData?.status === 'draft' &&
              !isEditingRecipe &&
              decodeExchangeToken().allowedRoles.includes(
                'updateTenantTask'
              ) && (
                <div className="scheduleRecepiePlan__metadata__header__right__actionButton">
                  <Tooltip
                    title={'Schedule activities and update network path'}
                    aria-label="Schedule activities and update network path"
                  >
                    <img
                      src={AutoScheduleImg}
                      alt="AutoSchedule"
                      className="scheduleRecepiePlan__metadata__header__right__actionButton__auto-schedule"
                      onClick={autoSchedule}
                    ></img>
                  </Tooltip>
                  <Button className="btn-primary" onClick={discardChanges}>
                    Discard
                  </Button>
                  <Button
                    className="btn-primary"
                    onClick={savePlan}
                    disabled={
                      recipeNameValue.trim() == '' ||
                      descriptionExceed ||
                      recipeNameExceed ||
                      !isUniqueName
                    }
                  >
                    Save Recipe
                  </Button>
                </div>
              )}
            {recipeMetaData?.status === 'published' &&
              decodeExchangeToken().allowedRoles.includes(
                'updateTenantTask'
              ) && (
                <div className="scheduleRecepiePlan__metadata__header__right__actionButton">
                  <Button className="btn-primary" onClick={editRecipePlan}>
                    Edit Recipe
                  </Button>
                </div>
              )}
          </div>
        </div>
        <div className="scheduleRecepiePlan__metadata__action">
          <div className="scheduleRecepiePlan__metadata__action__input">
            <div className="scheduleRecepiePlan__metadata__action__input__label">
              Description
            </div>
            {recipeMetaData?.status == 'draft' &&
            !isEditingRecipe &&
            decodeExchangeToken().allowedRoles.includes('updateTenantTask') ? (
              <Tooltip title={descriptionValue || ''} aria-label="description">
                <TextField
                  variant="outlined"
                  value={descriptionValue}
                  onChange={handleDescriptionChange}
                  className="scheduleRecepiePlan__metadata__action__input__textfield scheduleRecepiePlan__metadata__action__input__textfield__description"
                />
              </Tooltip>
            ) : (
              <Tooltip
                title={recipeMetaData?.description || ''}
                aria-label="description"
              >
                <span className="scheduleRecepiePlan__metadata__action__input__disabled">
                  {recipeMetaData && recipeMetaData?.description.length > 50
                    ? recipeMetaData?.description.slice(0, 30) + '. . .'
                    : recipeMetaData?.description}
                </span>
              </Tooltip>
            )}
            {descriptionExceed && (
              <div
                style={{ bottom: '0px' }}
                className="scheduleRecepiePlan__metadata__action__input__textfield__descriptionWarning"
              >
                Maximum 1000 characters are allowed
              </div>
            )}
          </div>
          <div className="scheduleRecepiePlan__metadata__action__type">
            <div className="scheduleRecepiePlan__metadata__action__type__label">
              Type
            </div>
            {recipeMetaData?.status == 'draft' &&
            !isEditingRecipe &&
            decodeExchangeToken().allowedRoles.includes('updateTenantTask') ? (
              <FormControl variant="outlined" fullWidth>
                <Select
                  name="recipeType"
                  className="scheduleRecepiePlan__metadata__action__type__dropdown"
                  id="demo-simple-select-outlined"
                  value={defaultTypeValue}
                  //  defaultValue={recipeMetaData?.recipeType}
                  MenuProps={{
                    classes: { paper: classes.root },
                    anchorOrigin: {
                      vertical: 'bottom',
                      horizontal: 'left',
                    },
                    transformOrigin: {
                      vertical: 'top',
                      horizontal: 'left',
                    },
                    getContentAnchorEl: null,
                  }}
                >
                  {recipeTypeOptions &&
                    recipeTypeOptions.map((item: any, index: any) => (
                      <MenuItem
                        key={item.index}
                        className="iscalendar-association__top__checkIcon"
                        value={index}
                        onClick={() => handleTypeChange(index)}
                      >
                        {item.label}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            ) : (
              <span className="scheduleRecepiePlan__metadata__action__input__disabled">
                {recipeMetaData?.recipeType}
              </span>
            )}
            {/*   <TextField value={recipeMetaData?.recipeType}  variant="outlined" className={`scheduleRecepiePlan__metadata__action__type__textfield ${recipeMetaData?.status != 'draft' ? 'scheduleRecepiePlan__metadata__action__input__disabled' : null }` } />*/}
          </div>
        </div>
      </div>
      {/*//    {  projectPlanDataCleared && (*/}

      <div style={{ height: 'calc(100% - 130px)' }}>
        <Gantt
          tasks={recipeTaskData}
          cpCalculation={false}
          lookAheadStatus={false}
          setCLookAheadWeek={null}
          lookAheadView={null}
          showAddTaskButton={showAddTaskButton}
          isRecepiePlan={true}
          isEditingRecipe={isEditingRecipe}
        />
      </div>
      {/*}  //      )
/ */}

      {ganttAction === 'create' ? (
        <CreateRecipeTask
          open={true}
          task={currentTask}
          typeOptions={typeOptions}
          onChangeHandler={onChangeHandler}
          onCloseLightBox={onCloseLightBox}
        />
      ) : null}

      {confirmErrorMessage.open && (
        <ConfirmDialog
          data-testid="confirmErrorMessage"
          open={confirmErrorMessage.open}
          message={{
            header: confirmErrorMessage.header,
            text: confirmErrorMessage.text,
            proceed: confirmErrorMessage.proceed,
          }}
          proceed={() => {
            setConfirmErrorMessage({
              open: false,
              text: '',
              header: '',
              proceed: 'Ok',
            });
          }}
        />
      )}

      {isEditingRecipe && (
        <ConfirmDialog
          data-testid="confirmErrorMessage"
          open={confirmErrorMessage.open}
          message={{
            header: confirmErrorMessage.header,
            text: confirmErrorMessage.text,
            proceed: confirmErrorMessage.proceed,
          }}
          proceed={() => {
            setConfirmErrorMessage({
              open: false,
              text: '',
              header: '',
              proceed: 'Ok',
            });
          }}
        />
      )}

      {navigateConfirmMessage.open && (
        <ConfirmDialog
          data-testid="confirmErrorMessage"
          open={navigateConfirmMessage.open}
          message={{
            header: navigateConfirmMessage.header,
            text: navigateConfirmMessage.text,
            cancel: 'Go back',
            proceed: navigateConfirmMessage.proceed,
          }}
          close={() => {
            setNavigateConfirmMessage({
              open: false,
              text: '',
              header: '',
              proceed: 'Continue',
            });
          }}
          proceed={proceedButton}
        />
      )}

      <ConfirmDialog
        data-testid="delete-confirm"
        open={deleteConfirmation}
        message={{
          text: getMessage('delete'),
          cancel: 'Cancel',
          proceed: 'Delete',
        }}
        close={cancelDelete}
        proceed={() => {
          if (linkId) {
            deleteLink();
          }
          if (taskId) {
            deleteTask();
          }
        }}
      />

      {isUpdateLink && (
        <UpdateLink
          data-testid="updateLinkPopUp"
          open={isUpdateLink}
          linkData={linkData}
          close={cancelUpdateLink}
          proceed={updateLink}
          isRecipe={true}
        />
      )}
      {contextMenu.mouseY !== null ? (
        <Menu
          open={contextMenu.mouseY !== null}
          onClose={onContextMenuClose}
          anchorReference="anchorPosition"
          anchorPosition={
            contextMenu.mouseY !== null && contextMenu.mouseX !== null
              ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
              : undefined
          }
        >
          {contextMenu.menu === 'link' ? (
            <div>
              <MenuItem
                data-testid="deletelink"
                onClick={() => {
                  onContextMenuLinkClick('delete');
                }}
              >
                {' '}
                <span style={{ color: '#B72D2D' }}>Delete</span>
              </MenuItem>
              <MenuItem
                data-testid="link"
                onClick={() => {
                  onContextMenuTaskClick('link');
                }}
              >
                {' '}
                <span style={{ color: '#B72D2D' }}>Edit</span>
              </MenuItem>
            </div>
          ) : contextMenu.menu === 'task' ? (
            <MenuItem
              data-testid="deletetask"
              onClick={() => {
                onContextMenuTaskClick('delete');
              }}
            >
              {' '}
              <span style={{ color: '#B72D2D' }}>Delete</span>
            </MenuItem>
          ) : null}

          {/* {contextMenu.menu == 'constraint' ? (
                <MenuItem
                  data-testid="addConstraint"
                  onClick={() => {
                    onContextMenuTaskClick('constraint');
                  }}
                >
                  {' '}
                  <span style={{ color: '#B72D2D' }}>Add Constraint</span>
                </MenuItem>
              ) : null} */}
        </Menu>
      ) : null}
      {recipeMetaData?.status === 'draft' &&
        !isTaskSelected &&
        !isEditingRecipe &&
        decodeExchangeToken().allowedRoles.includes('updateTenantTask') && (
          <Tooltip title={'Add activities'} aria-label="Add activities">
            <div className="recepiePlanFloatingBtn">
              <Button onClick={handleClickFloatBtn}>
                <AddIcon
                  style={{
                    color: 'white',
                    position: 'absolute',
                    right: '26px',
                    top: '3px',
                    fontSize: '30px',
                  }}
                />
              </Button>
              <Popover
                id={idFloatBtn}
                open={openFloatBtn}
                anchorEl={anchorE1}
                className="recepiePlanFloatingBtn__columnName"
                onClose={handleCloseFloatBtn}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
              >
                <div>
                  {typeOptions &&
                    typeOptions.map((item: any, index: any) => (
                      <Typography
                        key={item.label}
                        className={`recepiePlanFloatingBtn__columnName__typography ${
                          item.Disbaled
                            ? 'recepiePlanFloatingBtn__columnName__disabledColumn'
                            : ''
                        }`}
                        onClick={() => floatBtnAddTask(item.label, index)}
                      >
                        {item.label}{' '}
                      </Typography>
                    ))}
                </div>
              </Popover>
            </div>
          </Tooltip>
        )}

      {editTaskDetail && (
        <EditRecipeTaskState>
          <EditRecipeTaskDetails
            open={editTaskDetail}
            onClose={setEditTaskDetail}
            isEditingRecipe={isEditingRecipe}
          ></EditRecipeTaskDetails>
        </EditRecipeTaskState>
      )}
      {
        <div
          ref={popoverRef}
          className={'scheduleRecepiePlan__popover ' + popoverObject.direction}
          style={popoverObject.style}
        >
          <RecepiePopover text={popoverObject.text} taskId={popoverObject.taskId} onClick={openMoreDetailTask} />
        </div>
      }
    </div>
  );
};

export default ScheduleRecepiePlan;
