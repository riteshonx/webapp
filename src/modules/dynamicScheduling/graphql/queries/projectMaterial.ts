import { gql } from '@apollo/client';

export const GET_ALL_PROJECT_MATERIALS = gql`
query getAllProjectMaterials {
  projectMaterial {
    materialMaster {
      category
      externalMaterialId
      materialName
      materialType
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
    id
    quantityAllocated
  }
}
`;

export const GET_PROJECT_MATERIALS_BASED_ON_SEARCH = gql`
query searchProjectMaterials($materialName: String, $materialExternalId: String) {
  projectMaterial(
    where: {materialMaster: {_or: [{materialName: {_ilike: $materialName}}, {externalMaterialId: {_ilike: $materialExternalId}}]}}
  ) {
    materialMaster {
      category
      externalMaterialId
      materialName
      materialType
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
    id
    quantityAllocated
  }
}`
