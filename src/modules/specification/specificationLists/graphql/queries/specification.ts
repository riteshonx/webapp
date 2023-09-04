import { gql } from "@apollo/client";
import { Specifications } from "../models/specificationModels";

// update uploaded file data
export const CREATE_UPLOADED_SPEC_FILE_DATA = gql`
  mutation updateUploadFileData(
    $objects: [techspecUploadStatus_insert_input!]!
  ) {
    insert_techspecUploadStatus(objects: $objects) {
      affected_rows
      returning {
        id
      }
    }
  }
`;

// to fetch uploaded files data
export const FETCH_UPLOADED_FILES_DATA = gql`query techspecUploadStatus {
    ${Specifications.modelName}(order_by: {createdAt: desc}, where: {isDeleted: {_eq: false}}) {
        ${Specifications.selector.id}
        ${Specifications.selector.fileName}
        ${Specifications.selector.fileSize}
        ${Specifications.selector.reviewedBy}
        ${Specifications.selector.sourceKey}
        ${Specifications.selector.status}
        ${Specifications.selector.createdAt}
        ${Specifications.selector.createdBy}
        ${Specifications.selector.versionInfo}
        ${Specifications.selector.versionInfoReviewed}
        ${Specifications.selector.sectionInfoReviewed}
        ${Specifications.selector.sectionInfo}
        ${Specifications.selector.progress}
        submittalInfoReviewed
        ${Specifications.selector.createdByTenantUser} {
          ${Specifications.selector.user}  {
              ${Specifications.selector.email} 
              ${Specifications.selector.firstName} 
              ${Specifications.selector.lastName} 
          }
        }
    }
}`;

// to fetch uploaded files data
export const FETCH_UPLOADED_FILES_PDF_DATA = gql`query techspecUploadStatus {
  ${Specifications.modelName}(order_by: {createdAt: desc}, where: {isDeleted: {_eq: false}}) {
      ${Specifications.selector.id}
      ${Specifications.selector.fileName}
      ${Specifications.selector.fileSize}
      ${Specifications.selector.sourceKey}
  }
}`;

// fetch document library data
export const FETCH_DOCUMENT_LIBRARY_DATA = gql`query fetchDocumnetLibraryData($specificationId: uuid!) {
    ${Specifications.modelName}(where: {${Specifications.selector.id}: {_eq: $specificationId}}) {
        ${Specifications.selector.id}
        ${Specifications.selector.fileName}
        ${Specifications.selector.fileSize}
        ${Specifications.selector.reviewedBy}
        ${Specifications.selector.sourceKey}
        ${Specifications.selector.status}
        ${Specifications.selector.id}
        ${Specifications.selector.versionInfo}
        ${Specifications.selector.divisionsReviewed}
        ${Specifications.selector.sectionInfoReviewed}
        ${Specifications.selector.versionInfoReviewed}
        ${Specifications.selector.sectionInfo}
        ${Specifications.selector.progress}
      }
}`;
// fetch document library data
export const FETCH_SECTIONS_DATA = gql`query fetchDocumnetLibraryData($specificationId: uuid!,$offset: Int!, $limit: Int!) {
    ${Specifications.modelName}(limit: $limit, offset: $offset, where: {${Specifications.selector.id}: {_eq: $specificationId}}) {
        ${Specifications.selector.id}
        ${Specifications.selector.sectionInfo}
      }
}`;

// fetch published specifiction library data
export const FETCH_PUBLISHED_DOCUMENT_LIBRARY_DATA = gql`query fetchPublishedDocumentLibraryData($status: String!) {
    ${Specifications.modelName}(where: {${Specifications.selector.status}: {_eq: $status}}) {
        ${Specifications.selector.id}
        ${Specifications.selector.versionInfoReviewed}
    }
}`;

