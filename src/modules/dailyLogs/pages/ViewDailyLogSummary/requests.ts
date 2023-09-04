import { client } from "src/services/graphql";
import { getProjectExchangeToken } from "src/services/authservice";
import { FETCH_DAILYLOG_SUMMARY_DATA } from "../../graphql/queries/dailyLogs";
import { getDailyLogGlobalId } from "../../common/roles";

export const fetchProjectDailylogSummaryData = async (
  uniqueDailylogId: number
) => {
  const [role] = getDailyLogGlobalId();
  try {
    const response = await client.query({
      query: FETCH_DAILYLOG_SUMMARY_DATA,
      variables: {
        uniqueDailylogId,
      },
      fetchPolicy: "network-only",
      context: { role, token: getProjectExchangeToken() },
    });
    const {
      data: { taskTimesheetEntry },
    } = response;
    return taskTimesheetEntry;
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
};
