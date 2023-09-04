import React, { useState, useEffect } from 'react';
import { ArrowIcon } from './arrowIcon/arrowIcon';
import { LandingPageMenu } from './menu/LandingPageMenu';
import { ProjectMetrics } from './projectMetrics/projectMetric';
import { ProjectNavigator } from './projectNavigator/projectNavigator';

export const ProjectInfo = (): React.ReactElement => {
  const [openCost, setOpenCost] = useState(false);
  const [openProjectMetrics, setOpenProjectMetrics] = useState(false);

  useEffect(() => {
    setTimeout(() => setOpenCost(true), 100);
  }, []);
  const ProjectCostComponent = () => {
    return (
      <div
        onClick={() => {
          setOpenCost(!openCost);
          setOpenProjectMetrics(openCost);
        }}
        className={
          'v2-project-item v2-project-circle v2-project-cost s-center s-flex-column ' +
          (openCost ? 'open' : 'close')
        }
      >
        <div className="v2-project-cost-content s-center s-flex-column">
          <div className="v2-project-item-price">$15.6M</div>
          <div className="v2-project-item-title">Cost</div>
          <div className="v2-project-item-chip">
            15%
            <ArrowIcon size={18} />
          </div>
        </div>
        <div className="v2-project-cost-rfi v2-project-circle s-center s-flex-column">
          <div>2</div> <div>RFI's</div>
        </div>
        <div className="v2-project-cost-delay v2-project-circle s-center s-flex-column">
          <div>+6</div> <div>Days Delay</div>
        </div>
      </div>
    );
  };
  const ScheduleComponent = () => {
    return (
      <div className="v2-project-item v2-project-circle s-center s-flex-column">
        <div className="v2-project-item-title">Schedule</div>
      </div>
    );
  };
  const AssistComponent = () => {
    return (
      <div className="v2-project-item v2-project-circle s-center s-flex-column">
        <div className="v2-project-item-title">Assist</div>
      </div>
    );
  };

  return (
    <div className="v2-project-container">
      <div className="v2-project-homepage-menu">
        <LandingPageMenu />
      </div>
      <ProjectNavigator
        elementList={[
          ProjectCostComponent(),
          ScheduleComponent(),
          AssistComponent(),
        ]}
      />
      <div
        className={
          'v2-project-cost-metrics s-drawer s-drawer-right ' +
          (openProjectMetrics ? 'open' : 'close')
        }
      >
        <ProjectMetrics />
      </div>
    </div>
  );
};