// //update document libraries: exit and resume later
export const UPDATE_DOCUMENT_LIBRARY = gql`
  mutation updateDocumnetLibrary(
    $id: uuid!
    $divisionsReviewed: jsonb
    $sectionInfoReviewed: jsonb
    $versionInfoReviewed: jsonb
    $status: String
  ) {
    update_techspecUploadStatus(
      where: { id: { _eq: $id } }
      _set: {
        divisionsReviewed: $divisionsReviewed
        sectionInfoReviewed: $sectionInfoReviewed
        versionInfoReviewed: $versionInfoReviewed
        status: $status
      }
    ) {
      affected_rows
    }
  }
`;
// export const UPDATE_DOCUMENT_LIBRARY = gql`
// mutation updateDocumnetLibrary($id: uuid!, $sectionInfoReviewed: jsonb, $versionInfoReviewed: jsonb, $status: String) {
//     update_techspecUploadStatus(where: {id: {_eq: $id}}, _set: {
//         sectionInfoReviewed: $sectionInfoReviewed, versionInfoReviewed: $versionInfoReviewed, status: $status}) {
//       affected_rows
//     }
// }
// `;

//update specifiction libraries: publish
export const UPDATE_DOCUMENT_LIBRARY_STATUS = gql`
  mutation updateDocumentLibraryStatus($id: uuid!, $status: String) {
    update_techspecUploadStatus(
      where: { id: { _eq: $id } }
      _set: { status: $status }
    ) {
      affected_rows
    }
  }
`;
//update specifiction libraries: uploaded
export const UPDATE_DOCUMENT_LIBRARY_STATUS_UPLOADED = gql`
  mutation updateDocumentLibraryStatusUploaded($id: uuid!, $status: String) {
    update_techspecUploadStatus(
      where: { id: { _eq: $id } }
      _set: { status: $status }
    ) {
      affected_rows
    }
  }
`;
// update after delete section from list view
// export const UPDATE_SECTION_DETAIL = gql`
// mutation updateDocumnetLibrary($id: uuid!, $sectionInfoReviewed: jsonb,$status: String) {
//     update_techspecSections(where: {id: {_eq: $id}}, _set:
//         sectionNumber: $sectionNumber,
//     sectionName: $sectionName}) {
//       affected_rows
//     }
// }`;

// //delete document library
export const DELETE_DOCUMENT_LIBRARY = gql`
  mutation deleteDocumentLibrary($id: uuid!) {
    update_techspecUploadStatus(
      where: { id: { _eq: $id } }
      _set: { isDeleted: true }
    ) {
      affected_rows
    }
  }
`;
//publish specification
// export const PUBLISH_SPECIFICATION = gql`
//     mutation publishSpecification ($objects: [techspecSections_insert_input!]!) {
//         insert_techspecSections(objects: $objects) {
//             affected_rows
//     }
// }`;

export const PUBLISH_SPECIFICATION = gql`
  mutation publishSpecification($objects: [techspecSections_insert_input!]!) {
    insert_techspecSections(objects: $objects) {
      affected_rows
    }
  }
`;
// trigger submittal
export const UPDATE_SUBMITTAL_EXTRACTION = gql`
  mutation triggerSubmittal($submittalId: String!) {
    submittalProcess(submittalId: $submittalId) {
      ack
    }
  }
`;

export const GET_CONFIGURATION_LISTS = gql`
  query MyQuery {
    configurationLists {
      configurationValues {
        id
        nodeName
        parentId
        sequence
      }
    }
  }
`;

export const GET_SUBMITTAL_DETAIL = gql`
  query submittalDetail($id: uuid!) {
    techspecUploadStatus(where: { id: { _eq: $id } }) {
      id
      fileName
      fileSize
      sourceKey
      submittalInfo
      submittalInfoReviewed
    }
  }
`;

export const PUBLISH_SUBMITTAL_INFO_REVIEWED = gql`
  mutation updateSubmitallInfoReviewed(
    $id: uuid!
    $submittalInfoReviewed: jsonb
    $status: String!
  ) {
    update_techspecUploadStatus(
      where: { id: { _eq: $id } }
      _set: { submittalInfoReviewed: $submittalInfoReviewed, status: $status }
    ) {
      affected_rows
    }
  }
`;
// id
// name

// query MyQuery {
//     techspecUploadStatus(where: {id: {_eq: "e6dd404e-bd90-4ff7-ab61-30d7691736f0"}}) {
//       id
//       fileName

// mutation MyMutation {
//     update_techspecUploadStatus(where: {id: {_eq: ""}}, _set: {submittalInfoReviewed: "", status: "RESUME"}) {
//       affected_rows
//     }
//   }

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
