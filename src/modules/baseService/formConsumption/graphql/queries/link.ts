import { gql } from "@apollo/client";

export const CREATE_LINK = gql`
  mutation createFormLink($objects: [insertLinkData!]!) {
    insert_link_mutation(objects: $objects) {
      message
    }
  }
`;

export const DELETE_LINK = gql`
  mutation DeleteLink($objects: [deleteLinkData!]!) {
    delete_link_mutation(objects: $objects) {
      message
    }
  }
`;

export const FETCH_FORM_LINKS = gql`
  query fetchFormLinks($formId: Int!) {
    formLinks_query(formId: $formId) {
      linkFormTask
      linkFormToForm
    }
  }
`;

// export const FETCH_FORM_TO_FORM_LINKS = gql`
//   query fetchLinkFormToForm($formId: Int!) {
//     linkFormToForm(
//       where: {
//         _or: [
//           { sourceFormID: { _eq: $formId } }
//           { targetFormID: { _eq: $formId } }
//         ]
//         targetForm: { formsData: {} }
//       }
//     ) {
//       linkType {
//         name
//       }
//       sourceForm {
//         id
//         projectFeature {
//           caption
//           feature
//           id
//         }
//         formsData(
//           where: { formTemplateFieldData: { caption: { _eq: "Subject" } } }
//         ) {
//           valueString
//         }
//         autoIncrementId: projectAutoIncrement
//       }
//       targetForm {
//         id
//         projectFeature {
//           caption
//           feature
//           id
//         }
//         formsData(
//           where: { formTemplateFieldData: { caption: { _eq: "Subject" } } }
//         ) {
//           valueString
//         }
//         autoIncrementId: projectAutoIncrement
//       }
//     }
//   }
// `;

// export const FETCH_FORM_TO_TASK_LINKS = gql`
//   query fetchLinkFormToTask($formId: Int!) {
//     linkFormTask(where: { formId: { _eq: $formId } }) {
//       linkType {
//         name
//       }
//       form {
//         id
//         projectFeature {
//           caption
//           feature
//           id
//         }
//         formsData(
//           where: { formTemplateFieldData: { caption: { _eq: "Subject" } } }
//         ) {
//           valueString
//         }
//         autoIncrementId: projectAutoIncrement
//       }
//       projectTask {
//         id
//         taskName
//         taskType
//         status
//       }
//     }
//   }
// `;

export const UPDATE_LINK_RELATIONSHIP = gql`
  mutation updateLinkRelationShip(
    $existingRelationship: String!
    $newRelationship: String!
    $sourceId: String!
    $sourceType: Int!
    $targetId: String!
    $targetType: Int!
    $constraint: Boolean
    $constraintName: String!
  ) {
    update_link_mutation(
      existingRelationship: $existingRelationship
      newRelationship: $newRelationship
      sourceId: $sourceId
      sourceType: $sourceType
      targetId: $targetId
      targetType: $targetType
      constraint: $constraint
      constraintName: $constraintName
    ) {
      message
    }
  }
`;

export const FETCH_TASK_TYPE_ID = gql`
  query fetchTaskTypeId {
    projectFeature(where: { feature: { _eq: "MASTER_PLAN" } }) {
      id
    }
  }
`;
