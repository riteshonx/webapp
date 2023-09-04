import { gql } from '@apollo/client';

export const ADD_BULK_MATERIAL_TO_TASK = gql`
  mutation addBulkMaterialToTask(
    $materials: [projectTaskMaterialAssociation_insert_input!]!
  ) {
    insert_projectTaskMaterialAssociation(objects: $materials) {
      affected_rows
    }
  }
`;

export const GET_PROJECT_TASK_MATERIAL = gql`
query getProjectTaskMaterial($taskId: uuid) {
  projectTaskMaterialAssociation(where: { taskId: { _eq: $taskId } }) {
    projectId
    id
    quantityAllocated
    quantityConsumed
    taskId
    projectMaterial {
      materialMaster {
        materialName
        externalMaterialId
        unit
        carbonCategory{
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
}
`;

export const DELETE_PROJECT_TASK_ASSOCIATED_MATERIAL = gql`
  mutation deleteProjectTaskAssociatedMaterial($id: Int) {
    delete_projectTaskMaterialAssociation(
      where: { id: { _eq: $id }, projectTask: {} }
    ) {
      returning {
        id
      }
    }
  }
`;

export const UPDATE_PROJECT_TASK_ASSOCIATED_MATERIAL = gql`
  mutation updateProjectTaskAssociatedMaterial(
    $id: Int
    $quantityAllocated: float8
    $quantityConsumed: float8
  ) {
    update_projectTaskMaterialAssociation(
      where: { id: { _eq: $id } }
      _set: {
        quantityAllocated: $quantityAllocated
        quantityConsumed: $quantityConsumed
      }
    ) {
      returning {
        id
        projectId
        taskId
      }
    }
  }
`;
