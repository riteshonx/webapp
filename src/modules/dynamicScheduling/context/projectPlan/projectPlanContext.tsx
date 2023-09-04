import { createContext } from 'react';
import { ProductivityInputType } from '../../features/ProjectPlan/components/EditTaskDetailsViewProductivity/EditTaskDetailsViewProductivity';

type ProjectPlanContextInterface = {
  cacheTasks: any;
  newTasks: any;
  ganttAction: string;
  newLinks: any;
  currentTask: any;
  updatedLinks: any;
  projectPlan: any;
  deletedTaskIds: any;
  cpCalculation: boolean;
  xmlImport: boolean;
  projectMetaData: any;
  lookAheadStatus: boolean;
  currentLookaheadWeek: number;
  lookAheadAction: any;
  calendar: any;
  calendarList: any;
  projectUser: any;
  newTasksAssignee: any;
  partialUpdateTasks: any;
  projectScheduleMetadata: any;
  updatedTask: any;
  deletedLinkIds: any;
  tenantCompanyList: any;
  summaryTaskProgress: any;
  currentView: string;
  currentScale: string;
  currentVersionList: any;
  clearNewTask: any;
  expandAllButtonFlag: boolean;
  partialUpdatesIds: any;
  savePlanSuccessCall: any;
  saveProjectPlan: (
    saveProjectPlanPayload: any,
    tasks: any,
    callback: any
  ) => any;
  getProjectPlan: (searchText?: boolean) => any;
  setNewTasks: (task: any) => any;
  setUpdatedLinks: (links: string) => any;
  setGanttAction: (action: string) => any;
  setCurrentTask: (task: any) => any;
  refreshProjectPlan: (data: any) => any;
  deleteTasks: (Ids: any) => any;
  setCpCalculation: (flag: boolean) => any;
  setXmlImport: (flag: boolean) => any;
  getProjectMetaData: (loader?: any) => any;
  editProjectMetaData: (status: string, userId: string) => any;
  setLookAheadStatus: (status: boolean) => any;
  setCurrentLookaheadWeek: (no: number) => any;
  setLookAheadAction: (type: any) => any;
  getProjectPlanCalendar: () => any;
  getProjectUsers: () => any;
  setNewTasksAssignee: (tasksAssignee: any) => any;
  getPartialUpdatedTasks: () => any;
  bulkUpdateIsDeleteStatus: (
    taskIds: any,
    isApproved: boolean,
    projectId: any
  ) => any;
  taskStatusUpdateApi: (taskDetails: any) => any;
  getProjectScheduleMetaData: () => any;
  updateProjectScheduleMetaData: (data: any) => any;
  addUpdatedTask: (task: any) => any;
  addDeletedLink: (linkId: any) => any;
  setNewLinks: (links: string) => any;
  setMultipleNewLinks: (links: string) => any;
  getChildTask: (parentId: any) => any;
  getProjectPlanAllTask: (expandAll: any) => any;
  getProjectPlanAllTaskAndParse: (data: any) => any;
  getProjectPlanByTaskId: (taskId: string) => any;
  setTaskFromPublishMode: (data: any) => any;
  clearTaskFromPublishMode: () => any;
  uploadFileToS3: (item: any, file: any) => any;
  getRecipeTaskAndAddToNewTask: (wpRecipe: any, parentTaskId: string) => any;
  deleteNewTask: (taskId: any) => any;
  clearUpdatedTask: () => any;
  deleteUpdatedTask: (id: any) => any;
  updateSerialNumber: (data: any) => any;
  getTenantCompanies: () => any;
  setCurrentView: (view: string) => any;
  setCurrentScale: (scale: string) => any;
  saveVersion: (data: any) => any;
  getVersions: () => any;
  getVersionDataById: (id: any) => any;
  deleteVersion: (id: any) => any;
  getAllTaskForRecipeSelection: () => void;
  updateProjectProductivity: (
    variables: ProductivityInputType
  ) => Promise<void>;
  updateProjectMetaDataImportType: (type: string) => any;
  setExpandAllButtonFlag: (flagValue: boolean) => any;
  setPartialUpdatesIds: (ids: any) => any;
  setSavePlanSuccessCall: (flag: any) => any;
  getInsightDemoApi: (tenantId: any, projectId: any) => any;
  productHistoryApiCall: () => any;
  getAllProjectPlanCalendar: () => any;
};

