import IconButton from '@material-ui/core/IconButton';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import { gantt } from 'dhtmlx-gantt';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import { client } from '../../../../services/graphql';
import { stateContext } from '../../../root/context/authentication/authContext';
import { GET_TASK_CONSTRAINTS } from '../../graphql/queries/lookahead';
import { GET_TASK_VARIANCES } from '../../graphql/queries/weeklyplan';
import { priorityPermissions } from '../../permission/scheduling';
import WeeklyTask from '../WeeklyPlan/components/WeeklyTask/WeeklyTask';
import WeeklyPlanPanel from './components/WeeklyPlanPanel/WeeklyPlanPanel';
import './WeeklyPlan.scss';

const days = [
  { day: 'Monday', date: 1, isHoliday: false },
  { day: 'Tuesday', date: 2, isHoliday: false },
  { day: 'Wednesday', date: 3, isHoliday: false },
  { day: 'Thursday', date: 4, isHoliday: false },
  { day: 'Friday', date: 5, isHoliday: false },
  { day: 'Saturday', date: 6, isHoliday: false },
  { day: 'Sunday', date: 7, isHoliday: false },
];

interface Itask {
  id: string;
  name: string;
  actualDuration: number;
  spilledOverStartDays: number;
  spilledOverEndDays: number;
  status: string;
  lpsStatus: string;
  duration: number;
  start: number;
  constraints: Array<any>;
  variances: Array<any>;
  progress: number;
  spillOverDisplayEndDate: string;
  assigneeName: string;
  assignedTo: string;
  actualStartDate: any;
  actualEndDate: any;
}

