import { gql } from "@apollo/client";

export const CREATE_BIM_MODEL = gql`
mutation insertBimModel($object: bimModel_insert_input!) {
    insert_bimModel_one(object: $object) {
        id
    }
}`;

export const FETCH_BIM_MODEL = gql`
query fetchBimModel($_eq: uuid = "") {
    bimModel(where: {id: {_eq: $_eq}}) {
        id
        modelFormat
        title
        sourceKey
        createdAt
        fileSize
        isDeleted
        fileLastModified
        tenantAssociationByCreatedby {
            user {
                firstName
                jobTitle
                lastName
            }
        }
        bimModelStatuses(order_by: {createdAt: desc}) {
            status
            createdAt
            id
            geometryStatus
            propertyStatus
            createdAt
            modelCompletedAt
            completedAt
            modelId
            statusMessage
            isAssembly
            sourceModelIds
        }
    }
}`;

export const BIM_MODEL_STATUS = gql` 
query fetchBimModelStatus($_eq: uuid = "") {
    bimModelStatus(where: {bimModel: {id: {_eq: $_eq}}}) {
        geometryInfo
        geometryStatus
        propertyStatus
        createdAt
        modelCompletedAt
        completedAt
        modelId
        id
        bimModel {
            id
            modelFormat
            title,
            fileSize
        }
        spatialPropertyStatus
        status
        statusMessage
        isAssembly
        sourceModelIds
        jobrunnerVersion
    }
}`;

export const LAST_BIM_MODEL_STATUS = gql` 
query fetchLastBimModel {
    bimModel(limit: 2, order_by: {createdAt: desc}) {
        id
        modelFormat
        title
        createdAt
        fileSize
        isDeleted
        fileLastModified
        tenantAssociationByCreatedby {
            user {
                firstName
                jobTitle
                lastName
            }
        }
        bimModelStatuses(order_by: {createdAt: desc}) {
            status
            createdAt
            id
            geometryStatus
            propertyStatus
            createdAt
            modelCompletedAt
            completedAt
            modelId
            statusMessage
        }
    }
}`;

export const FETCH_ALL_BIM_MODEL_STATUS = gql` 
query fetchAllBimModel {
    bimModel(order_by: {createdAt: desc}) {
        id
        modelFormat
        title
        sourceKey
        createdAt
        updatedAt
        fileSize
        isDeleted
        fileLastModified
        tenantAssociationByCreatedby {
            user {
                firstName
                jobTitle
                lastName
            }
        }
        bimModelStatuses(order_by: {createdAt: desc}) {
            status
            createdAt
            id
            geometryStatus
            propertyStatus
            createdAt
            modelCompletedAt
            completedAt
            modelId
            statusMessage
            isAssembly
            sourceModelIds
        }
        bimElementProperties_aggregate {
            aggregate {
                elementCount: count
                categoryCount: count(columns: categoryId, distinct: true)
            }
        }
        isLocationModelAttached
        locationModelId
        locationModel {
            id
            latitude
            longitude
            trueNorth
            baseElevation
            locationModelStatuses {
                status
                geometryStatus
                modelCompletedAt
                createdAt
                completedAt
            }
        }
    }
}`;

export const DELETE_BIM_MODEL = gql` 
mutation deleteBimModel($_eq: uuid = "") {
    update_bimModel(_set: {isDeleted: true}, where: {id: {_eq: $_eq}}) {
      affected_rows
    }
}`;

export const DELETE_BIM_ELEMENT_PROP = gql` 
mutation deleteBimElementProp($_eq: uuid! = "") {
    deleteBimProperties_mutation(modelId: $_eq) {
        message
    }
}`;

export const BIM_ELEMENT_PROP_COUNT = gql` 
query fetchBimElementProp($_eq: uuid = "") {
    bimElementProperties_aggregate(where: {modelId: {_eq: $_eq}}) {
      aggregate {
        elementCount: count
        categoryCount: count(columns: categoryId, distinct: true)
      }
    }
}`;

