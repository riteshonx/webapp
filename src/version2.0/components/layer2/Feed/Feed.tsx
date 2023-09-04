import React, {
	ReactElement,
	useContext,
	useEffect,
	useState,
	useReducer,
} from 'react';
import InsightIcon from '../../../assets/images/insight-icon.svg';
import FilterIcon from '../../../assets/images/icons/filterIcon.svg';
import CloseIcon from '../../../assets/images/icons/closeIcon.svg';

import { FeedContext } from "../../../context/FeedContext/FeedContext";
import {
	FeedReducer,
	FeedInitialState,
} from '../../../context/FeedContext/FeedReducer';
import { INSIGHTS_TAB } from '../../../utils/constants/InsightsTabsConstatnt';
import Insights from '../Insights/Insights';
import MyFeeds from '../../layer2/MyFeeds/MyFeeds';
import PinnedItems from '../../layer2/PinnedItems/PinnedItems';
import { Popover } from '../../layer1/popover/popover';
import LaunchIcon from '@mui/icons-material/Launch';
import InsightsDetailedView from '../InsightsDetailedView/InsightsDetailedView';
import './Feed.scss';

export default function Feed(): ReactElement {
	const [FeedState, FeedDispatch] = useReducer(FeedReducer, FeedInitialState);
	const [showPopup, setShowPopup] = useState<boolean>(false);
	const [tabsView, setTabsView] = useState(INSIGHTS_TAB.INSIGHTS);
	const [activeTab, setActiveTab] = useState(INSIGHTS_TAB.INSIGHTS);
	const [showDetailedInsightsView, setShowDetailedInsightsView] =
		useState(false);

	const toggleView = (viewtype: string) => {
		setTabsView(viewtype);
		setActiveTab(viewtype);
	};

	const renderTab = () => {
		switch (tabsView) {
			case INSIGHTS_TAB.PINNED_ITEMS:
				return <PinnedItems />;
			default:
				return <Insights />;
		}
	};

	const handleClick = () => {
		setShowDetailedInsightsView(true);
	};

	return (
		<>
			<FeedContext.Provider value={{ FeedState, FeedDispatch }}>
				<div className="v2-info-container">
					{showPopup && (
						<div
							className="wrapper"
							onClick={handleClick}
						>
							<LaunchIcon className="icon" />
						</div>
					)}
					{showPopup && (
						<div className="v2-content-wrapper">
							<div className="v2-content-wrapper-tabs s-v-center">
								<div className="s-v-center">
								<div
									className={
										activeTab == INSIGHTS_TAB.INSIGHTS
											? 'v2-content-wrapper-tabs-tab-active'
											: 'v2-content-wrapper-tabs-tab'
									}
									onClick={() => toggleView('INSIGHTS')}
								>
									Insights
								</div>
								<div
									className={
										activeTab == INSIGHTS_TAB.PINNED_ITEMS
											? 'v2-content-wrapper-tabs-tab-active'
											: 'v2-content-wrapper-tabs-tab'
									}
									onClick={() => {
										toggleView(INSIGHTS_TAB.PINNED_ITEMS);
									}}
								>
									Favourites
								</div>
								</div>
								<div className="s-v-center">
									<img
										src={FilterIcon}
										alt=""
										width={'18px'}
									/>
									<img
										src={CloseIcon}
										alt=""
										width={'22px'}
										onClick={() => setShowPopup(false)}
									/>
								</div>
							</div>
							<div className="content-wrapper-tab-content">{renderTab()}</div>
						</div>
					)}
					<img
						src={InsightIcon}
						onClick={() => setShowPopup(!showPopup)}
					/>
				</div>
			</FeedContext.Provider>
			{showDetailedInsightsView && (
				<div className="insights-modal">
					<div className="insights-modal-content">
						<InsightsDetailedView
							goBack={() => setShowDetailedInsightsView(false)}
							clearAll={() => setShowPopup(false)}
						/>
					</div>
				</div>
			)}
		</>
	);
}
