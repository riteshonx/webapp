import React, { useContext, useEffect, useState } from 'react';
import { issueFormDetailById } from '../../../api/gql';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import NotificationMessage, {
	AlertTypes,
} from 'src/modules/shared/components/Toaster/Toaster';
import './issueForm.scss';
import {
  ICommonPopoverDetail,
} from '../../../models';
import { CommonDetailPopover } from './commonDetailPopover';
export const IssueForm = (props: {
  formId: number;
  onClose: any;
  onDataLoad: any;
}): React.ReactElement => {
  const { formId, onClose, onDataLoad } = props;
  const { state }: any = useContext(stateContext);
  const [loading, setLoading] = useState(false);
  const [formDetail, setFormDetail] = useState({} as ICommonPopoverDetail);
  useEffect(() => {
    fetchFormDetail();
  }, []);
  const fetchFormDetail = async () => {
  try{
    setLoading(true);
    const res = await issueFormDetailById(formId, state.selectedProjectToken);
    setLoading(false);
    setFormDetail(res);
    onDataLoad && onDataLoad();
  }catch(error){
    console.log("error",error)
    setLoading(false);
    NotificationMessage.sendNotification(
      `error while fetching form detail`,
      AlertTypes.error
    );
  }
  };
  return (
    <CommonDetailPopover
      onClose={onClose}
      mappedData={formDetail}
      loading={loading}
      maxWidth = {'580px'}
      maxHeight = {'200px'}
    ></CommonDetailPopover>
  );
};