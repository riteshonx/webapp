import { gql } from '@apollo/client';

export const GET_ALL_EQUIPMENTS_QUERY = gql`
  query getAllEquipments {
    equipmentMaster(where: {}) {
      capacity
      description
      documentation
      equipmentCategory
      equipmentId
      equipmentType
      id
      metadata
      model
      oemName
      status
      supplier
      tenantId
      baselineHours
    }
  }
`;

export const ADD_EQUIPMENT_MASTERS_QUERY = gql`
  mutation addEquipmentMaster($objects: [equipmentMaster_insert_input!]!) {
    insert_equipmentMaster(objects: $objects) {
      returning {
        capacity
      }
    }
  }
`;

export const UPDATE_EQUIPMENT_MASTERS_QUERY = gql`
  mutation updateEquipmentMaster(
    $id: Int
    $objects: equipmentMaster_set_input
  ) {
    update_equipmentMaster(where: { id: { _eq: $id } }, _set: $objects) {
      returning {
        capacity
      }
    }
  }
`;

export const DELETE_EQUIPMENT_MASTERS_QUERY = gql`
  mutation deleteEquipment($id: Int) {
    delete_equipmentMaster(where: { id: { _eq: $id } }) {
      affected_rows
    }
  }
`;
export const GET_EQUIPMENT_TYPE_QUERY = gql`
  query MyQuery {
    configurationLists(
      where: {
        _and: [{ name: { _eq: "Equipment Type" } }, { deleted: { _eq: false } }]
      }
    ) {
      id
      name
      createdAt
      updatedAt
      systemGenerated
      configurationValues(
        order_by: { nodeName: asc }
        where: { deleted: { _eq: false } }
      ) {
        id
        nodeName
        parentId
      }
    }
  }
`;

export const SEARCH_EQUIPMENTS_BY_NAME = gql`
  query equipmentMasterNameSearch($oemName: String) {
    equipmentMaster(
      order_by: { id: asc }
      where: { oemName: { _ilike: $oemName } }
    ) {
      equipmentName
      equipmentId
      equipmentType
      id
      oemName
      model
      equipmentCategory
      supplier
      baselineHours
    }
  }
`;

export const GET_EQUIPMENT_BY_TASK_ID = gql`
  query getEquipmentByTaskId($taskId: uuid) {
    projectTaskEquipmentAssociation(where: { taskId: { _eq: $taskId } }) {
      projectEquipmentMaster {
        equipmentMaster {
          equipmentName
          equipmentId
        }
      }
      allocation
      consumption
    }
  }
`;
