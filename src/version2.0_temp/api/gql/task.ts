import { client } from 'src/services/graphql';
import { ICommonPopoverDetail } from 'src/version2.0_temp/models/task';
import { taskDataMapper } from 'src/version2.0_temp/utils/mapper/taskDataMapper';
import { TASK_DETAIL_BY_TASK_ID } from '../queries/task';

export const taskDetailByTaskId = async (
  taskId: string,
  selectedProjectToken: string
):Promise<ICommonPopoverDetail> => {
  try {
    const taskDetail = await client.query({
      query: TASK_DETAIL_BY_TASK_ID,
      variables: {
        id: taskId,
      },
      fetchPolicy: 'network-only',
      context: {
        role: 'viewMasterPlan',
        token: selectedProjectToken,
      },
    });
    return taskDataMapper({
      task:taskDetail.data.projectTask_by_pk,
      Preceding: taskDetail.data.Preceding,
      Succeeding: taskDetail.data.Succeeding
    });
  } catch (e) {
    throw e;
  }
};
