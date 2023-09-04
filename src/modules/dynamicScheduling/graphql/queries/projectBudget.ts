import { gql } from '@apollo/client';

export const GET_PROJECT_BUDGET = gql`
  query getProjectBudget {
    projectBudget {
      budgetLineItemTitle
      description
      date
      costType
      totalCost
      allowance
      contingency
      totalBudget
      classificationCode
      UOM
      originalBudgetAmount
      modificationAmount
    }
  }
`;
