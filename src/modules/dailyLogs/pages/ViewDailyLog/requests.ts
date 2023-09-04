import { client } from "src/services/graphql";
import { getProjectExchangeToken } from "src/services/authservice";
import { FETCH_TIMESHEET_ENTRIES } from "../../graphql/queries/dailyLogs";
import { getDailyLogGlobalId } from "../../common/roles";

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
