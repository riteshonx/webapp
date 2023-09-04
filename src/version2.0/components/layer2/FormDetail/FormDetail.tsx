import React, { ReactElement, useState } from 'react';
import {
	FETCH_FORM_TEMPLATE_DETAILS,
} from '../Forms/graphql/queries/formsQueries';
import { client } from '../../../../services/graphql';

import { Popover } from '../../layer1/popover/popover';
import FormField from '../FormField/FormField';
import './FormDetail.scss';
import Notification, {
	AlertTypes,
} from '../../../../modules/shared/components/Toaster/Toaster';

export const featureFormRoles = {
	viewForm: 'viewForm',
};

export const state = {
	selectedProjectToken: sessionStorage.getItem('ProjectToken'),
};
export default function FormDetail(props: any): ReactElement {
	const [formDetails, setFormDetails] = useState<Array<any>>([]);
	const [openPopover, setOpenPopover] = useState<boolean>(false);
	// fetch form template details
	const getFormTemplateDetails = async (formId: number) => {
		try {
			const formsTemplateDetailsResponse = await client.query({
				query: FETCH_FORM_TEMPLATE_DETAILS,
				variables: {
					formId: formId,
				},
				fetchPolicy: 'network-only',
				context: {
					role: featureFormRoles.viewForm,
					token: state?.selectedProjectToken,
				},
			});
			setFormDetails(
				formsTemplateDetailsResponse.data.formDetails_query.formsData
			);
		} catch (error) {
			Notification.sendNotification(
				'Something went wrong while fetching form details',
				AlertTypes.warn
			);
			console.log('error ocurred while fetching form details');
		}
	};
	const fetchDetailForm = (id: number) => {
		setOpenPopover(true);
		getFormTemplateDetails(id);
	};

	const renderFormName = () => {
		return props?.formData.map((formItem: any) =>
			formItem.formsData.map((singleForm: any) => {
				return (
					<Popover
					position='right'
						trigger={
							<h1
								onClick={() => {
									fetchDetailForm(formItem?.id);
								}}
								className="form-title"
							>
								{singleForm.caption == 'Subject' ? singleForm.value : null}
							</h1>
						}
					>
						<div className="form-wrapper">
							{formDetails.length > 0 && (
								<FormField
									formDetails={formDetails}
									openPopover={openPopover}
									setOpenPopover={setOpenPopover}
								/>
							)}
						</div>
					</Popover>
				);
			})
		);
	};
	return (
		<>
			<div className="form-container">{renderFormName()}</div>
		</>
	);
}
