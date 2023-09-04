import { gantt } from 'dhtmlx-gantt';
import moment from 'moment';
import { useReducer } from 'react';
import { projectExchangeTokenFeatures } from 'src/modules/authentication/utils';
import { setIsLoading } from 'src/modules/root/context/authentication/action';
import { postApi, postApiWithProjectExchange } from 'src/services/api';
import {
  decodeExchangeToken,
  decodeProjectFormExchangeToken,
} from '../../../../services/authservice';
import { client } from '../../../../services/graphql';
import {
  featureFormRoles,
  projectFeatureAllowedRoles,
  tenantCompanyRole,
} from '../../../../utils/role';
import Notification, {
  AlertTypes,
} from '../../../shared/components/Toaster/Toaster';
import { LOAD_CONFIGURATION_LIST_VALUES } from '../../graphql/queries/customList';
import {
  DELETE_TASK_FORM_LINK,
  FETCH_LIST_FORMS,
  GET_TASK_LINKED_FORM,
  INSERT_TASK_FORM_LINK,
  UPDATE_LINK_FORM,
} from '../../graphql/queries/dataLinks';
import {
  CREATE_DRAFT_FORM_ADD_CONSTRANT,
  CREW_MASTER_ASSIGNEE_FROM_TASK_DETAILS,
  DELETE_CONSTRAINT,
  DELETE_VARIANCE,
  GET_RELATED_TASKS_QUERY,
  MOVE_TASK_IN_TODO,
  UPDATE_CONSTRAINT_NAME_AND_CATEGORY,
  UPDATE_CONSTRAINT_STATUS,
  UPDATE_PROJECT_TASK_ASSIGNEE,
  UPDATE_PROJECT_TASK_COMMITMENT_COST,
  UPDATE_PROJECT_TASK_PAYOUT_COST,
  UPDATE_RESPONSIBLE_CONTRACTOR,
  UPDATE_TASK_LPS_STATUS,
} from '../../graphql/queries/editTaskDetails';
import {
  CREATE_TASK_CONSTRAINTS,
  GET_TASK_CONSTRAINTS_ORDER_BY_STATUS,
} from '../../graphql/queries/lookahead';
import {
  IS_DELETE_STATUS_PARTIAL_UPDATE,
  PARTIAL_COMPLETE_TASK,
  PARTIAL_MOVE_TASK_IN_TODO,
  PARTIAL_MOVE_TASK_TO_IN_COMPLETED,
  PARTIAL_MOVE_TASK_TO_IN_PROGRESS,
  PARTIAL_START_TASK,
  PARTIAL_UPDATE_PROJECT_TASK_ACTUAL_END_DATE_AND_DURATION,
  PARTIAL_UPDATE_PROJECT_TASK_ACTUAL_START_DATE_AND_ACTUAL_END_DATE,
  PARTIAL_UPDATE_PROJECT_TASK_ACTUAL_START_DATE_AND_ESTIMATED_END_DATE,
  PARTIAL_UPDATE_PROJECT_TASK_END_DATE_DURATION,
  PARTIAL_UPDATE_PROJECT_TASK_ESTIMATED_END_DATE_AND_DURATION,
  PARTIAL_UPDATE_PROJECT_TASK_START_DATE_END_DATE,
  PARTIAL_UPDATE_TASK_LPS_STATUS,
} from '../../graphql/queries/partialUpdate';
import { GET_ALL_PROJECT_MATERIALS, GET_PROJECT_MATERIALS_BASED_ON_SEARCH } from '../../graphql/queries/projectMaterial';
import {
  GET_ALL_PROJECT_USERS_QUERY,
  GET_CHILD_TASK,
  GET_PROJECT_SCHEDULE_METADATA,
  GET_TENANT_COMPANIES,
} from '../../graphql/queries/projectPlan';
import {
  GET_PROJECT_PRODUCTIVITY,
  UPDATE_PROJECT_PRODUCTIVITY,
} from '../../graphql/queries/projectProductivity';
import {
  ADD_BULK_MATERIAL_TO_TASK,
  DELETE_PROJECT_TASK_ASSOCIATED_MATERIAL,
  GET_PROJECT_TASK_MATERIAL,
  UPDATE_PROJECT_TASK_ASSOCIATED_MATERIAL,
} from '../../graphql/queries/projectTaskMaterial';
import {
  CREATE_TASK_VARIANCE,
  GET_TASK_VARIANCES,
  UPDATE_TASK_VARIANCE,
} from '../../graphql/queries/weeklyplan';
import { priorityPermissionsByToken } from '../../permission/scheduling';
import {
  responseToGantt,
  transformDate,
  transformDateToString,
} from '../../utils/ganttDataTransformer';
import {
  DRAFT_SELECTED_FORM_LINKS,
  FORM_FEATURES,
  GET_LINKED_FORM,
  SELECT_FEATURE,
  SELECT_FEATURE_FORM_LIST,
} from '../editProjectPlanLinks/types';
import {
  GET_ALL_PROJECT_USERS,
  GET_PROJECT_SCHEDULE_META_DATA,
} from '../projectPlan/types';
import CommonEditProjectPlanContext from './commonEditProjectPlanContext';
import commonEditProjectPlanReducer from './commonEditProjectPlanReducer';
import {
  COMMON_CLEAR_EDIT_PROJECT_PLAN_STATE,
  COMMON_DELETE_PROJECT_TASK_MATERIAL,
  COMMON_GET_CUSTOM_LIST,
  COMMON_GET_PROJECT_MATERIALS,
  COMMON_GET_PROJECT_TASK_MATERIALS,
  COMMON_GET_RELATED_TASKS,
  COMMON_GET_TENANT_COMPANIES_LIST,
  COMMON_SET_CURRENT_TASK,
  COMMON_SET_LOOKAHEAD_ACTION,
  COMMON_SET_PROJECT_TOKEN,
  COMMON_SET_TASK_CONSTRAINTS,
  COMMON_SET_TASK_VARIANCES,
  COMMON_UPDATE_PARENT_TASKS,
  COMMON_UPDATE_PROJECT_TASK_MATERIAL,
} from './types';

