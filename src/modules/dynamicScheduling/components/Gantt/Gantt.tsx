import { IconButton } from '@material-ui/core';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import CheckIcon from '@material-ui/icons/Check';
import DehazeIcon from '@material-ui/icons/Dehaze';
import { gantt } from 'dhtmlx-gantt';
// import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import 'dhtmlx-gantt/codebase/skins/dhtmlxgantt_material.css';
import moment from 'moment';
import React, {
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import Vector from '../../../../assets/images/Vector.svg';
import { stateContext } from '../../../root/context/authentication/authContext';
import ConfirmDialog from '../../../shared/components/ConfirmDialog/ConfirmDialog';
import Notification, {
  AlertTypes,
} from '../../../shared/components/Toaster/Toaster';
import {
  endDateDecreaseByOneDay,
  endDateIncreaseByOneDay,
  onKeyDown,
  updateParentTaskDates,
  weekScaleTemplate,
  weekScaleTemplateWithNumber,
} from '../../utils/ganttConfig';
import { transformDateToString } from '../../utils/ganttDataTransformer';
import {
  ganttActivityNameFilterButton,
  ganttAssigneeFilterButton,
  ganttFloatFilterButton,
  ganttresponsibleCompanyFilterButton,
  ganttTypeFilterButton,
  lookaheadActivityNameFilterButton,
  lookaheadAssigneeFilterButton,
  lookaheadFloatFilterButton,
  lookaheadResponsibleCompanyFilterButton,
  lookaheadTypeFilterButton,
} from './constant';
// import { doKeyboardNavigationTasks } from '../../utils/ganttKeyboardNavigation';
import './Gantt.scss';
interface IGanttProps {
  tasks: any;
  cpCalculation: boolean;
  lookAheadStatus: boolean;
  setCLookAheadWeek: any;
  lookAheadView: any;
  showAddTaskButton: boolean;
  isEditingRecipe: boolean;
  isRecepiePlan: boolean;
  showCover?: any;
  addUpdatedTask?: any;
  projectScheduleMetadata?: any;
}

export default function Gantt(props: IGanttProps): ReactElement {
  const containerRef = useRef(null);
  const [sidePanel, setSidePanel] = useState(false);
  const [lookAheadWeek, setLookAheadWeek] = useState('');
  const [currentWeek, setCurrentWeek] = useState({
    weekNo: 0,
    dates: '',
  });
  const [displayWeekNo, setDisplayWeekNo] = useState(2);
  const [lookAheadWeekNumber, setLookAheadWeekNumber] = useState(6);
  const [customTypeFilterButton, setCustomTypeFilterButton] = useState<any>(
    ganttTypeFilterButton
  );

  const [customTotalFloatFilterButton, setCustomTotalFloatFilterButton] =
    useState(ganttFloatFilterButton);

  const [customAssigneeFilterButton, setCustomAssigneeFilterButton] = useState(
    ganttAssigneeFilterButton
  );
  const [customResponsibleCompany, setCustomResponsibleCompany] = useState(
    ganttresponsibleCompanyFilterButton
  );
  const [customActivityNameFilterButton, setCustomActivityNameFilterButton] =
    useState(ganttActivityNameFilterButton);
  const [completedProjectLookAhead, setCompletedProjectLookAhead] =
    useState('');
  const {
    tasks,
    cpCalculation,
    lookAheadStatus,
    setCLookAheadWeek,
    lookAheadView,
    showCover,
    addUpdatedTask,
    projectScheduleMetadata,
  } = props;
  const [selectedTask, setSelectedTask] = useState('');

  const [anchorEl, setAnchorEl] =
    React.useState<HTMLButtonElement | null>(null);

  const { state, dispatch }: any = useContext(stateContext);

  const taskEndDateValidation = (task: any, targetDate: any) => {
    if (task.type === gantt.config.types.milestone) {
      return gridDateToStr(new Date(targetDate.valueOf()));
    } else {
      const d = new Date(targetDate);
      d.setDate(d.getDate() - 1);
      return gridDateToStr(d);
    }
  };

  const customPlannedStartFilterButton = `<div
  data-testid="filter-planned-start-date" class='gantt-container__filter_planned_start-date' id="gantt-container-filter-planned-start-date"> <span data-column-id="plannedStartDate"> Planned Start </span> <input type="date" id='planned-start-filtered'></input>  </div>`;
  //

  // <span class="gantt-container__filter_badge gantt-container__filter_planned_start-date-badge" id='gantt-planned-start-filter-badge' >0</span>
  const customPlannedEndFilterButton = `<div
  data-testid="filter-planned-end-date" class='gantt-container__filter_planned_end-date' id='gantt-container-filter-planned-end-date'> <span data-column-id="plannedEndDate"> Planned End </span> <input type="date" id='planned-end-filtered'></input>  </div>`;

  // <span class="gantt-container__filter_badge gantt-container__filter_planned_end-date-badge" id='gantt-planned-end-filter-badge' >0</span>

  const customActualStartFilterButton = `<div
  data-testid="filter-actual-start-date" class='gantt-container__filter_actual_start-date' id='gantt-container-filter-actual-start-date'> <span data-column-id="actualStartDate"> Actual Start </span> <input type="date" id='actual-start-filtered'></input>
  </div>`;

  // <span class="gantt-container__filter_badge gantt-container__filter_actual_start-date-badge" id='gantt-actual-start-filter-badge' >0</span>

  const customActualEndFilterButton = `<div
  data-testid="filter-actual-end-date" class='gantt-container__filter_actual_end-date' id='gantt-container-filter-actual-end-date'> <span data-column-id="actualEndStartDate"> Actual End </span> <input type="date" id='actual-end-filtered'></input>
  </div>`;

  // <span class="gantt-container__filter_badge gantt-container__filter_actual_end-date-badge" id='gantt-actual-end-filter-badge' >0</span>

  useEffect(() => {
    if (!lookAheadView) {
      return;
    }

    if (lookAheadView.includes('week')) {
      setCustomTypeFilterButton(ganttTypeFilterButton);
      setCustomTotalFloatFilterButton(ganttFloatFilterButton);
      setCustomAssigneeFilterButton(ganttAssigneeFilterButton);
      setCustomActivityNameFilterButton(ganttActivityNameFilterButton);
      setCustomResponsibleCompany(ganttresponsibleCompanyFilterButton);
    }
    if (lookAheadView.includes('default')) {
      setCustomTypeFilterButton(lookaheadTypeFilterButton);
      setCustomTotalFloatFilterButton(lookaheadFloatFilterButton);
      setCustomAssigneeFilterButton(lookaheadAssigneeFilterButton);
      setCustomActivityNameFilterButton(lookaheadActivityNameFilterButton);
      setCustomResponsibleCompany(lookaheadResponsibleCompanyFilterButton);
    }
    gantt.config.columns = gantt.config.columns.map((column: any) => {
      if (column.name == 'typeName') {
        if (lookAheadView.includes('week')) {
          column.label = ganttTypeFilterButton;
        }
        if (lookAheadView.includes('default')) {
          column.label = lookaheadTypeFilterButton;
        }
      } else if (column.name == 'floatValue') {
        if (lookAheadView.includes('week')) {
          column.label = ganttFloatFilterButton;
        }
        if (lookAheadView.includes('default')) {
          column.label = lookaheadFloatFilterButton;
        }
      } else if (column.name == 'assigneeName') {
        if (lookAheadView.includes('week')) {
          column.label = ganttAssigneeFilterButton;
        }
        if (lookAheadView.includes('default')) {
          column.label = lookaheadAssigneeFilterButton;
        }
      } else if (column.name == 'text') {
        if (lookAheadView.includes('week')) {
          column.label = ganttActivityNameFilterButton;
        }
        if (lookAheadView.includes('default')) {
          column.label = lookaheadActivityNameFilterButton;
        }
      } else if (column.name == 'responsibleCompany') {
        if (lookAheadView.includes('week')) {
          column.label = ganttresponsibleCompanyFilterButton;
        }
        if (lookAheadView.includes('default')) {
          column.label = lookaheadResponsibleCompanyFilterButton;
        }
      }
      return column;
    });

    gantt.render();
  }, [lookAheadView]);

  const defaultColumn: any[] = [
    {
      label: customPlannedStartFilterButton, //'Planned Start', // customPlannedStartFilterButton,
      name: 'plannedStartDate',
      check: true,
      width: 140,
      labelText: 'Planned Start',
    },
    {
      label: customPlannedEndFilterButton, // 'Planned End',
      name: 'plannedEndDate',
      check: false,
      width: 120,
      labelText: 'Planned End',
    },
    {
      label: 'Planned Duration',
      name: 'plannedDuration',
      check: true,
      width: 80,
      sort: false,
      labelText: 'Planned Duration',
    },
    {
      label: customActualStartFilterButton, // 'Actual Start',
      name: 'actualStartDate',
      check: false,
      width: 120,
      labelText: 'Actual Start',
    },
    {
      label: customActualEndFilterButton, //'Actual End',
      name: 'actualEndDate',
      check: false,
      width: 120,
      labelText: 'Actual End',
    },
    {
      label: 'Actual Duration',
      name: 'actualDuration',
      check: false,
      width: 80,
      sort: false,
      labelText: 'Actual Duration',
    },
    {
      label: 'Estimated End',
      name: 'estimatedEndDate',
      check: false,
      width: 100,
      labelText: 'Estimated End',
    },
    {
      label: 'Estimated Duration',
      name: 'estimatedDuration',
      check: false,
      width: 80,
      sort: false,
      labelText: 'Estimated Duration',
    },
    {
      label: customTypeFilterButton, // replaced Type for filter icon
      name: 'typeName',
      check: false,
      width: 80,
      labelText: 'Type',
    },
    {
      label: customTotalFloatFilterButton, //replaced 'Total Float' for float icon,
      name: 'floatValue',
      check: false,
      width: 100,
      labelText: 'Total Float',
    },
    {
      label: customAssigneeFilterButton, // 'Assignee',
      name: 'assigneeName',
      check: false,
      width: 100,
      labelText: 'Assignee',
    },
    {
      label: customResponsibleCompany, // 'Responsible Company',
      name: 'responsibleCompany',
      check: false,
      width: 200,
      labelText: 'Responsible Company',
    },
  ];

  const [DefaultColumnDetails, setDefaultColumnDetails] =
    useState(defaultColumn);

  const [warningMessage, setWarningMessage] = useState<any>({
    open: false,
    text: '',
    proceed: 'Okay',
    warningIcon: true,
  });

  useEffect(() => {
    if (!lookAheadStatus) {
      ganttTaskTemplateConfig();
    }
  }, [lookAheadStatus]);
  const [leftMargin, setLeftMargin] = useState(332);

  const [nodeData, setNodeData] = useState<null | HTMLElement>(null);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  useEffect(() => {
    gantt.clearAll();
    // showCover();
    ganttConfig();
    // makeCamelCase(tasks);
    gantt.init(containerRef.current as any);
    if (!props.isRecepiePlan) {
      gantt.addTaskLayer(function (task: any) {
        if (gantt.hasChild(task.id) && task.parent != 0) {
          const sizes = gantt.getTaskPosition(
            task,
            task.start_date,
            task.end_date
          );
          const el = document.createElement('div');
          el.innerHTML = task.text;
          el.style.color = 'black';
          el.style.zIndex = '1';
          el.style.position = 'absolute';
          el.style.left = sizes.left + sizes.width + 25 + 'px';
          el.style.top = sizes.top + 10 + 'px';
          return el;
        }
        return false;
      });
    }

    setDefaultColumnDetails(defaultColumn);
    gantt.ext.tooltips.tooltipFor({
      selector: '.gantt_cell',
      html: function (event: any, domElement: any) {
        return event.target.innerHTML;
      },
    });
    setLeftMargin(332);
  }, []);

  useEffect(() => {
    setSelectedTask(gantt?.getSelectedId());
    gantt.clearAll();
    gantt.parse(tasks);
    if (!props.isRecepiePlan) {
      gantt.getTaskByTime().forEach((task) => {
        if (task.type == 'milestone') {
          task.plannedDuration = 0;
        } else {
          task.plannedDuration = gantt.calculateDuration({
            start_date: new Date(task.plannedStartDate),
            end_date: new Date(endDateIncreaseByOneDay(task.plannedEndDate)),
            task,
          });
        }
        if (task.status == 'In-Progress') {
          task.estimatedDuration = gantt.calculateDuration({
            start_date: new Date(task.actualStartDate),
            end_date: new Date(endDateIncreaseByOneDay(task.estimatedEndDate)),
            task,
          });
        } else if (task.status == 'Complete') {
          task.actualDuration = gantt.calculateDuration({
            start_date: new Date(task.actualStartDate),
            end_date: new Date(endDateIncreaseByOneDay(task.actualEndDate)),
            task,
          });
        }
      });
    }

    gantt.render();
    gantt.refreshData();
    navigateToDefaultView();
  }, [tasks]);

  // useEffect(() => {
  // handleClose();
  // }, [DefaultColumnDetails]);

  useEffect(() => {
    ganttTaskTemplateConfig();
    ganttLinkTemplateConfig();
    leftRightTextUpdate();
    gantt.render();
  }, [cpCalculation]);

  useEffect(() => {
    if (lookAheadStatus) {
      setLookAheadbar();
      switch (lookAheadView) {
        case 'default':
        case '':
          setLookaheadWeek();
          break;
        case 'week':
          setLookaheadCurrentWeek();
      }
    }
    if (
      !lookAheadStatus &&
      !props.isRecepiePlan &&
      gantt &&
      (gantt.config.scale_height > 0 || gantt.config.scale_height > 50)
    ) {
      resetTimeLineScale();
    }
  }, [lookAheadStatus, lookAheadView]);

  useEffect(() => {
    //  if (!props?.isRecepiePlan) {
    if (props?.showAddTaskButton) {
      showAddTaskButton();
      gantt.render();
    } else {
      hideAddTaskButton();
      gantt.render();
    }
    // }
  }, [props?.showAddTaskButton, tasks]);

  const makeCamelCase = (tasks: any) => {
    if (tasks?.data?.length > 0) {
      for (let i = 0; i < tasks.data.length; i++) {
        if (tasks.data[i].type) {
          if (tasks.data[i].type.indexOf('_') != -1) {
            const type =
              tasks.data[i].type.split('_')[0].charAt(0).toUpperCase() +
              tasks.data[i].type.split('_')[0].slice(1) +
              ' ' +
              tasks.data[i].type.split('_')[1].charAt(0).toUpperCase() +
              tasks.data[i].type.split('_')[1].slice(1);
            tasks.data[i].typeName =
              type.charAt(0).toUpperCase() + type.slice(1);
          } else {
            const type = tasks.data[i].type.replace(
              /[&\/\\#,+_()$~%.'":*?<>{}]/g,
              ' '
            );

            tasks.data[i].typeName =
              type == 'wbs'
                ? type.toUpperCase()
                : type.charAt(0).toUpperCase() + type.slice(1);
          }
        }
      }
    }
  };

  const navigateToDefaultView = () => {
    if (!props?.isRecepiePlan) {
      try {
        if (!selectedTask) {
          gantt?.showDate(new Date());
        } else {
          gantt?.selectTask(selectedTask);
          gantt?.showTask(selectedTask);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const gridDateToStr = gantt.date.date_to_str('%d-%M-%y');

  const ganttConfig = () => {
    setScale();
    gantt.config.branch_loading = true;

    gantt.config.fit_tasks = true;
    gantt.config.show_tasks_outside_timescale = true;
    //gantt.config.round_dnd_dates = false;
    //gantt.config.min_duration = 24*60*60*1000; // 1day duration
    gantt.config.sort = true;
    //intialy hide the grid
    gantt.config.show_grid = false;
    gantt.config.show_errors = false;
    setSidePanel(false);
    gantt.config.drag_progress = false;

    setGridConfig();

    gantt.config.date_format = '%Y-%m-%d';
    gantt.config.autofit = true;
    // reszie grid columns
    gantt.config.keep_grid_width = false;
    gantt.config.grid_resize = true;
    // reorder grid columns
    gantt.config.reorder_grid_columns = true;

    if (sessionStorage.getItem('scheduleLeftPanel') == 'true') {
      onToggleGrid();
    }

    gantt.plugins({
      critical_path: true,
      tooltip: true,
      // undo: true,
      // keyboard_navigation: true,
      multiselect: true,
    });
    gantt.config.undo_types = {
      task: 'task',
      link: 'link',
    };
    gantt.config.undo_steps = 10000;
    // doKeyboardNavigationTasks();
    let mouse_on_grid: any = false;

    gantt.templates.tooltip_text = function (start, end, task) {
      if (mouse_on_grid) {
        return task.text;
      } else {
        return '';
      }
    };

    gantt.attachEvent(
      'onMouseMove',
      function (id, e) {
        if (e.clientX <= gantt.config.grid_width) {
          mouse_on_grid = true;
        } else mouse_on_grid = false;
      },
      ''
    );
    leftRightTextUpdate();
    //  temp config to add types on newly created task
    gantt.config.lightbox.sections = [
      {
        name: 'title',
        height: 20,
        map_to: 'text',
        type: 'textarea',
        focus: true,
      },
      { name: 'details', height: 70, map_to: 'details', type: 'textarea' },
      { name: 'type', type: 'typeselect', map_to: 'type' },
      { name: 'time', height: 72, type: 'time', map_to: 'auto' },
    ];
    // ************ custom work package type start  ****************
    gantt.config.types.work_package = 'work_package';
    gantt.locale.labels.type_work_package = 'WORK PACKAGE';

    // Specify a new structure of the lightbox for the newly-created type
    gantt.config.lightbox.work_package_sections = [
      {
        name: 'title',
        height: 20,
        map_to: 'text',
        type: 'textarea',
        focus: true,
      },
      { name: 'details', height: 70, map_to: 'details', type: 'textarea' },
      { name: 'type', type: 'typeselect', map_to: 'type' },
      { name: 'time', height: 72, type: 'time', map_to: 'auto' },
    ];

    gantt.locale.labels.section_title = 'Subject';
    gantt.locale.labels.section_details = 'Details';

    // **************************************************************

    // ************ custom work package type start  ****************

    gantt.config.types.wbs = 'wbs';
    gantt.locale.labels.type_wbs = 'WBS';
    gantt.config.lightbox.wbs_sections = [
      {
        name: 'title',
        height: 20,
        map_to: 'text',
        type: 'textarea',
        focus: true,
      },
      { name: 'details', height: 70, map_to: 'details', type: 'textarea' },
      { name: 'type', type: 'typeselect', map_to: 'type' },
      { name: 'time', height: 72, type: 'time', map_to: 'auto' },
    ];

    // **************************************************************

    // ************ custom work package type start  ****************
    gantt.config.types.project_phase = 'project_phase';
    gantt.locale.labels.type_project_phase = 'PROJECT PHASE';

    // Specify a new structure of the lightbox for the newly-created type
    gantt.config.lightbox.project_phase_sections = [
      {
        name: 'title',
        height: 20,
        map_to: 'text',
        type: 'textarea',
        focus: true,
      },
      { name: 'details', height: 70, map_to: 'details', type: 'textarea' },
      { name: 'type', type: 'typeselect', map_to: 'type' },
      { name: 'time', height: 72, type: 'time', map_to: 'auto' },
    ];

    // **************************************************************

    ganttTaskTemplateConfig();
    ganttLinkTemplateConfig();

    gantt.config.static_background = true;

    gantt.attachEvent(
      'onDataRender',
      function () {
        if (document.querySelectorAll('.gantt_task_bg')[1]) {
          const bg_images =
            document.querySelectorAll('.gantt_task_bg')[1].childNodes;
          for (let i = 0; i < bg_images.length; i++) {
            const bImage = bg_images[i] as HTMLElement;
            bImage.style.height = '1000000000%';
          }
        }
      },
      {}
    );

    let wait = false;
    const delay = 500;
    gantt.attachEvent(
      'onTaskDrag',
      function (id, mode, task, original) {
        // use timeout to limit calls to the function
        if (wait) return;

        // recalculate gantt timeline if task is dragged to close to one of the sides
        const state = gantt.getState();
        const padding = (1000 * 60 * 60 * 24) / 2; // half of day cell

        let refresh = false,
          scrollTo = null;
        if (Math.abs(state.max_date - task.end_date) < padding) {
          refresh = true;
          scrollTo = task.end_date;
        } else if (Math.abs(task.start_date - state.min_date) < padding) {
          refresh = true;
          scrollTo = task.start_date;
        }

        if (refresh) {
          gantt.render();
          gantt.showDate(scrollTo);

          wait = true;
          setTimeout(function () {
            wait = false;
          }, delay);
        }
      },
      {}
    );

    gantt.attachEvent(
      'onAfterTaskDrag',
      function (id, mode, e) {
        if (
          +gantt.getTask(id).start_date === +new Date(2020, 11, 31) &&
          props.isRecepiePlan
        ) {
          gantt.getTask(id).start_date = new Date(2020, 12, 1);
          if (mode == 'move')
            gantt.getTask(id).end_date = gantt.date.add(
              gantt.getTask(id).end_date,
              1,
              'day'
            );
          gantt.render();
        }
      },
      {}
    );

    // gantt.config.layout = {
    //   css: "gantt_container",
    //    rows: [
    //    {
    //     cols: [
    //      {view: "grid",  scrollX: "scrollHor", scrollY: "scrollVer"},
    //      {view: "timeline",  scrollX: "scrollHor", scrollY: "scrollVer"},
    //      {view: "scrollbar", id: "scrollVer"}
    //     ]
    //    },
    //    {view: "scrollbar", id: "scrollHor"}
    //   ]
    //  };

    gantt.config.bar_height = 17;
  };

  const detectOverflow = (taskObject: any, isRightText = false) => {
    const task_width = gantt.getTaskPosition(
      taskObject,
      taskObject.start_date,
      taskObject.end_date
    );

    const element = document.createElement('canvas');
    const context: any = element.getContext('2d');

    const task_element =
      document.getElementsByClassName('gantt_task_content')[0];
    if (task_element) {
      const taskFontFamily: any = getComputedStyle(task_element);
      const tFontFamily = taskFontFamily['font-family'];
      const taskFontSize: any = getComputedStyle(task_element);
      const tFontSize = taskFontSize['font-size'];
      context.font = tFontSize + ' ' + tFontFamily;
    }
    const task_text_width = context.measureText(taskObject.text).width;
    if (isRightText) {
      if (task_text_width + 50 > task_width.width) return true;
    } else {
      if (task_text_width > task_width.width) return true;
    }
  };

  const addTaskColHeader =
    `<div class='gantt-dropdown'  style="width: 44px;"><img style="position: relative;
    top: 6px; cursor: pointer; width: 20px;
    " src=` +
    Vector +
    ` onClick='gantt.getGridColumn(event)'>
    </div>`;

  const addTaskColumn = {
    name: 'buttons',
    label: addTaskColHeader,
    labelText: addTaskColHeader,
    width: 50,
    align: 'right',
    template: function (task: any) {
      if (task.type !== gantt.config.types.milestone) {
        return '<p class="ganttCustomAddTak" data-action="add"></p>';
      }
    },
  };

  const addTaskColumnForRecepie = {
    name: 'buttons',
    width: 50,
    align: 'right',
    sort: false,
    template: function (task: any) {
      if (task.type !== gantt.config.types.task && !props.isEditingRecipe) {
        return '<p class="ganttCustomAddTak" data-action="add"></p>';
      }
    },
  };

  const addTaskColumnWithout = {
    name: 'buttons',
    label: addTaskColHeader,
    labelText: addTaskColHeader,
    width: 50,
    align: 'right',
  };

  const hideAddTaskButton = () => {
    if (!props?.isRecepiePlan) {
      gantt.config.columns[gantt.config.columns.length - 1] =
        addTaskColumnWithout;
    } else {
      if (gantt.config.columns.length == 3) {
        gantt.config.columns.splice(gantt.config.columns.length - 1, 1);
      }

      // gantt.config.columns[gantt.config.columns.length - 1] = addTaskColumnForRecepie;
    }
  };

  const showAddTaskButton = () => {
    if (!props?.isRecepiePlan) {
      gantt.config.columns[gantt.config.columns.length - 1] = addTaskColumn;
    } else if (props?.isRecepiePlan && gantt.config.columns.length == 2) {
      gantt.config.columns[gantt.config.columns.length] =
        addTaskColumnForRecepie;
    }
  };

  const setGridConfig = () => {
    const getInput = function (node: any) {
      setNodeData(node);
      return node.querySelector('input');
    };

    gantt.config.editor_types.taskNameEditor = {
      show: function (id: any, column: any, config: any, placeholder: any) {
        if (id != gantt?.getTaskByIndex(0)?.id) {
          const html =
            "<div><input type='text' name='" + column.name + "'></div>";
          placeholder.innerHTML = html;
        } else {
          const html =
            "<div><input  type='text' disabled='true' style='pointer-event: none; background: white;' name='" +
            column.name +
            "'></div>";
          placeholder.innerHTML = html;
        }
      },

      hide: function () {
        // can be empty since we don't have anything to clean up after the editor
        // is detached
      },

      set_value: function (value: any, id: any, column: any, node: any) {
        getInput(node).value = value;
      },

      get_value: function (id: any, column: any, node: any) {
        return getInput(node).value || '';
      },

      is_changed: function (value: any, id: any, column: any, node: any) {
        const currentValue = this.get_value(id, column, node);
        return value !== currentValue;
      },

      is_valid: function (value: any, id: any, column: any, node: any) {
        const currentValue = this.get_value(id, column, node);
        let isPhaseUnique = true;

        if (gantt.getTask(id).type == 'project_phase') {
          const type = gantt.getTask(id).type;

          gantt.getTaskByTime().forEach((item: any) => {
            if (
              item.text.trim().toLowerCase() ==
                currentValue.trim().toLowerCase() &&
              type == 'project_phase' &&
              item.type == 'project_phase' &&
              item.id != id
            ) {
              isPhaseUnique = false;
              setWarningMessage({
                open: true,
                header: 'Warning',
                text: 'There is already a phase with the same name. Please use a different name',
                proceed: 'Okay',
              });
            }
          });
        }

        if (props?.isRecepiePlan) {
          return value.length > 500 || value == '' ? false : true;
        }

        return value == '' || !isPhaseUnique ? false : true;
      },

      focus: function (node: any) {
        const input = getInput(node);
        if (!input) {
          return;
        }
        if (input.focus) {
          input.focus();
        }

        if (input.select) {
          input.select();
        }
      },
    };

    gantt.config.editor_types.durationEditor = {
      show: function (id: any, column: any, config: any, placeholder: any) {
        if (id != gantt?.getTaskByIndex(0)?.id) {
          const html =
            "<div><input type='number' name='" + column.name + "' min=1></div>";
          placeholder.innerHTML = html;
        } else {
          const html =
            "<div><input type='number' disabled='true' style='pointer-event: none; background: white;' name='" +
            column.name +
            "'></div>";
          placeholder.innerHTML = html;
        }
      },

      hide: function (id: any, node: any) {
        //  inlineEditors.hide;
        // }
        // can be empty since we don't have anything to clean up after the editor
        // is detached
      },

      set_value: function (value: any, id: any, column: any, node: any) {
        getInput(node).value = value;
      },

      get_value: function (id: any, column: any, node: any) {
        return getInput(node).value || 0;
      },

      is_changed: function (value: any, id: any, column: any, node: any) {
        const currentValue = this.get_value(id, column, node);
        return Number(value) !== Number(currentValue);
      },

      is_valid: function (value: any, id: any, column: any, node: any) {
        // let valid = false;
        const type = gantt.getTask(id).type;
        if (type == 'milestone') {
          return Number(value) > -1;
        } else {
          return Number(value) > 0;
        }
      },

      focus: function (node: any) {
        const input = getInput(node);
        if (!input) {
          return;
        }
        if (input.focus) {
          input.focus();
          input.onkeypress = onKeyDown;
          input.onkeyup = (e: any) => {
            if (e.target.value < 1) {
              e.target.value = '';
            }
          };
        }

        if (input.select) {
          input.select();
        }
      },
    };

    gantt.config.editor_types.assigneeEditor = {
      show: function (id: any, column: any, config: any, placeholder: any) {
        if (id != gantt?.getTaskByIndex(0)?.id) {
          const html =
            "<div><input type='text' name='" + column.name + "'></div>";
          placeholder.innerHTML = html;
        } else {
          const html =
            "<div><input type='text' disabled='true' style='pointer-event: none; background: white;' name='" +
            column.name +
            "'></div>";
          placeholder.innerHTML = html;
        }
      },

      hide: function () {
        // can be empty since we don't have anything to clean up after the editor
        // is detached
      },

      set_value: function (value: any, id: any, column: any, node: any) {
        getInput(node).value = value;
      },

      get_value: function (id: any, column: any, node: any) {
        return getInput(node).value || '';
      },

      is_changed: function (value: any, id: any, column: any, node: any) {
        const currentValue = this.get_value(id, column, node);
        return value !== currentValue;
      },

      is_valid: function (value: any, id: any, column: any, node: any) {
        const currentValue = this.get_value(id, column, node);
        //  let isPhaseUnique = true;

        // if (gantt.getTask(id).type == 'project_phase') {
        //   const type = gantt.getTask(id).type;

        // gantt.getTaskByTime().forEach((item: any) => {
        //   if (
        //     item.text.trim().toLowerCase() ==
        //       currentValue.trim().toLowerCase() &&
        //     type == 'project_phase' &&
        //     item.type == 'project_phase' &&
        //     item.id != id
        //   ) {
        //     isPhaseUnique = false;
        //     setWarningMessage({
        //       open: true,
        //       header: 'Warning',
        //       text: 'There is already a phase with the same name. Please use a different name',
        //       proceed: 'Okay',
        //     });
        //   }
        // });
        // }

        return value == '' ? false : true;
      },

      focus: function (node: any) {
        const input = getInput(node);
        if (!input) {
          return;
        }
        if (input.focus) {
          input.focus();
        }

        if (input.select) {
          input.select();
        }
      },
    };

    const textEditor = { type: 'taskNameEditor', map_to: 'text' };
    const assigneeNameEditor = { type: 'assigneeEditor', map_to: 'text' };

    const dateEditor = {
      type: 'date',
      map_to: 'plannedStartDate',
    };

    const durationEditor = {
      type: 'durationEditor',
      map_to: 'duration',
      min: 1,
      max: 100,
    };

    const formatter = gantt.ext.formatters.durationFormatter({
      enter: 'day',
      format: 'day',
    });

    if (props?.isRecepiePlan) {
      gantt.config.columns = [
        {
          name: 'text',
          label: 'Activity Name',
          labelText: 'Activity Name',
          tree: true,
          width: 200,
          align: 'left',
          editor: textEditor,
          template: function (task: any) {
            if (task.type === gantt.config.types.work_package)
              return (
                "<div class='gantt_custom_grid_row_highlight'>" +
                task.text +
                '</div>'
              );
            return task.text;
          },
        },
        {
          name: 'duration',
          label: 'Duration',
          labelText: 'Duration',
          align: 'left',
          editor: durationEditor,
          template: function (task: any) {
            return formatter.format(task.duration);
          },
          width: 70,
        },
      ];
      if (props?.showAddTaskButton) {
        gantt.config.columns.push(addTaskColumnForRecepie);
      }
    } else {
      gantt.config.columns = [
        {
          name: 'serialNumber',
          label: 'Id',
          labelText: 'Id',
          // tree: true,
          width: 30,
          align: 'left',
          template: function (task: any) {
            if (!projectScheduleMetadata.importType) {
              getProjectTask()[0].externalId = '1';
            } else {
              getProjectTask()[0].externalId = '-';
            }
            if (task.externalId) {
              return task.externalId;
            } else {
              return '-';
            }

            // if (
            //   task?.externalId != null &&
            //   getProjectTask()[0].externalId == null
            // ) {
            //   return task.externalId;
            // } else {
            //   return task.serialNumber;
            // }
          },
        },
        {
          name: 'text',
          label: customActivityNameFilterButton, // Activity Name changes for filter
          labelText: 'Activity Name',
          tree: true,
          width: '*',
          min_width: 130,
          sort: false,
          template: function (task: any) {
            if (
              task.type === gantt.config.types.milestone ||
              task.type === gantt.config.types.project ||
              task.type === gantt.config.types.project_phase
            )
              return (
                "<div class='gantt_custom_grid_row_highlight'>" +
                task.text +
                '</div>'
              );
            return task.text;
          },
        },
        {
          name: 'plannedStartDate',
          label: 'Start Time',
          labelText: 'Start Time',
          align: 'left',
          template: (task: any) => {
            return moment(task?.plannedStartDate).format('DD-MMM-YY');
          },
        },
        {
          name: 'plannedDuration',
          label: ' Planned Duration',
          labelText: ' Planned Duration',
          align: 'left',
          sort: false,
          template: function (task: any) {
            return formatter.format(task.plannedDuration);
          },
          width: 70,
        },
      ];

      if (gantt.config.columns.length == 4) {
        const columns = gantt.config.columns;
        columns[0].resize = true;
        columns[1].resize = true;
        columns[2].resize = true;
        columns[3].resize = true;

        columns[1].width = 110;
        columns[1].editor = textEditor;

        columns[2].label = customPlannedStartFilterButton; // Planned start changes for filter
        // added for filter
        columns[2].labelText = 'Planned Start';
        columns[3].label = 'Planned Duration';
        // added for filter
        columns[3].labelText = 'Planned Duration';

        columns[2].width = 120;

        columns[2].editor = { type: 'custom_date_editor', map_to: 'auto' };
        columns[3].editor = {
          type: 'custom_duration_editor',
          map_to: 'auto',
          min: 1,
          max: 100,
        };

        columns.push(addTaskColumnWithout);
        gantt.config.columns = columns;
      } else {
        const columns: any = gantt.config.columns;
        const columnsTemp: any = [];
        columnsTemp.push(columns[0]);
        columnsTemp.push(columns[1]);
        columnsTemp.push(columns[2]);
        columnsTemp.push(columns[3]);
        columnsTemp.push(columns[gantt.config.columns.length - 2]);
        columnsTemp.push(columns[gantt.config.columns.length - 1]);
        gantt.config.columns = columnsTemp;
        setDefaultColumnDetails(defaultColumn);
      }
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  gantt.getGridColumn = function (event: any) {
    handleClick(event);
  };

  const setScale = () => {
    if (props?.isRecepiePlan) {
      gantt.config.min_column_width = 40;
      gantt.config.scale_height = 50;
      gantt.config.scale_offset_minimal = false;

      gantt.config.scales = [
        {
          unit: 'day',
          step: 1,
          format: function (date: Date) {
            const year_start = new Date(2020, 12, 1); //gantt.date.year_start(new Date(date));
            const day_number =
              gantt.calculateDuration({
                start_date: year_start,
                end_date: date,
              }) + 1;

            return day_number > 0 ? day_number : '';
          },
        },
      ];
    } else if (!gantt?.config?.scale_height) {
      gantt.config.min_column_width = 40;
      gantt.config.scale_height = 50;
      gantt.config.scale_offset_minimal = false;

      gantt.config.work_time = true;
      gantt.config.correct_work_time = true;

      gantt.templates.timeline_cell_class = (task: any, date: Date) => {
        if (!gantt.isWorkTime({ task: task, date: date })) {
          return 'weekend';
        }
        return '';
      };
    }
  };

  const onToggleGrid = () => {
    gantt.config.show_grid = !gantt.config.show_grid;
    setSidePanel(!sidePanel);
    gantt.render();
    if (gantt.config.show_grid)
      sessionStorage.setItem('scheduleLeftPanel', 'true');
    else sessionStorage.setItem('scheduleLeftPanel', 'false');
  };

  const columnUpdate = (item: any, check: any) => {
    const tempArray = [];

    let columnTemp: any = [];

    const getInput = function (node: any) {
      setNodeData(node);
      return node.querySelector('input');
    };

    gantt.config.editor_types.taskNameEditor = {
      show: function (id: any, column: any, config: any, placeholder: any) {
        if (id != gantt?.getTaskByIndex(0)?.id) {
          const html =
            "<div><input type='text' name='" + column.name + "'></div>";
          placeholder.innerHTML = html;
        } else {
          const html =
            "<div><input type='text' disabled='true' style='pointer-event: none; background: white;' name='" +
            column.name +
            "'></div>";
          placeholder.innerHTML = html;
        }
      },

      hide: function () {
        // can be empty since we don't have anything to clean up after the editor
        // is detached
      },

      set_value: function (value: any, id: any, column: any, node: any) {
        getInput(node).value = value;
      },

      get_value: function (id: any, column: any, node: any) {
        return getInput(node).value || '';
      },

      is_changed: function (value: any, id: any, column: any, node: any) {
        const currentValue = this.get_value(id, column, node);
        return value !== currentValue;
      },

      is_valid: function (value: any, id: any, column: any, node: any) {
        const currentValue = this.get_value(id, column, node);
        let isPhaseUnique = true;

        if (gantt.getTask(id).type == 'project_phase') {
          const type = gantt.getTask(id).type;

          gantt.getTaskByTime().forEach((item: any) => {
            if (
              item.text.trim().toLowerCase() ==
                currentValue.trim().toLowerCase() &&
              type == 'project_phase' &&
              item.type == 'project_phase' &&
              item.id != id
            ) {
              isPhaseUnique = false;
              setWarningMessage({
                open: true,
                header: 'Warning',
                text: 'There is already a phase with the same name. Please use a different name',
                proceed: 'Okay',
              });
            }
          });
        }

        return value == '' || !isPhaseUnique ? false : true;
      },

      focus: function (node: any) {
        const input = getInput(node);
        if (!input) {
          return;
        }
        if (input.focus) {
          input.focus();
        }

        if (input.select) {
          input.select();
        }
      },
    };

    gantt.config.editor_types.durationEditor = {
      show: function (id: any, column: any, config: any, placeholder: any) {
        if (id != gantt?.getTaskByIndex(0)?.id) {
          const html =
            "<div><input type='number' name='" +
            column.name +
            "' min=1 ></div>";
          placeholder.innerHTML = html;
        } else {
          const html =
            "<div><input type='number' disabled='true' style='pointer-event: none; background: white;' name='" +
            column.name +
            "'></div>";
          placeholder.innerHTML = html;
        }
      },

      hide: function (id: any, node: any) {
        //  inlineEditors.hide;
        // }
        // can be empty since we don't have anything to clean up after the editor
        // is detached
      },

      set_value: function (value: any, id: any, column: any, node: any) {
        getInput(node).value = value;
      },

      get_value: function (id: any, column: any, node: any) {
        return getInput(node).value || 0;
      },

      is_changed: function (value: any, id: any, column: any, node: any) {
        const currentValue = this.get_value(id, column, node);
        return Number(value) !== Number(currentValue);
      },

      is_valid: function (value: any, id: any, column: any, node: any) {
        // let valid = false;
        const type = gantt.getTask(id).type;
        if (type == 'milestone') {
          return Number(value) > -1;
        } else {
          return Number(value) > 0;
        }
      },

      focus: function (node: any) {
        const input = getInput(node);
        if (!input) {
          return;
        }
        if (input.focus) {
          input.focus();
          input.onkeypress = onKeyDown;
          input.onkeyup = (e: any) => {
            if (e.target.value < 1) {
              e.target.value = '';
            }
          };
        }

        if (input.select) {
          input.select();
        }
      },
    };

    const textEditor = { type: 'taskNameEditor', map_to: 'text' };

    const startDateEditor = {
      type: 'start_date',
      map_to: 'plannedStartDate',
    };

    const customDateEditor = {
      type: 'custom_date_editor',
      map_to: 'auto',
    };
    const estimatedEndDateEditor = {
      type: 'end_date',
      map_to: 'estimatedEndDate',
    };

    const customDurationEditor = {
      type: 'custom_duration_editor',
      map_to: 'auto',
      min: 1,
      max: 100,
    };

    const EstimatedDurationEditor = {
      type: 'durationEditor',
      map_to: 'estimatedDuration',
      min: 1,
      max: 100,
    };

    const formatter = gantt.ext.formatters.durationFormatter({
      enter: 'day',
      format: 'day',
    });

    const plannedDurationUnit = function (task: any) {
      return formatter.format(task.duration);
    };
    const actualDurationUnit = function (task: any) {
      return task.actualDuration ? formatter.format(task.actualDuration) : '';
    };
    const estimatedDurationUnit = function (task: any) {
      return task.estimatedDuration
        ? formatter.format(task.estimatedDuration)
        : '';
    };

    const typeTaskName = function (task: any) {
      let result;
      switch (task.type) {
        case gantt.config.types.project:
          result = 'PROJECT';
          break;
        case gantt.config.types.project_phase:
          result = 'PROJECT PHASE';
          break;
        case gantt.config.types.wbs:
          result = 'WBS';
          break;
        case gantt.config.types.work_package:
          result = 'WORK PACKAGE';
          break;
        case gantt.config.types.milestone:
          result = 'Milestone';
          break;
        default:
          result = 'Task';
      }
      return result;
    };

    const actualStartDate = function (task: any) {
      return task.actualStartDate == null
        ? '-'
        : gridDateToStr(new Date(task.actualStartDate.replace(/-/g, '/')));
    };
    const actualEndDate = function (task: any) {
      return task.actualEndDate == null
        ? '-'
        : gridDateToStr(new Date(task.actualEndDate.valueOf()));
    };
    const estimatedEndDate = function (task: any) {
      return task.estimatedEndDate
        ? ''
        : gridDateToStr(new Date(task.estimatedEndDate.valueOf()));
    };

    const plannedEndDateTemplate = function (task: any) {
      return task.plannedEndDate
        ? ''
        : gridDateToStr(new Date(task.plannedEndDate.valueOf()));
    };

    // remove object
    columnTemp = gantt.config.columns;
    const addTaskColumnButton =
      gantt.config.columns[gantt.config.columns.length - 1];
    const add = gantt.config.columns[gantt.config.columns.length - 2];
    //columnTemp.splice(gantt.config.columns.length - 1, 1);
    const removeIndex = columnTemp
      .map(function (item: any) {
        return item.labelText;
      })
      .indexOf('buttons');
    columnTemp.splice(removeIndex, 1);

    for (let i = 0; i < DefaultColumnDetails.length; i++) {
      let data = {};
      if (item == DefaultColumnDetails[i].labelText) {
        data = {
          label:
            item == 'Type'
              ? customTypeFilterButton
              : DefaultColumnDetails[i].label,
          check: !check,
          name: DefaultColumnDetails[i].name,
          width: DefaultColumnDetails[i].width,
          labelText: DefaultColumnDetails[i].labelText || '',
        };
        tempArray.push(data);

        if (check == false) {
          const dataColumn: any = {
            name: DefaultColumnDetails[i].name,
            label: DefaultColumnDetails[i].label,
            labelText: DefaultColumnDetails[i].labelText || '',
            align: 'left',
            width: DefaultColumnDetails[i].width,
            resize: true,
            template:
              item == 'Planned Duration'
                ? plannedDurationUnit
                : item == 'Actual Start'
                ? actualStartDate
                : item == 'Actual End'
                ? actualEndDate
                : item == 'Estimated End'
                ? estimatedEndDate
                : item == 'Type'
                ? typeTaskName
                : item == 'Actual Duration'
                ? actualDurationUnit
                : item == 'Estimated Duration'
                ? estimatedDurationUnit
                : item == 'Planned End'
                ? plannedEndDateTemplate
                : '',
            editor:
              item == 'Planned End' ||
              item == 'Planned Start' ||
              item == 'Actual Start' ||
              item == 'Actual End' ||
              item == 'Estimated End'
                ? customDateEditor
                : item == 'Estimated Duration' ||
                  item == 'Actual Duration' ||
                  item == 'Planned Duration'
                ? customDurationEditor
                : '',
          };
          setLeftMargin(leftMargin + DefaultColumnDetails[i].width);
          gantt.config.grid_width =
            gantt.config.grid_width + DefaultColumnDetails[i].width;
          columnTemp.push(dataColumn);
        }

        if (check == true) {
          const removeIndex = columnTemp
            .map(function (item: any) {
              return item.labelText;
            })
            .indexOf(item);
          setLeftMargin(leftMargin - columnTemp[removeIndex].width);
          gantt.config.grid_width =
            gantt.config.grid_width - columnTemp[removeIndex].width;
          columnTemp.splice(removeIndex, 1);
        }
      } else {
        data = {
          label: DefaultColumnDetails[i].label,
          check: DefaultColumnDetails[i].check,
          name: DefaultColumnDetails[i].name,
          width: DefaultColumnDetails[i].width,
          labelText: DefaultColumnDetails[i].labelText,
        };
        tempArray.push(data);
      }
    }

    columnTemp.push(addTaskColumnButton);
    columnTemp.forEach((column: any) => {
      if (!column.labelText.toLowerCase().includes('planned')) {
        column.sort = false;
      }

      if (column.name.toLowerCase().includes('plannedstartdate')) {
        column.template = (task: any) => {
          return moment(task?.plannedStartDate).format('DD-MMM-YY');
        };
      }
      if (column.name.toLowerCase().includes('plannedenddate')) {
        column.template = (task: any) => {
          return task?.plannedEndDate
            ? moment(task?.plannedEndDate).format('DD-MMM-YY')
            : '-';
        };
      }

      if (column.name.toLowerCase().includes('actualstartdate')) {
        column.template = (task: any) => {
          return task?.actualStartDate
            ? moment(task?.actualStartDate).format('DD-MMM-YY')
            : '-';
        };
      }

      if (column.name.toLowerCase().includes('actualenddate')) {
        column.template = (task: any) => {
          return task?.actualEndDate
            ? moment(task?.actualEndDate).format('DD-MMM-YY')
            : '-';
        };
      }

      if (column.name.toLowerCase().includes('estimatedstartdate')) {
        column.template = (task: any) => {
          return task?.estimatedStartDate
            ? moment(task?.estimatedStartDate).format('DD-MMM-YY')
            : '-';
        };
      }

      if (column.name.toLowerCase().includes('estimatedenddate')) {
        column.template = (task: any) => {
          return task?.estimatedEndDate
            ? moment(task?.estimatedEndDate).format('DD-MMM-YY')
            : '-';
        };
      }

      // if (
      //   column.name.toLowerCase().includes('start') ||
      //   column.name.toLowerCase().includes('end')
      // ) {
      //   column.template = (task: any) => {
      //     let returnDate = '-';
      //     if (column.name == 'end_date' && task.status == 'Complete') {
      //       returnDate = moment(task?.plannedEndDate).format('DD-MMM-YY');
      //     } else if (column.name == 'start_date' && task.status == 'Complete') {
      //       returnDate = moment(task?.plannedStartDate).format('DD-MMM-YY');
      //     } else if (
      //       column.name == 'start_date' &&
      //       task.status !== 'Complete'
      //     ) {
      //       returnDate = gridDateToStr(task?.start_date);
      //     } else if (column.name == 'end_date' && task.status !== 'Complete') {
      //       returnDate = taskEndDateValidation(task, task?.end_date);
      //     } else if (column.name == 'actualStartDate' && task.actualStartDate) {
      //       returnDate = moment(task?.actualStartDate).format('DD-MMM-YY');
      //     } else if (column.name == 'actualEndDate' && task.actualEndDate) {
      //       returnDate = moment(task?.actualEndDate).format('DD-MMM-YY');
      //     }
      //     return returnDate;
      //   };
      // }
    });

    gantt.config.columns = columnTemp;

    gantt.render();
    setDefaultColumnDetails(tempArray);
  };

  const ganttTaskTemplateConfig = () => {
    gantt.templates.task_class = function (start, end, task) {
      if (
        cpCalculation &&
        task.floatValue != 0 &&
        task.type === gantt.config.types.milestone
      ) {
        return 'milestone_grey';
      }

      if (task.type === gantt.config.types.milestone) {
        return 'milestone_black';
      }

      if (task.parent === 0) {
        return 'top_level_project_task';
      }
      if (task.type != gantt.config.types.project && gantt.hasChild(task.id)) {
        return 'summary';
      }
      return '';
    };

    gantt.templates.task_text = (start: any, end: any, task: any) => {
      if (cpCalculation && task.floatValue != 0) {
        task.color = '#CAC5C5';
        task.textColor = '#FFFFFF';
        task.progressColor = '#CAC5C5';
        return ' <b>' + getDisplayTaskName(task) + '</b>';
      }
      if (task.type == gantt.config.types.work_package) {
        task.color = '#8AC1D2';
        task.textColor = '#fff';
        task.progressColor = '#8AC1D2';
        return ' <b>' + getDisplayTaskName(task) + '</b>';
      }

      if (task.type == gantt.config.types.wbs) {
        task.color = '#556cd6';
        task.textColor = '#fff';
        task.progressColor = '#556cd6';
        return ' <b>' + getDisplayTaskName(task) + '</b>';
      }

      if (task.type == gantt.config.types.milestone) {
        task.color = 'red';
        task.progressColor = '#000000';
        return ' <b>' + getDisplayTaskName(task) + '</b>';
      }

      if (task.type == gantt.config.types.project_phase) {
        task.color = '#5EBD7E';
        task.textColor = '#fff';
        task.progressColor = '#5EBD7E';
        return '<b>' + getDisplayTaskName(task) + '</b>';
      }

      if (task.type == gantt.config.types.task) {
        task.color = '#D5E3E3';
        task.textColor = '#668A95';
        task.progressColor = '#D5E3E3';
        return '<b>' + getDisplayTaskName(task) + '</b>';
      }

      return task.text;
    };

    const getDisplayTaskName = (task: any) => {
      if (detectOverflow(task)) return ' ';
      return task.text;
    };

    // gantt.templates.grid_row_class = (
    //   start: Date,
    //   end: Date,
    //   task: any
    // ): string => {
    //   if (task.type === gantt.config.types.milestone || gantt.config.readonly) {
    //     return 'milstone_plus_hide';
    //   }
    //   return '';
    // };

    gantt.templates.task_end_date = (date: Date): any => {
      if (date) return gantt.templates.task_date(new Date(date.valueOf() - 1));
    };

    gantt.templates.grid_date_format = (date, column): string => {
      return gridDateToStr(date);
    };

    const dateEditor = gantt.config.editor_types.date;
    gantt.config.editor_types.end_date = gantt.mixin(
      {
        set_value: function (value: Date, id: string, column: any, node: any) {
          if (value) {
            const correctedValue = gantt.date.add(value, -1, 'day');
            return dateEditor.set_value.apply(this, [
              correctedValue,
              id,
              column,
              node,
            ]);
          }
        },
        get_value: function (id: string, column: any, node: any) {
          const selectedValue = dateEditor.get_value.apply(this, [
            id,
            column,
            node,
          ]);
          if (selectedValue) return gantt.date.add(selectedValue, 1, 'day');

          return selectedValue;
        },
        is_valid: function (value: any, id: any, column: any, node: any) {
          if (value && value.getFullYear() < new Date().getFullYear() + 50) {
            if (gantt.getTask(id).start_date < value)
              return gantt.isWorkTime(gantt?.date?.add(value, -1, 'day'));
            return gantt.isWorkTime(value);
          }
        },
      },
      dateEditor,
      false
    );
    //  custom end date editor
    const getInput = function (node: any) {
      return node.querySelector('input');
    };
    gantt.config.editor_types.custom_date_editor = {
      show: function (id: any, column: any, config: any, placeholder: any) {
        // called when input is displayed, put html markup of the editor into placeholder
        // and initialize your editor if needed:
        const html =
          "<div><input type='date' name='" + column.name + "'></div>";
        placeholder.innerHTML = html;
      },
      hide: function () {
        // called when input is hidden
        // destroy any complex editors or detach event listeners from here
      },

      set_value: function (value: any, id: string, column: any, node: any) {
        if (value) {
          // const correctedValue = gantt.date.add(value, -1, 'day');
          getInput(node).value = value[column.name];
          // return dateEditor.set_value.apply(this, [value, id, column, node]);
        }
      },

      get_value: function (id: string, column: any, node: any) {
        // const selectedValue = dateEditor.get_value.apply(this, [
        //   id,
        //   column,
        //   node,
        // ]);
        // if (selectedValue) return gantt.date.add(selectedValue, 1, 'day');

        // return selectedValue;
        return getInput(node).value || 0;
      },

      is_changed: function (value: any, id: any, column: any, node: any) {
        //called before save/close. Return true if new value differs from the original one
        //returning true will trigger saving changes, returning false will skip saving

        const currentValue = this.get_value(id, column, node);

        if (currentValue && value && currentValue.valueOf && value.valueOf) {
          return currentValue.valueOf() != value.valueOf();
        } else {
          return currentValue != value;
        }
      },

      is_valid: function (value: any, id: any, column: any, node: any) {
        const tempTask = gantt.getTask(id);
        if (!gantt.isWorkTime({ date: new Date(value), task: tempTask }))
          Notification.sendNotification(
            moment(new Date(value)).format('DD MMM yyyy') +
              ' is not a working day. Please choose a working day ',
            AlertTypes.error
          );

        if (
          value &&
          new Date(value).getFullYear() < new Date().getFullYear() + 50
        ) {
          const task = gantt.getTask(id);
          // if (gantt.getTask(id).start_date < value)
          // return gantt.isWorkTime(gantt?.date?.add(value, -1, 'day'));
          if (
            (column == 'plannedEndDate' &&
              new Date(task.plannedStartDate).valueOf() >
                new Date(value).valueOf()) ||
            (column == 'actualEndDate' &&
              new Date(task.actualStartDate).valueOf() >
                new Date(value).valueOf())
          ) {
            return false;
          } else if (
            (column == 'actualStartDate' &&
              new Date(value).valueOf() > new Date().valueOf()) ||
            (column == 'actualEndDate' &&
              new Date(value).valueOf() > new Date().valueOf())
          ) {
            return false;
          } else {
            return gantt.isWorkTime({ date: new Date(value), task: tempTask });
          }
        }
      },

      save: function (id: any, column: any, node: any) {
        const currentValue = this.get_value(id, column, node);
        const task = gantt.getTask(id);

        switch (column.name) {
          case 'plannedStartDate': {
            const endDate = gantt.calculateEndDate({
              start_date: moment(new Date(currentValue))
                .startOf('day')
                .toDate(),
              duration: task.duration,
              task,
            });
            if (task.type == 'milestone') {
              gantt.updateTask(id, {
                ...task,
                plannedStartDate: transformDateToString(new Date(currentValue)),
                plannedEndDate: transformDateToString(new Date(currentValue)),
                end_date: moment(new Date(currentValue))
                  .startOf('day')
                  .toDate(),
                start_date: moment(new Date(currentValue))
                  .startOf('day')
                  .toDate(),
              });
            } else if (task.status == 'To-Do') {
              gantt.updateTask(id, {
                ...task,
                plannedStartDate: currentValue,
                plannedEndDate: transformDateToString(
                  endDateDecreaseByOneDay(endDate)
                ),
                end_date: endDate,
                start_date: moment(new Date(currentValue))
                  .startOf('day')
                  .toDate(),
              });
            } else {
              gantt.updateTask(id, {
                ...task,
                plannedStartDate: currentValue,
                plannedEndDate: transformDateToString(
                  endDateDecreaseByOneDay(
                    gantt.calculateEndDate({
                      start_date: moment(new Date(currentValue))
                        .startOf('day')
                        .toDate(),
                      duration: task.plannedDuration,
                      task,
                    })
                  )
                ),
              });
            }
            break;
          }
          case 'plannedEndDate': {
            const endDate = endDateIncreaseByOneDay(currentValue);

            const duration = gantt.calculateDuration({
              start_date: new Date(task.plannedStartDate),
              end_date: endDate,
              task,
            });
            if (task.type == 'milestone') {
              gantt.updateTask(id, {
                ...task,
                plannedStartDate: transformDateToString(new Date(currentValue)),
                plannedEndDate: transformDateToString(new Date(currentValue)),
                end_date: moment(new Date(currentValue))
                  .startOf('day')
                  .toDate(),
                start_date: moment(new Date(currentValue))
                  .startOf('day')
                  .toDate(),
              });
            } else if (task.status == 'To-Do') {
              gantt.updateTask(id, {
                ...task,
                plannedEndDate: currentValue,
                plannedDuration: duration,
                end_date: endDate,
                duration: duration,
              });
            } else {
              gantt.updateTask(id, {
                ...task,
                plannedEndDate: currentValue,
                plannedDuration: duration,
              });
            }
            break;
          }
          case 'actualStartDate': {
            if (task.status == 'In-Progress') {
              const endDate = gantt.calculateEndDate({
                start_date: moment(new Date(currentValue))
                  .startOf('day')
                  .toDate(),
                duration: task.plannedDuration,
                task,
              });
              gantt.updateTask(id, {
                ...task,
                actualStartDate: currentValue,
                estimatedEndDate: transformDateToString(
                  endDateDecreaseByOneDay(endDate)
                ),
                end_date: endDate,
                start_date: moment(new Date(currentValue))
                  .startOf('day')
                  .toDate(),
              });
            } else {
              const endDate = gantt.calculateEndDate({
                start_date: moment(new Date(currentValue))
                  .startOf('day')
                  .toDate(),
                duration: task.actualDuration,
                task,
              });
              gantt.updateTask(id, {
                ...task,
                actualStartDate: currentValue,
                actualEndDate: transformDateToString(
                  endDateDecreaseByOneDay(endDate)
                ),
                start_date: moment(new Date(currentValue))
                  .startOf('day')
                  .toDate(),
                end_date: endDate,
              });
            }
            break;
          }
          case 'actualEndDate': {
            const endDate = endDateIncreaseByOneDay(currentValue);
            const duration = gantt.calculateDuration({
              start_date: new Date(task.actualStartDate),
              end_date: endDate,
              task,
            });
            if (task.status == 'Complete') {
              gantt.updateTask(id, {
                ...task,
                actualEndDate: currentValue,
                actualDuration: duration,
                end_date: endDate,
                duration: duration,
              });
            }
            break;
          }

          case 'estimatedEndDate': {
            const endDate = endDateIncreaseByOneDay(currentValue);
            const duration = gantt.calculateDuration({
              start_date: new Date(task.actualStartDate),
              end_date: endDate,
              task,
            });
            gantt.updateTask(id, {
              ...task,
              estimatedEndDate: currentValue,
              estimatedDuration: duration,
              end_date: endDate,
              duration: duration,
            });
            break;
          }
        }

        updateParentTaskDates(task, column.name, addUpdatedTask);
        gantt.showTask(task.id);
        // only for inputs with map_to:auto. complex save behavior goes here
      },
      focus: function (node: any) {
        const input = getInput(node);
        if (!input) {
          return;
        }
        if (input.focus) {
          input.focus();
        }

        if (input.select) {
          input.select();
        }
      },
    };

    gantt.config.editor_types.custom_duration_editor = {
      show: function (id: any, column: any, config: any, placeholder: any) {
        // called when input is displayed, put html markup of the editor into placeholder
        // and initialize your editor if needed:
        const min = config.min || 1,
          max = config.max || 100;

        const html =
          "<div><input type='number' min='" +
          min +
          "' max='" +
          max +
          "' name='" +
          column.name +
          "'></div>";
        placeholder.innerHTML = html;
      },
      set_value: function (value: any, id: string, column: any, node: any) {
        if (value) {
          // const correctedValue = gantt.date.add(value, -1, 'day');
          getInput(node).value = value[column.name];
          // return dateEditor.set_value.apply(this, [value, id, column, node]);
        }
      },
      get_value: function (id: string, column: any, node: any) {
        // const selectedValue = dateEditor.get_value.apply(this, [
        //   id,
        //   column,
        //   node,
        // ]);
        // if (selectedValue) return gantt.date.add(selectedValue, 1, 'day');

        // return selectedValue;
        return getInput(node).value || 1;
      },
      is_changed: function (value: any, id: any, column: any, node: any) {
        const currentValue = this.get_value(id, column, node);
        return Number(value) !== Number(currentValue);
      },
      is_valid: function (value: any, id: any, column: any, node: any) {
        if (parseInt(value, 10) > 0) {
          return !isNaN(parseInt(value, 10));
        } else {
          1;
        }
      },
      save: function (id: any, column: any, node: any) {
        const currentValue = Number(this.get_value(id, column, node));
        const task = gantt.getTask(id);

        switch (column.name) {
          case 'plannedDuration': {
            const endDate = gantt.calculateEndDate({
              start_date: moment(new Date(task.plannedStartDate))
                .startOf('day')
                .toDate(),
              duration: currentValue,
              task,
            });
            if (task.status == 'To-Do') {
              gantt.updateTask(id, {
                ...task,
                plannedEndDate: transformDateToString(
                  endDateDecreaseByOneDay(endDate)
                ),
                plannedDuration: currentValue,
                end_date: endDate,
                duration: currentValue,
              });
            } else {
              gantt.updateTask(id, {
                ...task,
                plannedEndDate: transformDateToString(
                  endDateDecreaseByOneDay(endDate)
                ),
                plannedDuration: currentValue,
              });
            }
            break;
          }
          case 'estimatedDuration':
          case 'actualDuration': {
            const endDate = gantt.calculateEndDate({
              start_date: moment(new Date(task.actualStartDate))
                .startOf('day')
                .toDate(),
              duration: currentValue,
              task,
            });
            if (task.status == 'In-Progress') {
              gantt.updateTask(id, {
                ...task,
                estimatedEndDate: transformDateToString(
                  endDateDecreaseByOneDay(endDate)
                ),
                estimatedDuration: currentValue,
                end_date: endDate,
                duration: currentValue,
              });
            } else {
              gantt.updateTask(id, {
                ...task,
                actualEndDate: transformDateToString(
                  endDateDecreaseByOneDay(endDate)
                ),
                actualDuration: currentValue,
                end_date: endDate,
                duration: currentValue,
              });
            }
            break;
          }
        }
        updateParentTaskDates(task, column.name, addUpdatedTask);
      },
      focus: function (node: any) {
        const input = getInput(node);
        if (!input) {
          return;
        }
        if (input.focus) {
          input.focus();
        }

        if (input.select) {
          input.select();
        }
      },
    };

    gantt.config.editor_types.start_date = gantt.mixin(
      {
        is_valid: function (value: any, id: any, column: any, node: any) {
          if (value && value.getFullYear() < new Date().getFullYear() + 50) {
            if (!gantt.isWorkTime(value))
              Notification.sendNotification(
                value + 'is non working day ',
                AlertTypes.error
              );
            return gantt.isWorkTime(value);
          }
        },
      },
      dateEditor,
      false
    );
  };

  const ganttLinkTemplateConfig = () => {
    gantt.templates.link_class = (link) => {
      if (
        cpCalculation &&
        gantt.getTask(link.source).floatValue === 0 &&
        gantt.getTask(link.target).floatValue === 0
      ) {
        link.color = 'red';
      } else {
        link.color = 'black';
      }
      return '';
    };
  };

  const getProjectTask = () => {
    return gantt.getTaskByTime().filter((task) => task.parent === 0);
  };

  const checkProjectStartInFuture = () => {
    return (
      gantt.date.week_start(getProjectTask()[0].start_date) >=
      gantt.date.week_start(new Date())
    );
  };

  const setLookaheadCurrentWeek = (argCWeekNo = 0) => {
    gantt.config.scale_height = 25;
    gantt.config.scales = [
      {
        unit: 'day',
        step: 1,
        date: '%d %D',
        css: function (date: Date) {
          if (!gantt.isWorkTime(date)) {
            return 'weekend_lookahead';
          }
          return 'gantt_secondary_scale';
        },
      },
    ];

    let targetDate = new Date();
    if (checkProjectStartInFuture()) {
      targetDate = new Date(getProjectTask()[0].start_date);
      setDisplayWeekNo(1);
    }

    let startDate = gantt.date.week_start(
      new Date(targetDate.setDate(targetDate.getDate() + argCWeekNo * 7))
    );

    const projectEndWeekStartDate = gantt.date.week_start(
      new Date(getProjectTask()[0].end_date)
    );

    let endDate;
    let endDateDisplay;

    if (startDate > projectEndWeekStartDate) {
      startDate = projectEndWeekStartDate;
      endDate = gantt.date.add(
        gantt.date.week_start(new Date(getProjectTask()[0].end_date)),
        7,
        'day'
      );
      endDateDisplay = gantt.date.add(
        gantt.date.week_start(new Date(getProjectTask()[0].end_date)),
        6,
        'day'
      );
      setDisplayWeekNo(-1);
    } else {
      endDate = gantt.date.add(gantt.date.week_start(startDate), 7, 'day');
      endDateDisplay = gantt.date.add(
        gantt.date.week_start(startDate),
        6,
        'day'
      );
    }

    //if (!gantt.getTaskByTime(startDate, endDate).length) return;

    gantt.config.start_date = startDate;
    gantt.config.end_date = endDate;
    gantt.render();

    const currentWStartDate = moment(startDate).format('DD MMM YYYY');
    const currentWEndDate = moment(endDateDisplay).format('DD MMM YYYY');
    setCurrentWeek({
      weekNo: argCWeekNo,
      dates: `${currentWStartDate} - ${currentWEndDate}`,
    });
    setCLookAheadWeek(argCWeekNo);
  };

  const setLookaheadWeek = () => {
    gantt.config.scale_height = 45;
    gantt.config.scales = [
      {
        unit: 'day',
        step: 1,
        date: '%d',
        css: function (date: Date) {
          return 'gantt_secondary_scale';
        },
      },
      {
        unit: 'week',
        step: 1,
        format: weekScaleTemplateWithNumber,
        css: function (date: Date) {
          return 'gantt_secondary_scale_lookahead';
        },
      },
    ];

    let offset = -1;
    checkProjectStartInFuture() ? (offset = 0) : (offset = -1);
    let targetDate = new Date();
    checkProjectStartInFuture()
      ? (targetDate = new Date(getProjectTask()[0].start_date))
      : null;

    const startDate = gantt.date.week_start(
      new Date(targetDate.setDate(targetDate.getDate() + offset * 7))
    );
    const targetLastWeekDate =
      offset == 0
        ? targetDate.getDate() + 35 + offset * 7
        : targetDate.getDate() + 42 + offset * 7;
    const endDate = gantt.date.add(
      gantt.date.week_start(new Date(targetDate.setDate(targetLastWeekDate))),
      7,
      'day'
    );
    //const sValue: unknown = undefined;

    gantt.config.start_date = gantt.date.week_start(
      getProjectTask()[0]?.start_date
    );
    gantt.config.end_date = gantt.date.add(
      getProjectTask()[0]?.end_date,
      7,
      'day'
    );

    const selectedTasks = gantt.getTaskByTime(startDate, endDate);

    let atleastOneTaskFound = false;
    for (let i = 0; i < selectedTasks.length; i++) {
      if (selectedTasks[i].start_date >= startDate) {
        gantt.showTask(selectedTasks[i]?.id);
        atleastOneTaskFound = true;
        break;
      }
    }

    !atleastOneTaskFound ? gantt.showDate(startDate) : null;
    gantt.render();
  };

  const isWeekContainsTask = (weekNo: number) => {
    let targetDate = new Date();
    if (checkProjectStartInFuture()) {
      targetDate = new Date(getProjectTask()[0].start_date);
    }

    const startDate = gantt.date.week_start(
      new Date(targetDate.setDate(targetDate.getDate() + weekNo * 7))
    );
    const endDate = gantt.date.add(gantt.date.week_start(startDate), 7, 'day');

    if (!gantt.getTaskByTime(startDate, endDate).length) {
      return false;
    } else {
      return true;
    }
  };

  const goToPrevoiusWeek = () => {
    if (isWeekContainsTask(currentWeek.weekNo - 1))
      setLookaheadCurrentWeek(currentWeek.weekNo - 1);
  };

  const goToNextWeek = () => {
    if (isWeekContainsTask(currentWeek.weekNo + 1))
      setLookaheadCurrentWeek(currentWeek.weekNo + 1);
  };

  const setLookAheadbar = () => {
    let offset = -1;
    checkProjectStartInFuture() ? (offset = 0) : (offset = -1);
    let targetDate = new Date();
    checkProjectStartInFuture()
      ? (targetDate = new Date(getProjectTask()[0].start_date))
      : null;

    const lookaheadStartDate = gantt.date.week_start(
      new Date(targetDate.setDate(targetDate.getDate() + offset * 7))
    );
    const lookaheadStartDateString =
      moment(lookaheadStartDate).format('DD MMM YYYY');

    const targetLastWeekDate =
      offset == 0
        ? targetDate.getDate() + 35 + offset * 7
        : targetDate.getDate() + 42 + offset * 7;

    //if lookahead week is less than 6 week
    let lookaheadEndDate = '';
    const lastWeekDate = new Date(targetDate.setDate(targetLastWeekDate));
    if (
      gantt.date.add(gantt.date.week_start(lastWeekDate), 6, 'day') <
      new Date(getProjectTask()[0]?.end_date)
    ) {
      lookaheadEndDate = moment(
        gantt.date.add(gantt.date.week_start(lastWeekDate), 6, 'day')
      ).format('DD MMM YYYY');
    } else {
      const daysDifference =
        gantt.date
          .add(
            gantt.date.week_start(new Date(getProjectTask()[0]?.end_date)),
            6,
            'day'
          )
          .getTime() - gantt.date.week_start(lookaheadStartDate).getTime();
      setLookAheadWeekNumber(
        Math.ceil(daysDifference / (1000 * 60 * 60 * 24) / 7)
      );
      setCompletedProjectLookAhead(
        moment(
          gantt.date.week_start(new Date(getProjectTask()[0]?.start_date))
        ).format('DD MMM YYYY') +
          ' - ' +
          moment(
            gantt.date.add(
              gantt.date.week_start(new Date(getProjectTask()[0]?.end_date)),
              6,
              'day'
            )
          ).format('DD MMM YYYY')
      );
      lookaheadEndDate = moment(
        gantt.date.add(
          gantt.date.week_start(new Date(getProjectTask()[0]?.end_date)),
          6,
          'day'
        )
      ).format('DD MMM YYYY');
    }
    setLookAheadWeek(`${lookaheadStartDateString} - ${lookaheadEndDate}`);
  };

  const resetTimeLineScale = () => {
    gantt.config.scale_height = 50;
    gantt.config.scales = [
      {
        unit: 'week',
        step: 1,
        format: weekScaleTemplate,
        css: function (date: Date) {
          return 'gantt_scale_cell_style';
        },
      },
      {
        unit: 'day',
        step: 1,
        date: '%d',
        css: function (date: Date) {
          if (!gantt.isWorkTime(date)) {
            return 'weekend';
          }
          return '';
        },
      },
    ];
    const sValue: unknown = undefined;
    gantt.config.start_date = sValue as Date;
    gantt.config.end_date = sValue as Date;
    gantt.render();
  };

  function leftRightTextUpdate() {
    // To show right side triangle for summary task

    gantt.templates.rightside_text = function (start, end, task) {
      let className = '';
      let boldText = '';

      // Check if task text overflows
      if (detectOverflow(task, true)) {
        boldText = '<b>' + task.text + '</b>';
      }

      // Check if task is not a project and has children
      if (task.type != gantt.config.types.project && gantt.hasChild(task.id)) {
        switch (task.type) {
          case gantt.config.types.task:
            className = 'summarytask';
            break;
          case gantt.config.types.wbs:
            className = 'summarywbs';
            break;
          case gantt.config.types.work_package:
            className = 'summaryworkpackage';
            break;
          case gantt.config.types.project_phase:
            className = 'summaryprojectphase';
            break;
        }
        if (cpCalculation && task.floatValue != 0) {
          className = 'summarycp';
        }

        if (gantt.hasChild(task.id) && task.parent != 0) {
          return `<div class='project-right ${className}'></div>`;
        }
        return `<div><div class='project-right ${className}'></div>
        <span>${boldText} </span>
        </div>`;
      }
      return boldText;
    };

    //To show left side triangle for summary task
    gantt.templates.leftside_text = function (start, end, task) {
      let className = '';
      let boldText = '';

      // Check if task text overflows
      if (detectOverflow(task, true)) {
        boldText = '<b>' + task.text + '</b>';
      }

      // Check if task is not a project and has children
      if (task.type != gantt.config.types.project && gantt.hasChild(task.id)) {
        switch (task.type) {
          case gantt.config.types.task:
            className = 'summarytask';
            break;
          case gantt.config.types.wbs:
            className = 'summarywbs';
            break;
          case gantt.config.types.work_package:
            className = 'summaryworkpackage';
            break;
          case gantt.config.types.project_phase:
            className = 'summaryprojectphase';
            break;
        }
        if (cpCalculation && task.floatValue != 0) {
          className = 'summarycp';
        }

        if (gantt.hasChild(task.id) && task.parent != 0) {
          return `<div class='project-left ${className}'></div>`;
        }

        return `<div class='project-left ${className}'>${boldText}</div>`;
      }
      return boldText;
    };
  }

  return (
    <div className="gantt-container">
      <div className="gantt-container__left">
        <div>
          <DehazeIcon
            onClick={onToggleGrid}
            className="gantt-container__left__expand"
          />
        </div>
        {sidePanel ? (
          ''
        ) : (
          <div className="gantt-container__left__title">Activity List</div>
        )}

        {false ? (
          ''
        ) : (
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            className="gantt-container__left__columnName"
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'center',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            anchorReference="anchorPosition"
            anchorPosition={{ top: 178, left: leftMargin }}
          >
            <div>
              {DefaultColumnDetails &&
                DefaultColumnDetails.map((item: any) => (
                  <Typography
                    key={item.label}
                    className="gantt-container__left__columnName__typography"
                    onClick={() => columnUpdate(item.labelText, item.check)}
                  >
                    {item.labelText}{' '}
                    <CheckIcon
                      className={`gantt-container__left__columnName__checkIcon ${
                        !item.check
                          ? 'gantt-container__left__columnName__hideTickIcon'
                          : ''
                      }`}
                    ></CheckIcon>
                  </Typography>
                ))}
            </div>
          </Popover>
        )}
      </div>
      <div className="gantt-container__right">
        {lookAheadStatus ? (
          <>
            <div className="gantt-container__right__lookup">
              {lookAheadWeekNumber > 0 ? (
                <span>
                  <span className="gantt-container__right__lookup__week">
                    {' '}
                    {lookAheadWeekNumber} week - LOOK AHEAD View -{' '}
                  </span>
                  <span className="gantt-container__right__lookup__days">
                    {' '}
                    {lookAheadWeek}{' '}
                  </span>
                </span>
              ) : (
                <span>{completedProjectLookAhead}</span>
              )}
            </div>
            {lookAheadStatus && lookAheadView == 'week' && (
              <div className="gantt-container__right__lookupWeek">
                <div className="gantt-container__right__lookupWeek__back">
                  <IconButton
                    className="gantt-container__right__lookupWeek__back__btn"
                    onClick={goToPrevoiusWeek}
                  >
                    <ArrowBackIosIcon fontSize="small" />
                  </IconButton>
                </div>
                <div className="gantt-container__right__lookupWeek__current">
                  {Number(currentWeek.weekNo) + displayWeekNo > 0 && (
                    <span className="gantt-container__right__lookupWeek__current__week">
                      Week {Number(currentWeek.weekNo) + displayWeekNo} -
                    </span>
                  )}
                  {currentWeek.dates}
                </div>
                <div className="gantt-container__right__lookupWeek__next">
                  <IconButton
                    className="gantt-container__right__lookupWeek__next__btn"
                    onClick={goToNextWeek}
                  >
                    <ArrowForwardIosIcon fontSize="small" />
                  </IconButton>
                </div>
              </div>
            )}
          </>
        ) : (
          ''
        )}
        <div
          className={`${
            state.isDrawerOpen
              ? 'gantt-container__right__shrink'
              : 'gantt-container__right__closed'
          }`}
          ref={containerRef}
        ></div>
      </div>

      {warningMessage.open && (
        <ConfirmDialog
          data-testid="warningMessage"
          open={warningMessage.open}
          message={{
            text: warningMessage.text,
            proceed: warningMessage.proceed,
            warningIcon: true,
          }}
          proceed={() => {
            setWarningMessage({
              open: false,
              text: '',
              header: '',
              proceed: 'Okay',
            });
          }}
        />
      )}
    </div>
  );
}
