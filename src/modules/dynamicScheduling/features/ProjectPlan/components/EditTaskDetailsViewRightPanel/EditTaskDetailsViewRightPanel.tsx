import { Button } from '@material-ui/core';
import React, { useContext } from 'react';
import ProjectPlanContext from 'src/modules/dynamicScheduling/context/projectPlan/projectPlanContext';
import TaskDataActive from '../../../../../../assets/images/add_chart_active.svg';
import blockActive from '../../../../../../assets/images/block_active.svg';
import TaskConstraints from '../../../../../../assets/images/task_constraints.svg';
import TaskData from '../../../../../../assets/images/task_data.svg';
import TaskResources from '../../../../../../assets/images/task_resources.svg';
import TaskResourcesActive from '../../../../../../assets/images/task_resources_active.svg';
import TaskVariances from '../../../../../../assets/images/task_variances.svg';
import UCircleLayerActive from '../../../../../../assets/images/u_circle-layer_active.svg';
import WindowCheck from '../../../../../../assets/images/window_check.svg';
import WindowCheckActive from '../../../../../../assets/images/window_check_active.svg';
import WeatherCheck from '../../../../../../assets/images/weather_check.svg';
import WeatherCheckActive from '../../../../../../assets/images/weather_check_active.svg';
import task_productivity from '../../../../../../assets/images/task_productivity.svg';
import task_productivity_inactive from '../../../../../../assets/images/task_productivity_inactive.svg';
import EditProjectPlanLinksState from '../../../../context/editProjectPlanLinks/editProjectPlanLinksState';
import EditTaskDetailsViewConstraints from '../EditTaskDetailsViewConstraints/EditTaskDetailsViewConstraints';
import EditTaskDetailsViewData from '../EditTaskDetailsViewData/EditTaskDetailsViewData';
import EditTaskDetailsViewRelatedTask from '../EditTaskDetailsViewRelatedTask/EditTaskDetailsViewRelatedTask';
import EditTaskDetailsViewResources from '../EditTaskDetailsViewResources/EditTaskDetailsViewResources';
import EditTaskDetailsViewVariances from '../EditTaskDetailsViewVariances/EditTaskDetailsViewVariances';
import EditWeatherOnActivity from '../EditWeatherOnActivity/EditWeatherOnActivity';
import EditTaskDetailsViewProductivity from '../EditTaskDetailsViewProductivity/EditTaskDetailsViewProductivity';
import { styled } from '@mui/material/styles';
import { Tooltip, TooltipProps } from "@material-ui/core";
import { tooltipClasses } from "@mui/material";
import './EditTaskDetailsViewRightPanel.scss';

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 450,
    fontSize: '12px',
  }
}));

