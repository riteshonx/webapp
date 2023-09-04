import React, { useContext, useEffect, useState } from 'react';
import { taskDetailByTaskId } from '../../../api/gql';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import './task.scss';
import {
  ICommonPopoverDetail,
} from 'src/version2.0_temp/models/task';
import { CommonDetailPopover } from './commonDetailPopover';
export const Task = (props: {
  taskId: string;
  onClose: any;
  onDataLoad: any;
}): React.ReactElement => {
  const { taskId, onClose, onDataLoad } = props;
  const { state }: any = useContext(stateContext);
  const [loading, setLoading] = useState(false);
  const [taskDetail, setTaskDetail] = useState({} as ICommonPopoverDetail);
  useEffect(() => {
    fetchTaskDetail();
  }, [taskId]);
  const fetchTaskDetail = async () => {
    setLoading(true);
    try {
      const res = await taskDetailByTaskId(taskId, state.selectedProjectToken);
      setTaskDetail(res as ICommonPopoverDetail);
    } catch (e) {
      console.log(e)
    }
    setLoading(false);
    onDataLoad && onDataLoad();
  };
  return (
    <CommonDetailPopover
      // maxWidth='600px'
      maxHeight='300px'
      onClose={onClose}
      mappedData={taskDetail}
      loading={loading}
    ></CommonDetailPopover>
  );
};
