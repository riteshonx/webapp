import React from 'react';
import './IssueLogProjectDetail.scss';
import LinkIcon from '@material-ui/icons/Link';
import { IconButton } from '@material-ui/core';
import {ToolTip} from '../../../../../modules/shared/components/TooTip/ToolTip'

interface Props {
	issueLogProjectFormData: IssueLogData[];
}

interface IssueLogData {
	url: string;
	status: string;
	title: string;
	displayId: number;
	type: string;
}
export const IssueLogProjectDetail = (props: Props): React.ReactElement => {
	const renderLinkedForms = () => {
		return props.issueLogProjectFormData.map((issueFormData: any) => {
			return (
				<table>
					<thead>
						<tr className="IssueLog__body__rowheader">
							<td className="IssueLog__body__rowheader__name">
								Title
							</td>
							<td className="IssueLog__body__rowheader__item">Type</td>
							<td className="IssueLog__body__rowheader__item">Status</td>
						</tr>
					</thead>
					<tbody>
						<tr
							key={issueFormData?.displayId}
							className="IssueLog__body__row"
						>
							<td className="IssueLog__body__row__name">
								<div className="IssueLog__body__row__name__container">
									<IconButton
										className="IssueLog__body__row__name__container__btn"
										onClick={() => window.open(issueFormData?.url)}
									>
										<LinkIcon className="IssueLog__body__row__name__container__btn__icon" />
									</IconButton>
                  <ToolTip title={issueFormData?.title} lengthCount={60}/>
								</div>
							</td>
							<td className="IssueLog__body__row__item">
								{issueFormData?.type}
							</td>
							<td className="IssueLog__body__row__item">
								{issueFormData?.status}
							</td>
						</tr>
					</tbody>
				</table>
			);
		});
	};

	return <React.Fragment>{renderLinkedForms()}</React.Fragment>;
};
