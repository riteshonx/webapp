import React, { useContext, useReducer } from 'react';
import { useHistory } from 'react-router-dom';
import { deleteApiWithEchange } from '../../../../services/api';
import { client } from '../../../../services/graphql';
import { setIsLoading } from '../../../root/context/authentication/action';
import { stateContext } from '../../../root/context/authentication/authContext';
import Notification, {
  AlertTypes,
} from '../../../shared/components/Toaster/Toaster';
import {
  EDIT_RECIPE_METADATA_EDITED_BY,
  EDIT_RECIPE_METADATA_PUBLISHED_BY,
  GET_RECIPE_METADATA,
  GET_RECIPE_PLAN,
  SAVE_RECIPE_TASK,
} from '../../graphql/queries/recipePlan';
import { responseToGantt } from '../../utils/recepieGanttDataTransformer';
import { SET_METADATA } from '../projectPlan/types';
import RecipeDetailsContext from './RecipeContext';
import RecipeReducer from './RecipeReducer';
import {
  CACHE_TASKS,
  RECIPE_DETAILS,
  SET_CURRENT_TASK,
  SET_DELETE_TASK_ID,
  SET_NAVIGATING_STATUS,
  SET_RECIPE_PLAN,
} from './type';

const RecipeState = (props: any) => {
  const initialState = {
    recipeDetails: null,
    currentTask: {},
    cacheTasks: {},
    recipePlan: { data: {} },
    deletedTaskIds: [],
    navigatingStatus: false,
  };
  const history = useHistory();
  const [state, dispatch] = useReducer(RecipeReducer, initialState);
  const authContext: any = useContext(stateContext);

  const setRecipeDetails = (action: any) => {
    dispatch({ type: RECIPE_DETAILS, payload: action });
  };

  const setCurrentTask = (task: any) => {
    dispatch({ type: SET_CURRENT_TASK, payload: task });
  };

  const deleteRecipeSet = async (id: any) => {
    try {
      authContext.dispatch(setIsLoading(true));
      const response = await deleteApiWithEchange(`V1/recipe/delete/${id}`);
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification('Deleted Successfully', AlertTypes.success);
      return response;
      //  dispatch({ type: SET_METADATA, payload: response });
    } catch (e: any) {
      if (e.toString().includes('draft'))
        Notification.sendNotification(
          'Cannot delete recipe. Recipe is in draft mode',
          AlertTypes.error
        );
      else if (e.toString().includes('violates')) {
        Notification.sendNotification(
          'Cannot delete recipe. Recipe is used in project plan',
          AlertTypes.error
        );
      }
    }
  };

  const deleteTasks = (taskIds: any) => {
    const t: any = [];

    taskIds.forEach((taskId: any) => {
      if (state.cacheTasks.get(taskId)) {
        t.push(taskId);
      }
    });
    dispatch({ type: SET_DELETE_TASK_ID, payload: t });
  };

  // const setRecipeTask = (recipe: any) => {
  //   dispatch({ type: SET_RECIPE_PLAN, payload: recipe });
  // };

  const getRecipePlan = async (recipeSetId: any) => {
    try {
      dispatch({ type: SET_RECIPE_PLAN, payload: { data: [] } });
      const res = await client.query({
        query: GET_RECIPE_PLAN,
        variables: { recipeSetId: recipeSetId },
        fetchPolicy: 'network-only',
        context: {
          role: 'viewTenantTask',
        },
      });
      const targetGanttObject = responseToGantt(res);
      const taskMap = new Map();

      res.data.recipetasks.forEach((task: any) => {
        taskMap.set(task.id, task);
      });

      dispatch({ type: CACHE_TASKS, payload: taskMap });
      dispatch({ type: SET_RECIPE_PLAN, payload: targetGanttObject });
    } catch (err) {
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const saveRecipePlan = async (
    saveRecipePlanPayload: any,
    userId: any,
    recipeSetId: any,
    recipeName: any,
    description: any,
    recipeType: any
  ) => {
    try {
      const res = await client.mutate({
        mutation: SAVE_RECIPE_TASK,
        variables: {
          recipetasks: saveRecipePlanPayload.tasks,
          recipelinks: saveRecipePlanPayload.links,
          deleteRecipeTasksIds: state.deletedTaskIds,
          recipeSetId: recipeSetId,
        },
        context: {
          role: 'createTenantTask',
        },
      });
      // console.log('saved!!!', res);
      editRecipeMetaData(
        'published',
        userId,
        recipeSetId,
        recipeName,
        description,
        recipeType
      );
      //  refresh project plan after save
      const tempData = res.data.insertRecipeTask_relationship_mutation;
      const targetGanttObject = responseToGantt({ data: tempData });
      dispatch({ type: SET_RECIPE_PLAN, payload: targetGanttObject });

      //  refresh cacheTaska after save
      const taskMap = new Map();
      tempData.recipetasks.forEach((task: any) => {
        taskMap.set(task.id, task);
      });

      dispatch({ type: CACHE_TASKS, payload: taskMap });

      Notification.sendNotification(
        'Saved recipe plan successfully',
        AlertTypes.success
      );
      history.push('/scheduling/library/recipes');
      // await getRecipePlan(recipeSetId);
    } catch (err) {
      Notification.sendNotification(err?.message, AlertTypes.error);
    }
  };

  const refreshRecipePlan = async () => {
    // do nothing
  };

  const getRecipeMetaData = async (id: any) => {
    // do nothing
    try {
      authContext.dispatch(setIsLoading(true));
      const res = await client.query({
        query: GET_RECIPE_METADATA,
        variables: { id: id },
        fetchPolicy: 'network-only',
        context: {
          role: 'viewTenantTask',
        },
      });
      authContext.dispatch(setIsLoading(false));
      dispatch({ type: SET_METADATA, payload: res.data.scheduleRecipeSet[0] });
    } catch (e) {}
  };

  const setNavigatingBack = (status: any) => {
    dispatch({ type: SET_NAVIGATING_STATUS, payload: status });
  };

  const editRecipeMetaData = async (
    status: string,
    userId: any,
    id: any,
    recipeName: any,
    description: any,
    recipeType: any
  ) => {
    const variables: any = { status };

    if (status === 'draft') {
      variables.id = id;
      variables.edited_by = userId;
    } else {
      variables.id = id;
      variables.published_by = userId;
      variables.recipeName = recipeName;
      variables.description = description;
      variables.recipeType = recipeType;
    }

    try {
      authContext.dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation:
          status === 'draft'
            ? EDIT_RECIPE_METADATA_EDITED_BY
            : EDIT_RECIPE_METADATA_PUBLISHED_BY,
        variables,
        context: {
          role: 'updateTenantTask',
        },
      });
      authContext.dispatch(setIsLoading(true));
      getRecipeMetaData(id);
    } catch (err) {
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  // const editRecipeMetaData = async (id: any, taskName: string) => {
  //     // do nothing
  // }
  return (
    <RecipeDetailsContext.Provider
      value={{
        recipeDetails: state.recipeDetails,
        currentTask: state.currentTask,
        cacheTasks: state.cacheTasks,
        recipePlan: state.recipePlan,
        recipeMetaData: state.recipeMetaData,
        deletedTaskIds: state.deletedTaskIds,
        navigatingStatus: state.navigatingStatus,
        setRecipeDetails,
        setCurrentTask,
        getRecipePlan,
        saveRecipePlan,
        refreshRecipePlan,
        getRecipeMetaData,
        editRecipeMetaData,
        deleteTasks,
        deleteRecipeSet,
        setNavigatingBack,
      }}
    >
      {props.children}
    </RecipeDetailsContext.Provider>
  );
};

export default RecipeState;
