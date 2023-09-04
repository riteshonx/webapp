import { Button, Tooltip } from '@material-ui/core';
import React from 'react';
import CriticalPathIcon from '../../../../../../assets/images/cp_calculation.svg';
import './CriticalPath.scss';
const CriticalPath = (props: any) => {
  const { cpCalculation, setCpCalculation } = props;

  // useEffect(() => {
  //   if (cpCalculation && !gantt.config.readonly) {
  //     gantt.autoSchedule();
  //     calculateTotalFloat();
  //     gantt.render();
  //   }
  // }, [cpCalculation]);

  const onClickHandler = () => {
    setCpCalculation(!cpCalculation);
  };

  return (
    <div className="critical-path">
      <Tooltip
        title={'Show Critical Path'}
        aria-label="Show Critical Path"
        className={`${cpCalculation ? 'active' : ''}`}
      >
        <Button
          variant="outlined"
          data-testid={`cp calculation`}
          size="small"
          onClick={onClickHandler}
          className="btn-secondary critical-path-button"
        >
          <img src={CriticalPathIcon} alt="critical" />
        </Button>
      </Tooltip>
    </div>
  );
};

export default CriticalPath;
