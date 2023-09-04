import { client } from 'src/services/graphql';
import {GET_CHECKLIST,GET_FORM_ISSUE_LOGS} from './rfi';



export const getFormChecklist = async(formId:string, token:any):Promise<any>=>{
    try{
      const formChecklistResponse = await client.query({
        query: GET_CHECKLIST,
        variables: {
           formId: Number(formId),
        },
        fetchPolicy: "network-only",
        context: {
          role: "viewForm",
          token:token
        },
      });
   return checkListFormDataMapper(formChecklistResponse?.data?.formsChecklist)
    }catch(error){
      console.log('error in fetching form checlist data',error)
      throw new Error(error)
    }
  }


  export  const getFormIssueLogs = async(formId:string, token:any):Promise<any>=>{
    try{
      const formIssueLogResponse = await client.query({
        query: GET_FORM_ISSUE_LOGS,
        variables: {
           formId: Number(formId),
        },
        fetchPolicy: "network-only",
        context: {
          role:'viewForm',
          token:token
        },
      });
      if(formIssueLogResponse.data.formIssueLogs[0]?.linkedForms.length>0){
        return formIssueLogResponse.data.formIssueLogs[0]?.linkedForms;
      }
    }catch(error){
      console.log('error in fetching form issue log data',error)
      throw error
    }
  }



  const checkListFormDataMapper = (formsChecklist:any)=>{
    const sectionInfo:any = []
    if(formsChecklist.length>0){
      formsChecklist.forEach((checkListItem:any)=>{
        const sectionDetail = {
          id:checkListItem.projectChecklist.id,
          title:checkListItem.projectChecklist.title,
          questions:checkListItem.projectChecklist.projectChecklistItems

        }
        sectionInfo.push(sectionDetail)
        
      })
    }
    return sectionInfo
  }