export const BIM_DISTNT_CATEGY_PROP = gql` 
query fetchDistinctCategory($_eq: uuid = "") {
    bimElementProperties_aggregate(where: {modelId: {_eq: $_eq}}) {
        aggregate {
            categoryCount: count(columns: categoryId, distinct: true)
        }
    }
}`;

export const CREATE_BIM_SPATIAL_PROP = gql`
mutation insertBimSpatialProp($spatialProperties: [spatialPropertiesObj!]! = {centerBoundingBox: 1.5, handleId: 10, maxBoundingBox: 1.5, minBoundingBox: 1.5}, $bimModelStatusId: uuid! = "") {
    insertBimSpatialProperties_mutation(bimModelStatusId: $bimModelStatusId, spatialProperties: $spatialProperties) {
      message
    }
}`;

export const UPDATE_SPATIAL_STATUS = gql`
mutation UPDATE_SPATIAL_STATUS($bimModelStatusId: uuid = "") {
    update_bimModelStatus(where: {id: {_eq: $bimModelStatusId}}, _set: {spatialPropertyStatus: true}) {
      affected_rows
    }
}`;

export const CANCEL_BIM_MODEL = gql` 
mutation cancelBimModel($modelId: uuid! = "") {
    abortBimModelProcessing_mutation(modelId: $modelId) {
      message
    }
}`;

export const CHECK_BIM_DUPLICATE_FILENAME = gql` 
query checkDuplicateName($_fileName: String = "") {
    bimModel(where: {title: {_eq: $_fileName}, isDeleted: {_eq: false}, bimModelStatuses: {status: {_nin: ["DATA_PROCESSING_FAILED", "MODEL_PROCESSING_FAILED", "ABORTED", "DELETED"]}}}) {
      title
      sourceKey
      modelFormat
      fileSize
      id
    }
}`;

export const UPDATE_BIM_SOURCE_KEY = gql` 
mutation updateSourceKey($sourceKey: String = "", $_modelId: uuid = "") {
    update_bimModel(where: {id: {_eq: $_modelId}}, _set: {sourceKey: $sourceKey}) {
      affected_rows
    }
}`;

export const CHECK_IS_PART_OF_ASSEMBLY = gql` 
query checkIsPartOfAssembly($_modelId: jsonb = "") {
    bimModelStatus(where: {sourceModelIds: {_contains: $_modelId}, bimModel: {isDeleted: {_eq: false}}, status: {_nin: ["DELETED",  "ABORTED"]}}) {
      modelId
    }
}`;

export const CREATE_ASSEMBLY = gql` 
mutation createAssembly($modelIds: [uuid!] = "", $assemblyName: String = "") {
    createAssembly_mutation(modelIds: $modelIds, assemblyName: $assemblyName) {
      message
    }
}`;

export const FETCH_ASSEMBLY_COUNTS = gql` 
query fetchAssemblyCount($modelIds: [uuid!] = "") {
    bimElementProperties_aggregate(where: {modelId: {_in: $modelIds}}) {
      aggregate {
        elementCount: count
        categoryCount: count(columns: categoryId, distinct: true)
      }
    }
}`;

export const UPDATE_LOCATION_MODEL = gql`
  mutation updateLocationModel(
    $id: uuid
    $latitude: float8
    $longitude: float8
    $trueNorth: float8
    $baseElevation: float8
  ) {
    update_locationModel(
      _set: {
        latitude: $latitude
        longitude: $longitude
        trueNorth: $trueNorth
        baseElevation: $baseElevation
      }
      where: { id: { _eq: $id } }
    ) {
      returning {
        id
      }
    }
  }
`;

export const FETCH_PROJECT_LOCATION_TREE = gql`query fetchProjectLocationTree {
    projectLocationTree {
      nodeName
      parentId
      id
    }
  }`