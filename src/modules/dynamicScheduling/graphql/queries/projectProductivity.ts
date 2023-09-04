import { gql } from '@apollo/client';

export const UPDATE_PROJECT_PRODUCTIVITY = gql`
  mutation updateProjectTask($_set: projectTask_set_input, $id: [uuid!]) {
    update_projectTask(_set: $_set, where: { id: { _in: $id } }) {
      returning {
        id
        plannedLabourHour
        plannedQuantity
        classificationCodeId
      }
    }
  }
`;

export const GET_PROJECT_PRODUCTIVITY = gql`
  query GetProjectProductivity($id: uuid, $classificationCodeId: Int) {
    projectTask(where: { id: { _eq: $id } }) {
      plannedQuantity
      plannedLabourHour
      id
      classificationCode {
        UOM
        id
        classificationCode
        classificationCodeName
        parentClassificationCode
      }
    }
  }
`;

export const GET_CLASSIFICATION_CODE = gql`
  query SearchClassificationCode(
    $classificationCode: String
    $classificationCodeName: String
  ) {
    classificationCodes(
      where: {
        _or: [
          { classificationCode: { _ilike: $classificationCode } }
          { classificationCodeName: { _ilike: $classificationCodeName } }
        ]
      }
    ) {
      id
      parentClassificationCode
      UOM
      classificationCodeName
      classificationCode
      childrens: classificationCodes {
        UOM
        id
        parentClassificationCode
        classificationCode
        classificationCodeName
      }
    }
  }
`;
