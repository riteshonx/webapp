import { client } from "src/services/graphql";
import {
  decodeProjectExchangeToken,
  getProjectExchangeToken,
} from "src/services/authservice";
import {
  FETCH_ASSIGNED_ACTIVITIES,
  FETCH_UPCOMING_ACTIVITIES,
  UPDATE_ACTIVITY_COMMENTS,
  FETCH_TIMESHEET_ENTRIES,
  UPDATE_ADDITIONAL_COMMENTS,
  GET_PROJECT_DAILYLOG_FEATURE_ID,
  UPDATE_COMMENT_WITHOUTTIMESHEETID,
  INSERT_ATTACHEDFILES,
  INSERT_ATTACHEDFILES_WITHTASKID,
  LOAD_CONSTRAINT_LIST_VALUES,
  CREATE_TASK_CONSTRAINTS,
  UPDATE_ADDITIONAL_COMMENTS_WITHCOMMENTID,
  UPDATE_ADDITIONAL_COMMENTS_WITHDAILYLOGID,
  UPDATE_ADDITIONAL_COMMENTS_WITHFORMID,
  NEW_FETCH_TIMESHEET_ENTRIES
} from "../../graphql/queries/dailyLogs";
import {
  getAdditionalCommentRole,
  getDailyLogGlobalId,
  getUpdateConstraintRole,
  getUpdateDailyLogStatusRole,
  getUpdateRole,
  getActivitiesRole,
} from "../../common/roles";
import moment from "moment";
import Notification, {
  AlertTypes,
} from 'src/modules/shared/components/Toaster/Toaster';

export const getUpdatedTimeSheet = async (taskIds:any) => {
  try {
    const { userId } = decodeProjectExchangeToken();
    const [role] = getActivitiesRole();
    const response = await client.query({
      query: NEW_FETCH_TIMESHEET_ENTRIES,
      variables: {
        taskIds: taskIds,
      },
      fetchPolicy: "network-only",
      context: { role, token: getProjectExchangeToken() },
    });
    return response?.data?.taskTimesheetEntry ;
  } catch (error: any) {
    console.error("Error occurred while fetching timesheet entries", error);
    Notification.sendNotification(
      'Something went wrong while fetching timesheet entries',
      AlertTypes.error
    );
    throw new Error(error);
  }
};

export const getAssignedActivities = async () => {
  try {
    const { userId } = decodeProjectExchangeToken();
    const [role] = getActivitiesRole();
    const response = await client.query({
      query: FETCH_ASSIGNED_ACTIVITIES,
      variables: {
        userId: userId,
      },
      fetchPolicy: "network-only",
      context: { role, token: getProjectExchangeToken() },
    });
    const {
      data: { projectTask },
    } = response;
    return projectTask;
  } catch (error: any) {
    console.error("Error occurred while fetching assigned activities", error);
    throw new Error(error);
  }
};

export const getUpcomingActivities = async () => {
  try {
    const { userId } = decodeProjectExchangeToken();
    const [role] = getActivitiesRole();
    const nullTimestamp = "T00:00:00.000000+00:00";
    const lessThan7Days =
      moment().add(7, "day").utc().format("YYYY-MM-DD") + nullTimestamp;
    const response = await client.query({
      query: FETCH_UPCOMING_ACTIVITIES,
      variables: {
        userId: userId,
        lessThan: lessThan7Days,
      },
      fetchPolicy: "network-only",
      context: { role, token: getProjectExchangeToken() },
    });
    const {
      data: { projectTask },
    } = response;
    return projectTask;
  } catch (error: any) {
    console.error("Error occurred while fetching assigned activities", error);
    throw new Error(error);
  }
};

