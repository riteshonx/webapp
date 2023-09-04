import { gql } from '@apollo/client';
import { MaterialLibrary } from '../models/material';


// Role --> viewTenantMaterialMaster


export const UPDATE_MATERIAL_MASTER = gql`
mutation UpdateMaterialMaster($idParam: Int!, $materialId: String, $materialName: String, $materialGroup: String, $category: String, $materialType: String, $supplier: String, $unit: String, $carbonCategoryId: Int) {
  update_materialMaster(where: {id: {_eq: $idParam}}, _set: {
    externalMaterialId: $materialId, 
    materialName: $materialName, 
    materialGroup: $materialGroup, 
    category: $category, 
    materialType: $materialType, 
    supplier: $supplier, 
    unit: $unit, 
    carbonCategoryId: $carbonCategoryId}) {
    returning {
      materialName
      externalMaterialId
      materialGroup
      documentation
      customColumns
      category
      materialType
      supplier
      unit
    }
  }
}
`;

export const DELETE_MATERIAL_MASTER = gql`
mutation DeleteMaterialMaster($idParam: Int!) {
    delete_materialMaster(where: {id: {_eq: $idParam}}) {
        returning {
          id
        }
      }
}
`;

export const FETCH_MATERIAL_MASTER = gql`
query MyQuery {
  materialMaster(order_by: {materialName: asc}, where: {}) {
    category
    customColumns
    materialGroup
    materialId
    materialName
    materialType
    supplier
    unit
    id
  }
}
`;

export const FETCH_SUPPLIERS = gql`
query FETCH_SUPPLIERS($search:String){
  tenantCompanyAssociation(where:{
    active:{
      _eq:true
    },
    name:{
      _ilike:$search
    }
  }){
    name
    id
    location
  }
}
`;


export const SEARCH_MATERIAL_MASTER_BY_MATERIALID = gql`
query MyQuery($materialIdParam: String) {
  materialMaster(order_by: {materialName: asc}, where: {externalMaterialId: {_eq: $materialIdParam}}) {
      category
      customColumns
      materialGroup
      externalMaterialId
      materialName
      materialType
      supplier
      unit
      id
    }
}
`;
export const SEARCH_MATERIAL_MASTER_ILIKE_NAME = gql`
query MyQuery($materialSearchName: String) {
  materialMaster(
    order_by: {id: asc}
    where: 
    {
      _and: 
      [
        {
          _or:[{
              externalMaterialId:{
                _ilike:$materialSearchName
              }
          },{
              materialName:{
                _ilike:$materialSearchName
              }
          }]
        }
      ]
    }
  ) {
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
      category
      categoryId
      description
      id
      name
      unit
      baselineValueImperial
      unitImperial
      averageValue
    }
  }
}

`;


export const CREATE_MATERIAL_MASTER = gql`
mutation CreateMasterMaterial($materialId: String, $materialName: String, $materialType: String, $materialUnit: String, $materialCategory: Int, $supplier: String,$category:String) {
    insert_materialMaster(
      objects: {
        externalMaterialId: $materialId, 
        materialName: $materialName, 
        materialType: $materialType, 
        materialGroup: "", 
        unit: $materialUnit, 
        carbonCategoryId: $materialCategory, 
        supplier: $supplier,
        category: $category
      }) {
        returning {
          category
          customColumns
          documentation
          materialGroup
          externalMaterialId
          materialName
          materialType
          supplier
          unit
          carbonCategory {
            averageValue
            baselineValue
            category
            categoryId
            description
            id
          }
        }
    }
  }
`;

export const GET_MATERIAL_CATEGORY = gql`
query getCarbonCategory {
  carbonCategory(distinct_on: categoryId) {
    baselineValue
    baselineValueImperial
    category
    categoryId
    description
    id
    name
    unit
    unitImperial
    averageValue
  }
}
`;

export const GET_MATERIAL_TYPE_QUERY= gql`
query MyQuery {
  configurationLists(where: {_and: [{name: {_eq: "Material Type"}}, {deleted: {_eq: false}}]}) {
    id
    name
    createdAt
    updatedAt
    systemGenerated
    configurationValues(order_by: {nodeName: asc}, where: {deleted: {_eq: false}}) {
      id
      nodeName
      parentId
    }
  }
}
`;