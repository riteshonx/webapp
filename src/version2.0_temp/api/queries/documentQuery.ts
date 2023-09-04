import { gql } from "@apollo/client";


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


export const GET_ALL_UPLOAD_DATES = gql`
  query GetAllUploadDates {
    documents(where: { _and: { deleted: { _eq: false } } }) {
      createdAt
    }
  }
`;
