import { client } from 'src/services/graphql';
import { issueFormDataMapper } from 'src/version2.0_temp/utils/mapper/issueFormDataMapper';
import {ISSUE_FORM_DETAIL_BY_ID} from '../../api/queries/formQuery';
import { ICommonPopoverDetail } from 'src/version2.0_temp/models/task';

export const issueFormDetailById = async(  
  formId?: number,
   selectedProjectToken?: string
   ):Promise<ICommonPopoverDetail>=>{
    try{
      const issueFormDetail = await client.query({
        query: ISSUE_FORM_DETAIL_BY_ID,
        variables: {
          formId: formId,
        },
        fetchPolicy: 'network-only',
        context: {
          role: 'viewForm',
          token: selectedProjectToken,
        },
      });
      return issueFormDataMapper(issueFormDetail.data)
    }catch(error){
        throw error;
    }
}