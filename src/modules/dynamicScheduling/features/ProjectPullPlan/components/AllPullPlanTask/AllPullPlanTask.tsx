import React, { ReactElement, useContext, useState } from 'react';
import SearchIcon from '@material-ui/icons/Search';
import { Avatar, Button, TextField } from '@material-ui/core';
import FilterListIcon from '@material-ui/icons/FilterList';
import './AllPullPlanTask.scss';
import { pullPlanTaskContext } from '../../context/pullPlanTaskContext';
import moment from 'moment';
import PullingTaskToGantt from '../PullingTaskToGantt/PullingTaskToGantt';
import { client } from '../../../../../../services/graphql';
import { projectFeatureAllowedRoles } from '../../../../../../utils/role';
import { DELETE_PULL_PLAN_TASK } from '../../../../graphql/queries/pullPlan';
import { stateContext } from '../../../../../root/context/authentication/authContext';


function AllPullPlanTask(props: any): ReactElement {
    const [searchTaskName, setsearchTaskName] = useState('');
    const {pullPanelState}: any = useContext(pullPlanTaskContext);
    const [isPullingTaskOpen, setIsPullingTaskOpen] = useState(false);
    const [pulledTask, setPulledTask] = useState<any>({});
    const { state }:any = useContext(stateContext);


    const changeinsearchName=(event: any)=>{
        setsearchTaskName(event.target.value);
        props.changeinsearchName(event.target.value);
    }

    const openPullingTask = (item: any) => {
        props.onPanelInsideClick(true);
        setIsPullingTaskOpen(true);
        setPulledTask(item);
    }

    const closeAndDeleteTask = async (argValue: boolean) => {
        try {
            setIsPullingTaskOpen(false)
            if(argValue) {
                const res = await client.mutate({
                    mutation: DELETE_PULL_PLAN_TASK,
                    variables: {
                        id: pulledTask.id
                    },
                    context: {
                        role: projectFeatureAllowedRoles.deleteMasterPlan,
                        token: state.selectedProjectToken,
                    },
                });
            }
            props.refreshList(true);
            props.onPanelInsideClick(false);
        } catch(error) {
            console.log(error);
        }
    }
    
    return (
        <div className="AllPullPlanTask">
            <div className="AllPullPlanTask__header">
            <div className="AllPullPlanTask__header__search">
                    <TextField value={searchTaskName}
                                id="list-search-text"
                                data-testid="alltasksearchName"
                                type="text"
                                fullWidth
                                placeholder="Search item by name"
                                variant="outlined"
                                onChange={(e: any)=>changeinsearchName(e)}
                              />
                            <SearchIcon  className="AllPullPlanTask__header__search__icon"/>
                </div> 
                <div className="AllPullPlanTask__right">
                {/* <Button
                        variant="contained"
                        color="default"
                        startIcon={<FilterListIcon />}>
                        Filter
                </Button> */}
                </div>
            </div>
            <div className="AllPullPlanTask__body">
                {pullPanelState.allTaskList.length>0?
                (pullPanelState.allTaskList.map((item: any)=>(
                    <div className={`AllPullPlanTask__body__card ${item.taskType==='task'?'task':item.taskType==='work_package'?'work_package':
                    item.taskType==='wbs'?'wbs':item.taskType==='project_phase'?'project_phase':item.taskType==='milestone'?'milestone':''}`} 
                    key={`Card-${item.id}`}>
                            <div className="AllPullPlanTask__body__card__header">
                                    <div className="AllPullPlanTask__body__card__header__title">
                                       <b>
                                           {item.taskType==='work_package'?'WP':item.taskType==='project_phase'?'PHASE':item.taskType.toUpperCase()} -
                                           &nbsp;</b>{item.taskName}
                                    </div>
                                    <div>
                                        {props?.pullPanelStatus && state.projectFeaturePermissons?.cancreateMasterPlan ? 
                                        (<Button                            
                                            data-testid="pulling-task-button"
                                            variant="outlined"
                                            className="btn-primary"
                                            onClick={() => openPullingTask(item)}
                                            size="small" 
                                            >
                                            Pull Item
                                        </Button>): ('')}
                                    </div>
                            </div>
                            {item.taskType!=='milestone'?(
                                <div className="AllPullPlanTask__body__card__duration">
                                       <b>Duration:&nbsp;</b>  {item.duration} days
                                </div>
                            ):("")}
                            <div className="AllPullPlanTask__body__card__description">
                                {item.description && (<><b>Note:&nbsp;</b> {item.description}</>)}
                            </div>
                            <div className="AllPullPlanTask__body__card__users">
                                <div className="AllPullPlanTask__body__card__users__createdBy">
                                     <Avatar data-testid={`Ava.id`} src="/" alt={item?.tenantAssociation?.user?.firstName||''}
                                        className="AllPullPlanTask__body__card__users__createdBy__avatar"/>
                                     <div className="AllPullPlanTask__body__card__users__createdBy__info">
                                         <div className="AllPullPlanTask__body__card__users__createdBy__info__label">
                                                created by
                                        </div>
                                        <div className="AllPullPlanTask__body__card__users__createdBy__info__name">
                                            {item?.tenantAssociation?.user?.firstName|| ''}  {item?.tenantAssociation?.user?.lastName||''}
                                        </div>
                                     </div>
                                </div>
                                <div className="AllPullPlanTask__body__card__users__submitted">
                                    <div className="AllPullPlanTask__body__card__users__submitted__label">
                                        submitted on
                                    </div>
                                    <div className="AllPullPlanTask__body__card__users__submitted__name">
                                        {moment(item.createdAt).format('DD MMM YYYY')}
                                    </div>
                                </div>
                            </div>
                    </div>
                ))):(<div className="AllPullPlanTask__nodata">
                    No activities has been submitted yet. Start adding tasks in My Activities section</div>)}
            </div>

            {isPullingTaskOpen && <PullingTaskToGantt pulledTask={pulledTask} open={isPullingTaskOpen} close={closeAndDeleteTask}/>}
        </div>
    )
}

export default AllPullPlanTask;
