import { Avatar } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Checkbox from '@mui/material/Checkbox';
import { gantt } from 'dhtmlx-gantt';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import ProjectPlanContext from '../../../../context/projectPlan/projectPlanContext';
import './ViewScheduleUpdate.scss';

const ViewScheduleUpdate = (props: any) => {
  const {
    acceptChanges,
    recjectedChanges,
    partialUpdateTasks,
    hidePanel,
    showSheduleTask,
  } = props;

  const { state, dispatch }: any = useContext(stateContext);
  const projectPlanContext = useContext(ProjectPlanContext);
  const { getPartialUpdatedTasks } = projectPlanContext;

  const [scheduledChanges, setScheduledChanges] = useState<any>();
  const [selectedChangeApproval, setSelectedChangeApproval] = useState<
    Array<number>
  >([]);
  const [selectAll, setSelectAll] = useState(false);
  useEffect(() => {
    getPartialUpdatedTasks();
  }, []);

  useEffect(() => {
    const sChanges = partialUpdateTasks.reduce((groups: any, change: any) => {
      const date = change.createdAt.split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(getScheduleChangeValue(change));
      return groups;
    }, {});

    // Edit: to add it in the array format instead
    const sChangeArrays = Object.keys(sChanges).map((date) => {
      return {
        date: sChanges[date][0].time,
        value: sChanges[date],
      };
    });
    setScheduledChanges(sChangeArrays);
  }, [partialUpdateTasks]);

  useEffect(() => {
    if (
      partialUpdateTasks &&
      partialUpdateTasks.length > 0 &&
      partialUpdateTasks.length == selectedChangeApproval.length
    ) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedChangeApproval]);

  const onSelectAllChange = () => {
    setSelectAll(!selectAll);
    const tempId: any = [];
    if (!selectAll) {
      scheduledChanges.forEach((item: any) => {
        item.value.forEach((value: any) => {
          tempId.push(value.id);
        });
      });
    }
    setSelectedChangeApproval(tempId);
  };

  const getScheduleChangeValue = (sChange: any) => {
    const creatorName = getName(sChange);
    const value = {
      id: sChange?.id,
      displayText: '',
      time: null,
      creator: creatorName,
      taskId: sChange?.taskId,
    };
    if (sChange?.plannedStartDate) {
      value.displayText = `<b> ${creatorName} </b>
            changed planned start date of <span class = "createLink"> "${
              sChange?.projectTask?.taskName
            }" </span>
            from <b>${moment(gantt.getTask(sChange?.taskId)?.start_date).format(
              'DD MMM YYYY'
            )}</b>
            to <b>${moment(sChange?.plannedStartDate).format(
              'DD MMM YYYY'
            )}</b> `;
      value.time = sChange.createdAt;
    } else if (sChange?.plannedEndDate && !sChange?.partialUpdateStatus) {
      value.displayText = `<b> ${creatorName} </b>
            changed planned end date of <span class = "createLink">"${
              sChange?.projectTask?.taskName
            }"</span>
            from <b>${moment(gantt.getTask(sChange?.taskId)?.end_date)
              .subtract(1, 'days')
              .format('DD MMM YYYY')}</b>
            to <b>${moment(sChange?.plannedEndDate).format('DD MMM YYYY')}</b>`;
      value.time = sChange.createdAt;
    } else if (sChange?.partialUpdateStatus == 'PLANNED_DURATION') {
      value.displayText = `<b> ${creatorName} </b>
            changed the planned duration of <span class = "createLink"> "${
              sChange?.projectTask?.taskName
            }"</span>
            from <b>${gantt.getTask(sChange?.taskId)?.duration} days </b>
            to <b>${sChange?.plannedDuration} days </b>
            (New planned end date is <b>${moment(
              sChange?.plannedEndDate
            ).format('DD MMM YYYY')}</b>)`;
      value.time = sChange.createdAt;
    } else if (
      sChange?.actualStartDate &&
      sChange?.taskStatus == 'In-Progress'
    ) {
      value.displayText = `<b> ${creatorName} </b>
            started the <span class = "createLink"> "${
              sChange?.projectTask?.taskName
            }"</span>
            on <b>${moment(sChange?.actualStartDate).format(
              'DD MMM YYYY'
            )}</b> `;
      value.time = sChange.createdAt;
    } else if (
      gantt.getTask(sChange?.taskId)?.actualEndDate &&
      sChange?.actualEndDate
    ) {
      value.displayText = `<b> ${creatorName} </b>
            changed actual end date of  <span class = "createLink"> "${
              sChange?.projectTask?.taskName
            }" </span>
            to <b>${moment(sChange?.actualEndDate).format('DD MMM YYYY')}</b> `;
      value.time = sChange.createdAt;
    } else if (sChange?.actualEndDate) {
      value.displayText = `<b> ${creatorName} </b>
            completed the <span class = "createLink"> "${
              sChange?.projectTask?.taskName
            }" </span>
            on <b>${moment(sChange?.actualEndDate).format('DD MMM YYYY')}</b> `;
      value.time = sChange.createdAt;
    } else if (sChange?.estimatedEndDate) {
      value.displayText = `<b> ${creatorName} </b>
             updated the estimated end date for <span class = "createLink"> "${
               sChange?.projectTask?.taskName
             }" </span>
            to <b>${moment(sChange?.estimatedEndDate).format(
              'DD MMM YYYY'
            )}</b> `;
      value.time = sChange.createdAt;
    } else if (sChange?.taskStatus == 'In-Progress') {
      value.displayText = `<b> ${creatorName} </b>
            changed status of the <span class = "createLink"> "${sChange?.projectTask?.taskName}" </span>
            from <b> Complete </b> to <b> In progress</b> `;
      value.time = sChange.createdAt;
    } else if (sChange?.taskStatus == 'To-Do') {
      value.displayText = `<b> ${creatorName} </b>
            changed status of the <span class = "createLink"> "${sChange?.projectTask?.taskName}" </span>
            from <b> In progress </b> to <b> To-Do</b> `;
      value.time = sChange.createdAt;
    }
    return value;
  };

  const getName = (sChange: any) => {
    if (sChange?.tenantAssociationByCreatedbyTenantid?.user?.firstName) {
      return (
        sChange?.tenantAssociationByCreatedbyTenantid?.user?.firstName +
        ' ' +
        sChange?.tenantAssociationByCreatedbyTenantid?.user?.lastName
      );
    } else {
      return sChange?.tenantAssociationByCreatedbyTenantid?.user?.email;
    }
  };

  const renderDate = (argDate: Date): string => {
    const hour = 3600 * 1000;
    const min = 60 * 1000;
    const day = 24 * hour;
    const givenTime = new Date(argDate).getTime();
    const now = new Date().getTime();
    const yesterDay = 2 * day;
    const dateDiff = now - givenTime;
    if (dateDiff > day && dateDiff < yesterDay) {
      return `Yesterday ${moment(argDate).format('h:mm:ss a')}`;
    } else if (dateDiff < day && dateDiff > hour) {
      return `${Math.floor(dateDiff / (3600 * 1000))} hours ago`;
    } else if (dateDiff < hour && dateDiff > min) {
      return `${Math.ceil(dateDiff / (60 * 1000))} min ago`;
    } else if (dateDiff < min) {
      return `now`;
    } else {
      return `${Math.floor(dateDiff / (3600 * 24 * 1000))} days ago`;
      //return moment(argDate).format('DD MMM YYYY ');
    }
  };

  const acceptSelectedChanges = () => {
    acceptChanges([...selectedChangeApproval]);
    if (selectedChangeApproval.length == partialUpdateTasks.length) {
      hidePanel();
    }
  };

  const rejectSelectedChanges = () => {
    recjectedChanges([...selectedChangeApproval]);
    if (selectedChangeApproval.length == partialUpdateTasks.length) {
      hidePanel();
    }
  };

  const handleCheckbox = (currentChange: any) => {
    const currentIndex = selectedChangeApproval.indexOf(currentChange.id);
    if (currentIndex > -1) {
      const newList = [...selectedChangeApproval];
      newList.splice(currentIndex, 1);
      setSelectedChangeApproval(newList);
    } else {
      setSelectedChangeApproval([...selectedChangeApproval, currentChange?.id]);
    }
  };
  const handleNavigateToTask = (itemId: any) => {
    showSheduleTask(itemId);
  };

  return (
    <div className="ViewScheduleUpdate">
      <div>
        <div className="ViewScheduleUpdate__header">
          <Button
            data-testid="close-button"
            variant="outlined"
            className="btn-secondary ViewScheduleUpdate__header__close"
            onClick={() => hidePanel(false)}
          >
            X
          </Button>
          Schedule Changes
        </div>
        <div className="ViewScheduleUpdate__info">
          Please note: You cannot edit the plan until you accept the below
          change(s):
        </div>
        <div className="ViewScheduleUpdate__body">
          <div
            className="ViewScheduleUpdate__body__item__data__subitem ViewScheduleUpdate__body__item__data__subitem__select-all "
            key={999999999}
          >
            <div>
              <Checkbox
                checked={selectAll}
                onChange={() => onSelectAllChange()}
                color="default"
              />
            </div>
            <div className="ViewScheduleUpdate__body__item__data__subitem__entry">
              <span>Select All</span>
            </div>
          </div>
          {scheduledChanges?.map((item: any) => (
            <div className="ViewScheduleUpdate__body__item" key={item.date}>
              <div className="ViewScheduleUpdate__body__item__left">
                <div className="ViewScheduleUpdate__body__item__left__timeline">
                  <div className="ViewScheduleUpdate__body__item__left__timeline__dot"></div>
                  <div className="ViewScheduleUpdate__body__item__left__timeline__connector"></div>
                </div>
                <div className="ViewScheduleUpdate__body__item__left__date">
                  {moment(item.date).format('DD MMM YYYY')}
                </div>
              </div>
              <div className="ViewScheduleUpdate__body__item__data">
                {item.value.map((subItem: any) => (
                  <div
                    className="ViewScheduleUpdate__body__item__data__subitem"
                    key={subItem.time}
                  >
                    <Avatar
                      className="ViewScheduleUpdate__body__item__data__subitem__avator"
                      src="/"
                      alt={subItem.creator}
                    />
                    <div>
                      <Checkbox
                        checked={
                          selectedChangeApproval.indexOf(subItem?.id) > -1
                        }
                        onChange={() => handleCheckbox(subItem)}
                        color="default"
                      />
                    </div>
                    <div className="ViewScheduleUpdate__body__item__data__subitem__entry">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: subItem.displayText,
                        }}
                        onClick={() => handleNavigateToTask(subItem?.taskId)}
                      ></div>
                      <div className="ViewScheduleUpdate__body__item__data__subitem__entry__duration">
                        {renderDate(subItem.time)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="ViewScheduleUpdate__footer">
          <Button
            className="btn-secondary"
            disabled={selectedChangeApproval?.length == 0}
            onClick={() => rejectSelectedChanges()}
            size="small"
          >
            Reject
          </Button>
          <Button
            className="btn-primary"
            disabled={selectedChangeApproval?.length == 0}
            onClick={() => acceptSelectedChanges()}
            size="small"
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
};
export default ViewScheduleUpdate;
