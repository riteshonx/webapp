import {
  Avatar,
  Box,
  IconButton,
  TextField,
  Tooltip,
} from "@material-ui/core";
import AvatarGroup from "@material-ui/lab/AvatarGroup";
import React, { ReactElement, useContext } from "react";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import EditIcon from "@material-ui/icons/Edit";
import "./WorkFloweStep.scss";
import OutsideClickHandler from 'react-outside-click-handler';
import DeleteIcon from "@material-ui/icons/DeleteOutline";
import AddAssigneeSearchBox from "../WorkFlowAddAssignee/WorkFlowAddAssignee";
import { workFlowContext } from "../../../baseService/context/workflow/workflowContext";
import { CREATE_WORK_FLOW_ASSIGNEES, CREATE_WORK_FLOW_STEP_DEF, UPDATE_WORK_FLOW_STEP_DURATION,
         DELETE_STEP_ASSIGNEE } from "../../../baseService/graphql/queries/workflow";
import { client } from "../../../../services/graphql";
import { ProjectSetupRoles } from "../../../../utils/role";
import { match, useRouteMatch } from "react-router-dom";
import NumberFormat from "react-number-format";
import { decodeProjectExchangeToken } from "../../../../services/authservice";
import { projectDetailsContext } from "../../../baseService/projects/Context/ProjectDetailsContext";
import { setIsLoading } from "src/modules/root/context/authentication/action";
import { stateContext } from "src/modules/root/context/authentication/authContext";

export interface Params {
  projectId: string;
}

