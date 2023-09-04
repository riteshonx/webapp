import React, { useState, useEffect } from 'react';
import InsightsDetailedViewListItem from '../commonDetailsInsights/InsightsDetailedViewListItem';
import buildingimage from '../../../../assets/images/buildingimage.jpg';
import './detailedmyfeeds.scss';
import { insightsDetailData, detailedInsight } from '../../../../constant';

export default function DetailedMyFeeds() {
  const [detailData, setDetailData] = useState<Array<detailedInsight>>([]);
  useEffect(() => {
    setDetailData(insightsDetailData);
  }, []);
  return (
    <div className="v2-insights-detailedfeed">
      {detailData.map((item) => {
        return (
          <div key={item.id} className="v2-insights-detailedfeed-details">
            <div className="v2-insights-detailedfeed-body">
              <InsightsDetailedViewListItem
                heading={item.heading}
                body={item.body}
              />
              <div className="v2-insights-detailedfeed-button">
                <button>Analyze</button>
              </div>
            </div>
            <div className="v2-insights-detailedfeed-imagebody">
              <img src={buildingimage} alt="building" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
