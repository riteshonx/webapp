import React, { useContext, useState } from 'react';
import AcUnitIcon from "@material-ui/icons/AcUnit";
import PublicIcon from "@material-ui/icons/Public";
import BuildIcon from "@material-ui/icons/Build";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import "./WeeklyTask.scss";
import Popover from '@material-ui/core/Popover';
import Avatar from '@material-ui/core/Avatar';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import Menu from "@material-ui/core/Menu";
import {
  usePopupState,
  bindContextMenu,
  bindMenu
} from "material-ui-popup-state/hooks";
import MenuItem from '@material-ui/core/MenuItem';
import AddVariance from '../../../ProjectPlan/components/AddVariance/AddVariance';
import AddConstraint from '../../../ProjectPlan/components/AddConstraint/AddConstraint';
import { client } from '../../../../../../services/graphql';
import { RESOLVED_CONSTRAINTS } from '../../../../graphql/queries/lookahead';
import { projectFeatureAllowedRoles } from '../../../../../../utils/role';
import { stateContext } from '../../../../../root/context/authentication/authContext';
import { gantt } from 'dhtmlx-gantt';
import { transformDate } from '../../../../utils/ganttDataTransformer';
import { SAVE_PROJECT_PLAN, UPDATE_PROJECT_TASK_LPS_STATUS, UPDATE_PROJECT_TASK_STATUS } from '../../../../graphql/queries/projectPlan';
import { priorityPermissions } from '../../../../permission/scheduling';
import { decodeToken } from 'src/services/authservice';
import { IS_DELETE_STATUS_PARTIAL_UPDATE, PARTIAL_COMPLETE_TASK, 
  PARTIAL_MOVE_TASK_TO_IN_PROGRESS, PARTIAL_START_TASK } from 'src/modules/dynamicScheduling/graphql/queries/partialUpdate';
import { setIsLoading } from 'src/modules/root/context/authentication/action';
import Notification, {
  AlertTypes,
} from '../../../../../shared/components/Toaster/Toaster';
import ProjectPlanContext from '../../../../context/projectPlan/projectPlanContext';


