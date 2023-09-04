import { gql } from "@apollo/client";

export const FETCH_ALL_PARENT_FORMS = gql`
  query fetchAllParentForms($featureId: Int) {
    forms(
      where: { featureId: { _eq: $featureId }, parentId: { _is_null: true } }
    ) {
      id
    }
  }
`;

export const FETCH_FORM_DATA = gql`
  query fetchFormData($formId: Int!) {
    punchlistDetails_query(formId: $formId) {
      formData
    }
  }
`;
