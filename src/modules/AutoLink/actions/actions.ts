import { client } from 'src/services/graphql';
import {
  GET_SUGGESTED_LINKS,
  GET_TASK_DETAILS,
  UPDATE_USER_RESPONSE,
} from '../graphql/query';
import { projectFeatureAllowedRoles } from 'src/utils/role';
import Notification, {
  AlertTypes,
} from 'src/modules/shared/components/Toaster/Toaster';
import axios from 'axios';

export const getSuggestedLinks = async (
  token: string
): Promise<any> => {
  try {
    const { data } = await client.query({
      query:  GET_SUGGESTED_LINKS,
      variables: {},
      fetchPolicy: 'network-only',
      context: {
        role: projectFeatureAllowedRoles.viewMasterPlan,
        token,
      },
    });
    return data.projectInsightsTaskFormLink ?? [];
  } catch (err) {}
};

export async function getTaskDetails(
  variables: any,
  token: string
): Promise<any> {
  try {
    const { data } = await client.query({
      query: GET_TASK_DETAILS,
      variables,
      fetchPolicy: 'network-only',
      context: {
        role: projectFeatureAllowedRoles.viewMasterPlan,
        token      
      },
    });
    const projectInsightsTaskFormLink = JSON.parse(
      JSON.stringify(data.projectInsightsTaskFormLink || [])
    ).map((e: any) => {
      const locationArr = e.form?.formsLocationLists?.[0]?.locationValue || [];
      locationArr.pop();
      const location = locationArr.reverse().join(' > ');
      return {
        ...e,
        form: {
          ...(e.form || {}),
          location,
        },
      };
    }).sort((current: any, next: any) => {
      const currentScore = current.linkData?.score || 0
      const nextScore = next.linkData?.score || 0
      return nextScore - currentScore
    });
    return projectInsightsTaskFormLink;
  } catch (err) {}
}

export const updateUserResponse = async (
  id: number[],
  userResponse: string,
  token: string
) => {
  try {
    await client.mutate({
      mutation: UPDATE_USER_RESPONSE,
      variables: {
        userResponse,
        id,
      },
      context: {
        role: projectFeatureAllowedRoles.updateMasterPlan,
        token,
      },
    });
  } catch (err) {
    throw err;
  }
};

export const createAutoLink = async (
  formIds: number[],
  taskId: string,
  token: string
) => {
  const res = await axios.post(
    `${process.env.REACT_APP_SCHEDULER_URL}V1/formTaskLink/create`,
    {
      taskId: taskId,
      formIds: formIds,
    },
    {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.materials;
};