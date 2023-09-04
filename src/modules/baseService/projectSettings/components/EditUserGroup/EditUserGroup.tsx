import React, { ReactElement, useState, useContext, useEffect } from 'react';
import { Button, TextField } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import EnhancedProjectUserListTableTable from '../ProjectUserListTable/ProjectUserListTable';
import { projectDetailsContext } from '../../../projects/Context/ProjectDetailsContext';
import { client } from '../../../../../services/graphql';
import { FETCH_USER_GROUP_DETAILS, INSERT_USER_GROUP_ASSOCIATION, LOAD_USERS, 
        LOAD_USER_GROUP_BY_NAME, REMOVE_USER_FROM_USERGROUP, UPDATE_USER_GROUP_NAME_DESCRIPTION } from '../../graphql/queries/userGroups';
import { ProjectSetupRoles } from '../../../../../utils/role';
import { useDebounce } from '../../../../../customhooks/useDebounce';
import UserGroupUsersTable from '../UserGroupUsersTable/UserGroupUsersTable';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { setEditMode, setIsLoading } from '../../../../root/context/authentication/action';
import Notification,{ AlertTypes } from '../../../../shared/components/Toaster/Toaster';
import CheckIcon from '@material-ui/icons/Check';
import './EditUserGroup.scss';
import useBeforeunload from 'src/customhooks/useUnload';

interface IProps{
    open: boolean,
    id: number,
    close: (argValue: boolean)=> void,
    isView:boolean
}


