import React from 'react';
import './insightsDetailedViewListItem.scss';

interface bodyDetails {
	heading: string;
	body: string;
}

export default function InsightsDetailedViewListItem(props: bodyDetails) {
	const { heading, body } = props;
	return (
		<div>
			<div className='v2-common-details-insights'>
				<div className='v2-common-details-insights-header'>{heading}</div>
				<div className='v2-common-details-insights-body'>{body}</div>
			</div>
		</div>
	);
}
