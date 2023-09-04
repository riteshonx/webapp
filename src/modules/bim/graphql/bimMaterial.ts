import { gql } from "@apollo/client";

export const FETCH_MATERIAL_MASTER = gql` 
query FETCH_MATERIAL_MASTER {
  materialMaster {
    externalMaterialId
    id
  }
}
`;

export const INSERT_MATERIAL_MASTER = gql` 
mutation MyMutation($materialMasters: [materialMaster_insert_input!] = {}) {
  insert_materialMaster(objects: $materialMasters) {
    affected_rows
    returning {
      id
      externalMaterialId
    }
  }
}`;

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
      id
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
mutation updateProjectMaterial($projectId:Int!, $id:Int!, $QtyReq:float8){
  update_projectMaterial(where:{
    id:{
      _eq:$id
    },
    projectId:{
      _eq:$projectId
    }
  },_set:{
    quantityRequired:$QtyReq,
  }){
    affected_rows
    returning{
      id
    }
  }
}
`;

export const UPDATE_BIM_FILTER_MATERIAL = gql`
mutation UPDATE_BIM_FILTER_MATERIAL($filterIds: [uuid!] = "", $modelId: uuid = "") {
  updateBimFilterMaterial_mutation(filterIds: $filterIds, modelId: $modelId) {
    message
  }
}
`;
