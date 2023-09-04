import { gql } from "@apollo/client";

export const GET_DMS_FEATURE_ID = gql`
  query getDMSFeatureId {
    projectFeature(where: { feature: { _eq: "DMS" } }) {
      id
      feature
    }
  }
`;

export const GET_ALL_UPLOAD_DATES = gql`
  query GetAllUploadDates {
    documents(where: { _and: { deleted: { _eq: false } } }) {
      createdAt
    }
  }
`;

export const GET_IMAGES_ON_DASHBOARD = gql`
  query getImagesOnDashboard($projectId: [Int!]) {
    documents(
      where: {
        projectId: { _in: $projectId }
        viewOnDashboard: { _eq: true }
        deleted: { _eq: false }
      }
    ) {
      name
      mimeType
      fileKey
    }
  }
`;

export const GET_ALL_DOCUMENTS = gql`
  query GetProjectDocuments(
    $from: timestamptz
    $to: timestamptz
    $offset: Int!
    $limit: Int!
    $qry: String
  ) {
    documents_aggregate(
      where: {
        _and: {
          createdAt: { _gte: $from, _lte: $to }
          deleted: { _eq: false }
          name: { _ilike: $qry }
        }
      }
    ) {
      aggregate {
        count
      }
    }
    documents(
      limit: $limit
      offset: $offset
      order_by: { updatedAt: desc }
      where: {
        _and: {
          createdAt: { _gte: $from, _lte: $to }
          deleted: { _eq: false }
          name: { _ilike: $qry }
        }
      }
    ) {
      documentTagAssociations {
        tag {
          id
          name
        }
      }
      mimeType
      documentType {
        id
        name
      }
      description
      coordinates
      fileKey
      fileSize
      id
      name
      metadata
      thumbnailKey
      uploaded
      createdBy
      createdAt
      updatedBy
      updatedAt
      viewOnDashboard
      createdByUser {
        firstName
        lastName
      }
      updatedByUser {
        firstName
        lastName
      }
    }
  }
`;

export const GET_DOCUMENT_BY_ID = gql`
  query GetProjectDocuments($id: uuid!) {
    documents(where: { id: { _eq: $id } }) {
      documentTagAssociations {
        tag {
          id
          name
        }
      }
      mimeType
      documentType {
        id
        name
      }
      id
      name
      description
      fileKey
      fileSize
      createdBy
      createdAt
      updatedBy
      updatedAt
      viewOnDashboard
      createdByUser {
        firstName
        lastName
      }
      updatedByUser {
        firstName
        lastName
      }
    }
  }
`;

export const FILTER_DOCUMENTS_BY_TAG = gql`
  query GetProjectDocuments(
    $tagId: [Int!]
    $from: timestamptz
    $to: timestamptz
    $offset: Int!
    $limit: Int!
    $qry: String
  ) {
    documents_aggregate(
      where: {
        _and: {
          documentTagAssociations: { tagId: { _in: $tagId } }
          createdAt: { _gte: $from, _lte: $to }
          deleted: { _eq: false }
          name: { _ilike: $qry }
        }
      }
    ) {
      aggregate {
        count
      }
    }
    documents(
      offset: $offset
      limit: $limit
      order_by: { updatedAt: desc }
      where: {
        _and: {
          documentTagAssociations: { tagId: { _in: $tagId } }
          createdAt: { _gte: $from, _lte: $to }
          deleted: { _eq: false }
          name: { _ilike: $qry }
        }
      }
    ) {
      documentTagAssociations {
        tag {
          id
          name
        }
      }
      mimeType
      documentType {
        id
        name
      }
      description
      coordinates
      fileKey
      fileSize
      id
      name
      metadata
      thumbnailKey
      uploaded
      createdBy
      createdAt
      updatedBy
      updatedAt
      viewOnDashboard
      createdByUser {
        firstName
        lastName
      }
      updatedByUser {
        firstName
        lastName
      }
    }
  }
`;

