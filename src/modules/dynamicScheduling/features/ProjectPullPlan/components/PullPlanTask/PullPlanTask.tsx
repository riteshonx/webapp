import { IconButton, TextField, Tooltip } from '@material-ui/core';
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import EditIcon from '@material-ui/icons/Edit';
import './PullPlanTask.scss';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import NumberFormat from 'react-number-format';
import { setMyTask } from '../../context/pullPlanTaskAction';
import { pullPlanTaskContext } from '../../context/pullPlanTaskContext';
import { stateContext } from '../../../../../root/context/authentication/authContext';

interface Props {
    data: any,
    index: number,
    saveChanges: (argTask: any, index: number) => void,
    dicardTaskChanges: (ndex: number) => void
}

function PullPlanTask({data, index, saveChanges, dicardTaskChanges}: Props): ReactElement {
    const {pullPanelState,pullPanelDispatch}: any = useContext(pullPlanTaskContext);
    const [editedTask, setEditedTask] = useState<any>(null);
    const { state }:any = useContext(stateContext);

    useEffect(() => {
        if(data.isEdit){
            const list= [...pullPanelState.myTaskList];
            setEditedTask(list[index]);
        }
    }, [data])

    const editTask= ()=>{
        const list= [...pullPanelState.myTaskList];
        setEditedTask(list[index]);
        list[index].isEdit=true;
        pullPanelDispatch(setMyTask(list));
    }

    const handleChange= (e: any)=>{
        setEditedTask({...editedTask,[e.target.name]: e.target.value})
    }

    const save = () => {
        editedTask.duration = editedTask.duration.toString().replace(/^0+/,'');
        saveChanges(editedTask, index);
    }

    const discardChanges = () =>{
        if(data.id){
            setEditedTask(null);
            const list= [...pullPanelState.myTaskList];
            list[index].isEdit=false;
            pullPanelDispatch(setMyTask(list));
        } else{
            dicardTaskChanges(index);
        }
    }

    return (
        <div className={`PullPlanTask ${data.taskType==='task'?'task':data.taskType==='work_package'?
            'work_package':data.taskType==='wbs'?'wbs':data.taskType==='project_phase'?'project_phase':''}`}>
             <div className="PullPlanTask__header">
                 <div
                 className={`PullPlanTask__header__task ${data.taskType==='task'?'task':data.taskType==='work_package'?
                 'work_package':data.taskType==='wbs'?'wbs':data.taskType==='project_phase'?'project_phase':''}`}>
                    {data.taskType==='work_package'?'wp':data.taskType==='project_phase'?'phase':data.taskType}
                </div>        
            </div>
            <div className="PullPlanTask__body">
                <div className="PullPlanTask__body__title">
                    {editedTask && data.isEdit?( <TextField value={editedTask.taskName} name="taskName"  onChange={(e)=>handleChange(e)}
                        aria-label="empty textarea" className="PullPlanTask__body__title__input" inputProps={{maxLength: 20}}
                         placeholder="Title" autoFocus/>):(
                            <>{data.taskName}</>
                        )}
                   
                </div>
                <div className="PullPlanTask__body__time">
                    {editedTask && data.isEdit?(<>
                            <NumberFormat
                                inputMode="numeric"
                                allowNegative={false}
                                allowLeadingZeros={false}
                                customInput={TextField}
                                decimalScale={0}
                                className="PullPlanTask__body__time__input"
                                margin="normal"
                                InputLabelProps={{  
                                    shrink: true,
                                }}  
                                name="duration"
                                max={999}
                                value={editedTask.duration}
                                placeholder='Enter duration in no of ' 
                                onChange={(e)=>handleChange(e)} 
                                isAllowed={(values) => {
                                    const {floatValue} = values;
                                    if(floatValue !== undefined)
                                    return floatValue > 0 &&  floatValue < 1000;
                                    else
                                    return true
                                  }}                                 
                            />   <b> days</b>                              
                         </>):(<>
                            {data.duration}&nbsp;<b> days</b>
                         </>)}
                </div>
                <div className="PullPlanTask__body__description">
                {editedTask && data.isEdit?(
                <TextField aria-label="empty textarea"  multiline
                rows={2}  value={editedTask.description}
                name="description"  onChange={(e)=>handleChange(e)}
                    className="PullPlanTask__body__description__input" 
                    inputProps={{maxLength: 40}} placeholder="Add notes" /> ):(
                        <>{data.description}</>
                    )}
                </div>
            </div>
            {!data.isEdit?(
                 <div className="PullPlanTask__action">
                    {
                        state.projectFeaturePermissons?.cancreateComponentPlan ||
                        state.projectFeaturePermissons?.cancreateMasterPlan ? (
                            <IconButton className="PullPlanTask__action__btn" onClick={editTask}>
                                <EditIcon className={`PullPlanTask__action__btn__icon ${data.taskType==='task'?'task':data.taskType==='work_package'?
                                'work_package':data.taskType==='wbs'?'wbs':data.taskType==='project_phase'?'project_phase':''}`}/>
                            </IconButton>
                        ):('')
                    }
             </div>  
            ):(
                <div className="PullPlanTask__action">
                <IconButton className="PullPlanTask__action__btn" onClick={save} 
                disabled={!editedTask?.taskName || !editedTask?.duration || (editedTask?.duration ==0)}>
                    <CheckIcon className={`PullPlanTask__action__btn__icon ${data.taskType==='task'?'task':data.taskType==='work_package'?
                    'workPackage':data.taskType==='wbs'?'wbs':data.taskType==='project_phase'?'project_phase':''}`}/>
                </IconButton>
                <IconButton className="PullPlanTask__action__btn" onClick={discardChanges}>
                    <ClearIcon className={`PullPlanTask__action__btn__icon ${data.taskType==='task'?'task':data.taskType==='work_package'?
                    'workPackage':data.taskType==='wbs'?'wbs':data.taskType==='project_phase'?'project_phase':''}`}/>
                </IconButton>
            </div>  
            )}   
        </div>
    )
}


