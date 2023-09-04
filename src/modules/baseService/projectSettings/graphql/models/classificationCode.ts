import { gql } from '@apollo/client';

export const GET_CLASSIFICATION_CODE = gql`
query SearchClassificationCode {
  classificationCodes(
    where: {}
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
      __typename
    }
    __typename
  }
}
`;
