import { gql } from '@apollo/client';
import { CustomTemplateLists, DrawingTemplateFields } from '../models/customFormatTemplateModel';
import { DrawingSheets } from '../models/drawingSheetModel';
import { Drawings } from '../models/drawingsModel';

// update uploaded file data
export const CREATE_UPLOADED_FILE_DATA = gql`
    mutation updateUploadFileData ($objects: [drawingUploadStatus_insert_input!]!) {
        insert_drawingUploadStatus(objects: $objects) {
            affected_rows
            returning {
              id
            }
        }
}`;

// to fetch uploaded files data
export const FETCH_UPLOADED_FILES_DATA = gql`query fetchUploadedFilesData {
    ${Drawings.modelName}(order_by: {createdAt: desc}) {
        ${Drawings.selector.id}
        ${Drawings.selector.fileName}
        ${Drawings.selector.fileSize}
        ${Drawings.selector.reviewedBy}
        ${Drawings.selector.sourceKey}
        ${Drawings.selector.status}
        ${Drawings.selector.createdAt}
        
        ${Drawings.selector.createdByTenantUser} {
            ${Drawings.selector.user}  {
                ${Drawings.selector.email} 
                ${Drawings.selector.firstName} 
                ${Drawings.selector.lastName} 
            }
          }
        ${Drawings.selector.versionInfo}
        ${Drawings.selector.versionInfoReviewed}
        ${Drawings.selector.sheets}
        ${Drawings.selector.progress}
        ${CustomTemplateLists.modelName} {
            ${CustomTemplateLists.selector.name}
        }
        ${DrawingSheets.modelName} {
            ${DrawingSheets.selector.id}
        }
    }
}`;

// fetch published drawing library data
export const FETCH_PUBLISHED_DRAWING_LIBRARY_DATA = gql`query fetchPublishedDrawingLibraryData($status: String!) {
    ${Drawings.modelName}(where: {${Drawings.selector.status}: {_eq: $status}}) {
        ${Drawings.selector.id}
        ${Drawings.selector.versionInfoReviewed}
    }
}`;


//update drawing libraries: exit and resume later
export const UPDATE_DRAWING_LIBRARY =gql`
    mutation updateDrawingLibrary($id: uuid!, $categoriesReviewed: jsonb, $versionInfoReviewed: jsonb, 
        $status: String, $setTitle: String, $setVersionName: String, $setVersionDate: timestamp ) {
        update_drawingUploadStatus(where: {id: {_eq: $id}}, _set: {categoriesReviewed: $categoriesReviewed,
             versionInfoReviewed: $versionInfoReviewed, status: $status}) {
        affected_rows
        }
        update_drawingSheets(where: {sourceId: {_eq: $id}}, _set: {setTitle: $setTitle, 
            setVersionName: $setVersionName, setVersionDate: $setVersionDate}
        ) {
            affected_rows
        }
    }
`;

//update drawing libraries: publish
export const UPDATE_DRAWING_LIBRARY_ROTATION =gql`
mutation updateDrawingLibraryStatus($id: uuid!, $sheetsReviewed: jsonb) {
    update_drawingUploadStatus(where: {id: {_eq: $id}}, _set: {sheetsReviewed: $sheetsReviewed}) {
      affected_rows
    }
}
`

//update drawing libraries: publish
export const UPDATE_DRAWING_LIBRARY_STATUS =gql`
mutation updateDrawingLibraryStatus($id: uuid!, $status: String) {
    update_drawingUploadStatus(where: {id: {_eq: $id}}, _set: {status: $status}) {
      affected_rows
    }
}
`;

//update drawing libraries: uploaded
export const UPDATE_DRAWING_LIBRARY_STATUS_UPLOADED =gql`
mutation updateDrawingLibStatus($sourceKey: String, $status: String) {
    update_drawingUploadStatus(where: {sourceKey: {_eq: $sourceKey}}, _set: {status: $status}) {
        affected_rows
    }
}
`;

//delete drawing library
export const DELETE_DRAWING_LIBRARY =gql`
mutation deleteDrawingLibrary($id: uuid!) {
    update_drawingUploadStatus(where: {id: {_eq: $id}}, _set: {isDeleted: true}) {
        affected_rows
    }
}
`;

//publish drawings
// export const PUBLISH_DRAWING = gql`
//     mutation publishDocument ($objects: [drawingSheets_insert_input!]!) {
//         insert_drawingSheets(objects: $objects) {
//             affected_rows
//     }
// }`;

