import moment from 'moment';
import { ICommonFieldDetail, ICommonPopoverDetail, POPOVER_TYPES,
} from '../../models';

export const taskDataMapper = (task: any): ICommonPopoverDetail => {
  const obj = {} as ICommonPopoverDetail;
	obj.title = task.task.taskType == 'milestone' ? `${POPOVER_TYPES.MILESTONE} | ${task.task.taskName || '--'}` : `${POPOVER_TYPES.TASK} | ${task.task.taskName || '--'}`;
	obj.taskLink= task?.task?.formTaskLinks;
	obj.attachment=task.attachment;
  obj.data = [] as Array<ICommonFieldDetail>;
	
	// Task Name
	// const taskNameObject = {
	// 	label: 'Task Name',
	// 	value: task.task.taskName || '--',
	// } as ICommonFieldDetail;

	// // Task duration
	// const dateObject = {
	//   label: 'Dates',
	//   value: `${task.task.plannedStartDate} - ${task.task.plannedEndDate}`,
	// } as ICommonFieldDetail;
	// task dates
	const plannedStartDate = {
		label: 'Planned Start Date',
		// value: task.task.plannedStartDate || '--',
		value:task?.task?.plannedStartDate ? moment (task.task.plannedStartDate).format('DD MMM YYYY') : '--',
	};
	const plannedEndDate = {
		label: 'Planned End Date',
		value:task?.task?.plannedEndDate ? moment( task.task.plannedEndDate ).format('DD MMM YYYY') : '--',
	};
	const actualEnd = {
		label: 'Actual End Date',
		value: task?.task?.actualEndDate ? moment (task.task.actualEndDate).format ('DD MMM YYYY') : '--',
	};

	const actualStart = {
		label: 'Actual Start Date',
		value: task?.task?.actualStartDate ? moment (task?.task?.actualStartDate).format('DD MMM YYYY') : '--',
	};
	const estimatedStartDate = {
		label: 'Estimated Start Date',
		value: task?.task?.estimatedStartDate ? moment(task?.task?.estimatedStartDate).format('DD MMM YYYY') : '--',
	};
	const estimatedEndDate = {
		label: 'Estimated End Date',
		value: task?.task?.estimatedEndDate ? moment(task?.task?.estimatedEndDate).format('DD MMM YYYY') : '--',
	};
	// commitment cost
	const commitmentCost = {
		label: 'Commited Cost',
		value: task?.task?.commitmentCost || '--',
	};

	// payout cost
	const payoutCost = {
		label: 'Payout Cost',
		value: task?.task?.payoutCost || '--',
	};
	// Planned Quantity
	const plannedQuantity = {
		label: 'Planned Quantity',
		value: task?.task?.plannedQuantity || '--',
	} as ICommonFieldDetail;
	// Planned Labour hour
	const plannedHour = {
		label: 'Planned Hours',
		value: task?.task?.plannedLabourHour || '--',
	} as ICommonFieldDetail;
	// Task location
	const locationObject = {
		label: 'Location',
		value: '--',
	} as ICommonFieldDetail;

	// Task Float
	const floatObject = {
		label: 'Float',
		value: task?.task?.floatValue > -1 ? task?.task?.floatValue : '--',
	} as ICommonFieldDetail;

	// Task Code
	const codeObject = {
		label: 'Code',
		value: task.task?.classificationCode
			? task.task?.classificationCode?.classificationCode &&
			  task.task?.classificationCode?.classificationCodeName
				? `${task.task?.classificationCode?.classificationCode}-${task.task?.classificationCode?.classificationCodeName}`
				: task.task?.classificationCode?.classificationCode ||
				  task.task?.classificationCode?.classificationCodeName ||
				  '--'
			: '--',
	} as ICommonFieldDetail;

	// Task Description
	// const descriptionObject = {
	// 	label: 'Description',
	// 	value: task.task.description || '--',
	// } as ICommonFieldDetail;

	// Task Predecessor
	const predecessorList = (task.Preceding || []).map(
		(e: any) => e?.projectTaskBySource?.taskName
	);
	// Task Successor
	const succesorList = (task.Succeeding || []).map(
		(e: any) => e?.projectTaskBySource?.taskName
	);
	const predecessorObject = {
		label: ' Number of Predecessors',
		// value: predecessorList.length ? predecessorList.join(', ') : '--',
		value: predecessorList.length ? predecessorList.length : 0,
	} as ICommonFieldDetail;
	const sucessorObject = {
		label: ' Number of Sucessors',
		// value: predecessorList.length ? predecessorList.join(', ') : '--',
		value: succesorList.length ? succesorList.length : 0,
	} as ICommonFieldDetail;

	// Task Milestone
	const milestoneObject = {
		label: 'Milestone',
		value: '--',
	} as ICommonFieldDetail;

	// Task Progress
	const progressObject = {
		label: 'Progress',
		value: task.task.progress,
	} as ICommonFieldDetail;

	// Task Material
	const taskMaterialAssociationsList =
		task.task.projectTaskMaterialAssociations || [];
	// const materialList = taskMaterialAssociationsList
	// 	.map((e: any) => {
	// 		return e.projectMaterial.materialMaster.materialName || null;
	// 	})
	// 	.filter((e: any) => e !== null);
	const materialList = taskMaterialAssociationsList.length || 0;

	const materialObject = {
		label: 'Number of Materials',
		// value: materialList.join(', '), // TODO: need to bind with data
		value: materialList,
	} as ICommonFieldDetail;

	// Task Weather
	const weatherObject = {
		label: 'Weather',
		value: '--',
	} as ICommonFieldDetail;


	// Task Variance
	const varianceList = task.task.projectTaskVariances || [];
	const varianceObject = {
		label: 'Number of Variances',
		// 	value: varianceList
		// 		.map((e: any) => {
		// 			return e.varianceName;
		// 		})
		// 		.join(', '),
		// } as ICommonFieldDetail;
		value: varianceList.length ? varianceList.length : 0,
	} as ICommonFieldDetail;
	// Task Constraints
	const taskConstraints = {
		label: 'Number of Constraints',
		// value:
		// 	(task.task.projectTaskConstraints || [])
		// 		.map((e: any) => e.constraintName)
		// 		.join(', ') || '--',
		value: task.task.projectTaskConstraints.length || 0,
	} as ICommonFieldDetail;
	// obj.data.push(taskNameObject);
	obj.data.push(plannedStartDate);
	obj.data.push(plannedEndDate);
	obj.data.push(actualStart);
	obj.data.push(actualEnd);
	estimatedStartDate && obj.data.push(estimatedStartDate);
	estimatedEndDate && obj.data.push(estimatedEndDate);
	obj.data.push(floatObject);
	obj.data.push(commitmentCost);
	obj.data.push(payoutCost);
	obj.data.push(plannedQuantity);
	obj.data.push(plannedHour);
	obj.data.push(materialObject);
	// obj.data.push(locationObject);
	obj.data.push(codeObject);
	// obj.data.push(descriptionObject);
	obj.data.push(predecessorObject);
	obj.data.push(sucessorObject);
	// obj.data.push(milestoneObject);
	// obj.data.push(progressObject);
	obj.data.push(taskConstraints);
	obj.data.push(varianceObject);
	obj.data.push(weatherObject);
	return obj;
};
