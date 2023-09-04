import { gql } from '@apollo/client';
import { DrawingSheets, ProjectUsers } from '../models/drawingSheetModel';

// to fetch uploaded files data
export const FETCH_PUBLISHED_DRAWINGS = gql`query fetchPublishedDrawings($searchText: String, $offset: Int!, $limit: Int!, $currentDrawing: Boolean, $sortColumn:String) {
    ${DrawingSheets.customQuery} (limit: $limit, offset: $offset, searchText: $searchText, currentDrawing: $currentDrawing, sortColumn: $sortColumn){
        data
      }
}`;

// to fetch uploaded files data for viewer
export const FETCH_PUBLISHED_DRAWINGS_VIEWER = gql`query fetchPublishedDrawingsViewer($searchText: String, $offset: Int!, $limit: Int!,
   $currentDrawing: Boolean, $sortColumn:String) {
  ${DrawingSheets.customQuery} (limit: $limit, offset: $offset, searchText: $searchText, currentDrawing: $currentDrawing, sortColumn: $sortColumn){
      data
    }
}`;

//validate unique version info
export const FETCH_PUBLISHED_DRAWINGS_DATA = gql`query fetchPublishedDrawings($offset: Int!, $limit: Int!) {
  ${DrawingSheets.modelName} (limit: $limit, offset: $offset, 
                              order_by: {${DrawingSheets.selector.drawingNumber}: asc}, 
                              where: {status: {_eq: "PUBLISHED"}}){
      ${DrawingSheets.selector.id}
      ${DrawingSheets.selector.setVersionDate}
      ${DrawingSheets.selector.setTitle}
      ${DrawingSheets.selector.setVersionName}
      ${DrawingSheets.selector.sourceId}
    }
}`;

// to fetch filtered drawing dashhetta
export const FETCH_FILTEREDED_DRAWINGS = 
  gql`query fetchFilteredDrawings(
    $filterData: [json]
    $offset: Int, 
    $limit: Int,
    $searchText: String
    $currentDrawing: Boolean,
    $sortColumn:String
  ) {
  ${DrawingSheets.customQuery} (limit: $limit, offset: $offset,
     searchText: $searchText, filterData: $filterData, currentDrawing: $currentDrawing,  sortColumn:$sortColumn){
      data
    }
}`;

// to fetch drawing sheets based in id
export const FETCH_DRAWING_SHEET = gql`query fetchDrawingSheet($id: uuid!) {
    ${DrawingSheets.modelName}(where: {${DrawingSheets.selector.id}: {_eq: $id}}) {
      ${DrawingSheets.selector.id}
      ${DrawingSheets.selector.filePath}
      ${DrawingSheets.selector.sourceId}
      ${DrawingSheets.selector.createdAt}
      ${DrawingSheets.selector.createdBy}
      ${DrawingSheets.selector.drawingCategory}
      ${DrawingSheets.selector.drawingName}
      ${DrawingSheets.selector.drawingNumber}
      ${DrawingSheets.selector.drawingSequence}
      ${DrawingSheets.selector.setVersionDate}
      ${DrawingSheets.selector.setTitle}
      ${DrawingSheets.selector.setVersionName}
      ${DrawingSheets.selector.thumbnailPath}
      ${DrawingSheets.selector.rotation}
    }
}`;


// unique drawing number accross parent source ID
export const FETCH_DRAWING_SHEET_NUMBER = gql`query fetchDrawingSheetNumber($sourceId: uuid!, $drawingNumber: String) {
  ${DrawingSheets.modelName}(where: 
      {${DrawingSheets.selector.sourceId}: {_eq: $sourceId}, 
      ${DrawingSheets.selector.drawingNumber}: {_ilike: $drawingNumber}}) {
        ${DrawingSheets.selector.drawingNumber}
  }
}`;


//delete drawing
export const DELETE_DRAWING = gql`
    mutation publishDocument ($id: [uuid!], $isDeleted: Boolean) {
      update_drawingSheets(where: {id: {_in: $id}}, _set: {isDeleted: $isDeleted}) {
        affected_rows
      }
}`;


