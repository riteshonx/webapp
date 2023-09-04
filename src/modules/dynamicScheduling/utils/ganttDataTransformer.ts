import { gantt } from 'dhtmlx-gantt';
import moment from 'moment';
import 'moment-timezone';
import { endDateDecreaseByOneDay } from './ganttConfig';

interface responseTasks {
  id: string;
  parentId: any;
  taskType: string;
  taskName: string;
  plannedStartDate: string;
  plannedEndDate: string;
  plannedDuration: number;
  actualStartDate: string;
  actualEndDate: string;
  actualDuration: number;
  createdBy: string;
  assignedTo: any;
  updatedBy: string;
  serialNumber: number;
  externalId: any;
  floatValue: number;
  isCritical: boolean;
  level: number;
  status: string;
  assignedToUser?: any;
  lpsStatus: string | null;
  recipeSetId: any;
  recipeId: any;
  scheduleRecipeSet?: any;
  commitmentCost: number | null;
  payoutCost: number | null;
  tenantAssociationByTenantidCreatedby?: any;
  tenantCompanyAssociation?: any;
  hasChild?: boolean;
  estimatedEndDate?: string;
  estimatedDuration?: number;
  responsibleContractor: string | number | null;
  importMaterials?: boolean | null;
  calendarId?: any;
}

export interface ganttTasks {
  id: string;
  type: string;
  text: string;
  start_date: string;
  duration: number;
  parent: string;
  end_date: string;
  assignedTo: any;
  createdBy: string;
  updatedBy: string;
  serialNumber: number;
  externalId: any;
  floatValue: number;
  isCritical: boolean;
  $level: number;
  open?: boolean;
  $index?: number;
  status: string;
  assigneeName: string;
  responsibleContractor: string | number | null;
  actualStartDate: string;
  actualEndDate: string;
  actualDuration: number;
  lpsStatus: string | null;
  recipeSetId: any;
  recipeId: any;
  recipeSetName: any;
  commitmentCost: number | null;
  payoutCost: number | null;
  createdByFirstName?: string;
  plannedStartDate: string;
  plannedEndDate: string;
  plannedDuration: number;
  $has_child?: boolean;
  estimatedEndDate?: string;
  estimatedDuration?: number;
  importMaterials?: boolean | null;
  show: boolean;
  tenantCompanyAssociation?: any;
  calendar_id?: any;
}

interface ganttLinks {
  id: string;
  source: string;
  target: string;
  type: string;
  lag: number;
  createdBy: string;
  color: string;
}

interface reponseLinks {
  id: string;
  lag: number;
  source: string;
  target: string;
  type: string;
  createdBy: string;
}

interface ganttObject {
  data: ganttTasks[];
  links: ganttLinks[];
}

interface responseObject {
  data: {
    tasks: responseTasks[];
    links: reponseLinks[];
  };
}

interface saveProjectPlanPayload {
  tasks: responseTasks[];
  deleteTasksIds: string[];
  links: reponseLinks[];
}

