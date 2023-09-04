import { gantt } from 'dhtmlx-gantt';
import { useContext, useReducer } from 'react';
import { setIsLoading } from 'src/modules/root/context/authentication/action';
import { client } from 'src/services/graphql';
import { TaskRoles } from '../../../../utils/role';
import { stateContext } from '../../../root/context/authentication/authContext';
import Notification, {
  AlertTypes,
} from '../../../shared/components/Toaster/Toaster';
import { GET_ALL_MATERIALS } from '../../graphql/queries/materialMaster';
import {
  ADD_RECIPE_MATERIAL,
  DELETE_RECIPE_MATERIAL_QUERY,
  GET_RECIPE_TASK_MATERIALS_QUERY,
  UPDATE_RECIPE_MATERIAL_QUERY,
} from '../../graphql/queries/recipeTaskMaterial';
import RecipeDetailsContext from './../Recipe/RecipeContext';
import EditRecipeTaskContext from './editRecipeTaskContext';
import editRecipeTaskReducer from './editRecipeTaskReducer';
import {
  CLEAR_EDIT_RECIPE_TASK_STATE,
  DELETE_RECIPE_MATERIAL,
  GET_ALL_TENANT_MATERIAL,
  GET_RECIPE_TASK_MATERIAL,
  UPDATE_PARENT_TASKS,
  UPDATE_RECIPE_MATERIAL,
} from './types';
const EditRecipeTaskState = (props: any) => {
  const initialState = {
    parentTasks: [],
    currentTaskMaterial: [],
    tenantMaterials: null,
  };

  const recipeDetailsContext = useContext(RecipeDetailsContext);

  const { currentTask, setCurrentTask } = recipeDetailsContext;

  const [state, dispatch] = useReducer(editRecipeTaskReducer, initialState);

  const authContext: any = useContext(stateContext);

  const clearEditRecipeTaskState = () => {
    dispatch({ type: CLEAR_EDIT_RECIPE_TASK_STATE, payload: [] });
  };

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

  const addBulkMaterialToRecipeTask = async (materials: any) => {
    try {
      authContext.dispatch(setIsLoading(true));

      const res = await client.mutate({
        mutation: ADD_RECIPE_MATERIAL,
        variables: {
          materials: materials,
        },
        context: {
          role: TaskRoles.createTenantTask,
        },
      });

      getRecipeTaskMaterial(materials[0].recipeTaskId);
      authContext.dispatch(setIsLoading(false));
    } catch (e) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(e.message, AlertTypes.error);
    }
  };

  const getTenantMaterials = async () => {
    try {
      authContext.dispatch(setIsLoading(true));

      const res = await client.query({
        query: GET_ALL_MATERIALS,
        fetchPolicy: 'network-only',
        context: {
          role: 'viewTenantMaterialMaster',
        },
      });
      dispatch({
        type: GET_ALL_TENANT_MATERIAL,
        payload: res.data.materialMaster.map((material: any) => ({
          id: material.id,
          category: material.category,
          name: material.materialName,
          type: material.materialType,
          unit: material.unit,
          materialId: material.externalMaterialId,
          carbonCategory: material.carbonCategory,
        })),
      });
      authContext.dispatch(setIsLoading(false));
    } catch (e) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(e.message, AlertTypes.error);
    }
  };

  const getRecipeTaskMaterial = async (taskId: any) => {
    try {
      authContext.dispatch(setIsLoading(true));

      const res = await client.query({
        query: GET_RECIPE_TASK_MATERIALS_QUERY,
        fetchPolicy: 'network-only',
        variables: {
          taskId: taskId,
        },
        context: {
          role: TaskRoles.viewTenantTask,
        },
      });
      dispatch({
        type: GET_RECIPE_TASK_MATERIAL,
        payload: res.data.recipeMaterialAssociation.map((material: any) => ({
          id: material.id,
          quantityAllocated: material.quantity,
          name: material.materialMaster.materialName,
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

  const deleteRecipeTaskMaterial = async (id: any) => {
    try {
      authContext.dispatch(setIsLoading(true));

      const res = await client.mutate({
        mutation: DELETE_RECIPE_MATERIAL_QUERY,
        variables: {
          id: id,
        },
        context: {
          role: TaskRoles.deleteTenantTask,
        },
      });
      dispatch({
        type: DELETE_RECIPE_MATERIAL,
        payload: { id },
      });
      authContext.dispatch(setIsLoading(false));
    } catch (e) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(e.message, AlertTypes.error);
    }
  };

  const updateRecipeTaskMaterial = async (material: any) => {
    try {
      authContext.dispatch(setIsLoading(true));

      const res = await client.mutate({
        mutation: UPDATE_RECIPE_MATERIAL_QUERY,
        variables: {
          id: material.id,
          quantity: material.quantityAllocated,
        },
        context: {
          role: TaskRoles.updateTenantTask,
        },
      });
      dispatch({
        type: UPDATE_RECIPE_MATERIAL,
        payload: { material },
      });
      authContext.dispatch(setIsLoading(false));
    } catch (e) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(e.message, AlertTypes.error);
    }
  };

  const clearTenantMaterials = () => {
    dispatch({
      type: GET_ALL_TENANT_MATERIAL,
      payload: null,
    });
  };
  return (
    <EditRecipeTaskContext.Provider
      value={{
        parentTasks: state.parentTasks,
        currentTaskMaterial: state.currentTaskMaterial,
        tenantMaterials: state.tenantMaterials,
        clearEditRecipeTaskState,
        updateParentTaskList,
        addBulkMaterialToRecipeTask,
        getRecipeTaskMaterial,
        deleteRecipeTaskMaterial,
        updateRecipeTaskMaterial,
        getTenantMaterials,
        clearTenantMaterials,
      }}
    >
      {props.children}
    </EditRecipeTaskContext.Provider>
  );
};

export default EditRecipeTaskState;
