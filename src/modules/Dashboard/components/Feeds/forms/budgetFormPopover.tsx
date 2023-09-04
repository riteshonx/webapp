import React, { useContext, useEffect, useState } from 'react';
import './budgetformpopover.scss';
import CloseIcon from 'src/assets/images/closeIcon.svg';
import {
	getBudegtChangeOrderFormById,
	getBudetLineItem,
} from '../../../api/gql';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import { NoDataAvailable } from 'src/modules/Dashboard/utils/commonFormFallback';
import { POPOVER_TYPES } from '../../../models/task';

export default function BudgetFormPopover(props: any) {
	const [taskDetails, setTaskDetails] = useState<any>('');
	const [budgetLineItem, setBudgetLineItem] = useState<any>([]);
	const [loading, setIsLoading] = useState(false);
	const [budgetLineItemLoaded, setBudgetLineItemLoaded] =
		useState<boolean>(false);
	const { onClose, formId, onDataLoad } = props;
	const { state }: any = useContext(stateContext);
	useEffect(() => {
		getChangeOrderData(formId);
	}, [formId]);
	const getChangeOrderData = async (formId: number) => {
		try {
			setIsLoading(true);
			const getBudgetFormData = await getBudegtChangeOrderFormById(
				formId,
				state.selectedProjectToken
			);
			if (
				getBudgetFormData?.budgetLineItemTitle &&
				getBudgetFormData?.budgetLineItemTitle !== '--'
			) {
				const budgetLineItemResponse = await getBudetLineItem(
					getBudgetFormData.budgetLineItemTitle,
					state?.selectedProjectToken
				);
				setBudgetLineItem(budgetLineItemResponse);
				setBudgetLineItemLoaded(true);
			}
			setTaskDetails(getBudgetFormData);
		  setIsLoading(false);
			onDataLoad && onDataLoad(true);
				
		} catch {
			setIsLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="v2-budget-form-loader ">
				<div className="skeleton-box"></div>
				<div className="skeleton-box"></div>
				<div className="skeleton-box"></div>
			</div>
		);
	}
	if (!taskDetails || (!budgetLineItemLoaded && !budgetLineItem.length)) {
		return (
			<div className="v2-budget-form-fallback">
				<img
					src={CloseIcon}
					alt=""
					width={'22px'}
					onClick={onClose}
				/>
				<NoDataAvailable />
			</div>
		);
	}

	return (
		<div className="v2-budget-form">
			<div className="v2-budget-form-header">
				<div className="v2-budget-form-header-title">{`${POPOVER_TYPES.CO} ${taskDetails.changeOrderNumber?`#${taskDetails.changeOrderNumber}` :''} `} | {taskDetails?.title}</div>
				<div className="v2-budget-form-header-close">
					<img
						src={CloseIcon}
						alt=""
						width={'22px'}
						onClick={onClose}
					/>
				</div>
			</div>
			<div className="v2-budget-form-body">
				<table className="v2-budget-form-body-table">
					<thead className="v2-budget-form-body-head">
						<tr>
							<th className="v2-budget-form-body-head-maxwidth">Description</th>
							<th>Cost</th>
							<th>Due Date</th>
							<th>Trade</th>
							<th>Requested Date</th>
							<th>Reason</th>
							<th>Status</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td className="v2-budget-form-body-head-maxwidth">
								{taskDetails.Description}
							</td>
							<td>{taskDetails.Cost}</td>
							<td>{taskDetails.dueDate}</td>
							<td>{taskDetails.Trade}</td>
							<td>{taskDetails.RequestedDate}</td>
							<td>{taskDetails.Reason}</td>
							<td>{taskDetails.Status}</td>
						</tr>
					</tbody>
				</table>
			</div>
			<div className="v2-budget-form-insights">
				<div className="v2-budget-form-insights-title">
					Linked budget line item:
				</div>
				<div className="v2-budget-form-insights-content">
					{budgetLineItem &&
						budgetLineItem.length > 0 &&
						budgetLineItem.map((item: any) => {
							return (
								<div className="v2-budget-form-insights-content-body">
									<div className="v2-budget-form-insights-content-label">
										{item.label}
									</div>
									<div className="v2-budget-form-insights-content-value">
										{item.value}
									</div>
								</div>
							);
						})}
				</div>
			</div>
		</div>
	);
}
