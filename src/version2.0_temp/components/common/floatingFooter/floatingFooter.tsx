import React, { useState,useContext } from 'react';
import './floatingFooter.scss';
import FloatingIcon from '../../../assets/images/blur_on.png';
import InsightIcon from '../../../assets/images/insight-icon.svg';
import { TimelineBar } from '../timeline/timelineBar';
import {V2Context,setToggleInsight} from  '../../../context';


export const FloatingFooter = (): React.ReactElement => {
  const {V2State , V2Dispatch}:any = useContext(V2Context);
  const [showFooterItems, setShowFooterItems] = useState<boolean>(true);

  const handleInsightIconClick = ()=>{
    V2Dispatch(setToggleInsight(!V2State.togggleFeeds))
  }

  return (
    <div className="floating-footer">
      <div
        className={`floating-footer-container ${
          showFooterItems
            ? 'floating-footer-container-show'
            : 'floating-footer-container-hide'
        }`}
      >
        <img
        className="floating-footer-feed-btn"
        src={InsightIcon}
        onClick={handleInsightIconClick}
      />
        <div className="floating-footer-container-timeline">
          <TimelineBar start={1000} end={3000} deadline={2800} value={2000} />
        </div>
      </div>
      <img src={FloatingIcon} onClick={() => setShowFooterItems(!showFooterItems)} />
    </div>
  );
};
