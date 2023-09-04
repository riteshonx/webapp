import { gantt } from 'dhtmlx-gantt';
import React, { useContext, useEffect } from 'react';
import { stateContext } from '../../../root/context/authentication/authContext';
import ProjectPlanContext from '../../context/projectPlan/projectPlanContext';
import LookAheadPanel from './components/LookAheadPanel/LookAheadPanel';
import './LookAheadPlan.scss';

const LookAheadPlan = (props: any) => {
  const { state: authState }: any = useContext(stateContext);
  const projectPlanContext = useContext(ProjectPlanContext);
  const { lookAheadStatus, setLookAheadStatus } = projectPlanContext;

  const toggleLookAhead = () => {
    setLookAheadStatus(!lookAheadStatus);
    if (lookAheadStatus) {
      gantt.templates.task_class = function (start, end, task) {
        const css = [''];
        if (task.type === gantt.config.types.milestone) {
          css.push('milestone_black');
        }
        if (task.parent === 0) {
          css.push('top_level_project_task');
        }
        return css.join(' ');
      };
    }
  };

  useEffect(() => {
    if (authState.selectedProjectToken) {
      setLookAheadStatus(false);
    }
  }, [authState.selectedProjectToken]);

  return (
    <div className="lookahead">
      {/* <Tooltip
        title={'Custom view for lookahead planning'}
        aria-label="Custom view for lookahead planning"
      >
        <Button
          variant="outlined"
          data-testid={`lookAheadPlan`}
          className={`${lookAheadStatus ? 'activeview' : ''} btn-secondary`}
          size="small"
          onClick={toggleLookAhead}
        >
          {' '}
          Lookahead
        </Button>
      </Tooltip> */}
      {lookAheadStatus && (
        <LookAheadPanel activeLookAheadView={props?.activeLookAheadView} />
      )}
    </div>
  );
};

export default LookAheadPlan;