export default function TaskAttributes(props: any) {
  const { editMode, setEditMode, constraintCount, varianceCount } = props;
  const onTabChange = (selectedOption: string) => {
    if (!editMode) return;
    setActiveTab(selectedOption);
  };

  const [activeTab, setActiveTab] = React.useState<string>('productivity');
  const projectPlanContext = useContext(ProjectPlanContext)
  const { currentTask } = projectPlanContext;

  /*********************************** Links Start ************************************************/

  /*********************************** Links End ************************************************/

  /*********************************** Attachments Start ************************************************/

  /*********************************** Attachments End ************************************************/
  return (
    <React.Fragment>
      <div className="task__attributes__tab">
      <button
          className={`task__attributes__tab-links ${activeTab == 'productivity'
              ? 'task__attributes__tab-links-active-border'
              : ''
            }`}
          onClick={() => {
            onTabChange('productivity');
          }}
        >
          {activeTab == 'productivity' ? (
            <img
              src={task_productivity}
              className="task__attributes__tab-links__icon"
              alt="task-icons"
            />
          ) : (
            <img
              src={task_productivity_inactive}
              className="task__attributes__tab-links__icon"
              alt="task-icons"
            />
          )}
          <span
            className={`${activeTab == 'productivity'
                ? ' task__attributes__tab-links-active '
                : 'task__attributes__tab-links__name'
              }`}
          >
            Productivity
          </span>
        </button>
        <button
          className={`task__attributes__tab-links ${activeTab == 'resources'
              ? 'task__attributes__tab-links-active-border'
              : ''
            }`}
          onClick={() => {
            onTabChange('resources');
          }}
        >
          {activeTab == 'resources' ? (
            <img
              src={TaskResourcesActive}
              className="task__attributes__tab-links__icon"
              alt="task-icons"
            />
          ) : (
            <img
              src={TaskResources}
              className="task__attributes__tab-links__icon"
              alt="task-icons"
            />
          )}
          <span
            className={`${activeTab == 'resources'
                ? ' task__attributes__tab-links-active '
                : 'task__attributes__tab-links__name'
              }`}
          >
            Resources
          </span>
        </button>
        <HtmlTooltip
          placement="bottom"
          arrow
          title={
            <React.Fragment>
              Add and track all the constraints which can delay the start of your activity.
            </React.Fragment>
          }
        >
          <button
            className={`task__attributes__tab-links ${activeTab == 'constraints'
              ? 'task__attributes__tab-links-active-border'
              : ''
              }`}
            onClick={() => {
              onTabChange('constraints');
            }}
          >
            {activeTab == 'constraints' ? (
              <img
                src={blockActive}
                className="task__attributes__tab-links__icon"
                alt="task-icons"
              />
            ) : (
              <img
                src={TaskConstraints}
                className="task__attributes__tab-links__icon"
                alt="task-icons"
              />
            )}
            <span
              className={`${activeTab == 'constraints'
                ? ' task__attributes__tab-links-active '
                : 'task__attributes__tab-links__name'
                }`}
            >
              {' '}
              Constraints
            </span>
            <p className='task__attributes__tab__constraints-state-open' style={{ display: constraintCount ? 'block' : 'none' }}>{constraintCount}</p>
          </button>
        </HtmlTooltip>
        <HtmlTooltip
          placement="bottom"
          arrow
          title={
            <React.Fragment>
              Add the reasons for any deviation on your activity
            </React.Fragment>
          }
        >
        <button
          className={`task__attributes__tab-links ${activeTab == 'variances'
              ? 'task__attributes__tab-links-active-border'
              : ''
            }`}
          onClick={() => {
            onTabChange('variances');
          }}
        >
          {activeTab == 'variances' ? (
            <img
              src={UCircleLayerActive}
              className="task__attributes__tab-links__icon"
              alt="task-icons"
            />
          ) : (
            <img
              src={TaskVariances}
              className="task__attributes__tab-links__icon"
              alt="task-icons"
            />
          )}
          <span
            className={`${activeTab == 'variances'
                ? ' task__attributes__tab-links-active '
                : 'task__attributes__tab-links__name'
              }`}
          >
            {' '}
            Variances
          </span>
          <p className='task__attributes__tab__constraints-state-open' style={{ display: varianceCount ? 'block' : 'none' }}>{varianceCount} </p>
        </button>
      </HtmlTooltip>
        <button
          className={`task__attributes__tab-links ${activeTab == 'related-tasks'
              ? 'task__attributes__tab-links-active-border'
              : ''
            }`}
          onClick={() => {
            onTabChange('related-tasks');
          }}
        >
          {activeTab == 'related-tasks' ? (
            <img
              src={WindowCheckActive}
              className="task__attributes__tab-links__icon"
              alt="task-icons"
            />
          ) : (
            <img
              src={WindowCheck}
              className="task__attributes__tab-links__icon"
              alt="task-icons"
            />
          )}
          <span
            className={`${activeTab == 'related-tasks'
                ? ' task__attributes__tab-links-active '
                : 'task__attributes__tab-links__name'
              }`}
          >
            Related Tasks
          </span>
        </button>
        {currentTask.type !=='wbs' ? 
        <button
          className={`task__attributes__tab-links ${activeTab == 'data'
              ? 'task__attributes__tab-links-active-border'
              : ''
            }`}
          onClick={() => {
            onTabChange('data');
          }}
        >
          {activeTab == 'data' ? (
            <img
              src={TaskDataActive}
              className="task__attributes__tab-links__icon"
              alt="task-icons"
            />
          ) : (
            <img
              src={TaskData}
              className="task__attributes__tab-links__icon"
              alt="task-icons"
            />
          )}
          <span
            className={`${activeTab == 'data'
                ? ' task__attributes__tab-links-active '
                : 'task__attributes__tab-links__name'
              }`}
          >
            {' '}
            Data
          </span>
        </button>: <></>}
        {currentTask.type === 'task' ?
          <HtmlTooltip
            placement="bottom"
            arrow
            title={
              <React.Fragment>
                Apply the ideal weather conditions for your task and we will notify you about any inclement weather which could impact your activity.
              </React.Fragment>
            }
          >
            <button
              className={`task__attributes__tab-links ${activeTab == 'weather'
                  ? 'task__attributes__tab-links-active-border'
                  : ''
                }`}
              onClick={() => {
                onTabChange('weather');
              }}
            >
              {activeTab == 'weather' ? (
                <img
                  src={WeatherCheckActive}
                  className="task__attributes__tab-links__icon"
                  alt="task-icons"
                />
              ) : (
                <img
                  src={WeatherCheck}
                  className="task__attributes__tab-links__icon"
                  alt="task-icons"
                />
              )}
              <span
                className={`${activeTab == 'weather'
                    ? ' task__attributes__tab-links-active '
                    : 'task__attributes__tab-links__name'
                  }`}
              >
                {' '}
                Weather
              </span>
            </button>
          </HtmlTooltip>
          : <></>
        }
        <Button className="btn-primary task__attributes__tab-comment ">
          Comment
        </Button>
      </div>

      {activeTab == 'resources' ? <EditTaskDetailsViewResources /> : ''}

      <EditProjectPlanLinksState>
        {activeTab == 'data' ? <EditTaskDetailsViewData /> : ''}

        {activeTab == 'constraints' ? (
          <EditTaskDetailsViewConstraints setEditMode={setEditMode}

          />
        ) : (
          ''
        )}
      </EditProjectPlanLinksState>

      {activeTab == 'variances' ? (
        <EditTaskDetailsViewVariances setEditMode={setEditMode}
        />
      ) : (
        ''
      )}

      {activeTab == 'related-tasks' ? <EditTaskDetailsViewRelatedTask /> : ''}

      {activeTab == 'weather' ? <EditWeatherOnActivity /> : ''}
      {activeTab == 'productivity' ? <EditTaskDetailsViewProductivity/> : ''}
    </React.Fragment>
  );
}
