import React, { useState, useEffect } from 'react';
import { ArrowIcon } from '../arrowIcon/arrowIcon';
import { ProjectNavigator } from '../projectNavigator/projectNavigator';
import './UserInsight.scss'

export const UserInsight = (): React.ReactElement => {
  const insightsDelayComponent = () => {
    return (
      <div
        className='v2-insight-item v2-insight-circle s-center s-flex-column '>
        <div className="v2-insight-cost-content s-center s-flex-column">
          <div className="v2-insight-item-heading">6 Days</div>
          <div className="v2-insight-item-title">Delay</div>
          <div className="v2-insight-item-chip">
            15%
            <ArrowIcon size={18} />
          </div>
        </div>
      </div>
    );
  };
  const dailyLogsComponent = () => {
    return (
      <div className="v2-insight-item v2-insight-circle s-center s-flex-column">
        <div className="v2-insight-item-heading">Daily Logs</div>
        <div className="v2-insight-item-chip">
          +15%
          <ArrowIcon size={18} />
        </div>
        <div className="v2-insight-item-subheading">Productivity</div>
      </div>
    );
  };
  const qcLogsComponent = () => {
    return (
      <div className="v2-insight-item v2-insight-circle s-center s-flex-column">
        <div className="v2-insight-item-heading">QC Logs</div>
        <div className="v2-insight-item-chip">
          15%
          <ArrowIcon size={18} />
        </div>
        <div className="v2-insight-item-subheading">Productivity</div>
      </div>
    );
  };

  return (
    <div className="v2-insight-container">
      <ProjectNavigator
        elementList={[
          insightsDelayComponent(),
          dailyLogsComponent(),
          qcLogsComponent(),
        ]}
      />
    </div>
  );
};