// update drawing sheet
export const UPDATE_DRAWING = gql`
    mutation UpdateDrawing ($id: uuid, 
                            $drawingName: String, 
                            $drawingNumber: String,
                            $dwgClassification: String,
                            $dwgLevel: String,
                            $dwgOriginator: String,
                            $dwgProjectNumber: String,
                            $dwgRevision: String,
                            $dwgRole: String,
                            $dwgSheetNumber: String,
                            $dwgStatus: String,
                            $dwgSuitability: String, 
                            $dwgType: String,
                            $dwgVolume: String,
                            $revisionInfo: json,
                            $drawingCategory: String,
                            $dwgZone: String
                            ),  {

      update_drawingSheets(where: {id: {_eq: $id}},
         _set: {
          ${DrawingSheets.selector.drawingName}: $drawingName, 
          ${DrawingSheets.selector.drawingNumber}: $drawingNumber, 
          ${DrawingSheets.selector.dwgClassification}: $dwgClassification, 
          ${DrawingSheets.selector.dwgLevel}: $dwgLevel, 
          ${DrawingSheets.selector.dwgOriginator}: $dwgOriginator, 
          ${DrawingSheets.selector.dwgProjectNumber}: $dwgProjectNumber, 
          ${DrawingSheets.selector.dwgRevision}: $dwgRevision, 
          ${DrawingSheets.selector.dwgRole}: $dwgRole, 
          ${DrawingSheets.selector.dwgSheetNumber}: $dwgSheetNumber, 
          ${DrawingSheets.selector.dwgStatus}: $dwgStatus, 
          ${DrawingSheets.selector.dwgSuitability}: $dwgSuitability, 
          ${DrawingSheets.selector.dwgType}: $dwgType, 
          ${DrawingSheets.selector.dwgVolume}: $dwgVolume, 
          ${DrawingSheets.selector.revisionInfo}: $revisionInfo, 
          ${DrawingSheets.selector.drawingCategory}: $drawingCategory, 
          ${DrawingSheets.selector.dwgZone}: $dwgZone, 
          }) {
        affected_rows
      }
}`;

// update drawing sheet
export const UPDATE_DRAWING_SHEET = gql`
    mutation UpdateDrawing ($id: uuid, 
                            $drawingName: String, 
                            $drawingNumber: String,
                            $dwgClassification: String,
                            $dwgLevel: String,
                            $dwgOriginator: String,
                            $dwgProjectNumber: String,
                            $dwgRevision: String,
                            $dwgRole: String,
                            $dwgSheetNumber: String,
                            $dwgStatus: String,
                            $dwgSuitability: String, 
                            $dwgType: String,
                            $dwgVolume: String,
                            $drawingCategory: String,
                            $dwgZone:String
                            ),  {

      update_drawingSheets(where: {id: {_eq: $id}},
         _set: {
          ${DrawingSheets.selector.drawingName}: $drawingName, 
          ${DrawingSheets.selector.drawingNumber}: $drawingNumber, 
          ${DrawingSheets.selector.dwgClassification}: $dwgClassification, 
          ${DrawingSheets.selector.dwgLevel}: $dwgLevel, 
          ${DrawingSheets.selector.dwgOriginator}: $dwgOriginator, 
          ${DrawingSheets.selector.dwgProjectNumber}: $dwgProjectNumber, 
          ${DrawingSheets.selector.dwgRevision}: $dwgRevision, 
          ${DrawingSheets.selector.dwgRole}: $dwgRole, 
          ${DrawingSheets.selector.dwgSheetNumber}: $dwgSheetNumber, 
          ${DrawingSheets.selector.dwgStatus}: $dwgStatus, 
          ${DrawingSheets.selector.dwgSuitability}: $dwgSuitability, 
          ${DrawingSheets.selector.dwgType}: $dwgType, 
          ${DrawingSheets.selector.dwgVolume}: $dwgVolume, 
          ${DrawingSheets.selector.drawingCategory}: $drawingCategory,
          ${DrawingSheets.selector.dwgZone}: $dwgZone, 
          }) {
        affected_rows
      }
}`;