const projectPlanContextDefaultValues: ProjectPlanContextInterface = {
  cacheTasks: {},
  newTasks: null,
  ganttAction: '',
  currentTask: null,
  newLinks: {},
  updatedLinks: [],
  projectPlan: {},
  deletedTaskIds: [],
  cpCalculation: false,
  xmlImport: false,
  projectMetaData: {},
  lookAheadStatus: false,
  currentLookaheadWeek: 0,
  lookAheadAction: '',
  calendar: {},
  calendarList: [],
  projectUser: {},
  newTasksAssignee: {},
  partialUpdateTasks: [],
  projectScheduleMetadata: {},
  updatedTask: {},
  deletedLinkIds: [],
  tenantCompanyList: {},
  currentView: '',
  currentScale: '',
  currentVersionList: [],
  expandAllButtonFlag: false,
  partialUpdatesIds: [],
  savePlanSuccessCall: false,

  saveProjectPlan: () => {
    // do nothing.
  },
  getProjectPlan: () => {
    // do nothing.
  },
  setNewTasks: () => {
    // do nothing.
  },
  setUpdatedLinks: () => {
    // do nothing.
  },

  setGanttAction: () => {
    // do nothing
  },
  setCurrentTask: () => {
    // do nothing
  },
  refreshProjectPlan: () => {
    // do nothing
  },

  deleteTasks: () => {
    // do nothing
  },

  setCpCalculation: () => {
    // do nothing
  },

  setXmlImport: () => {
    // do nothing
  },
  getProjectMetaData: (loader: any) => {
    // do nothing
  },

  editProjectMetaData: () => {
    // do nothing
  },

  setLookAheadStatus: () => {
    // do nothing
  },

  setCurrentLookaheadWeek: () => {
    // do nothing
  },

  setLookAheadAction: () => {
    // do nothing
  },

  getProjectPlanCalendar: () => {
    // do nothing
  },

  getProjectUsers: () => {
    //  do nothing
  },

  setNewTasksAssignee: () => {
    // do nothing.
  },
  getPartialUpdatedTasks: () => {
    // do nothing
  },

  bulkUpdateIsDeleteStatus: () => {
    // do nothing
  },

  taskStatusUpdateApi: () => {
    // do nothing
  },

  getProjectScheduleMetaData: () => {
    // do nothing
  },

  updateProjectScheduleMetaData: () => {
    // do nothing
  },

  addUpdatedTask: () => {
    // do nothing
  },

  addDeletedLink: () => {
    // do nothing
  },

  setNewLinks: () => {
    // donothing
  },

  setMultipleNewLinks: () => {
    // donothing
  },

  getChildTask: () => {
    // do nothing
  },

  getProjectPlanAllTask: (expandAll: any) => {
    // do nothing
  },
  getProjectPlanAllTaskAndParse: (data: any) => {
    // do nothing
  },
  getProjectPlanByTaskId: () => {
    // do nothing
  },
  setTaskFromPublishMode: () => {
    // do nothing
  },
  clearTaskFromPublishMode: () => {
    // do nothing
  },
  uploadFileToS3: () => {
    // do nothing
  },
  getRecipeTaskAndAddToNewTask: () => {
    // do nothing
  },

  deleteNewTask: () => {
    // do nothing
  },
  clearUpdatedTask: () => {
    // do nothing
  },

  deleteUpdatedTask: (id: any) => {
    // do nothing
  },

  updateSerialNumber: (data: any) => {
    // do nothing
  },
  getTenantCompanies: () => {
    // do nothing
  },
  summaryTaskProgress: () => {
    // do nothing
  },
  setCurrentView: (view: string) => {
    // do nothing
  },
  setCurrentScale: (scale: string) => {
    // do nothing
  },

  saveVersion: (data: any) => {
    // do nothing
  },
  getVersions: () => {
    // do nothing
  },

  getVersionDataById: (id: any) => {
    // do nothing
  },

  deleteVersion: (id: any) => {
    // do nothing
  },
  getAllTaskForRecipeSelection: () => {
    // do nothing
  },
  clearNewTask: () => {
    // do nothing
  },
  updateProjectProductivity: async () => {
    // do nothing
  },
  updateProjectMetaDataImportType: (type: string) => {
    //  do nothing
  },
  setExpandAllButtonFlag: (flagValue: boolean) => {
    //  do nothing
  },

  setPartialUpdatesIds: (ids: any) => {
    // do nothing
  },

  setSavePlanSuccessCall: (flag: any) => {
    // do nothing
  },

  getInsightDemoApi: (tenantId: any, projectId: any) => {
    // do nothing
  },
  productHistoryApiCall: () => {
    // do nothing
  },

  getAllProjectPlanCalendar: () => {
    // do nothing
  },
};

const projectPlanContext = createContext<ProjectPlanContextInterface>(
  projectPlanContextDefaultValues
);

export default projectPlanContext;
