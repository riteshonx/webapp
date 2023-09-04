import { gql } from '@apollo/client';
import { RecipeLibrary } from '../models/recipe';


export const SEARCH_RECIPE_BY_EXACT_NAME = gql`query searchRecipesByExactName($recipeName: String!) {
  ${RecipeLibrary.modelName}(where: {${RecipeLibrary.selector.recipeName}: {_eq: $recipeName}}) {
    ${RecipeLibrary.selector.id}
    ${RecipeLibrary.selector.recipeName}
  }
}
`;

export const SEARCH_RECIPE_BY_SIMILAR_NAME = gql`query searchRecipesBySimilarName($recipeName: String!) {
  ${RecipeLibrary.modelName}(where: {${RecipeLibrary.selector.recipeName}: {_ilike: $recipeName}}) {
    ${RecipeLibrary.selector.id}
    ${RecipeLibrary.selector.recipeName}
  }
}
`;

export const CREATE_SCHEDULE_RECIPE = gql`
mutation CreateScheduleRecipe($name: String, $description: String, $type: String) {
    insert_scheduleRecipeSet(objects: {recipeName: $name, recipeType: $type, description: $description}) {
      returning {
        id
        createdBy
        updatedBy
        recipeName
        recipeType
      }
    }
  }
`;

// fetch all task library data
export const GET_RECIPE_LIST = gql`query getRecipeList($limit: Int!, $offset: Int!, $recipeName: String!) {
  ${RecipeLibrary.modelName}(limit: $limit, offset: $offset, order_by: {recipeName: asc}, where: {recipeName: {_ilike: $recipeName }}) {
    ${RecipeLibrary.selector.recipeName}
    recipeTasks(where: {parentId: {_is_null: true}}) {
      duration
    }
    ${RecipeLibrary.selector.createdBy}
    ${RecipeLibrary.selector.recipeType}
    ${RecipeLibrary.selector.description}
    ${RecipeLibrary.selector.updatedBy}
    ${RecipeLibrary.selector.id}
    user {
      firstName
      lastName
    }
  }
}
`;

export const GET_RECIPE_DETAILS = gql`
  query MyQuery {
    scheduleRecipeSet(where: {id: {_eq: 2}}) {
      createdBy
      recipeName
      recipeType
      description
      updatedBy
    }
  }
`;

export const GET_PROJECT_ASSOCIATED = gql`
  query getProjectsAssociated {
    listRecipeProject_query {
      recipeProjectData
    }
  }
`;


export const UPDATE_RECIPE = gql`
mutation MyMutation($id: Int!, $name: String, $description: String, $type: String) {
    update_scheduleRecipeSet(where: {id: {_eq: $id}}, _set: {
      recipeName: $name, recipeType: $type, description: $description
    }) {
      returning {
        id
      }
    }
  }
  
`;

export const DELETE_RECIPE = gql`
mutation deleteRecipe ($id: Int!){
    delete_scheduleRecipeSet(where: {${RecipeLibrary.selector.id}: {_eq: $id}}) {
      returning {
        id
      }
    }
  }
`;

