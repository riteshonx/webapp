import { gantt } from 'dhtmlx-gantt';
import moment from 'moment';
import { useContext, useReducer } from 'react';
import { decodeProjectFormExchangeToken } from '../../../../services/authservice';
import { client } from '../../../../services/graphql';
import { projectFeatureAllowedRoles } from '../../../../utils/role';
import { setIsLoading } from '../../../root/context/authentication/action';
import { stateContext } from '../../../root/context/authentication/authContext';
import Notification, {
  AlertTypes,
} from '../../../shared/components/Toaster/Toaster';
import { LOAD_CONFIGURATION_LIST_VALUES } from '../../graphql/queries/customList';
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
import { GET_EQUIPMENT_BY_TASK_ID } from '../../graphql/queries/EquipmentMaster';
import { GET_LABOUR_BY_TASK_ID } from '../../graphql/queries/labour';
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
import {
  GET_ALL_PROJECT_MATERIALS,
  GET_PROJECT_MATERIALS_BASED_ON_SEARCH,
} from '../../graphql/queries/projectMaterial';
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
import { priorityPermissions } from '../../permission/scheduling';
import {
  transformDate,
  transformDateToString,
} from '../../utils/ganttDataTransformer';
import ProjectPlanContext from '../projectPlan/projectPlanContext';
import EditProjectPlanContext from './editProjectPlanContext';
import editProjectPlanReducer from './editProjectPlanReducer';
import {
  CLEAR_EDIT_PROJECT_PLAN_STATE,
  DELETE_PROJECT_TASK_MATERIAL,
  GET_CUSTOM_LIST,
  GET_PROJECT_MATERIALS,
  GET_PROJECT_TASK_MATERIALS,
  GET_RELATED_TASKS,
  GET_TASK_EQUIPMENT,
  GET_TASK_LABOUR,
  SET_TASK_CONSTRAINTS,
  SET_TASK_VARIANCES,
  UPDATE_PARENT_TASKS,
  UPDATE_PROJECT_TASK_MATERIAL,
} from './types';

