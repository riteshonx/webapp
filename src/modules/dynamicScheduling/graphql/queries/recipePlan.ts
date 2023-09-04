import { gql } from '@apollo/client';


// Get all recipe tasks
export const GET_RECIPE_PLAN = gql`
  query getRecipePlanTasks($recipeSetId: Int) {
    recipetasks: recipeTasks(where: {recipeSetId: {_eq: $recipeSetId}},  order_by: {serialNumber: asc}) {
        id
        parentId
        type
        taskName
        createdBy
        serialNumber
        isCritical
        level
        status
        duration
        endDate
        startDate
      }
      recipelinks: recipeTaskRelationship (where: {recipeSetId: {_eq: $recipeSetId}}){
      id
      lag
      source
      target
      type
      createdBy
    }
  }
`;

// Get a specific schedule recipe
export const SAVE_RECIPE_TASK = gql`
  mutation saveRecipePlanTasks(
    $recipetasks: [recipe_tasks]!
    $recipelinks: [recipe_links]!
    $deleteRecipeTasksIds: [uuid]!
    $recipeSetId: Int!
  ) {
    insertRecipeTask_relationship_mutation(
      recipetasks: $recipetasks
      recipelinks: $recipelinks
      deleteRecipeTasksIds: $deleteRecipeTasksIds
      recipeSetId: $recipeSetId
    ) {
      recipetasks
      recipelinks
    }
  }
`;

export const EDIT_RECIPE_METADATA_EDITED_BY = gql`
mutation updateRecipeMetaData($status: String, $edited_by: uuid, $id: Int) {
  update_scheduleRecipeSet(where: {id: {_eq:  $id}}, _set: {edited_by: $edited_by, status: $status}) {
    returning {
      description
      edited_by
      status
    }
  }
}
`;

export const EDIT_RECIPE_METADATA_PUBLISHED_BY = gql`
  mutation updateRecipeMetaData($status: String, $published_by: uuid, $id: Int, $recipeType: String, $recipeName: String, $description: String) {
    update_scheduleRecipeSet(where: {id: {_eq: $id}}, _set: {status: $status, published_by: $published_by, recipeType: $recipeType, recipeName: $recipeName, description: $description}) {
      returning {
        description
        edited_by
        status
      }
    }
  }
 
`;

export const GET_RECIPE_METADATA = gql`
  query getRecipeMetaData($id: Int) {
    scheduleRecipeSet(where: {id: {_eq: $id}}) {
      createdBy
      recipeName
      recipeType
      description
      updatedBy
      edited_by
      published_by
      status
      id
      tenantAssociationByEditedByTenantid {
        user {
          firstName
          lastName
          email
        }
      }
    }
  } 
`;