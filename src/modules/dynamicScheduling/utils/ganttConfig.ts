import { gantt } from 'dhtmlx-gantt';
import moment from 'moment';
import { transformDateToString } from './ganttDataTransformer';

export const weekScaleTemplate = (date: Date) => {
  const dateToStr = gantt.date.date_to_str('%d %M');
  const endDate = gantt.date.add(gantt.date.add(date, 1, 'week'), -1, 'day');
  return dateToStr(date) + ' - ' + dateToStr(endDate);
};

export const weekScaleTemplateWithNumber = (date: Date) => {
  const dateToStr = gantt.date.date_to_str('%d %M');
  const endDate = gantt.date.add(gantt.date.add(date, 1, 'week'), -1, 'day');
  return dateToStr(date) + ' - ' + dateToStr(endDate);
};

export const setHasChildifProejectTask = () => {
  if (gantt.getTaskByTime()?.length == 1) {
    gantt.getTaskByTime()[0].$has_child = false;
    gantt.render();
  }
};

const getWeekNumber = (date: Date) => {
  let minDate = gantt.getState().min_date;
  let weekNum = 1;
  while (gantt.date.add(minDate, 1, 'week') <= date) {
    minDate = gantt.date.add(minDate, 1, 'week');
    weekNum++;
  }
  return weekNum;
};

export const weekScaleTemplateWithoutMonth = (date: Date) => {
  const dateToStr = gantt.date.date_to_str('%d');
  const endDate = gantt.date.add(gantt.date.add(date, 1, 'week'), -1, 'day');
  return dateToStr(date) + ' - ' + dateToStr(endDate);
};

export const updateParents = (
  taskId: string | number,
  addUpdatedTask: any = null
) => {
  try {
    if (!taskId) return;
    const task = gantt.getTask(taskId);
    if (!task.parent) {
      return;
    }
    let has_changed = false;

    const parentTask = gantt.getTask(task.parent);
    const dates = gantt.getSubtaskDates(parentTask.id);

    if (dates.start_date.valueOf() != parentTask.start_date.valueOf()) {
      has_changed = true;
      parentTask.start_date = dates.start_date;
    }
    // updateStartDates(parentTask, dates.start_date);

    if (dates.end_date.valueOf() != parentTask.end_date.valueOf()) {
      has_changed = true;
      parentTask.end_date = dates.end_date;
    }
    // updateEndDates(parentTask, dates.end_date);

    if (has_changed) {
      parentTask.duration = gantt.calculateDuration(parentTask);
      updateDuration(parentTask, parentTask.duration);
      gantt.refreshTask(parentTask.id);
      if (addUpdatedTask) {
        addUpdatedTask(parentTask);
      }
      if (parentTask.parent != 0 && parentTask.parent != '0') {
        updateParents(parentTask.id, addUpdatedTask);
      }
    }
  } catch (error: any) {
    console.log('error: ', error);
  }

  //   let has_changed = true; // GS-761 the dates check is necessary for adding empty tasks: gantt.addTask({id:"2"})

  /*  if (
    updateAll ||
    (task.start_date &&
      task.end_date &&
      (taskTiming.$no_start || taskTiming.$no_end))
  ) {
    const oldStart = task.start_date.valueOf(),
      oldEnd = task.end_date.valueOf();
    gantt.resetProjectDates(task); // not refresh parent projects if dates hasn't changed

    if (
      !updateAll &&
      oldStart == task.start_date.valueOf() &&
      oldEnd == task.end_date.valueOf()
    ) {
      has_changed = false;
    }

    if (has_changed) {
      gantt.refreshTask(task.id, true);
    }
  }

  if (has_changed && pid && gantt.isTaskExists(pid)) {
    updateParents(pid, updateAll);
  } */
  //}
};

export const calculateTotalFloat = (addUpdatedTask: any = null) => {
  gantt.eachTask((task) => {
    const tempFloat = gantt.getTotalSlack(task.id);

    if (task.floatValue != tempFloat) {
      task.floatValue = tempFloat;
      if (addUpdatedTask) {
        addUpdatedTask(task);
      }
    }
    if (task.floatValue < 0) {
      task.floatValue = 0;
      task.isCritical = true;
    }
  });
};

export const daysYearLabel = (date: Date) => {
  const dateToStr = gantt.date.date_to_str('%d');
  return '1';
  //return dateToStr(gantt.date.fiscal_year_start(date));
};