export const responseToGantt = (data: responseObject): ganttObject => {
  const returnValue: ganttObject = { data: [], links: [] };

  for (let i = 0; i < data.data.tasks.length; i++) {
    let end_date: any = moment(
      data.data.tasks[i].status == 'Complete'
        ? data.data.tasks[i].actualEndDate
        : data.data.tasks[i].status === 'In-Progress'
        ? data.data.tasks[i].estimatedEndDate
        : data.data.tasks[i].plannedEndDate
    );
    let estimatedEndDate: any = null;
    let estimatedDuration: any = null;

    if (data.data.tasks[i].taskType !== 'milestone') {
      end_date.add(1, 'd');
    }

    if (
      data.data.tasks[i].status === 'In-Progress' &&
      !data.data.tasks[i].estimatedEndDate
    ) {
      end_date = gantt.calculateEndDate({
        start_date: moment(new Date(data.data.tasks[i].actualStartDate))
          .startOf('day')
          .toDate(),
        duration: data.data.tasks[i].plannedDuration,
      });
      estimatedDuration = data.data.tasks[i].plannedDuration;

      const date = new Date(end_date);

      date.setDate(new Date(end_date).getDate() - 1);

      estimatedEndDate = transformDateToString(date);
      end_date = moment(end_date);
    }

    returnValue.data.push({
      id: data.data.tasks[i].id,
      text: data.data.tasks[i].taskName,
      type: data.data.tasks[i].taskType.toLowerCase(),
      parent: data.data.tasks[i].parentId || 0,
      start_date:
        data.data.tasks[i].status == 'Complete' ||
        data.data.tasks[i].status == 'In-Progress'
          ? data.data.tasks[i].actualStartDate
          : data.data.tasks[i].plannedStartDate,
      end_date: end_date.format('YYYY/MM/DD'),
      duration:
        data.data.tasks[i].status === 'To-Do'
          ? data.data.tasks[i].plannedDuration && data.data.tasks.length > 1
            ? data.data.tasks[i].plannedDuration
            : 1
          : data.data.tasks[i].actualDuration,
      assignedTo: data.data.tasks[i].assignedTo,
      assigneeName: generateUserName(data.data.tasks[i]),
      responsibleContractor:
        data?.data?.tasks[i]?.tenantCompanyAssociation?.id || null,
      tenantCompanyAssociation: data?.data?.tasks[i]?.tenantCompanyAssociation,
      responsibleCompany:
        data?.data?.tasks[i]?.tenantCompanyAssociation?.name || '-',
      createdBy: data.data.tasks[i].createdBy,
      updatedBy: data.data.tasks[i].updatedBy,
      serialNumber: data.data.tasks[i].serialNumber,
      externalId: data.data.tasks[i].externalId,
      floatValue: data.data.tasks[i].floatValue,
      isCritical: data.data.tasks[i].isCritical,
      $level: data.data.tasks[i].level,
      status: data.data.tasks[i].status,
      open: !data.data.tasks[i].parentId ? true : false,
      actualStartDate: data.data.tasks[i].actualStartDate,
      actualEndDate: data.data.tasks[i].actualEndDate,
      actualDuration: data.data.tasks[i].actualDuration,
      lpsStatus: data.data.tasks[i].lpsStatus,
      recipeSetId: data.data.tasks[i].recipeSetId,
      recipeId: data.data.tasks[i].recipeId,
      recipeSetName: data.data.tasks[i].scheduleRecipeSet?.recipeName || '-',
      commitmentCost: data.data.tasks[i].commitmentCost,
      payoutCost: data.data.tasks[i].payoutCost,
      createdByFirstName:
        data.data.tasks[i]?.tenantAssociationByTenantidCreatedby?.user
          .firstName,
      plannedStartDate: data.data.tasks[i].plannedStartDate,
      plannedEndDate: data.data.tasks[i].plannedEndDate,
      plannedDuration:
        data.data.tasks[i].taskType.toLowerCase() !== 'milestone' &&
        !data.data.tasks[i].plannedDuration
          ? 1
          : data.data.tasks[i].plannedDuration,
      $has_child: data.data.tasks[i].hasChild
        ? data.data.tasks[i].hasChild
        : false,
      estimatedEndDate: data.data.tasks[i].estimatedEndDate
        ? data.data.tasks[i].estimatedEndDate
        : estimatedEndDate,
      estimatedDuration: data.data.tasks[i].estimatedDuration
        ? data.data.tasks[i].estimatedDuration
        : estimatedDuration,
      show: true,
      calendar_id: data.data.tasks[i].calendarId,
    });
  }

  for (let i = 0; i < data.data.links.length; i++) {
    returnValue.links.push({
      id: data.data.links[i].id,
      source: data.data.links[i].source,
      target: data.data.links[i].target,
      type: data.data.links[i].type,
      lag: data.data.links[i].lag,
      createdBy: data.data.links[i].createdBy,
      color: 'black',
    });
  }
  return returnValue;
};