export interface ProductivityInputType {
  id: string[];
  plannedLabourHour?: string | null;
  plannedQuantity?: number | null;
  classificationCodeId: number | null;
}
const EditProjectPlanState = (props: any) => {
  const initialState = {
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
    selectedFeatureFormsList: [],
    tenantCompanyList: [],
    lookAheadStatus: false,
    formFeatures: [],
    selectedFeature: null,
    projectProductivity: {},
    currentTaskLinkedForm: [],
    draftSelectedFormLinks: [],
    isLoading: false,
  };
  const [state, dispatch] = useReducer(
    commonEditProjectPlanReducer,
    initialState
  );
  const { currentTask, projectTokens } = state;

  const updateParentTaskList = (id: string) => {
    if (!id) {
      dispatch({ type: COMMON_UPDATE_PARENT_TASKS, payload: [] });
    } else {
      const parents = [];
      parents.push(gantt.getTask(id));
      let tempId = gantt.getTask(id).parent;
      while (tempId != 0) {
        parents.push(gantt.getTask(tempId));
        tempId = gantt.getTask(tempId).parent;
      }
      dispatch({
        type: COMMON_UPDATE_PARENT_TASKS,
        payload: parents.reverse(),
      });
    }
  };

  const updateTaskStatus = async (id: string, status: string, date: any) => {
    try {
      dispatch(setIsLoading(true));

      const resDeleteStatus = await client.mutate({
        mutation: IS_DELETE_STATUS_PARTIAL_UPDATE,
        variables: {
          isDeleted: true,
          taskId: id,
          checkIsDelete: false,
        },
        context: {
          role: priorityPermissionsByToken(
            'update',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });

      if (status === 'In-Progress') {
        const res = await client.mutate({
          mutation: PARTIAL_START_TASK,
          variables: {
            taskId: id,
            taskStatus: status,
            actualStartDate: transformDateToString(date),
            taskLpsStatus: null,
          },
          context: {
            role: priorityPermissionsByToken(
              'create',
              projectTokens[currentTask.projectId]
            ),
            token: projectTokens[currentTask.projectId],
          },
        });

        // getPartialUpdatedTasks();
      }

      if (status === 'Complete') {
        const res = await client.mutate({
          mutation: PARTIAL_COMPLETE_TASK,
          variables: {
            taskId: id,
            taskStatus: status,
            actualEndDate: transformDateToString(date),
            taskLpsStatus: null,
            actualDuration:
              gantt.calculateDuration({
                start_date: moment(
                  transformDateToString(currentTask.actualStartDate)
                )
                  .startOf('date')
                  .toDate(),
                end_date: moment(transformDateToString(date))
                  .startOf('date')
                  .toDate(),
              }) + 1,
          },
          context: {
            role: priorityPermissionsByToken(
              'create',
              projectTokens[currentTask.projectId]
            ),
            token: projectTokens[currentTask.projectId],
          },
        });

        // getPartialUpdatedTasks();
      }

      dispatch(setIsLoading(false));
      Notification.sendNotification(
        'Your update has been submitted for review',
        AlertTypes.success
      );
    } catch (err) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const updateTaskAssignee = async (
    ids: string[],
    assigneeId: string | null
  ) => {
    try {
      dispatch(setIsLoading(true));
      await client.mutate({
        mutation: UPDATE_PROJECT_TASK_ASSIGNEE,
        variables: { id: ids, assignedTo: assigneeId },
        context: {
          role: priorityPermissionsByToken(
            'update',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });
      if (assigneeId) await crewMasterAssignee(assigneeId);
      dispatch(setIsLoading(false));
    } catch (error) {
      dispatch(setIsLoading(false));
    }
  };

  const updateResponsibleContractor = async (id: any, contractorId: any) => {
    try {
      dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: UPDATE_RESPONSIBLE_CONTRACTOR,
        variables: {
          id: id,
          responsibleContractor: contractorId,
        },
        context: {
          role: priorityPermissionsByToken(
            'update',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });
      dispatch(setIsLoading(false));
    } catch (error) {
      dispatch(setIsLoading(false));
    }
  };
  const partialMoveTaskInToDo = async (id: string) => {
    try {
      dispatch(setIsLoading(true));
      await updateIsDelete(id);

      const res = await client.mutate({
        mutation: PARTIAL_MOVE_TASK_IN_TODO,
        variables: {
          taskId: id,
          taskStatus: 'To-Do',
          actualStartDate: null,
          actualEndDate: null,
          actualDuration: null,
          taskLpsStatus: null,
        },
        context: {
          role: priorityPermissionsByToken(
            'create',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });
      // setCurrentTask({
      //   ...currentTask,
      //   status: 'To-Do',
      //   actualStartDate: null,
      //   actualEndDate: null,
      //   actualDuration: null,
      //   lpsStatus: null,
      // });
      // getPartialUpdatedTasks();
      dispatch(setIsLoading(false));
      Notification.sendNotification(
        'Your update has been submitted for review',
        AlertTypes.success
      );
    } catch (err) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const moveTaskToInProgress = async (id: string, esitmatedDate: any) => {
    try {
      dispatch(setIsLoading(true));

      const resDeleteStatus = await client.mutate({
        mutation: IS_DELETE_STATUS_PARTIAL_UPDATE,
        variables: {
          isDeleted: true,
          taskId: id,
          checkIsDelete: false,
        },
        context: {
          role: priorityPermissionsByToken(
            'update',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });

      const res = await client.mutate({
        mutation: PARTIAL_MOVE_TASK_TO_IN_PROGRESS,
        variables: {
          taskId: id,
          taskStatus: 'In-Progress',
          actualEndDate: null,
          actualDuration: null,
          taskLpsStatus: null,
        },
        context: {
          role: priorityPermissionsByToken(
            'create',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });

      // getPartialUpdatedTasks();

      dispatch(setIsLoading(false));
      Notification.sendNotification(
        'Your update has been submitted for review',
        AlertTypes.success
      );
    } catch (err) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const moveTaskToInCompleted = async (
    id: string,
    actualEndDate: any,
    actualDuration: number
  ) => {
    try {
      dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: PARTIAL_MOVE_TASK_TO_IN_COMPLETED,
        variables: {
          taskId: id,
          taskStatus: 'Complete',
          taskLpsStatus: null,
          actualEndDate: transformDate(actualEndDate),
          actualDuration,
        },
        context: {
          role: priorityPermissionsByToken(
            'create',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });

      // getPartialUpdatedTasks();
      dispatch(setIsLoading(false));
      Notification.sendNotification(
        'Your update has been submitted for review',
        AlertTypes.success
      );
    } catch (err) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const partialUpdateLpsStatus = async (id: string, lpsStatus: string) => {
    try {
      dispatch(setIsLoading(true));
      await updateIsDelete(id);
      const res = await client.mutate({
        mutation: PARTIAL_UPDATE_TASK_LPS_STATUS,
        variables: { id, status: 'To-Do', taskLpsStatus: lpsStatus },
        context: {
          role: priorityPermissionsByToken(
            'create',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });

      // getPartialUpdatedTasks();
      dispatch(setIsLoading(false));
      Notification.sendNotification(
        'Your update has been submitted for review',
        AlertTypes.success
      );
    } catch (err) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const getConstraintsByTaskId = async (currentTask: any) => {
    try {
      dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: GET_TASK_CONSTRAINTS_ORDER_BY_STATUS,
        variables: {
          taskIds: [currentTask.id],
        },
        context: {
          role: priorityPermissionsByToken(
            'view',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });
      dispatch(setIsLoading(false));
      dispatch({
        type: COMMON_SET_TASK_CONSTRAINTS,
        payload: res.data.projectTaskConstraints,
      });
    } catch (err) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const updateConstraintById = async (constraint: any, index: any = null) => {
    try {
      dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: UPDATE_CONSTRAINT_NAME_AND_CATEGORY,
        variables: {
          id: constraint.id,
          category: constraint.category,
          constraintName: constraint.constraintName,
          description: constraint.description,
          dueDate: constraint.dueDate
            ? transformDate(constraint.dueDate)
            : null,
          userAssignee: constraint.userAssignee,
          companyAssignee: constraint.companyAssignee,
        },
        context: {
          role: priorityPermissionsByToken(
            'update',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });
      dispatch(setIsLoading(false));
      if (index != null) {
        const tempConstraint = state.currentTaskConstraint;
        tempConstraint[index] = constraint;
        dispatch({
          type: COMMON_SET_TASK_CONSTRAINTS,
          payload: tempConstraint,
        });
      }
    } catch (err) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const updateConstraintStatus = async (constraint: any, index: any = null) => {
    try {
      dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: UPDATE_CONSTRAINT_STATUS,
        variables: {
          id: constraint.id,
          status: constraint.status,
        },
        context: {
          role: priorityPermissionsByToken(
            'update',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });
      dispatch(setIsLoading(false));

      getConstraintsByTaskId(currentTask);
    } catch (err) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const getVariancesByTaskId = async (currentTask: any) => {
    try {
      dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: GET_TASK_VARIANCES,
        variables: {
          taskIds: [currentTask.id],
        },
        context: {
          role: priorityPermissionsByToken(
            'view',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });
      dispatch(setIsLoading(false));
      dispatch({
        type: COMMON_SET_TASK_VARIANCES,
        payload: res.data.projectTaskVariance,
      });
    } catch (err) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const deleteConstraint = async (constraint: any) => {
    try {
      dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: DELETE_CONSTRAINT,
        variables: {
          id: constraint.id,
        },
        context: {
          role: priorityPermissionsByToken(
            'delete',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });
      dispatch(setIsLoading(false));
      Notification.sendNotification(
        'Constraint deleted successfully',
        AlertTypes.success
      );
      getConstraintsByTaskId(currentTask);
    } catch (err) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const addConstraint = async (constraint: any) => {
    try {
      dispatch(setIsLoading(true));

      if (constraint.category === 'Form') {
        const res = await client.mutate({
          mutation: CREATE_DRAFT_FORM_ADD_CONSTRANT,
          variables: {
            category: constraint.category + '-' + constraint.feature,
            subject: constraint.constraintName,
            taskId: constraint.taskId,
            featureId: constraint.featureId,
            description: constraint.description,
            dueDate: constraint.dueDate
              ? transformDate(constraint.dueDate)
              : null,
            userAssignee: constraint.userAssignee,
            companyAssignee: constraint.companyAssignee,
          },
          context: {
            role: priorityPermissionsByToken(
              'create',
              projectTokens[currentTask.projectId]
            ),
            token: projectTokens[currentTask.projectId],
          },
        });
      } else {
        const res = await client.mutate({
          mutation: CREATE_TASK_CONSTRAINTS,
          variables: {
            object: {
              category: constraint.category,
              constraintName: constraint.constraintName,
              taskId: constraint.taskId,
              linkId: constraint.linkId ? constraint.linkId : null,
              status: constraint.status ? constraint.status : 'open',
              description: constraint.description,
              dueDate: constraint.dueDate
                ? transformDate(constraint.dueDate)
                : null,
              userAssignee: constraint.userAssignee,
              companyAssignee: constraint.companyAssignee,
            },
          },
          context: {
            role: priorityPermissionsByToken(
              'create',
              projectTokens[currentTask.projectId]
            ),
            token: projectTokens[currentTask.projectId],
          },
        });
      }
      dispatch(setIsLoading(false));
      getConstraintsByTaskId(currentTask);
      Notification.sendNotification(
        'Constraint added successfully',
        AlertTypes.success
      );
      return '';
    } catch (err) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const updateStartAndEndDate = async (
    id: any,
    startDate: any,
    endDate: any
  ) => {
    try {
      dispatch(setIsLoading(true));
      await updateIsDelete(id);
      const res = await client.mutate({
        mutation: PARTIAL_UPDATE_PROJECT_TASK_START_DATE_END_DATE,
        variables: {
          taskId: id,
          plannedStartDate: startDate,
          plannedEndDate: endDate,
        },
        context: {
          role: priorityPermissionsByToken(
            'create',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });
      dispatch(setIsLoading(false));
      Notification.sendNotification(
        'Your update has been submitted for review',
        AlertTypes.success
      );
      // getPartialUpdatedTasks();
    } catch (err) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const updateEndDateAndDuration = async (
    id: any,
    endDate: any,
    duration: any
  ) => {
    try {
      dispatch(setIsLoading(true));
      await updateIsDelete(id);
      const partialStatus = 'PLANNED_DURATION';
      const res = await client.mutate({
        mutation: PARTIAL_UPDATE_PROJECT_TASK_END_DATE_DURATION,
        variables: {
          taskId: id,
          plannedDuration: duration,
          plannedEndDate: endDate,
          partialUpdateStatus: partialStatus,
        },
        context: {
          role: priorityPermissionsByToken(
            'create',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });
      // getPartialUpdatedTasks();
      dispatch(setIsLoading(false));
      Notification.sendNotification(
        'Your update has been submitted for review',
        AlertTypes.success
      );
    } catch (err) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const updateActualStartDate = async (
    id: any,
    actualStartDate: any,
    estimatedEndDate: any
  ) => {
    try {
      dispatch(setIsLoading(true));
      await updateIsDelete(id);
      const res = await client.mutate({
        mutation:
          PARTIAL_UPDATE_PROJECT_TASK_ACTUAL_START_DATE_AND_ESTIMATED_END_DATE,
        variables: {
          taskId: id,
          actualStartDate: actualStartDate,
          taskStatus: 'In-Progress',
        },
        context: {
          role: priorityPermissionsByToken(
            'create',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });
      dispatch(setIsLoading(false));
      Notification.sendNotification(
        'Your update has been submitted for review',
        AlertTypes.success
      );
      // getPartialUpdatedTasks();
    } catch (err) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const updateActualStartDateAndActualEndDate = async (
    id: any,
    actualStartDate: any,
    actualEndDate: any
  ) => {
    try {
      dispatch(setIsLoading(true));
      await updateIsDelete(id);
      const res = await client.mutate({
        mutation:
          PARTIAL_UPDATE_PROJECT_TASK_ACTUAL_START_DATE_AND_ACTUAL_END_DATE,
        variables: {
          taskId: id,
          actualStartDate: actualStartDate,
          actualEndDate: actualEndDate,
          taskStatus: 'Complete',
        },
        context: {
          role: priorityPermissionsByToken(
            'create',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });
      dispatch(setIsLoading(false));
      // getPartialUpdatedTasks();
      Notification.sendNotification(
        'Your update has been submitted for review',
        AlertTypes.success
      );
    } catch (err) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const updateActualEndDateAndDuration = async (
    id: any,
    actualEndDate: any,
    duration: any
  ) => {
    try {
      dispatch(setIsLoading(true));
      await updateIsDelete(id);
      const res = await client.mutate({
        mutation: PARTIAL_UPDATE_PROJECT_TASK_ACTUAL_END_DATE_AND_DURATION,
        variables: {
          taskId: id,
          actualDuration: duration,
          actualEndDate: actualEndDate,
          taskStatus: 'Complete',
        },
        context: {
          role: priorityPermissionsByToken(
            'create',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });
      // getPartialUpdatedTasks();
      dispatch(setIsLoading(false));
    } catch (err) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const getProjectMaterials = async () => {
    try {
      dispatch(setIsLoading(true));

      const res = await client.query({
        query: GET_ALL_PROJECT_MATERIALS,
        fetchPolicy: 'network-only',
        context: {
          role: priorityPermissionsByToken(
            'view',
            projectTokens[currentTask.projectId]
          ),

          // role: 'viewTenantMaterialMaster',
          token: projectTokens[currentTask.projectId],
        },
      });
      dispatch({
        type: COMMON_GET_PROJECT_MATERIALS,
        payload: res.data.projectMaterial.map((material: any) => ({
          id: material.id,
          quantityAllocated: material.quantityAllocated,
          category: material.materialMaster.category,
          name: material.materialMaster.materialName,
          type: material.materialMaster.materialType,
          unit: material.materialMaster.unit,
          materialId: material.materialMaster.externalMaterialId,
          carbonCategory: material.materialMaster.carbonCategory,
        })),
      });
      dispatch(setIsLoading(false));
    } catch (e) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(e.message, AlertTypes.error);
    }
  };

  const clearProjectMaterials = () => {
    dispatch({
      type: COMMON_GET_PROJECT_MATERIALS,
      payload: [],
    });
  };

  const addBulkMaterialToTask = async (materials: any) => {
    try {
      dispatch(setIsLoading(true));

      const res = await client.mutate({
        mutation: ADD_BULK_MATERIAL_TO_TASK,
        variables: {
          materials: materials,
        },
        context: {
          role: priorityPermissionsByToken(
            'create',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });

      getProjectTaskMaterial(materials[0].taskId);
      dispatch(setIsLoading(false));
    } catch (e) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(e.message, AlertTypes.error);
    }
  };

  const getProjectTaskMaterial = async (taskId: any) => {
    try {
      dispatch(setIsLoading(true));
      const res = await client.query({
        query: GET_PROJECT_TASK_MATERIAL,
        fetchPolicy: 'network-only',
        variables: {
          taskId: taskId,
        },
        context: {
          role: priorityPermissionsByToken(
            'view',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });
      dispatch({
        type: COMMON_GET_PROJECT_TASK_MATERIALS,
        payload: res.data.projectTaskMaterialAssociation.map(
          (material: any) => ({
            id: material.id,
            quantityAllocated: material.quantityAllocated,
            quantityConsumed: material.quantityConsumed,
            name: material.projectMaterial.materialMaster.materialName,
            unit: material.projectMaterial.materialMaster.unit,
            materialId:
              material.projectMaterial.materialMaster.externalMaterialId,
            carbonCategory:
              material.projectMaterial.materialMaster.carbonCategory,
          })
        ),
      });
      dispatch(setIsLoading(false));
    } catch (e) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(e.message, AlertTypes.error);
    }
  };

  const deleteProjectTaskAssociatedMaterial = async (id: any) => {
    try {
      dispatch(setIsLoading(true));

      const res = await client.mutate({
        mutation: DELETE_PROJECT_TASK_ASSOCIATED_MATERIAL,
        variables: {
          id: id,
        },
        context: {
          role: priorityPermissionsByToken(
            'delete',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });
      dispatch({
        type: COMMON_DELETE_PROJECT_TASK_MATERIAL,
        payload: { id },
      });
      dispatch(setIsLoading(false));
    } catch (e) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(e.message, AlertTypes.error);
    }
  };

  const updateProjectTaskAssociatedMaterial = async (material: any) => {
    try {
      dispatch(setIsLoading(true));

      const res = await client.mutate({
        mutation: UPDATE_PROJECT_TASK_ASSOCIATED_MATERIAL,
        variables: {
          id: material.id,
          quantityAllocated: material.quantityAllocated,
          quantityConsumed: material.quantityConsumed,
        },
        context: {
          role: priorityPermissionsByToken(
            'update',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });
      dispatch({
        type: COMMON_UPDATE_PROJECT_TASK_MATERIAL,
        payload: { material },
      });
      dispatch(setIsLoading(false));
    } catch (e) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(e.message, AlertTypes.error);
    }
  };

  const addVariance = async (variance: any) => {
    //  const temp = constraintList.splice(index, 1);
    try {
      dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: CREATE_TASK_VARIANCE,
        variables: {
          object: {
            category: variance.category,
            varianceName: variance.varianceName,
            taskId: variance.taskId,
          },
        },
        context: {
          role: priorityPermissionsByToken(
            'create',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });
      dispatch(setIsLoading(false));
      getVariancesByTaskId(currentTask);
    } catch (err) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const updateVarianceById = async (variance: any, index: any = null) => {
    try {
      dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: UPDATE_TASK_VARIANCE,
        variables: {
          id: variance.id,
          category: variance.category,
          varianceName: variance.varianceName,
          taskId: variance.taskId,
        },
        context: {
          role: priorityPermissionsByToken(
            'update',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });
      dispatch(setIsLoading(false));
      if (index != null) {
        const tempVariance = state.currentTaskVariances;
        tempVariance[index] = variance;
        dispatch({
          type: COMMON_SET_TASK_VARIANCES,
          payload: tempVariance,
        });
      }
    } catch (err) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const deleteVariance = async (variance: any) => {
    try {
      dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: DELETE_VARIANCE,
        variables: {
          id: variance.id,
        },
        context: {
          role: priorityPermissionsByToken(
            'delete',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });
      dispatch(setIsLoading(false));
      getVariancesByTaskId(currentTask);
    } catch (err) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const updatePayoutCost = async (id: any, payoutCost: any) => {
    try {
      dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: UPDATE_PROJECT_TASK_PAYOUT_COST,
        variables: {
          id: id,
          payoutCost: payoutCost,
        },
        context: {
          role: priorityPermissionsByToken(
            'update',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });
      dispatch(setIsLoading(false));
    } catch (err: any) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const updateCommitmentCost = async (id: any, commitmentCost: any) => {
    try {
      dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: UPDATE_PROJECT_TASK_COMMITMENT_COST,
        variables: {
          id: id,
          commitmentCost: commitmentCost,
        },
        context: {
          role: priorityPermissionsByToken(
            'update',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });
      dispatch(setIsLoading(false));
    } catch (err: any) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };
  const updateIsDelete = async (id: any) => {
    return await client.mutate({
      mutation: IS_DELETE_STATUS_PARTIAL_UPDATE,
      variables: {
        isDeleted: true,
        taskId: id,
        checkIsDelete: false,
      },
      context: {
        role: priorityPermissionsByToken(
          'update',
          projectTokens[currentTask.projectId]
        ),
        token: projectTokens[currentTask.projectId],
      },
    });
  };

  const updateLpsStatus = async (id: string, lpsStatus: string) => {
    if (currentTask.lpsStatus === lpsStatus) {
      return;
    }
    try {
      dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: UPDATE_TASK_LPS_STATUS,
        variables: { id, status: 'To-Do', lpsStatus: lpsStatus },
        context: {
          role: priorityPermissionsByToken(
            'update',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });
      setCurrentTask({ ...currentTask, status: 'To-Do', lpsStatus });

      // gantt.updateTask(currentTask.id, { ...currentTask });
      dispatch(setIsLoading(false));
      Notification.sendNotification(
        'Task Updated successfully',
        AlertTypes.success
      );
    } catch (err) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const moveTaskInToDo = async (id: string) => {
    try {
      dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: MOVE_TASK_IN_TODO,
        variables: {
          id: id,
          status: 'To-Do',
          actualStartDate: null,
          actualEndDate: null,
          actualDuration: null,
          lpsStatus: null,
        },
        context: {
          role: priorityPermissionsByToken(
            'update',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });

      setCurrentTask({
        ...currentTask,
        status: 'To-Do',
        actualStartDate: null,
        actualEndDate: null,
        actualDuration: null,
        lpsStatus: null,
      });
      // gantt.updateTask(currentTask.id, { ...currentTask });
      dispatch(setIsLoading(false));
      Notification.sendNotification(
        'Your update has been submitted for review',
        AlertTypes.success
      );
    } catch (err) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const getCustomListByName = async (name: any) => {
    try {
      dispatch(setIsLoading(true));

      const response: any = await client.query({
        query: LOAD_CONFIGURATION_LIST_VALUES,
        variables: {
          name: `${name}`,
        },
        fetchPolicy: 'network-only',
        context: {
          role: projectFeatureAllowedRoles.viewMasterPlan,
          token: projectTokens[currentTask.projectId],
        },
      });
      if (response.data.configurationLists.length > 0) {
        const categoryListData = response.data.configurationLists[0];
        const projectCategoryList =
          response.data.configurationLists[0].projectConfigAssociations;
        const categoryList: any = [];
        categoryListData.configurationValues.forEach((item: any) => {
          if (projectCategoryList && projectCategoryList.length) {
            const listAssociationIndex = projectCategoryList.findIndex(
              (configId: any) => configId.configValueId === item.id
            );
            if (listAssociationIndex !== -1) {
              const constraintObj: any = {};
              if (item.nodeName.toLowerCase() === 'form') {
                if (
                  priorityPermissionsByToken(
                    'create-form',
                    projectTokens[currentTask.projectId]
                  ) === 'createForm' &&
                  decodeProjectFormExchangeToken(
                    projectTokens[currentTask.projectId]
                  ).createFormIds.length > 2
                ) {
                  constraintObj.value = item.nodeName;
                  categoryList.push(constraintObj);
                }
              } else {
                constraintObj.value = item.nodeName;
                categoryList.push(constraintObj);
              }
            }
          } else {
            const constraintObj: any = {};
            if (item.nodeName.toLowerCase() === 'form') {
              if (
                priorityPermissionsByToken(
                  'create-form',
                  projectTokens[currentTask.projectId]
                ) === 'createForm' &&
                decodeProjectFormExchangeToken(
                  projectTokens[currentTask.projectId]
                ).createFormIds.length > 2
              ) {
                constraintObj.value = item.nodeName;
                categoryList.push(constraintObj);
              }
            } else {
              constraintObj.value = item.nodeName;
              categoryList.push(constraintObj);
            }
          }
        });
        dispatch({
          type: COMMON_GET_CUSTOM_LIST,
          payload: categoryList,
        });
      } else {
        dispatch({
          type: COMMON_GET_CUSTOM_LIST,
          payload: [],
        });
      }
      dispatch(setIsLoading(false));
    } catch (e) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(e.message, AlertTypes.error);
    }
  };

  const clearEditProjectPlanState = () => {
    dispatch({ type: COMMON_CLEAR_EDIT_PROJECT_PLAN_STATE, payload: [] });
  };

  const crewMasterAssignee = async (assigneeId: any) => {
    try {
      dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: CREW_MASTER_ASSIGNEE_FROM_TASK_DETAILS,
        variables: {
          taskAssignee: [assigneeId],
        },
        context: {
          role: priorityPermissionsByToken(
            'create',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });
      dispatch(setIsLoading(false));
    } catch (err) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const updateEstimatedEndDateAndDuration = async (
    id: any,
    estimatedEndDate: any,
    duration: any
  ) => {
    try {
      dispatch(setIsLoading(true));
      await updateIsDelete(id);
      const res = await client.mutate({
        mutation: PARTIAL_UPDATE_PROJECT_TASK_ESTIMATED_END_DATE_AND_DURATION,
        variables: {
          taskId: id,
          estimatedDuration: duration,
          estimatedEndDate: estimatedEndDate,
          taskStatus: 'In-Progress',
        },
        context: {
          role: priorityPermissionsByToken(
            'create',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });
      // getPartialUpdatedTasks();
      dispatch(setIsLoading(false));
      Notification.sendNotification(
        'Your update has been submitted for review',
        AlertTypes.success
      );
    } catch (err) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };
  const getRelatedTasks = async (currentTask: any) => {
    try {
      dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: GET_RELATED_TASKS_QUERY,
        variables: {
          taskId: currentTask.id,
        },
        context: {
          role: priorityPermissionsByToken(
            'view',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });
      dispatch(setIsLoading(false));
      dispatch({
        type: COMMON_GET_RELATED_TASKS,
        payload: res.data,
      });
    } catch (err) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };
  const setCurrentTask = (task: any) => {
    dispatch({ type: COMMON_SET_CURRENT_TASK, payload: task });

    // if (!projectTokens[task.projectId]) {
    //   fetchProjectExchangeToken(task.projectId);
    // }
  };

  const fetchProjectExchangeToken = async (projectId: any) => {
    try {
      dispatch(setIsLoading(true));
      // setFetchingToken(true);
      const ProjectToken: any = {
        tenantId: Number(decodeExchangeToken().tenantId),
        projectId: Number(projectId),
        features: projectExchangeTokenFeatures,
      };
      const projectTokenResponse = await postApi(
        'V1/user/login/exchange',
        ProjectToken
      );
      console.log('projectTokenResponse: ', projectTokenResponse);
      dispatch({
        type: COMMON_SET_PROJECT_TOKEN,
        payload: { projectId: projectId, token: projectTokenResponse.success },
      });
      // setPermission(projectTokenResponse.success);
      dispatch(setIsLoading(false));
      // setFetchingToken(false);
    } catch (error) {
      // setPermission('');
      // setFetchingToken(false);
      dispatch(setIsLoading(false));
    }
  };

  const setLookAheadAction = (data: any) => {
    dispatch({ type: COMMON_SET_LOOKAHEAD_ACTION, payload: data });
  };

  const getTenantCompanies = async () => {
    try {
      dispatch(setIsLoading(true));

      const res = await client.query({
        query: GET_TENANT_COMPANIES,
        variables: {},
        fetchPolicy: 'network-only',
        context: {
          role: tenantCompanyRole.viewTenantCompanies,
        },
      });

      const temp: any = {};
      res.data.tenantCompanyAssociation.forEach((company: any) => {
        const tempCompany = { ...company, flag: 'company' };
        temp[company.id] = tempCompany;
      });
      dispatch({ type: COMMON_GET_TENANT_COMPANIES_LIST, payload: temp });
      dispatch(setIsLoading(false));
    } catch (err) {
      console.log('err: ', err);
      dispatch(setIsLoading(false));
    }
  };

  const setFormFeature = (payload: any) => {
    dispatch({
      type: FORM_FEATURES,
      payload,
    });
  };

  const selectFeature = (payload: any) => {
    dispatch({
      type: SELECT_FEATURE,
      payload,
    });
  };

  const fetchFormFeatures = async (currentTask: any) => {
    try {
      dispatch(setIsLoading(true));
      setFormFeature([]);
      const payload = {};

      const responseData = await postApiWithProjectExchange(
        'V1/form/navigationData?source=DEFAULT',
        payload,
        projectTokens[currentTask.projectId]
      );
      const targetList: Array<any> = [];
      const viewFormsList = JSON.parse(
        decodeProjectFormExchangeToken(projectTokens[currentTask.projectId])
          .viewFormIds.replace('{', '[')
          .replace('}', ']')
      );
      responseData.navigationData.forEach((item: any) => {
        if (viewFormsList.indexOf(item.featureId) > -1) {
          const newItem = {
            feature: item.caption,
            featureId: item.featureId,
            featureCount: item.templates[0].featureCount,
            displayCount: item.templates[0].featureCount,
          };
          targetList.push(newItem);
        }
      });
      setFormFeature(targetList);
      if (targetList.length > 0) {
        selectFeature(targetList[0]);
      }
      dispatch(setIsLoading(false));
    } catch (error: any) {
      console.log('error: ', error);
      dispatch(setIsLoading(false));
    }
  };

  const getProjectUsers = async (currentTask: any) => {
    try {
      dispatch(setIsLoading(true));
      const res = await client.query({
        query: GET_ALL_PROJECT_USERS_QUERY,
        variables: {},
        fetchPolicy: 'network-only',
        context: {
          role: projectFeatureAllowedRoles.viewMasterPlan,
          token: projectTokens[currentTask.projectId],
        },
      });

      const temp: any = {};
      res.data.user.forEach((user: any) => {
        const tempUser = { ...user, flag: 'user' };
        temp[user.id] = tempUser;
      });
      dispatch({ type: GET_ALL_PROJECT_USERS, payload: temp });
      dispatch(setIsLoading(false));
    } catch (err) {
      dispatch(setIsLoading(false));
    }
  };

  const getProjectMetaData = async (currentTask: any) => {
    try {
      dispatch(setIsLoading(true));

      const response = await client.query({
        query: GET_PROJECT_SCHEDULE_METADATA,
        fetchPolicy: 'network-only',
        context: {
          role: priorityPermissionsByToken(
            'view',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });

      dispatch({
        type: GET_PROJECT_SCHEDULE_META_DATA,
        payload: response.data.projectScheduleMetadata[0],
      });
      dispatch(setIsLoading(false));
    } catch (error: any) {
      dispatch({
        type: GET_PROJECT_SCHEDULE_META_DATA,
        payload: {},
      });
      dispatch(setIsLoading(false));
    }
  };

  const getProjectProductivity = async (currentTask: any) => {
    try {
      dispatch(setIsLoading(true));
      const res = await client.query({
        query: GET_PROJECT_PRODUCTIVITY,
        fetchPolicy: 'network-only',
        variables: {
          id: currentTask.id,
        },
        context: {
          role: priorityPermissionsByToken(
            'view',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });

      const response = res?.data?.projectTask[0];

      dispatch(setIsLoading(false));
      return response;
    } catch (err) {
      console.log('error:', err);
      dispatch(setIsLoading(false));
    }
  };

  const setDraftSelectedFormLinks = (payload: any) => {
    dispatch({
      type: DRAFT_SELECTED_FORM_LINKS,
      payload,
    });
  };

  const setSelectedFeatureFormList = (payload: any) => {
    dispatch({
      type: SELECT_FEATURE_FORM_LIST,
      payload,
    });
  };
  const fetchFormData = async () => {
    try {
      dispatch(setIsLoading(true));
      const responseData: any = await client.query({
        query: FETCH_LIST_FORMS,
        variables: {
          featureId: state.selectedFeature.featureId,
        },
        fetchPolicy: 'network-only',
        context: {
          role: featureFormRoles.viewForm,
          token: projectTokens[currentTask.projectId],
        },
      });
      const listOfForms: Array<any> = [];
      if (responseData.data.listForms_query.data.length > 0) {
        let featureAutoId = '';
        if (state.selectedFeature.featureId === 2) {
          featureAutoId = `RFI ID`;
        } else if (state.selectedFeature.featureId === 8) {
          featureAutoId = `Submittal ID`;
        } else {
          featureAutoId = 'ID';
        }

        responseData.data.listForms_query.data.forEach((item: any) => {
          const openForm = item.formsData.filter(
            (field: any) => field.caption === 'Status'
            // && field.value !== "CLOSED"
          );
          if (openForm.length > 0) {
            const newitem: any = {
              id: item?.id,
              label: '',
              feature: state.selectedFeature?.feature,
              featureId: state.selectedFeature.featureId,
            };

            const subjectfield = item.formsData.find(
              (field: any) => field.caption === 'Subject'
            );
            const autoIncrementId = item.formsData.find(
              (field: any) => field.caption === featureAutoId
            );
            if (autoIncrementId) {
              newitem.targetAutoIncremenId = autoIncrementId.value;
            }
            if (subjectfield) {
              newitem.label = subjectfield.value;
            }
            listOfForms.push(newitem);
          }
        });
      }
      state.currentTaskLinkedForm.forEach((element: any) => {
        listOfForms.forEach((formitem: any) => {
          if (formitem.id === element.formId) {
            formitem.isSelected = true;
            formitem.isDisabled = true;
            formitem.relation = element.relation;
          }
        });
      });
      setSelectedFeatureFormList(listOfForms);
      dispatch(setIsLoading(false));
    } catch (error: any) {
      console.log(error);
      dispatch(setIsLoading(false));
    }
  };

  const linkFormToTask = async (taskId: any, linkData: any) => {
    try {
      dispatch(setIsLoading(true));

      const response = await client.mutate({
        mutation: INSERT_TASK_FORM_LINK,
        variables: { taskId: taskId, linkData: linkData },
        context: {
          role: priorityPermissionsByToken(
            'create',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });

      if (linkData.length === 1) {
        Notification.sendNotification(
          'Link added successfully',
          AlertTypes.success
        );
      } else if (linkData.length > 1) {
        Notification.sendNotification(
          'Link(s) added successfully',
          AlertTypes.success
        );
      }

      getLinkedForm(currentTask);
      dispatch(setIsLoading(false));
    } catch (error: any) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(error.message, AlertTypes.error);
    }
  };

  const getLinkedForm = async (currentTask: any) => {
    try {
      dispatch(setIsLoading(true));

      const response = await client.query({
        query: GET_TASK_LINKED_FORM,
        variables: { taskId: currentTask.id },
        fetchPolicy: 'network-only',
        context: {
          role: priorityPermissionsByToken(
            'view',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });

      const constraintMap = new Map();
      state.currentTaskConstraint.forEach((constraint: any) => {
        if (constraint.linkId) {
          constraintMap.set(constraint.linkId, constraint);
        }
      });

      const data = response.data.linkFormTask.map((link: any) => ({
        id: link.id,
        linkType: link.linkType.name,
        subject:
          link.form.formsData &&
          link.form.formsData.length &&
          link.form.formsData[0].valueString
            ? link.form.formsData[0].valueString
            : '-',
        formId: link.form.id,
        feature: link.form.projectFeature.feature,
        featureId: link.form.projectFeature.id,
        constraint: constraintMap.get(link.id) ? true : false,
      }));

      dispatch({ type: GET_LINKED_FORM, payload: data });
      dispatch(setIsLoading(false));
    } catch (error: any) {
      console.log('error: ', error);
      dispatch(setIsLoading(false));
    }
  };

  const deleteLinkedForm = async (linkIds: any, taskId: any) => {
    try {
      dispatch(setIsLoading(true));
      const response = await client.mutate({
        mutation: DELETE_TASK_FORM_LINK,
        variables: {
          linkIds: linkIds,
          taskId: taskId,
        },
        context: {
          role: priorityPermissionsByToken(
            'delete',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });

      Notification.sendNotification(
        'Link removed successfully',
        AlertTypes.success
      );
      getLinkedForm(currentTask);
      getConstraintsByTaskId(currentTask);

      dispatch(setIsLoading(false));
    } catch (error: any) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(error.message, AlertTypes.error);
    }
  };

  const updateLinkedForm = async (linkId: any, linkTypeId: any) => {
    try {
      dispatch(setIsLoading(true));

      const response = await client.mutate({
        mutation: UPDATE_LINK_FORM,
        variables: {
          id: linkId,
          linkTypeId: linkTypeId,
        },
        context: {
          role: priorityPermissionsByToken(
            'update',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });
      dispatch(setIsLoading(false));
    } catch (error: any) {
      console.log('error: ', error);
      dispatch(setIsLoading(false));
    }
    // dispatch({ type: UPDATE_LINKED_FORM, payload: link });
  };

  const updateProjectProductivity = async (
    variables: ProductivityInputType
  ) => {
    const { id, ...rest } = variables;
    try {
      dispatch(setIsLoading(true));
      await client.mutate({
        mutation: UPDATE_PROJECT_PRODUCTIVITY,
        fetchPolicy: 'network-only',
        variables: {
          id,
          _set: { ...rest },
        },
        context: {
          role: priorityPermissionsByToken(
            'update',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });
      dispatch(setIsLoading(false));
    } catch (err) {
      console.log('err: ', err);
      dispatch(setIsLoading(false));
    }
  };

  const getChildTask = async (currentTask: any) => {
    try {
      dispatch(setIsLoading(true));
      const res = await client.query({
        query: GET_CHILD_TASK,
        variables: { parentId: currentTask.id },
        fetchPolicy: 'network-only',
        context: {
          role: priorityPermissionsByToken(
            'view',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });

      const targetGanttObject = responseToGantt(res);
      dispatch(setIsLoading(false));

      return targetGanttObject;
      // const taskMap = new Map();
      // gantt.parse(targetGanttObject);

      // res.data.tasks.forEach((task: any) => {
      //   taskMap.set(task.id, task);
      // });

      // dispatch({ type: GET_CHILD_TASKS, payload: taskMap });
    } catch (err) {
      console.log('err: ', err);
      dispatch(setIsLoading(false));
    }
  };

  const getProjectMaterialsBasedOnSearch = async (text: any) => {
    try {
      dispatch(setIsLoading(true));

      const res = await client.query({
        query: GET_PROJECT_MATERIALS_BASED_ON_SEARCH,
        variables: {
          materialName: `%${text}%`,
          materialExternalId: `%${text}%`
        },
        fetchPolicy: 'network-only',
        context: {
          role: priorityPermissionsByToken(
            'view',
            projectTokens[currentTask.projectId]
          ),

          // role: 'viewTenantMaterialMaster',
          token: projectTokens[currentTask.projectId],
        },
      });
      dispatch({
        type: COMMON_GET_PROJECT_MATERIALS,
        payload: res.data.projectMaterial.map((material: any) => ({
          id: material.id,
          quantityAllocated: material.quantityAllocated,
          category: material.materialMaster.category,
          name: material.materialMaster.materialName,
          type: material.materialMaster.materialType,
          unit: material.materialMaster.unit,
          materialId: material.materialMaster.externalMaterialId,
          carbonCategory: material.materialMaster.carbonCategory,
        })),
      });
      dispatch(setIsLoading(false));
    } catch (e) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(e.message, AlertTypes.error);
    }
  };

  return (
    <CommonEditProjectPlanContext.Provider
      value={{
        parentTasks: state.parentTasks,
        currentTaskConstraint: state.currentTaskConstraint,
        currentTaskVariances: state.currentTaskVariances,
        projectMaterials: state.projectMaterials,
        currentTaskMaterial: state.currentTaskMaterial,
        categoryList: state.categoryList,
        relatedTasks: state.relatedTasks,
        currentTask: state.currentTask,
        projectTokens: state.projectTokens,
        projectUser: state.projectUser,
        tenantCompanyList: state.tenantCompanyList,
        lookAheadStatus: state.lookAheadStatus,
        formFeatures: state.formFeatures,
        projectMetaData: state.projectMetaData,
        projectProductivity: state.projectProductivity,
        currentTaskLinkedForm: state.currentTaskLinkedForm,
        draftSelectedFormLinks: state.draftSelectedFormLinks,
        selectedFeature: state.selectedFeature,
        selectedFeatureFormsList: state.selectedFeatureFormsList,
        isLoading: state.isLoading,
        selectFeature,
        updateParentTaskList,
        updateTaskStatus,
        moveTaskInToDo,
        moveTaskToInProgress,
        moveTaskToInCompleted,
        updateLpsStatus,
        getConstraintsByTaskId,
        updateConstraintById,
        updateConstraintStatus,
        getVariancesByTaskId,
        deleteConstraint,
        addConstraint,
        updateStartAndEndDate,
        updateEndDateAndDuration,
        updateActualStartDate,
        updateActualStartDateAndActualEndDate,
        updateActualEndDateAndDuration,
        getProjectMaterials,
        clearProjectMaterials,
        updateTaskAssignee,
        addBulkMaterialToTask,
        getProjectTaskMaterial,
        deleteProjectTaskAssociatedMaterial,
        updateProjectTaskAssociatedMaterial,
        addVariance,
        updateVarianceById,
        deleteVariance,
        updatePayoutCost,
        updateCommitmentCost,
        partialUpdateLpsStatus,
        partialMoveTaskInToDo,
        getCustomListByName,
        clearEditProjectPlanState,
        updateEstimatedEndDateAndDuration,
        getRelatedTasks,
        updateResponsibleContractor,
        setCurrentTask,
        fetchProjectExchangeToken,
        setLookAheadAction,
        getTenantCompanies,
        fetchFormFeatures,
        getProjectUsers,
        getProjectMetaData,
        getProjectProductivity,
        setDraftSelectedFormLinks,
        linkFormToTask,
        fetchFormData,
        deleteLinkedForm,
        updateLinkedForm,
        getLinkedForm,
        updateProjectProductivity,
        getChildTask,
        setSelectedFeatureFormList,
        getProjectMaterialsBasedOnSearch,
      }}
    >
      {props.children}
    </CommonEditProjectPlanContext.Provider>
  );
};

export default EditProjectPlanState;
