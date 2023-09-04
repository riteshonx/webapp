import React, { useState, useEffect } from 'react';
import InsightsDetailedViewListItem from '../commonDetailsInsights/InsightsDetailedViewListItem';
import buildingimage from '../../../../assets/images/buildingimage.jpg';
import './detailedmyfeeds.scss';
import { insightsDetailData } from 'src/version2.0/utils/constants/InsightsDetailedViewConstants';
import { detailedInsight } from 'src/version2.0/utils/constants/InsightsDetailedViewConstants';
import InsightsTable from 'src/version2.0/common/TableInsights/InsightsTable';

export default function DetailedMyFeeds() {
	const [detailData, setDetailData] = useState<Array<detailedInsight>>([]);
	const [openwidget,setOpenWidget] = useState <any> ({item:null, showData:false})
	useEffect(() => {
		setDetailData(insightsDetailData);
	}, []);
 const handleWidget=(item:detailedInsight)=>{
  setOpenWidget((prevWidget:any)=>{
		if(prevWidget.item==item){
			// if clicked button is already open close it
			return{...prevWidget,showData:!prevWidget.showData}
		}
		else{
			return {item:item,showData:true}
		}
	})
 }
	return (
		<div className='v2-insights-detailedfeed'>
			{detailData.map((item) => {
				return (
					<div
						key={item.id}
						className='v2-insights-detailedfeed-details'
					>
						<div className='v2-insights-detailedfeed-body'>
							<InsightsDetailedViewListItem
								heading={item.heading}
								body={item.body}
							/>
							<div className='v2-insights-detailedfeed-button'>
								<button onClick={()=>handleWidget(item)}>Analyze</button>
							</div>
							{openwidget.item === item && openwidget.showData && 
						  <div className='v2-insights-detailedfeed-table'>

							<InsightsTable/>
							</div>
							}
						</div>
						<div className='v2-insights-detailedfeed-imagebody'>
							<img
								src={buildingimage}
								alt='building'
							/>
						</div>
					</div>
				);
			})}
			
		</div>
	);
}
