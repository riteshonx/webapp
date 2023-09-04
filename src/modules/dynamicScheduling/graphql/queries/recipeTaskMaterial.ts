import { gql } from '@apollo/client';

export const ADD_RECIPE_MATERIAL = gql`
  mutation AddRecipeMaterial(
    $materials: [recipeMaterialAssociation_insert_input!]!
  ) {
    insert_recipeMaterialAssociation(objects: $materials) {
      affected_rows
    }
  }
`;

export const UPDATE_RECIPE_MATERIAL_QUERY = gql`
  mutation UpdateRecipeMaterial($id: Int, $quantity: float8) {
    update_recipeMaterialAssociation(
      where: { id: { _eq: $id } }
      _set: { quantity: $quantity }
    ) {
      returning {
        id
        materialId
        quantity
        recipeId
        recipeTaskId
      }
    }
  }
`;

export const DELETE_RECIPE_MATERIAL_QUERY = gql`
  mutation DeleteRecipe($id: Int) {
    delete_recipeMaterialAssociation(where: { id: { _eq: $id } }) {
      returning {
        id
      }
    }
  }
`;

export const GET_RECIPE_TASK_MATERIALS_QUERY = gql`
  query getRecipeTaskMaterial($taskId: uuid) {
    recipeMaterialAssociation(where: { recipeTaskId: { _eq: $taskId } }) {
      id
      recipeId
      quantity
      materialId
      recipeTaskId
      materialMaster {
        materialName
        externalMaterialId
        unit
        carbonCategory {
          baselineValue
          id
          name
          description
          averageValue
          unit
          unitImperial
          baselineValueImperial
        }
      }
    }
  }
`;
