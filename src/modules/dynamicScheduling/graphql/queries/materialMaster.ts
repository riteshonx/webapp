import { gql } from '@apollo/client';

export const GET_ALL_MATERIALS = gql`
  query getAllMaterials {
    materialMaster(where: {}) {
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
  }
`;
