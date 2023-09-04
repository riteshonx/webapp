import React, { ReactElement, useState, useEffect } from 'react';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import moment from 'moment';
import {FormData} from '../../../utils/constants/FormFieldConstant'
import './FormField.scss';


export default function FormField(props: any): ReactElement {
	const [singleForm, setSingleForm] = useState([]);
	const [formData, setFormData] = useState<FormData>({
		constraint: '',
		createdByLabel: '',
		createdByValue: '',
		createdOnLabel: '',
		createdOnValue: '',
		subjectLabel: '',
		subjectValue: '',
		statusLabel: '',
		statusValue: '',
		rfiTypeLabel: '',
		rfiTypeValue: '',
		questionLabel: '',
		questionValue: '',
		attachmentLabel: '',
		attachmentValue: '',
		responsibleContractorLabel: '',
		responsibleContractorValue: '',
		scheduleImpactLabel: '',
		scheduleImpactValue: '',
		costImpactLabel: '',
		costImpactValue: '',
	});

	useEffect(() => {
		setSingleForm(props.formDetails);
	}, [props.singleForm]);

	useEffect(() => {
		singleForm.map(
			(formFieldInfo: any, index: number) => (
				formFieldInfo.caption == 'Subject' &&
					setFormData((prevState: any) => ({
						...prevState,
						constraint: formFieldInfo.value,
					})),
				formFieldInfo.caption == 'Created by' &&
					setFormData((prevState: any) => ({
						...prevState,
						createdByLabel: formFieldInfo.caption,
						createdByValue:
							formFieldInfo.value[0].firstName +
							formFieldInfo.value[0].lastName,
					})),
				formFieldInfo.caption == 'Created On' &&
					setFormData((prevState: any) => ({
						...prevState,
						createdOnLabel: formFieldInfo.caption,
						createdOnValue: moment(formFieldInfo.value).format('DD-MM-YYYYY'),
					})),
				formFieldInfo.caption == 'Status' &&
					setFormData((prevState: any) => ({
						...prevState,
						statusLabel: formFieldInfo.caption,
						statusValue: formFieldInfo.value,
					})),
				formFieldInfo.caption == 'Subject' &&
					setFormData((prevState: any) => ({
						...prevState,
						subjectLabel: formFieldInfo.caption,
						subjectValue: formFieldInfo.value,
					})),
				formFieldInfo.caption == 'RFI Type' &&
					setFormData((prevState: any) => ({
						...prevState,
						rfiTypeLabel: formFieldInfo.caption,
						rfiTypeValue: formFieldInfo.value[0].configValue[0],
					})),
				formFieldInfo.caption == 'RFI Type' &&
					setFormData((prevState: any) => ({
						...prevState,
						rfiTypeLabel: formFieldInfo.caption,
						rfiTypeValue: formFieldInfo.value[0].configValue[0],
					})),
				formFieldInfo.caption == 'Question' &&
					setFormData((prevState: any) => ({
						...prevState,
						questionLabel: formFieldInfo.caption,
						questionValue: formFieldInfo.value,
					})),
				formFieldInfo.caption == 'Attachment' &&
					setFormData((prevState: any) => ({
						...prevState,
						attachmentLabel: formFieldInfo.caption,
						attachmentValue: formFieldInfo.value.length + '+' + 'Attachment',
					})),
				formFieldInfo.caption == 'Responsible contractor' &&
					setFormData((prevState: any) => ({
						...prevState,
						responsibleContractorLabel: formFieldInfo.caption,
						responsibleContractorValue: formFieldInfo.value[0].name,
					})),
				formFieldInfo.caption == 'Schedule Impact' &&
					setFormData((prevState: any) => ({
						...prevState,
						scheduleImpactLabel: formFieldInfo.caption,
						scheduleImpactValue: formFieldInfo.value,
					})),
				formFieldInfo.caption == 'Cost Impact' &&
					setFormData((prevState: any) => ({
						...prevState,
						costImpactLabel: formFieldInfo.caption,
						costImpactLabelValue: formFieldInfo.value,
					}))
			)
		);
	}, [singleForm]);

	return (
		<>
			{props.openPopover && (
				<div className="form-data">
					<div className="form-header">
						<p className="header-title">Change Header</p>
						<div className="header-icon">
							<CancelOutlinedIcon
								className="cross-icon"
								fontSize="large"
								onClick={() => {
									props.setOpenPopover(false);
								}}
							/>
						</div>
					</div>
					<div className="form-fields-container">
						<div className="formFieldInfo">
							<>
								<p className="constraint"> {formData.subjectValue}</p>

								<p className="created-by">
									{formData.createdByLabel} :{formData?.createdByValue}
								</p>

								<p className="created-on">
									{formData.createdOnLabel} :{formData.createdOnValue}
								</p>

								<p className="status">
									{formData.statusLabel} :{formData.statusValue}
								</p>

								<div className="subjects sub-field-item">
									<p className="subject-label label">
										{formData.subjectLabel}*
									</p>
									<p className="subject-value value">{formData.subjectValue}</p>
								</div>

								<div className="rfi-types sub-field-item">
									<p className="rfiType-label label">{formData.rfiTypeLabel}</p>
									<p className="rfiType-value value">{formData.rfiTypeValue}</p>
								</div>

								<div className="questions sub-field-item">
									<p className="questions-label label">
										{formData.questionLabel}*
									</p>
									<p className="questions-value value">
										{formData.questionValue}
									</p>
								</div>

								<div className="attachments sub-field-item">
									<p className="attachments-label label">
										{formData.attachmentLabel}
									</p>
									<p className="attachments-value value">
										{formData.attachmentValue}
									</p>
								</div>

								<div className="responsible-contractor sub-field-item">
									<p className="responsibleContractor-label label">
										{formData.responsibleContractorLabel}
									</p>
									<p className="responsibleContractor-value value">
										{formData.responsibleContractorValue}
									</p>
								</div>

								<div className="schedule-impact sub-field-item">
									<p className="scheduleImpact-label label">
										{formData.scheduleImpactLabel}
									</p>
									<p className="scheduleImpact-value value">
										{formData.scheduleImpactValue}
									</p>
								</div>

								<div className="cost-impact sub-field-item">
									<p className="costImpact-label label">
										{formData.costImpactLabel}
									</p>
									<p className="costImpact-value value">
										{formData.costImpactValue}
									</p>
								</div>
							</>
						</div>
						<hr className="link-top-border" />
						<div>
							<div className="link-header">Link:</div>
							<div className="links-container-wrapper">
								<div className="links-container-item-row-1">
									<div className="link-item">
										<AttachFileOutlinedIcon className="pin-icon" />
										<p className="link-item-info">Task-new-Activity</p>
									</div>
									<div className="link-item">
										<AttachFileOutlinedIcon className="pin-icon" />
										<p className="link-item-info">Task-new-Activity</p>
									</div>
									<div className="link-item">
										<AttachFileOutlinedIcon className="pin-icon" />
										<p className="link-item-info">Task-new-Activity</p>
									</div>
								</div>

								<div className="links-container-item-row-2">
									<div className="link-item">
										<AttachFileOutlinedIcon className="pin-icon" />
										<p className="link-item-info">Task-new-Activity</p>
									</div>
									<div className="link-item">
										<AttachFileOutlinedIcon className="pin-icon" />
										<p className="link-item-info">Task-new-Activity</p>
									</div>
									<div className="link-item">
										<AttachFileOutlinedIcon className="pin-icon" />
										<p className="link-item-info">Task-new-Activity</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