export const FILTER_DOCUMENTS_BY_DOCTYPE = gql`
  query GetProjectDocuments(
    $documentType: [Int!]
    $from: timestamptz
    $to: timestamptz
    $offset: Int!
    $limit: Int!
    $qry: String
  ) {
    documents_aggregate(
      where: {
        _and: {
          documentTypeId: { _in: $documentType }
          deleted: { _eq: false }
          createdAt: { _gte: $from, _lte: $to }
          name: { _ilike: $qry }
        }
      }
    ) {
      aggregate {
        count
      }
    }
    documents(
      offset: $offset
      limit: $limit
      order_by: { updatedAt: desc }
      where: {
        _and: {
          documentTypeId: { _in: $documentType }
          deleted: { _eq: false }
          createdAt: { _gte: $from, _lte: $to }
          name: { _ilike: $qry }
        }
      }
    ) {
      documentTagAssociations {
        tag {
          id
          name
        }
      }
      mimeType
      documentType {
        id
        name
      }
      description
      coordinates
      fileKey
      fileSize
      id
      name
      metadata
      thumbnailKey
      uploaded
      createdBy
      createdAt
      updatedBy
      updatedAt
      viewOnDashboard
      createdByUser {
        firstName
        lastName
      }
      updatedByUser {
        firstName
        lastName
      }
    }
  }
`;

export const FILTER_BY_DOCTYPE_AND_TAGS = gql`
  query GetProjectDocuments(
    $documentType: [Int!]
    $tagId: [Int!]
    $from: timestamptz
    $to: timestamptz
    $offset: Int!
    $limit: Int!
    $qry: String
  ) {
    documents_aggregate(
      where: {
        _and: {
          documentTypeId: { _in: $documentType }
          documentTagAssociations: { tagId: { _in: $tagId } }
          createdAt: { _gte: $from, _lte: $to }
          deleted: { _eq: false }
          name: { _ilike: $qry }
        }
      }
    ) {
      aggregate {
        count
      }
    }
    documents(
      offset: $offset
      limit: $limit
      order_by: { updatedAt: desc }
      where: {
        _and: {
          documentTypeId: { _in: $documentType }
          documentTagAssociations: { tagId: { _in: $tagId } }
          createdAt: { _gte: $from, _lte: $to }
          deleted: { _eq: false }
        }
      }
    ) {
      documentTagAssociations {
        tag {
          id
          name
        }
      }
      mimeType
      documentType {
        id
        name
      }
      description
      coordinates
      fileKey
      fileSize
      id
      name
      metadata
      thumbnailKey
      uploaded
      viewOnDashboard
      createdByUser {
        firstName
        lastName
      }
      updatedByUser {
        firstName
        lastName
      }
    }
  }
`;

export const GET_TAGS = gql`
  query GetTags {
    tags {
      name
      id
    }
  }
`;

export const GET_DOCUMENT_TYPE = gql`
  query GetDocumentType {
    documentType {
      id
      name
    }
  }
`;

export const CREATE_DOCUMENT = gql`
  mutation createDocuments($fileData: [documents_insert_input!]!) {
    insert_documents(objects: $fileData) {
      returning {
        id
      }
    }
  }
`;

export const UPDATE_DOCUMENT = gql`
  mutation UpdateDocument(
    $fileId: uuid!
    $name: String
    $description: String
    $coordinates: point
    $viewOnDashboard: Boolean
  ) {
    update_documents_by_pk(
      pk_columns: { id: $fileId }
      _set: {
        description: $description
        name: $name
        coordinates: $coordinates
        viewOnDashboard: $viewOnDashboard
      }
    ) {
      id
    }
  }
`;

export const DELETE_TAGS = gql`
  mutation DeleteTagsToDocument($documentId: uuid!) {
    delete_documentTagAssociation(where: { documentId: { _eq: $documentId } }) {
      affected_rows
    }
  }
`;

export const UPDATE_TAGS = gql`
  mutation AddTagToDocument($data: [documentTagAssociation_insert_input!]!) {
    insert_documentTagAssociation(objects: $data) {
      returning {
        tagId
      }
    }
  }
`;

export const DELETE_DOCUMENT = gql`
  mutation DeleteDocument($fileId: uuid!) {
    update_documents(where: { id: { _eq: $fileId } }, _set: { deleted: true }) {
      returning {
        id
      }
    }
  }
`;
