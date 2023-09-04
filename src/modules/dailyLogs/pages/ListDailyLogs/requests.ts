import {
  GET_DAILYLOG_LIST,
  FETCH_DAILY_LOG_COUNT,
} from "../../graphql/queries/dailyLogs";
import { getProjectExchangeToken } from "src/services/authservice";
import { client } from "src/services/graphql";
import { getDailyLogGlobalId } from "../../common/roles";
import moment from "moment";

export const fetchProjectDailyLogList = async (
  limit: number,
  offset: number,
  createdAt?: string,
  createdBy?: Array<string>
) => {
  const nullTimestamp = "T00:00:00.000000+00:00";
  if (createdAt) createdAt = createdAt + nullTimestamp;
  const [role] = getDailyLogGlobalId();
  try {
    const response = await client.query({
      query: GET_DAILYLOG_LIST,
      variables: {
        limit,
        offset,
        createdBy: createdBy?.length ? createdBy : undefined,
        createdAt: createdAt || undefined,
      },
      fetchPolicy: "network-only",
      context: { role, token: getProjectExchangeToken() },
    });
    return response;
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
};

export const fetchTotalFormCount = async (
  createdAt?: string,
  createdBy?: Array<string>
) => {
  const [role] = getDailyLogGlobalId();
  const nullTimestamp = "T00:00:00.000000+00:00";
  if (createdAt) createdAt = createdAt + nullTimestamp;

  try {
    const response = await client.query({
      query: FETCH_DAILY_LOG_COUNT,
      variables: {
        createdBy: createdBy?.length ? createdBy : undefined,
        createdAt: createdAt || undefined,
      },
      fetchPolicy: "network-only",
      context: { role, token: getProjectExchangeToken() },
    });
    return response.data?.forms_aggregate;
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
};
