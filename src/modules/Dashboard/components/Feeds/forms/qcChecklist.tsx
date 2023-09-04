import React, { useContext, useEffect, useState } from 'react';
import { getFormDetailByFormId } from '../../../api/gql/form';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import { qcChecklistMapper } from './../../../utils/mapper/formDataMapper';
import './qcChecklist.scss';
import { ICommonPopoverDetail } from 'src/version2.0_temp/models/task';
import CloseIcon from 'src/assets/images/closeIcon.svg';
import { CommonDetailPopover } from './commonDetailPopover';
import { NoDataAvailable } from 'src/modules/Dashboard/utils/commonFormFallback';

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
    try{
    setLoading(true)
    const qcCheckListFormData = await getFormDetailByFormId(
      formId,
      state.selectedProjectToken
    );
    const checkingQc = qcChecklistMapper(qcCheckListFormData) as ICommonPopoverDetail
    setFormDetail(
      qcChecklistMapper(qcCheckListFormData) as ICommonPopoverDetail
    );

    setLoading(false)
    onDataLoad && onDataLoad(true)
    }
    catch(error:any){
      setLoading(false)
      console.log("error while fetching data from qc checklist",error.message)
    }
  };
  if (Object.keys(formDetail).length===0 && !loading){
    return( 	
     <div className="v2-qcchecklist-fallback">
				<img
					src={CloseIcon}
					alt=""
					width={'22px'}
					onClick={onClose}
				/>
				<NoDataAvailable />
			</div>
  )}

    return <CommonDetailPopover
    onClose={onClose}
    mappedData={formDetail}
    loading={loading}
    maxWidth = {'580px'}
    maxHeight = {'200px'}
  ></CommonDetailPopover>
};
