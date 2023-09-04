import React, {
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { TASK_POPUP_DETAIL_BY_TASK_ID } from 'src/modules/dynamicScheduling/graphql/queries/projectPlan';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import { client } from 'src/services/graphql';
import './ProjectPlanPopover.scss';
const TASK_TYPE = {
  PROJECT: 'project',
  WBS: 'wbs',
  WP: 'work_package',
  TASK: 'task',
  PHASE: 'project_phase',
};
const MS_IN_DAY = 1000 * 60 * 60 * 24;
const getDayGap = (from: string, to: string) => {
  try {
    return (
      Math.floor(
        (new Date(from).valueOf() - new Date(to).valueOf()) / MS_IN_DAY
      ) + ' Days'
    );
  } catch {
    return '--';
  }
};
export default function ProjectPlanPopover(props: any): ReactElement {
  const [taskDetail, setTaskDetail] = useState(null as any);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { state, dispatch }: any = useContext(stateContext);
  const instanceRef = useRef<HTMLDivElement>(null);
  const { showMoreButton = true } = props;

  useEffect(() => {
    if (props.taskId && props.taskId !== '') {
      getTaskDetailByTaskId(props.taskId);
    }
  }, [props.taskId]);

  const getDateInString = (d: Date) => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const date = new Date(d);

    let stringDate = '';
    try {
      if (d) {
        stringDate =
          (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) +
          '-' +
          months[date.getMonth()] +
          '-' +
          date.getFullYear().toString().slice(2);
        return stringDate;
      } else {
        return '---';
      }
    } catch (error: any) {
      return '---';
    }
  };

  const getTaskDetailByTaskId = async (id: string) => {
    try {
      setLoading(true);
      setTaskDetail(null);
      const res = await client.query({
        query: TASK_POPUP_DETAIL_BY_TASK_ID,
        fetchPolicy: 'network-only',
        variables: {
          taskId: id,
        },
        context: { role: 'viewMasterPlan', token: state?.selectedProjectToken },
      });

      setTaskDetail(
        (res.data && res.data.projectTask && res.data.projectTask[0]) ||
          props.taskDetail
      );
      setLoading(false);
      props.OnMounted &&
        props.OnMounted(
          instanceRef.current?.getBoundingClientRect &&
            instanceRef?.current?.getBoundingClientRect()
        );
    } catch {
      setLoading(false);
      setMessage('Error');
    }
  };

  const goToTask = () => {
    props.OnMoreDetail && props.OnMoreDetail(props.taskId);
  };

  const inBetweenDate = (startDate: string, endDate: string) => {
    try {
      return (
        new Date() >= new Date(startDate) && new Date() <= new Date(endDate)
      );
    } catch {
      return false;
    }
  };

  const getPlanStartAndEndDate = (
    showMoreDetail: boolean,
    showDuration: boolean
  ) => {
    return (
      <>
        <div className="project-popover__dates">
          <div>
            Start date:
            <span>{getDateInString(taskDetail.plannedStartDate)}</span>
          </div>
          <div>
            End date:
            <span>{getDateInString(taskDetail.plannedEndDate)}</span>
          </div>
          {showMoreButton && showMoreDetail ? (
            <button
              className="project-popover__more-details"
              onClick={goToTask}
            >
              More Details
            </button>
          ) : (
            <></>
          )}
        </div>
        {showDuration &&
        inBetweenDate(
          taskDetail.plannedStartDate,
          taskDetail.plannedEndDate
        ) ? (
          <div className="project-popover__detail">
            <div>
              <label>Elapsed Duration:</label>
              <div className="project-popover__detail__value">
                {getDayGap(
                  new Date().toDateString(),
                  taskDetail.plannedStartDate
                )}
              </div>
            </div>
            <div>
              <label>Pending Duration:</label>
              <div className="project-popover__detail__value">
                {getDayGap(
                  taskDetail.plannedEndDate,
                  new Date().toDateString()
                )}
              </div>
            </div>
          </div>
        ) : (
          ''
        )}{' '}
      </>
    );
  };

  const getPopoverForWP = () => {
    return (
      <>
        {getPlanStartAndEndDate(true, true)}
        <div className="project-popover__assignee">
          <div>
            Assignee:
            <span>{taskDetail?.assignedToUser?.firstName || '--'}</span>
          </div>
        </div>
      </>
    );
  };
  const getPopoverForTask = () => {
    return (
      <>
        {getPlanStartAndEndDate(true, false)}
        <div className="project-popover__assignee">
          <div>
            Assignee:
            <span>{taskDetail?.assignedToUser?.firstName || '--'}</span>
          </div>
        </div>
        <div className="project-popover__assignee">
          <div>
            Classification Code:
            {taskDetail?.classificationCode ? (
              <span className="project-popover__detail__value">
                {taskDetail?.classificationCode?.classificationCode || ''}
                {taskDetail?.classificationCode?.classificationCode &&
                taskDetail?.classificationCode?.classificationCodeName
                  ? '-'
                  : ''}
                {taskDetail?.classificationCode?.classificationCodeName || ''}
              </span>
            ) : (
              '  --'
            )}
          </div>
        </div>
        <div className="project-popover__detail">
          <div>
            <label>Material Allocated:</label>
            <div className="project-popover__detail__value">
              {taskDetail?.projectTaskMaterialAssociations?.length
                ? 'Yes'
                : 'No'}
            </div>
          </div>
          <div>
            <label>Float on task: </label>
            <div className="project-popover__detail__value">
              {taskDetail?.floatValue ?? '--'}
            </div>
          </div>
        </div>

        <div className="project-popover__detail">
          <div>
            <label>Constraints:</label>
            <div className="project-popover__detail__value">
              {taskDetail?.projectTaskConstraints?.length} open
            </div>
          </div>
          <div>
            <label>Forms linked with task:</label>
            <div className="project-popover__detail__value">
              {taskDetail?.formTaskLinks?.length
                ? taskDetail?.formTaskLinks?.length
                : '--'}
            </div>
          </div>
        </div>
      </>
    );
  };

  const getPopoverComponent = () => {
    switch (props.type) {
      case TASK_TYPE.PROJECT:
        return getPlanStartAndEndDate(false, true);
      case TASK_TYPE.PHASE:
        return getPlanStartAndEndDate(false, true);
      case TASK_TYPE.WBS:
        return getPlanStartAndEndDate(true, true);
      case TASK_TYPE.TASK:
        return getPopoverForTask();
      case TASK_TYPE.WP:
        return getPopoverForWP();
    }
  };

  return (
    <div className="project-popover" ref={instanceRef}>
      {loading ? (
        <div className="project-popover__loading"></div>
      ) : taskDetail ? (
        getPopoverComponent()
      ) : (
        <div className="project-popover__error-message">
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}
