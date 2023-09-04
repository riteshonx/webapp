import { gql } from "@apollo/client";


export const FETCH_ALL_EQUIPMENTS_QUERY = gql
  `query getAllEquipments($name: String!, $offset: Int = 0) {
    equipmentMaster(where: {_or: [{oemName: {_ilike: $name}}, {equipmentId: {_ilike: $name}}]}, order_by: {id: asc}, limit: 15, offset: $offset) {
      baselineHours
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
    }
    equipmentMaster_aggregate(where: {_or: [{oemName: {_ilike: $name}}, {equipmentId: {_ilike: $name}}] }) {
      aggregate {
        count
      }
    }
  }
`

export const ADD_EQUIPMENT_MASTERS_QUERY = gql`
mutation MyMutation ($data : [projectEquipmentMaster_insert_input!]!){
  insert_projectEquipmentMaster(objects: $data) {
    returning {
      startDate
      endDate
      tenantId
      equipmentId
      updatedAt
      updatedBy
    }
  }
}`

export const VIEW_PROJECT_EQUIPMENT_MASTER = gql`
query viewProjectEquipmentMaster($search:String, $projectId:Int!) {
  projectEquipmentMaster(where: {projectId: {_eq:$projectId}, _or: [{equipmentMaster: {oemName: {_ilike: $search}}}, {equipmentMaster: {equipmentId: {_ilike: $search}}}]}){
  equipmentId
  startDate
  endDate
  equipmentMaster {
    equipmentType
    model
    oemName
    equipmentId
  }
}
}
`

export const UPDATE_EQUIPMENT_MASTERS_QUERY = gql`

mutation updateProjectEquipmentMaster($startDate:timestamptz, $endDate:timestamptz, $equipmentId:Int!) {
  update_projectEquipmentMaster(where: {equipmentId: {_eq: $equipmentId}}, _set: {startDate: $startDate, endDate: $endDate}) {
    returning {
      equipmentId
      startDate
      endDate
    }
  }
}

`;


export const DELETE_EQUIPMENT_MASTERS_QUERY = gql`
mutation MyMutation ( $equipmentId: Int!) {
  delete_projectEquipmentMaster(where: {equipmentId: {_eq: $equipmentId}}) {
    affected_rows
  }
}
`