//fetch drawing sheet versions
export const FETCH_DRAWING_SHEET_VERSION = 
gql`query fetchDrawingSheetVersion( $drawingName: String, $drawingNumber: String, $setVersionName: String ) {
  ${DrawingSheets.modelName}(
      where: {_and: {status: {_eq:"PUBLISHED"} 
                    drawingName: {_eq: $drawingName}, 
                    drawingNumber: {_eq: $drawingNumber}
              }}) {
        ${DrawingSheets.selector.id}
        ${DrawingSheets.selector.filePath}
        ${DrawingSheets.selector.sourceId}
        ${DrawingSheets.selector.createdAt}
        ${DrawingSheets.selector.createdBy}
        ${DrawingSheets.selector.drawingCategory}
        ${DrawingSheets.selector.drawingName}
        ${DrawingSheets.selector.drawingNumber}
        ${DrawingSheets.selector.drawingSequence}
        ${DrawingSheets.selector.setVersionDate}
        ${DrawingSheets.selector.setTitle}
        ${DrawingSheets.selector.setVersionName}
        ${DrawingSheets.selector.thumbnailPath}
  }
}`;


// to fetch project users
export const FETCH_PROJECT_USERS_LIST = gql`query fetchProjectAssociatedUsers($projectId: Int!, $featureId: [Int!]) {
  projectAssociation(where: {projectId: {_eq: $projectId}}) {
      user {
        email
        firstName
        id
        lastName
      }
    status
    role
  }
  projectPermission(where: {featureId: {_in: $featureId}, authValue: {_gte: 2}}, distinct_on: roleId) {
    roleId
  }
}`;

  export const FETCH_PUBLISHED_DRAWINGS_COUNT = gql`query 
  fetchPublishedDrawingCount(
    $drawingCategory: [String!],
    $setVersionName: [String!],
    $setVersionDate: [timestamp!],
    $status : String,
    $drawingNumber: String,
    $drawingName: String
    ) {
    drawingSheets_aggregate(where: {_and: [{drawingCategory: {_in: $drawingCategory}},
      {setVersionName: {_in: $setVersionName}},
      {setVersionDate: {_in: $setVersionDate}},
      {status: {_eq: $status}}
      ],
    _or: [
            {drawingNumber:{_ilike: $drawingNumber}}, 
            {drawingName: {_ilike: $drawingName}},
    ]
      }, distinct_on: [drawingNumber, drawingName]) {
        aggregate {
          count
        }
      }
  }`;

  export const FETCH_PUBLISHED_CURRENTDRAWINGS_COUNT = gql`query 
  fetchPublishedDrawingCount(
    $drawingCategory: [String!],
    $setVersionName: [String!],
    $setVersionDate: [timestamp!],
    $status : String,
    $drawingNumber: String,
    $drawingName: String
    ) {
    drawingSheets_aggregate(where: {_and: [{drawingCategory: {_in: $drawingCategory}},
      {setVersionName: {_in: $setVersionName}},
      {setVersionDate: {_in: $setVersionDate}},
      {status: {_eq: $status}}
      ],
    _or: [
            {drawingNumber:{_ilike: $drawingNumber}}, 
            {drawingName: {_ilike: $drawingName}},
    ]
      }, distinct_on: [drawingNumber, drawingName]) {
        aggregate {
          count
        }
      }
  }`;

 export const CREATE_DRAWING_SESSION=gql`
  mutation createDrawingSession($objects:[dwgSession_insert_input!]!) {
    insert_dwgSession(objects: $objects, on_conflict: {constraint: dwgSession_pkey, update_columns: status}) {
      returning {
        id
      }
    }
 }`;

 export const CREATE_DRAWING_USER_SESSION_ASSOCIATION= gql`
    mutation createDrawingUserSessionAsscociation($objects: [dwgUserSessionAssociation_insert_input!]!) {
      insert_dwgUserSessionAssociation(objects: $objects, on_conflict: {constraint: dwgUserSessionAssociation_pkey, update_columns: status}) {
        returning {
          id
        }
      }
    }
 `;

 export const FETCH_SESSION_BASED_ON_DRAWING= gql`query fetchSessionBaseionDrawing($drawingId: uuid!) {
  dwgSession(where: {drawingId: {_eq: $drawingId}, status:{_eq: 3}}) {
    id
    name
    status
		drawingId
    createdAt
    createdBy
    dwgUserSessionAssociations {
      userId
      status
    }
  }
}`;

