import React, { useState, useContext,useEffect } from 'react';
import { ProjectNavigator } from '../../components/common';
import * as HomeViewComponents from '../../components/homeView';
import {V2Context,setToggleInsight} from '../../context';
import './HomeView.scss';

export const HomeView = (): React.ReactElement => {
  const {V2State , V2Dispatch}:any = useContext(V2Context)
  const [openFeed, setOpenFeed] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('Productivity');
  const [navigatorRotate, setNavigatorRotate] = useState(0);
  const clickOnProductivityOption = () => {
    setNavigatorRotate(0);
    setSelectedMetric('Productivity');
  };
  const clickOnScheduleOption = () => {
    setNavigatorRotate(120);
    V2Dispatch(setToggleInsight(true))
    setSelectedMetric('Scheduler');
    setOpenFeed(!openFeed);
  };
  const clickOnBudgetOption = () => {
    setNavigatorRotate(-120);
    setSelectedMetric('Budget');
  };
  return (
    <div className="v2-project s-center">
      <ProjectNavigator
        rotate={navigatorRotate}
        elementList={[
          <HomeViewComponents.ProductivityOption
            onClick={clickOnProductivityOption}
          />,
          <HomeViewComponents.ScheduleOption onClick={clickOnScheduleOption} />,
          <HomeViewComponents.BudgetOption onClick={clickOnBudgetOption} />,
        ]}
      />
      {/* ALL FLOATING COMPONENT */}
      {V2State.togggleFeeds ? (
        <>
          <HomeViewComponents.Feeds
            metricType={selectedMetric}
          />
        </>
      ) : (
        <></>
      )}
    </div>
  );
};