const EditProjectPlanState = (props: any) => {
  const initialState = {
    parentTasks: [],
    currentTaskConstraint: [],
    currentTaskVariances: [],
    projectMaterials: [],
    currentTaskMaterial: [],
    categoryList: [],
    relatedTasks: [],
    currentTaskEquipment: [],
    currentTaskLabour: [],
  };
  const [state, dispatch] = useReducer(editProjectPlanReducer, initialState);
  const authContext: any = useContext(stateContext);

  const projectPlanContext = useContext(ProjectPlanContext);

  const { currentTask, setCurrentTask, getPartialUpdatedTasks } =
    projectPlanContext;

  const updateParentTaskList = (id: string) => {
    if (!id) {
      dispatch({ type: UPDATE_PARENT_TASKS, payload: [] });
    } else {
      const parents = [];
      parents.push(gantt.getTask(id));
      let tempId = gantt.getTask(id).parent;
      while (tempId != 0) {
        parents.push(gantt.getTask(tempId));
        tempId = gantt.getTask(tempId).parent;
      }
      dispatch({ type: UPDATE_PARENT_TASKS, payload: parents.reverse() });
    }
  };

  const updateTaskStatus = async (id: string, status: string, date: any) => {
    try {
      authContext.dispatch(setIsLoading(true));

      const resDeleteStatus = await client.mutate({
        mutation: IS_DELETE_STATUS_PARTIAL_UPDATE,
        variables: {
          isDeleted: true,
          taskId: id,
          checkIsDelete: false,
        },
        context: {
          role: priorityPermissions('update'),
          token: authContext.state.selectedProjectToken,
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
            role: priorityPermissions('create'),
            token: authContext.state.selectedProjectToken,
          },
        });

        getPartialUpdatedTasks();
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
            role: priorityPermissions('create'),
            token: authContext.state.selectedProjectToken,
          },
        });

        getPartialUpdatedTasks();
      }

      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(
        'Your update has been submitted for review',
        AlertTypes.success
      );
    } catch (err) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const updateTaskAssignee = async (
    ids: string[],
    assigneeId: string | null
  ) => {
    try {
      authContext.dispatch(setIsLoading(true));
      await client.mutate({
        mutation: UPDATE_PROJECT_TASK_ASSIGNEE,
        variables: { id: ids, assignedTo: assigneeId },
        context: {
          role: priorityPermissions('update'),
          token: authContext.state.selectedProjectToken,
        },
      });
      if (assigneeId) await crewMasterAssignee(assigneeId);
      authContext.dispatch(setIsLoading(false));
    } catch (error) {
      authContext.dispatch(setIsLoading(false));
    }
  };

  const updateResponsibleContractor = async (id: any, contractorId: any) => {
    try {
      authContext.dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: UPDATE_RESPONSIBLE_CONTRACTOR,
        variables: {
          id: id,
          responsibleContractor: contractorId,
        },
        context: {
          role: priorityPermissions('update'),
          token: authContext.state.selectedProjectToken,
        },
      });
      authContext.dispatch(setIsLoading(false));
    } catch (error) {
      authContext.dispatch(setIsLoading(false));
    }
  };
  const partialMoveTaskInToDo = async (id: string) => {
    try {
      authContext.dispatch(setIsLoading(true));
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
          role: priorityPermissions('create'),
          token: authContext.state.selectedProjectToken,
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
      getPartialUpdatedTasks();
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(
        'Your update has been submitted for review',
        AlertTypes.success
      );
    } catch (err) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const moveTaskToInProgress = async (id: string, esitmatedDate: any) => {
    try {
      authContext.dispatch(setIsLoading(true));

      const resDeleteStatus = await client.mutate({
        mutation: IS_DELETE_STATUS_PARTIAL_UPDATE,
        variables: {
          isDeleted: true,
          taskId: id,
          checkIsDelete: false,
        },
        context: {
          role: priorityPermissions('update'),
          token: authContext.state.selectedProjectToken,
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
          role: priorityPermissions('create'),
          token: authContext.state.selectedProjectToken,
        },
      });

      getPartialUpdatedTasks();

      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(
        'Your update has been submitted for review',
        AlertTypes.success
      );
    } catch (err) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const moveTaskToInCompleted = async (
    id: string,
    actualEndDate: any,
    actualDuration: number
  ) => {
    try {
      authContext.dispatch(setIsLoading(true));
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
          role: priorityPermissions('create'),
          token: authContext.state.selectedProjectToken,
        },
      });

      getPartialUpdatedTasks();
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(
        'Your update has been submitted for review',
        AlertTypes.success
      );
    } catch (err) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const partialUpdateLpsStatus = async (id: string, lpsStatus: string) => {
    try {
      authContext.dispatch(setIsLoading(true));
      await updateIsDelete(id);
      const res = await client.mutate({
        mutation: PARTIAL_UPDATE_TASK_LPS_STATUS,
        variables: { id, status: 'To-Do', taskLpsStatus: lpsStatus },
        context: {
          role: priorityPermissions('create'),
          token: authContext.state.selectedProjectToken,
        },
      });

      getPartialUpdatedTasks();
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(
        'Your update has been submitted for review',
        AlertTypes.success
      );
    } catch (err) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const getConstraintsByTaskId = async (id: any) => {
    try {
      authContext.dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: GET_TASK_CONSTRAINTS_ORDER_BY_STATUS,
        variables: {
          taskIds: [id],
        },
        context: {
          role: priorityPermissions('view'),
          token: authContext.state.selectedProjectToken,
        },
      });
      authContext.dispatch(setIsLoading(false));
      dispatch({
        type: SET_TASK_CONSTRAINTS,
        payload: res.data.projectTaskConstraints,
      });
    } catch (err) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const updateConstraintById = async (constraint: any, index: any = null) => {
    try {
      authContext.dispatch(setIsLoading(true));
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
          role: priorityPermissions('update'),
          token: authContext.state.selectedProjectToken,
        },
      });
      authContext.dispatch(setIsLoading(false));
      if (index != null) {
        const tempConstraint = state.currentTaskConstraint;
        tempConstraint[index] = constraint;
        dispatch({
          type: SET_TASK_CONSTRAINTS,
          payload: tempConstraint,
        });
      }
    } catch (err) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const updateConstraintStatus = async (constraint: any, index: any = null) => {
    try {
      authContext.dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: UPDATE_CONSTRAINT_STATUS,
        variables: {
          id: constraint.id,
          status: constraint.status,
        },
        context: {
          role: priorityPermissions('update'),
          token: authContext.state.selectedProjectToken,
        },
      });
      authContext.dispatch(setIsLoading(false));

      getConstraintsByTaskId(constraint.taskId);
    } catch (err) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const getVariancesByTaskId = async (id: any) => {
    try {
      authContext.dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: GET_TASK_VARIANCES,
        variables: {
          taskIds: [id],
        },
        context: {
          role: priorityPermissions('view'),
          token: authContext.state.selectedProjectToken,
        },
      });
      authContext.dispatch(setIsLoading(false));
      dispatch({
        type: SET_TASK_VARIANCES,
        payload: res.data.projectTaskVariance,
      });
    } catch (err) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const deleteConstraint = async (constraint: any) => {
    try {
      authContext.dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: DELETE_CONSTRAINT,
        variables: {
          id: constraint.id,
        },
        context: {
          role: priorityPermissions('delete'),
          token: authContext.state.selectedProjectToken,
        },
      });
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(
        'Constraint deleted successfully',
        AlertTypes.success
      );
      getConstraintsByTaskId(constraint.taskId);
    } catch (err) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const addConstraint = async (constraint: any) => {
    try {
      authContext.dispatch(setIsLoading(true));

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
            role: priorityPermissions('create'),
            token: authContext.state.selectedProjectToken,
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
            role: priorityPermissions('create'),
            token: authContext.state.selectedProjectToken,
          },
        });
      }
      authContext.dispatch(setIsLoading(false));
      getConstraintsByTaskId(constraint.taskId);
      Notification.sendNotification(
        'Constraint added successfully',
        AlertTypes.success
      );
      return '';
    } catch (err) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const updateStartAndEndDate = async (
    id: any,
    startDate: any,
    endDate: any
  ) => {
    try {
      authContext.dispatch(setIsLoading(true));
      await updateIsDelete(id);
      const res = await client.mutate({
        mutation: PARTIAL_UPDATE_PROJECT_TASK_START_DATE_END_DATE,
        variables: {
          taskId: id,
          plannedStartDate: startDate,
          plannedEndDate: endDate,
        },
        context: {
          role: priorityPermissions('create'),
          token: authContext.state.selectedProjectToken,
        },
      });
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(
        'Your update has been submitted for review',
        AlertTypes.success
      );
      getPartialUpdatedTasks();
    } catch (err) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const updateEndDateAndDuration = async (
    id: any,
    endDate: any,
    duration: any
  ) => {
    try {
      authContext.dispatch(setIsLoading(true));
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
          role: priorityPermissions('create'),
          token: authContext.state.selectedProjectToken,
        },
      });
      getPartialUpdatedTasks();
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(
        'Your update has been submitted for review',
        AlertTypes.success
      );
    } catch (err) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const updateActualStartDate = async (
    id: any,
    actualStartDate: any,
    estimatedEndDate: any
  ) => {
    try {
      authContext.dispatch(setIsLoading(true));
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
          role: priorityPermissions('create'),
          token: authContext.state.selectedProjectToken,
        },
      });
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(
        'Your update has been submitted for review',
        AlertTypes.success
      );
      getPartialUpdatedTasks();
    } catch (err) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const updateActualStartDateAndActualEndDate = async (
    id: any,
    actualStartDate: any,
    actualEndDate: any
  ) => {
    try {
      authContext.dispatch(setIsLoading(true));
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
          role: priorityPermissions('create'),
          token: authContext.state.selectedProjectToken,
        },
      });
      authContext.dispatch(setIsLoading(false));
      getPartialUpdatedTasks();
      Notification.sendNotification(
        'Your update has been submitted for review',
        AlertTypes.success
      );
    } catch (err) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const updateActualEndDateAndDuration = async (
    id: any,
    actualEndDate: any,
    duration: any
  ) => {
    try {
      authContext.dispatch(setIsLoading(true));
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
          role: priorityPermissions('create'),
          token: authContext.state.selectedProjectToken,
        },
      });
      getPartialUpdatedTasks();
      authContext.dispatch(setIsLoading(false));
    } catch (err) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const getProjectMaterials = async () => {
    try {
      authContext.dispatch(setIsLoading(true));

      const res = await client.query({
        query: GET_ALL_PROJECT_MATERIALS,
        fetchPolicy: 'network-only',
        context: {
          role: priorityPermissions('view'),

          // role: 'viewTenantMaterialMaster',
          token: authContext.state.selectedProjectToken,
        },
      });
      dispatch({
        type: GET_PROJECT_MATERIALS,
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
      authContext.dispatch(setIsLoading(false));
    } catch (e) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(e.message, AlertTypes.error);
    }
  };

  const clearProjectMaterials = () => {
    dispatch({
      type: GET_PROJECT_MATERIALS,
      payload: [],
    });
  };

  const addBulkMaterialToTask = async (materials: any) => {
    try {
      authContext.dispatch(setIsLoading(true));

      const res = await client.mutate({
        mutation: ADD_BULK_MATERIAL_TO_TASK,
        variables: {
          materials: materials,
        },
        context: {
          role: priorityPermissions('create'),
          token: authContext.state.selectedProjectToken,
        },
      });

      getProjectTaskMaterial(materials[0].taskId);
      authContext.dispatch(setIsLoading(false));
    } catch (e) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(e.message, AlertTypes.error);
    }
  };

  const getProjectTaskMaterial = async (taskId: any) => {
    try {
      authContext.dispatch(setIsLoading(true));

      const res = await client.query({
        query: GET_PROJECT_TASK_MATERIAL,
        fetchPolicy: 'network-only',
        variables: {
          taskId: taskId,
        },
        context: {
          role: priorityPermissions('view'),
          token: authContext.state.selectedProjectToken,
        },
      });
      dispatch({
        type: GET_PROJECT_TASK_MATERIALS,
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
      authContext.dispatch(setIsLoading(false));
    } catch (e) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(e.message, AlertTypes.error);
    }
  };

  const deleteProjectTaskAssociatedMaterial = async (id: any) => {
    try {
      authContext.dispatch(setIsLoading(true));

      const res = await client.mutate({
        mutation: DELETE_PROJECT_TASK_ASSOCIATED_MATERIAL,
        variables: {
          id: id,
        },
        context: {
          role: priorityPermissions('delete'),
          token: authContext.state.selectedProjectToken,
        },
      });
      dispatch({
        type: DELETE_PROJECT_TASK_MATERIAL,
        payload: { id },
      });
      authContext.dispatch(setIsLoading(false));
    } catch (e) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(e.message, AlertTypes.error);
    }
  };

  const updateProjectTaskAssociatedMaterial = async (material: any) => {
    try {
      authContext.dispatch(setIsLoading(true));

      const res = await client.mutate({
        mutation: UPDATE_PROJECT_TASK_ASSOCIATED_MATERIAL,
        variables: {
          id: material.id,
          quantityAllocated: material.quantityAllocated,
          quantityConsumed: material.quantityConsumed,
        },
        context: {
          role: priorityPermissions('update'),
          token: authContext.state.selectedProjectToken,
        },
      });
      dispatch({
        type: UPDATE_PROJECT_TASK_MATERIAL,
        payload: { material },
      });
      authContext.dispatch(setIsLoading(false));
    } catch (e) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(e.message, AlertTypes.error);
    }
  };

  const addVariance = async (variance: any) => {
    //  const temp = constraintList.splice(index, 1);
    try {
      authContext.dispatch(setIsLoading(true));
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
          role: priorityPermissions('create'),
          token: authContext.state.selectedProjectToken,
        },
      });
      authContext.dispatch(setIsLoading(false));
      getVariancesByTaskId(variance.taskId);
    } catch (err) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const updateVarianceById = async (variance: any, index: any = null) => {
    try {
      authContext.dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: UPDATE_TASK_VARIANCE,
        variables: {
          id: variance.id,
          category: variance.category,
          varianceName: variance.varianceName,
          taskId: variance.taskId,
        },
        context: {
          role: priorityPermissions('update'),
          token: authContext.state.selectedProjectToken,
        },
      });
      authContext.dispatch(setIsLoading(false));
      if (index != null) {
        const tempVariance = state.currentTaskVariances;
        tempVariance[index] = variance;
        dispatch({
          type: SET_TASK_VARIANCES,
          payload: tempVariance,
        });
      }
    } catch (err) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const deleteVariance = async (variance: any) => {
    try {
      authContext.dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: DELETE_VARIANCE,
        variables: {
          id: variance.id,
        },
        context: {
          role: priorityPermissions('delete'),
          token: authContext.state.selectedProjectToken,
        },
      });
      authContext.dispatch(setIsLoading(false));
      getVariancesByTaskId(variance.taskId);
    } catch (err) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const updatePayoutCost = async (id: any, payoutCost: any) => {
    try {
      authContext.dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: UPDATE_PROJECT_TASK_PAYOUT_COST,
        variables: {
          id: id,
          payoutCost: payoutCost,
        },
        context: {
          role: priorityPermissions('update'),
          token: authContext.state.selectedProjectToken,
        },
      });
      authContext.dispatch(setIsLoading(false));
    } catch (err: any) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const updateCommitmentCost = async (id: any, commitmentCost: any) => {
    try {
      authContext.dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: UPDATE_PROJECT_TASK_COMMITMENT_COST,
        variables: {
          id: id,
          commitmentCost: commitmentCost,
        },
        context: {
          role: priorityPermissions('update'),
          token: authContext.state.selectedProjectToken,
        },
      });
      authContext.dispatch(setIsLoading(false));
    } catch (err: any) {
      authContext.dispatch(setIsLoading(false));
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
        role: priorityPermissions('update'),
        token: authContext.state.selectedProjectToken,
      },
    });
  };

  const updateLpsStatus = async (id: string, lpsStatus: string) => {
    if (currentTask.lpsStatus === lpsStatus) {
      return;
    }
    try {
      authContext.dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: UPDATE_TASK_LPS_STATUS,
        variables: { id, status: 'To-Do', lpsStatus: lpsStatus },
        context: {
          role: priorityPermissions('update'),
          token: authContext.state.selectedProjectToken,
        },
      });
      setCurrentTask({ ...currentTask, status: 'To-Do', lpsStatus });

      gantt.updateTask(currentTask.id, { ...currentTask });
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(
        'Task Updated successfully',
        AlertTypes.success
      );
    } catch (err) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const moveTaskInToDo = async (id: string) => {
    try {
      authContext.dispatch(setIsLoading(true));
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
          role: priorityPermissions('update'),
          token: authContext.state.selectedProjectToken,
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
      gantt.updateTask(currentTask.id, { ...currentTask });
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(
        'Your update has been submitted for review',
        AlertTypes.success
      );
    } catch (err) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const getCustomListByName = async (name: any) => {
    try {
      authContext.dispatch(setIsLoading(true));

      const response: any = await client.query({
        query: LOAD_CONFIGURATION_LIST_VALUES,
        variables: {
          name: `${name}`,
        },
        fetchPolicy: 'network-only',
        context: {
          role: projectFeatureAllowedRoles.viewMasterPlan,
          token: authContext.state.selectedProjectToken,
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
                  priorityPermissions('create-form') === 'createForm' &&
                  decodeProjectFormExchangeToken().createFormIds.length > 2
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
                priorityPermissions('create-form') === 'createForm' &&
                decodeProjectFormExchangeToken().createFormIds.length > 2
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
          type: GET_CUSTOM_LIST,
          payload: categoryList,
        });
      } else {
        dispatch({
          type: GET_CUSTOM_LIST,
          payload: [],
        });
      }
      authContext.dispatch(setIsLoading(false));
    } catch (e) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(e.message, AlertTypes.error);
    }
  };

  const clearEditProjectPlanState = () => {
    dispatch({ type: CLEAR_EDIT_PROJECT_PLAN_STATE, payload: [] });
  };

  const crewMasterAssignee = async (assigneeId: any) => {
    try {
      const res = await client.mutate({
        mutation: CREW_MASTER_ASSIGNEE_FROM_TASK_DETAILS,
        variables: {
          taskAssignee: [assigneeId],
        },
        context: {
          role: priorityPermissions('create'),
          token: authContext.state.selectedProjectToken,
        },
      });
    } catch (err) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const updateEstimatedEndDateAndDuration = async (
    id: any,
    estimatedEndDate: any,
    duration: any
  ) => {
    try {
      authContext.dispatch(setIsLoading(true));
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
          role: priorityPermissions('create'),
          token: authContext.state.selectedProjectToken,
        },
      });
      getPartialUpdatedTasks();
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(
        'Your update has been submitted for review',
        AlertTypes.success
      );
    } catch (err) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };
  const getRelatedTasks = async (id: any) => {
    try {
      authContext.dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: GET_RELATED_TASKS_QUERY,
        variables: {
          taskId: id,
        },
        context: {
          role: priorityPermissions('view'),
          token: authContext.state.selectedProjectToken,
        },
      });
      authContext.dispatch(setIsLoading(false));
      dispatch({
        type: GET_RELATED_TASKS,
        payload: res.data,
      });
    } catch (err) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const clearRelatedTasks = () => {
    dispatch({
      type: GET_RELATED_TASKS,
      payload: [],
    });
  };
  const getProjectMaterialsBasedOnSearch = async (text: any) => {
    try {
      authContext.dispatch(setIsLoading(true));

      const res = await client.query({
        query: GET_PROJECT_MATERIALS_BASED_ON_SEARCH,
        variables: {
          materialName: `%${text}%`,
          materialExternalId: `%${text}%`,
        },
        fetchPolicy: 'network-only',
        context: {
          role: priorityPermissions('view'),

          // role: 'viewTenantMaterialMaster',
          token: authContext.state.selectedProjectToken,
        },
      });
      dispatch({
        type: GET_PROJECT_MATERIALS,
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
      authContext.dispatch(setIsLoading(false));
    } catch (e) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(e.message, AlertTypes.error);
    }
  };

  const getEquipmentByTaskId = async (taskId: any) => {
    try {
      authContext.dispatch(setIsLoading(true));

      const res = await client.query({
        query: GET_EQUIPMENT_BY_TASK_ID,
        variables: { taskId },
        fetchPolicy: 'network-only',
        context: {
          role: priorityPermissions('view'),
          token: authContext.state.selectedProjectToken,
        },
      });

      const tempEquipment = res.data.projectTaskEquipmentAssociation.map(
        (equipment: any) => ({
          equipmentName:
            equipment.projectEquipmentMaster.equipmentMaster.equipmentName,
          equipmentId:
            equipment.projectEquipmentMaster.equipmentMaster.equipmentId,
          allocation: equipment.allocation,
          consumption: equipment.consumption,
        })
      );
      dispatch({
        type: GET_TASK_EQUIPMENT,
        payload: tempEquipment,
      });
      authContext.dispatch(setIsLoading(false));
    } catch (e) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(e.message, AlertTypes.error);
    }
  };

  const getLabourByTaskId = async (taskId: any) => {
    try {
      authContext.dispatch(setIsLoading(true));

      const res = await client.query({
        query: GET_LABOUR_BY_TASK_ID,
        variables: { taskId },
        fetchPolicy: 'network-only',
        context: {
          role: priorityPermissions('view'),
          token: authContext.state.selectedProjectToken,
        },
      });

      const tempLabour =
        res.data.projectTask[0].projectTaskLabourAssociations.map(
          (labour: any) => ({
            startDate: labour.startDate,
            endDate: labour.endDate,
            labourName: labour.projectLabourMaster.labourName,
            labourId: labour.projectLabourMaster.externalLabourId,
            id: labour.projectLabourMaster.id,
          })
        );
      dispatch({
        type: GET_TASK_LABOUR,
        payload: tempLabour,
      });
      authContext.dispatch(setIsLoading(false));
    } catch (e) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(e.message, AlertTypes.error);
    }
  };

  return (
    <EditProjectPlanContext.Provider
      value={{
        parentTasks: state.parentTasks,
        currentTaskConstraint: state.currentTaskConstraint,
        currentTaskVariances: state.currentTaskVariances,
        projectMaterials: state.projectMaterials,
        currentTaskMaterial: state.currentTaskMaterial,
        categoryList: state.categoryList,
        relatedTasks: state.relatedTasks,
        currentTaskEquipment: state.currentTaskEquipment,
        currentTaskLabour: state.currentTaskLabour,
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
        getProjectMaterialsBasedOnSearch,
        clearRelatedTasks,
        getEquipmentByTaskId,
        getLabourByTaskId,
      }}
    >
      {props.children}
    </EditProjectPlanContext.Provider>
  );
};

export default EditProjectPlanState;
