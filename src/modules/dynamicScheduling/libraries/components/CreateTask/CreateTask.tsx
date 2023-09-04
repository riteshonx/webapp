import { useLazyQuery, useMutation } from '@apollo/client';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { createStyles, makeStyles, useTheme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import NumberFormat from 'react-number-format';
import { useDebounce } from '../../../../../customhooks/useDebounce';
import Notification, { AlertTypes } from '../../../../shared/components/Toaster/Toaster';
import { TaskRoles } from '../../../../../utils/role';
import { setIsLoading } from '../../../../root/context/authentication/action';
import { stateContext } from '../../../../root/context/authentication/authContext';
// import { Popover } from "@material-ui/core";
import {
  CREATE_TASK_LIBRARY,
  UNIQUE_CUSTOM_ID,
  UNIQUE_TASK_LIBRARY,
  UPDATE_TASK_LIBRARY,
} from '../../grqphql/queries/taskLibrary';
import './CreateTask.scss';

const useStyles = makeStyles(() =>
  createStyles({
    selectEmpty: {
      margin: '4px 0px 8px 0px',
    },
  })
);

const defaultValues = {
  Name: '',
  CustomType: '',
  Description: '',
  Classification: '',
  CustomId: '',
  Duration: null,
};

type FormValues = {
  Name: string;
  CustomType: string;
  Description: string;
  Classification: number;
  CustomId: string;
  Duration: number;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function CreateTask(props: any): any {
  const { dispatch }: any = useContext(stateContext);
  const [title,setTitle] = useState<string>();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const {
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<any>({
    defaultValues,
  });
  const [
    createTaskLibrariesList,
    { loading, data, error },
  ] = useMutation(CREATE_TASK_LIBRARY, {
    context: { role: TaskRoles.createTenantTask },
  });
  const [
    updateTaskLibrariesList,
    { loading: updateLoading, data: updateData, error: updateError },
  ] = useMutation(UPDATE_TASK_LIBRARY, {
    context: { role: TaskRoles.updateTenantTask },
  });
  const [
    uiniqueTaskName,
    { loading: taskLoading, data: taskData, error: taskError },
  ] = useLazyQuery(UNIQUE_TASK_LIBRARY, {
    fetchPolicy: 'network-only',
    context: { role: TaskRoles.createTenantTask },
  });
  const [
    uiniqueCustomId,
    { loading: customIdLoading, data: customIdData, error: customIdError },
  ] = useLazyQuery(UNIQUE_CUSTOM_ID, {
    fetchPolicy: 'network-only',
    context: { role: TaskRoles.createTenantTask },
  });
  const popUpOpen = Boolean(anchorEl);
  const id = popUpOpen ? 'simple-popover' : undefined;
  const classes = useStyles();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));

  const [searchTaskName, setSearchTaskName] = useState('');
  const debounceTaskName = useDebounce(searchTaskName, 1000);
  const [isUniqueTaskName, setIsUniqueTaskName] = useState(false);

  const [searchCustomId, setSearchCustomId] = useState('');
  const [isUniqueCustomId, setIsUniqueCustomId] = useState(false);
  const debounceCustomId = useDebounce(searchCustomId, 1000);
  const [isZero, setIsZero] = useState(false);

  // to close the dialogbox
  const handleDialogClose = () => {
    reset({
      Name: '',
      CustomType: '',
      Description: '',
      Classification: '',
      CustomId: '',
      Duration: null,
    });
    props.close();
  };

  // set the initial value for the form
  useEffect(() => {
    const taskData = {...props.taskActionItem.taskData};
    const actionType = props.taskActionItem.actionType;
    switch(actionType)
    {
      case "create" : 
      case "copy" : 
      setTitle("Create a new task");
      break;
      case "edit" : 
      setTitle("Edit task");

    }
    if (taskData) {
      setValue('Name', taskData.taskName, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue('CustomType', taskData.customTaskType, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue('Description', taskData.description, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue('Classification', taskData.classification, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue('CustomId', taskData.customId, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue('Duration', taskData.duration, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, []);

  // open pop-up for Tag
  const handleTagClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // close pop-up for Tag
  // const handleTagClose = () => {
  //   setAnchorEl(null);
  // };

  // submit the form
  const onSubmit: SubmitHandler<FormValues> = (value: FormValues) => {
    if (
      (props.taskActionItem.actionType === 'create'|| props.taskActionItem.actionType === 'copy') &&
      !isUniqueTaskName &&
      !isUniqueCustomId &&
      !isZero
    ) {
      createTaskLibrariesList({
        variables: {
          taskName: value.Name.trim(),
          duration: value.Duration,
          description: value.Description.trim(),
          customId: value.CustomId.trim(),
          classification: value.Classification,
          customTaskType: value.CustomType,
        },
      });
    }
    if (props.taskActionItem.actionType === 'edit' &&
    !isUniqueTaskName &&
    !isUniqueCustomId &&
    !isZero) {
      updateTaskLibrariesList({
        variables: {
          id: props.taskActionItem.taskData.id,
          taskName: value.Name.trim(),
          duration: value.Duration,
          description: value.Description.trim(),
          customId: value.CustomId.trim(),
          classification: value.Classification,
          customTaskType: value.CustomType,
          tag: null,
        },
      });
    }
  };

  // create task response
  useEffect(() => {
    if (loading) {
      dispatch(setIsLoading(true));
    }
    if(data){
        Notification.sendNotification('Successfully created',AlertTypes.success);
        dispatch(setIsLoading(false));
        props.refreshTaskList();
        props.close();
    }
    if (error) {
      dispatch(setIsLoading(false));
      Notification.sendNotification('Invalid Project feature', AlertTypes.warn);
      props.close();
    }
  }, [data, error, loading]);

  //update task response
  useEffect(() => {
    if (updateLoading) {
      dispatch(setIsLoading(true));
    }
    if (updateData) {
      Notification.sendNotification('Successfully updated', AlertTypes.success);
      dispatch(setIsLoading(false));
      props.refreshTaskList();
      props.close();
    }
    if (updateError) {
      dispatch(setIsLoading(false));
      Notification.sendNotification('Invalid Project feature', AlertTypes.warn);
      props.close();
    }
  }, [updateData, updateError, updateLoading]);

  // check unique taskName starts
  useEffect(() => {
    if (taskData) {
      if (taskData?.taskLibrary.length > 0) {
        props?.taskData?.id && taskData.taskLibrary[0].id === props?.taskData.id
          ? setIsUniqueTaskName(false)
          : setIsUniqueTaskName(true);
      } else {
        setIsUniqueTaskName(false);
      }
    }
    if (taskError) {
      console.log(taskError);
    }
  }, [taskData, taskError, taskLoading]);

  useEffect(() => {
    if (debounceTaskName) {
      taskNameHandlechange();
    } else {
      setIsUniqueTaskName(false);
    }
  }, [debounceTaskName]);

  const taskNameHandlechange = () => {
    if (debounceTaskName) {
      setIsUniqueTaskName(false);
    }
    uiniqueTaskName({
      variables: {
        taskName: debounceTaskName,
      },
    });
  };
  // check unique taskName ends

  // to check unique custom ID starts
  useEffect(() => {
    if (customIdData) {
      if (customIdData?.taskLibrary.length > 0) {
        props?.taskData?.id &&
        customIdData?.taskLibrary[0].id === props?.taskData?.id
          ? setIsUniqueCustomId(false)
          : setIsUniqueCustomId(true);
      } else {
        setIsUniqueCustomId(false);
      }
    }
    if (customIdError) {
      console.log(taskError);
    }
  }, [customIdData, customIdError, customIdLoading]);

  useEffect(() => {
    if (debounceCustomId) {
      customIdHandlechange();
    } else {
      setIsUniqueCustomId(false);
    }
  }, [debounceCustomId]);

  const customIdHandlechange = () => {
    if (debounceCustomId) {
      setIsUniqueCustomId(false);
    }
    uiniqueCustomId({
      variables: {
        customId: debounceCustomId,
      },
    });
  };
  // to check unique custom ID ends

  const nonZeroValidate = (value: any) => {
    if (value) {
      const duration = Number(value);
      return duration === 0 ? setIsZero(true) : setIsZero(false);
    } else {
      setIsZero(false);
    }
  };

  return (
    <div className="task-dialog">
      <Dialog
        open={props.open}
        disableBackdropClick={true}
        onClose={handleDialogClose}
        aria-labelledby="form-dialog-title"
        fullScreen={fullScreen}
      >
        <DialogTitle id="form-dialog-title">
          {props.taskActionItem.actionType === 'create' || props.taskActionItem.actionType === 'copy' ? (
            <span>{title}</span>
            ) : (
            <div className="editTask">
              <div>{title}</div>
              <div className="editTask__info">
                <div className="editTask__info__wrap">
                  <div className="editTask__info__header">Created By</div>
                  <div>{props.taskActionItem.taskData?.tenantAssociation?.user?.firstName} {props.taskActionItem.taskData?.tenantAssociation?.user?.lastName}</div>
                </div>
                <div className="editTask__info__wrap">
                  <div className="editTask__info__header">Created On</div>
                  <div>{moment(props.taskActionItem.taskData.createdAt).format('DD MMM YYYY')}</div>
                </div>
              </div>
            </div>

          )}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
              <div className="task-dialog__content">
                  <div className="task-dialog__content__fields">
                      <Grid container>
                          <Grid item sm={6} xs={12}>
                              <InputLabel shrink >
                              Task Name *
                              </InputLabel>
                              <Controller 
                                render={({ field }:{field:any,}) => (
                                  <TextField
                                    {...field}
                                    style={{ margin: "8px 0px" }}
                                    placeholder="Enter task name"
                                    fullWidth
                                    margin="normal"
                                    onChange={(e) => {
                                      field.onChange(e)
                                      setSearchTaskName(e.target.value.trim())
                                    }}
                                    InputLabelProps={{
                                      shrink: true,
                                    }} 
                                  />                             
                                )}
                                name="Name"
                                control={control}
                                rules={{
                                  validate: (value) => { return !!value.trim()},
                                  maxLength: 20,
                                }}
                              />
                              <div className="error-wrap">
                                  <p className="error-wrap__message">
                                    {errors?.Name?.type === 'validate' && <span>Task Name is required.</span>}
                                    {errors?.Name?.type === 'maxLength' && <span>Maximum 20 characters are allowed..</span>}
                                    {!errors?.Name && isUniqueTaskName && <span>Task Name must be unique</span>}
                                  </p>
                              </div>                              
                          </Grid>

                          <Grid item sm={6} xs={12}>
                              <InputLabel shrink>
                                Type *
                              </InputLabel>
                              <Controller 
                                render={({ field }:{field:any}) => (
                                  <Select
                                      {...field}
                                      displayEmpty
                                      className={classes.selectEmpty}>
                                      <MenuItem className="task-dialog__content__fields__select-box" value="">None</MenuItem>
                                      <MenuItem className="task-dialog__content__fields__select-box" value={'Architect'}>Architect</MenuItem>
                                      <MenuItem className="task-dialog__content__fields__select-box" value={'Plumbing'}>Plumbing</MenuItem>
                                      <MenuItem className="task-dialog__content__fields__select-box" value={'Flooring'}>Flooring</MenuItem>
                                  </Select>                           
                                  )}
                                name="CustomType"
                                control={control}
                                rules={{
                                  required: true
                                }}
                              />
                              <div className="error-wrap">
                                  <p className="error-wrap__message">
                                    {errors?.CustomType?.type === 'required' && <span>Please select the Task type.</span>}
                                  </p>
                              </div>
                              
                          </Grid>
                      </Grid>

                      <Grid container>
                          <Grid item xs={12}>
                              <InputLabel shrink >
                              Description
                              </InputLabel>
                              <Controller 
                                render={({ field }:{field:any}) => (
                                  <TextField
                                      {...field}
                                      multiline
                                      rows={2}
                                      style={{ margin: "8px 0px" }}
                                      placeholder="Enter description"
                                      fullWidth
                                      margin="normal"
                                      InputLabelProps={{
                                          shrink: true,
                                      }} 
                                    />                          
                                  )}
                                name="Description"
                                control={control}
                                rules={{
                                  maxLength: 400
                                }}
                              />
                              <div className="error-wrap">
                                  <p className="error-wrap__message">
                                    {errors?.Description?.type === 'maxLength' && <span>Maximum 400 characters are allowed.</span>}
                                  </p>
                              </div>
                          </Grid>
                      </Grid>

                      <Grid container>
                          {/*<Grid item sm={6} xs={12}>
                              <InputLabel shrink >
                              Classification 
                              </InputLabel>
                              <Controller 
                                render={({ field }:{field:any}) => (
                                  <Select
                                      {...field}
                                      displayEmpty
                                      className={classes.selectEmpty}>
                                      <MenuItem className="task-dialog__content__fields__select-box" value="">None</MenuItem>
                                      <MenuItem className="task-dialog__content__fields__select-box" value={'Ten'}>Ten</MenuItem>
                                      <MenuItem className="task-dialog__content__fields__select-box" value={'Twenty'}>Twenty</MenuItem>
                                      <MenuItem className="task-dialog__content__fields__select-box" value={'Thirty'}>Thirty</MenuItem>
                                  </Select>                      
                                  )}
                                name="Classification"
                                control={control}
                              />
                              <div className="error-wrap">
                                  { <p className="error-wrap__message">
                                    {errors?.Classification?.type === 'maxLength' && <span>Maximum 400 characters are allowed.</span>}
                                  </p> }
                    </div>
                                </Grid>*/}

                  <Grid item sm={6} xs={12}>
                    <InputLabel shrink>Custom ID</InputLabel>
                    <Controller
                      render={({ field }: { field: any }) => (
                        <TextField
                          {...field}
                          style={{ margin: '8px 0px' }}
                          placeholder="Enter ID"
                          fullWidth
                          margin="normal"
                          onChange={(e) => {
                            field.onChange(e);
                            setSearchCustomId(e.target.value.trim());
                          }}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      )}
                      name="CustomId"
                      control={control}
                    />
                    <div className="error-wrap">
                      <p className="error-wrap__message">
                        {isUniqueCustomId && <span>ID must be unique</span>}
                      </p>
                    </div>
                  </Grid>

                  <Grid item sm={6} xs={12}>
                    <InputLabel shrink>Duration *</InputLabel>
                    <Controller
                      render={({ field }: { field: any }) => (
                        <NumberFormat
                          inputMode="numeric"
                          allowNegative={false}
                          customInput={TextField}
                          decimalScale={0}
                          {...field}
                          style={{ margin: '8px 0px' }}
                          placeholder="In days"
                          fullWidth
                          margin="normal"
                          InputLabelProps={{
                            shrink: true,
                          }}
                          onChange={(e) => {
                            field.onChange(e);
                            nonZeroValidate(e.target.value.trim());
                          }}
                        />
                      )}
                      name="Duration"
                      control={control}
                      rules={{
                        required: true,
                      }}
                    />
                    <div className="error-wrap">
                      <p className="error-wrap__message">
                        {errors?.Duration?.type === 'required' && (
                          <span>Duration is required.</span>
                        )}
                        {!errors?.Duration && isZero && (
                          <span>0 is not valid.</span>
                        )}
                      </p>
                    </div>
                  </Grid>                  
                </Grid>
              </div>
              {/*<div className="tags">
                <div className="tags__action">
                  <Button
                    disabled={true}
                    aria-describedby={id}
                    className="ttags__action__btn"
                    onClick={handleTagClick}
                  >
                    <LocalOfferIcon className="tags__action__btn__icon" />
                    <span className="tags__action__btn__text">+ Add tags</span>
                  </Button>
                </div>
                { <div className="tags__lists">
                          Tags
                      </div> }
                        </div>*/}

              {/* <Popover
                      id={id}
                      open={popUpOpen}
                      anchorEl={anchorEl}
                      onClose={handleTagClose}
                      anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'center',
                      }}
                      transformOrigin={{
                          vertical: 'top',
                          horizontal: 'center',
                      }}>
                          <div className="popUpBody">
                              Pop Up Tags list
                          </div>
                  </Popover> */}
            </div>
            <div className="task-dialog__footer">
              <Button
                data-testid={'create-task-clse'}
                variant="outlined"
                onClick={handleDialogClose}
                className="btn-secondary"
              >
                Cancel
              </Button>
              <Button
                data-testid={'create-task-save'}
                variant="outlined"
                type="submit"
                disabled={false}
                className="btn-primary"
              >
                {props.taskActionItem.actionType === 'edit' ? 'update' : 'create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
