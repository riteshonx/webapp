import { gql } from '@apollo/client';

// to fetch list of forms
export const FETCH_LIST_FORMS = gql`
  query getListForm($featureId: Int!) {
    listForms_query(featureId: $featureId) {
      count
      data {
        formsData
        id
        specificationId
        submittalId
        blockedByCounter
      }
    }
  }
`;

export const INSERT_TASK_FORM_LINK = gql`
  mutation insertTaskFormLink(
    $taskId: uuid!
    $linkData: [insertTaskFormLinkData!]!
  ) {
    insert_taskFormlink_mutation(linkData: $linkData, taskId: $taskId) {
      message
    }
  }
`;

export const DELETE_TASK_FORM_LINK = gql`
  mutation deleteTaskFormLink($linkIds: [uuid!]!, $taskId: uuid!) {
    delete_taskFormlink_mutation(linkIds: $linkIds, taskId: $taskId) {
      message
    }
  }
`;

export const GET_TASK_LINKED_FORM = gql`
  query fetchLinkFormToTask($taskId: uuid!) {
    linkFormTask(where: { taskId: { _eq: $taskId } }) {
      id
      linkType {
        name
        id
      }
      form {
        id
        projectFeature {
          feature
          id
        }
        formsData(
          where: { formTemplateFieldData: { caption: { _eq: "Subject" } } }
        ) {
          valueString
        }
      }
    }
  }
`;

//  {
//         category: "Form-RFI"
//         constraintName: "FormSubject"
//         linkId: "88076844-b954-11eb-8529-0242ac130003"
//         status: "open"
//         taskId: "88076844-b954-11eb-8529-0242ac130003"
//       }

export const ADD_AS_CONSTRAINT = gql`
  mutation adAsConstraint($object: projectTaskConstraints_insert_input!) {
    insert_projectTaskConstraints(objects: $object) {
      returning {
        category
        constraintName
        linkId
        status
        taskId
        id
      }
    }
  }
`;

export const UPDATE_LINK_FORM = gql`
  mutation updateLinkedForm($id: uuid!, $linkTypeId: Int!) {
    update_linkFormTask(
      where: { id: { _eq: $id } }
      _set: { linkTypeId: $linkTypeId }
    ) {
      returning {
        id
      }
    }
  }
`;
