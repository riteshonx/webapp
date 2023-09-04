import React, { useEffect, createContext, ReactElement, useContext, useState } from 'react';
import { useDebounce } from '../../../../../customhooks/useDebounce';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { setIsLoading } from "../../../../root/context/authentication/action";
import NoDataMessage from '../../../../shared/components/NoDataMessage/NoDataMessage';
import { viewTenantTask } from '../../../permission/scheduling'; // TODO: updated permission.
import RecipesAction from '../../components/RecipesAction/RecipesAction';
import RecipesGrid from '../../components/RecipesGrid/RecipesGrid';
import RecipesTable from '../../components/RecipesTable/RecipesTable';
import LibraryHeader from '../../components/LibraryHeader/LibraryHeader';
import './ScheduleRecipes.scss';
import {
  GET_RECIPE_LIST,
  DELETE_RECIPE,
  CREATE_SCHEDULE_RECIPE,
  UPDATE_RECIPE,
  SEARCH_RECIPE_BY_SIMILAR_NAME,
  GET_PROJECT_ASSOCIATED
} from '../../grqphql/queries/recipe';
import { client } from "../../../../../services/graphql";
import { TaskRoles } from "../../../../../utils/role";
import { RecipeListItem } from "../../grqphql/models/recipe";
import { useMutation } from "@apollo/client";
import Notification, { AlertTypes } from "../../../../shared/components/Toaster/Toaster";
import RecipeDetailsContext from '../../../context/Recipe/RecipeContext';
import { decodeToken } from '../../../../../services/authservice';
import { useHistory } from 'react-router-dom';
interface librarayHeader {
  name: string;
}

const noDataMessage = 'No recipes were found';
const noPermissionMessage = "You don't have permission to view recipe template";

export const RecipeContext = createContext<any>({});

