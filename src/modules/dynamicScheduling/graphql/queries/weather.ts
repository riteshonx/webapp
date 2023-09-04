import { gql } from '@apollo/client';

export const FETCH_PROJECT_METRICS = gql`query fetchProjectMetrics ($projectId: Int) {
  project(where: {id: {_eq: $projectId}}) {
    metrics
  }
}`

export const FETCH_WEATHER_TEMPLATE = gql`query fetchWeatherConstraintTemplate {
  weatherConstraintTemplate {
    name
    id
    parameter
  }
}`

export const GET_WEATHER_CONSTRAINT = gql`query getWeatherConstraintOfTask($taskId: uuid, $projectId: Int) {
  projectTaskWeatherConstraint(where: {projectId: {_eq: $projectId}, _and: {taskId: {_eq: $taskId}}}) {
    id
    parameter
    templateId
    name
  }
}`

export const CREATE_WEATHER_CONSTRAINT = gql`
  mutation createWeatherConstraint(
    $name: String,
    $parameter: jsonb,
    $projectId: Int,
    $taskId: uuid,
    $templateId: Int,
    $tenantId: Int,
    $updatedBy: uuid,
    $externalId: String,
    $createdBy: uuid
  ) {
    insert_projectTaskWeatherConstraint_one(
      object: {
        name: $name,
        parameter: $parameter,
        projectId: $projectId,
        taskId: $taskId,
        templateId: $templateId,
        tenantId: $tenantId,
        createdBy: $createdBy,
        updatedBy: $updatedBy,
        externalId: $externalId
      }
    ) {
      id
    }
  }
`;

export const UPDATE_WEATHER_CONSTRAINT = gql`mutation updateWeatherConstraint(
  $name: String,
  $templateId: Int,
  $updatedBy: uuid,
  $taskId: uuid,
  $parameter: jsonb) {
  update_projectTaskWeatherConstraint(
    where: {
      taskId: {
        _eq: $taskId
      }
    },
    _set: {
      name: $name,
      templateId: $templateId,
      updatedBy: $updatedBy,
      parameter: $parameter
    }
  )
  {
    affected_rows
  }
}`

export const DELETE_WEATHER_CONSTRAINT = gql`mutation deleteWeatherConstraint($taskId: uuid) {
  delete_projectTaskWeatherConstraint(where: {taskId: {_eq: $taskId}}) {
    affected_rows
  }
}`
