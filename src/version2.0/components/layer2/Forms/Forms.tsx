import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { CircularProgress } from '@material-ui/core';

import {
	FETCH_TEMPLATE_COLUMN_CONFIG,
	FETCH_FORM_TEMPLATE_VIEW,
	LOAD_FILTERS_LIST_FORM,
} from './graphql/queries/formsQueries';
import { v4 as uuidv4 } from 'uuid';
import { client } from '../../../../services/graphql';
import { intializeFormFieldData } from '../../../utils/constants/FormHelpers';
import { FormFieldData } from './modals/form';
import FormDetail from '../FormDetail/FormDetail';
import Notification, {
	AlertTypes,
} from '../../../../modules/shared/components/Toaster/Toaster';
import './Forms.scss';

export type Order = 'asc' | 'desc';

export const featureFormRoles = {
	viewForm: 'viewForm',
};

export const state = {
	selectedProjectToken: sessionStorage.getItem('ProjectToken'),
};
export const pathmatch = {
	params: {
		featureId: 2,
	},
};
let queryId = '';
export default function Forms(): ReactElement {
	const [formData, setFormData] = useState<Array<any>>([]);
	const [limit, setLimit] = useState(10);
	const [pageNo, setPageNo] = useState(1);
	const [order, setOrder] = React.useState<Order>('desc');
	const [orderBy, setOrderBy] = React.useState<keyof any>('');
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		fetchInitialData();
	}, []);

	const fetchInitialData = async () => {
		try {
			const promiseList: any = [];
			const queryInstanceId = uuidv4();
			queryId = queryInstanceId;
			promiseList.push(
				client.query({
					query: FETCH_TEMPLATE_COLUMN_CONFIG,
					//   variables: { featureId: Number(pathMatch.params.featureId) },
					variables: { featureId: 2 },
					fetchPolicy: 'network-only',
					context: {
						role: featureFormRoles.viewForm,
						token: state?.selectedProjectToken,
						// feature: pathMatch.params.featureId,
						feature: 2,
					},
				})
			);
			promiseList.push(
				client.query({
					query: FETCH_FORM_TEMPLATE_VIEW,
					variables: {
						// featureId: Number(pathMatch.params.featureId),
						featureId: 2,
						versionId: null,
					},
					fetchPolicy: 'network-only',
					context: {
						role: featureFormRoles.viewForm,
						token: state?.selectedProjectToken,
						// feature: pathMatch.params.featureId,
						feature: 2,
					},
				})
			);
			promiseList.push(
				client.query({
					query: LOAD_FILTERS_LIST_FORM,
					variables: {
						// featureId: Number(pathMatch.params.featureId),
						featureId: 2,
						filterData: [],
						limit: limit,
						offset: limit * pageNo - limit,
						order: order,
						orderBy: orderBy,
					},
					fetchPolicy: 'network-only',
					context: {
						role: featureFormRoles.viewForm,
						token: state?.selectedProjectToken,
						// feature: pathMatch.params.featureId,
						feature: 2,
					},
				})
			);
			const responseData = await Promise.all(promiseList);
			if (responseData.length > 0) {
				getTemplateColumnConfigLists(responseData[0]);
				getFormTemplate(responseData[1]);
				getListForm(responseData[2], queryInstanceId);
			}
			setIsLoading(false);
		} catch (error) {
			console.log(error);
			Notification.sendNotification(
				'Something went wrong while fetching forms',
				AlertTypes.warn
			);
			setIsLoading(false);
		}
	};

	// fetch template column list
	const getTemplateColumnConfigLists = (TemplateColumnListResponse: any) => {
		if (TemplateColumnListResponse.data?.formTemplates.length > 0) {
			const columnConfigListData: Array<any> = [];
			TemplateColumnListResponse.data?.formTemplates[0]?.templateColumnConfigurations.forEach(
				(item: any) => {
					const newTemplate: any = {
						elementId: item.elementId,
						fixed: item.fixed,
						sequence: item.sequence,
					};
					columnConfigListData.push(newTemplate);
				}
			);
		}
		setIsLoading(false);
	};

	// fetch form template
	const getFormTemplate = (formsTemplateResponse: any) => {
		const templateAssociation =
			formsTemplateResponse?.data?.projectTemplateAssociation[0];
		const formTemplateVersions =
			templateAssociation.formTemplate.formTemplateVersions;
		if (
			formTemplateVersions[formTemplateVersions.length - 1]
				.formTemplateFieldData
		) {
			const formsData: Array<any> = [];
			formTemplateVersions[
				formTemplateVersions.length - 1
			].formTemplateFieldData.forEach((item: any) => {
				const newTemplate: FormFieldData = intializeFormFieldData(item);
				formsData.push(newTemplate);
			});
		}
	};

	// fetch formData list
	const getListForm = async (
		FormListsResponse: any,
		queryInstanceId: string
	) => {
		try {
			if (
				(queryInstanceId == queryId || !queryId) &&
				FormListsResponse.data?.listForms_query
			) {
				const projectListData: Array<any> = [];
				const data = JSON.parse(
					JSON.stringify(FormListsResponse.data?.listForms_query.data)
				);
				data.forEach((item: any) => {
					const currentStep =
						item?.workflowData?.activeSteps?.length > 0
							? item?.workflowData.activeSteps[0].stepDescription
							: '--';
					const newTemplate: any = {
						formsData: item.formsData,
						id: item.id,
						workFlow: currentStep,
						submittalId: item?.submittalId,
						formState: item.formState,
					};
					projectListData.push(newTemplate);
				});
				setFormData(projectListData);
			}
			setIsLoading(false);
		} catch (error: any) {
			console.log(error);
			setIsLoading(false);
			Notification.sendNotification(
				'Something went wrong while fetching forms',
				AlertTypes.warn
			);
		}
	};

	return (
		<div>
			{isLoading ? (
				<div>
					<CircularProgress
						className="circular-progress"
						size="16px"
						style={{ color: 'orange' }}
					/>
				</div>
			) : (
				<FormDetail formData={formData} />
			)}
		</div>
	);
}
