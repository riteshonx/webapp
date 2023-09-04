import { client } from "src/services/graphql";
import axios from 'axios';
import { getProjectExchangeToken,getExchangeToken } from "src/services/authservice";
import {
  UPDATE_CONSTRAINT_STATUS,
  FETCH_DAILYLOG_ID,
  FETCH_FORM_ID,
  UPDATE_ACTIVITY_STATUS,
  GET_PROJECT_DAILYLOG_USERSLIST,
  CREATE_TASK_CONSTRAINTS,
  INSERT_ATTACHEDFILES,
  INSERT_ATTACHEDFILES_WITHTASKID,
  UPDATE_ACTIVITY_STATUS_COMPLETED,
} from "../graphql/queries/dailyLogs";
import {
  getDailyLogGlobalId,
  getUpdateConstraintRole,
  getUpdateDailyLogStatusRole,
} from "./roles";

export const fetchGlobalId = async (date: string) => {
  const [role] = getDailyLogGlobalId();
  try {
    const response = await client.query({
      query: FETCH_DAILYLOG_ID,
      variables: {
        date,
      },
      context: { role, token: getProjectExchangeToken() },
      fetchPolicy: "network-only",
    });
    const {
      data: { projectDailyLog },
    } = response;
    return projectDailyLog[0]?.id;
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

export const fetchUniqueFormId = async (
  createdBy: string,
  uniqueDailylogId: number
) => {
  const [role] = getDailyLogGlobalId();
  try {
    const response = await client.query({
      query: FETCH_FORM_ID,
      variables: {
        createdBy,
        uniqueDailylogId,
      },
      context: { role, token: getProjectExchangeToken() },
      fetchPolicy: "network-only",
    });
    const {
      data: { forms },
    } = response;
    if (forms && forms.length && forms[0]?.id) return forms[0].id;
    else return 0;
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

export const updateConstraint = async (id: string, status: string) => {
  const [role] = getUpdateConstraintRole();
  try {
    await client.mutate({
      mutation: UPDATE_CONSTRAINT_STATUS,
      variables: {
        id,
        status,
      },
      context: { role, token: getProjectExchangeToken() },
    });
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

export const updateActivityStatus = async (
  taskId: any,
  status: string,
  category?: string,
  variance?: string,
  actualStartDate?: string,
  estimatedEndDate?: string,
  createdAt?:string
) => {
  const [role] = getUpdateDailyLogStatusRole();
  try {
   const response = await client.mutate({
      mutation: UPDATE_ACTIVITY_STATUS,
      variables: {
        taskId,
        status,
        category: category || undefined,
        variance: variance || undefined,
        actualStartDate: actualStartDate || undefined,
        estimatedEndDate: estimatedEndDate || undefined,
        createdAt:createdAt ||undefined
      },
      context: { role, token: getProjectExchangeToken() },
    });
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }finally{
    await  refreshActivity()
  }
};

export const fetchFilterUsersList = async () => {
  const [role] = getDailyLogGlobalId();
  try {
    const getUsersList = await client.query({
      query: GET_PROJECT_DAILYLOG_USERSLIST,
      fetchPolicy: "network-only",
      context: { role, token: getProjectExchangeToken() },
    });
    const {
      data: { forms },
    } = getUsersList;
    return forms;
  } catch (error: any) {
    console.error(error);
  }
};

export const addConstraintName = async (
  constraint: string,
  constraintName: string,
  taskId: string
) => {
  const [role] = getUpdateDailyLogStatusRole();
  try {
    const response: any = await client.mutate({
      mutation: CREATE_TASK_CONSTRAINTS,
      variables: {
        object: {
          category: constraint,
          constraintName: constraintName,
          taskId: taskId,
          linkId: null,
          status: "open",
        },
      },
      context: { role, token: getProjectExchangeToken() },
    });
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
};

export const insertAttachedFiles = async (
  blobKey: string,
  fileName: string,
  fileSize: number,
  fileType: string,
  timesheetId: number | string
) => {
  const [role] = getUpdateConstraintRole();
  try {
    await client.mutate({
      mutation: INSERT_ATTACHEDFILES,
      variables: {
        blobKey,
        fileName,
        fileSize,
        fileType,
        timesheetId,
      },
      context: { role, token: getProjectExchangeToken() },
    });
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

export const insertAttachedFilesWithTaskId = async (
  blobKey: string,
  fileName: string,
  fileSize: number,
  fileType: string,
  taskId: string
) => {
  const [role] = getUpdateDailyLogStatusRole();
  try {
    await client.mutate({
      mutation: INSERT_ATTACHEDFILES_WITHTASKID,
      variables: {
        blobKey,
        fileName,
        fileSize,
        fileType,
        taskId,
      },
      context: { role, token: getProjectExchangeToken() },
    });
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

export const updateActivityStatusCompleted = async (
  taskId: any,
  status: string,
  category?: string,
  variance?: string,
  actualEndDate?: string,
  actualStartDate?: string,
  createdAt?:string
) => {
  const [role] = getUpdateDailyLogStatusRole();
  try {
  const response =   await client.mutate({
      mutation: UPDATE_ACTIVITY_STATUS_COMPLETED,
      variables: {
        taskId,
        status,
        category: category || undefined,
        variance: variance || undefined,
        actualEndDate: actualEndDate || undefined,
        actualStartDate,
        createdAt:createdAt ||undefined
      },
      context: { role, token: getProjectExchangeToken() },
    });
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }finally{
    await  refreshActivity()
  }
};


const refreshActivity = async()=>{
  try{
    const excahngeToken = getExchangeToken()
    await axios.get(`${process.env.REACT_APP_DASHBOARD_URL}dashboard/refreshCubeByTenant?widget=PRODUCTIVITY_INSIGHTS`,
    {
      headers:{
        Accept: 'application/json',
        Authorization: `Bearer ${excahngeToken}`
      }
    })
  }catch(error){
    console.log("Error in refreshing activity",error)
  }
}