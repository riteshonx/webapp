import React, { useState, useEffect } from 'react';
import { insightsDetailData } from 'src/version2.0/utils/constants/InsightsDetailedViewConstants';
import InsightsDetailedViewListItem from '../commonDetailsInsights/InsightsDetailedViewListItem';
import { detailedInsight } from 'src/version2.0/utils/constants/InsightsDetailedViewConstants';

export default function DetailedLessionLearned() {
	return (
		<div className='v2-insights-lesson-learned'>
			<InsightsDetailedViewListItem
				heading={'Lorem ipsum dolor sit amet. Donec quam felis, ultricies nec'}
				body={'lesson learned body'}
			/>
		</div>
	);
}
