import React, { useState,useContext } from 'react';
import './insightsDetail.scss';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import CloseIcon from '@mui/icons-material/Close';
import DetailedMyFeeds from './detailedMyFeeds/DetailedMyFeeds';
import DetailedLessionLearned from './detailedLessonLearned/DetailedLessionLearned';
import { DETAILEDVIEW_INSIGHTSTAB } from 'src/version2.0/utils/constants/InsightsDetailedViewConstants';
import {V2Context,setToggleInsight} from '../../../context';

type HandleSectionClickFunction = (section: string) => void;

export const InsightsDetail = (props: any): React.ReactElement => {
  const {V2Dispatch}:any = useContext(V2Context)
  const [activeSection, setActiveSection] = useState('MYFEEDS');
  const { goBack } = props;

  const handleCloseIconClick = ()=>{
    V2Dispatch(setToggleInsight(false));
    goBack();
  }

  const handleSectionClick: HandleSectionClickFunction = (section) => {
    setActiveSection(section);
  };
  const getActiveSectionData = () => {
    switch (activeSection) {
      case DETAILEDVIEW_INSIGHTSTAB.PINNED:
        return <DetailedMyFeeds />;
      case DETAILEDVIEW_INSIGHTSTAB.LESSONS:
        return <DetailedLessionLearned />;
      case DETAILEDVIEW_INSIGHTSTAB.SCHEDULEDINSIGHTS:
        return <p>schedule insights data</p>;
      case DETAILEDVIEW_INSIGHTSTAB.SCHEDULEDSTANDARD:
        return <p>SCHEDULEDSTAND in the content</p>;
      default:
        return <DetailedMyFeeds />;
    }
  };
  return (
    <>
      <div className="v2-insights-header">
        <div className="v2-insights-header-content">
          <div className="v2-insights-header-content-left">
            <div
              className={`v2-insights-header-section ${
                activeSection === DETAILEDVIEW_INSIGHTSTAB.MYFEEDS
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                handleSectionClick(DETAILEDVIEW_INSIGHTSTAB.MYFEEDS)
              }
            >
              Insights
            </div>
            <div
              className={`v2-insights-header-section ${
                activeSection === DETAILEDVIEW_INSIGHTSTAB.PINNED
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                handleSectionClick(DETAILEDVIEW_INSIGHTSTAB.PINNED)
              }
            >
              Pinned
            </div>
          </div>
          <div className="v2-insights-header-content-right">
            <div
              className={`v2-insights-header-section ${
                activeSection === DETAILEDVIEW_INSIGHTSTAB.LESSONS
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                handleSectionClick(DETAILEDVIEW_INSIGHTSTAB.LESSONS)
              }
            >
              Lessons
            </div>
            <div
              className={`v2-insights-header-section ${
                activeSection === DETAILEDVIEW_INSIGHTSTAB.SCHEDULEDINSIGHTS
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                handleSectionClick(DETAILEDVIEW_INSIGHTSTAB.SCHEDULEDINSIGHTS)
              }
            >
              sheduled Insights
            </div>
            <div
              className={`v2-insights-header-section ${
                activeSection === DETAILEDVIEW_INSIGHTSTAB.SCHEDULEDSTANDARD
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                handleSectionClick(DETAILEDVIEW_INSIGHTSTAB.SCHEDULEDSTANDARD)
              }
            >
              Scheduling Standereds
            </div>
            <div className="v2-insights-header-icons-wrapper">
              <KeyboardBackspaceIcon
                className="v2-insights-header-icons-wrapper-icon"
                onClick={goBack}
              />
              <CloseIcon
                className="v2-insights-header-icons-wrapper-icon"
                onClick={handleCloseIconClick}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="v2-insights-header-render-data">
        {getActiveSectionData()}
      </div>
    </>
  );
}
