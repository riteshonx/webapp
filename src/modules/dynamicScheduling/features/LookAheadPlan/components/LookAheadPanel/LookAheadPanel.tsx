import DateFnsUtils from '@date-io/date-fns';
import {
  Button,
  Collapse,
  FormControl,
  Grid,
  IconButton,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import EditIcon from '@material-ui/icons/Edit';
import PlaylistPlayIcon from '@material-ui/icons/PlaylistPlay';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { ClickAwayListener } from '@mui/material';
import { gantt } from 'dhtmlx-gantt';
import moment from 'moment';
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import GlobalKeyboardDatePicker from 'src/modules/shared/components/GlobalDatePicker/GlobalKeyboardDatePicker';
import ShowComponent from 'src/modules/shared/utils/ShowComponent';
import { Order } from 'src/utils/helper';
import { decodeToken } from '../../../../../../services/authservice';
import { client } from '../../../../../../services/graphql';
import { projectFeatureAllowedRoles } from '../../../../../../utils/role';
import { setIsLoading } from '../../../../../root/context/authentication/action';
import { stateContext } from '../../../../../root/context/authentication/authContext';
import { CustomPopOver } from '../../../../../shared/utils/CustomPopOver';
import ProjectPlanContext from '../../../../context/projectPlan/projectPlanContext';
import { LOAD_CONFIGURATION_LIST_VALUES } from '../../../../graphql/queries/customList';
import {
  CREATE_TASK_CONSTRAINTS,
  GET_TASK_CONSTRAINTS,
  UPDATE_TASK_CONSTRAINTS,
} from '../../../../graphql/queries/lookahead';
import {
  canChangeStatus,
  canEditConstraint,
  permissionKeys,
  priorityPermissions,
} from '../../../../permission/scheduling';
import { AssigneeInput } from '../../../ProjectPlan/components/AddConstraint/AddConstraint';
import './LookAheadPanel.scss';
import { ConstraintType, EnhancedTableHead, getComparator } from './TableUtils';

function LookAheadPanel(props: any): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [constraintList, setConstraintList] = useState<Array<any>>([]);

  const [closeConstraintList, setCloseConstraintList] = useState<Array<any>>(
    []
  );
  const [lookAheadTasks, setLookAheadTasks] = useState<any>([]);

  const { state, dispatch }: any = useContext(stateContext);
  const [currentTab, setCurrentTab] = useState('OPEN');

  const [isAddOrEditModeOn, setIsAddOrEditModeOn] = useState(false);
  const projectPlanContext = useContext(ProjectPlanContext);

  const {
    currentLookaheadWeek,
    lookAheadStatus,
    lookAheadAction,
    projectUser,
    tenantCompanyList,
  } = projectPlanContext;

  const [categories, setCategories] = useState<Array<any>>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const [order, setOrder] = React.useState<{ [key: string]: Order }>({
    open: 'asc',
    closed: 'asc',
  });
  const [orderBy, setOrderBy] = React.useState<{ [key: string]: string }>({
    open: 'dueDate',
    closed: 'dueDate',
  });

  useEffect(() => {
    if (gantt && isOpen) {
      resetAddEditForm();
      setIsAddOrEditModeOn(false);
      setConstraintList([]);
      setCloseConstraintList([]);

      if (props?.activeLookAheadView == 'week') {
        let targetDate = new Date();

        if (checkProjectStartInFuture()) {
          targetDate = new Date(getProjectTask()[0].start_date);
        }
        const lookaheadStartDate = gantt.date.week_start(
          new Date(
            new Date().setDate(targetDate.getDate() + currentLookaheadWeek * 7)
          )
        );
        const lookaheadEndDate = gantt.date.add(
          gantt.date.week_start(lookaheadStartDate),
          7,
          'day'
        );

        const taskList = gantt.getTaskByTime(
          lookaheadStartDate,
          lookaheadEndDate
        );

        setLookAheadTasks(getTaskList(taskList));

        fetchProjectTaskConstraint(taskList.map((item: any) => item.id));
      }
      if (props?.activeLookAheadView == 'default') {
        setLookAheadTasks(getTaskList(gantt.getTaskByTime()));

        fetchProjectTaskConstraint(
          gantt.getTaskByTime().map((item: any) => item.id)
        );
      }
    }
  }, [isOpen, currentLookaheadWeek]);

  useEffect(() => {
    if (props?.activeLookAheadView == 'default') {
      const taskList = gantt.getTaskByTime();
      setLookAheadTasks(getTaskList(taskList));

      fetchProjectTaskConstraint(taskList.map((item: any) => item.id));
    }
  }, [props?.activeLookAheadView]);

  useEffect(() => {
    if (lookAheadStatus) {
      let taskList = gantt.getTaskByTime();
      taskList = getTaskList(taskList);
      setLookAheadTasks(taskList);

      fetchProjectTaskConstraint(
        gantt.getTaskByTime().map((item: any) => item.id)
      );
    }
  }, [lookAheadStatus]);

  useEffect(() => {
    if (constraintList && constraintList.length) {
      setContarintTaskColor([...constraintList]);
    }
  }, [constraintList]);

  useEffect(() => {
    if (lookAheadAction) {
      if (lookAheadAction.isInsert) {
        constraintList.push({
          id: lookAheadAction.taskId,
          name: lookAheadAction.constraintName,
          category: lookAheadAction.category,
          task: gantt.getTask(lookAheadAction.taskId)?.text,
          taskId: lookAheadAction.taskId,
          status: 'open',
          assignedTo: getTaskAssignedId(lookAheadAction),
        });
        setContarintTaskColor([...constraintList]);
      }
      if (lookAheadAction.isDelete) {
        const newConstraintList = constraintList.filter(
          (cT) => cT.taskId !== lookAheadAction.taskId
        );
        setContarintTaskColor([...newConstraintList]);
      }
    }
  }, [lookAheadAction]);

  useEffect(() => {
    fetchCustomListBasedOnName();
  }, []);

  const fetchCustomListBasedOnName = async () => {
    try {
      dispatch(setIsLoading(true));

      const response: any = await client.query({
        query: LOAD_CONFIGURATION_LIST_VALUES,
        variables: {
          name: `${'Constraint Category'}`,
        },
        fetchPolicy: 'network-only',
        context: {
          role: projectFeatureAllowedRoles.viewMasterPlan,
          token: state?.selectedProjectToken,
        },
      });
      if (response.data.configurationLists.length > 0) {
        const constraintCategory = response.data.configurationLists[0];

        const projectCategoryList =
          response.data.configurationLists[0].projectConfigAssociations;
        const constraintList: any = [];

        constraintCategory.configurationValues.forEach((item: any) => {
          if (projectCategoryList && projectCategoryList.length) {
            const listAssociationIndex = projectCategoryList.findIndex(
              (configId: any) => configId.configValueId === item.id
            );
            if (listAssociationIndex !== -1) {
              const constraintObj: any = {};

              if (item.nodeName.toLowerCase() !== 'form') {
                constraintObj.value = item.nodeName;
                constraintList.push(constraintObj);
              }
            }
          } else {
            const constraintObj: any = {};

            if (item.nodeName.toLowerCase() !== 'form') {
              constraintObj.value = item.nodeName;
              constraintList.push(constraintObj);
            }
          }
        });
        setCategories(constraintList);
      } else {
        setCategories([]);
      }
      dispatch(setIsLoading(false));
    } catch (error: any) {
      console.log(error.message);
      dispatch(setIsLoading(false));
    }
  };
  const getProjectTask = () => {
    return gantt.getTaskByTime().filter((task) => task.parent === 0);
  };

  const checkProjectStartInFuture = () => {
    return (
      gantt.date.week_start(getProjectTask()[0].start_date) >=
      gantt.date.week_start(new Date())
    );
  };

  const getTaskAssignedId = (targetConstraint: any) => {
    return lookAheadTasks.filter(
      (lat: any) => lat.id == targetConstraint.taskId
    )[0]?.assignedTo;
  };

  const getTaskList = (taskList: any) => {
    if (state?.projectFeaturePermissons?.cancreateMasterPlan) {
      taskList = taskList.filter(
        (item: any) =>
          (item.type == 'task' || item.type == 'work_package') &&
          item.status == 'To-Do'
      );
    } else {
      taskList = taskList.filter(
        (item: any) =>
          (item.type == 'task' || item.type == 'work_package') &&
          item.status == 'To-Do' &&
          item.assignedTo == decodeToken().userId
      );
    }
    return taskList;
  };

  const fetchProjectTaskConstraint = async (taskIds: Array<string>) => {
    try {
      setConstraintList([]);
      setCloseConstraintList([]);
      setIsDataLoading(true);

      const responseData = await client.query({
        query: GET_TASK_CONSTRAINTS,
        variables: {
          taskIds,
        },
        fetchPolicy: 'network-only',
        context: {
          role: priorityPermissions('view'),
          token: state.selectedProjectToken,
        },
      });
      if (responseData.data.projectTaskConstraints.length > 0) {
        const taskList: Array<any> = [];
        const closedTaskConstraintList: Array<any> = [];

        responseData.data.projectTaskConstraints.forEach((item: any) => {
          const assignee = item.companyAssignee || item.userAssignee || '';

          const newItem = {
            id: item.id,
            name: item.constraintName,
            category: item.category,
            task: item.projectTask.taskName,
            taskId: item.taskId,
            status: item.status,
            desc: item.description,
            dueDate: moment(item.dueDate).format('DD-MMM-YY'),
            assignedTo: item.projectTask.assignedTo,
            assignee,
            assigneeName: '',
          };
          const assigneeObj =
            assignee in projectUser
              ? projectUser[assignee]
              : assignee in tenantCompanyList
              ? tenantCompanyList[assignee]
              : {};
          const assigneeName =
            assigneeObj.flag === 'user'
              ? `${assigneeObj.firstName} ${assigneeObj.lastName}`
              : assigneeObj.flag === 'company'
              ? assigneeObj.name
              : '';
          newItem.assigneeName = assigneeName;

          if (newItem.status === 'open') taskList.push(newItem);
          else closedTaskConstraintList.push(newItem);
        });
        gantt.render();
        setConstraintList(taskList);
        setCloseConstraintList(closedTaskConstraintList);
      }
      setIsDataLoading(false);
    } catch (error: any) {
      setIsDataLoading(false);
      console.log(error.message);
    }
  };

  const setContarintTaskColor = (data: any) => {
    gantt.templates.task_class = function (start, end, task) {
      const css = [];

      const isTaskHasContraint = data.filter(
        (item: any) => item.taskId == task.id
      );
      if (isTaskHasContraint && isTaskHasContraint.length) {
        css.push('lookAhead-constraint-colored');
      }
      if (task.type === gantt.config.types.milestone) {
        css.push('milestone_black');
      }
      if (task.parent === 0) {
        return 'top_level_project_task';
      }
      if (task.type != gantt.config.types.project && gantt.hasChild(task.id)) {
        return 'summary';
      }
      return css.join(' ');
    };
    gantt.render();
  };

  const addNewConstraint = () => {
    setIsAddOrEditModeOn(true);
  };

  const changeStatus = async (argItem: any) => {
    try {
      const currentValue = constraintList.find(
        (item: any) => item.id === argItem.id
      );
      const currentIndex = constraintList.indexOf(currentValue);
      if (currentIndex > -1) {
        constraintList[currentIndex].status =
          constraintList[currentIndex].status === 'open' ? 'closed' : 'open';
        setConstraintList([...constraintList]);

        await client.mutate({
          mutation: UPDATE_TASK_CONSTRAINTS,
          variables: {
            _set: {
              status: constraintList[currentIndex].status,
            },
            id: constraintList[currentIndex].id,
          },
          context: {
            role: priorityPermissions('update'),
            token: state.selectedProjectToken,
          },
        });
        closeConstraintList.push(constraintList[currentIndex]);
        setCloseConstraintList([...closeConstraintList]);
        constraintList.splice(currentIndex, 1);
        setConstraintList([...constraintList]);
        //fetchProjectTaskConstraint(lookAheadTasks.map((item: any)=>item.id));
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const getAssigneeObject = (
    id: string,
    name: string,
    type: 'user' | 'company' | ''
  ) => {
    const result = {
      asObj: { companyAssignee: null, userAssignee: null },
      assigneeName: '',
    };
    const key = `${type}Assignee`;
    if (!!type)
      return {
        ...result,
        asObj: { ...result.asObj, [key]: id },
        assigneeName: name,
      };
    return result;
  };

  const saveChanges = async (item: ConstraintType) => {
    try {
      setIsAddOrEditModeOn(false);
      const { category, name, taskId, desc, dueDate, assignee } = item;
      const assigneeObj =
        assignee in projectUser
          ? projectUser[assignee]
          : assignee in tenantCompanyList
          ? tenantCompanyList[assignee]
          : {};
      const { asObj, assigneeName } =
        assigneeObj.flag === 'user'
          ? getAssigneeObject(
              assignee,
              `${assigneeObj.firstName} ${assigneeObj.lastName}`,
              'user'
            )
          : assigneeObj.flag === 'company'
          ? getAssigneeObject(assignee, assigneeObj.name, 'company')
          : getAssigneeObject(assignee, '', '');
      const task = lookAheadTasks.find(
        (lookAheadTask: any) => lookAheadTask.id === taskId
      )?.text;
      if (!('id' in item)) {
        const data = await client.mutate({
          mutation: CREATE_TASK_CONSTRAINTS,
          variables: {
            object: {
              category,
              constraintName: name?.trim(),
              taskId,
              dueDate,
              description: desc,
              ...asObj,
            },
          },
          context: {
            role: priorityPermissions('create'),
            token: state.selectedProjectToken,
          },
        });
        if (data.data.insert_projectTaskConstraints_one.id) {
          setConstraintList((prev) => {
            return [
              ...prev,
              {
                id: data.data.insert_projectTaskConstraints_one.id,
                category,
                name: name.trim(),
                taskId,
                task,
                status: 'open',
                assignee,
                assigneeName,
                desc,
                assignedTo: getTaskAssignedId(item),
                dueDate: moment(dueDate).format('DD-MMM-YY'),
              },
            ];
          });
        }
      } else {
        await client.mutate({
          mutation: UPDATE_TASK_CONSTRAINTS,
          variables: {
            _set: {
              category: category,
              constraintName: name?.trim(),
              taskId: taskId,
              dueDate,
              description: desc,
              status: item.status,
              ...asObj,
            },
            id: item.id,
          },
          context: {
            role: priorityPermissions('update'),
            token: state.selectedProjectToken,
          },
        });
        setConstraintList((prev) => {
          const foundIdx = prev.findIndex(({ id }) => id === item.id);
          return [
            ...prev.slice(0, foundIdx),
            {
              ...prev[foundIdx],
              name,
              category,
              taskId,
              task,
              assignee,
              assigneeName,
              desc,
              assignedTo: getTaskAssignedId(item),
              dueDate: moment(dueDate).format('DD-MMM-YY'),
            },
            ...prev.slice(foundIdx + 1),
          ];
        });
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const resetAddEditForm = () => {
    setIsAddOrEditModeOn(false);
  };

  const changeCloseToOpen = async (argItem: any) => {
    const currentValue = closeConstraintList.find(
      (item: any) => item.id === argItem.id
    );
    const currentIndex = closeConstraintList.indexOf(currentValue);
    if (currentIndex > -1) {
      closeConstraintList[currentIndex].status =
        closeConstraintList[currentIndex].status === 'closed'
          ? 'open'
          : 'closed';
      setCloseConstraintList([...closeConstraintList]);
      await client.mutate({
        mutation: UPDATE_TASK_CONSTRAINTS,
        variables: {
          _set: {
            status: closeConstraintList[currentIndex].status,
          },
          id: closeConstraintList[currentIndex].id,
        },
        context: {
          role: priorityPermissions('update'),
          token: state.selectedProjectToken,
        },
      });
      constraintList.push(closeConstraintList[currentIndex]);
      setConstraintList([...constraintList]);
      closeConstraintList.splice(currentIndex, 1);
      setCloseConstraintList([...closeConstraintList]);
      //fetchProjectTaskConstraint(lookAheadTasks.map((item: any)=>item.id));
    }
  };

  const canResolveChangeStatus = (constraint: any) => {
    if (
      constraint?.status === 'closed' &&
      gantt.getTask(constraint?.taskId)?.status !== 'To-Do'
    )
      return false;
    const permission = permissionKeys(constraint?.assignedTo);
    if (permission.create) return true;
    else if (permission.view) return false;
  };

  const canAddConstraint = () => {
    return (
      state?.projectFeaturePermissons?.cancreateMasterPlan ||
      state?.projectFeaturePermissons?.cancreateComponentPlan
    );
  };
  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: string,
    status: 'open' | 'closed'
  ) => {
    const isAsc = orderBy[status] === property && order[status] === 'asc';

    setOrder((prev) => ({ ...prev, [status]: isAsc ? 'desc' : 'asc' }));
    setOrderBy((prev) => ({ ...prev, [status]: property }));
  };
  return (
    <ClickAwayListener onClickAway={() => setIsOpen(false)}>
      <div className={`LookAheadPanel ${isOpen ? ' open' : ' close'}`}>
        {!isOpen && (
          <div className="LookAheadPanel__left" onClick={() => setIsOpen(true)}>
            <div className={`LookAheadPanel__left__tab`}>
              <div className="LookAheadPanel__left__tab__title">
                Constraints Log
              </div>
              <div className="LookAheadPanel__left__tab__down"></div>
            </div>
          </div>
        )}
        {isOpen && (
          <div className="LookAheadPanel__right">
            <div className="LookAheadPanel__right__header">
              <PlaylistPlayIcon />
              Contraints Log
            </div>
            <div className="LookAheadPanel__right__action">
              <div className="LookAheadPanel__right__action__left">
                <div
                  onClick={() => setCurrentTab('OPEN')}
                  className={`LookAheadPanel__right__action__left__tab ${
                    currentTab === 'OPEN' ? ' active' : 'nonactive'
                  }`}
                >
                  Open
                </div>
                <div
                  onClick={() => setCurrentTab('CLOSE')}
                  className={`LookAheadPanel__right__action__left__tab ${
                    currentTab === 'CLOSE' ? ' active' : 'nonactive'
                  }`}
                >
                  Resolved
                </div>
              </div>
              <div className="LookAheadPanel__right__action__right">
                {!isAddOrEditModeOn &&
                lookAheadTasks.length &&
                currentTab === 'OPEN' &&
                canAddConstraint() ? (
                  <Button
                    variant="outlined"
                    data-testid={`add-constraint`}
                    className="btn-primary"
                    onClick={addNewConstraint}
                    size="small"
                  >
                    Add Constraint
                  </Button>
                ) : (
                  ''
                )}
              </div>
            </div>
            {currentTab === 'OPEN' ? (
              <div className="LookAheadPanel__right__body">
                <Collapse
                  in={isAddOrEditModeOn}
                  unmountOnExit
                  timeout="auto"
                  style={{ overflow: 'auto', padding: '0 5px 0px 15px' }}
                  classes={{
                    entered: 'LookAheadPanel__collapse__entered',
                  }}
                >
                  <AddOrEditConstraint
                    categories={categories}
                    item={{}}
                    lookAheadTasks={lookAheadTasks}
                    onCancel={() => setIsAddOrEditModeOn(false)}
                    onSave={saveChanges}
                  />
                  ;
                </Collapse>
                {constraintList.length ? (
                  <TableContainer
                    component={Paper}
                    style={{ boxShadow: '0px -2px 3px rgb(0 0 0 / 12%)' }}
                  >
                    <Table aria-label="sticky table" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell style={{ padding: '15px' }} />
                          <EnhancedTableHead
                            order={order.open}
                            orderBy={orderBy.open}
                            onRequestSort={(e, prop) =>
                              handleRequestSort(e, prop, 'open')
                            }
                          />
                          <TableCell style={{ padding: '15px' }}>
                            <Typography variant="body2" noWrap>
                              Description
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {constraintList
                          .sort(getComparator(order.open, orderBy.open))
                          .map((item) => (
                            <ConstraintRow
                              key={item.id}
                              item={item}
                              categories={categories}
                              lookAheadTasks={lookAheadTasks}
                              handleSave={saveChanges}
                              statusChild={
                                <React.Fragment>
                                  {!isAddOrEditModeOn &&
                                  canChangeStatus(item) ? (
                                    item.status == 'open' ? (
                                      <div
                                        onClick={() => changeStatus(item)}
                                        className="LookAheadPanel__right__body__content__item__status__uncheck"
                                      ></div>
                                    ) : (
                                      <CheckCircleIcon
                                        onClick={() => changeStatus(item)}
                                        className="LookAheadPanel__right__body__content__item__status__check"
                                      />
                                    )
                                  ) : (
                                    ''
                                  )}
                                </React.Fragment>
                              }
                            />
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : !isDataLoading ? (
                  <div className="LookAheadPanel__right__body__nodata">
                    No open constraint log found
                  </div>
                ) : (
                  <div className="LookAheadPanel__right__body__nodata">
                    fetching open constraints ...
                  </div>
                )}
              </div>
            ) : (
              <div className="LookAheadPanel__right__body">
                {closeConstraintList.length ? (
                  <TableContainer component={Paper}>
                    <Table aria-label="collapsible table" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell />
                          <EnhancedTableHead
                            order={order.closed}
                            orderBy={orderBy.closed}
                            onRequestSort={(e, prop) =>
                              handleRequestSort(e, prop, 'closed')
                            }
                          />
                          <TableCell>
                            <Typography variant="body2" noWrap>
                              Description
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {closeConstraintList
                          .sort(getComparator(order.closed, orderBy.closed))
                          .map((item) => (
                            <ConstraintRow
                              key={item.id}
                              item={item}
                              categories={categories}
                              lookAheadTasks={lookAheadTasks}
                              handleSave={saveChanges}
                              statusChild={
                                <React.Fragment>
                                  {item.status == 'open' &&
                                  !isAddOrEditModeOn ? (
                                    <div
                                      onClick={() => changeCloseToOpen(item)}
                                      className="LookAheadPanel__right__body__content__item__status__uncheck"
                                    ></div>
                                  ) : (
                                    canResolveChangeStatus(item) && (
                                      <CheckCircleIcon
                                        onClick={() => changeCloseToOpen(item)}
                                        className="LookAheadPanel__right__body__content__item__status__check"
                                      />
                                    )
                                  )}
                                </React.Fragment>
                              }
                            />
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : !isDataLoading ? (
                  <div className="LookAheadPanel__right__body__nodata">
                    No resloved constraint log found.
                  </div>
                ) : (
                  <div className="LookAheadPanel__right__body__nodata">
                    fetching resolved constraints ...
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </ClickAwayListener>
  );
}
interface Props {
  [key: string]: any;
}
const ConstraintRow = ({ item, ...rest }: Props) => {
  const { categories, lookAheadTasks, handleSave, statusChild } = rest;
  const [open, setOpen] = React.useState(false);
  const [isEdit, setEdit] = React.useState(false);
  const { name, category, desc, dueDate, task, assigneeName } = item;
  return (
    <React.Fragment>
      <TableRow>
        <TableCell style={{ padding: '15px' }}>{statusChild}</TableCell>
        <TableCell className="LookAheadPanel__right__body__tableData">
          <Tooltip title={name}>
            <Typography variant="body2" noWrap>
              {name}
            </Typography>
          </Tooltip>
        </TableCell>

        <TableCell className="LookAheadPanel__right__body__tableData">
          <Tooltip title={category}>
            <Typography variant="body2" noWrap>
              {category}
            </Typography>
          </Tooltip>
        </TableCell>

        <TableCell className="LookAheadPanel__right__body__tableData">
          <Tooltip title={task}>
            <Typography variant="body2" noWrap>
              {task}
            </Typography>
          </Tooltip>
        </TableCell>

        <TableCell className="LookAheadPanel__right__body__tableData">
          <Tooltip title={assigneeName}>
            <Typography variant="body2" noWrap>
              {assigneeName}
            </Typography>
          </Tooltip>
        </TableCell>

        <TableCell
          align="right"
          className="LookAheadPanel__right__body__tableData"
        >
          <Typography variant="body2" noWrap>
            {dueDate}
          </Typography>
        </TableCell>
        <TableCell align="center" style={{ padding: '15px' }}>
          <IconButton
            aria-label="expand row"
            size="medium"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ padding: '0 5px 0px 15px' }} colSpan={8}>
          <Collapse
            in={open}
            timeout="auto"
            unmountOnExit
            style={{ overflow: 'auto' }}
          >
            <ShowComponent showState={isEdit}>
              <AddOrEditConstraint
                categories={categories}
                lookAheadTasks={lookAheadTasks}
                onCancel={() => setEdit(false)}
                item={{ ...item, assigneeName }}
                onSave={(data: ConstraintType) => {
                  handleSave(data);
                  setEdit(false);
                  setOpen(false);
                }}
              />
            </ShowComponent>
            <ShowComponent showState={!isEdit}>
              <Grid
                direction="column"
                container
                style={{
                  rowGap: '10px',
                  margin: '10px 0',
                  paddingRight: '8px',
                }}
              >
                <Typography variant="caption">Description</Typography>
                <TextField
                  multiline
                  rows={3}
                  value={desc}
                  variant="outlined"
                  aria-readonly="true"
                  InputProps={{
                    readOnly: true,
                    contentEditable: false,
                    disabled: true,
                  }}
                  className="LookAheadPanel__right__body__content__item__input"
                />
                <ShowComponent showState={item.status === 'open'}>
                  <Grid item container justify="flex-end">
                    <Button
                      startIcon={<EditIcon />}
                      className="btn-primary"
                      size="small"
                      onClick={() => setEdit(true)}
                      disabled={!canEditConstraint(item)}
                    >
                      Edit
                    </Button>
                  </Grid>
                </ShowComponent>
              </Grid>
            </ShowComponent>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

const AddOrEditConstraint = ({
  categories,
  lookAheadTasks,
  onCancel,
  onSave,
  item,
}: Props) => {
  const { cacheTasks } = React.useContext(ProjectPlanContext);
  const [formValues, setFormValues] = React.useState(() => {
    const { name, category, taskId, desc, assignee, dueDate } =
      item as ConstraintType;
    return {
      name,
      category,
      taskId,
      dueDate: !!dueDate ? new Date(dueDate) : new Date(),
      desc,
      assignee,
    };
  });
  React.useEffect(() => {
    if (formValues?.taskId) {
      const plnStartDate: string = cacheTasks.get(
        formValues?.taskId
      )?.plannedStartDate;
      setFormValues((prev) => ({ ...prev, dueDate: new Date(plnStartDate) }));
    }
  }, [formValues?.taskId]);
  const [openDateBox, setOpenDateBox] = React.useState(false);
  const classes = CustomPopOver();
  const handleChange = (e: any) => {
    const { value, name } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssignee = (assigneeObj: { [key: string]: string }) => {
    const { userAssignee, companyAssignee } = assigneeObj;
    setFormValues((prev) => ({
      ...prev,
      assignee: userAssignee || companyAssignee || '',
    }));
  };
  return (
    <Grid
      container
      direction="column"
      wrap="nowrap"
      style={{ gap: '10px', margin: '10px 0', paddingRight: '8px' }}
    >
      <Grid
        item
        container
        direction="row"
        wrap="nowrap"
        style={{ columnGap: '20px' }}
      >
        <FormControl variant="outlined" fullWidth required>
          <label className="LookAheadPanel__right__body__content__item__label">
            Title <span style={{ color: 'red' }}>*</span>
          </label>
          <TextField
            name="name"
            value={formValues?.name}
            variant="outlined"
            onChange={handleChange}
            className="LookAheadPanel__right__body__content__item__input"
          />

          {formValues?.name?.length > 30 && (
            <div className="LookAheadPanel__right__body__content__item__input__error">
              Name must not exceed 30 characters
            </div>
          )}
        </FormControl>
        <FormControl variant="outlined" fullWidth required>
          <label className="LookAheadPanel__right__body__content__item__label">
            Category <span style={{ color: 'red' }}>*</span>
          </label>
          <Select
            name="category"
            native
            variant="outlined"
            className="LookAheadPanel__right__body__content__item__select"
            MenuProps={{
              classes: { paper: classes.root },
            }}
            onChange={handleChange}
            value={formValues?.category}
          >
            <option></option>
            {categories.map(
              ({ value }: { [key: string]: string }, idx: number) => (
                <option value={value} key={`category-item-${idx}`}>
                  {value}
                </option>
              )
            )}
          </Select>
        </FormControl>
      </Grid>
      <Grid
        item
        container
        direction="row"
        wrap="nowrap"
        style={{ columnGap: '20px' }}
      >
        <FormControl variant="outlined" fullWidth>
          <label className="LookAheadPanel__right__body__content__item__label">
            Activity <span style={{ color: 'red' }}>*</span>
          </label>
          <Select
            name="taskId"
            native
            variant="outlined"
            className="LookAheadPanel__right__body__content__item__select"
            MenuProps={{
              classes: { paper: classes.root },
            }}
            onChange={handleChange}
            value={formValues?.taskId}
          >
            <option></option>
            {lookAheadTasks.map(({ id, text }: { [key: string]: string }) => (
              <option value={id}>{text}</option>
            ))}
          </Select>
        </FormControl>
        <FormControl variant="outlined" fullWidth>
          <AssigneeInput
            initSearchName={item.assigneeName}
            setSelAssignee={handleAssignee}
            className="LookAheadPanel__right__body__content__item__input"
          />
        </FormControl>
        <FormControl variant="outlined" fullWidth>
          <label className="LookAheadPanel__right__body__content__item__label">
            Due date:
          </label>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <GlobalKeyboardDatePicker
              value={formValues?.dueDate}
              variant="inline"
              inputVariant="outlined"
              InputProps={{
                onClick: () => setOpenDateBox(true),
                placeholder: 'Select date',
              }}
              onChange={(e: any) =>
                setFormValues((prev) => ({ ...prev, dueDate: e }))
              }
              open={openDateBox}
              onClose={() => setOpenDateBox(false)}
              format="dd MMM, yyyy"
              name="dueDate"
              maxDate={moment
                .utc(gantt.getTaskByTime()[0]?.end_date)
                .add(-1, 'd')
                .toDate()}
              error={false}
              helperText={null}
              className="LookAheadPanel__right__body__content__item__input"
            />
          </MuiPickersUtilsProvider>
        </FormControl>
      </Grid>
      <Grid item>
        <FormControl variant="outlined" fullWidth>
          <label className="LookAheadPanel__right__body__content__item__label">
            Description
          </label>
          <TextField
            multiline
            name="desc"
            variant="outlined"
            onChange={handleChange}
            rows={3}
            value={formValues.desc}
            className="LookAheadPanel__right__body__content__item__input"
          />

          {formValues?.desc?.length > 500 && (
            <div className="LookAheadPanel__right__body__content__item__input__error">
              Description must not exceed 500 characters
            </div>
          )}
        </FormControl>
      </Grid>
      <Grid
        item
        container
        justify="flex-end"
        style={{
          columnGap: '10px',
        }}
      >
        <Button onClick={onCancel} size="small">
          Cancel
        </Button>
        <Button
          className="btn-primary"
          onClick={() => onSave({ ...item, ...formValues })}
          disabled={
            !formValues?.name?.trim() ||
            !formValues?.category ||
            !formValues?.taskId ||
            formValues?.desc?.length > 500 ||
            formValues?.name?.length > 30
          }
          size="small"
        >
          Save
        </Button>
      </Grid>
    </Grid>
  );
};
export default LookAheadPanel;
