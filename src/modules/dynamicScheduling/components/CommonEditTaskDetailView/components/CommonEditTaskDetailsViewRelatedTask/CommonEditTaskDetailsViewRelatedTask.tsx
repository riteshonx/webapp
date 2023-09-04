import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@material-ui/core';
import { TableContainer } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { GET_TASK_CONSTRAINTS_ORDER_BY_STATUS } from 'src/modules/dynamicScheduling/graphql/queries/lookahead';
import { GET_TASK_VARIANCES } from 'src/modules/dynamicScheduling/graphql/queries/weeklyplan';
import { priorityPermissionsByToken } from 'src/modules/dynamicScheduling/permission/scheduling';
import { client } from 'src/services/graphql';
import AccountTree from '../../../../../../assets/images/account_tree.svg';
import AccountTreeActive from '../../../../../../assets/images/account_tree_active.svg';
import AllInbox from '../../../../../../assets/images/all_inbox.svg';
import AllInboxActive from '../../../../../../assets/images/all_inbox_active.svg';
import AllInclusive from '../../../../../../assets/images/all_inclusive.svg';
import AllInclusiveActive from '../../../../../../assets/images/all_inclusive_active.svg';
import ConstraintsIcon from '../../../../../../assets/images/related-task-constraints.svg';
import EmptyRelatedTask from '../../../../../../assets/images/related-task-empty.svg';
import VarianceIcon from '../../../../../../assets/images/related-task-variance.svg';
import CommonEditProjectPlanContext from '../../../../context/commonEditProjectPlan/commonEditProjectPlanContext';
import './CommonEditTaskDetailsViewRelatedTask.scss';
const CommonEditTaskDetailsViewRelatedTask = (props: any) => {
  const [activeTab, setActiveTab] = useState('childTask');
  const commonEditProjectPlanContext = useContext(CommonEditProjectPlanContext);
  const { getRelatedTasks, relatedTasks, projectTokens, getChildTask } =
    commonEditProjectPlanContext;
  const { currentTask } = props;
  //   const authContext: any = useContext(stateContext);
  const [childTask, setChildTask] = useState([]);
  const [precedingTask, setPrecedingTask] = useState([]);
  const [succeedingTask, setSucceedingTask] = useState([]);

  useEffect(() => {
    getChildTasks(currentTask);

    getRelatedTasks(currentTask);
  }, [currentTask]);

  useEffect(() => {
    getPrecedingTasksConstraintVariance(relatedTasks.Preceding);
    getSucceedingTasksConstraintVariance(relatedTasks.Succeeding);
    // getAllSucceedingTask(currentTask.id);
  }, [relatedTasks]);

  const getChildTasks = async (currentTask: any) => {
    const tasks: any = [];
    const children = await getChildTask(currentTask);
    children.data.forEach(async (id: any, index: any) => {
      const task = children.data[index];
      let constraintVarianceValue = 0;
      if (task.status === 'To-Do') {
        constraintVarianceValue = await getConstraintsLengthByTaskId(task.id);
        tasks.push({
          ...task,
          constraintVarianceValue,
        });
        if (index === children.data.length - 1) {
          setChildTask(tasks);
        }
      } else {
        constraintVarianceValue = await getTaskVariancesLengthByTaskId(task.id);
        tasks.push({
          ...task,
          constraintVarianceValue,
        });
        if (index === children.data.length - 1) {
          setChildTask(tasks);
        }
      }
    });
  };

  const getPrecedingTasksConstraintVariance = (relatedTasks: any) => {
    if (!relatedTasks || relatedTasks.length == 0) {
      setPrecedingTask([]);
      return;
    }
    const tasks: any = [];
    // const target = gantt.getTask(id).$target;

    relatedTasks.forEach(async (element: any, index: any) => {
      // const link = gantt.getLink(id);
      // const task = gantt.getTask(link.source);
      const constraintVarianceValue = { constraint: 0, variance: 0 };
      // if (element.projectTask.status === 'To-Do') {
      if (element.projectTaskBySource.status === 'In-Progress') {
        constraintVarianceValue.variance = await getTaskVariancesLengthByTaskId(
          element.projectTask.id
        );
      }
      constraintVarianceValue.constraint = await getConstraintsLengthByTaskId(
        element.projectTaskBySource.id
      );
      // tasks.push({
      //   ...element,
      //   constraintVarianceValue,
      //   relationship: getRelationshipValue(element),
      // });
      // if (index === target.length - 1) {
      //   setPrecedingTask(tasks);
      // }
      // }

      tasks.push({
        ...element,
        constraintVarianceValue,
        relationship: getRelationshipValue(element),
      });

      if (index == relatedTasks.length - 1) {
        setPrecedingTask(tasks);
      }
    });
  };

  const getSucceedingTasksConstraintVariance = (relatedTasks: any) => {
    if (!relatedTasks || relatedTasks.length == 0) {
      setSucceedingTask([]);
      return;
    }
    const tasks: any = [];
    // const target = gantt.getTask(id).$target;

    relatedTasks.forEach(async (element: any, index: any) => {
      // const link = gantt.getLink(id);
      // const task = gantt.getTask(link.source);
      const constraintVarianceValue = { constraint: 0, variance: 0 };
      // if (element.projectTask.status === 'To-Do') {
      if (element.projectTask.status === 'In-Progress') {
        constraintVarianceValue.variance = await getTaskVariancesLengthByTaskId(
          element.projectTask.id
        );
      }
      constraintVarianceValue.constraint = await getConstraintsLengthByTaskId(
        element.projectTask.id
      );
      // tasks.push({
      //   ...element,
      //   constraintVarianceValue,
      //   relationship: getRelationshipValue(element),
      // });
      // if (index === target.length - 1) {
      //   setPrecedingTask(tasks);
      // }
      // }

      tasks.push({
        ...element,
        constraintVarianceValue,
        relationship: getRelationshipValue(element),
      });

      if (index == relatedTasks.length - 1) {
        setSucceedingTask(tasks);
      }
    });
  };
  const getTaskVariancesLengthByTaskId = async (id: any) => {
    try {
      //   authContext.dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: GET_TASK_VARIANCES,
        variables: {
          taskIds: [id],
        },
        context: {
          role: priorityPermissionsByToken(
            'view',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });
      //   authContext.dispatch(setIsLoading(false));
      return res.data.projectTaskVariance.length;
    } catch (err) {
      console.log('err: ', err);
      //   authContext.dispatch(setIsLoading(false));
      return 0;
    }
  };

  const getConstraintsLengthByTaskId = async (id: any) => {
    try {
      //   authContext.dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: GET_TASK_CONSTRAINTS_ORDER_BY_STATUS,
        variables: {
          taskIds: [id],
        },
        context: {
          role: priorityPermissionsByToken(
            'view',
            projectTokens[currentTask.projectId]
          ),
          token: projectTokens[currentTask.projectId],
        },
      });
      //   authContext.dispatch(setIsLoading(false));
      const constraintLength = res.data.projectTaskConstraints.length;
      return constraintLength;
    } catch (err) {
      console.log('err: ', err);
      //   authContext.dispatch(setIsLoading(false));
      return 0;
    }
  };

  const getRelationshipValue = (link: any) => {
    // { "finish_to_start":"0", "start_to_start":"1", "finish_to_finish":"2", "start_to_finish":"3" }

    switch (link.type) {
      case '0':
        return `Finish to Start${
          link.lag > 0 ? `+ ${link.lag}` : link.lag < 0 ? link.lag : ''
        } `;
      case '1':
        return `Start to Start${
          link.lag > 0 ? `+ ${link.lag}` : link.lag < 0 ? link.lag : ''
        }`;
      case '2':
        return `Finish to Finish${
          link.lag > 0 ? `+ ${link.lag}` : link.lag < 0 ? link.lag : ''
        }`;
      case '3':
        return `Start to Finish${
          link.lag > 0 ? `+ ${link.lag}` : link.lag < 0 ? link.lag : ''
        } `;
    }
  };
  return (
    <div style={{ display: 'flex' }}>
      <div className="common-edit-task-details-view-related-task__action-menu">
        {childTask.length > 0 && (
          <a
            href="#childTask"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('childTask');
              const element = document.getElementById('childTask');
              element?.scrollIntoView(true);
            }}
          >
            <img
              src={activeTab === 'childTask' ? AccountTreeActive : AccountTree}
              alt="task-tree"
              className={`common-edit-task-details-view-related-task__action-menu__task-tree   `}
            ></img>
          </a>
        )}
        {precedingTask.length > 0 && (
          <a
            href="#precedingTask"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('precedingTask');
              const element = document.getElementById('precedingTask');
              element?.scrollIntoView(true);
            }}
          >
            {' '}
            <img
              src={activeTab === 'precedingTask' ? AllInboxActive : AllInbox}
              alt="preceding-task"
              className={`common-edit-task-details-view-related-task__action-menu__preceding-task ${
                succeedingTask.length === 0
                  ? 'common-edit-task-details-view-related-task__action-menu__mb-13'
                  : ''
              }`}
            ></img>
          </a>
        )}
        {succeedingTask.length > 0 && (
          <a
            href="#succeedingTask"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('succeedingTask');
              // if (e.target.id) {
              const element = document.getElementById('succeedingTask');
              element?.scrollIntoView(true);
              // }
            }}
          >
            <img
              src={
                activeTab === 'succeedingTask'
                  ? AllInclusiveActive
                  : AllInclusive
              }
              alt="succeeding-task"
              className="common-edit-task-details-view-related-task__action-menu__succeeding-task"
            ></img>
          </a>
        )}
      </div>

      <div className="common-edit-task-details-view-related-task">
        {childTask.length === 0 &&
          precedingTask.length === 0 &&
          succeedingTask.length === 0 && (
            <div className="common-edit-task-details-view-related-task__empty">
              <img
                src={EmptyRelatedTask}
                alt="no related task"
                className="common-edit-task-details-view-related-task__empty-img"
              />
              <span className="common-edit-task-details-view-related-task__empty-text-1">
                Looks like your task does not have any buddies yet!
              </span>

              <span className="common-edit-task-details-view-related-task__empty-text-2">
                You can create links and add children to task from the gantt
                view
              </span>
            </div>
          )}

        {childTask.length > 0 && (
          <span
            className="common-edit-task-details-view-related-task-heading"
            id="childTask"
          >
            Child Tasks
          </span>
        )}

        {childTask.length > 0 && (
          <div className="common-edit-task-details-view-related-task__data">
            <TableContainer>
              <Table aria-labelledby="tableTitle" area-label="enhanced table">
                <TableHead>
                  <TableRow>
                    <TableCell className="common-edit-task-details-view-related-task__data__table-head-cell">
                      Name
                    </TableCell>
                    <TableCell className="common-edit-task-details-view-related-task__data__table-head-cell">
                      Status
                    </TableCell>
                    <TableCell className="common-edit-task-details-view-related-task__data__table-head-cell">
                      Blockers
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody className="common-edit-task-details-view-related-task__data__table-body">
                  {childTask.map((task: any) => {
                    return (
                      <TableRow
                        key={task.id}
                        className={`${
                          task.status === 'Complete'
                            ? 'common-edit-task-details-view-related-task__data__table-body__table-row-complete'
                            : ''
                        }`}
                      >
                        <TableCell className="common-edit-task-details-view-related-task__data__table-body__table-row__table-cell-name">
                          {task.text}
                        </TableCell>
                        <TableCell className="common-edit-task-details-view-related-task__data__table-body__table-row__table-cell-status">
                          {task.status === 'Complete' ? (
                            <span className="common-edit-task-details-view-related-task__data__table-body__table-row__table-cell-status-complete">
                              Completed
                            </span>
                          ) : (
                            task.status
                          )}
                        </TableCell>
                        <TableCell className="common-edit-task-details-view-related-task__data__table-body__table-row__table-cell-blockers">
                          <div className="common-edit-task-details-view-related-task__data__table-body__table-row__table-cell__align-center">
                            {task.status === 'To-Do' ? (
                              <img
                                className="common-edit-task-details-view-related-task__data__table-body__icon"
                                src={ConstraintsIcon}
                                alt="constraint"
                              ></img>
                            ) : task.status === 'In-Progress' ? (
                              <img
                                className="common-edit-task-details-view-related-task__data__table-body__icon"
                                src={VarianceIcon}
                                alt="variance"
                              ></img>
                            ) : (
                              ''
                            )}

                            <span>
                              {task.status === 'To-Do'
                                ? `${task.constraintVarianceValue} Constraints`
                                : task.status === 'In-Progress'
                                ? `${task.constraintVarianceValue} Variances`
                                : ''}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}

        {precedingTask.length > 0 && (
          <span
            className="common-edit-task-details-view-related-task-heading"
            id="precedingTask"
          >
            Preceding Tasks
          </span>
        )}

        {precedingTask.length > 0 && (
          <div className="common-edit-task-details-view-related-task__data">
            <TableContainer>
              <Table aria-labelledby="tableTitle" area-label="enhanced table">
                <TableHead>
                  <TableRow>
                    <TableCell className="common-edit-task-details-view-related-task__data__table-head-cell">
                      Name
                    </TableCell>
                    <TableCell className="common-edit-task-details-view-related-task__data__table-head-cell">
                      Status
                    </TableCell>
                    <TableCell className="common-edit-task-details-view-related-task__data__table-head-cell">
                      Relationship
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody className="common-edit-task-details-view-related-task__data__table-body">
                  {precedingTask.map((task: any) => {
                    return (
                      <TableRow
                        key={task.projectTaskBySource.id}
                        className={`${
                          task.projectTaskBySource.status === 'Complete'
                            ? 'common-edit-task-details-view-related-task__data__table-body__table-row-complete'
                            : ''
                        }`}
                      >
                        <TableCell className="common-edit-task-details-view-related-task__data__table-body__table-row__table-cell-name">
                          {task.projectTaskBySource.taskName}
                        </TableCell>
                        <TableCell className="common-edit-task-details-view-related-task__data__table-body__table-row__table-cell-status">
                          <div className="common-edit-task-details-view-related-task__data__table-body__table-row__table-cell__align-center">
                            {task.projectTaskBySource.status === 'To-Do' &&
                            task.constraintVarianceValue.constraint > 0 ? (
                              <img
                                className="common-edit-task-details-view-related-task__data__table-body__icon"
                                src={ConstraintsIcon}
                                alt="constraint"
                              ></img>
                            ) : task.projectTaskBySource.status ===
                                'In-Progress' &&
                              task.constraintVarianceValue.variance > 0 ? (
                              <img
                                className="common-edit-task-details-view-related-task__data__table-body__icon"
                                src={VarianceIcon}
                                alt="variance"
                              ></img>
                            ) : (
                              ''
                            )}
                            {task.projectTaskBySource.status === 'Complete' ? (
                              <span className="common-edit-task-details-view-related-task__data__table-body__table-row__table-cell-status-complete">
                                Completed
                              </span>
                            ) : (
                              ''
                            )}
                            <span>
                              {task.projectTaskBySource.status === 'To-Do'
                                ? `To-Do ${
                                    task.constraintVarianceValue.constraint > 0
                                      ? 'with Constraints'
                                      : ''
                                  } `
                                : task.projectTaskBySource.status ===
                                  'In-Progress'
                                ? `In-Progress ${
                                    task.constraintVarianceValue.constraint >
                                      0 &&
                                    task.constraintVarianceValue.variance > 0
                                      ? 'with Constraints, Variance'
                                      : task.constraintVarianceValue
                                          .constraint > 0
                                      ? 'with Constraints'
                                      : task.constraintVarianceValue.variance >
                                        0
                                      ? 'with Variance'
                                      : ''
                                  } `
                                : ''}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="common-edit-task-details-view-related-task__data__table-body__table-row__table-cell-blockers">
                          {task.relationship}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}

        {succeedingTask.length > 0 && (
          <span
            className="common-edit-task-details-view-related-task-heading"
            id="succeedingTask"
          >
            Succeeding Tasks
          </span>
        )}

        {succeedingTask.length > 0 && (
          <div className="common-edit-task-details-view-related-task__data">
            <TableContainer>
              <Table aria-labelledby="tableTitle" area-label="enhanced table">
                <TableHead>
                  <TableRow>
                    <TableCell className="common-edit-task-details-view-related-task__data__table-head-cell">
                      Name
                    </TableCell>
                    <TableCell className="common-edit-task-details-view-related-task__data__table-head-cell">
                      Status
                    </TableCell>
                    <TableCell className="common-edit-task-details-view-related-task__data__table-head-cell">
                      Relationship
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody className="common-edit-task-details-view-related-task__data__table-body">
                  {succeedingTask.map((task: any) => (
                    <TableRow
                      key={task.id}
                      className={`${
                        task.projectTask.status === 'Complete'
                          ? 'common-edit-task-details-view-related-task__data__table-body__table-row-complete'
                          : ''
                      }`}
                    >
                      <TableCell className="common-edit-task-details-view-related-task__data__table-body__table-row__table-cell-name">
                        {task.projectTask.taskName}
                      </TableCell>
                      <TableCell className="common-edit-task-details-view-related-task__data__table-body__table-row__table-cell-status">
                        <div className="common-edit-task-details-view-related-task__data__table-body__table-row__table-cell__align-center">
                          {task.projectTask.status === 'To-Do' &&
                          task.constraintVarianceValue > 0 ? (
                            <img
                              className="common-edit-task-details-view-related-task__data__table-body__icon"
                              src={ConstraintsIcon}
                              alt="constraint"
                            ></img>
                          ) : task.projectTask.status === 'In-Progress' &&
                            task.constraintVarianceValue > 0 ? (
                            <img
                              className="common-edit-task-details-view-related-task__data__table-body__icon"
                              src={VarianceIcon}
                              alt="variance"
                            ></img>
                          ) : (
                            ''
                          )}
                          {task.projectTask.status === 'Complete' ? (
                            <span className="common-edit-task-details-view-related-task__data__table-body__table-row__table-cell-status-complete">
                              Completed
                            </span>
                          ) : (
                            ''
                          )}
                          <span>
                            {task.projectTask.status === 'To-Do'
                              ? `To-Do ${
                                  task.constraintVarianceValue.constraint > 0
                                    ? 'with Constraints'
                                    : ''
                                } `
                              : task.projectTask.status === 'In-Progress'
                              ? `In-Progress ${
                                  task.constraintVarianceValue.constraint > 0 &&
                                  task.constraintVarianceValue.variance > 0
                                    ? 'with Constraints, Variance'
                                    : task.constraintVarianceValue.constraint >
                                      0
                                    ? 'with Constraints'
                                    : task.constraintVarianceValue.variance > 0
                                    ? 'with Variance'
                                    : ''
                                } `
                              : ''}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="common-edit-task-details-view-related-task__data__table-body__table-row__table-cell-blockers">
                        {task.relationship}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}
        <div></div>
      </div>
    </div>
  );
};

export default CommonEditTaskDetailsViewRelatedTask;
