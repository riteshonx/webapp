import { gql } from "@apollo/client";

export const FETCH_STATUS_LIST = gql`
  query getAllStatusList($featureId: Int!) {
    formStatus(
      where: {
        _or: [
          { featureId: { _is_null: true } }
          { featureId: { _eq: $featureId } }
        ]
      }
      order_by: { status: asc }
    ) {
      id
      status
      openStatus
      projectFeature {
        caption
      }
    }
  }
`;

export const UPDATE_STATUS_LIST = gql`
  mutation MyMutation(
    $statusId: Int!
    $openStatus: Boolean!
    $status: String!
  ) {
    update_formStatus(
      where: { id: { _eq: $statusId } }
      _set: { openStatus: $openStatus, status: $status }
    ) {
      affected_rows
      returning {
        id
        status
        openStatus
      }
    }
  }
`;

export const CREATE_STATUS_LIST = gql`
  mutation createStatusList(
    $featureId: Int!
    $openStatus: Boolean!
    $status: String!
  ) {
    insert_formStatus(
      objects: {
        featureId: $featureId
        openStatus: $openStatus
        status: $status
      }
    ) {
      affected_rows
    }
  }
`;

export const DELETE_STATUS_LIST = gql`
  mutation DeleteStatusList($statusId: Int!) {
    update_formStatus(
      where: { id: { _eq: $statusId } }
      _set: { deleted: true }
    ) {
      affected_rows
      returning {
        id
        status
        openStatus
      }
    }
  }
`;

export const FETCH_STATUS_LIST_PROJECT_SETTING = gql`
  query getStatusValues($featureId: Int!, $projectId: Int!) {
    projectFormStatusAssociation(
      where: { featureId: { _eq: $featureId }, projectId: { _eq: $projectId } }
    ) {
      featureId
      formStatusId
      formStatus {
        status
        openStatus
      }
    }
  }
`;

export const UPDATE_STATUS_LIST_PROJECT_SETTING = gql`
  mutation MyMutation($objects: [projectFormStatusAssociation_insert_input!]!) {
    insert_projectFormStatusAssociation(
      objects: $objects
      on_conflict: {
        constraint: projectFormStatusAssociation_pkey
        update_columns: deleted
      }
    ) {
      affected_rows
    }
  }
`;