function EditUserGroup({open, close, id,isView}: IProps): ReactElement {
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
    const [originalSelectedUsers, setOriginalSelectedUsers] = useState<Array<any>>([]);
    const [isListLookGood, setisListLookGood] = useState(false);
    const { dispatch, state }: any = useContext(stateContext);
    const [isNameExceedLength, setIsNameExceedLength] = useState(false);

    useEffect(() => {
        if(projectDetailsState.projectToken){
            if(isListLookGood){
                fetchProjectTeamMates();
            } else{
                fetchUserGroupMembers();
            }
        }
    }, [projectDetailsState.projectToken,userDebounceName]);

    useEffect(() => {
        if(projectDetailsState.projectToken && userGroupDebounceName.trim() ){
            checkIfGroupNameDuplicate();
        }
    }, [projectDetailsState.projectToken,userGroupDebounceName]);

    useEffect(() => {
       if(projectDetailsState.projectToken && id){
            fetchUserGroupDetails();
        }
    }, [projectDetailsState.projectToken, id])

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

    const fetchUserGroupDetails= async()=>{
        try{
            const response= await client.query({
                query:FETCH_USER_GROUP_DETAILS,
                variables:{
                    id
                },
                fetchPolicy:"network-only",
                context:{role: ProjectSetupRoles.viewUserGroup, token: projectDetailsState.projectToken}
            });
            const targetList: Array<any>=[];
            if(response.data.userGroup.length>0){
                setUserGroupName(response.data.userGroup[0].name)
                setUserGroupDescription(response.data.userGroup[0].description);
                response.data.userGroup[0].groupUsers.forEach((item: any)=>{
                    if(item.users.status!== 1){
                        const userRole = item.users.projectAssociations && item.users.projectAssociations.length &&
                        item.users.projectAssociations[0]?item.users.projectAssociations[0].projectRole:null;
                        const name= item.users.status===2?`${item.users.email.split('@')[0]}`:`${item.users.firstName||''} ${item.users.lastName||''}`
                        const newItem={
                            id: item.users.id,
                            name,
                            email: item.users.email,
                            isSelected: true,
                            action: '',
                            role:userRole && userRole.role?userRole.role:"",
                            company:item.users.companyAssociations.length ? item.users.companyAssociations:[]
                        }
                        targetList.push(newItem);
                    }
                })
            }
            setSelectedUsers(targetList);
            setOriginalSelectedUsers([...targetList]);
        } catch(error: any){

        }
    }

    const fetchUserGroupMembers= async ()=>{
        try{

        } catch(error: any){

        }
    }

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
                if(response.data.userGroup[0].id!==id){
                    setUserGroupNameDuplicate(true);
                    return
                }  
            }
            setUserGroupNameDuplicate(false);
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
            if(response.data.user.length>0){
                response.data.user.forEach((item: any)=>{
                    const currentItem= selectedUsers.find((userItem: any)=>item.id===userItem.id);
                    const userRole = item.projectAssociations && item.projectAssociations.length &&
                    item.projectAssociations[0]?item.projectAssociations[0].projectRole:null;
                    if(item.status!== 1 && !currentItem){
                        const name= item.status===2?`${item.email.split('@')[0]}`:`${item.firstName||''} ${item.lastName||''}`
                        const newItem={
                            id: item.id,
                            name,
                            email: item.email,
                            isSelected: false,
                            action: '',
                            role:userRole && userRole.role?userRole.role:"",
                            company:item.companyAssociations.length ? item.companyAssociations:[]
                        }
                        targetList.push(newItem);
                    } else{
                        const name= item.status===2?`${item.email.split('@')[0]}`:`${item.firstName||''} ${item.lastName||''}`
                        const newItem={
                            id: item.id,
                            name,
                            email: item.email,
                            isSelected: true,
                            action: '',
                            role:userRole && userRole.role?userRole.role:"",
                            company:item.companyAssociations.length ? item.companyAssociations:[]
                        }
                        targetList.push(newItem);
                    }
                })
            }
            targetList.sort((a: any, b: any)=>b.isSelected - a.isSelected);
            setProjectTeamMates(targetList);
        }catch(error: any){
            console.log(error);
        }
    }


    const onUserGroupDescriptionChange=(e: any)=>{
        setUserGroupDescription(e.target.value);
        if(!state.editMode){
            dispatch(setEditMode(true));
        }
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
         if(event.target.value.trim()){
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
        setSearchName('');
    }

    const editUsers=()=>{
        fetchProjectTeamMates();
        setisListLookGood(true);
        setSearchName('');
    }

    const updateUserGroup= async ()=>{
        try{
            dispatch(setEditMode(false));
            const newUsers= selectedUsers.filter((item: any)=>originalSelectedUsers.every((originalUser: any)=>
            item.id !== originalUser.id));
            const removedUsers= originalSelectedUsers.filter((originalUser: any)=>selectedUsers.every((item: any)=>
            item.id !== originalUser.id && originalUser.isSelected));
            const promiseList: Array<any>=[];

            dispatch(setIsLoading(true));
            promiseList.push(client.mutate({
                mutation: UPDATE_USER_GROUP_NAME_DESCRIPTION,
                variables:{
                    Id:id,
                    name: userGroupName.trim(),
                    description: userGroupDescription.trim()
                },
                context:{role: ProjectSetupRoles.updateUserGroup, token: projectDetailsState.projectToken}
            }));
            if(newUsers.length>0){
                newUsers.forEach((item: any)=>{
                    promiseList.push(client.mutate({
                        mutation: INSERT_USER_GROUP_ASSOCIATION,
                        variables:{
                            userGroupId:id,
                            userId: item.id,
                        },
                        context:{role: ProjectSetupRoles.createUserGroup, token: projectDetailsState.projectToken}
                    }));
                })
            }
            removedUsers.forEach((item: any)=>{
                promiseList.push(client.mutate({
                    mutation: REMOVE_USER_FROM_USERGROUP,
                    variables:{
                        userId: item.id,
                        userGroupId:id
                    },
                    context:{role: ProjectSetupRoles.updateUserGroup, token: projectDetailsState.projectToken}
                }));
            });
            await Promise.all(promiseList);
            if(removedUsers.length>0){
                Notification.sendNotification(`Updated successfully, the teammates will be removed from this user group and will
                     no longer receive notifications associated with this user group`,AlertTypes.success)
            } else{
                Notification.sendNotification(`Updated successfully`,AlertTypes.success)
            }
            close(true);
            dispatch(setIsLoading(false));
        }catch(error: any){
            dispatch(setIsLoading(false));
        }
    }


    return (
    <div className={`EditUserGroup ${open?'open':'close'}`}>
        <div className="EditUserGroup__left">

        </div>
        <div className="EditUserGroup__right">
            <div className="EditUserGroup__right__header">
                <div className="EditUserGroup__right__header__name">
                    <TextField variant="outlined" data-testid="userGroup-name"
                        autoFocus={true}
                        disabled={!projectDetailsState?.projectPermission.canUpdateUserGroup}
                        className="EditUserGroup__right__header__name__input"
                        onBlur={(e)=>onBlur()}
                        onChange={(e)=> onUserGroupNameChange(e)} value={userGroupName} placeholder="Enter a name"/>  
                        {userGroupNameRequired?(
                            <div data-testid="roleNameerror" className="EditUserGroup__right__header__name__error"> 
                                Usergroup name is required</div>):userGroupNameDuplicate?(
                            <div data-testid="roleNameerror" className="EditUserGroup__right__header__name__error"> 
                                Usergroup name already exists</div>):isNameExceedLength?(
                            <div data-testid="roleNameerror" className="CreateUserGroup__right__header__name__error"> 
                                Usergroup name shouldn't exceed 50 character</div>):(
                                <div className="EditUserGroup__right__header__name__error"></div>)}
                </div>
                { !isView ? (<div className="EditUserGroup__right__header__description">
                    <TextField variant="outlined" data-testid="usergroup-description"
                        disabled={!projectDetailsState?.projectPermission.canUpdateUserGroup}
                        className="EditUserGroup__right__header__description__input"
                        onChange={(e)=> onUserGroupDescriptionChange(e)} value={userGroupDescription} placeholder="Enter the group description"/>  
                </div>):isView && userGroupDescription ?(<div className="EditUserGroup__right__header__description">
                    <TextField variant="outlined" data-testid="usergroup-description"
                        disabled={!projectDetailsState?.projectPermission.canUpdateUserGroup}
                        className="EditUserGroup__right__header__description__input"
                        onChange={(e)=> onUserGroupDescriptionChange(e)} value={userGroupDescription} placeholder="Enter the group description"/>  
                </div>):""}
            </div>  
            <div className="EditUserGroup__right__action">
                    <div className="EditUserGroup__right__action__main">
                    {!isView ? <div className="EditUserGroup__right__action__main__subtitle">Select the teammates from the list</div> :""} 
                        <div className="EditUserGroup__right__action__main__right">
                            {isListLookGood &&  <div className="EditUserGroup__right__action__main__right__search">
                                <TextField value={searchName}
                                    id="list-search-text"
                                    data-testid="templateSearchText"
                                    type="text"
                                    fullWidth
                                    placeholder="Search"
                                    variant="outlined"
                                    onChange={(e: any)=>setSearchName(e.target.value)}
                                    />
                                <SearchIcon className="EditUserGroup__right__action__main__right__search__icon"/>
                            </div>  }
                           
                            {!isView ?(isListLookGood?(<Button className="btn-primary" onClick={listLooksGood}
                                data-testid={`edit-list-looks-good`}>
                                    <CheckIcon className="EditUserGroup__right__action__main__right__icon"/> Save Changes</Button> ):(
                            <Button className="btn-primary" onClick={()=>editUsers()}
                                data-testid={`edit-add-teammates`}>Add Teammates</Button> 
                            )):""}
                        </div>
                    </div>                     
            </div>
            <div className="EditUserGroup__right__body">{
                isListLookGood?( 
                    <EnhancedProjectUserListTableTable 
                        rows={projectTeamMates} 
                        type={"EDIT"}
                        selectAll={selectAll}
                        selectUser={selectUser}/>):(
                    <UserGroupUsersTable 
                         rows={selectedUsers} 
                         type={"EDIT"}
                         removeUser={removeUser} />)}
            </div>
            <div className="EditUserGroup__right__footer">
                    <Button variant="outlined" data-testid="cancel-create-usergroup"
                        onClick={()=>{close(false);dispatch(setEditMode(false));}} 
                        className="EditUserGroup__right__footer__btn btn-secondary">Cancel</Button>
                   {!isView? <Button variant="outlined" data-testid="create-usergroup"
                        onClick={updateUserGroup}
                        disabled={!userGroupName || userGroupNameRequired || userGroupNameDuplicate ||
                            selectedUsers.length===0 || isListLookGood || isNameExceedLength ||
                            !projectDetailsState?.projectPermission.canUpdateUserGroup}
                        className={`updateUserGroup__right__footer__btn btn-primary`}>Update</Button>:""}
            </div>
        </div>
     </div>
    )
}

export default EditUserGroup;
