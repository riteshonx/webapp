import { gql } from '@apollo/client';
import { LessonsLearned } from '../models/lessonsLearned';

export const LOAD_LESSONS_LEARNED_LIST = gql`query getLessonsLearnedList {
    ${LessonsLearned.modelName} (
      limit: 10, order_by: {${LessonsLearned.selector.rank}: asc_nulls_last, ${LessonsLearned.selector.updatedAt}: desc}
      ) {
      ${LessonsLearned.selector.id}
      ${LessonsLearned.selector.rank}
      ${LessonsLearned.selector.status}
      ${LessonsLearned.selector.insightId}
      ${LessonsLearned.relation.lessonslearnedInsight} {
        ${LessonsLearned.selector.id}
        ${LessonsLearned.selector.description}
        ${LessonsLearned.selector.subject}
        ${LessonsLearned.selector.outcomeType}
        ${LessonsLearned.selector.projectId}
        ${LessonsLearned.selector.stage}
        ${LessonsLearned.selector.projectPrimarySystem}
      }
    }
  }
`;

export const LOAD_LESSONS_LEARNED_LIST_WITH_SORT = (query: string) => gql`query getLessonsLearnedList($searchKeyword: String) {
  ${LessonsLearned.modelName} (
    where: {${LessonsLearned.relation.lessonslearnedInsight}: {subject: {_ilike: $searchKeyword}}},
    order_by: {${query}}) {
    ${LessonsLearned.selector.id}
    ${LessonsLearned.selector.rank}
    ${LessonsLearned.selector.status}
    ${LessonsLearned.selector.insightId}
    ${LessonsLearned.relation.lessonslearnedInsight} {
      ${LessonsLearned.selector.id}
      ${LessonsLearned.selector.description}
      ${LessonsLearned.selector.subject}
      ${LessonsLearned.selector.outcomeType}
      ${LessonsLearned.selector.projectId}
      ${LessonsLearned.selector.stage}
      ${LessonsLearned.selector.projectPrimarySystem}
    }
  }
}
`;

export const LOAD_DETAILED_LESSONS_LEARNED = gql`query getDetailedLessonsLearned ($id: uuid!) {
    ${LessonsLearned.modelName} (where: {id: {_eq: $id}}) {
      ${LessonsLearned.selector.id}
      ${LessonsLearned.selector.rank}
      ${LessonsLearned.selector.status}
      ${LessonsLearned.selector.insightId}
      ${LessonsLearned.relation.lessonslearnedInsight} {
        ${LessonsLearned.selector.id}
        ${LessonsLearned.selector.description}
        ${LessonsLearned.selector.subject}
        ${LessonsLearned.selector.outcomeType}
        ${LessonsLearned.selector.projectId}
        ${LessonsLearned.selector.stage}
        ${LessonsLearned.selector.projectPrimarySystem}
        ${LessonsLearned.selector.projectSecondarySystem}
        ${LessonsLearned.selector.leadTime}
        ${LessonsLearned.selector.followUpAction}
        ${LessonsLearned.selector.projectDateRaised}
        ${LessonsLearned.selector.activity}
        ${LessonsLearned.selector.userRole}
        ${LessonsLearned.relation.form} {
          ${LessonsLearned.selector.id}
        }
      }
      ${LessonsLearned.relation.lessonslearnedTaskInsights}(order_by: {createdAt: asc}) {
        ${LessonsLearned.selector.id}
        ${LessonsLearned.selector.action}
        ${LessonsLearned.selector.taskId}
        ${LessonsLearned.relation.projectTask} {
          ${LessonsLearned.selector.taskName}
          ${LessonsLearned.selector.taskType}
          ${LessonsLearned.selector.status}
        }
      }
    }
  }
`

export const LOAD_ATTACHMENTS = gql`query MyQuery($formId: Int) {
  ${LessonsLearned.relation.attachments}(where: {formId: {_eq: $formId}}) {
    ${LessonsLearned.selector.id}
    ${LessonsLearned.selector.fileName}
    ${LessonsLearned.selector.fileSize}
    ${LessonsLearned.selector.blobKey}
    ${LessonsLearned.selector.deleted}
    ${LessonsLearned.selector.fileType}
  }
}
`

export const UPDATE_STATUS = gql`
  mutation updateLessonsLearnedProjectInsightsStatus($status: _lessonslearnedprojectinsightsstatus, $id: uuid) {
    update_lessonslearnedProjectInsights(where: {id: {_eq: $id}}, _set: {status: $status}) {
      returning {
        status
      }
    }
  }
`

export const ADD_ACTIVITY = gql`mutation addActivity(
  $action: lessonslearnedtaskinsightsaction,
  $createdAt: timestamptz,
  $projectInsightId: uuid,
  $taskId: uuid,
  $updatedAt: time) {
  insert_lessonslearnedTaskInsights(objects: {
    action: $action,
    projectInsightId: $projectInsightId,
    taskId: $taskId,
    createdAt: $createdAt,
    updatedAt: $updatedAt}) {
    affected_rows
  }
}`

export const UPDATE_ACTIVITY = gql`mutation updateLessonslearnedTaskInsights(
  $id: uuid,
  $action: lessonslearnedtaskinsightsaction) {
  update_lessonslearnedTaskInsights(where: {id: {_eq: $id}}, _set: {action: $action}) {
      affected_rows
    }
  }`

export const REMOVE_ACTIVITY = gql`mutation removeActivity(
  $id: uuid) {
  delete_lessonslearnedTaskInsights(where: {
    id: {_eq: $id}
  })
  {
    affected_rows
  }
}
`
export const ADD_TASK_CONSTRAINTS = gql`mutation insertProjectTaskConstraints(
  $category: String,
  $constraintName: String,
  $lessonLearnedTaskInsightId: uuid,
  $status: String,
  $taskId: uuid) {
  insert_projectTaskConstraints(
    objects: {
        category: $category,
        constraintName: $constraintName,
        lessonLearnedTaskInsightId: $lessonLearnedTaskInsightId,
        status: $status,
        taskId: $taskId
      }
    )
  {
    affected_rows
  }
}
`

export const DELETE_TASK_CONSTRAINTS = gql`mutation delete_projectTaskConstraints
($lessonLearnedTaskInsightId: uuid) {
  delete_projectTaskConstraints(where: {lessonLearnedTaskInsightId: {_eq: $lessonLearnedTaskInsightId}}) {
    affected_rows
  }
}

`
