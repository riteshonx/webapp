import React, { ReactElement, useContext } from 'react';
import AddIcon from '@material-ui/icons/Add';
import { Button } from '@material-ui/core';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import PullPlanTask, { PullPlanMileStoneTask } from '../PullPlanTask/PullPlanTask';
import './MyPullPlanTask.scss';
import { pullPlanTaskContext } from '../../context/pullPlanTaskContext';
import { setAllTask, setMyTask } from '../../context/pullPlanTaskAction';
import { CREATE_PULL_PLAN_TASK, UPDATE_PULL_PLAN_TASK } from '../../../../graphql/queries/pullPlan';
import { projectFeatureAllowedRoles } from '../../../../../../utils/role';
import { client } from '../../../../../../services/graphql';
import { stateContext } from '../../../../../root/context/authentication/authContext';
import { priorityPermissions } from '../../../../permission/scheduling'


function MyPullPlanTask(props: any): ReactElement {
    const {pullPanelState,pullPanelDispatch}: any = useContext(pullPlanTaskContext);
    const [addTaskOpen, setAddTaskOpen] = React.useState(null);
    const { state }:any = useContext(stateContext);


    const handleClick = (event: any) => {
        if(!addTaskOpen) {
            props.onPanelInsideClick(true);
            setAddTaskOpen(event.currentTarget);
        }else {
            props.onPanelInsideClick(false);
            setAddTaskOpen(null);
        }
    };

    const addNewTask=(e: any, argType: string)=>{
        e.stopPropagation()
        const list= [...pullPanelState.myTaskList];
        list.unshift({
            id: '',
            taskType: argType,
            taskName: '',
            duration: null,
            description: '',
            isEdit: true
        })
        pullPanelDispatch(setMyTask([...list]));
        handleClose();
    }
  
    const handleClose = () => {
        props.onPanelInsideClick(false);  
        setAddTaskOpen(null);
    };

    const createTask= async (argTask: any, index: number)=>{
        try{
            const object: any= {
                pullPlanId: props.pullPlanId,
                taskName: argTask.taskName,
                taskType: argTask.taskType,
                date: null,
                description: argTask.description,
                duration: Number(argTask.duration)
            }
            if(argTask.taskType ==='milestone'){
                object.duration=0;
                object.date = new Date()
            }
            const res = await client.mutate({
                mutation: CREATE_PULL_PLAN_TASK,
                variables: {
                    object:object
                },
                context: {
                    role: priorityPermissions('create'),
                    token: state.selectedProjectToken,
                },
            });
            if(res.data.insert_projectPullPlanTask_one.id){
                const list= [...pullPanelState.myTaskList];
                argTask.id= res.data.insert_projectPullPlanTask_one.id;
                list[index]=argTask;
                list[index].isEdit=false;
                pullPanelDispatch(setMyTask(list));
                props.refreshList();
            }
        }
        catch(error) {
            console.log(error.message);
        }        

    } 
    
    const updateTask= async (argTask: any, index: number)=>{
        try{
            const object: any= {
                id: argTask.id, 
                taskName: argTask.taskName,
                duration:  Number(argTask.duration), 
                description: argTask.description, 
                date: null
            }
            if(argTask.taskType ==='milestone'){
                object.duration=0;
                object.date = new Date()
            }
            const res = await client.mutate({
                mutation: UPDATE_PULL_PLAN_TASK,
                variables: {
                  ...object
                },
                context: {
                    role: priorityPermissions('update'),
                    token: state.selectedProjectToken,
                },
            });

            if(res.data.update_projectPullPlanTask.affected_rows){
                const list= [...pullPanelState.myTaskList];
                list[index]=argTask;
                list[index].isEdit=false;
                pullPanelDispatch(setMyTask(list));
                props.refreshList();
            }
        }
        catch(error) {
            console.log(error.message);
        }        

    }        

    const saveTaskChanges = (argTask: any, index: number) => {
        if(argTask?.id) {
            updateTask(argTask,index);
        }else {
            createTask(argTask,index);
        }
    }

    const discard=(argIndex: number)=>{
        const list= [...pullPanelState.myTaskList];
        list.splice(argIndex,1);
        pullPanelDispatch(setMyTask(list));
    }

    return (
        <div className="MyPullPlanTask">
            <div className="MyPullPlanTask__header">
                {   state.projectFeaturePermissons?.cancreateComponentPlan ||
                    state.projectFeaturePermissons?.cancreateMasterPlan ?
                    (<Button  className="MyPullPlanTask__header__btn btn-primary" onClick={handleClick}>
                        <AddIcon className="MyPullPlanTask__header__btn__icon"/>
                        <Menu
                            id="simple-menu"
                            anchorEl={addTaskOpen}
                            keepMounted
                            open={Boolean(addTaskOpen)}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'center',
                            }}
                            transformOrigin={{
                                vertical: -45,
                                horizontal: 0,
                            }}
                            onClose={handleClose}>
                            <MenuItem className="MyPullPlanTask__header__menuitem" onClick={(e)=>addNewTask(e,'task')}>Task</MenuItem>
                            <MenuItem className="MyPullPlanTask__header__menuitem" onClick={(e)=>addNewTask(e, 'work_package')}>Work Package</MenuItem>
                            <MenuItem className="MyPullPlanTask__header__menuitem" onClick={(e)=>addNewTask(e, 'wbs')}>Work Breakdown Structure</MenuItem>
                            <MenuItem className="MyPullPlanTask__header__menuitem" onClick={(e)=>addNewTask(e, 'milestone')}>Milestone</MenuItem>
                            <MenuItem className="MyPullPlanTask__header__menuitem" onClick={(e)=>addNewTask(e, 'project_phase')}>Phase</MenuItem>
                        </Menu>
                    </Button>):(
                        ''
                    )
                }    
            </div>
            <div className="MyPullPlanTask__body">
                    {
                        pullPanelState?.myTaskList.length ? (
                            pullPanelState.myTaskList.map((item: any, index: number)=>(
                            (item.taskType==='milestone'?(
                                    <PullPlanMileStoneTask data={item}  dicardTaskChanges={discard}
                                    saveChanges={saveTaskChanges} key={`task-${item.id}-${index}`} index={index}/>
                                ):(
                                    <PullPlanTask key={`task-${item.id}-${index}`}  data={item} index={index} 
                                    dicardTaskChanges={discard} saveChanges={saveTaskChanges}/>
                                ))
                            ))
                        ) : (<div className="MyPullPlanTask__nodata">No activities found. Start adding activities by clicking the + button</div>)
                    }
            </div>
        </div>
    )
}

export default MyPullPlanTask;
