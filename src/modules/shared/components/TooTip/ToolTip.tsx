import React from 'react';
import Tooltip from '@mui/material/Tooltip';

interface ToolTipProps {
	title: string;
	lengthCount?: number;
	className?: stirng;
}

export const ToolTip = (props: ToolTipProps): React.ReactElement => {
	return (
		<React.Fragment>
			<Tooltip
				placement="top"
				title={props?.title}
			>
				<p className={props?.className}>
					{props?.title.length > props?.lengthCount
						? props?.lengthCount
						: 40
						? props?.title.slice(
								0,
								props?.lengthCount ? props?.lengthCount : 40
						  ) + '...'
						: props?.title}
				</p>
			</Tooltip>
		</React.Fragment>
	);
};
