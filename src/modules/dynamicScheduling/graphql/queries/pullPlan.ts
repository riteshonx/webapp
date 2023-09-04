import { gql } from '@apollo/client';

export const GET_PROJECT_USERS = gql` query getProjectUsers($name: String!) {
      user(where: {_or: [{lastName: {_ilike: $name}}, {firstName: {_ilike: $name}}]}) {
              email
              firstName
              id
              lastName
      }
  }  
`;

export const SAVE_PULL_PLAN_EVENT = gql`
  mutation createProjectPullPlanEvent(
        $eventName: String!
        $eventDate: String!
        $description: String!
        $participant: [uuid]!
  ) {
        insertProjectPullPlanEvent_mutation(
                eventName: $eventName
                eventDate: $eventDate
                description: $description
                participant: $participant
    ) {
        id
    }
  }
`;

export const GET_PULL_PLAN_EVENT = gql`
query getPullPlanEvent {
    projectPullPlan(where: {status: {_neq: "closed"}}) {
          projectPullPlanParticipants {
            userId
            user {
              firstName
              lastName
              email
            }
          }
          id
          eventName
          eventDate
          endTime
          description
          createdBy
          createdAt
          status
          startTime
        }
      }
`;

export const CREATE_PULL_PLAN_TASK = gql`
mutation createPullPlanTask($object: projectPullPlanTask_insert_input!) {
  insert_projectPullPlanTask_one(object: $object) {
    id
  }
}
`;


export const UPDATE_ACTIVE_PULL_PLAN_EVENT = gql`
mutation updatePullPlanEvent($status: String!, $id: uuid, $time: timestamptz) {
  update_projectPullPlan(_set: {status: $status, startTime: $time}, where: {id: {_eq: $id}}) {
    affected_rows
  }
}`;

export const UPDATE_CLOSED_PULL_PLAN_EVENT = gql`
mutation updatePullPlanEvent($status: String!, $id: uuid, $time: timestamptz) {
  update_projectPullPlan(_set: {status: $status, endTime: $time}, where: {id: {_eq: $id}}) {
    affected_rows
  }
}`;

export const GET_MY_PULL_PLAN_TASK = gql`
query getMypullPlanTask($pullPlanId: uuid, $userId: uuid) {
  projectPullPlanTask(order_by: {createdAt: desc}, 
    where: {_and: {pullPlanId: {_eq: $pullPlanId}, createdBy: {_eq: $userId}, isDeleted: {_eq: false}}}) {
    description
    date
    duration
    id
    taskName
    taskType
    updatedAt
    createdAt
  }
}`


export const GET_ALL_PULL_PLAN_TASK = gql`
query getAllpullPlanTask($pullPlanId: uuid, $searchparam: String) {
  projectPullPlanTask(order_by: {createdAt: desc}, 
    where: {_and: {pullPlanId: {_eq: $pullPlanId}, taskName: {_ilike: $searchparam}, isDeleted: {_eq: false}}}) {
    description
    date
    duration
    id
    taskName
    taskType
    updatedAt
    createdAt
    createdBy
    tenantAssociation {
      user {
        firstName
        lastName
        jobTitle
        email
      }
    }
  }
}`

export const UPDATE_PULL_PLAN_TASK = gql`  
mutation updatePullPlanTask($id: uuid!, $taskName: String!,$duration: Int!, $description: String!, $date: timestamptz) {
  update_projectPullPlanTask(where: {id: {_eq: $id}}, _set: {taskName: $taskName,
    duration: $duration, description: $description, date: $date}) {
      affected_rows
  }
}`

export const UPDATE_PULL_PLAN_EVENT = gql`
  mutation updateProjectPullPlanEvent(
      $pullPlanId: String!
      $eventName: String!
      $eventDate: String!
      $description: String!
      $startTime: String!
      $endTime: String!
      $status: String!
      $newParticipants: [uuid]!
      $deleteParticipants: [uuid]!
  ) {
      updateProjectPullPlanEvent_mutation(
          pullPlanId: $pullPlanId,
          eventName: $eventName,
          eventDate: $eventDate,
          description: $description,
          startTime: $startTime,
          endTime: $endTime,
          status: $status,
          newParticipants: $newParticipants,
          deleteParticipants: $deleteParticipants
    ) {
        message
    }
  }
`;

export const DELETE_PULL_PLAN_TASK = gql`  
mutation updatePullPlanTask($id: uuid!) {
  update_projectPullPlanTask(where: {id: {_eq: $id}}, _set: {isDeleted: true}) {
      affected_rows
  }
}`

/*
query GET_SCHEDULED_PULL_PLAN ( $id: uuid) {
  projectPullPlanParticipants(where: {userId: 
    {_eq: $id}, projectPullPlan: {status: {_in: ["active", "inactive"]}}}) {
    pullPlanId
    userId
    projectPullPlan {
      status
      eventName
      eventDate
      endTime
      description
    }
  }
}
*/