export default function ScheduleRecipes(): ReactElement {
  const { dispatch, state }: any = useContext(stateContext);
  const [viewType, setViewType] = useState('list');
  const [recipeData, setRecipeData] = useState<Array<RecipeListItem>>([]);
  const [projectsAssociatedList, setProjectsAssociatedList] = useState<Array<RecipeListItem>>([]);
  const [searchText, setsearchText] = useState('');
  const debounceName = useDebounce(searchText, 1000);

  const [deleteRecipeLibrary, { loading: deleteRecipeLoading, data: deleteRecipeData, error: deleteRecipeError }] = useMutation(
    DELETE_RECIPE, { context: { role: TaskRoles.deleteTenantTask } });

  const [editRecipeDAO, { loading: editRecipeLoading, data: editRecipeData, error: editRecipeError }] = useMutation(
    UPDATE_RECIPE, { context: { role: TaskRoles.updateTenantTask } });

  const recipeDetailsContext= useContext(RecipeDetailsContext);  
  const { deleteRecipeSet, editRecipeMetaData } = recipeDetailsContext;  

  const history = useHistory();


  useEffect(() => {
    if (viewTenantTask)
      getRecipeList();
  }, [projectsAssociatedList]);

  useEffect(() => {
      getProjectAssociated();
  }, []);

  
  const [
    createScheduleRecipe,
    { loading: createRecipeData, error: createRecipeError, data: createRecipeLoading },
  ] = useMutation(CREATE_SCHEDULE_RECIPE, {
    context: { role: TaskRoles.createTenantTask },
  });

  // this is a common callback function used by both the list view and grid view components.
  // the method accepts filterPayload as input which is a json containing user preference.
  // The methos returnd a list of recipes satisfying users filter criteria.
  const getRecipeList = async () => {
    try {
      dispatch(setIsLoading(true));
      const response: any = await client.query({
        query: GET_RECIPE_LIST,
        variables: {
          limit: 1000,
          offset: 0,
          recipeName: `%${debounceName}%`
        },
        fetchPolicy: 'network-only', context: { role: TaskRoles.viewTenantTask }
      });
      const recipeList: Array<RecipeListItem> = [];

      response.data.scheduleRecipeSet.forEach((item: any) => {
        const projects = projectsAssociatedList.filter((project: any) => item.id == project.id);
        const newRecipe: RecipeListItem = {
          createdBy: item.createdBy,
          description: item.description,
          recipeType: item.recipeType,
          recipeName: item.recipeName,
          updatedBy: item.updatedBy,
          duration: item.recipeTasks[0].duration,
          id: item.id,
          projects: projects[0]?.projects.length,
          createdByUserFullName: ( item?.user?.firstName || item?.user?.lastName ? item?.user?.firstName + ' ' + item?.user.lastName: '-')
        }
        recipeList.push(newRecipe);
      });
      setRecipeData(recipeList);
      dispatch(setIsLoading(false));
    } catch (error: any) {
      console.log(error.message);
      dispatch(setIsLoading(false));
    }
  }

  const getProjectAssociated = async () => {
    try {
      dispatch(setIsLoading(true));
      const response: any = await client.query({
        query: GET_PROJECT_ASSOCIATED,
        fetchPolicy: 'network-only', context: { role: TaskRoles.viewTenantTask }
      });

      setProjectsAssociatedList(response.data.listRecipeProject_query.recipeProjectData);
      dispatch(setIsLoading(false));
    } catch (error: any) {
      console.log(error.message);
      dispatch(setIsLoading(false));
    }
  };

  const getSimilarRecipeNameList = async (recipeNameParam: string) => {
    // console.log('getSimilarRecipeNameList:', recipeNameParam);
    try {
      dispatch(setIsLoading(true));
      const response: any = await client.query({
        query: SEARCH_RECIPE_BY_SIMILAR_NAME,
        variables: {
          recipeName: `%${recipeNameParam}%`
        },
        fetchPolicy: 'network-only', context: { role: TaskRoles.viewTenantTask }
      });
      const recipeNameList: Array<string> = [];
      response.data.scheduleRecipeSet.forEach((item: any) => {
        recipeNameList.push(item.recipeName);
      });
      dispatch(setIsLoading(false));
      return recipeNameList;
    } catch (error: any) {
      console.log(error.message);
      dispatch(setIsLoading(false));
    }
    return [];
  }

  useEffect(() => {
    if (viewTenantTask)
      refreshList();
  }, [debounceName])

  const searchRecipeByName = (value: string) => {
    setsearchText(value)
  }

  const refreshList = () => {
    getRecipeList();
  }

  useEffect(() => {
    if (editRecipeLoading) {
      dispatch(setIsLoading(true));
    }
    if (editRecipeData) {
      Notification.sendNotification('Recipe updated successfully', AlertTypes.success);
      dispatch(setIsLoading(false));
      refreshList();
    }
    if (editRecipeError) {
      dispatch(setIsLoading(false));
      Notification.sendNotification('Couldnot edit recipe', AlertTypes.warn);
    }
  }, [editRecipeData, editRecipeError, editRecipeLoading]);

  useEffect(() => {
    if (createRecipeLoading) {
      dispatch(setIsLoading(true));
    }
    if (createRecipeData) {
      Notification.sendNotification('Recipe created successfully', AlertTypes.success);
      dispatch(setIsLoading(false));
      refreshList();
    }
    if (createRecipeError) {
      dispatch(setIsLoading(false));
      Notification.sendNotification('Couldnot create new recipe', AlertTypes.warn);
    }
  }, [createRecipeData, createRecipeError, createRecipeLoading]);

  useEffect(() => {
    if (deleteRecipeLoading) {
      dispatch(setIsLoading(true));
    }
    if (deleteRecipeData) {
      Notification.sendNotification('Deleted  successfully', AlertTypes.success);
      dispatch(setIsLoading(false));
      refreshList();
    }
    if (deleteRecipeError) {
      dispatch(setIsLoading(false));
      Notification.sendNotification('Invalid Project feature', AlertTypes.warn);
    }
  }, [deleteRecipeData, deleteRecipeError, deleteRecipeLoading]);


  const deleteRecipe = (id: number) => {
    if (id) {
      // deleteRecipeLibrary({
      //   variables: {
      //     id: id
      //   }
      // });
      deleteRecipeSet(id).then(() => {
        getRecipeList();
      });
    //  if(response?.success) {
     // }
    }
  };

  const createRecipe = async (name: string, type: string, description: string, actionType?: string) => {
    const data: any = await createScheduleRecipe(
      {
      variables: {
        name: name.trim(),
        type: type.trim(),
        description: description.trim(),
      },
    }
    );
      editRecipeMetaData("draft", decodeToken().userId, data?.data?.insert_scheduleRecipeSet?.returning[0]?.id)
      history.push(`/scheduling/library/recipe-plan/${data?.data?.insert_scheduleRecipeSet?.returning[0]?.id}`);
  };

  const editRecipe = (id: number, name: string, type: string, description: string) => {
    if (id) {
      editRecipeDAO({
        variables: {
          id: id,
          name: name.trim(),
          type: type.trim(),
          description: description.trim(),
        }
      });
    }
  };

  const toggleView = (type: string) => {
    setViewType(type);
  };

  const headerInfo: librarayHeader = {
    name: 'Recipes',
  };

  return (
    <>
        <div className="scheduleRecipe">
          <LibraryHeader header={headerInfo} />
          {viewTenantTask ? (
          <div style={{height: "80%"}}>
          <RecipesAction toggleView={toggleView} refresh={refreshList} searchText={searchText} 
            createRecipe={createRecipe} editRecipe={editRecipe} searchRecipe={searchRecipeByName} view={viewType} />
          <RecipeContext.Provider value={recipeData}>
            <div className="scheduleRecipe__main">
              {recipeData && recipeData.length > 0 ? (
                viewType === 'gallery' ? (
                  <div className="scheduleRecipe__main__recipe-grid-view">
                    <RecipesGrid refresh={refreshList} deleteRecipe={deleteRecipe} getSimilarRecipeNameList={getSimilarRecipeNameList}
                    getData={getRecipeList} createRecipe={createRecipe} editRecipe={editRecipe}/>
                  </div>
                ) : (
                  <div className="scheduleRecipe__main__list-view">
                    <RecipesTable refresh={refreshList} projectsAssociatedList={ projectsAssociatedList} deleteRecipe={deleteRecipe} getSimilarRecipeNameList={getSimilarRecipeNameList}
                     getData={getRecipeList} createRecipe={createRecipe} editRecipe={editRecipe}/>
                  </div>
                )

              ) : !state.isLoading ? (
                <div className="no-data-wrapper">
                  <NoDataMessage message={noDataMessage} />
                </div>
              ) : (
                ''
              )}

            </div>
          </RecipeContext.Provider>
         
        </div>
        ) : (
          <div className="no-data-wrapper">
            <NoDataMessage message={noPermissionMessage} />
          </div>
          )}
        </div>
     
    </>
  );
}


