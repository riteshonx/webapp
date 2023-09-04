import { gql } from "@apollo/client";

export const FETCH_ALL_MATERIAL_MASTER = gql
  `query fetchAllMaterialMaster($name: String!, $offset: Int = 0) {
    materialMaster(where: {_or: [{materialName: {_ilike: $name}}, {externalMaterialId: {_ilike: $name}}], _not: {projectMaterials: {}}}, order_by: {id: asc}, limit: 15, offset: $offset) {
      category
      customColumns
      materialGroup
      externalMaterialId
      materialName
      materialType
      supplier
      unit
      id
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
    materialMaster_aggregate(where: {_or: [{materialName: {_ilike: $name}}, {externalMaterialId: {_ilike: $name}}], _not: {projectMaterials: {}}}) {
      aggregate {
        count
      }
    }
  }
`

export const ADD_PROJECT_MATERIAL = gql`
mutation ProjectMaterial($data : [projectMaterial_insert_input!]!){
  insert_projectMaterial(objects: $data){
    returning {
      quantityAllocated
      quantityAvailable
      quantityConsumed
      quantityRequired
      supplier
      materialMaster {
        materialGroup
        materialName
      }
    }
  }
}`

export const VIEW_PROJECT_MATERIAL = gql`
query viewProjectMaterial($search:String,$projectId:Int!) {
  projectMaterial(
    where: 
    {
      _and: 
      [{
          projectId: {
            _eq: $projectId
          }
        },
        {
          _or:[{
            materialMaster:{
              externalMaterialId:{
                _ilike:$search
              }
            }
          },{
            materialMaster:{
              materialName:{
                _ilike:$search
              }
            }
          }]
        }
      ]
    }
  ) {
    materialMaster {
      materialName
      unit
      externalMaterialId
      category
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
    id
    notes
    quantityRequired
    quantityAvailable
    quantityAllocated
    quantityConsumed
    supplier
    projectTaskMaterialAssociations {
			taskId
		}
  }
}
`

export const UPDATE_PROJECT_MATERIAL = gql`
mutation updateProjectMaterial($projectId:Int!,$id:Int!,$QtyAvl:float8,$QtyReq:float8,$supplier:String,$notes:String){
  update_projectMaterial(where:{
    id:{
      _eq:$id
    },
    projectId:{
      _eq:$projectId
    }
  },_set:{
    quantityAvailable:$QtyAvl,
    quantityRequired:$QtyReq,
    supplier:$supplier,
    notes: $notes
  }){
    affected_rows
    returning{
      id
    }
  }
}
`;

export const DELETE_PROJECT_MATERIAL = gql`
mutation firstMutation($projectId: Int!, $id: Int!) {
  delete_projectMaterial(where: {_and: [{projectId: {_eq: $projectId}}, {id: {_eq: $id}}]}) {
    affected_rows
  }
}`