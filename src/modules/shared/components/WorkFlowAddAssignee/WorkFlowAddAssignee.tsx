import {
    Avatar,
    Box,
    Button,
    IconButton,
    InputAdornment,
    makeStyles,
    TextField,
  } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import CheckIcon from "@material-ui/icons/Check";  
import SearchIcon from "@material-ui/icons/Search";
import React, { ReactElement, useContext, useEffect, useState } from "react";
import { match, useRouteMatch } from "react-router-dom";
import { useDebounce } from "../../../../customhooks/useDebounce";
import { client } from "../../../../services/graphql";
import {  myProjectRole, tenantUserRole } from "../../../../utils/role";
import { workFlowContext } from "../../../baseService/context/workflow/workflowContext";
import { FETCH_PROJECT_ASSOCIATED_USERS,
  FETCH_PROJECT_ASSOCIATED_USERS_BY_FULLNAME } from "../../../baseService/graphql/queries/users";
import "./WorkFlowAddAssignee.scss";

export interface Params {
  projectId: string;
  id: string;
  featureId: string
}

const useStyles = makeStyles(() => ({
  input: {
    height: "3.8rem",
    padding: "0.2rem 0.5rem",
    fontFamily: "Poppins",
    letterSpacing: "0.02em",
    color: "#1F1F1F",
  },
}));
  
  function WorkFlowAddAssignee({setAssignee, discard , currentStepAssignee}:any): ReactElement {
    const [assigneesList, setAssigneesList]: any = React.useState([]);
    const [userSearchName, setUserSearchName] = useState("");
    const debounceUserSearchName = useDebounce(userSearchName,300);
    const pathMatch:match<Params>= useRouteMatch();
    const [assignedUsers, setAssignedUsers] = useState<Array<any>>([]);
    const [newlyassignedUsers, setNewlyAssignedUsers] = useState<Array<any>>([]);
    const {workFlowState}:any = useContext(workFlowContext);
    const classes = useStyles();

    useEffect(() => {
      setAssignedUsers(JSON.parse(JSON.stringify(currentStepAssignee)));
    }, [currentStepAssignee])

    useEffect(() => {
      if(debounceUserSearchName.trim()){
        fetchSearchedUsers();
      }
    }, [debounceUserSearchName]);

    const fetchSearchedUsers= async ()=>{
      try{
        const name = debounceUserSearchName.split(/\s+/);
        let fName = debounceUserSearchName;
        let lName = '';
        if(name.length > 1) {
            fName = name[0].trim();
            lName = lName = name[1].trim() ? name[1].trim() : '';
        }
        let projectId=Number(pathMatch.params.projectId);
        if(workFlowState.viewType!=='PROJECT'){
          projectId=Number(pathMatch.params.id);
        }
        const projectAssociationResponse= await client.query({
          query: lName ? FETCH_PROJECT_ASSOCIATED_USERS_BY_FULLNAME : FETCH_PROJECT_ASSOCIATED_USERS,
          variables:{
            projectId:  projectId,
            fName:`${fName?"%"+fName+"%":fName}`,
            lName: `%${lName}%`
          },
          fetchPolicy: 'network-only',
          context:{role: myProjectRole.viewMyProjects}
      });
      const targetUsers: Array<any>=[];
      if(projectAssociationResponse.data.projectAssociation.length>0) {
        projectAssociationResponse.data.projectAssociation.forEach((item: any)=>{
          if(workFlowState.allowedRoles.indexOf(item.role)>-1){
            const name= item.status==3 && item.user.firstName && item.user.lastName?`${item.user.firstName} ${item.user.lastName}`:
            item.user.email.split('@')[0];
            const user={
              name: name,
              email: item.user.email,
              id: item.user.id
            }
            targetUsers.push(user);
          }
        });
      }
      setAssigneesList(targetUsers);
      } catch(error: any){
        console.log(error.message)
      }
    }
  
    const addAssignie = (argvalue: any) => {
        if(currentStepAssignee.map((item: any)=>item.id).indexOf(argvalue.id)===-1){
          const assigness= [...assignedUsers];
          const currentuser= assigness.find((item)=>item.id=== argvalue.id);
          const currentAssigneIndex= assigness.indexOf(currentuser);
          if(currentAssigneIndex===-1){
            assigness.push(argvalue);
          } else{
            assigness.splice(currentAssigneIndex,1);
          }
          setAssignedUsers(assigness);
          const newAssignee= [...newlyassignedUsers];
          const newAssigniee= newAssignee.find((item)=>item.id === argvalue.id);
          const newAssigneIndex= newAssignee.indexOf(newAssigniee);
          if(newAssigneIndex===-1){
            newAssignee.push(argvalue);
          } else{
            newAssignee.splice(newAssigneIndex,1);
          }
          setNewlyAssignedUsers(newAssignee);
        }
    };

    const changeInSearchName=(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>)=>{
      setUserSearchName(e.target.value);
    }

    const cancel=()=>{
      discard();
    }

    const save=()=>{
      setAssignee(assignedUsers);
    }
  
    return (
      <Box className="WorkFlowAddAssignee__main">
        <TextField
          fullWidth
          autoFocus={true}
          placeholder={"Search"}
          value={userSearchName}
          onChange={(e)=>changeInSearchName(e)}
          InputProps={{
            className: classes.input,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon className="WorkFlowAddAssignee__main__searchIconContainer__searchIcon" />
              </InputAdornment>
            ),
          }}
        />
        <Box className="WorkFlowAddAssignee__main__scrollContainer">
          {assigneesList.map((data: any, i: number) => (
            <Box
              key={i}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              className="WorkFlowAddAssignee__main__assigneeContainer"
            >
              <Box display="flex" alignItems="center">
                <Avatar className="WorkFlowAddAssignee__main__avatar"></Avatar>
                <div className="WorkFlowAddAssignee__main__details">
                  <div className="WorkFlowAddAssignee__main__details__name">
                    {data.name}
                  </div>
                  <div className="WorkFlowAddAssignee__main__details__designation">
                    {data.email}
                  </div>
                </div>
              </Box>
              <IconButton
                className={
                  assignedUsers.map(item=>item.id).indexOf(data.id)===-1
                    ? "WorkFlowAddAssignee__main__addIconContainer"
                    : "WorkFlowAddAssignee__main__addIconContainer WorkFlowAddAssignee__main__checkIconContainer"
                }
                style={{ border: "1px solid"}}
                onClick={() => addAssignie(data)}
              >
                {assignedUsers.map(item=>item.id).indexOf(data.id)===-1 ? (
                  <AddIcon className="WorkFlowAddAssignee__main__addIconContainer__addIcon" />
                ) : (
                  <CheckIcon className="WorkFlowAddAssignee__main__addIconContainer__checkIcon" />
                )}
              </IconButton>
            </Box>
          ))}
        </Box>
        <Box className="WorkFlowAddAssignee__main__action">
             <Button onClick={cancel} className="WorkFlowAddAssignee__main__action__btn">
                  Cancel
             </Button>
             <Button onClick={save} disabled={newlyassignedUsers.length===0} className="WorkFlowAddAssignee__main__action__btn">
                  Save
             </Button>
        </Box>
      </Box>
    );
  }
  
  export default WorkFlowAddAssignee;
  