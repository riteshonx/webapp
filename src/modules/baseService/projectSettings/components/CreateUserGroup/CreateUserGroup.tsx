import React, { ReactElement, useState, useContext, useEffect } from 'react';
import { Button, TextField } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import './CreateUserGroup.scss';
import EnhancedProjectUserListTableTable from '../ProjectUserListTable/ProjectUserListTable';
import { projectDetailsContext } from '../../../projects/Context/ProjectDetailsContext';
import { client } from '../../../../../services/graphql';
import { CREATE_USER_GROUP, LOAD_USERS, LOAD_USER_GROUP_BY_NAME } from '../../graphql/queries/userGroups';
import { ProjectSetupRoles } from '../../../../../utils/role';
import { useDebounce } from '../../../../../customhooks/useDebounce';
import UserGroupUsersTable from '../UserGroupUsersTable/UserGroupUsersTable';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { setEditMode, setIsLoading } from '../../../../root/context/authentication/action';
import CheckIcon from '@material-ui/icons/Check';
import Notification,{ AlertTypes } from '../../../../shared/components/Toaster/Toaster';
import useBeforeunload from 'src/customhooks/useUnload';

interface IProps{
    open: boolean,
    close: (argValue: boolean)=> void,
}


function CreateUserGroup({open, close}: IProps): ReactElement {
    const [userGroupName, setUserGroupName] = useState('');
    const [userGroupDescription, setUserGroupDescription] = useState('');
    const [userGroupNameRequired, setUserGroupNameRequired] = useState(false);
    const [userGroupNameDuplicate, setUserGroupNameDuplicate] = useState(false);
    const [searchName, setSearchName] = useState('');
    const userDebounceName = useDebounce(searchName,600);
    const userGroupDebounceName = useDebounce(userGroupName,600);
    const {projectDetailsState}: any = useContext(projectDetailsContext);
    const [projectTeamMates, setProjectTeamMates] = useState<Array<any>>([]);
    const [selectedUsers, setSelectedUsers] = useState<Array<any>>([]);
    const [isListLookGood, setisListLookGood] = useState(true);
    const [isNameExceedLength, setIsNameExceedLength] = useState(false);
    const { dispatch, state }: any = useContext(stateContext);

    useEffect(() => {
        if(projectDetailsState.projectToken){
            fetchProjectTeamMates();
        }
    }, [projectDetailsState.projectToken,userDebounceName]);

    useEffect(() => {
        if(projectDetailsState.projectToken && userGroupDebounceName.trim() ){
            checkIfGroupNameDuplicate();
        }
    }, [projectDetailsState.projectToken,userGroupDebounceName]);

    useEffect(() => {
        return()=>{
            dispatch(setEditMode(false));
        }
    }, [])
    

    useBeforeunload((event: any) => {
        if(state.editMode) {
             event.preventDefault();
           }
    });

    const checkIfGroupNameDuplicate= async ()=>{
        try{
            const response= await client.query({
                query:LOAD_USER_GROUP_BY_NAME,
                variables:{
                    name: `${userGroupDebounceName.trim()}`
                },
                fetchPolicy:"network-only",
                context:{role: ProjectSetupRoles.viewUserGroup, token: projectDetailsState.projectToken}
            });
            if(response.data.userGroup.length>0){
                setUserGroupNameDuplicate(true);
            } else{
                setUserGroupNameDuplicate(false);
            }
        } catch(error: any){

        }
    }

    const fetchProjectTeamMates= async ()=>{
        try{
            const response= await client.query({
                query:LOAD_USERS,
                variables:{
                    name: `%${userDebounceName.trim()}%`
                },
                fetchPolicy:"network-only",
                context:{role: ProjectSetupRoles.viewUserGroup, token: projectDetailsState.projectToken}
            });
            const targetList: Array<any>=[];
            const selectedUsersList=projectTeamMates.filter((item: any)=>item.isSelected);
            if(response.data.user.length>0){
                response.data.user.forEach((item: any)=>{
                    const currentItem= selectedUsersList.find((userItem: any)=>item.id===userItem.id);
                    if(item.status!== 1 && !currentItem){
                        const userRole = item.projectAssociations && item.projectAssociations.length &&
                         item.projectAssociations[0]?item.projectAssociations[0].projectRole:null;
                        const name= item.status===2?`${item.email.split('@')[0]}`:`${item.firstName||''} ${item.lastName||''}`
                        const newItem={
                            id: item.id,
                            name,
                            email: item.email,
                            isSelected: false,
                            role:userRole && userRole.role?userRole.role:"",
                            company:item.companyAssociations.length ? item.companyAssociations:[],
                            action: ''
                        }
                        targetList.push(newItem);
                    }
                })
            }
            targetList.unshift(...selectedUsersList);
            targetList.sort((a: any, b: any)=>b.isSelected - a.isSelected);
            setProjectTeamMates(targetList);
        }catch(error: any){
            console.log(error);
        }
    }


    const onUserGroupDescriptionChange=(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>)=>{
        if(!state.editMode){
            dispatch(setEditMode(true));
        }
        setUserGroupDescription(e.target.value);
    }

    const onBlur=()=>{
        if(userGroupName.trim()){
         setUserGroupNameRequired(false);
        } else{
         setUserGroupNameRequired(true);
        }
     }
 
     const onUserGroupNameChange=(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        if(!state.editMode){
            dispatch(setEditMode(true));
        }
        const userStr = event.target.value;
        const userStrName = userStr.trim();
         if(userStrName && userStrName.length>50){
            setIsNameExceedLength(true)
            return
         }else{
            setIsNameExceedLength(false)
         }
         setUserGroupName(userStr);
         if(userStr.trim()){
             setUserGroupNameRequired(false);
            } else{
             setUserGroupNameRequired(true);
         }
     }

     const removeUser=(argItem: any)=>{
        if(!state.editMode){
            dispatch(setEditMode(true));
        }
        const currentItem= selectedUsers.find((item: any)=>item.id === argItem.id);
        const index= selectedUsers.indexOf(currentItem);
        if(index>-1){
            selectedUsers.splice(index,1);
            setSelectedUsers([...selectedUsers]);
        }
     }

     const selectAll=(argValue: boolean)=>{
        if(!state.editMode){
            dispatch(setEditMode(true));
        }
        projectTeamMates.forEach((item: any)=>item.isSelected=argValue);
        setProjectTeamMates([...projectTeamMates]);
     }

    const selectUser=(argValue: boolean, argUser: any)=>{
        if(!state.editMode){
            dispatch(setEditMode(true));
        }
        const index= projectTeamMates.indexOf(argUser);
        if(index>-1){
            projectTeamMates[index].isSelected =argValue;
            setProjectTeamMates([...projectTeamMates]);
        }
    }

    const listLooksGood=()=>{
        const selectedUsersList= projectTeamMates.filter((item: any)=>item.isSelected);
        setSelectedUsers(selectedUsersList);
        setisListLookGood(false);
    }

    const editUsers=()=>{
        projectTeamMates.forEach((item: any)=>item.isSelected=false);
        selectedUsers.forEach((item: any)=>{
            const currentProjectUser= projectTeamMates.find((projectUser: any)=>item.id=== projectUser.id);
            if(currentProjectUser){
                currentProjectUser.isSelected= true;
            }
        });
        fetchProjectTeamMates();
        setisListLookGood(true);
    }

    const createNewUserGroup= async ()=>{
        try{
            dispatch(setEditMode(false));
            dispatch(setIsLoading(true));
            await client.mutate({
                mutation: CREATE_USER_GROUP,
                variables:{
                    name: userGroupName.trim(),
                    description: userGroupDescription.trim(),
                    users: [...selectedUsers.map((item: any)=>item.id)]
                },
                context:{role: ProjectSetupRoles.createUserGroup, token: projectDetailsState.projectToken}
            });
            close(true);
            Notification.sendNotification(`Created user group successfully`,AlertTypes.success)
            dispatch(setIsLoading(false));
        }catch(error: any){
            dispatch(setIsLoading(false));
        }
    }


    return (
    <div className={`CreateUserGroup ${open?'open':'close'}`}>
        <div className="CreateUserGroup__left">

        </div>
        <div className="CreateUserGroup__right">
            <div className="CreateUserGroup__right__header">
                <div className="CreateUserGroup__right__header__name">
                    <TextField variant="outlined" data-testid="userGroup-name"
                        autoFocus={true}
                        className="CreateUserGroup__right__header__name__input"
                        onBlur={(e)=>onBlur()}
                        disabled={!projectDetailsState?.projectPermission.canCreateUserGroup}
                        onChange={(e)=> onUserGroupNameChange(e)} value={userGroupName} placeholder="Enter a name"/>  
                        {userGroupNameRequired?(
                            <div data-testid="roleNameerror" className="CreateUserGroup__right__header__name__error"> 
                                Usergroup name is required</div>):userGroupNameDuplicate?(
                            <div data-testid="roleNameerror" className="CreateUserGroup__right__header__name__error"> 
                                Usergroup name already exists</div>):isNameExceedLength?(
                            <div data-testid="roleNameerror" className="CreateUserGroup__right__header__name__error"> 
                                Usergroup name shouldn't exceed 50 character</div>):(
                                <div className="CreateUserGroup__right__header__name__error"></div>)}
                </div>
                <div className="CreateUserGroup__right__header__description">
                    <TextField variant="outlined" data-testid="usergroup-description"
                        className="CreateUserGroup__right__header__description__input"
                        disabled={!projectDetailsState?.projectPermission.canCreateUserGroup}
                        onChange={(e)=> onUserGroupDescriptionChange(e)} value={userGroupDescription} placeholder="Enter the group description"/>  
                </div>
            </div>  
            <div className="CreateUserGroup__right__action">
                    <div className="CreateUserGroup__right__action__main">
                        <div className="CreateUserGroup__right__action__main__subtitle">Select the teammates from the list</div>  
                        <div className="CreateUserGroup__right__action__main__right">
                            {isListLookGood &&(
                                 <div className="CreateUserGroup__right__action__main__right__search">
                                 <TextField value={searchName}
                                     id="list-search-text"
                                     data-testid="templateSearchText"
                                     type="text"
                                     fullWidth
                                     placeholder="Search"
                                     variant="outlined"
                                     onChange={(e: any)=>setSearchName(e.target.value)}
                                     />
                                 <SearchIcon className="CreateUserGroup__right__action__main__right__search__icon"/>
                             </div>  
                            )}
                           
                            {isListLookGood?(<Button className="btn-primary" onClick={listLooksGood}
                                data-testid={`create-list-looks-good`}>
                                    <CheckIcon className="CreateUserGroup__right__action__main__right__icon"/>Save Changes</Button> ):(
                                <Button className="btn-primary" onClick={()=>editUsers()}
                                    data-testid={`create-add-teammates`}>
                                        Add Teammates</Button> 
                            )}
                        </div>
                    </div>                     
            </div>
            <div className="CreateUserGroup__right__body">{
                isListLookGood?( 
                    <EnhancedProjectUserListTableTable 
                        rows={projectTeamMates} 
                        type={"CREATE"}
                        selectAll={selectAll}
                        selectUser={selectUser}/>):(
                    <UserGroupUsersTable 
                         rows={selectedUsers} 
                         type={"CREATE"}
                         removeUser={removeUser} />)}
            </div>
            <div className="CreateUserGroup__right__footer">
                    <Button variant="outlined" data-testid="cancel-create-usergroup"
                                    onClick={()=>{close(false);
                                                dispatch(setEditMode(false));}} 
                                     className="CreateUserGroup__right__footer__btn btn-secondary">Cancel</Button>
                    <Button variant="outlined" data-testid="create-usergroup"
                        onClick={createNewUserGroup}
                        disabled={!userGroupName || userGroupNameRequired || userGroupNameDuplicate || 
                            isListLookGood || selectedUsers.length===0 || isNameExceedLength ||
                            !projectDetailsState?.projectPermission.canCreateUserGroup}
                        className={`CreateUserGroup__right__footer__btn btn-primary`}>Create</Button>
            </div>
        </div>
     </div>
    )
}

export default CreateUserGroup;
