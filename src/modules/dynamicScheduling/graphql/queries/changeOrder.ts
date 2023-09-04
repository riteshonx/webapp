import { gql } from '@apollo/client';

export const GET_CHANGE_ORDER = gql`
  query getChangeOrder {
    changeOrder {
      budgetLineItemTitle
      changeOrderNumber
      title
      description
      dateOfRequest
      linkedBudget
      quotedAmount
      estimatedAmount
      approvedAmount
      status
    }
  }
`;