export const ACTIVATE_DRAWING_USER_Session_Status= gql`mutation ActivateDrawingUserSessionStatus($drawingSessionId: uuid!, $userId: uuid!) {
  update_dwgUserSessionAssociation(where: {dwgSessionId: {_eq: $drawingSessionId}, userId: {_eq: $userId}}, _set: {status: true}) {
    affected_rows
  }
}`;

export const DEACTIVATE_DRAWING_USER_Session_Status= gql`mutation DeactivateDrawingUserSessionStatus($drawingSessionId: uuid!, $userId: uuid!) {
  update_dwgUserSessionAssociation(where: {dwgSessionId: {_eq: $drawingSessionId}, userId: {_eq: $userId}}, _set: {status: false}) {
    affected_rows
  }
}`;

export const REMOVE_USER_FROM_SESSION= gql`mutation RemoveUserFromDrawingSession($dwgSessionId: uuid!, $userId: uuid!) {
  delete_dwgUserSessionAssociation(where: {dwgSessionId: {_eq: $dwgSessionId}, userId: {_eq: $userId}}) {
    affected_rows
  }
}`;

export const UPDATE_DRAWING_SESSION_STATUS= gql`
mutation updateDrawingSessionStatus($id: uuid!, $status: Int!) {
  update_dwgSession(where: {id: {_eq: $id}}, _set: {status: $status}) {
    affected_rows
  }
}
`;

export const DEACTIVATE_DRAWING_SESSION= gql`mutation deactivateDrawingSession($drawingSessionId: uuid!) {
  update_dwgSession(where: {id: {_eq: $drawingSessionId}}, _set: {status: 1}) {
    affected_rows
  }
}`;


////update PDF rotation
export const UPDATE_PDF_ROTATION = gql`
    mutation updateDrawingSheetRotation ($id: uuid!, $rotation: Int) {
      update_drawingSheets(where: {id: {_eq: $id}}, _set: {rotation: $rotation}) {
        affected_rows
    }
}`;


//fetch unique categories for filter
export const FETCH_UNIQUE_CATEGORIES = gql`query fetchUniqueCategories {
  drawingSheets(distinct_on: drawingCategory, where: {status: {_eq: "PUBLISHED"}}) {
    drawingCategory
  }
}`;

//fetch unique setVersionDate for filter
export const FETCH_UNIQUE_VERSION_DATE = gql`query fetchUniqueVersionDate {
  ${DrawingSheets.modelName}(distinct_on: setVersionDate, where: {status: {_eq: "PUBLISHED"}}) {
     ${DrawingSheets.selector.setVersionDate}
  }
}`;

//fetch unique setVersionDate for filter
export const FETCH_UNIQUE_VERSION_NAME = gql`query fetchUniqueVersionName {
  ${DrawingSheets.modelName}(distinct_on: setVersionName, where: {status: {_eq: "PUBLISHED"}}) {
     ${DrawingSheets.selector.setVersionName}
  }
}`;

//fetch unique setVersionDate for filter
export const FETCH_UNIQUE_DWG_REVISION = gql`query fetchUniqueDrawingRevision {
  ${DrawingSheets.modelName}(distinct_on: dwgRevision, where: {status: {_eq: "PUBLISHED"}}) {
     ${DrawingSheets.selector.dwgRevision}
  }
}`;


