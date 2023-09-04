import React, { useContext, useState } from 'react';
import CloseIcon from '../../../../assets/images/icons/closeIcon.svg';
import './feedRfiForm.scss';
import moment from 'moment';
import {FileAttachment} from '../forms/FileAttachment/FileAttachment';
import { getFormDetailByFormId } from './../../../../api/gql/form';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import {TaskLinks} from './TaskLinks/TaskLinks';
import {Skeleton} from '../../../common'

export const FeedRfiForm = ({
  onClose,
  formId,
  onDataLoad
}: {
  formId: number;
  onClose: any;
  onDataLoad?: any;
}): React.ReactElement => {
  const { state }: any = useContext(stateContext);
  const [loading , setLoading] = useState(false);
  const [formObejct, setFormObject] = useState<any>({
    formState:'',
    featureId:-1,
    subjectLabel: '',
    subjectValue: '',
    statusLabel: '',
    statusValue: '',
    rfiTypeLabel: '',
    rfiTypeValue: '',
    responsibleContractorLabel: '',
    responsibleContractorValue: '',
    scheduleImpactLabel: '',
    scheduleImpactValue: '',
    costImpactLabel: '',
    costImpactValue: '',
    dueDateLabel: '',
    dueDateValue: '',
    assigneeLabel: '',
    assigneeValue: '',
    attachmentList:[],
    formTaskLinks:[],
  } as any);
  const getRfiFormListDetailData = async (formId: number) => {
    setLoading(true);
    const rfiFormListDetailData = await getFormDetailByFormId(
      formId,
      state.selectedProjectToken,
      'rfi'
    );
    if (rfiFormListDetailData) {
      getFormField(rfiFormListDetailData?.data);
    }
    onDataLoad && onDataLoad(true)
  };

  useState(() => {
    getRfiFormListDetailData(formId);
  });

  const getFormField = (formFields: any) => {
    const form = formFields?.forms?.[0];
    setFormObject((prevState: any) => ({
      ...prevState,
      featureId: form?.featureId,
      formState:form?.formState,
      costImpactLabel: 'Cost Impact',
      costImpactValue: form?.costImpact ? 'Yes' : 'No',
      scheduleImpactLabel: ' Schedule Impact',
      scheduleImpactValue: form?.scheduleImpact ? 'Yes' : 'No',
      statusLabel: 'Status',
      statusValue: form?.formStatus?.status,
      dueDateLabel: 'Due Date',
      dueDateValue: form?.dueDate,
      responsibleContractorLabel:
        formFields?.formsCompanyLists?.[0]?.formTemplateFieldData?.caption,
      responsibleContractorValue:
        formFields?.formsCompanyLists?.[0]?.tenantCompanyAssociation?.name,
      assigneeLabel:
        formFields?.formsUserLists?.[0]?.formTemplateFieldData?.caption,
      assigneeValue:
        formFields?.formsUserLists?.[0]?.user?.firstName +
        ' ' +
        formFields?.formsUserLists?.[0]?.user?.lastName,
      rfiTypeLabel:
        formFields?.formsConfigLists?.[0]?.formTemplateFieldData?.caption,
      rfiTypeValue: formFields?.formsConfigLists?.[0]?.configValue?.[0],
    }));
    formFields?.forms?.[0]?.formsData.map((formData: any) => {
      if (formData?.caption == 'Subject') {
        setFormObject((prevState: any) => ({
          ...prevState,
          subjectLabel: formData?.caption,
          subjectValue: formData?.valueString,
        }));
      }
    });
    setFormObject((prevState:any)=>({
			...prevState,
			formTaskLinks: formFields?.formTaskLinks,
		}))
    setFormObject((prevState:any)=>({...prevState,attachmentList:formFields?.formsAttachmentList}))
    setLoading(false)
  };

const headerInfo = formObejct?.featureId? `${formObejct?.featureId} |`: null 
  return (loading?<Skeleton/>:
    <div className="v2-rfi-task">
      <div className="v2-rfi-task-nav s-v-center">
        <div className="v2-rfi-task-nav-title">
          <span>{headerInfo}</span>
          <span className="v2-rfi-task-nav-title-subject">{formObejct.subjectValue ? formObejct.subjectValue  : '--'}</span> 
          <span className="v2-rfi-task-nav-title-state">({formObejct?.formState?formObejct?.formState:null})</span>
        </div>
        <img src={CloseIcon} alt="" width={'22px'} onClick={onClose} />
      </div>
      <div className="v2-rfi-task-container">
        <div className="v2-rfi-task-col">
          <div className="v2-rfi-task-title">
            {formObejct.assigneeLabel ? formObejct.assigneeLabel : 'Assignee'} :
          </div>
          <div className="v2-rfi-task-value">
            {formObejct.assigneeValue ? formObejct.assigneeValue : '--'}
          </div>
        </div>
        <div className="v2-rfi-task-col">
          <div className="v2-rfi-task-title">
            {formObejct.statusLabel ? formObejct.statusLabel : 'status'} :
          </div>
          <div className="v2-rfi-task-value">
            {formObejct.statusValue ? formObejct.statusValue : '--'}
          </div>
        </div>
        <div className="v2-rfi-task-col">
          <div className="v2-rfi-task-title">
            {formObejct.dueDateLabel ? formObejct.dueDateLabel : 'Due Date'} :
          </div>
          <div className="v2-rfi-task-value">
            {formObejct.dueDateValue
              ? moment(formObejct.dueDateValue).format('DD MMM YYYY')
              : '--'}
          </div>
        </div>
        <div className="v2-rfi-task-col">
          <div className="v2-rfi-task-title">
            {formObejct.rfiTypeLabel ? formObejct.rfiTypeLabel : 'Rfi Type'} :
          </div>
          <div className="v2-rfi-task-value">
            {formObejct.rfiTypeValue ? formObejct.rfiTypeValue : '--'}
          </div>
        </div>
        <div className="v2-rfi-task-col">
          <div className="v2-rfi-task-title">
            {formObejct.responsibleContractorLabel
              ? formObejct.responsibleContractorLabel
              : 'Responsible Contractor'}{' '}
            :
          </div>
          <div className="v2-rfi-task-value">
            {formObejct.responsibleContractorValue
              ? formObejct.responsibleContractorValue
              : '--'}
          </div>
        </div>
        <div className="v2-rfi-task-col">
          <div className="v2-rfi-task-title">
            {formObejct.costImpactLabel
              ? formObejct.costImpactLabel
              : 'Cost Impact'}{' '}
            :
          </div>
          <div className="v2-rfi-task-value">
            {formObejct.costImpactValue ? formObejct.costImpactValue : '--'}
          </div>
        </div>
        <div className="v2-rfi-task-col">
          <div className="v2-rfi-task-title">
            {formObejct.scheduleImpactLabel
              ? formObejct.scheduleImpactLabel
              : 'Schedule Impact'}{' '}
            :
          </div>
          <div className="v2-rfi-task-value">
            {formObejct.scheduleImpactValue
              ? formObejct.scheduleImpactValue
              : '--'}
          </div>
        </div>
        <div className="v2-rfi-task-col">
        <div className="v2-rfi-task-title">
            Status:
          </div>
        <div className="v2-rfi-task-value">
            {formObejct.statusValue
              ? formObejct.statusValue
              : '--'}
          </div>
          </div>
      </div>
      <FileAttachment attachmentList={formObejct?.attachmentList}/>
      <TaskLinks formTaskLinks={formObejct?.formTaskLinks} />
    </div>
  );
};
