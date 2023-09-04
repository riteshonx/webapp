import { client } from 'src/services/graphql';
import { GET_FORM_DETAIL_BY_FORM_ID, GET_BUDGET_CHANGE_ORDER_FORM_BY_ID,GET_BUDGET_LINE_ITEM } from '../queries/formQuery';
import { formBudgeLineItem, formBudgetChangeControl } from 'src/version2.0_temp/utils/mapper/formBudgetChangeControl';

export const getFormDetailByFormId = async (
  formId: number,
  selectedProjectToken: string,
  formType?:string,
) => {
  try {
    const formResponse = await client.query({
      query: GET_FORM_DETAIL_BY_FORM_ID,
      variables: {
        formId: formId,
      },
      fetchPolicy: 'network-only',
      context: {
        role: 'viewForm',
        token: selectedProjectToken,
      },
    });
    return formType=='rfi' ? formResponse   : formResponse.data.forms?.[0] || {};
  } catch (e) {
    throw e;
  }
};

export const getBudegtChangeOrderFormById = async( formId: number,
  selectedProjectToken: string)=>{
  try{
   const changeOrderFormResponse = await client.query({
      query: GET_BUDGET_CHANGE_ORDER_FORM_BY_ID,
      variables: {
        id: formId,
      },
      fetchPolicy: 'network-only',
      context: {
        role: 'viewMasterPlan',
        token: selectedProjectToken,
      },
    });
    return formBudgetChangeControl(changeOrderFormResponse?.data?.changeOrder[0]);
  }
  catch(err){
    console.log("error while fetching budget change order form",err)
  }
}

export const getBudetLineItem =async(title: string,
  selectedProjectToken: string)=>{
  try{
   const response = await client.query({
      query: GET_BUDGET_LINE_ITEM,
      variables: {
        budgetLineItemTitle: title,
      },
      fetchPolicy: 'network-only',
      context: {
        role: 'viewMasterPlan',
        token: selectedProjectToken,
      },
    });
    return formBudgeLineItem(response.data.projectBudget[0])

  }
  catch(error){
    console.log("error while fetching budget line Item",error)
  }
}