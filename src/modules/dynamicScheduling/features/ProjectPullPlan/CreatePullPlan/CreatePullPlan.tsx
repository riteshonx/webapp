import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { Avatar, Button, Dialog, DialogContent, 
    DialogTitle, InputLabel, TextField, Tooltip, useMediaQuery } from '@material-ui/core';
import './CreatePullPlan.scss';
import { theme } from '../../../../../utils/theme';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { client } from '../../../../../services/graphql';
import { SAVE_PULL_PLAN_EVENT, UPDATE_PULL_PLAN_EVENT } from '../../../graphql/queries/pullPlan';
import { stateContext } from '../../../../root/context/authentication/authContext';
import CloseIcon from '@material-ui/icons/Close';
import CalendarWithoutYear from '../../../components/CalendarWithoutYear/CalendarWithoutYear';
import UserSelect from '../../../components/UserSelector/UserSelector';
import { transformDateToString } from '../../../utils/ganttDataTransformer';
import Notification, {
    AlertTypes,
  } from '../../../../shared/components/Toaster/Toaster';
import { projectFeatureAllowedRoles } from '../../../../../utils/role';
import { decodeToken } from '../../../../../services/authservice';
import DeleteIcon from '@material-ui/icons/Delete';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { gantt } from 'dhtmlx-gantt';
import { getNonHoliydayEventDate } from 'src/modules/dynamicScheduling/utils/ganttConfig';
import { setIsLoading } from 'src/modules/root/context/authentication/action';
import ConfirmDialog from 'src/modules/shared/components/ConfirmDialog/ConfirmDialog';


