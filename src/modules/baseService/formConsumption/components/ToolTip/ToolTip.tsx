import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import './ToolTip.scss';

interface ToolTipProps {
	objectTypeData: any;
}

export const ToolTip = (props: ToolTipProps): React.ReactElement => {
	// function replacer(key:any, value:any) {
	//     // Filtering out properties
	//     if (value === "projectLocationTree") {
	//       return undefined;
	//     }
	//     return value;
	//   }
	function renderTooltipData(node: any) {
		//return <pre>{JSON.stringify(node, null, 2)}</pre>;
		if (Array.isArray(props?.objectTypeData?.value)) {
			return props?.objectTypeData?.value.map((item: any, index: any) => (
				<pre key={index}>{JSON.stringify(item, null, 2)}</pre>
			));
		} else {
			return <pre>{JSON.stringify(props?.objectTypeData?.value, null, 2)}</pre>;
		}
	}

	const renderToolTipContent = () => {
		if (Array.isArray(props?.objectTypeData?.value)) {
			return props?.objectTypeData?.value.map((item: any, index: any) => (
				<div
					className="tooltip__wrapper__content__item"
					key={index}
				>
					{JSON.stringify(item).length > 30
						? JSON.stringify(item).slice(0, 30) + '...}'
						: JSON.stringify(item)}
				</div>
			));
		} else {
			return (
				<div className="tooltip__wrapper__content__item">
					{JSON.stringify(props?.objectTypeData?.value).length > 30
						? JSON.stringify(props?.objectTypeData?.value).slice(0, 30) + '...}'
						: JSON.stringify(props?.objectTypeData?.value)}
				</div>
			);
		}
	};
	return (
		<React.Fragment>
			<div className="tooltip">
				<Tooltip
					className="tooltip__wrapper"
					placement="bottom"
					title={
						<div className="tooltip__wrapper__data">
							{renderTooltipData(props?.objectTypeData)}
						</div>
					}
				>
					<div className={'tooltip__wrapper__content'}>
						{renderToolTipContent()}
					</div>
				</Tooltip>
			</div>
		</React.Fragment>
	);
};
