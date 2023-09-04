import React from 'react';
import CloseIcon from '../../../../assets/images/icons/closeIcon.svg';
import './dailylogpopover.scss';
const dailyLogTableData = [
	{
		Date: '31-Jan',
		Qty: '-',
		Hrs: '30',
		Units: '-',
		TotalQty: '-',
		TotalHrs: '30',
	},
	{
		Date: '31-Jan',
		Qty: '-',
		Hrs: '30',
		Units: '-',
		TotalQty: '-',
		TotalHrs: '30',
	},
	{
		Date: '31-Jan',
		Qty: '-',
		Hrs: '30',
		Units: '-',
		TotalQty: '-',
		TotalHrs: '30',
	},
];
export default function DailyLogPopover(props: any) {
	const { open } = props;
	const columns = Object.keys(dailyLogTableData[0]);

	return (
		<div className="v2-dailylog-popover">
			<div className="v2-dailylog-popover-header">
				<div className="v2-dailylog-popover-caption">Daily Log Information</div>
				<div className="v2-dailylog-popover-closeicon">
					<img
						src={CloseIcon}
						alt=""
						width={'22px'}
						onClick={open}
					/>
				</div>
			</div>
			<div className="v2-dailylog-popover-wrapper">
				<table className="v2-dailylog-popover-table">
					<thead className="v2-dailylog-table-head">
						<tr>
							{columns.map((column) => (
								<th key={column}>{column}</th>
							))}
						</tr>
					</thead>
					<tbody>
						{dailyLogTableData.map((data) => (
							<tr key={data.Date}>
								<td>{data.Qty}</td>
								<td>{data.Hrs}</td>
								<td>{data.Units}</td>
								<td>{data.TotalQty}</td>
								<td>{data.TotalHrs}</td>
								<td>{data.Date}</td>
							</tr>
						))}
					</tbody>
				</table>
				<div className="v2-dailylog-popover-pending">
					Pending Hours : 72 hours
				</div>
			</div>
		</div>
	);
}