function WorkFloweStep({ item }: any): ReactElement {
  const [editDuration, setEditDuration] = React.useState(false);
  const [duration, setDuration] = React.useState(0);
  const [viewAllAssignees, setViewAllAssignees] = React.useState(false);
  const [currentStepAssignee, setCurrentStepAssignee] = React.useState<Array<any>>([]);
  const [showAssigneeSearchBox, setShowAssigneeSearchBox] = React.useState(false);
  const {workFlowState}:any = useContext(workFlowContext);
  const pathMatch:match<Params>= useRouteMatch();
  const {projectDetailsState}: any = useContext(projectDetailsContext);
  const { dispatch }: any = useContext(stateContext);
  const [workflowTemplateMaxId, setWorkflowTemplateMaxId]  = React.useState<number>(-1)


  React.useEffect(()=>{
    const workFlowId = workFlowState.workflowTemplateMaxId ?? workFlowState.workFlowRootId;
    setWorkflowTemplateMaxId(workFlowId)

  },[workFlowState.workflowTemplateMaxId,workFlowState.workFlowRootId])

  React.useEffect(() => {
    const currentValue= workFlowState.stepAssignees.find((currentStep: any)=> currentStep.stepDefName === item.stepDefName)
    const currentIndex= workFlowState.stepAssignees.indexOf(currentValue);
    if(currentIndex>-1){
      const currentStep= workFlowState.stepAssignees[currentIndex];
      if(workFlowState.viewType==='PROJECT' && item.stepType!== 'end' &&
         item.stepType!== 'start' && currentStep.stepDefId ===-1 && 
         projectDetailsState.projectPermission.canUpdateProjectTemplateAssociation){
          createWorkflowProjectStepDef(currentIndex);
          setDuration(3);
      } else{
        setDuration(currentStep.duration===0?3:currentStep.duration);
      }
      setCurrentStepAssignee(JSON.parse(JSON.stringify(currentStep.assignees)));
    } else{
      if(workFlowState.viewType==='PROJECT' && item.stepType!== 'end' &&
      item.stepType!== 'start' &&
         projectDetailsState.projectPermission.canUpdateProjectTemplateAssociation){
        createWorkflowProjectStepDef(currentIndex);
      } 
      setDuration(3);
    }
  }, [])

  const handleDurationChange = (e: any) => {
    const value = e.target.value;
    setDuration(value);
    const currentValue= workFlowState.stepAssignees.find((currentStep: any)=> currentStep.stepDefName === item.stepDefName)
    const currentIndex= workFlowState.stepAssignees.indexOf(currentValue);
    if(currentIndex>-1){
      workFlowState.stepAssignees[currentIndex].duration=value;
    }
    e.stopPropagation();
    e.preventDefault();
  };

  const handleShowSearchBox = () => {
    setShowAssigneeSearchBox(true);
  };
  
  const setAssignee=(value: any)=>{
    if(workFlowState.viewType==='PROJECT'){
        addNewAssigneeToStep(value);
    } else{
      const currentValue= workFlowState.stepAssignees.find((currentStep: any)=> currentStep.stepDefName === item.stepDefName)
      const currentIndex= workFlowState.stepAssignees.indexOf(currentValue);
      if(currentIndex>-1){
        workFlowState.stepAssignees[currentIndex].assignees=value;
      }
      setCurrentStepAssignee(value);
      setShowAssigneeSearchBox(false);
    }
  }

  const discard=()=>{
    setShowAssigneeSearchBox(false);
  }

  const removeFollower=async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>,argValue: any, argIndex: number)=>{
    event.stopPropagation();
    event.preventDefault();
    const currentValue= workFlowState.stepAssignees.find((currentStep: any)=> currentStep.stepDefName === item.stepDefName)
    const currentIndex= workFlowState.stepAssignees.indexOf(currentValue);
    if(workFlowState.viewType==='PROJECT'){
      deleteUserFromAssigneList(argValue, argIndex, currentIndex);
    } else{
      currentStepAssignee.splice(argIndex,1);
      setCurrentStepAssignee([...currentStepAssignee]);
      workFlowState.stepAssignees[currentIndex].assignees=[...currentStepAssignee];
    }
  }

  const deleteUserFromAssigneList=async (argValue: any, argIndex: number, currentIndex: number)=>{
    try{
      if(currentIndex>-1){
        dispatch(setIsLoading(true));
        await client.mutate({
          mutation: DELETE_STEP_ASSIGNEE,
          variables:{
            assignee: argValue.id,
            stepDefName: workFlowState.stepAssignees[currentIndex].stepDefId
          },
          context:{role: ProjectSetupRoles.updateProjectTemplateAssociation,token: projectDetailsState.projectToken},
        })
        currentStepAssignee.splice(argIndex,1);
        setCurrentStepAssignee([...currentStepAssignee]);
        workFlowState.stepAssignees[currentIndex].assignees=[...currentStepAssignee];
        dispatch(setIsLoading(false));
      }
    } catch(error: any){
      dispatch(setIsLoading(false));
      console.log(error.message);
    }
  }

  const addNewAssigneeToStep=(argCureentAssigniees: Array<any>)=>{
    try{
        const currentValue= workFlowState.stepAssignees.find((currentStep: any)=> currentStep.stepDefName === item.stepDefName)
        const currentIndex= workFlowState.stepAssignees.indexOf(currentValue);
        if(currentIndex>-1){
          const currentValues=workFlowState.stepAssignees[currentIndex].assignees;
          const newlyAssignedUsers= argCureentAssigniees.filter((curr: any)=>
                currentValues.every((setAssign: any)=>setAssign.id !==curr.id));
          if(newlyAssignedUsers.length>0){
            assignUsersToCurrentStep(newlyAssignedUsers,currentIndex);
          }
          setCurrentStepAssignee(argCureentAssigniees);
          setShowAssigneeSearchBox(false);
        }
    } catch(error: any){
      console.log(error.message);
    }
  }

  const assignUsersToCurrentStep= async (argPayload: Array<any>, argIndex: number)=>{
    try{
      const payloadList: Array<any>=[];
      argPayload.forEach((assignItem: any)=>{
        payloadList.push({
          assignee:assignItem.id,
          wfProjectStepDefId: workFlowState.stepAssignees[argIndex].stepDefId
        })
      });
      await client.mutate({
        mutation: CREATE_WORK_FLOW_ASSIGNEES,
        variables:{object: payloadList},
        context:{role: ProjectSetupRoles.updateProjectTemplateAssociation, token: projectDetailsState.projectToken}
      });
      workFlowState.stepAssignees[argIndex].assignees.push(...argPayload);
    } catch(error: any){
      console.log(error.message);
    }
  }

  const saveDurationValue=()=>{
    if(workFlowState.viewType==='PROJECT'){
      const currentValue= workFlowState.stepAssignees.find((currentStep: any)=> currentStep.stepDefName === item.stepDefName)
      const currentIndex= workFlowState.stepAssignees.indexOf(currentValue);
      if(currentIndex>-1 && Number(duration)>0){
        updateWorkFlowProjectStepDef(currentIndex);
      }
    }
    setEditDuration(false)
  }

  const createWorkflowProjectStepDef=async (argIndex: number)=>{
    try{
      const durationInDays= Number(duration)>0?Number(duration):3;
      const response= await client.mutate({
        mutation: CREATE_WORK_FLOW_STEP_DEF,
        variables:{
          projectId: Number(pathMatch.params.projectId),
          stepDefName: item.stepDefName,
          workflowTemplateId: workFlowState.workFlowRootId,
          durationInDays: durationInDays,
          featureType: workFlowState.featureType
        },
        context:{role: ProjectSetupRoles.updateProjectTemplateAssociation, token: projectDetailsState.projectToken}
      });
      if(response.data.insert_workflowProjectStepDef.returning){
        if(argIndex>0){
          workFlowState.stepAssignees[argIndex].stepDefId=response.data.insert_workflowProjectStepDef.returning[0].id;
        } else{
          const newItem={
            stepDefName: item.stepDefName,
            duration: 3,
            assignees: [],
            stepDefId: response.data.insert_workflowProjectStepDef.returning[0].id,
            type: item.stepType
          }
          workFlowState.stepAssignees.push(newItem);
        }
        setDuration(durationInDays);
      }
    }catch(error: any){
      console.log(error.message);
    }
  }

  const updateWorkFlowProjectStepDef=async (argIndex: number)=>{
    try{
          await client.mutate({
          mutation: UPDATE_WORK_FLOW_STEP_DURATION,
          variables:{
            stepDefName: item.stepDefName,
            durationInDays: Number(duration),
            workflowTemplateId: workflowTemplateMaxId
          },
          context:{role: ProjectSetupRoles.updateProjectTemplateAssociation,token: projectDetailsState.projectToken},
        });
        workFlowState.stepAssignees[argIndex].duration=duration;
    }catch(error: any){
      console.log(error.message);
    }
  }

  const showMore=(e: any)=> {
    e.stopPropagation();
    setViewAllAssignees(true);
    setShowAssigneeSearchBox(false);
  }
  
  return (
    <Box
      display="flex"
      flexDirection="column"
      flexGrow={1}
      className="WorkFloweStep__main"
      justifyContent={
        item.stepType !== "start" && item.stepType !== "end"
          ? "center"
          : undefined
      }
      flexWrap="wrap"
    >
      {(item.stepType === "start" || item.stepType === "end") && (
        <Box className="WorkFloweStep__main__stepTypeContainer">
          {item.stepType === "start" ? (
            <Box
              display="flex"
              alignItems="center"
              className="WorkFloweStep__main__stepType WorkFloweStep__main__stepType__text1"
            >
              Start
            </Box>
          ) : (
            <Box
              display="flex"
              alignItems="center"
              className="WorkFloweStep__main__stepType WorkFloweStep__main__stepType__text2"
            >
              <CheckCircleIcon
                htmlColor="#1F412B"
                className="WorkFloweStep__main__stepType__text2__icon"
              />
              Final Step
            </Box>
          )}
        </Box>
      )}
      <Box display="flex" flexGrow={1} flexWrap="wrap" alignItems="center">
        <Box className="WorkFloweStep__main__addedStepName">
          {item.label}
        </Box>
      </Box>
      {currentStepAssignee.length>0 && !(item.stepType === "start" || item.stepType === "end") && 
      <Box display="flex" flexGrow={1} flexWrap="wrap" alignItems="center">
        <Box className="WorkFloweStep__main__assignee">
        Assignee
        </Box>
      </Box>}
      {currentStepAssignee.length>0 &&
      item.stepType !== "start" &&
      item.stepType !== "end" ? (
        <Box
          display="flex"
          flexDirection="column"
          className="WorkFloweStep__main__assigneeContainer"
        >
          <Box
            display="flex"
            alignItems="center"
            className="WorkFloweStep__main__assigneeContainer__avatar"
          >
            <AvatarGroup
              max={3}
              className="WorkFloweStep__main__assigneeContainer__avatar__avatarContainer"
            >
              {currentStepAssignee.map((val: any, i: number) => (
                <Tooltip title={val.name}>
                <Avatar
                  key={i}
                  className="WorkFloweStep__main__assigneeContainer__avatar__avatarIcon"
                  alt={val.name}
                  src={val.name}
                />
                </Tooltip>
              ))}
            </AvatarGroup>
              {workFlowState.viewType !== "FEATURE_UPDATE" &&  <div>
                  {viewAllAssignees?(<div className="WorkFloweStep__main__assigneeContainer__avatar__avatarLink">
                   Less
                  </div>):(<span className="WorkFloweStep__main__assigneeContainer__avatar__avatarLink"
                    onClick={(e: any) =>showMore(e)}>
                   More
                  </span>)}
                </div>}
          </Box>
        </Box>
      ) : null}

      {viewAllAssignees ? (
          <OutsideClickHandler
              onOutsideClick={() => setViewAllAssignees(false)}>
              <Box
                className="WorkFloweStep__main__assigneeContainerExpand"
                onClick={(e) => e.stopPropagation()}
              >
                {currentStepAssignee.map((val: any, index: number) => (
                  <Box
                    key={`${val.id}-${index}`}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    className="WorkFloweStep__main__assigneeContainerExpand__scrollContainer"
                  >
                    <Box display="flex" alignItems="center">
                      <Avatar
                        alt={""}
                        className="WorkFloweStep__main__assigneeContainerExpand__avatarIcon"
                      ></Avatar>
                      {val.name}
                    </Box>
                    {workFlowState.viewType === "PROJECT" && projectDetailsState.projectPermission.canUpdateProjectTemplateAssociation &&
                       <IconButton className="WorkFloweStep__main__assigneeContainerExpand__deleteIconContainer" 
                       onClick={(e)=>removeFollower(e,val,index)}>
                         <DeleteIcon className="WorkFloweStep__main__assigneeContainerExpand__deleteIconContainer__deleteIcon" />
                       </IconButton>
                   }
                    {workFlowState.viewType === "FEATURE_CREATE" &&
                       <IconButton className="WorkFloweStep__main__assigneeContainerExpand__deleteIconContainer" 
                       onClick={(e)=>removeFollower(e,val,index)}>
                         <DeleteIcon className="WorkFloweStep__main__assigneeContainerExpand__deleteIconContainer__deleteIcon" />
                       </IconButton>
                   }
                   </Box>
                ))}
              </Box>
          </OutsideClickHandler>
        ) : null}

      {!showAssigneeSearchBox && workFlowState.viewType === "FEATURE_CREATE" && 
      item.stepType !== "start" && item.stepType !== "end" ? (
        <Box
          className="WorkFloweStep__main__assigneeContainer__addAssigneeText"
          onClick={handleShowSearchBox}
        >
          + Add Assignee
        </Box>
      ) : null}

    {!showAssigneeSearchBox && workFlowState.viewType === "PROJECT" &&  
      decodeProjectExchangeToken(projectDetailsState.projectToken).allowedRoles.indexOf(ProjectSetupRoles.updateProjectTemplateAssociation)>-1 &&
      item.stepType !== "start" && item.stepType !== "end" ? (
        <Box
          className="WorkFloweStep__main__assigneeContainer__addAssigneeText"
          onClick={handleShowSearchBox}
        >
          + Add Assignee
        </Box>
      ) : null}

      
  
       {showAssigneeSearchBox ? (
          <OutsideClickHandler
              onOutsideClick={() => setShowAssigneeSearchBox(false)}>
                <Box
                  style={{ maxWidth: "26rem" }}
                  onClick={(e: any) => e.stopPropagation()}
                >
                  <AddAssigneeSearchBox setAssignee={setAssignee} discard={discard} currentStepAssignee={currentStepAssignee}/>
                </Box>
          </OutsideClickHandler>
      ) : null}
      {!showAssigneeSearchBox &&
      item.stepType !== "start" &&
      item.stepType !== "end" ? (
        editDuration ? (
          <Box
            display="flex"
            alignItems="start"
            flexDirection="column"
            className="WorkFloweStep__main__duration"
          >
            <span>Duration</span>
            <Box display="flex">
              {/* <Input
                className="WorkFloweStep__main__duration__input"
                placeholder="No. of days"
                id="component-simple"
                type="number"
                value={duration}
                onChange={handleDurationChange}
                onBlur={saveDurationValue}
                onClick={(e) => e.stopPropagation()}
              /> */}
               <NumberFormat
                    inputMode="numeric"
                    allowNegative={false}
                    allowLeadingZeros={false}
                    customInput={TextField}
                    decimalScale={0}
                    className="WorkFloweStep__main__duration__input"
                    margin="normal"
                    InputLabelProps={{  
                        shrink: true,
                    }}  
                    autoFocus={true}
                    name="duration"
                    max={999}
                    value={duration}
                    placeholder='No. of days' 
                    onChange={(e)=>handleDurationChange(e)} 
                    onBlur={saveDurationValue}
                    isAllowed={(values) => {
                        const {floatValue} = values;
                        if(floatValue)
                        return floatValue > 0 &&  floatValue < 1000;
                        else
                        return true
                      }}                                 
                  /> 
            </Box>
          </Box>
        ) : (
          <Box
            display="flex"
            alignItems="center"
            className="WorkFloweStep__main__duration"
          >
            Duration:{" " + duration + " days"}
            <IconButton
              className="WorkFloweStep__main__duration__editIconContainer"
              onClick={(e) => {
                e.stopPropagation();
                setEditDuration(true);
              }}
            >
              { workFlowState.viewType === "FEATURE_CREATE"&&
               <EditIcon className="WorkFloweStep__main__duration__editIconContainer__editIcon"></EditIcon>}
              {(workFlowState.viewType === "PROJECT" &&  
               projectDetailsState.projectPermission.canUpdateProjectTemplateAssociation)&&
               <EditIcon className="WorkFloweStep__main__duration__editIconContainer__editIcon"></EditIcon>}
            </IconButton>
          </Box>
        )
      ) : null}
        {duration==0 && !(item.stepType === "start" || item.stepType === "end")  &&
          <label  className="WorkFloweStep__main__duration__error">Duration must be greater than 0</label>}
    </Box>
  );
}

export default React.memo(WorkFloweStep);