export function PullPlanMileStoneTask({data,index, saveChanges, dicardTaskChanges}: Props): ReactElement {
    const {pullPanelState,pullPanelDispatch}: any = useContext(pullPlanTaskContext);
    const [editedTask, setEditedTask] = useState<any>(null);

    useEffect(() => {
        if(data.isEdit){
            const list= [...pullPanelState.myTaskList];
            setEditedTask(list[index]);
        }
    }, [data])

    const editTask= ()=>{
        const list= [...pullPanelState.myTaskList];
        setEditedTask(list[index]);
        list[index].isEdit=true;
        pullPanelDispatch(setMyTask(list));
    }

    const handleChange= (e: any)=>{
        setEditedTask({...editedTask,[e.target.name]: e.target.value})
    }


    const save= ()=>{
        // make api call to update
        // on success fetch all or  just set the updated values
        saveChanges(editedTask, index);
    }

    const discardChanges = () =>{
        if(data.id){
            setEditedTask(null);
            const list= [...pullPanelState.myTaskList];
            list[index].isEdit=false;
            pullPanelDispatch(setMyTask(list));
        } else{
            dicardTaskChanges(index);
        }
    }


    return (
        <div className="PullPlanMileStoneTask">
            <div className="PullPlanMileStoneTask__container">
                <div className="PullPlanMileStoneTask__container__content"> 
                    <div className="PullPlanMileStoneTask__container__content__header">
                        <div className="PullPlanMileStoneTask__container__content__header__task">
                        </div>        
                    </div>
                    <div className="PullPlanMileStoneTask__container__content__body">
                        <div className="PullPlanMileStoneTask__container__content__body__title">
                        {editedTask && data.isEdit?( <TextField value={editedTask.taskName} name="taskName"  onChange={(e)=>handleChange(e)}
                        aria-label="empty textarea" className="PullPlanMileStoneTask__container__content__body__title__input"
                         inputProps={{maxLength: 20}}
                         placeholder="Title" autoFocus/>):(
                            <Tooltip title={data.taskName} aria-label={data.taskName}> 
                                <>{data.taskName.length > 15 ? `${data.taskName.slice(0,12)}...`:data.taskName}</>
                            </Tooltip>
                        )}
                        </div>
                        <div className="PullPlanMileStoneTask__container__content__body__description">
                        {editedTask && data.isEdit?(
                            <TextField aria-label="empty textarea"  multiline
                            rows={2}  value={editedTask.description}
                            name="description"  onChange={(e)=>handleChange(e)}
                                className="PullPlanMileStoneTask__container__content__body__description__input" 
                                inputProps={{maxLength: 40}} placeholder="Add notes" /> ):(
                                    <Tooltip title={data.description} aria-label={data.description}>
                                        <>{data.description.length>20?`${data.description.slice(0,18)}...`: data.description}</>
                                    </Tooltip>     
                        )}
                        </div>
                    </div>
                    <div className="PullPlanMileStoneTask__container__content__action">
                    {!data.isEdit?(
                        <IconButton className="PullPlanMileStoneTask__container__content__action__btn"
                            onClick={editTask}>
                            <EditIcon className="PullPlanMileStoneTask__container__content__action__btn__icon"/>
                        </IconButton>):(
                        <>
                            <IconButton className="PullPlanMileStoneTask__container__content__action__btn"
                            onClick={save} disabled={!editedTask?.taskName}>
                                 <CheckIcon className="PullPlanMileStoneTask__container__content__action__btn__icon"/>
                            </IconButton>
                            <IconButton className="PullPlanMileStoneTask__container__content__action__btn"
                            onClick={discardChanges}>
                                <ClearIcon className="PullPlanMileStoneTask__container__content__action__btn__icon"/>
                            </IconButton>
                        </>)}
                    </div>  
                </div>   
            </div>
        </div>
    )
}

export default PullPlanTask
