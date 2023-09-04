import React, { ReactElement, useState, useReducer, useEffect, useContext } from 'react';
import {Tooltip } from '@material-ui/core';
import MyPullPlanTask from '../components/MyPullPlanTask/MyPullPlanTask';
import AllPullPlanTask from '../components/AllPullPlanTask/AllPullPlanTask';
import './PullPlanPanel.scss';
import { pullPlanTaskContext } from '../context/pullPlanTaskContext';
import { pullPlanTaskRedcer, initailState } from '../context/pullPlanTaskReducer';
import moment from 'moment';
import { client } from '../../../../../services/graphql';
import { projectFeatureAllowedRoles } from '../../../../../utils/role';
import { GET_ALL_PULL_PLAN_TASK, GET_MY_PULL_PLAN_TASK } from '../../../graphql/queries/pullPlan';
import { useDebounce } from '../../../../../customhooks/useDebounce';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { setAllTask, setMyTask } from '../context/pullPlanTaskAction';
import { decodeExchangeToken } from '../../../../../services/authservice';
import { priorityPermissions } from '../../../permission/scheduling';


function PullPlanPanel(props: any): ReactElement {
    const [pullPanelState, pullPanelDispatch] = useReducer(pullPlanTaskRedcer, initailState)
    const [activeTab, setActiveTab] = useState('MYTASK');
    const [searchTaskName, setsearchTaskName] = useState('');
    const debounceName = useDebounce(searchTaskName,300);
    const { state }:any = useContext(stateContext);

    useEffect(() => {
        if(props?.scheduledPullPlanDetail?.id){
            getMyPullPlanTask();
        }
    }, [props.scheduledPullPlanDetail])

    useEffect(() => {
        if(props?.scheduledPullPlanDetail?.id){
            getAllPullPlanTask();
        }
    }, [props.scheduledPullPlanDetail,debounceName])

    const getAllPullPlanTask= async ()=>{
        pullPanelDispatch(setAllTask([]));
        try{
            const responseData= await client.query({
                query: GET_ALL_PULL_PLAN_TASK,
                variables: {
                    pullPlanId: props.scheduledPullPlanDetail.id,
                    searchparam:`%${searchTaskName}%`
                },
                fetchPolicy:'network-only',
                context:{
                    role: priorityPermissions('view'),
                    token: state.selectedProjectToken,
                }
            });
            if(responseData.data.projectPullPlanTask.length>0){
                const tasks:Array<any>=[];
                responseData.data.projectPullPlanTask.forEach((element: any) => {
                    const newElement= {...element,isEdit:false};
                    tasks.push(newElement);
                });
                pullPanelDispatch(setAllTask([...tasks]));
            } else{
                pullPanelDispatch(setAllTask([]));
            }
        } catch(error: any){
            console.log(error.message)
        }
    }

    const getMyPullPlanTask= async ()=>{
        pullPanelDispatch(setMyTask([]));
        try{
            const responseData= await client.query({
                query: GET_MY_PULL_PLAN_TASK,
                variables: {
                    pullPlanId: props.scheduledPullPlanDetail.id,
                    userId: decodeExchangeToken().userId
                },
                fetchPolicy:'network-only',
                context:{
                    role: priorityPermissions('view'),
                    token: state.selectedProjectToken,
                }
            });
            if(responseData.data.projectPullPlanTask.length>0){
                const tasks:Array<any>=[];
                responseData.data.projectPullPlanTask.forEach((element: any) => {
                    const newElement= {...element,isEdit:false};
                    tasks.push(newElement);
                });
                pullPanelDispatch(setMyTask([...tasks]));
            }
            else{
                pullPanelDispatch(setMyTask([]));
            }
        } catch(error: any){
            console.log(error.message)
        }
    }


    const changeinsearchName=(value: string)=>{
        setsearchTaskName(value);
    }

    const refreshList=(argValue = false)=>{
        getAllPullPlanTask();
        if(argValue) {
            getMyPullPlanTask();
        }

    }

    return (
        <pullPlanTaskContext.Provider value={{pullPanelState,pullPanelDispatch}}>
            <div className="PullPlanPanel">
                {props.scheduledPullPlanDetail?(
                    <>
                    <div className="PullPlanPanel__header">
                            <div className="PullPlanPanel__header__name">
                                {props.scheduledPullPlanDetail?.eventName}    
                            </div> 
                            <div className="PullPlanPanel__header__body">
                                <Tooltip
                                    title={props.scheduledPullPlanDetail?.description}
                                >
                                    <div className="PullPlanPanel__header__body__description">
                                        {props.scheduledPullPlanDetail?.description}
                                    </div>
                                </Tooltip>    
                                <div className="PullPlanPanel__header__body__time">
                                    <b>Event Date</b>: &nbsp;
                                    {moment(props.scheduledPullPlanDetail?.eventDate).format('DD MMM YYYY')}
                                </div>
                            </div>
                            <div className="PullPlanPanel__header__tabs">
                                <div className={`PullPlanPanel__header__tabs__item ${activeTab==='MYTASK'?'active':''}`} 
                                    onClick={()=>setActiveTab('MYTASK')}>
                                    My Activities {pullPanelState.myTaskList.length>0?`(${pullPanelState.myTaskList.length})`:""}
                                </div>
                                <div className={`PullPlanPanel__header__tabs__item ${activeTab==='ALLTASK'?'active':''}`} 
                                    onClick={()=>setActiveTab('ALLTASK')}>
                                    All Activities {pullPanelState.allTaskList.length>0?`(${pullPanelState.allTaskList.length})`:""}
                                </div>
                            </div>
                    </div>
                    <div className="PullPlanPanel__body">
                        {activeTab==='MYTASK'?(
                            <MyPullPlanTask pullPlanId={props.scheduledPullPlanDetail?.id} 
                                            refreshList={refreshList}
                                            onPanelInsideClick= {(status: boolean) => props.onPanelInsideClick(status)} />
                        ):(
                            <AllPullPlanTask pullPlanId={props.scheduledPullPlanDetail?.id} 
                                             changeinsearchName={changeinsearchName}
                                             pullPanelStatus={props.pullPanelStatus}
                                             refreshList={refreshList}
                                             onPanelInsideClick= {(status: boolean) => props.onPanelInsideClick(status)}/>
                        )}
                        </div>
                    </>
                ):(<div className="PullPlanPanel__nodata">No pull plan event found</div>)}
               
            </div>
        </pullPlanTaskContext.Provider>
    )
}

export default PullPlanPanel
