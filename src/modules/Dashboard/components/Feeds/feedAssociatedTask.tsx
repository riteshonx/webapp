import React, { useEffect, useState } from 'react';
import './feedAssociatedTask.scss';
import BudgetFormPopover from './forms/budgetFormPopover';
import { FeedRfiForm } from './forms/feedRfiForm';
import { QcChecklist } from './forms/qcChecklist';
import { Task } from './forms/task';
import {IssueForm} from './forms/issueForm';
import { DATA_SOURCE } from './FeedDetailCard';
import DailyLogPopover from './forms/DailyLogPopover';

export const FeedAssociatedTask = ({
	onClose,
	formType,
	formId,
	isTask,
	taskId,
	onDataLoad,
}: {
	onClose?: any;
	formType?: string;
	formId?: number;
	isTask: boolean;
	taskId: string;
	onDataLoad?: any;
}): React.ReactElement => {
  const [latestTaskId, setLatestTaskId] = useState('')

  useEffect(() => {
    setLatestTaskId(taskId)
  },[taskId])

  if (isTask && latestTaskId && latestTaskId === taskId && formType !== DATA_SOURCE.DAILY_LOG) {
    return <Task taskId={latestTaskId} onClose={onClose} onDataLoad={onDataLoad} />;
  } else {
    switch (formType) {
      case DATA_SOURCE.QC_CHECKLIST:
        return <QcChecklist formId={formId} onClose={onClose} onDataLoad={onDataLoad}/>;
      case DATA_SOURCE.RFI_FORMS:
      case DATA_SOURCE.PROCORE_RFI:
      case DATA_SOURCE.PM4_RFI:
      case DATA_SOURCE.BIM360_RFI:
        return <FeedRfiForm formId={formId} onClose={onClose}   onDataLoad={onDataLoad} />;
			case DATA_SOURCE.BUDGET_CHANGE_ORDER_FORMS:
				return <BudgetFormPopover onClose={onClose} formId={formId}onDataLoad={onDataLoad}/>
      case DATA_SOURCE.ISSUE_FORMS:
        return <IssueForm formId={formId} onClose={onClose}   onDataLoad={onDataLoad} />;
      case DATA_SOURCE.DAILY_LOG:
        return <DailyLogPopover onClose={onClose}  onDataLoad={onDataLoad} taskId={taskId}/>
      default:
        return <></>;
    }
  }
};
