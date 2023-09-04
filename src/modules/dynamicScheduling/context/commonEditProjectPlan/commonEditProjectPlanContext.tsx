import { createContext } from 'react';

type CommonEditProjectPlanContext = {
  parentTasks: any;
  currentTaskConstraint: any;
  currentTaskVariances: any;
  currentTaskMaterial: any;
  projectMaterials: any;
  categoryList: any;
  relatedTasks: any;
  currentTask: any;
  projectTokens: any;
  projectUser: any;
  tenantCompanyList: any;
  lookAheadStatus: boolean;
  formFeatures: any;
  projectMetaData: any;
  projectProductivity: any;
  currentTaskLinkedForm: any;
  draftSelectedFormLinks: any;
  selectedFeature: any;
  selectedFeatureFormsList: any;
  isLoading: boolean;

  updateParentTaskList: (id: string) => any;
  updateTaskStatus: (id: string, status: string, date: any) => any;
  moveTaskInToDo: (id: string) => any;
  moveTaskToInProgress: (id: string, estimatedDate: any) => any;
  moveTaskToInCompleted: (
    id: string,
    actualEnddDate: any,
    actualDuration: any
  ) => any;
  updateLpsStatus: (id: string, lpsStatus: any) => any;
  getConstraintsByTaskId: (id: any) => any;
  updateConstraintById: (constraint: any, index: any) => any;
  updateConstraintStatus: (constraint: any, index: any) => any;
  getVariancesByTaskId: (id: any) => any;
  deleteConstraint: (constraint: any) => any;

  addConstraint: (constraint: any) => any;
  updateStartAndEndDate: (id: any, startDate: any, endDate: any) => any;
  updateEndDateAndDuration: (id: any, endDate: any, duration: any) => any;
  updateActualStartDate: (
    id: any,
    actualStartDate: any,
    estimateEndDate: any
  ) => any;

  updateActualStartDateAndActualEndDate: (
    id: any,
    actualStartDate: any,
    actualEndDate: any
  ) => any;

  updateActualEndDateAndDuration: (
    id: any,
    actualEndDate: any,
    duration: any
  ) => any;
  updateEstimatedEndDateAndDuration: (
    id: any,
    estimatedEndDate: any,
    duration: any
  ) => any;
  getProjectMaterials: () => any;
  clearProjectMaterials: () => any;
  addBulkMaterialToTask: (material: any) => any;
  getProjectTaskMaterial: (projectId: any) => any;
  deleteProjectTaskAssociatedMaterial: (id: any) => any;
  updateTaskAssignee: (id: string[], assignee: string | null) => any;
  updateProjectTaskAssociatedMaterial: (material: any) => any;
  addVariance: (variance: any) => any;
  updateVarianceById: (variance: any, index: any) => any;
  deleteVariance: (variance: any) => any;
  updateCommitmentCost: (id: any, commitmentCost: any) => any;
  updatePayoutCost: (id: any, payoutCost: any) => any;
  partialUpdateLpsStatus: (id: string, lpsStatus: string) => any;
  partialMoveTaskInToDo: (id: string) => any;
  getCustomListByName: (name: any) => any;
  clearEditProjectPlanState: () => any;
  getRelatedTasks: (id: any) => any;
  updateResponsibleContractor: (id: number | string, contractor: string) => any;
  setCurrentTask: (task: any) => any;
  fetchProjectExchangeToken: (projectId: any) => any;
  setLookAheadAction: (data: any) => any;
  getTenantCompanies: () => any;
  fetchFormFeatures: (task: any) => any;
  getProjectUsers: (task: any) => any;
  getProjectMetaData: (task: any) => any;
  getProjectProductivity: (task: any) => any;
  setDraftSelectedFormLinks: (payload: any) => any;
  linkFormToTask: (taskId: any, linkData: any) => any;
  getLinkedForm: (task: any) => any;
  deleteLinkedForm: (linkIds: any, taskId: any) => any;
  updateLinkedForm: (linkId: any, linkTypeId: any) => any;
  fetchFormData: () => any;
  updateProjectProductivity: (varianles: any) => any;
  getChildTask: (task: any) => any;
  selectFeature: (param: any) => any;
  setSelectedFeatureFormList: (param: any) => any;
  getProjectMaterialsBasedOnSearch: (text:any) => any;
};