const WeeklyPlan = (props: any) => {
  const [currentDay, setCurrentDate] = useState(-1);
  const [currentWeek, setCurrentWeek] = useState('');
  const [previousWeek, setPreviousWeek] = useState('');
  const [weekNo, setWeekNo] = useState(0);
  const [weeklyTaskList, setWeeklyTaskList] = useState<Array<Itask>>([]);
  const { state }: any = useContext(stateContext);

  // useEffect(() => {
  // const date = new Date();
  // setCurrentDate(date.getDay());
  // }, []);

  useEffect(() => {
    setCurrentWeekDate(weekNo);
    setPreviousWeekDate(weekNo - 1);
    if (!weekNo) {
      const date = new Date();
      setCurrentDate(date.getDay());
    } else {
      setCurrentDate(-1);
    }
  }, [weekNo]);

  const setCurrentWeekDate = (wNo: number) => {
    const startDate = gantt.date.week_start(
      new Date(new Date().setDate(new Date().getDate() + wNo * 7))
    );
    const endDateDisplay = gantt.date.add(
      gantt.date.week_start(startDate),
      6,
      'day'
    );

    for (let i = 0; i < 7; i++) {
      const targetDate = gantt.date.add(startDate, i, 'day');
      if (!gantt.isWorkTime(targetDate)) {
        days[i].isHoliday = true;
      }
    }

    const currentWStartDate = moment(startDate).format('DD MMM YYYY');
    const currentWEndDate = moment(endDateDisplay).format('DD MMM YYYY');

    setCurrentWeek(`${currentWStartDate} - ${currentWEndDate}`);

    getCurrentWeekTaskDeatils();
  };

  const getCurrentWeekTaskDeatils = () => {
    const wStartDate: any = gantt.date.week_start(
      new Date(new Date().setDate(new Date().getDate() + weekNo * 7))
    );
    const wEndDate: any = gantt.date.add(
      gantt.date.week_start(wStartDate),
      7,
      'day'
    );

    let tList = gantt.getTaskByTime(wStartDate, wEndDate);
    tList = tList.filter((item: any) => item.type == 'task');

    const targetWeeklyTasks: Array<Itask> = [];
    tList.forEach((task: any, index: number) => {
      const wTask: Itask = {
        id: task.id,
        name: task.text,
        spilledOverStartDays: 0,
        spilledOverEndDays: 0,
        status: task.status,
        lpsStatus: task.lpsStatus,
        actualDuration: task.duration,
        duration: task.duration,
        start: 1,
        constraints: [],
        variances: [],
        progress: 0, //index+1*10,
        spillOverDisplayEndDate: moment(task.end_date - 1).format(
          'DD MMM YYYY'
        ),
        assigneeName: task.assigneeName,
        assignedTo: task.assignedTo,
        actualStartDate: task.actualStartDate,
        actualEndDate: task.actualEndDate,
      };
      wTask.start =
        gantt.calculateDuration({
          start_date: wStartDate,
          end_date: task.start_date,
        }) + 1;

      if (task.start_date < wStartDate) {
        wTask.spilledOverStartDays = gantt.calculateDuration({
          start_date: task.start_date,
          end_date: wStartDate,
        });
        wTask.start = 1;
        wTask.duration = wTask.duration - wTask.spilledOverStartDays;
      }
      if (wEndDate < task.end_date) {
        wTask.spilledOverEndDays = gantt.calculateDuration({
          start_date: wEndDate,
          end_date: task.end_date,
        });
        wTask.duration = 7;
      }
      targetWeeklyTasks.push(wTask);
    });
    setWeeklyTaskList([]);
    fetchProjectTaskConstraint(targetWeeklyTasks);
    fetchProjectTaskVariance(targetWeeklyTasks);
  };

  const fetchProjectTaskConstraint = async (tasks: Array<any>) => {
    try {
      const responseData = await client.query({
        query: GET_TASK_CONSTRAINTS,
        variables: {
          taskIds: tasks.map((task) => task.id),
        },
        fetchPolicy: 'network-only',
        context: {
          role: priorityPermissions('view'),
          token: state.selectedProjectToken,
        },
      });
      if (responseData.data.projectTaskConstraints.length > 0) {
        responseData.data.projectTaskConstraints.forEach((item: any) => {
          tasks.forEach((task) => {
            if (task.id == item.taskId) {
              task.constraints.push({
                id: item.id,
                constraintName: item.constraintName,
                category: item.category,
                task: item.projectTask.taskName,
                taskId: item.taskId,
                status: item.status,
              });
            }
          });
        });
      }
      setWeeklyTaskList(tasks);
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const fetchProjectTaskVariance = async (tasks: Array<any>) => {
    try {
      const responseData = await client.query({
        query: GET_TASK_VARIANCES,
        variables: {
          taskIds: tasks.map((task) => task.id),
        },
        fetchPolicy: 'network-only',
        context: {
          role: priorityPermissions('view'),
          token: state.selectedProjectToken,
        },
      });
      if (responseData.data.projectTaskVariance.length > 0) {
        responseData.data.projectTaskVariance.forEach((item: any) => {
          tasks.forEach((task) => {
            if (task.id == item.taskId) {
              task.variances.push({
                id: item.id,
                varianceName: item.varianceName,
                category: item.category,
                task: item.projectTask.taskName,
                taskId: item.taskId,
              });
            }
          });
        });
      }
      setWeeklyTaskList(tasks);
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const setPreviousWeekDate = (wNo: number) => {
    const startDate = gantt.date.week_start(
      new Date(new Date().setDate(new Date().getDate() + wNo * 7))
    );
    const endDateDisplay = gantt.date.add(
      gantt.date.week_start(startDate),
      6,
      'day'
    );

    const previousWStartDate = moment(startDate).format('DD MMM YYYY');
    const previousWEndDate = moment(endDateDisplay).format('DD MMM YYYY');

    setPreviousWeek(`${previousWStartDate} - ${previousWEndDate}`);
  };

  return (
    <div className="Weelyplan">
      <div className="Weelyplan__header">
        <div className="Weelyplan__header__currentWeek">
          <span className="Weelyplan__header__currentWeek__week">
            {' '}
            Weekly Plan -{' '}
          </span>
          <span className="Weelyplan__header__currentWeek__days">
            {' '}
            {currentWeek}{' '}
          </span>
        </div>
        <div className="Weelyplan__header__weekbefore">
          <div className="Weelyplan__header__weekbefore__back">
            <IconButton
              className="Weelyplan__header__weekbefore__back__btn"
              onClick={() => setWeekNo(weekNo - 1)}
            >
              <ArrowBackIosIcon fontSize="small" />
            </IconButton>
          </div>
          <div className="Weelyplan__header__weekbefore__current">
            <span className="Weelyplan__header__weekbefore__current__week">
              Week Before -
            </span>
            <span>{previousWeek}</span>
          </div>
          <div className="Weelyplan__header__weekbefore__next">
            <IconButton
              className="Weelyplan__header__weekbefore__next__btn"
              onClick={() => setWeekNo(weekNo + 1)}
            >
              <ArrowForwardIosIcon fontSize="small" />
            </IconButton>
          </div>
        </div>
      </div>
      <div className="Weelyplan__planner">
        <div className="Weelyplan__planner__weeks">
          {days.map((item) => (
            <div
              key={`${item.day}-${item.date}`}
              className={`Weelyplan__planner__weeks__box ${
                currentDay === item.date ? ' activeday' : ''
              } ${item.isHoliday ? 'weekend' : ''}`}
            >
              <div
                className={`Weelyplan__planner__weeks__box__header ${
                  currentDay === item.date ? ' activeday' : ''
                }`}
              >
                {item.day}
              </div>
            </div>
          ))}
        </div>
        <div className="Weelyplan__planner__tasks">
          <div
            className="Weelyplan__planner__tasks__list"
            style={{ gridRow: `1` }}
          >
            {/* <div className="Weelyplan__planner__tasks__list__initial">Task 1</div> */}
            {weeklyTaskList.map((item: any, index: number) => (
              <WeeklyTask item={item} index={index} key={`${item.id}`} />
            ))}
          </div>
        </div>
      </div>
      {props?.weeklyPlanStatus && (
        <WeeklyPlanPanel
          weeklyPlanStatus={props?.weeklyPlanStatus}
          weeklyTaskList={weeklyTaskList}
        />
      )}
    </div>
  );
};

export default WeeklyPlan;
