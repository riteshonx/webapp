import { gql } from '@apollo/client';

export const GET_PROJECT_LIST = gql`
  query getSyncedProjectList($_has_key: String, $_contains: jsonb) {
    connectorsProject(
      where: { metadata: { _has_key: $_has_key, _contains: $_contains } }
    ) {
      projectId
      agaveProjectId
      synced
      metadata
      project {
        name
      }
    }
  }
`;
export const GET_SLATE_PROJECTS = gql`
  query fetchMyProjects {
    project {
      id
      name
    }
  }
`;

export const GET_FORMS_FEATURE_LIST = gql`
  query getProjectFeature {
    projectFeature {
      id
      caption
    }
  }
`;

export const INSERT_CONNECTOR_SYNC = gql`
  mutation insertConnectorSync($objects: [connectorSync_insert_input!]!) {
    insert_connectorSync(objects: $objects) {
      affected_rows
    }
  }
`;
