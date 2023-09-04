enum TaskStatus {
	APPROVED_PROCESSED = 'Approved/Processed',
	CANCELLED = 'Cancelled',
	REJECTED = 'Rejected',
	NO_COST_IMPACT = 'No cost impact',
	PRICE_TBD = 'Price TBD',
	INTERNAL_REVIEW = 'Internal review',
	QUOTED = 'quoted',
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
	let orignalCostValue = '--';
	switch (task.status) {
		case TaskStatus.APPROVED_PROCESSED:
			orignalCostValue = task.approvedAmount;
			break;
		case TaskStatus.CANCELLED:
		case TaskStatus.REJECTED:
		case TaskStatus.NO_COST_IMPACT:
		case TaskStatus.PRICE_TBD:
			orignalCostValue = '--';
			break;
		case TaskStatus.INTERNAL_REVIEW:
		case TaskStatus.QUOTED:
		case TaskStatus.PRICING:
			orignalCostValue = task.estimatedAmount || task.quotedAmount || '--';
			break;
		default:
			orignalCostValue = '--';
			break;
	}

	obj.Cost = orignalCostValue;

	return obj;
};

export const formBudgeLineItem = (task: any) => {
	const data = [];
	const budgetLineItemTitle = {
		label: 'Title :',
		value: task.budgetLineItemTitle || '--',
	};
	const orignalCost = {
		label: 'Orignal Cost :',
		value: task.originalBudgetAmount || '--',
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
