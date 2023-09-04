import React from 'react';
import './skeleton.scss';

export const Skeleton = (): React.ReactElement => {
	return (
		<React.Fragment>
			<div className="v2-common-skeleton-loader ">
				<div className="skeleton-box"></div>
				<div className="skeleton-box"></div>
				<div className="skeleton-box"></div>
			</div>
		</React.Fragment>
	);
};