const commonEditProjectPlanContextDefaultValue: CommonEditProjectPlanContext = {
  parentTasks: [],
  currentTaskConstraint: [],
  currentTaskVariances: [],
  projectMaterials: [],
  currentTaskMaterial: [],
  categoryList: [],
  relatedTasks: [],
  currentTask: {},
  projectTokens: {},
  projectUser: [],
  tenantCompanyList: [],
  lookAheadStatus: false,
  formFeatures: [],
  projectMetaData: {},
  projectProductivity: {},
  currentTaskLinkedForm: [],
  draftSelectedFormLinks: [],
  selectedFeature: null,
  selectedFeatureFormsList: [],
  isLoading: false,

  updateParentTaskList: () => {
    // do nothing
  },

  updateTaskStatus: (id: string, status: string, date: any) => {
    // do nothing
  },

  moveTaskInToDo: (id: string) => {
    // do nothing
  },

  moveTaskToInProgress: (id: string, estimatedDate: any) => {
    //  do nothing
  },

  moveTaskToInCompleted: (
    id: string,
    actualEndDate: any,
    actualDuration: any
  ) => {
    // do nothing
  },

  updateLpsStatus: (id: string, lpsStatus: string) => {
    // do nothing
  },
  getConstraintsByTaskId: (id: any): any => {
    // do nothing
  },

  updateConstraintById: (constraint: any, index: any) => {
    // do nothing
  },
  updateConstraintStatus: (constraint: any, index: any) => {
    // do nothing
  },

  getVariancesByTaskId: (id: any) => {
    //  do nothing
  },

  deleteConstraint: (constraint: any) => {
    // do  nothing
  },

  addConstraint: (constraint: any) => {
    // do nothing
  },

  updateStartAndEndDate: (id: any, startDate: any, endDate: any) => {
    //  do nothing
  },

  updateEndDateAndDuration: (id: any, endDate: any, duration: any) => {
    // do nothing
  },
  updateActualStartDate: (
    id: any,
    actualStartDate: any,
    estimateEndDate: any
  ) => {
    //  do nothing
  },
  updateActualStartDateAndActualEndDate: (
    id: any,
    actualStartDate: any,
    actualEndDate: any
  ) => {
    //  do nothing
  },

  updateActualEndDateAndDuration: (
    id: any,
    actualEndDate: any,
    duration: any
  ) => {
    //  do nothing
  },

  updateEstimatedEndDateAndDuration: (
    id: any,
    estimatedEndDate: any,
    duration: any
  ) => {
    //  do nothing
  },

  getProjectMaterials: () => {
    // do nothing
  },

  clearProjectMaterials: () => {
    // do nothing
  },

  addBulkMaterialToTask: (material: any) => {
    //  do nothing
  },
  getProjectTaskMaterial: (projectId: any) => {
    //  do nothing
  },
  updateTaskAssignee: (id: string[], assignee: string | null) => {
    //  do nothing
  },
  deleteProjectTaskAssociatedMaterial: (id: any) => {
    // do nothing
  },

  updateProjectTaskAssociatedMaterial: (material: any) => {
    // do nothing
  },
  addVariance: (variance: any) => {
    // do nothing
  },
  updateVarianceById: (variance: any, index: any) => {
    // do nothing
  },
  deleteVariance: (variance: any) => {
    // do nothing
  },
  updateCommitmentCost: (id: any, commitmentCost: any) => {
    //  do nothing
  },
  updatePayoutCost: (id: any, payoutCost: any) => {
    //  do nothing
  },
  partialUpdateLpsStatus: (id: string, lpsStatus: string) => {
    // do nothing
  },
  partialMoveTaskInToDo: (id: string) => {
    // do nothing
  },
  getCustomListByName: () => {
    // do nothing
  },

  clearEditProjectPlanState: () => {
    // do nothing
  },

  getRelatedTasks: (id: any) => {
    // do nothing
  },
  updateResponsibleContractor: (id: number | string, contractor: string) => {
    // do nothing
  },
  setCurrentTask: (task: any) => {
    // do nothing
  },

  fetchProjectExchangeToken: (projectId: any) => {
    // do nothing
  },

  setLookAheadAction: (data: any) => {
    //  do nothing
  },
  getTenantCompanies: () => {
    // do nothing
  },

  fetchFormFeatures: (task: any) => {
    //  do nothing
  },

  getProjectUsers: (task: any) => {
    //  do nothing
  },

  getProjectMetaData: (task: any) => {
    // do nothing
  },
  getProjectProductivity: (task: any) => {
    // do nothing
  },

  setDraftSelectedFormLinks: (payload: any) => {
    // do nothing
  },
  linkFormToTask: (taskId: any, linkData: any) => {
    // do nothing
  },
  getLinkedForm: (task: any) => {
    // do nothing
  },
  deleteLinkedForm: (linkIds: any, taskId: any) => {
    // do nothing
  },
  updateLinkedForm: (linkId: any, linkTypeId: any) => {
    // do nothing
  },
  fetchFormData: () => {
    //  do nothing
  },
  updateProjectProductivity: (variables: any) => {
    //  do nothing
  },

  getChildTask: (task: any) => {
    //  do nothing
  },

  selectFeature: (param: any) => {
    // do nothing
  },
  setSelectedFeatureFormList: (param: any) => {
    // do nothing
  },
  getProjectMaterialsBasedOnSearch: (text:any) => {
    // do nothing
  },
};
const commonEditProjectPlanContext =
  createContext<CommonEditProjectPlanContext>(
    commonEditProjectPlanContextDefaultValue
  );

export default commonEditProjectPlanContext;
