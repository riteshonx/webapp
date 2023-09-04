import {
  Button,
  FormControl,
  Grid,
  IconButton,
  Select,
  TextField,
  Tooltip,
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import PlaylistPlayIcon from '@material-ui/icons/PlaylistPlay';
import React, { useContext, useEffect, useState } from 'react';
import OutsideClickHandler from 'react-outside-click-handler';
import { decodeToken } from '../../../../../../services/authservice';
import { client } from '../../../../../../services/graphql';
import { CustomListRoles } from '../../../../../../utils/role';
import { setIsLoading } from '../../../../../root/context/authentication/action';
import { stateContext } from '../../../../../root/context/authentication/authContext';
import { CustomPopOver } from '../../../../../shared/utils/CustomPopOver';
import { LOAD_CONFIGURATION_LIST_VALUES } from '../../../../graphql/queries/customList';
import {
  CREATE_TASK_VARIANCE,
  UPDATE_TASK_VARIANCE,
} from '../../../../graphql/queries/weeklyplan';
import {
  permissionKeys,
  priorityPermissions,
} from '../../../../permission/scheduling';
import './WeeklyPlanPanel.scss';
import { projectFeatureAllowedRoles } from '../../../../../../utils/role';

// const categories = [
//     {
//         value: 'Coordination Problem'
//     },
//     {
//         value: 'Engineering/Design'
//     },
//     {
//         value: 'Owner Decision'
//     },
//     {
//         value: 'Weather'
//     },
//     {
//         value: 'Prerequisite Work Not Complete'
//     },
//     {
//         value: 'Site Conditions'
//     },
//     {
//         value: 'Labor Management'
//     },
//     {
//         value: 'Materials Management'
//     },
//     {
//         value: 'Equipment Management'
//     },
//     {
//         value: 'Contracts/ Change Orders'
//     },
//     {
//         value: 'RFIs'
//     },
//     {
//         value: 'Submittals'
//     },
//     {
//         value: 'Approvals/Permits'
//     },
//     {
//         value: 'Space/Required Spacing'
//     },
//     {
//         value: 'Site Conditions/Incidents'
//     },
//     {
//         value: 'Completed Early (Positive)'
//     }
// ]

const WeeklyPlanPanel = (props: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [VarianceList, setVarianceList] = useState<Array<any>>([]);
  const [inProgressTasks, setInProgressTasks] = useState<any>([]);
  const classes = CustomPopOver();
  const { state, dispatch }: any = useContext(stateContext);
  const [editedTask, setEditedTask] = useState<any>(null);
  const [isAddOrEditModeOn, setIsAddOrEditModeOn] = useState(false);
  const [categories, setCategories] = useState<Array<any>>([]);

  useEffect(() => {
    if (isOpen) {
      resetAddEditForm();
      setIsAddOrEditModeOn(false);
      if (props.weeklyTaskList && props.weeklyTaskList.length) {
        let taskList;
        if (state?.projectFeaturePermissons?.cancreateMasterPlan) {
          taskList = props.weeklyTaskList.filter(
            (item: any) => item.status == 'In-Progress'
          );
        } else {
          taskList = props.weeklyTaskList.filter(
            (item: any) =>
              item.status == 'In-Progress' &&
              item.assignedTo == decodeToken().userId
          );
        }
        setInProgressTasks(taskList);

        const targetVarianceList: Array<any> = [];

        props.weeklyTaskList.forEach((wTask: any) => {
          wTask?.variances?.forEach((variance: any) => {
            const targetVariance = {
              id: variance.id,
              name: variance.varianceName,
              category: variance.category,
              task: variance.task,
              taskId: variance.taskId,
              isEdit: false,
              isNew: false,
              isVisible: true,
            };
            targetVarianceList.push(targetVariance);
          });
        });
        setVarianceList(targetVarianceList);
      }
    }
  }, [isOpen, props.weeklyTaskList]);

  useEffect(() => {
    fetchCustomListBasedOnName();
  }, []);

  const fetchCustomListBasedOnName = async () => {
    try {
      dispatch(setIsLoading(true));
      const response: any = await client.query({
        query: LOAD_CONFIGURATION_LIST_VALUES,
        variables: {
          name: `${'Variance Category'}`,
        },
        fetchPolicy: 'network-only',
        context: { role: projectFeatureAllowedRoles.viewMasterPlan, token: state?.selectedProjectToken }
      });
      if (response.data.configurationLists.length > 0) {
        const varianceCategory = response.data.configurationLists[0];
        const projectCategoryList = response.data.configurationLists[0].projectConfigAssociations;
        const varianceList: any = [];
        varianceCategory.configurationValues.forEach((item: any) => {
          if(projectCategoryList && projectCategoryList.length) {
            const listAssociationIndex = projectCategoryList.findIndex((configId: any) => configId.configValueId === item.id);
            if(listAssociationIndex !== -1) {
              const constraintObj: any = {};
              constraintObj.value = item.nodeName;
              varianceList.push(constraintObj);
            }
          } else {
              const constraintObj: any = {};
              constraintObj.value = item.nodeName;
              varianceList.push(constraintObj);
          }
        });
        setCategories(varianceList);
      } else {
        setCategories([]);
      }
      dispatch(setIsLoading(false));
    } catch (error: any) {
      console.log(error.message);
      dispatch(setIsLoading(false));
    }
  };

  const toggleView = () => {
    setIsOpen(!isOpen);
  };

  const canEditVariance = (constraint: any) => {
    const targetTask = props?.weeklyTaskList.filter((wT: any) => wT?.id == constraint?.taskId);
    const permission = permissionKeys(targetTask[0]?.assignedTo);
    if(targetTask[0]?.status == 'In-Progress') {
      if (permission.create) return true;
      else if (permission.view) return false;
    } else {
      return false;
    }
  };

  const addNewVariance = () => {
    const list = [...VarianceList];
    const newItem = {
      id: VarianceList.length + 1,
      name: '',
      category: '',
      task: '',
      taskId: '',
      isEdit: true,
      isNew: true,
      isVisible: true,
    };
    list.unshift(newItem);
    setEditedTask(newItem);
    setVarianceList(list);
    setIsAddOrEditModeOn(true);
  };

  const changeInValue = (argEvent: any) => {
    const task = { ...editedTask };
    task[argEvent.target.name] = argEvent.target.value;
    setEditedTask({ ...task });
  };

  const saveChanges = async (argIndex: number) => {
    try {
      setIsAddOrEditModeOn(false);
      if (VarianceList[argIndex].isNew) {
        const data = await client.mutate({
          mutation: CREATE_TASK_VARIANCE,
          variables: {
            object: {
              category: editedTask.category,
              varianceName: editedTask.name,
              taskId: editedTask.taskId,
            },
          },
          context: {
            role: priorityPermissions('create'),
            token: state.selectedProjectToken,
          },
        });
        if (data.data.insert_projectTaskVariance_one.id) {
          VarianceList[argIndex].id =
            data.data.insert_projectTaskVariance_one.id;
        }
        props.weeklyTaskList.forEach((wTask: any) => {
          if (wTask.id == editedTask.taskId) {
            wTask?.variances?.push({
              id: VarianceList[argIndex].id,
              varianceName: editedTask.name?.trim(),
              category: editedTask.category,
              task: editedTask.task,
            });
          }
        });
      } else {
        await client.mutate({
          mutation: UPDATE_TASK_VARIANCE,
          variables: {
            id: editedTask.id,
            category: editedTask.category,
            varianceName: editedTask.name,
            taskId: editedTask.taskId,
          },
          context: {
            role: priorityPermissions('update'),
            token: state.selectedProjectToken,
          },
        });
        props.weeklyTaskList.forEach((wTask: any) => {
          if (wTask.id == VarianceList[argIndex].taskId) {
            wTask?.variances?.forEach((variance: any) => {
              if (VarianceList[argIndex].id == variance.id) {
                variance.varianceName = editedTask.name?.trim();
                variance.category = editedTask.category;
              }
            });
          }
        });
      }
      VarianceList[argIndex].isEdit = false;
      VarianceList[argIndex].isNew = false;
      VarianceList[argIndex].category = editedTask.category;
      VarianceList[argIndex].name = editedTask.name;
      VarianceList[argIndex].taskId = editedTask.taskId;
      VarianceList[argIndex].task = editedTask.task;
      VarianceList[argIndex].isVisible = true;
      setVarianceList([...VarianceList]);
      setEditedTask(null);
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const changeInTaskValue = (argEvent: any) => {
    const currentEditedTask = { ...editedTask };
    currentEditedTask.taskId = argEvent.target.value;
    const currentTask = inProgressTasks.find(
      (item: any) => item.id == argEvent.target.value
    );
    if (currentTask) {
      currentEditedTask.task = currentTask.name;
    }
    setEditedTask({ ...currentEditedTask });
  };

  const editVariance = (argIndex: number) => {
    if (!editedTask) {
      VarianceList[argIndex].isEdit = true;
      setEditedTask({ ...VarianceList[argIndex], isEdit: true });
      setVarianceList([...VarianceList]);
    }
    setIsAddOrEditModeOn(true);
  };

  const stopEditVariance = (argIndex: number) => {
    if (editedTask.isNew) {
      const currentList = [...VarianceList];
      currentList.shift();
      setVarianceList(currentList);
    } else {
      VarianceList[argIndex].isEdit = false;
      setVarianceList([...VarianceList]);
    }
    setEditedTask(null);
    setIsAddOrEditModeOn(false);
  };

  const resetAddEditForm = () => {
    if (isAddOrEditModeOn) {
      if (editedTask?.isNew) {
        const currentList = [...VarianceList];
        currentList.shift();
        setVarianceList(currentList);
      } else {
        VarianceList.forEach((variance) => {
          variance.isEdit = false;
        });
        setVarianceList([...VarianceList]);
      }
      setEditedTask(null);
      setIsAddOrEditModeOn(false);
    }
  };

  const canAddVariance = () => {
    return (
      state?.projectFeaturePermissons?.cancreateMasterPlan ||
      state?.projectFeaturePermissons?.cancreateComponentPlan
    );
  };

  return (
    <div className={`WeeklyPlanPanel ${isOpen ? ' open' : ' close'}`}>
      {!isOpen && (
        <div className="WeeklyPlanPanel__left" onClick={toggleView}>
          <div className={`WeeklyPlanPanel__left__tab`}>
            <div className="WeeklyPlanPanel__left__tab__title">
              Variance Log
            </div>
          </div>
        </div>
      )}
      {isOpen && (
        <div className="WeeklyPlanPanel__right">
          <OutsideClickHandler onOutsideClick={toggleView} useCapture={true}>
            <div className="WeeklyPlanPanel__right__header">
              <div className="WeeklyPlanPanel__right__header__left">
                <PlaylistPlayIcon />
                Variance Log
              </div>
              <div className="WeeklyPlanPanel__right__header__right">
                {!isAddOrEditModeOn &&
                inProgressTasks.length &&
                canAddVariance() ? (
                  <Button
                    variant="outlined"
                    data-testid={`add-variance`}
                    className="btn-primary"
                    onClick={addNewVariance}
                    size="small"
                  >
                    Add Variance
                  </Button>
                ) : (
                  ''
                )}
              </div>
            </div>

            <div className="WeeklyPlanPanel__right__body">
              {VarianceList.length ? (
                <>
                  <div className="WeeklyPlanPanel__right__body__titles">
                    <Grid
                      container
                      className="WeeklyPlanPanel__right__body__titles__item"
                    >
                      <Grid item xs={4}>
                        Reason for delay
                      </Grid>
                      <Grid item xs={4}>
                        Category
                      </Grid>
                      <Grid item xs={4}>
                        Task
                      </Grid>
                    </Grid>
                  </div>

                  <div className="WeeklyPlanPanel__right__body__content">
                    {VarianceList.map(
                      (item: any, index: number) =>
                        item.isVisible && (
                          <Grid
                            container
                            key={`conatiner-${item.id}`}
                            className="WeeklyPlanPanel__right__body__content__item"
                          >
                            {item.isEdit ? (
                              <>
                                <Grid item xs={4}>
                                  <TextField
                                    className="WeeklyPlanPanel__right__body__content__item__input"
                                    onChange={(e) => changeInValue(e)}
                                    name="name"
                                    value={editedTask.name}
                                    variant="outlined"
                                    placeholder="Name"
                                  />
                                  {editedTask?.name?.length > 30 && (
                                    <div className="WeeklyPlanPanel__right__body__content__item__input__error">
                                      Name must be less than or equal to 30
                                      characters.
                                    </div>
                                  )}
                                </Grid>
                                <Grid item xs={4}>
                                  <FormControl variant="outlined" fullWidth>
                                    <Select
                                      native
                                      value={editedTask.category}
                                      name="category"
                                      onChange={(e) => changeInValue(e)}
                                      className="WeeklyPlanPanel__right__body__content__item__select"
                                      id="demo-simple-select-outlined"
                                    >
                                      <option value="">
                                        Select a category
                                      </option>
                                      {categories.map(
                                        (item: any, index: number) => (
                                          <option
                                            key={`${item.value}-${index}`}
                                            value={item.value}
                                          >
                                            {item.value}
                                          </option>
                                        )
                                      )}
                                    </Select>
                                  </FormControl>
                                </Grid>
                                <Grid item xs={4}>
                                  {/* <TextField className="WeeklyPlanPanel__right__body__content__item__select"
                                                                variant="outlined" placeholder="Task"/> */}

                                  <FormControl variant="outlined" fullWidth>
                                    <Select
                                      native
                                      name="task"
                                      value={editedTask.taskId}
                                      onChange={(e) => changeInTaskValue(e)}
                                      MenuProps={{
                                        classes: { paper: classes.root },
                                      }}
                                      className="WeeklyPlanPanel__right__body__content__item__select"
                                      id="demo-simple-select-outlined"
                                    >
                                      <option value="">Select a task</option>
                                      {inProgressTasks.map(
                                        (item: any, index: number) => (
                                          <option
                                            key={`${item.id}-${index}`}
                                            value={item.id}
                                          >
                                            {item.name}
                                          </option>
                                        )
                                      )}
                                    </Select>
                                  </FormControl>
                                </Grid>
                                <Grid item xs={8}></Grid>
                                <Grid
                                  item
                                  xs={4}
                                  className="WeeklyPlanPanel__right__body__content__item__container"
                                >
                                  <Button
                                    onClick={() => stopEditVariance(index)}
                                    variant="outlined"
                                    className="WeeklyPlanPanel__right__body__content__item__btn"
                                  >
                                    Discard
                                  </Button>
                                  <Button
                                    onClick={() => saveChanges(index)}
                                    variant="outlined"
                                    disabled={
                                      !editedTask.name?.trim() ||
                                      editedTask.name?.length > 30 ||
                                      !editedTask.category ||
                                      !editedTask.taskId
                                    }
                                    className="WeeklyPlanPanel__right__body__content__item__btn btn-primary"
                                  >
                                    {item.isNew ? 'Add' : 'Update'}
                                  </Button>
                                </Grid>
                              </>
                            ) : (
                              <>
                                <Grid
                                  item
                                  xs={4}
                                  className={`WeeklyPlanPanel__right__body__content__item__field`}
                                >
                                    <Tooltip title={item.name.length > 20 ? `${item.name}`: ''} aria-label="Category Name">
                                        <label>
                                            {item.name ? item.name.length > 20 ? `${item.name.slice(0,20)} . . .`:
                                                item.name : '--'}
                                        </label>
                                    </Tooltip>   
                                </Grid>
                                <Grid
                                  item
                                  xs={4}
                                  className={`WeeklyPlanPanel__right__body__content__item__field`}
                                >
                                    <Tooltip title={item.category.length > 15 ? `${item.category}`: ''} aria-label="Task name">
                                        <label>
                                            {item.category ? item.category.length > 15 ? `${item.category.slice(0,10)} . . .`:
                                                item.category : '--'}
                                        </label>
                                    </Tooltip> 
                                </Grid>
                                <Grid
                                  item
                                  xs={4}
                                  className={`WeeklyPlanPanel__right__body__content__item__field`}
                                >
                                    <Tooltip title={item.task.length > 15 ? `${item.task}`: ''} aria-label="Task name">
                                        <label>
                                            {item.task ? item.task.length > 15 ? `${item.task.slice(0,10)} . . .`:
                                                item.task : '--'}
                                        </label>
                                    </Tooltip> 
                                  {!isAddOrEditModeOn &&
                                    canEditVariance(item) && (
                                      <IconButton
                                        onClick={() => editVariance(index)}
                                        className="WeeklyPlanPanel__right__body__content__item__field__btn"
                                      >
                                        <EditIcon className="WeeklyPlanPanel__right__body__content__item__field__btn__icon" />
                                      </IconButton>
                                    )}
                                </Grid>
                              </>
                            )}
                          </Grid>
                        )
                    )}
                  </div>
                </>
              ) : (
                <div className="WeeklyPlanPanel__right__body__nodata">
                  No variance log found
                </div>
              )}
            </div>
          </OutsideClickHandler>
        </div>
      )}
    </div>
  );
};

export default WeeklyPlanPanel;
