import React, { useState, useEffect } from 'react';
import InsightsDetailedViewListItem from '../commonDetailsInsights/InsightsDetailedViewListItem';

export default function DetailedLessionLearned() {
  return (
    <div className="v2-insights-lesson-learned">
      <InsightsDetailedViewListItem
        heading={'Lorem ipsum dolor sit amet. Donec quam felis, ultricies nec'}
        body={'lesson learned body'}
      />
    </div>
  );
}