const WeeklyTask = (props: any) => {
  const [currentTask, setCurrentTask] = useState<any>(null);
  const [openConstraint, setOpenConstraint] = useState([]);
  const [addVariance, setAddVariance] = useState(false);
  const [addConstaint, setAddConstaint] = useState(false);
  const { state, dispatch }:any = useContext(stateContext);
  const projectPlanContext = useContext(ProjectPlanContext);
  const { getPartialUpdatedTasks } = projectPlanContext;

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const popupState = usePopupState({ variant: "popover", popupId: props.item.id });
  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement, MouseEvent>, task: any) => {
    setCurrentTask(task);
    let targetConstraint = task?.constraints.filter((cons: any) => cons.status == 'open');
    targetConstraint = targetConstraint.splice(0, 3);
    setOpenConstraint(targetConstraint);
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const checkAnyOpenConstraint = (taskConstraint: any) => {
    let returnValue = false;
    taskConstraint.forEach((tCons: any) => {
      if(tCons.status == 'open')
      returnValue = true;
    })
    return returnValue;
  }

  const canAddConstraint = (task: any) => {
    return task.status == 'To-Do' && (task.lpsStatus == null || task.lpsStatus == 'readyToGo' || task.lpsStatus == 'committed')
  }

  const canResolveAllConstraint = (task: any) => {
    return checkAnyOpenConstraint(task.constraints); 
  }  

  const canReadyToGo = (task: any) => {
    return task.status == 'To-Do' && task.lpsStatus == null && !checkAnyOpenConstraint(task.constraints);
  }  
  
  const canCommit = (task: any) => {
    return task.status == 'To-Do' && task.lpsStatus !== 'committed' && !checkAnyOpenConstraint(task.constraints); 
  }    

  const canStart = (task: any) => {
    //TODO-can start the task if it has lag
    return task.status == 'To-Do' && !checkAnyOpenConstraint(task.constraints);
  }    

  const canComplete = (task: any) => {
    return task.status == 'In-Progress'
  }    

  const canInProgress = (task: any) => {
    return task.status == 'Complete'
  }     
  
  const canAddVariance = (task: any) => {
    return task.status == 'In-Progress'
  }     

  const canShowReadyToGoBar = (task: any) => {
    return task?.lpsStatus?.includes('ready') && task.status !== 'In-Progress';
  }

  const canShowCommitBar = (task: any) => {
    return task?.lpsStatus?.includes('committed') && task.status !== 'In-Progress';
  }  

  const canShowConstraintBar = (task: any) => {
    return checkAnyOpenConstraint(task.constraints);
  } 

  const changeTaskStatus = async (task: any, targetStatus: string) => {
    try {
      dispatch(setIsLoading(true));

      await client.mutate({
        mutation: IS_DELETE_STATUS_PARTIAL_UPDATE,
        variables: {
          isDeleted: true,
          taskId: task.id,
          checkIsDelete: false,
        },
        context: {
          role: priorityPermissions('update'),
          token: state.selectedProjectToken,
        },
      });
      
      if(targetStatus == 'In-Progress') {
        await client.mutate({
          mutation: PARTIAL_START_TASK,
          variables: {
            taskId: task.id,
            taskStatus: targetStatus,
            actualStartDate: transformDate(new Date().toString()),
            taskLpsStatus: null,
          },
          context: {
            role: priorityPermissions('create'),
            token: state.selectedProjectToken,
          },
        });
      }
      if(targetStatus == 'Complete') {
        await client.mutate({
          mutation: PARTIAL_COMPLETE_TASK,
          variables: {
            taskId: task.id,
            taskStatus: task.status,
            actualEndDate: transformDate(new Date().toString()),
            taskLpsStatus: null,
            actualDuration:
              gantt.calculateDuration({
                start_date: new Date(task.actualStartDate),
                end_date: new Date(transformDate(new Date().toString())),
              }) + 1,
          },
          context: {
            role: priorityPermissions('create'),
            token: state.selectedProjectToken,
          },
        });
      }
      dispatch(setIsLoading(false));
      popupState.close();
      getPartialUpdatedTasks();
      Notification.sendNotification(
        'Task Updated successfully, Changes will be reflected once get approved',
        AlertTypes.success
      );
    } catch (error) {
      dispatch(setIsLoading(false));
      popupState.close();
      console.log(error);
    }
  }

  const changeTaskToInProgress = async (task: any) => {
    try {
      dispatch(setIsLoading(true));
      await client.mutate({
        mutation: IS_DELETE_STATUS_PARTIAL_UPDATE,
        variables: {
          isDeleted: true,
          taskId: task.id,
          checkIsDelete: false,
        },
        context: {
          role: priorityPermissions('update'),
          token: state.selectedProjectToken,
        },
      });
  
      await client.mutate({
        mutation: PARTIAL_MOVE_TASK_TO_IN_PROGRESS,
        variables: {
          taskId: task.id,
          taskStatus: 'In-Progress',
          actualEndDate: null,
          actualDuration: null,
          taskLpsStatus: null,
        },
        context: {
          role: priorityPermissions('create'),
          token: state.selectedProjectToken,
        },
      });
      dispatch(setIsLoading(false));
      getPartialUpdatedTasks();
      Notification.sendNotification(
        'Task Updated successfully, Changes will be reflected after approval',
        AlertTypes.success
      );
    } catch(error) {
      dispatch(setIsLoading(false));
      popupState.close();
      console.log(error);
    }
  }

  const changeLPSStatus = async (task: any, targetStatus: string) => {
    try {
      const gantTask = gantt.getTask(task.id);
      const res = await client.mutate({
        mutation: UPDATE_PROJECT_TASK_LPS_STATUS,
        variables: {
          id: task.id,
          lpsStatus: targetStatus
        },
        context:{role: priorityPermissions('update'), token: state.selectedProjectToken}
      });    

      if(res.data.update_projectTask.affected_rows) {
        gantTask.lpsStatus = targetStatus;
        task.lpsStatus = targetStatus;
      }
      popupState.close();
    } catch (error) {
      console.log(error);
    }    
  }

  const openConstraintDialog = () => {
    popupState.close();
    setAddConstaint(true);
  }

  const openVarianceDialog = () => {
    popupState.close();
    setAddVariance(true);
  }  

  const resolveAllConstraints = async () => {
    try {
      await client.mutate({
        mutation: RESOLVED_CONSTRAINTS,
        variables:{
            id: openConstraint.map((oCon: any) => oCon.id),
            status: 'closed'
        },
        context:{role: priorityPermissions('update'), token: state.selectedProjectToken}
      });
  
      props.item.constraints.forEach((tCons: any) => {
        tCons.status = 'closed';
      })
      popupState.close();
    }
    catch(error: any) {
      console.log(error);
    }
  }

  const canDoAction = (task: any) : boolean => {
    if(state?.projectFeaturePermissons?.cancreateMasterPlan || task.assignedTo == decodeToken().userId) {
      return true;
    }  
    else {
      return false;
    }
  }

  const open = Boolean(anchorEl);
  return (
    <React.Fragment key={props.item.id}>
      {props.item.start !== 0 && (
        <div
          className="WeeklyTaskDummy"
          style={{
            gridColumn: `1/ span ${props.item.start - 1}`,
            gridColumnStart: "0",
            gridRow: `${props.index + 2}`
          }}
        ></div>
      )}
        <div
         {...bindContextMenu(popupState)}
          className="WeeklyTask"
          style={{
            gridColumn: `1/ span ${props.item.duration}`,
            gridColumnStart: `${props.item.start}`,
            gridRow: `${props.index + 2}`
          }}
        >
            <div className="WeeklyTask__content"
               aria-owns={open ? 'mouse-over-popover' : undefined}
               aria-haspopup="true"
               onMouseEnter={(event) => handlePopoverOpen(event, props.item)}
               onMouseLeave={handlePopoverClose}
            >
              <div className="WeeklyTask__content__task">
                  <div className="WeeklyTask__content__task__status">{props.item.status}</div>
                  {/* <div className="WeeklyTask__content__task__action">
                      <div className="WeeklyTask__content__task__action__iconHolder">
                        <AcUnitIcon className="WeeklyTask__content__task__action__iconHolder__icons" />
                      </div>
                      <div className="WeeklyTask__content__task__action__iconHolder">
                        <BuildIcon className="WeeklyTask__content__task__action__iconHolder__icons" />
                      </div>
                      <div className="WeeklyTask__content__task__action__iconHolder">
                        <PublicIcon className="WeeklyTask__content__task__action__iconHolder__icons" />
                      </div>
                  </div> */}
              </div>
              <div className="WeeklyTask__content__duration">
                  <div className="WeeklyTask__content__duration__start">
                    {props.item.spilledOverStartDays ?
                    <>
                      <ArrowBackIcon  className="WeeklyTask__content__duration__start__icon"/>
                      <div  className="WeeklyTask__content__duration__start__label">
                        Started {props.item.spilledOverStartDays} Days ago 
                      </div>
                    </>: ""}
                  </div>
                  <div className="WeeklyTask__content__duration__end">
                    {props.item.spilledOverEndDays ?
                    <>
                      <div className="WeeklyTask__content__duration__end__label">
                          Ending on {props.item.spillOverDisplayEndDate}
                      </div>
                      <ArrowForwardIcon className="WeeklyTask__content__duration__end__icon"/>
                    </>  : ""}
                </div>
              </div>
              <div className="WeeklyTask__content__name">
              {props.item.name}
              </div>
              {canShowReadyToGoBar(props.item) &&
                  <div className="WeeklyTask__content__statusReady">Ready To Go</div>}
              {canShowCommitBar(props.item) &&
                  <div className="WeeklyTask__content__statusCommited">Committed</div>}
              {canShowConstraintBar(props.item) &&
                  <div className="WeeklyTask__content__statusConstraint"></div>}

              {props.item?.variances.length > 0 &&<div className="WeeklyTask__content__variance">
                  <div className="WeeklyTask__content__variance__flag"> 
                  </div>
                  <div className="WeeklyTask__content__variance__stick"> 
                  </div>
                </div>}
            </div>
            <div className="WeeklyTask__progress" style={{width: `${props.item?.progress}%`}}></div>
        </div>
      
       <Menu
       className="WeeklyTask__popup"
        {...bindMenu(popupState)}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: "center", horizontal: "center" }}
        transformOrigin={{ vertical: 120 , horizontal: 130 }}
      > {canDoAction(props.item) ? <div> 
          { canAddConstraint(props.item) && <MenuItem className="WeeklyTask__popup__item" onClick={openConstraintDialog}>Add Constraint</MenuItem>}
          { canResolveAllConstraint(props.item) && 
              <MenuItem className="WeeklyTask__popup__item" onClick={resolveAllConstraints}>Resolve all Constraints</MenuItem>}
          { canReadyToGo(props.item) && 
              <MenuItem className="WeeklyTask__popup__item" onClick={() => changeLPSStatus(props.item, 'readyToGo')}>Ready to Go</MenuItem>}
          { canCommit(props.item) && 
              <MenuItem className="WeeklyTask__popup__item" onClick={() => changeLPSStatus(props.item, 'committed')}>Commit Task</MenuItem>}
          { canStart(props.item) && 
              <MenuItem className="WeeklyTask__popup__item" onClick={()=>changeTaskStatus(props.item, 'In-Progress')}>Start Task</MenuItem>}
          { canComplete(props.item) && 
              <MenuItem className="WeeklyTask__popup__item" onClick={() => changeTaskStatus(props.item, 'Complete')}>Complete Task </MenuItem>}
          { canInProgress(props.item) && 
              <MenuItem className="WeeklyTask__popup__item" onClick={() => changeTaskToInProgress(props.item)}>
                In Progress </MenuItem>}              
          { canAddVariance(props.item) && <MenuItem className="WeeklyTask__popup__item" onClick={openVarianceDialog}>Add Variance</MenuItem>}
          {/* <MenuItem className="WeeklyTask__popup__item" onClick={popupState.close}>Edit</MenuItem> */}
        </div>
        : <div>
         <MenuItem className="WeeklyTask__popup__item" onClick={popupState.close}>No action allowed</MenuItem>
        </div>}
      </Menu>

      <Popover
        id="mouse-over-popover"
        className="weeklypopover"
        classes={{
          paper: "weeklypopaper"
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          horizontal: 'center', vertical: openConstraint.length ? 160 : 120
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <div className="weeklypopaperContainer">
          <div className="weeklypopapername" >{currentTask?.name}</div>
          <div className="weeklypopaperduration">
              <div>Duration: {currentTask?.actualDuration} Days</div>
              <div>Status: {currentTask?.status}</div>
          </div>
          {(openConstraint?.length > 0) &&
            <div className="weeklypopaperConstraint"> 
              <b>{currentTask?.constraints.filter((cons: any) => cons.status == 'open').length} constraints</b>
              {openConstraint.map((item: any, index: any) => (
                <p className="weeklypopaperOpenConstraint" key={`${item.id}`}>
                  {item.constraintName}
                </p>)) 
              }
              {
                currentTask?.constraints.filter((cons: any) => cons.status == 'open').length > 3
                  && <b className="weeklypopaperOpenConstraint"> 
                  + {currentTask?.constraints.filter((cons: any) => cons.status == 'open').length - 3} more</b>
              }
          </div>}
          {currentTask?.variances?.length > 0 &&
            currentTask?.status == 'In-Progress' &&
            <div className="weeklypopaperConstraint"> 
                <b>{currentTask?.variances.length} variances</b>
                {currentTask?.variances.map((item: any, index: any) => (
                  index < 3 && 
                    <p className="weeklypopaperOpenConstraint" key={`${item.id}`}>
                      {item.varianceName}
                    </p>)
                  ) 
                }
                {
                  currentTask?.variances?.length > 3
                    && <b className="weeklypopaperOpenConstraint"> 
                    + {currentTask?.variances?.length - 3} more</b>
                }
            </div>
          }

          <div className="weeklypopaperstart">
            {currentTask?.assigneeName != '-' ? 
              <>               
                <Avatar className="weeklypopaperstartAvatar"  src="/" alt={currentTask?.assigneeName}/> 
                <b>{currentTask?.assigneeName}</b>
              </>
            : <b>Not Assigned</b>
            }
          </div>
        </div>
      </Popover>
      
      { addVariance && 
        <AddVariance
          task={props?.item}
          open={addVariance}
          close={() => setAddVariance(false)}
        />}
      { addConstaint && 
        <AddConstraint
          taskId={props?.item?.id}
          open={addConstaint}
          close={() => setAddConstaint(false)}
          weeklyTask = {props?.item}
        />}
    </React.Fragment>
  )
}

export default WeeklyTask
