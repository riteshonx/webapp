import React from 'react';
import './feedAssociatedTask.scss';
import BudgetFormPopover from './forms/budgetFormPopover';
import { FeedRfiForm } from './forms/feedRfiForm';
import { QcChecklist } from './forms/qcChecklist';
import { Task } from './forms/task';
import {IssueForm} from './forms/issueForm';
import { DATA_SOURCE } from 'src/version2.0_temp/models';
import DailyLogPopover from './forms/dailyLogPopover';

export const FeedAssociatedTask = ({
	onClose,
	formType,
	formId,
	isTask,
	taskId,
	onDataLoad,
}: {
	onClose?: any;
	formType: string;
	formId: number;
	isTask: boolean;
	taskId: string;
	onDataLoad?: any;
}): React.ReactElement => {
  if (isTask) {
    return <Task taskId={taskId} onClose={onClose} onDataLoad={onDataLoad} />;
  } else {
    switch (formType) {
      case DATA_SOURCE.QC_CHECKLIST:
        return <QcChecklist formId={formId} onClose={onClose} onDataLoad={onDataLoad}/>;
      case DATA_SOURCE.RFI_FORMS:
        return <FeedRfiForm formId={formId} onClose={onClose}   onDataLoad={onDataLoad} />;
			case DATA_SOURCE.BUDGET_CHANGE_ORDER_FORMS:
				return <BudgetFormPopover onClose={onClose} formId={formId}onDataLoad={onDataLoad}/>
      case DATA_SOURCE.ISSUE_FORMS:
        return <IssueForm formId={formId} onClose={onClose}   onDataLoad={onDataLoad} />;
      case DATA_SOURCE.DAILYLOG:
        return <DailyLogPopover/>
      default:
        return <></>;
    }
  }
};
