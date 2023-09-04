enum TaskStatus {
	PROCESSED = 'Processed',
	APPROVED = 'Approved',
	CANCELLED = 'Cancelled',
	REJECTED = 'Rejected',
	NO_COST_IMPACT = 'No cost impact',
	PRICE_TBD = 'Price TBD',
	INTERNAL_REVIEW = 'Internal Review',
	QUOTED = 'Quoted',
	PRICING = 'Pricing',
}

export const formBudgetChangeControl = (task: any) => {
	const obj: any = {};
	obj.title = task?.title || '--';
	obj.Description = task?.description || '--';
	// obj.Cost = task?.quotedAmount || '--';
	obj.dueDate = task?.dateOfRequest || '--';
	obj.Trade = task?.trade || '--';
	obj.RequestedDate = task?.dateOfRequest || '--';
	obj.Reason = task?.reasonForChange || '--';
	obj.Status = task?.status || '--';
	obj.budgetLineItemTitle = task?.budgetLineItemTitle || '--';
	obj.changeOrderNumber = task?.changeOrderNumber;
	let originalCostValue = '--';
	const currentStatusValue = task?.status?.toLowerCase();
	const fetchStatusValue = (value: any) => value?.toLowerCase();
	
	switch (currentStatusValue) {
	  case fetchStatusValue(TaskStatus.APPROVED):
	  case fetchStatusValue(TaskStatus.PROCESSED):
		originalCostValue = task.approvedAmount ?? '--';
		break;
	  case fetchStatusValue(TaskStatus.CANCELLED):
	  case fetchStatusValue(TaskStatus.REJECTED):
	  case fetchStatusValue(TaskStatus.NO_COST_IMPACT):
	  case fetchStatusValue(TaskStatus.PRICE_TBD):
		originalCostValue = '--';
		break;
	  case fetchStatusValue(TaskStatus.INTERNAL_REVIEW):
	  case fetchStatusValue(TaskStatus.QUOTED):
	  case fetchStatusValue(TaskStatus.PRICING):
		originalCostValue = task.estimatedAmount ?? task.quotedAmount ?? '--';
		break;
	  default:
		originalCostValue = '--';
		break;
	}
	
	obj.Cost = originalCostValue;
	
	return obj;
  };
  



export const formBudgeLineItem = (task: any) => {
	const data = [];
	const budgetLineItemTitle = {
		label: 'Title :',
		value: task.budgetLineItemTitle || '--',
	};
	const orignalCost = {
		label: 'Original Budget :',
		value: task.totalBudget || '--',
	};

	const classificationCode = {
		label: 'Classification Code :',
		value: task.classificationCode || '--',
	};

	const costType = {
		label: ' Cost Type :',
		value: task.costType || '--',
	};
	// pushing all the items inside array
	data.push(budgetLineItemTitle);
	data.push(orignalCost);
	data.push(classificationCode);
	data.push(costType);
	return data;
};