export const updateActivityCommentsWithTimeSheetId = async (
  comment: string,
  timesheetId?: number | string
) => {
  const [role] = getUpdateConstraintRole();
  try {
    await client.mutate({
      mutation: UPDATE_ACTIVITY_COMMENTS,
      variables: {
        // we ought to send some string to the backend
        comment: comment.trim() || "DELETED_TASK_COMMENT",
        timesheetId,
        deleteComment: comment.trim() ? false : true,
      },
      context: { role, token: getProjectExchangeToken() },
    });
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

export const fetchTimeSheetEntries = async (id: number) => {
  const [role] = getDailyLogGlobalId();
  try {
    const response = await client.query({
      query: FETCH_TIMESHEET_ENTRIES,
      variables: {
        id: id || undefined,
      },
      context: { role, token: getProjectExchangeToken() },
      fetchPolicy: "network-only",
    });
    const {
      data: { forms_by_pk },
    } = response;
    let taskTimesheetEntries = [];
    let comments = [];
    if (forms_by_pk) {
      taskTimesheetEntries = forms_by_pk.taskTimesheetEntries;
      comments = forms_by_pk.comments;
    }
    return { taskTimesheetEntries, comments };
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

export const updateAdditionalCommentsWithDailyLogId = async (
  comment: string,
  uniqueDailylogId: number,
  featureId: number
) => {
  const [role] = getAdditionalCommentRole();
  try {
    await client.mutate({
      mutation: UPDATE_ADDITIONAL_COMMENTS_WITHDAILYLOGID,
      variables: {
        comment,
        uniqueDailylogId,
        featureId,
      },
      context: { role, token: getProjectExchangeToken() },
    });
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

export const updateAdditionalCommentsWithFormId = async (
  comment: string,
  formId: number
) => {
  const [role] = getAdditionalCommentRole();
  try {
    await client.mutate({
      mutation: UPDATE_ADDITIONAL_COMMENTS_WITHFORMID,
      variables: {
        comment,
        formId,
      },
      context: { role, token: getProjectExchangeToken() },
    });
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

export const updateAdditionalCommentsWithCommentId = async (
  comment: string,
  commentId: number
) => {
  const [role] = getUpdateRole();
  try {
    await client.mutate({
      mutation: UPDATE_ADDITIONAL_COMMENTS_WITHCOMMENTID,
      variables: {
        comment: comment.trim() || "DELETED_LOG_COMMENT",
        commentId,
        deleteComment: comment.trim() ? false : true,
      },
      context: { role, token: getProjectExchangeToken() },
    });
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

export const updateAdditionalComments = async (
  comment: string,
  featureId: number,
  date: string
) => {
  const [role] = getAdditionalCommentRole();
  try {
    await client.mutate({
      mutation: UPDATE_ADDITIONAL_COMMENTS,
      variables: {
        comment,
        featureId,
        timestampDate: date,
        createdAtDate: date,
      },
      context: { role, token: getProjectExchangeToken() },
    });
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

export const getProjectFeatureDetails = async () => {
  const [role] = getDailyLogGlobalId();
  try {
    const getFeatureId = await client.query({
      query: GET_PROJECT_DAILYLOG_FEATURE_ID,
      fetchPolicy: "network-only",
      context: { role, token: getProjectExchangeToken() },
    });
    return getFeatureId?.data?.projectFeature[0]?.id;
  } catch (error: any) {
    console.error(error);
  }
};

export const updateActivityComments = async (
  comment: string,
  taskId: string
) => {
  const [role] = getUpdateDailyLogStatusRole();
  try {
    await client.mutate({
      mutation: UPDATE_COMMENT_WITHOUTTIMESHEETID,
      variables: {
        comment,
        taskId,
      },
      context: { role, token: getProjectExchangeToken() },
    });
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

export const fetchCustomListName = async (name: string) => {
  const [role] = getActivitiesRole();
  try {
    const response: any = await client.query({
      query: LOAD_CONSTRAINT_LIST_VALUES,
      variables: {
        name: name,
      },
      fetchPolicy: "network-only",
      context: { role, token: getProjectExchangeToken() },
    });
    if (response.data.configurationLists.length > 0) {
      const varianceCategory = response.data;
      return varianceCategory;
    }
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
};
