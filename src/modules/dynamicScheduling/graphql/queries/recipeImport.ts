import { gql } from '@apollo/client';
import { RecipeLibrary } from '../../libraries/grqphql/models/recipe';

export const GET_RECIPE_LIST = gql`query getRecipeList {
  ${RecipeLibrary.modelName}( order_by: {recipeName: asc}) {
    ${RecipeLibrary.selector.recipeName}
    ${RecipeLibrary.selector.createdBy}
    ${RecipeLibrary.selector.recipeType}
    ${RecipeLibrary.selector.description}
    ${RecipeLibrary.selector.updatedBy}
    ${RecipeLibrary.selector.id}
    recipeTasks(where: {type: {_neq: "task"}}) {
      id
      taskName
      parentId
      type
      duration
      startDate
    }
  }
}
`;

export const GET_RECIPE_WP_LIST = gql`query getRecipe_WP_List($searchText: String!) {
  ${RecipeLibrary.modelName}( order_by: {recipeName: asc}, where: {${RecipeLibrary.selector.recipeName}: {_ilike: $searchText}}) {
    ${RecipeLibrary.selector.recipeName}
    ${RecipeLibrary.selector.createdBy}
    ${RecipeLibrary.selector.recipeType}
    ${RecipeLibrary.selector.description}
    ${RecipeLibrary.selector.updatedBy}
    ${RecipeLibrary.selector.id}
    recipeTasks(where: {type: {_neq: "task"}, taskName: {_ilike: $searchText}}) {
      id
      taskName
      parentId
      type
      duration
      startDate
    }
  }
}
`;