import { Button, FormControl, Grid, IconButton } from '@material-ui/core';
import React, { SetStateAction, useContext, useEffect, useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import './AddConstraint.scss';

import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import { client } from '../../../../../../services/graphql';
import { CREATE_TASK_CONSTRAINTS } from '../../../../graphql/queries/lookahead';
import { projectFeatureAllowedRoles } from '../../../../../../utils/role';
import { stateContext } from '../../../../../root/context/authentication/authContext';
import ProjectPlanContext from '../../../../context/projectPlan/projectPlanContext';

import { priorityPermissions } from '../../../../permission/scheduling';
import { setIsLoading } from '../../../../../root/context/authentication/action';
import { LOAD_CONFIGURATION_LIST_VALUES } from '../../../../graphql/queries/customList';
import SearchIcon from '@material-ui/icons/Search';
import GlobalKeyboardDatePicker from 'src/modules/shared/components/GlobalDatePicker/GlobalKeyboardDatePicker';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { useDebounce } from 'src/customhooks/useDebounce';
import CancelIcon from '@material-ui/icons/Cancel';
import { ClickAwayListener } from '@mui/material';
import ShowComponent from 'src/modules/shared/utils/ShowComponent';

// const categories = [
//     {
//         type: "Physical",
//         value: 'Availabilty of Materials'
//     },

//     {
//         type: "Physical",
//         value: 'Availabilty of Labor'
//     },

//     {
//         type: "Physical",
//         value: 'Availabilty of Equipment'
//     },

//     {
//         type: "Physical",
//         value: 'Something is not Ready'
//     },
//     {
//         type: "Physical",
//         value: 'Weather'
//     },
//     {
//         type: "Physical",
//         value: 'Site Conditions'
//     },
//     {
//         type: "Informational",
//         value: 'Analysis not complete'
//     },
//     {
//         type: "Informational",
//         value: 'Design not complete'
//     },
//     {
//         type: "Informational",
//         value: 'Data not received'
//     },

//     {
//         type: "Informational",
//         value: 'Permit not processed'
//     },

//     {
//         type: "Informational",
//         value: 'Design Change'
//     },
// ]

const AddConstraint = (props: any) => {
  const [category, setCategory] = useState<any>('');
  const [name, setName] = useState<any>('');
  const { state, dispatch }: any = useContext(stateContext);
  const projectPlanContext = useContext(ProjectPlanContext);
  const [categories, setCategories] = useState<Array<any>>([]);
  const [selAssignee, setSelAssignee] = React.useState({});
  const { taskId } = props;
  const { setLookAheadAction, cacheTasks } = projectPlanContext;
  const currentTask = cacheTasks.get(taskId);
  const [dueDateObj, setDueDateObj] = React.useState({
    dueDate: new Date(currentTask.plannedStartDate),
    isOpen: false,
  });
  const [desc, setDesc] = React.useState('');

  const handleClose = () => {
    props.close();
  };

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

  const saveConstraint = async () => {
    try {
      const data: any = await client.mutate({
        mutation: CREATE_TASK_CONSTRAINTS,
        variables: {
          object: {
            category: category,
            constraintName: name?.trim(),
            taskId,
            description: desc,
            dueDate: dueDateObj.dueDate,
            ...selAssignee,
          },
        },
        context: {
          role: priorityPermissions('create'),
          token: state.selectedProjectToken,
        },
      });
      setLookAheadAction({
        id: data.data.insert_projectTaskConstraints_one.id,
        category: category,
        constraintName: name,
        taskId: props.taskId,
      });
      if (props?.weeklyTask) {
        props?.weeklyTask?.constraints.push({
          id: data.data.insert_projectTaskConstraints_one.id,
          category: category,
          constraintName: name,
          taskId: props.taskId,
          status: 'open',
        });
      }
      props.close();
    } catch (error: any) {
      console.log(error.message);
    }
  };
  return (
    <Dialog
      fullWidth={true}
      maxWidth={'xs'}
      open={props.open}
      onClose={handleClose}
      disableBackdropClick={true}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogContent className="addConstraint">
        <div className="addConstraint__fields">
          <div className="addConstraint__fields__textField">
            <label
              id="demo-simple-select-outlined-label"
              className="addConstraint__fields__textField__label"
            >
              Title <span style={{ color: 'red' }}>*</span>
            </label>
            <TextField
              id="outlined-basic"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {name.length > 30 && (
              <span className="addConstraint__fields__textField__error">
                Name must not exceed 30 characters
              </span>
            )}
          </div>
          <div className="addConstraint__fields__textField">
            <label
              id="demo-simple-select-outlined-label"
              className="addConstraint__fields__textField__label"
            >
              Category <span style={{ color: 'red' }}>*</span>
            </label>
            <FormControl variant="outlined" fullWidth>
              <Select
                native
                value={category}
                name="category"
                onChange={(e) => setCategory(e.target.value)}
                className="addConstraint__fields__textField__select"
                id="demo-simple-select-outlined"
              >
                <option value="">Select a category</option>
                {categories.map((item: any, index: number) => (
                  <option key={`${item.value}-${index}`} value={item.value}>
                    {item.value}
                  </option>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>
        <div className="addConstraint__fields">
          <div className="addConstraint__fields__textField">
            <AssigneeInput setSelAssignee={setSelAssignee} />
          </div>
          <div className="addConstraint__fields__textField">
            <label className="addConstraint__fields__textField__label">
              Due date:
            </label>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <GlobalKeyboardDatePicker
                value={dueDateObj.dueDate}
                variant="inline"
                inputVariant="outlined"
                InputProps={{
                  onClick: () =>
                    setDueDateObj((p) => {
                      return { ...p, isOpen: true };
                    }),
                  placeholder: 'Select date',
                }}
                onChange={(e: any) => {
                  setDueDateObj((prev) => ({ ...prev, dueDate: e }));
                }}
                open={dueDateObj.isOpen}
                onClose={() =>
                  setDueDateObj((prev) => ({ ...prev, isOpen: false }))
                }
                format="dd MMM, yyyy"
                name="date"
                maxDate={'2099-01-01'}
                error={false}
                helperText={null}
              />
            </MuiPickersUtilsProvider>
          </div>
        </div>
        <div className="addConstraint__fields">
          <Grid container style={{ rowGap: '5px' }} direction="column">
            <label className="addConstraint__fields__textField__label">
              Description
            </label>
            <TextField
              multiline
              variant="outlined"
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="multiline__input"
            />
          </Grid>
        </div>
        <div className="addConstraint__footer">
          <Button
            data-testid={'cancel-action'}
            variant="outlined"
            type="submit"
            onClick={handleClose}
            className="btn-secondary"
            size="small"
          >
            Cancel
          </Button>
          <Button
            disabled={!category || !name.trim() || name.length > 30}
            data-testid={'confirm-action'}
            variant="contained"
            onClick={saveConstraint}
            size="small"
            className="btn-primary"
          >
            Add Constraint
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface Props {
  setSelAssignee: React.Dispatch<SetStateAction<any>>;
  initSearchName: string;
  className: string;
}
export const AssigneeInput = ({
  setSelAssignee,
  initSearchName,
  className,
}: Props): React.ReactElement => {
  const [searchName, setSearchName] = React.useState(initSearchName);
  const debSearchName = useDebounce(searchName, 400);
  const [assigneeList, setAssigneeList] = useState<any>([]);
  const [isOpen, setOpen] = React.useState(false);
  const { projectUser, tenantCompanyList } =
    React.useContext(ProjectPlanContext);
  React.useEffect(() => {
    console.log(debSearchName);
    if (!debSearchName) {
      setAssigneeList([]);
      return;
    }
    if (debSearchName.trim()) {
      const searchResult: any = [];
      const temp = [
        ...Object.values(projectUser),
        ...Object.values(tenantCompanyList),
      ];

      temp.forEach((data: any) => {
        if (
          (data?.firstName &&
            data?.firstName
              .toLowerCase()
              .includes(searchName.trim().toLowerCase())) ||
          (data?.lastName &&
            data?.lastName
              .toLowerCase()
              .includes(searchName.trim().toLowerCase())) ||
          (data?.name &&
            data?.name.toLowerCase().includes(searchName.trim().toLowerCase()))
        ) {
          searchResult.push(data);
        }
      });
      setAssigneeList(searchResult);
    } else {
      setAssigneeList([]);
    }
  }, [debSearchName]);

  const addAssignee = (assignee: any) => {
    setAssigneeList([]);
    const tempConstraint = { userAssignee: null, companyAssignee: null };
    if (projectUser[assignee.id] && projectUser[assignee.id].flag === 'user') {
      tempConstraint.userAssignee = assignee.id;
      tempConstraint.companyAssignee = null;

      setSearchName(assignee.firstName + ' ' + assignee.lastName);
    }

    if (
      tenantCompanyList[assignee.id] &&
      tenantCompanyList[assignee.id].flag === 'company'
    ) {
      tempConstraint.userAssignee = null;
      tempConstraint.companyAssignee = assignee.id;
      setSearchName(assignee.name);
    }
    setSelAssignee({ ...tempConstraint });
  };
  return (
    <React.Fragment>
      <label className="addConstraint__fields__textField__label">
        Assignee:
      </label>
      <ClickAwayListener onClickAway={() => setOpen(false)}>
        <div>
          <TextField
            className={className}
            value={searchName}
            onFocus={() => setOpen(true)}
            InputProps={{
              endAdornment: searchName ? (
                <IconButton
                  onClick={() => {
                    setSearchName('');
                    setSelAssignee({
                      userAssignee: null,
                      companyAssignee: null,
                    });
                  }}
                >
                  <CancelIcon />
                </IconButton>
              ) : (
                <SearchIcon htmlColor="#CCCCCC" />
              ),
            }}
            variant="outlined"
            placeholder="Search user/company"
            onChange={(e) => setSearchName(e.target.value)}
          />
          <ShowComponent showState={isOpen}>
            <div className="addConstraint__fields__textField__option">
              <div className="addConstraint__fields__textField__option__list">
                {assigneeList.length !== 0 &&
                  assigneeList.map((item: any, searchIndex: number) => (
                    <div
                      key={item.id}
                      className="addConstraint__fields__textField__option__list_item"
                      style={{
                        borderBottom: `${
                          assigneeList.length - 1 === searchIndex ? 'none' : ''
                        }`,
                      }}
                      onClick={() => addAssignee(item)}
                    >
                      <div className="addConstraint__fields__textField__option__list_item__left">
                        <div className="addConstraint__fields__textField__option__list_item__left__label">
                          <div className="addConstraint__fields__textField__option__list_item_item__left__label__name">
                            {item.name
                              ? item.name
                              : item.firstName + ' ' + item.lastName}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </ShowComponent>
        </div>
      </ClickAwayListener>
    </React.Fragment>
  );
};
AssigneeInput.defaultProps = {
  initSearchName: '',
  className: '',
};
export default AddConstraint;
