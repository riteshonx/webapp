import { client } from 'src/services/graphql';
import { IInsight } from 'src/version2.0_temp/models';
import {
  GET_ALL_INSIGHTS_FOR_METRIC,
  GET_INSIGHTS_DETAIL_BY_ID,
} from '../queries/insightsQuery';
export const getAllInsightsForMetric = async (
  metricName: string,
  selectedProjectToken: string
): Promise<IInsight[]> => {
  try {
    const res = await client.query({
      query: GET_ALL_INSIGHTS_FOR_METRIC,
      variables: {
        metric: metricName,
      },
      fetchPolicy: 'network-only',
      context: {
        role: 'viewMasterPlan',
        token: selectedProjectToken,
      },
    });
    return res?.data?.projectInsightsMaster
      .map((e: any) => e.projectInsightsDrilldowns?.[0] || null)
      .filter((e: any) => e !== null);
  } catch (e) {
    throw e;
  }
};

export const getInsightsDetailById = async (
  indightId: number,
  selectedProjectToken: string
): Promise<IInsight> => {
  try {
    const res = await client.query({
      query: GET_INSIGHTS_DETAIL_BY_ID,
      variables: {
        id: indightId,
      },
      fetchPolicy: 'network-only',
      context: {
        role: 'viewMasterPlan',
        token: selectedProjectToken,
      },
    });
    return res.data.projectInsightsDrilldown_by_pk;
  } catch (e) {
    throw e;
  }
};
