import React, { useContext, useEffect, useState } from 'react';
import { getFormDetailByFormId } from '../../../../api/gql/form';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import { qcChecklistMapper } from 'src/version2.0_temp/utils/mapper/formDataMapper';
import './qcChecklist.scss';
import { ICommonPopoverDetail } from 'src/version2.0_temp/models/task';
import { CommonDetailPopover } from './commonDetailPopover';

export const QcChecklist = ({
  formId,
  onClose,
  onDataLoad
}: {
  formId: number;
  onClose?: any;
  onDataLoad?: any
}): React.ReactElement => {
  const { state }: any = useContext(stateContext);
  const [formDetail, setFormDetail] = useState({} as ICommonPopoverDetail);
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getQcChecklistData();
  }, []);

  const getQcChecklistData = async () => {
    setLoading(true)
    const qcCheckListFormData = await getFormDetailByFormId(
      formId,
      state.selectedProjectToken
    );
    setFormDetail(
      qcChecklistMapper(qcCheckListFormData) as ICommonPopoverDetail
    );
    setLoading(false)
    onDataLoad && onDataLoad(true)
  };
    return <CommonDetailPopover
    onClose={onClose}
    mappedData={formDetail}
    loading={loading}
    maxWidth = {'500px'}
    maxHeight = {'200px'}
  ></CommonDetailPopover>
};