// export const PUBLISH_DRAWING = gql`
//     mutation publishDocument ($objects: [drawingSheets_insert_input!]!) {
//         insert_drawingSheets(
//             objects: $objects, 
//             on_conflict: {
//                 update_columns: [drawingCategory, drawingSequence, thumbnailPath, filePath],
//                 constraint: drawingSheets_drawingNumber_drawingName_setVersionDate_setVersi
//             }
//         ) 
//     {
//         affected_rows
//     }
// }`;

// export const PUBLISH_DRAWING = gql`
// mutation publishDocument ($sourceId: uuid, $status: String) {
//     update_drawingSheets(where: {sourceId: {_eq: $sourceId}}, _set: {status: $status}) {
//         affected_rows
//     }
// }`;

export const PUBLISH_DRAWING = gql` mutation publishDocument ($sourceId: uuid!) {
    publishDrawing_mutation(sourceId: $sourceId) {
        message
    }
}`;



// fetch drawing data with associated template fields
export const FETCH_DRAWING_LIBRARY_DATA = gql`query fetchDrawingLibraryData($drawingId: uuid!) {
      ${Drawings.modelName}(where: {${Drawings.selector.id}: {_eq: $drawingId}})  {
        ${Drawings.selector.id}
        ${Drawings.selector.fileName}
        ${Drawings.selector.fileSize}
        ${Drawings.selector.sourceKey}
        ${Drawings.selector.status}
        ${Drawings.selector.versionInfo}
        ${Drawings.selector.versionInfoReviewed}
        ${Drawings.selector.categoriesReviewed}
        ${Drawings.selector.sheetsReviewed}
        ${Drawings.selector.drawingNumFormat}
        ${CustomTemplateLists.modelName} {
            ${CustomTemplateLists.selector.id}
            ${CustomTemplateLists.selector.name}

          drawingTemFieldFormatAssociations(order_by: {sequenceNumber: asc})  {
            ${DrawingTemplateFields.modelName} {
                ${DrawingTemplateFields.selector.id}
                ${DrawingTemplateFields.selector.name}
                ${DrawingTemplateFields.selector.label}
                ${DrawingTemplateFields.selector.type}
                ${DrawingTemplateFields.selector.groupType}
                ${DrawingTemplateFields.selector.isMandatory}
            }
          }
        }
      }
}`;

// fetch drawing data with associated template fields
export const FETCH_DRAWING_SHEETS_DATA = gql`query fetchDrawingSheetsyData($sourceId: uuid!) {
    ${DrawingSheets.modelName}(order_by: {${DrawingSheets.selector.drawingSequence}: asc}, where: {sourceId: {_eq: $sourceId}, 
        status: {_eq: "PARSED"}}) {
        ${DrawingSheets.selector.id}
        ${DrawingSheets.selector.drawingCategory}
        ${DrawingSheets.selector.drawingName}
        ${DrawingSheets.selector.drawingNumber}
        ${DrawingSheets.selector.drawingSequence}
        ${DrawingSheets.selector.dwgClassification}
        ${DrawingSheets.selector.dwgLevel}
        ${DrawingSheets.selector.dwgOriginator}
        ${DrawingSheets.selector.dwgProjectNumber}
        ${DrawingSheets.selector.dwgRevision}
        ${DrawingSheets.selector.dwgRole}
        ${DrawingSheets.selector.dwgSheetNumber}
        ${DrawingSheets.selector.dwgStatus}
        ${DrawingSheets.selector.dwgSuitability}
        ${DrawingSheets.selector.dwgType}
        ${DrawingSheets.selector.dwgVolume}
        ${DrawingSheets.selector.revisionInfo}
        ${DrawingSheets.selector.dwgZone}
      }
}`;

// update drawing sheets category data
export const UPDATE_DRAWING_SHEET_CATEGORY = gql`
    mutation updateDrawingSheetCategory ($sourceId: uuid!, $oldDrawingCategory: String, $newDrawingCategory: String) {
      update_drawingSheets(where: {sourceId: {_eq: $sourceId}, drawingCategory: {_eq: $oldDrawingCategory}},
        _set: {drawingCategory: $newDrawingCategory}) {
        affected_rows
      }
}`;

// split drawing number: only for UK format
export const SPLIT_DRAWING_NUMBER = gql`
mutation splitDrawingNumber($drawingNumFormat: json!, $sourceId: String!) {
    update_drawingNumberFormat_mutation(drawingNumFormat: $drawingNumFormat, sourceId: $sourceId) {
        message
    }
}`;
  