export const ganttToPayload = (
  tasks: ganttTasks[],
  links: ganttLinks[]
): saveProjectPlanPayload => {
  const returnPayload: saveProjectPlanPayload = {
    tasks: [],
    links: [],
    deleteTasksIds: [],
  };
  for (let i = 0; i < tasks.length; i++) {
    const tempTask = tasks[i];
    const date = new Date(tempTask.end_date);
    if (tempTask.type !== 'milestone') {
      date.setDate(new Date(tempTask.end_date).getDate() - 1);
    }
    returnPayload.tasks.push({
      id: tempTask.id,
      taskName: tempTask.text,
      taskType: tempTask.type.toLowerCase(),
      parentId: tempTask.parent == '0' ? null : tempTask.parent,
      plannedStartDate:
        tempTask.status == 'To-Do'
          ? transformDate(tempTask.start_date)
          : tempTask.plannedStartDate, //"2021-06-06",
      plannedEndDate:
        tempTask.status == 'To-Do' && tempTask.type.toLowerCase() != 'milestone'
          ? transformDateToString(endDateDecreaseByOneDay(tempTask.end_date))
          : tempTask.plannedEndDate,
      // tempTask.type === ' milestone'
      // ? transformDate(tempTask.end_date)
      // : transformDate(date.toDateString()), //"2021-06-08",
      plannedDuration:
        tempTask.status == 'To-Do'
          ? tempTask.duration
          : tempTask.plannedDuration,
      createdBy: tempTask.createdBy,
      updatedBy: tempTask.createdBy,
      serialNumber: tempTask.serialNumber || 0,
      externalId: tempTask.externalId || null,
      assignedTo: tempTask.assignedTo || null,
      floatValue: !tempTask.parent ? 0 : tempTask.floatValue,
      isCritical: !tempTask.floatValue ? true : false,
      level:
        tempTask.$level == 0 && tasks[0].parent
          ? gantt.getTask(tempTask.id).$level
          : tempTask.$level,
      status: tempTask.status,
      actualStartDate: tempTask.actualStartDate,
      // ? transformDate(tempTask.actualStartDate)
      // : tempTask.actualStartDate,
      actualEndDate:
        tempTask.status == 'Complete'
          ? transformDateToString(endDateDecreaseByOneDay(tempTask.end_date))
          : tempTask.actualEndDate,
      actualDuration: tempTask.actualDuration,
      lpsStatus: tempTask.lpsStatus === '' ? null : tempTask.lpsStatus,
      recipeSetId: tempTask.recipeSetId ? tempTask.recipeSetId : null,
      recipeId: tempTask.recipeId ? tempTask.recipeId : null,
      commitmentCost: tempTask.commitmentCost ? tempTask.commitmentCost : null,
      payoutCost: tempTask.payoutCost ? tempTask.payoutCost : null,
      hasChild: tempTask.$has_child ? tempTask.$has_child : false,
      estimatedEndDate:
        tempTask.status == 'In-Progress'
          ? transformDateToString(endDateDecreaseByOneDay(tempTask.end_date))
          : tempTask.estimatedEndDate,
      estimatedDuration: tempTask.estimatedDuration,
      responsibleContractor: tempTask.responsibleContractor
        ? tempTask.responsibleContractor
        : null,
      importMaterials: tempTask.importMaterials
        ? tempTask.importMaterials
        : null,
    });
  }

  for (let i = 0; i < links.length; i++) {
    const tempLinks = links[i];
    returnPayload.links.push({
      id: tempLinks.id,
      source: tempLinks.source,
      target: tempLinks.target,
      type: tempLinks.type,
      lag: tempLinks.lag ? tempLinks.lag : 0,
      createdBy: tempLinks.createdBy,
    });
  }

  return returnPayload;
};

export const transformDate = (date: string): string => {
  moment.tz.setDefault(); // reset timezone
  return moment(date).format('YYYY-MM-DD');
  // const month = moment(date).getMonth() + 1;
  // if (typeof date === 'string') {
  //   return `${new Date(date).getFullYear()}-${month}-${new Date(
  //     date
  //   ).getDate()}`;
  // } else {
  //   return `${new Date(date).getFullYear()}-${month}-${new Date(
  //     date
  //   ).getDate()}`;
  // }
};

export const transformDateToString = (date: Date): string => {
  moment.tz.setDefault(); // reset timezone
  return moment(date).format('YYYY-MM-DD');
  // const month = new Date(date).getMonth() + 1;
  // return `${new Date(date).getFullYear()}-${month}-${new Date(date).getDate()}`;
};

export const generateUserName = (task: any): string => {
  if (task.assignedTo) {
    const name = task?.assignedToUser?.firstName
      ? `${task?.assignedToUser?.firstName || ''} ${
          task?.assignedToUser?.lastName || ''
        }`
      : task?.assignedToUser?.email.split('@')[0];
    return name;
  } else return '-';
};

export const responseToGanttSingleTask = (task: any) => {
  return {
    id: task.id,
    text: task.taskName,
    type: task.taskType.toLowerCase(),
    parent: task.parentId || 0,
    assignedTo: task.assignedTo,
    assigneeName: generateUserName(task),
    responsibleContractor: task.responsibleContractor,
    createdBy: task.createdBy,
    updatedBy: task.updatedBy,
    serialNumber: task.serialNumber,
    externalId: task.externalId,
    floatValue: task.floatValue,
    isCritical: task.isCritical,
    $level: task.level,
    status: task.status,
    open: !task.parentId ? true : false,
    actualStartDate: task.actualStartDate,
    actualEndDate: task.actualEndDate,
    actualDuration: task.actualDuration,
    lpsStatus: task.lpsStatus,
    recipeSetId: task.recipeSetId,
    recipeId: task.recipeId,
    recipeSetName: task.scheduleRecipeSet?.recipeName || '-',
    commitmentCost: task.commitmentCost,
    payoutCost: task.payoutCost,
    createdByFirstName:
      task?.tenantAssociationByTenantidCreatedby?.user.firstName,
    plannedStartDate: task.plannedStartDate,
    plannedEndDate: task.plannedEndDate,
    plannedDuration:
      task.taskType.toLowerCase() !== 'milestone' && !task.plannedDuration
        ? 1
        : task.plannedDuration,
    $has_child: task.hasChild ? task.hasChild : false,
    estimatedEndDate: task.estimatedEndDate,
    estimatedDuration: task.estimatedDuration,
    show: true,
    projectId: task.projectId,
    projectName: task.projectName,
  };
};
