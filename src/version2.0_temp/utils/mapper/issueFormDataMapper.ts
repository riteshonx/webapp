import {
	ICommonFieldDetail,
	ICommonPopoverDetail,
} from 'src/version2.0_temp/models/task';
import moment from 'moment';

export const issueFormDataMapper = (
	issueFormInfo: any
): ICommonPopoverDetail => {
	const obj = {} as ICommonPopoverDetail;
	obj.title = issueFormInfo?.formName || '--';
	obj.data = [] as Array<ICommonFieldDetail>;

	const rootCause = {
		label: 'Root Cause',
		value: '--',
	} as ICommonFieldDetail;

	//form status
	const formStatus = {
		label: 'Status',
		value: '--',
	} as ICommonFieldDetail;

	//due date
	const dueDate = {
		label: 'Due Date',
		value: '--',
	} as ICommonFieldDetail;

	const formTitle = {
		label: 'Title',
		value: '--',
	} as ICommonFieldDetail;

	const issueType = {
		label: 'Issue Type',
		value: '--',
	} as ICommonFieldDetail;

	const assigneeType = {
		label: 'Assignee Type',
		value: '--',
	} as ICommonFieldDetail;

	const resolution = {
		label: 'Resolution',
		value: '--',
	} as ICommonFieldDetail;

	const description = {
		label: 'Description',
		value: '--',
	} as ICommonFieldDetail;

	const dateClosed = {
		label: 'Date Closed',
		value: '--',
	} as ICommonFieldDetail;

	const assignedTo = {
		label: 'Assigned To',
		value: '--',
	} as ICommonFieldDetail;

	const createdBy = {
		label: 'Created By',
		value: '--',
	} as ICommonFieldDetail;
	const link = {
		label: 'Link',
		value: '--',
	} as ICommonFieldDetail;

	const attachment = {
		label: 'Attachment',
		value: '--',
	} as ICommonFieldDetail;

	issueFormInfo.forms.forEach((formField: any) => {
		obj.id = formField?.featureId || '--';
		obj.state = formField?.formState || '--';

		formStatus.value = formField?.formStatus?.status || '--';
		dueDate.value = moment(formField?.dueDate).format('DD MMM YYYY') || '--';

		formField.formsData.forEach((formData: any) => {
			//checking for form title
			if (formData.caption == 'Subject') {
				obj.title = formData?.valueString || '--';

				formTitle.value = formData?.valueString || '--';
			}

			if (formData.caption == 'Issue Type') {
				issueType.value = formData?.valueString || '--';
			}

			if (formData.caption == 'Root Cause') {
				rootCause.value = formData?.valueString || '--';
			}

			if (formData.caption == 'Assignee Type') {
				assigneeType.value = formData?.valueString || '--';
			}

			if (formData.caption == 'Resolution') {
				resolution.value = formData?.valueString || '--';
			}
			if (formData.caption == 'Description') {
				description.value = formData?.valueString || '--';
			}
			if (formData.caption == 'Date Closed') {
				dateClosed.value = formData?.valueDate || '--';
			}
			if (formData.caption == 'Assigned To') {
				assignedTo.value = formData?.valueString || '--';
			}
			if (formData.caption == 'Creator') {
				createdBy.value = formData?.valueString || '--';
			}
		});
	});

	const mappedAttachment =
		issueFormInfo.formsAttachmentList
			.map((attachmentList: any) => attachmentList.attachment.fileName)
			.join(', ') || '--';
	attachment.value = mappedAttachment;
	const mappedTaskLink =
		issueFormInfo.formTaskLinks
			.map((taskLink: any) => taskLink.projectTask.taskName)
			.join(', Task-') || '--';
	link.value = `Task- ${mappedTaskLink}`;

	obj.data.push(formStatus);
	obj.data.push(dueDate);
	obj.data.push(issueType);
	obj.data.push(rootCause);
	obj.data.push(dateClosed);
	obj.data.push(assigneeType);
	obj.data.push(assignedTo);
	obj.data.push(resolution);
	obj.data.push(description);
	obj.data.push(formTitle);
	obj.data.push(createdBy);
	obj.data.push(link);
	obj.data.push(attachment);
	return obj;
};