export const getTaskTypeName = (argType: string) => {
  let typeName = '';
  if (argType.indexOf('_') != -1) {
    const type =
      argType.split('_')[0].charAt(0).toUpperCase() +
      argType.split('_')[0].slice(1) +
      ' ' +
      argType.split('_')[1].charAt(0).toUpperCase() +
      argType.split('_')[1].slice(1);
    typeName = type.charAt(0).toUpperCase() + type.slice(1);
  } else {
    const type = argType.replace(/[&\/\\#,+_()$~%.'":*?<>{}]/g, ' ');

    typeName =
      type == 'wbs'
        ? type.toUpperCase()
        : type.charAt(0).toUpperCase() + type.slice(1);
  }
  return typeName;
};

export const getAllChildrens = (id: any) => {
  const childrenId: any = [];
  const childrens = gantt.getChildren(id);

  childrens.forEach((id: any) => {
    if (gantt.getChildren(id).length > 0) {
      childrenId.push(...getChildren(id));
    }
  });

  return [...childrenId, ...childrens];
};

const getChildren = (id: any) => {
  const ids = gantt.getChildren(id);
  const temp: any = [];

  ids.forEach((id: any) => {
    if (gantt.getChildren(id).length > 0) {
      temp.push(...getChildren(id));
    }
  });
  return [...ids, ...temp];
};

export const onKeyDown = (e: any) => {
  if (e.charCode === 45) {
    e.preventDefault();
    return false;
  }
  try {
    if (e.charCode === 48 && !e.target.value) {
      e.preventDefault();
      return false;
    }
  } catch (e) {}
};

export const getNonHoliydayEventDate = (date = new Date()): Date => {
  let i = 0;
  while (!gantt.isWorkTime(gantt.date.add(date, i, 'day'))) {
    i++;
  }
  return gantt.date.add(date, i, 'day');
};

export const getPreviousWorkingDay = (): Date => {
  let i = 0;
  while (!gantt.isWorkTime(gantt.date.add(new Date(), i, 'day'))) {
    i--;
  }
  return gantt.date.add(new Date(), i, 'day');
};

export const updateParentTaskStatusAndActualDates = (
  parentTaskId: any,
  currentTask: any
) => {
  try {
    let parentTask = null;

    while (parentTaskId) {
      parentTask = gantt.getTask(parentTaskId);

      if (currentTask.actualStartDate) {
        if (
          parentTask.actualStartDate &&
          new Date(currentTask.actualStartDate.replace(/-/g, '/')).getTime() <
            new Date(parentTask.actualStartDate.replace(/-/g, '/')).getTime()
        ) {
          parentTask.actualStartDate = currentTask.actualStartDate;
        } else if (!parentTask.actualStartDate) {
          parentTask.actualStartDate = currentTask.actualStartDate;
        }
        parentTask.status = 'In-Progress';

        parentTask.actualEndDate = null;
        parentTask.actualDuration = null;
      }

      const childTaskIds = gantt.getChildren(parentTaskId);

      const childTask = childTaskIds.map((id: any) => gantt.getTask(id));

      const allCompleted =
        childTask.length > 0
          ? childTask.every((task: any) => task.status === 'Complete')
          : false;

      const allToDo = childTask.every((task: any) => task.status === 'To-Do');

      if (allCompleted) {
        const allTaskDates = childTask
          .map((task: any) =>
            new Date(task.actualEndDate.replace(/-/g, '/')).getTime()
          )
          .filter((d: any) => !isNaN(d));

        // const duration = childTask.map((task: any) => task.duration);

        // parentTask.actualDuration = Math.max(...duration);

        const largestDate = new Date(Math.max(...allTaskDates));
        parentTask.actualEndDate = transformDateToString(largestDate);
        parentTask.actualDuration = gantt.calculateDuration({
          start_date: new Date(parentTask.actualStartDate.replace(/-/g, '/')),
          end_date: moment
            .utc(new Date(parentTask.actualEndDate.replace(/-/g, '/')))
            .add(1, 'd')
            .toDate(),
          parentTask,
        });
        parentTask.status = 'Complete';
        parentTask.estimatedEndDate = null;
        parentTask.estimatedDuration = null;
      } else if (allToDo) {
        parentTask.status = 'To-Do';
        parentTask.actualStartDate = null;
        parentTask.actualEndDate = null;
        parentTask.actualDuration = null;
        parentTask.estimatedEndDate = null;
        parentTask.estimatedDuration = null;
        parentTask.start_date = new Date(parentTask.plannedStartDate);
        parentTask.start_date.setHours(0);
        parentTask.start_date.setMinutes(0);
        parentTask.start_date.setSeconds(0);
        parentTask.end_date = endDateIncreaseByOneDay(
          parentTask.plannedEndDate
        );
        parentTask.plannedDuration = gantt.calculateDuration(parentTask);
      } else {
        parentTask.status = 'In-Progress';
        const allTaskDates = childTask
          .filter((task: any) => task.actualStartDate)
          .map((task: any) =>
            new Date(task.actualStartDate.replace(/-/g, '/')).getTime()
          )
          .filter((d: any) => !isNaN(d));

        const smallestDate = new Date(Math.min(...allTaskDates));
        parentTask.actualStartDate = transformDateToString(smallestDate);
        parentTask.actualEndDate = null;
        parentTask.actualDuration = null;
      }

      if (parentTask.status == 'In-Progress') {
        const allTaskDates = childTask
          .filter((task: any) => task.estimatedEndDate)
          .map((task: any) =>
            new Date(task.estimatedEndDate.replace(/-/g, '/')).getTime()
          )
          .filter((d: any) => !isNaN(d));

        // const duration = childTask.map((task: any) => task.duration);

        // parentTask.actualDuration = Math.max(...duration);

        // const largestDate = new Date(Math.max(...allTaskDates));

        // parentTask.estimatedEndDate = transformDateToString(largestDate);
        if (allTaskDates.length > 0) {
          const largestDate = new Date(Math.max(...allTaskDates));

          // parentTask.estimatedEndDate = transformDateToString(largestDate);
          parentTask.estimatedEndDate = transformDateToString(
            endDateDecreaseByOneDay(parentTask.end_date)
          );
        } else {
          parentTask.estimatedEndDate = transformDateToString(
            endDateDecreaseByOneDay(
              gantt.calculateEndDate({
                start_date: parentTask.start_date,

                duration: parentTask.plannedDuration,
                parentTask,
              })
            )
          );

          parentTask.estimatedDuration = parentTask.plannedDuration;
        }
        //  gantt.calculateEndDate({
        //   start_date: new Date(parentTask.actualStartDate.replace(/-/g, '/')),
        //   duration: parentTask.duration,
        // });

        parentTask.start_date = new Date(
          parentTask.actualStartDate.replace(/-/g, '/')
        );
        // parentTask.end_date = endDateIncreaseByOneDay(
        //   parentTask.estimatedEndDate
        // );
        parentTask.estimatedDuration = gantt.calculateDuration({
          start_date: new Date(parentTask.actualStartDate.replace(/-/g, '/')),
          end_date: moment
            .utc(new Date(parentTask.estimatedEndDate.replace(/-/g, '/')))
            .add(1, 'd')
            .toDate(),
          parentTask,
        });
        // parentTask.estimatedEndDate = moment(parentTask.estimatedEndDate)
        //   .startOf('date')
        //   .toDate();
        // parentTask.estimatedEndDate = moment
        //   .utc(parentTask.estimatedEndDate)
        //   .add(-1, 'd')
        //   .toDate();
        // parentTask.estimatedEndDate = transformDate(
        //   parentTask.estimatedEndDate
        // );
      }
      parentTaskId = parentTask.parent;
    }
  } catch (error: any) {
    console.log('error: ', error);
  }
};

export const setHasChildProperty = (callBack: any = null) => {
  gantt.eachTask((task: any) => {
    if (task.parent) {
      const parent = gantt.getTask(task.parent);
      if (!parent.$has_child) {
        parent.$has_child = true;
        if (callBack) {
          callBack(parent);
        }
      }
    }
  });
};

export const updateParentsTemp = (task: any, addUpdatedTask: any = null) => {
  if (!task) return;

  let parentTaskId = task.parent;
  const currentTask = task;
  let has_changed = false;

  try {
    let parentTask = null;

    while (parentTaskId) {
      parentTask = gantt.getTask(parentTaskId);
      const dates = gantt.getSubtaskDates(parentTask.id);
      //  update planned dates

      if (dates.start_date.valueOf() != parentTask.start_date.valueOf()) {
        has_changed = true;
        parentTask.start_date = dates.start_date;
      }

      if (dates.end_date.valueOf() != parentTask.end_date.valueOf()) {
        has_changed = true;
        parentTask.end_date = dates.end_date;
      }

      if (has_changed) {
        parentTask.duration = gantt.calculateDuration(parentTask);
        gantt.refreshTask(parentTask.id);
        if (addUpdatedTask) {
          addUpdatedTask(parentTask);
        }
      }

      //  update actual dates

      if (task?.type != 'milestone') {
        if (currentTask.actualStartDate) {
          if (
            parentTask.actualStartDate &&
            new Date(currentTask.actualStartDate.replace(/-/g, '/')).getTime() <
              new Date(parentTask.actualStartDate.replace(/-/g, '/')).getTime()
          ) {
            parentTask.actualStartDate = currentTask.actualStartDate;
          } else if (!parentTask.actualStartDate) {
            parentTask.actualStartDate = currentTask.actualStartDate;
          }
          parentTask.status = 'In-Progress';
          parentTask.actualEndDate = null;
          parentTask.actualDuration = null;
        }

        const childTaskIds = gantt.getChildren(parentTaskId);

        const childTask = childTaskIds.map((id: any) => gantt.getTask(id));

        const allCompleted =
          childTask.length > 0
            ? childTask.every((task: any) => task.status === 'Complete')
            : false;

        const allToDo = childTask.every((task: any) => task.status === 'To-Do');

        if (allCompleted) {
          const allTaskDates = childTask
            .map((task: any) =>
              new Date(task.actualEndDate.replace(/-/g, '/')).getTime()
            )
            .filter((d: any) => !isNaN(d));

          // const duration = childTask.map((task: any) => task.duration);

          // parentTask.actualDuration = Math.max(...duration);

          const largestDate = new Date(Math.max(...allTaskDates));
          parentTask.actualEndDate = transformDateToString(largestDate);
          parentTask.actualDuration = gantt.calculateDuration({
            start_date: new Date(parentTask.actualStartDate.replace(/-/g, '/')),
            end_date: moment
              .utc(new Date(parentTask.actualEndDate.replace(/-/g, '/')))
              .add(1, 'd')
              .toDate(),
            parentTask,
          });
          parentTask.status = 'Complete';
        } else if (allToDo) {
          parentTask.status = 'To-Do';
          parentTask.actualStartDate = null;
          parentTask.actualEndDate = null;
          parentTask.actualDuration = null;
          parentTask.plannedStartDate = transformDateToString(
            parentTask.start_date
          );
          parentTask.plannedDuration = parentTask.duration;
          parentTask.plannedEndDate = transformDateToString(
            endDateDecreaseByOneDay(parentTask.end_date)
          );
        } else {
          parentTask.status = 'In-Progress';
          const allTaskDates = childTask
            .filter((task: any) => task.actualStartDate)
            .map((task: any) =>
              new Date(task.actualStartDate.replace(/-/g, '/')).getTime()
            )
            .filter((d: any) => !isNaN(d));

          const smallestDate = new Date(Math.min(...allTaskDates));
          parentTask.actualStartDate = transformDateToString(smallestDate);
          parentTask.actualEndDate = null;
          parentTask.actualDuration = null;
        }
      }
      parentTaskId = parentTask.parent;
    }
  } catch (error: any) {}
};

export const endDateIncreaseByOneDay = (date: string) => {
  return moment(new Date(date)).add(1, 'days').startOf('day').toDate();
};

export const endDateDecreaseByOneDay = (date: any) => {
  return moment(new Date(date)).add(-1, 'days').startOf('day').toDate();
};

const updateStartDates = (task: any, startDate: any) => {
  if (task.status == 'To-Do') {
    task.plannedStartDate = transformDateToString(startDate);
  } else {
    task.actualStartDate = transformDateToString(startDate);
  }
};

const updateEndDates = (task: any, endDate: any) => {
  if (task.status == 'To-Do') {
    task.plannedEndDate = transformDateToString(
      endDateDecreaseByOneDay(endDate)
    );
  } else if (task.status == 'In-Progress') {
    task.estimatedEndDate = transformDateToString(
      endDateDecreaseByOneDay(endDate)
    );
  } else {
    task.actualEndDate = transformDateToString(
      endDateDecreaseByOneDay(endDate)
    );
  }
};

const updateDuration = (task: any, duration: any) => {
  if (task.status == 'To-Do') {
    task.plannedDuration = duration;
  } else if (task.status == 'In-Progress') {
    task.estimatedDuration = duration;
  } else {
    task.actualDuration = duration;
  }
};

export const updateParentTaskDates = (
  task: any,
  column: string,
  addUpdatedTask: any = null
) => {
  try {
    if (!task) return;
    // const task = gantt.getTask(taskId);
    if (!task.parent) {
      gantt.render();
      return;
    }
    let has_changed = false;

    const parentTask = gantt.getTask(task.parent);

    if (column.includes('planned')) {
      if (column.includes('Start')) {
        const childTaskIds = gantt.getChildren(parentTask.id);
        const childTask = childTaskIds
          .map((id: any) => gantt.getTask(id))
          .filter((task: any) => task.plannedStartDate);

        const allTaskDates = childTask.map((task: any) =>
          new Date(task.plannedStartDate.replace(/-/g, '/')).getTime()
        );

        const minimumDate = new Date(Math.min(...allTaskDates));
        parentTask.plannedStartDate = transformDateToString(minimumDate);
        if (addUpdatedTask) addUpdatedTask(parentTask);
        has_changed = true;
      }

      if (column.includes('End')) {
        const childTaskIds = gantt.getChildren(parentTask.id);
        const childTask = childTaskIds
          .map((id: any) => gantt.getTask(id))
          .filter((task: any) => task.plannedEndDate);
        const allTaskDates = childTask.map((task: any) =>
          new Date(task.plannedEndDate.replace(/-/g, '/')).getTime()
        );

        const maximumDate = new Date(Math.max(...allTaskDates));

        parentTask.plannedEndDate = transformDateToString(maximumDate);
        has_changed = true;

        if (addUpdatedTask) addUpdatedTask(parentTask);
      }

      parentTask.plannedDuration = gantt.calculateDuration({
        start_date: new Date(parentTask.plannedStartDate.replace(/-/g, '/')),
        end_date: moment
          .utc(new Date(parentTask.plannedEndDate.replace(/-/g, '/')))
          .add(1, 'd')
          .toDate(),
        parentTask,
      });

      if (parentTask.status == 'In-Progress') {
        const endDate = gantt.calculateEndDate({
          start_date: moment(new Date(parentTask.actualStartDate))
            .startOf('day')
            .toDate(),
          duration: parentTask.duration,
        });
        parentTask.estimatedEndDate = transformDateToString(
          endDateDecreaseByOneDay(endDate)
        );
        parentTask.estimatedDuration = parentTask.duration;
        has_changed = true;

        if (addUpdatedTask) addUpdatedTask(parentTask);
      }
    } else if (column.includes('actual')) {
      if (column.includes('Start')) {
        const childTaskIds = gantt.getChildren(parentTask.id);
        const childTask = childTaskIds
          .map((id: any) => gantt.getTask(id))
          .filter((task: any) => task.actualStartDate);
        const allTaskDates = childTask.map((task: any) =>
          new Date(task.actualStartDate.replace(/-/g, '/')).getTime()
        );

        const minimumDate = new Date(Math.min(...allTaskDates));

        parentTask.actualStartDate = transformDateToString(minimumDate);
        if (addUpdatedTask) addUpdatedTask(parentTask);
        has_changed = true;
      }

      if (column.includes('End')) {
        const childTaskIds = gantt.getChildren(parentTask.id);
        const childTask = childTaskIds
          .map((id: any) => gantt.getTask(id))
          .filter((task: any) => task.actualEndDate);
        const allTaskDates = childTask.map((task: any) =>
          new Date(task.actualEndDate.replace(/-/g, '/')).getTime()
        );

        const maximumDate = new Date(Math.max(...allTaskDates));

        parentTask.actualEndDate = transformDateToString(maximumDate);
        has_changed = true;

        if (addUpdatedTask) addUpdatedTask(parentTask);
      }

      if (parentTask.status == 'Complete') {
        parentTask.actualDuration = gantt.calculateDuration({
          start_date: new Date(parentTask.actualStartDate.replace(/-/g, '/')),
          end_date: moment
            .utc(new Date(parentTask.actualEndDate.replace(/-/g, '/')))
            .add(1, 'd')
            .toDate(),
          parentTask,
        });
      }

      if (parentTask.status == 'In-Progress') {
        const endDate = gantt.calculateEndDate({
          start_date: moment(new Date(parentTask.actualStartDate))
            .startOf('day')
            .toDate(),
          duration: parentTask.duration,
          parentTask,
        });
        parentTask.estimatedEndDate = transformDateToString(
          endDateDecreaseByOneDay(endDate)
        );
        parentTask.estimatedDuration = parentTask.duration;
        has_changed = true;

        if (addUpdatedTask) addUpdatedTask(parentTask);
      }
    } else if (column.includes('estimated')) {
      if (
        parentTask.status == 'In-Progress' &&
        parentTask.estimatedEndDate &&
        new Date(parentTask.estimatedEndDate.replace(/-/g, '/')).getTime() <
          new Date(task.estimatedEndDate.replace(/-/g, '/')).getTime()
      ) {
        parentTask.estimatedEndDate = task.estimatedEndDate;
        parentTask.estimatedDuration = parentTask.duration;

        has_changed = true;

        if (addUpdatedTask) addUpdatedTask(parentTask);
      }
    }

    if (has_changed) {
      updateParentTaskDates(parentTask, column, addUpdatedTask);
    }
    gantt.render();
  } catch (error: any) {
    console.log('error: ', error);
  }
};

export const updateTaskAfterDrag = (task: any) => {
  if (!task) {
    return;
  }

  let parentTask = gantt.getTask(task.parent);

  while (parentTask) {
    const childTaskIds = gantt.getChildren(parentTask.id);
    const childTasks = childTaskIds.map((id: any) => gantt.getTask(id));

    if (task.status == 'To-Do') {
      const plannedStartDates = childTasks.map(
        (task: any) => task.plannedStartDate
      );
      const plannedEndDates = childTasks.map(
        (task: any) => task.plannedEndDate
      );

      const minStartDate = getMinDate(plannedStartDates);
      const maxEndDate = getMaxDate(plannedEndDates);
      if (
        new Date(minStartDate).valueOf() !=
        new Date(parentTask.plannedStartDate).valueOf()
      ) {
        parentTask.plannedStartDate = minStartDate;
        parentTask.start_date = new Date(minStartDate);

        parentTask.start_date.setHours(0);
        parentTask.start_date.setMinutes(0);
        parentTask.start_date.setSeconds(0);
      }

      if (
        new Date(maxEndDate).valueOf() !=
        new Date(parentTask.plannedEndDate).valueOf()
      ) {
        parentTask.plannedEndDate = maxEndDate;
        parentTask.end_date = endDateIncreaseByOneDay(maxEndDate);
        // if (parentTask.status == 'In-Progress') {
        //   parentTask.estimatedEndDate = transformDateToString(
        //     endDateDecreaseByOneDay(
        //       gantt.calculateEndDate({
        //         start_date: new Date(parentTask.actualStartDate),
        //         duration: parentTask.duration,
        //       })
        //     )
        //   );
        // }
      }

      parentTask.plannedDuration = gantt.calculateDuration({
        start_date: moment(new Date(parentTask.plannedStartDate))
          .startOf('day')
          .toDate(),
        end_date: endDateIncreaseByOneDay(parentTask.plannedEndDate),
        parentTask,
      });

      parentTask.duration = parentTask.plannedDuration;
    }

    if (task.status == 'In-Progress') {
      const actualStartDates = childTasks
        .map((task: any) => task.actualStartDate)
        .filter((date: any) => date);

      const estimatedEndDates = childTasks
        .map((task: any) => task.estimatedEndDate)
        .filter((date: any) => date);

      const minStartDate = getMinDate(actualStartDates);
      const maxEndDate = getMaxDate(estimatedEndDates);
      if (
        new Date(minStartDate).valueOf() !=
        new Date(parentTask.actualStartDate).valueOf()
      ) {
        parentTask.actualStartDate = minStartDate;
        parentTask.start_date = new Date(minStartDate);

        parentTask.start_date.setHours(0);
        parentTask.start_date.setMinutes(0);
        parentTask.start_date.setSeconds(0);
      }

      // if (
      //   new Date(maxEndDate).valueOf() !=
      //   new Date(parentTask.estimatedEndDate).valueOf()
      // ) {
      //   parentTask.estimatedEndDate = transformDateToString(
      //     endDateDecreaseByOneDay(
      //       gantt.calculateEndDate({
      //         start_date: new Date(parentTask.actualStartDate),
      //         duration: parentTask.duration,
      //       })
      //     )
      //   );
      // }
      parentTask.estimatedEndDate = null;
      parentTask.estimatedDuration = null;
      // parentTask.duration = gantt.calculateDuration({
      //   start_date: moment(new Date(parentTask.actualStartDate))
      //     .startOf('day')
      //     .toDate(),
      //   end_date: parentTask.end_date,
      // });
      // parentTask.estimatedDuration = parentTask.duration;
      // parentTask.status = 'In-Progress';
    }

    if (task.status == 'Complete') {
      const actualStartDates = childTasks
        .map((task: any) => task.actualStartDate)
        .filter((date: any) => date);
      const actualEndDates = childTasks
        .map((task: any) => task.actualEndDate)
        .filter((date: any) => date);

      const minStartDate = getMinDate(actualStartDates);
      const maxEndDate = getMaxDate(actualEndDates);
      if (
        new Date(minStartDate).valueOf() !=
        new Date(parentTask.actualStartDate).valueOf()
      ) {
        parentTask.actualStartDate = minStartDate;
        parentTask.start_date = new Date(minStartDate);
        parentTask.start_date.setHours(0);
        parentTask.start_date.setMinutes(0);
        parentTask.start_date.setSeconds(0);
      }

      if (
        new Date(maxEndDate).valueOf() !=
          new Date(parentTask.actualEndDate).valueOf() &&
        parentTask.actualEndDate
      ) {
        parentTask.actualEndDate = maxEndDate;
        parentTask.end_date = endDateIncreaseByOneDay(maxEndDate);
      }
    }

    parentTask = gantt.getTask(parentTask.parent);
    // if (parentTask && parentTask.parent == 0) {
    //   parentTask.estimatedEndDate = null;
    // }
  }
};

export const getMinDate = (dates: any) => {
  const minDate = Math.min(
    ...dates.map((date: any) => {
      return new Date(date.replace(/-/g, '/'));
    })
  );

  return transformDateToString(new Date(minDate));
};

export const getMaxDate = (dates: any) => {
  const maxDate = Math.max(
    ...dates.map((date: any) => {
      return new Date(date.replace(/-/g, '/'));
    })
  );

  return transformDateToString(new Date(maxDate));
};

export const displayParentTask = (parentTaskId: any) => {
  let task = gantt.getTask(parentTaskId);
  while (task && task.parent) {
    task.show = true;
    task = gantt.getTask(task.parent);
  }
};

export const updateFilterIconValue = (filterState: any) => {
  //  Type Filter

  // get type filter element
  const typeFilterElement = document.getElementById(
    'gantt-container-filter-type'
  );

  // check if type filter exits
  if (typeFilterElement) {
    // check if any type is selected or not if type filter is not selected than remove badge
    if (JSON.stringify(filterState.type).includes('true')) {
      // get type filter badge
      let element: any = document.getElementById('gantt-type-filter-badge');

      // create element if it's not exit
      if (!element) {
        element = document.createElement('span');
        element.classList.add('gantt-container__filter_badge');
        element.setAttribute('id', 'gantt-type-filter-badge');
        element.appendChild(
          document.createTextNode(
            Array.from(Object.values(filterState.type))
              .filter((value: any) => value)
              .length.toString()
          )
        );
      } else {
        element.textContent = Array.from(Object.values(filterState.type))
          .filter((value: any) => value)
          .length.toString();
      }
      typeFilterElement.appendChild(element);
    } else {
      const element: any = document.getElementById('gantt-type-filter-badge');
      if (element) {
        element.parentNode.removeChild(element);
      }
    }
  }

  // Total Float

  //  get total float div element
  const totalFloatFilterElement = document.getElementById(
    'gantt-container-filter-total-float'
  );
  // check if filter is not selected than remove current badge.
  if (totalFloatFilterElement) {
    if (filterState.criticalTask) {
      //  Get badge element
      let element: any = document.getElementById(
        'gantt-total-float-filter-badge'
      );
      // check if element is not exit than create if exits than update
      if (!element) {
        element = document.createElement('span');
        element.classList.add('gantt-container__filter_badge');
        element.setAttribute('id', 'gantt-total-float-filter-badge');
        element.appendChild(document.createTextNode('1'));
      } else {
        element.textContent = filterState.criticalTask ? '1' : '0';
      }
      totalFloatFilterElement.appendChild(element);
    } else {
      const element: any = document.getElementById(
        'gantt-total-float-filter-badge'
      );
      if (element) {
        element.parentNode.removeChild(element);
      }
    }
  }

  //responsible company
  //get resp;onsible company div
  const responsibleCompanyFilterElement = document.getElementById(
    'gantt-container-filter-responsible-company'
  );
  if (responsibleCompanyFilterElement) {
    // check if responsible company is selected or not
    if (JSON.stringify(filterState.responsibleCompany).includes('true')) {
      //  Get badge element
      let element: any = document.getElementById(
        'gantt-responsible-filter-badge'
      );

      // check if element is not exit than create if exits than update
      if (!element) {
        element = document.createElement('span');
        element.classList.add('gantt-container__filter_badge');
        element.setAttribute('id', 'gantt-responsible-filter-badge');
        element.appendChild(
          document.createTextNode(
            Array.from(Object.values(filterState.responsibleCompany))
              .filter((value: any) => value)
              .length.toString()
          )
        );
      } else {
        element.textContent = Array.from(
          Object.values(filterState.responsibleCompany)
        )
          .filter((value: any) => value)
          .length.toString();
      }
      responsibleCompanyFilterElement.appendChild(element);
    } else {
      const element: any = document.getElementById(
        'gantt-responsible-filter-badge'
      );
      if (element) {
        element.parentNode.removeChild(element);
      }
    }
  }

  //  Filter Assignee

  //  get assignee div element
  const assigneeFilterElement = document.getElementById(
    'gantt-container-filter-assignee'
  );

  if (assigneeFilterElement) {
    // check if assignee is selected or not
    if (JSON.stringify(filterState.assignee).includes('true')) {
      //  Get badge element
      let element: any = document.getElementById('gantt-assignee-filter-badge');

      // check if element is not exit than create if exits than update
      if (!element) {
        element = document.createElement('span');
        element.classList.add('gantt-container__filter_badge');
        element.setAttribute('id', 'gantt-assignee-filter-badge');
        element.appendChild(
          document.createTextNode(
            Array.from(Object.values(filterState.assignee))
              .filter((value: any) => value)
              .length.toString()
          )
        );
      } else {
        element.textContent = Array.from(Object.values(filterState.assignee))
          .filter((value: any) => value)
          .length.toString();
      }
      assigneeFilterElement.appendChild(element);
    } else {
      const element: any = document.getElementById(
        'gantt-assignee-filter-badge'
      );
      if (element) {
        element.parentNode.removeChild(element);
      }
    }
  }

  //  Filter Planned Start Date

  //  get planned start filter div element
  const plannedStartFilterElement = document.getElementById(
    'gantt-container-filter-planned-start-date'
  );

  if (plannedStartFilterElement) {
    // check if planned start date is selected or not
    if (filterState.plannedStart) {
      //  Get badge element
      let element: any = document.getElementById(
        'gantt-planned-start-filter-badge'
      );

      // check if element is not exit than create if exits than update
      if (!element) {
        element = document.createElement('span');
        element.classList.add('gantt-container__filter_badge');
        element.classList.add(
          'gantt-container__filter_planned_start-date-badge'
        );
        element.setAttribute('id', 'gantt-planned-start-filter-badge');
        element.appendChild(
          document.createTextNode(`${filterState.plannedStart ? '1' : '0'}`)
        );
      } else {
        element.textContent = filterState.plannedStart ? '1' : '0';
      }
      plannedStartFilterElement.appendChild(element);
    } else {
      const element: any = document.getElementById(
        'gantt-planned-start-filter-badge'
      );
      if (element) {
        element.parentNode.removeChild(element);
      }
    }
  }

  //  Filter Planned End Date

  //  get planned end filter div element
  const plannedEndFilterElement = document.getElementById(
    'gantt-container-filter-planned-end-date'
  );

  if (plannedEndFilterElement) {
    // check if planned end date is selected or not
    if (filterState.plannedEnd) {
      //  Get badge element
      let element: any = document.getElementById(
        'gantt-planned-end-filter-badge'
      );

      // check if element is not exit than create if exits than update
      if (!element) {
        element = document.createElement('span');
        element.classList.add('gantt-container__filter_badge');
        element.classList.add('gantt-container__filter_planned_end-date-badge');
        element.setAttribute('id', 'gantt-planned-end-filter-badge');
        element.appendChild(
          document.createTextNode(`${filterState.plannedEnd ? '1' : '0'}`)
        );
      } else {
        element.textContent = filterState.plannedEnd ? '1' : '0';
      }
      plannedEndFilterElement.appendChild(element);
    } else {
      const element: any = document.getElementById(
        'gantt-planned-end-filter-badge'
      );
      if (element) {
        element.parentNode.removeChild(element);
      }
    }
  }

  //  Filter Actual Start Date

  //  get actual start filter div element
  const actualStartFilterElement = document.getElementById(
    'gantt-container-filter-actual-start-date'
  );

  if (actualStartFilterElement) {
    // check if planned start date is selected or not
    if (filterState.actualStart) {
      //  Get badge element
      let element: any = document.getElementById(
        'gantt-actual-start-filter-badge'
      );

      // check if element is not exit than create if exits than update
      if (!element) {
        element = document.createElement('span');
        element.classList.add('gantt-container__filter_badge');
        element.classList.add(
          'gantt-container__filter_actual_start-date-badge'
        );
        element.setAttribute('id', 'gantt-actual-start-filter-badge');
        element.appendChild(
          document.createTextNode(`${filterState.actualStart ? '1' : '0'}`)
        );
      } else {
        element.textContent = filterState.actualStart ? '1' : '0';
      }
      actualStartFilterElement.appendChild(element);
    } else {
      const element: any = document.getElementById(
        'gantt-actual-start-filter-badge'
      );
      if (element) {
        element.parentNode.removeChild(element);
      }
    }
  }

  //  Filter Actual End Date

  //  get actual end filter div element
  const actualEndFilterElement = document.getElementById(
    'gantt-container-filter-actual-end-date'
  );

  if (actualEndFilterElement) {
    // check if actual end date is selected or not
    if (filterState.actualEnd) {
      //  Get badge element
      let element: any = document.getElementById(
        'gantt-actual-end-filter-badge'
      );

      // check if element is not exit than create if exits than update
      if (!element) {
        element = document.createElement('span');
        element.classList.add('gantt-container__filter_badge');
        element.classList.add('gantt-container__filter_actual_end-date-badge');
        element.setAttribute('id', 'gantt-actual-end-filter-badge');
        element.appendChild(
          document.createTextNode(`${filterState.actualEnd ? '1' : '0'}`)
        );
      } else {
        element.textContent = filterState.actualEnd ? '1' : '0';
      }
      actualEndFilterElement.appendChild(element);
    } else {
      const element: any = document.getElementById(
        'gantt-actual-end-filter-badge'
      );
      if (element) {
        element.parentNode.removeChild(element);
      }
    }
  }

  //  get activity name div element
  const activityNameFilterElement = document.getElementById(
    'gantt-container-filter-activity-name'
  );
  // check if filter is not selected than remove current badge.
  if (activityNameFilterElement) {
    if (filterState.text.length > 0) {
      //  Get badge element
      let element: any = document.getElementById(
        'gantt-activity-name-filter-badge'
      );
      // check if element is not exit than create if exits than update
      if (!element) {
        element = document.createElement('span');
        element.classList.add('gantt-container__filter_badge');
        element.setAttribute('id', 'gantt-activity-name-filter-badge');
        element.appendChild(document.createTextNode('1'));
      } else {
        element.textContent = filterState.text.length > 0 ? '1' : '0';
      }
      activityNameFilterElement.appendChild(element);
    } else {
      const element: any = document.getElementById(
        'gantt-activity-name-filter-badge'
      );
      if (element) {
        element.parentNode.removeChild(element);
      }
    }
  }
};

export const updateParentTaskRollUp = (task: any) => {
  if (!task || !task.parent) {
    return;
  }

  let parentTask = gantt.getTask(task.parent);

  while (parentTask) {
    const childTaskIds = gantt.getChildren(parentTask.id);

    if (childTaskIds.length === 0) {
      break;
    }

    const childTask = childTaskIds.map((id: any) => gantt.getTask(id));

    const allCompleted =
      childTask.length > 0
        ? childTask.every((task: any) => task.status === 'Complete')
        : false;

    const allToDo = childTask.every((task: any) => task.status === 'To-Do');

    const smallestPlannedStartDate = new Date(
      Math.min(
        ...childTask
          .map((task: any) =>
            new Date(task.plannedStartDate.replace(/-/g, '/')).getTime()
          )
          .filter((d: any) => !isNaN(d))
      )
    );

    const largestPlannedEndDate = new Date(
      Math.max(
        ...childTask
          .map((task: any) =>
            new Date(task.plannedEndDate.replace(/-/g, '/')).getTime()
          )
          .filter((d: any) => !isNaN(d))
      )
    );

    if (allToDo) {
      parentTask.status = 'To-Do';
      parentTask.actualStartDate = null;
      parentTask.actualEndDate = null;
      parentTask.actualDuration = null;
      parentTask.estimatedEndDate = null;
      parentTask.estimatedDuration = null;
      parentTask.plannedStartDate = transformDateToString(
        new Date(smallestPlannedStartDate)
      );
      parentTask.plannedEndDate = transformDateToString(
        new Date(largestPlannedEndDate)
      );
      parentTask.plannedDuration = gantt.calculateDuration({
        start_date: new Date(parentTask.plannedStartDate.replace(/-/g, '/')),
        end_date: moment
          .utc(new Date(parentTask.plannedEndDate.replace(/-/g, '/')))
          .add(1, 'd')
          .toDate(),
        parentTask,
      });
      parentTask.start_date = new Date(parentTask.plannedStartDate);
      parentTask.end_date = endDateIncreaseByOneDay(parentTask.plannedEndDate);
      parentTask.duration = parentTask.plannedDuration;

      parentTask.start_date.setHours(0);
      parentTask.start_date.setMinutes(0);
      parentTask.start_date.setSeconds(0);
      parentTask.end_date.setHours(0);
      parentTask.end_date.setMinutes(0);
      parentTask.end_date.setSeconds(0);

      parentTask = gantt.getTask(parentTask.parent);
      continue;
    }

    const smallestActualStartDate = new Date(
      Math.min(
        ...childTask
          .filter((task: any) => task.actualStartDate)
          .map((task: any) =>
            new Date(task.actualStartDate.replace(/-/g, '/')).getTime()
          )
          .filter((d: any) => !isNaN(d))
      )
    );
    const largestActualEndDate = new Date(
      Math.max(
        ...childTask
          .filter((task: any) => task.status == 'Complete')
          .map((task: any) =>
            new Date(task.actualEndDate.replace(/-/g, '/')).getTime()
          )
          .filter((d: any) => !isNaN(d))
      )
    );

    if (allCompleted) {
      parentTask.actualStartDate = transformDateToString(
        new Date(smallestActualStartDate)
      );

      parentTask.actualEndDate = transformDateToString(
        new Date(largestActualEndDate)
      );
      parentTask.actualDuration = gantt.calculateDuration({
        start_date: new Date(parentTask.actualStartDate.replace(/-/g, '/')),
        end_date: moment
          .utc(new Date(parentTask.actualEndDate.replace(/-/g, '/')))
          .add(1, 'd')
          .toDate(),
        parentTask,
      });
      parentTask.status = 'Complete';

      parentTask.start_date = new Date(parentTask.actualStartDate);
      parentTask.end_date = endDateIncreaseByOneDay(parentTask.actualEndDate);
      parentTask.duration = parentTask.actualDuration;
      parentTask.estimatedEndDate = null;
      parentTask.estimatedDuration = null;
      parentTask.start_date.setHours(0);
      parentTask.start_date.setMinutes(0);
      parentTask.start_date.setSeconds(0);
      parentTask.end_date.setHours(0);
      parentTask.end_date.setMinutes(0);
      parentTask.end_date.setSeconds(0);
      parentTask = gantt.getTask(parentTask.parent);
      continue;
    }

    if (!allCompleted && !allToDo) {
      if (
        new Date(parentTask.plannedEndDate).getTime() <
        largestPlannedEndDate.getTime()
      ) {
        parentTask.plannedEndDate = transformDateToString(
          largestPlannedEndDate
        );

        parentTask.plannedDuration = gantt.calculateDuration({
          start_date: new Date(parentTask.plannedStartDate.replace(/-/g, '/')),
          end_date: endDateIncreaseByOneDay(
            transformDateToString(largestPlannedEndDate)
          ),
          parentTask,
        });
      }
    }
    const largestEstimatedEndDate = new Date(
      Math.max(
        ...childTask
          .filter((task: any) => task.estimatedEndDate)
          .map((task: any) =>
            new Date(task.estimatedEndDate.replace(/-/g, '/')).getTime()
          )
          .filter((d: any) => !isNaN(d))
      )
    );

    parentTask.status = 'In-Progress';
    parentTask.actualStartDate = transformDateToString(
      new Date(smallestActualStartDate)
    );

    if (largestActualEndDate.toString() != 'Invalid Date') {
      if (largestActualEndDate.getTime() > largestPlannedEndDate.getTime()) {
        if (
          largestActualEndDate.getTime() > largestEstimatedEndDate.getTime()
        ) {
          parentTask.estimatedEndDate =
            transformDateToString(largestActualEndDate);
        } else {
          if (largestEstimatedEndDate.toString() != 'Invalid Date') {
            parentTask.estimatedEndDate = transformDateToString(
              largestEstimatedEndDate
            );
          } else {
            parentTask.estimatedEndDate =
              transformDateToString(largestActualEndDate);
          }
        }
      } else {
        const largestToDoTaskPlannedEndDate = new Date(
          Math.max(
            ...childTask
              .filter((task: any) => task.status == 'To-Do')
              .map((task: any) =>
                new Date(task.plannedEndDate.replace(/-/g, '/')).getTime()
              )
              .filter((d: any) => !isNaN(d))
          )
        );
        if (largestToDoTaskPlannedEndDate.toString() != 'Invalid Date') {
          if (largestEstimatedEndDate.toString() != 'Invalid Date') {
            if (
              largestToDoTaskPlannedEndDate.getTime() >
              largestEstimatedEndDate.getTime()
            ) {
              parentTask.estimatedEndDate = transformDateToString(
                largestToDoTaskPlannedEndDate
              );
            } else {
              parentTask.estimatedEndDate = transformDateToString(
                largestEstimatedEndDate
              );
            }
          } else {
            parentTask.estimatedEndDate = transformDateToString(
              largestToDoTaskPlannedEndDate
            );
          }
        } else {
          if (largestEstimatedEndDate.toString() != 'Invalid Date') {
            if (
              largestActualEndDate.getTime() > largestEstimatedEndDate.getTime()
            ) {
              parentTask.estimatedEndDate =
                transformDateToString(largestActualEndDate);
            } else {
              parentTask.estimatedEndDate = transformDateToString(
                largestEstimatedEndDate
              );
            }
          } else {
            parentTask.estimatedEndDate =
              transformDateToString(largestActualEndDate);
          }
        }
      }
    } else {
      const largestToDoTaskPlannedEndDate = new Date(
        Math.max(
          ...childTask
            .filter((task: any) => task.status == 'To-Do')
            .map((task: any) =>
              new Date(task.plannedEndDate.replace(/-/g, '/')).getTime()
            )
            .filter((d: any) => !isNaN(d))
        )
      );
      if (largestEstimatedEndDate.toString() != 'Invalid Date') {
        if (
          largestToDoTaskPlannedEndDate.getTime() >
          largestEstimatedEndDate.getTime()
        ) {
          parentTask.estimatedEndDate = transformDateToString(
            largestToDoTaskPlannedEndDate
          );
        } else {
          parentTask.estimatedEndDate = transformDateToString(
            largestEstimatedEndDate
          );
        }
      } else {
        parentTask.estimatedEndDate = transformDateToString(
          largestToDoTaskPlannedEndDate
        );
      }
    }

    parentTask.estimatedDuration = gantt.calculateDuration({
      start_date: new Date(parentTask.actualStartDate.replace(/-/g, '/')),
      end_date: moment
        .utc(new Date(parentTask.estimatedEndDate.replace(/-/g, '/')))
        .add(1, 'd')
        .toDate(),
      parentTask,
    });
    parentTask.actualEndDate = null;
    parentTask.actualDuration = null;

    const toDoTaskSmallestPlannedStartDate = new Date(
      Math.min(
        ...childTask
          .filter((task: any) => task.status == 'To-Do')
          .map((task: any) =>
            new Date(task.plannedStartDate.replace(/-/g, '/')).getTime()
          )
          .filter((d: any) => !isNaN(d))
      )
    );

    if (
      new Date(toDoTaskSmallestPlannedStartDate).getTime() <
      new Date(parentTask.actualStartDate).getTime()
    ) {
      parentTask.start_date = new Date(toDoTaskSmallestPlannedStartDate);
    } else {
      parentTask.start_date = new Date(parentTask.actualStartDate);
    }
    parentTask.end_date = endDateIncreaseByOneDay(parentTask.estimatedEndDate);
    parentTask.duration = parentTask.estimatedDuration;

    parentTask.start_date.setHours(0);
    parentTask.start_date.setMinutes(0);
    parentTask.start_date.setSeconds(0);
    parentTask.end_date.setHours(0);
    parentTask.end_date.setMinutes(0);
    parentTask.end_date.setSeconds(0);

    parentTask = gantt.getTask(parentTask.parent);
  }
  gantt.render();
};

export const getMaxExternalIdCount = (gantt: any) => {
  let maxIdCount = 0;

  const tempTask = gantt.getTaskByTime();

  tempTask.forEach((task: any) => {
    if (parseInt(task.externalId, 10)) {
      maxIdCount = Math.max(maxIdCount, task.externalId);
    }
  });

  return maxIdCount;
};