function CreatePullPlan(props: any): ReactElement {

    const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));
    const [selectedAssignee, setSelectedAssignee] = useState<Array<any>>([]);
    const { state, dispatch }:any = useContext(stateContext);
    const [isAdduserOpen, setIsAdduserOpen] = useState(false);
    const [isFormFilled, setIsFormFilled] = useState(true);
    const [pullPlanEvent, setPullPlanEvent] = useState({
        eventName:'',
        description:'',
        eventDate: getNonHoliydayEventDate()
    });
    const [isEdit, setIsEdit] = useState(false);
    const [isDelete, setIsDelete] = useState(false);

    useEffect(() => {
        if(props.scheduledPullPlanDetail){
            setIsEdit(true);
            setPullPlanEvent({
                eventName: props.scheduledPullPlanDetail.eventName,
                description: props.scheduledPullPlanDetail.description,
                eventDate: props.scheduledPullPlanDetail.eventDate
            })
            if(props.scheduledPullPlanDetail.projectPullPlanParticipants.length>0){
                const userList: Array<any>=[];
                props.scheduledPullPlanDetail.projectPullPlanParticipants.forEach((item: any)=>{
                    if(item.userId!== decodeToken().userId){
                        const name = item.user.firstName
                            ? `${item.user.firstName || ""} ${item.user.lastName || ""}`
                            : item.user.email.split("@")[0];
                        const newItem= {
                            id:item.userId,
                            name: name
                        }
                        userList.push(newItem);
                    }
                })
                setSelectedAssignee(userList);
            }
        }
    }, [props.scheduledPullPlanDetail])

    useEffect(() => {
        if((pullPlanEvent.eventName && pullPlanEvent.eventName.length <= 30)
        && (pullPlanEvent.description && pullPlanEvent.description.length <= 300) 
        && selectedAssignee.length > 0) {
            setIsFormFilled(false);
        } else {
            setIsFormFilled(true);
        }
    }, [pullPlanEvent, selectedAssignee])


    const onChangeHandler = async (e: any) => {
        setPullPlanEvent({ ...pullPlanEvent, [e.target.name]: e.target.value });
    }

    const onDateChangeHandler= async (date:any, type:any) =>{
        setPullPlanEvent({...pullPlanEvent, eventDate: date})
    }

    const handleClickDialogClose = () => {
        props.close();
    }

    const handleDialogClose = (actionType = false) => {
        props.close(actionType);
    };    

    const inviteSave= async ()=>{
        try{
            dispatch(setIsLoading(true));
            const participantIds:string[] =selectedAssignee.map(i => i.id);
            participantIds.push(decodeToken().userId);
            const res = await client.mutate({
                mutation: SAVE_PULL_PLAN_EVENT,
                variables: {
                    eventName: pullPlanEvent.eventName,
                    description: pullPlanEvent.description,
                    eventDate: transformDateToString(pullPlanEvent.eventDate),
                    participant: participantIds
                },
                context: {
                    role: projectFeatureAllowedRoles.createMasterPlan,
                    token: state.selectedProjectToken,
                },
            });
            Notification.sendNotification(
                'Created pull plan event successfully',
                AlertTypes.success
            );
            dispatch(setIsLoading(false));
            handleDialogClose(true);

        }
        catch(error) {
            dispatch(setIsLoading(false));
            Notification.sendNotification(
                error,
                AlertTypes.error
            );
        }
    }

    const update= async (isDeleted: boolean) =>{
        try{
            dispatch(setIsLoading(true));
            const originalList=[...props.scheduledPullPlanDetail.projectPullPlanParticipants.filter((item: any)=>
                item.userId !== decodeToken().userId)]
            const deleteParticipants=originalList.filter((item: any)=>selectedAssignee.every((asgItem)=>asgItem.id !== item.userId));
            const newParticipants=selectedAssignee.filter((asgItem: any)=>originalList.every((item)=>asgItem.id !== item.userId));
           const responseData: any= await client.mutate({
                mutation: UPDATE_PULL_PLAN_EVENT,
                variables:{
                    pullPlanId:props.scheduledPullPlanDetail.id,
                    eventName:pullPlanEvent.eventName,
                    eventDate: transformDateToString(pullPlanEvent.eventDate),
                    description:pullPlanEvent.description,
                    startTime:'',
                    endTime:'',
                    status: !isDeleted ? props.scheduledPullPlanDetail.status: 'closed',
                    newParticipants:!isDeleted ?newParticipants.map(item=>item.id):[],
                    deleteParticipants:!isDeleted ?deleteParticipants.map(item=>item.userId):[],
                },
                context:{
                    role: projectFeatureAllowedRoles.updateMasterPlan,
                    token: state.selectedProjectToken,
                 }
            })
            Notification.sendNotification(
                'Updated pull plan event successfully',
                AlertTypes.success
            );
            dispatch(setIsLoading(false));
            handleDialogClose(true);
        }
        catch(error: any){
            dispatch(setIsLoading(false));
            console.log(error.message);
        }
    }

    const saveAssigne = (argValues: Array<any>) =>{
        setSelectedAssignee([...selectedAssignee,...argValues]);
        setIsAdduserOpen(false);
    }

    const closeAddOption=()=>{
        setIsAdduserOpen(false);
    }

    const removeAssignee = (argIndex: number) =>{
        selectedAssignee.splice(argIndex,1);
        setSelectedAssignee([...selectedAssignee]);
    }

    const shouldDisableDate = (day: MaterialUiPickersDate) => {
        return !gantt.isWorkTime(day);
    };

    return( 
        <React.Fragment>
        <div className="pullPlan">
            <Dialog
                open={props.open}
                onClose={handleClickDialogClose}
                area-labelledby="form-dialog-title"
                maxWidth="md"
                disableBackdropClick={true}
                fullScreen={fullScreen}
            >
                <DialogTitle id="form-dialog-title">
                    <div className="pullPlan__header">
                        <div>
                            Hello there!
                        </div>
                        {/* <div className="pullPlan__header__description">
                            You are about to start a pull plan session
                        </div> */}
                    </div>
                </DialogTitle>

                <DialogContent>
                    <div className="pullPlan__content">
                        <div className="pullPlan__left">
                            <div className="pullPlan__left__field">
                                <InputLabel className="pullPlan__left__field__label"> What do you want to call it? <span>*</span></InputLabel>
                                <TextField id="name"
                                    type="text"
                                    fullWidth
                                    name="eventName"
                                    value={pullPlanEvent.eventName}
                                    autoComplete="search"
                                    variant="outlined"
                                    multiline   
                                    rows={1}
                                    rowsMax={1}
                                    placeholder="eg: Phase Pull Planning"
                                    onChange={(e)=>onChangeHandler(e)}
                                    data-testid="pullPlan-name"
                                />
                                {pullPlanEvent.eventName.length>30 ? 
                                (<span className="pullPlan__left__field__error">Event Name must be less than or equal to 30 characters.</span>) : ('')}
                            </div>

                            <div  className="pullPlan__left__field">
                                <InputLabel className="pullPlan__left__field__label">
                                     Give your team a heads up with a little description? <span>*</span> </InputLabel>
                                <TextField id="description"
                                    type="text"
                                    fullWidth
                                    value={pullPlanEvent.description}
                                    name="description"
                                    autoComplete="search"
                                    variant="outlined"
                                    multiline   
                                    rows={4}
                                    rowsMax={4}
                                    placeholder="Description"
                                    onChange={(e)=>onChangeHandler(e)}
                                    data-testid="pullPlan-description"
                                />
                                {pullPlanEvent.description.length>300 ?
                                 (<span className="pullPlan__left__field__error">
                                     Description must be less than or equal to 300 characters.
                                    </span>) : ('')}
                            </div>
                            <div  className="pullPlan__left__field">
                                <InputLabel className="pullPlan__left__field__label"> Pull Plan Event Date <span>*</span></InputLabel>
                                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                    <CalendarWithoutYear
                                        disableToolbar
                                        autoOk
                                        data-testid="eventDate"
                                        variant="inline"
                                        inputVariant="outlined"
                                        value={pullPlanEvent.eventDate}
                                         onChange={(d: any) => {
                                         onDateChangeHandler(d, 'eventDate');
                                         }}
                                        format="dd MMM yyyy"
                                        name="eventDate"
                                        placeholder="Pick a date"
                                        KeyboardButtonProps={{
                                        'aria-label': 'change date',
                                        }}
                                        minDate={new Date()}
                                        minDateMessage="Please choose a date that is not in the past"
                                        shouldDisableDate={shouldDisableDate}
                                        // maxDate={new Date(new Date().setDate(new Date().getDate() + 30))}
                                    />
                                </MuiPickersUtilsProvider>    
                            </div>   
                        </div>
                        <div className="pullPlan__right">
                            <div className="pullPlan__right__assignee">
                                
                                <div className="pullPlan__right__assignee__label">
                                    Add your Team here! 
                                    {selectedAssignee.length? (<span> ({selectedAssignee.length})</span>): ('')}
                                </div>
                                {isAdduserOpen?(
                                        <div className="pullPlan__right__assignee__add-assignee">
                                        <UserSelect userIds={selectedAssignee.map(item=>item.id)} 
                                        save={saveAssigne} closeUserSelect={closeAddOption}/></div>
                                    ):(<div className="pullPlan__right__assignee__add-assignee" 
                                        data-testid="pullPlan-addAssignee" 
                                        onClick={()=>setIsAdduserOpen(true)}>
                                        + Add Assignee</div>)}
                                <div className="pullPlan__right__assignee__wrapper">
                                    {
                                        selectedAssignee.length ? (
                                            
                                                selectedAssignee.map((assignee: any, index: number) => (
                                                    <div className="pullPlan__right__assignee__info" key={assignee.id}>
                                                    <Avatar alt="{assignee.name}" src="" />
                                                    <div className="pullPlan__right__assignee__info__name">{assignee.name}</div>
                                                    <div className="pullPlan__right__assignee__info__close" data-testid="pullPlan-removeAssignee">
                                                        <CloseIcon fontSize="small" onClick={()=>removeAssignee(index)} />
                                                    </div>
                                                </div>
                                                ))

                                        ): (
                                            
                                         <div className="pullPlan__right__assignee__container">
                                            <div className="pullPlan__right__assignee__container__no-data">
                                                looks like its lonely out here, start by adding members to your pull planning team
                                            </div>
                                         </div>   

                                        )
                                    }

                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="pullPlan__footer">
                                <>
                                { isEdit && (<div className="pullPlan__footer__btn" onClick={() => setIsDelete(true)}>
                                        <DeleteIcon className="pullPlan__footer__btn__icon" /> Delete
                                </div>)}
                                <div className="pullPlan__footer__action" style={{width:`${isEdit?'50%':'100%'}`}}>
                                    <Button
                                        variant="outlined"
                                        className="btn-secondary"
                                        data-testid="pullPlan-delete"
                                        onClick={()=>handleDialogClose()}
                                    > 
                                        Cancel
                                    </Button>
                                    {isEdit?( <Button
                                        variant="outlined"
                                        className="btn-primary"
                                        onClick={() => update(false)}
                                        disabled={isFormFilled}
                                        data-testid="pullPlan-update"
                                    >
                                        Update
                                    </Button>):( <Button
                                        variant="outlined"
                                        className="btn-primary"
                                        onClick={inviteSave}
                                        disabled={isFormFilled}
                                        data-testid="pullPlan-create"
                                    >
                                        Create Invite
                                    </Button>)}

                                </div>  
                            </>
                         
                    </div>
                </DialogContent>

            </Dialog>
        </div>
         {isDelete && (
            <ConfirmDialog
              open={isDelete}
              message={{
                text: `Are you sure? All activities submitted until now will be lost. 
                Do you want to delete this event?`,
                cancel: 'Cancel',
                proceed: 'Yes. Proceed',
              }}
              close={() => {
                setIsDelete(false)
              }}
              proceed={() => {
                update(true);
              }}
            />
          )}
       
        </React.Fragment>
         ) 
}    

export default CreatePullPlan