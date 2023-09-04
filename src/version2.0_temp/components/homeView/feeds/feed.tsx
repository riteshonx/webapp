import React, {
	ReactElement,
	useState,
  useContext,
  useEffect,
} from 'react';
import FilterIcon from '../../../assets/images/icons/filterIcon.svg';
import CloseIcon from '../../../assets/images/icons/closeIcon.svg';
import ExpandIcon from '../../../assets/images/icons/expand.svg';
import { FEED_TAB_NAME } from 'src/version2.0_temp/constant';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import { getAllInsightsForMetric } from 'src/version2.0_temp/api/gql';

import './feed.scss';
import { InsightsDetail } from '../InsightsDetail';
import PinnedItems from '../../homeView/PinnedItems/PinnedItems';
import { FeedList } from './feedList';
import { IInsight } from 'src/version2.0_temp/models/insights';
import {V2Context,setToggleInsight} from '../../../context';

export const Feeds = (props: any): ReactElement => {
  const {V2Dispatch}:any = useContext(V2Context)
  const { state }: any = useContext(stateContext);
  const [tabsView, setTabsView] = useState('FEEDS');
  const [activeTab, setActiveTab] = useState('FEEDS');
  const [loadingInsightList, setLoadingInsightList] = useState(false)
  const [insightList, setInsightList] = useState([] as Array<IInsight>)
  const [showDetailedInsightsView, setShowDetailedInsightsView] =
    useState(false);
  const { metricType } = props;
	const toggleView = (viewtype: string) => {
		setTabsView(viewtype);
		setActiveTab(viewtype);
	};

  useEffect(() => {
    loadAllInsightsForMetric()
  }, [metricType])

  const loadAllInsightsForMetric = async () => {
    const res = await getAllInsightsForMetric(metricType, state.selectedProjectToken)
    setInsightList(res as Array<IInsight>)
  }

  return (
    <>
      <div className="v2-feed-panel">
        <div className="v2-feed-wrapper">
          <div className="v2-feed-wrapper-tabs s-v-center">
            <div className="s-v-center">
              <div
                className="v2-feed-wrapper-tabs-tab"
                onClick={() => toggleView(FEED_TAB_NAME.INSIGHTS)}
              >
                Insights
              </div>
              <div
                className="v2-feed-wrapper-tabs-tab"
                onClick={() => toggleView(FEED_TAB_NAME.FAVOURITES)}
              >
                Favourites
              </div>
            </div>
            <div className="s-v-center">
              <img src={FilterIcon} alt="" width={'18px'} />
              <img src={CloseIcon} alt="" width={'22px'} onClick={()=>{V2Dispatch(setToggleInsight(false))}} />
            </div>
          </div>
          <div className="v2-feed-container">
            <FeedList insightList={insightList} />
          </div>
        </div>
        <div className="v2-feed-expand">
          <img
            src={ExpandIcon}
            onClick={() => setShowDetailedInsightsView(true)}
          />
        </div>
      </div>
      {showDetailedInsightsView && (
        <div className="v2-insights-modal">
          <div className="v2-insights-modal-content">
            <InsightsDetail
              goBack={() => setShowDetailedInsightsView(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};
