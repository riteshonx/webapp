import React, { ReactElement, useState, useEffect, useContext } from 'react'
import { Button, TextField } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import './ProjectUserGroups.scss';
import EnhancedUserGroupTable from '../../components/UserGroupsTable/UserGroupsTable';
import CreateUserGroup from '../../components/CreateUserGroup/CreateUserGroup';
import { client } from '../../../../../services/graphql';
import { DELETE_USER_GROUP, LOAD_USER_GROUPS } from '../../graphql/queries/userGroups';
import { projectDetailsContext } from '../../../projects/Context/ProjectDetailsContext';
import { myProjectRole, ProjectSetupRoles } from '../../../../../utils/role';
import { useDebounce } from '../../../../../customhooks/useDebounce';
import EditUserGroup from '../../components/EditUserGroup/EditUserGroup';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog/ConfirmDialog';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { setIsLoading } from '../../../../root/context/authentication/action';
import NoDataMessage from '../../../../shared/components/NoDataMessage/NoDataMessage';
import { match, useRouteMatch } from 'react-router-dom';
import ProjectSettingsHeader from '../../components/ProjectSettingsHeader/ProjectSettingsHeader';

export interface Params {
    projectId: string;
}

const confirmMessage = {
    header: "Delete User group",
    text: "Are you sure you want to delete the '{list}' UserGroup?",
    cancel: "Cancel",
    proceed: "Delete",
}

export const noPermissionMessage = "You don't have permission to view user groups";

export default function ProjectUserGroups(): ReactElement {
    const [searchName, setSearchName] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const {projectDetailsState}: any = useContext(projectDetailsContext);
    const [userGroupList, setUserGroupList] = useState<Array<any>>([]);
    const debounceName = useDebounce(searchName,700);
    const [selectedUsergroup, setselectedUsergroup] = useState<any>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [deletedUserGroup, setDeletedUserGroup] = useState<any>(null);
    const [dialogData, setDialogData] = useState<any>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const { dispatch, state }:any = useContext(stateContext);
    const pathMatch:match<Params>= useRouteMatch();
    const [viewMode, setViewMode] = useState(false);

    useEffect(() => {
            fetchUserGroups();
    }, [debounceName])

    const fetchUserGroups=async ()=>{
        try{
            const response= await client.query({
                query:LOAD_USER_GROUPS,
                variables:{
                    name: `%${debounceName.trim()}%`,
                    projectId: Number(pathMatch.params.projectId)
                },
                fetchPolicy:"network-only",
                context:{role: myProjectRole.viewMyProjects}
            });
            const targetList: Array<any>=[];
            if(response.data.userGroup.length>0){
                response.data.userGroup.forEach((item: any)=>{
                    const teammates= item.groupUsers.length;
                    const newItem={
                        id: item.id,
                        groupName: item.name,
                        description: item.description?item.description:"--",
                        teammates,
                        createdBy:  `${item?.createdByUser?.firstName||''} ${item?.createdByUser?.lastName||''}`,
                        action:""
                    }
                    targetList.push(newItem);
                })
            }
            setUserGroupList(targetList);
        } catch(error: any){
            console.log(error);
        }
    }

    const closeCreate=(argValue: boolean)=>{
        if(argValue){
            fetchUserGroups();
        }
        setIsCreateOpen(false);
    }

    const editUserGroup=(argSelectedUserGroup: any)=>{
        setIsEditOpen(true);
        setselectedUsergroup(argSelectedUserGroup);
        if(projectDetailsState?.projectPermission.canViewUserGroup && !projectDetailsState?.projectPermission.canUpdateUserGroup)
            setViewMode(true)
        else if(projectDetailsState?.projectPermission.canUpdateUserGroup)
            setViewMode(false)
    }

    const confirmDeleteUserGroup=(argSelectedUserGroup: any)=>{
        setDeletedUserGroup(argSelectedUserGroup);
        const message= {...confirmMessage};
        message.text=message.text.replace("{list}",argSelectedUserGroup.groupName);
        setDialogData(message);
        setShowConfirm(true);
    }

    const closeEdit=(argValue: boolean)=>{
        if(argValue){
            fetchUserGroups();
        }
        setIsEditOpen(false);
    }

    const deleteUserGroup= async ()=>{
        try{
            dispatch(setIsLoading(true));
            setShowConfirm(false);
            await client.mutate({
                mutation:DELETE_USER_GROUP,
                variables:{
                    id: deletedUserGroup.id
                },
                context:{role: ProjectSetupRoles.deleteUserGroup, token: projectDetailsState.projectToken}
            });
            dispatch(setIsLoading(false));
            fetchUserGroups();
        } catch(error: any){
            setShowConfirm(false);
            dispatch(setIsLoading(false));
        }
    }

    return (
        <div className="ProjectUserGroups">
            <div className="ProjectUserGroups__header">
               <ProjectSettingsHeader header={"User Groups"}/>
                {/* <div className="ProjectUserGroups__header__subtitle">
                Create a User Group to easily add a group of users to become followers of an item.
                </div>  */}
            </div> 
            {projectDetailsState?.projectPermission.canViewUserGroup?(
                <>
                    <div className="ProjectUserGroups__action">
                        <div className="ProjectUserGroups__action__main">
                            <div className="ProjectUserGroups__action__main__search">
                                <TextField value={searchName}
                                    id="list-search-text"
                                    data-testid="search-user-group"
                                    type="text"
                                    fullWidth
                                    placeholder="Search"
                                    variant="outlined"
                                    onChange={(e: any)=>setSearchName(e.target.value)}
                                    />
                                <SearchIcon className="ProjectUserGroups__action__main__search__icon"/>
                            </div>
                            {
                                projectDetailsState?.projectPermission.canCreateUserGroup && ( 
                                <Button className="btn-primary ProjectUserGroups__action__main__btn"
                                data-testid="create-new-usergroup"
                                    onClick={()=>setIsCreateOpen(true)}>Create a New Group </Button>)
                            }
                        </div>     
                    </div> 
                    <div className="ProjectUserGroups__body">
                        <EnhancedUserGroupTable rows={userGroupList} editUserGroup={editUserGroup} deleteUserGroup={confirmDeleteUserGroup}/>
                    </div> 
                    {isCreateOpen && <CreateUserGroup open={isCreateOpen} close={closeCreate}/>}
                    {isEditOpen && <EditUserGroup open={isEditOpen} close={closeEdit} id={selectedUsergroup?.id} isView={viewMode}/>}
                    {showConfirm?(<ConfirmDialog open={showConfirm} message={dialogData} 
                        close={()=>setShowConfirm(false)} proceed={deleteUserGroup} />):("")}
                </>
            ):!state.isLoading ? (
                <div className="noCreatePermission">
                    <div className="no-permission">
                        <NoDataMessage message={noPermissionMessage}/> 
                    </div>
                </div>
          ) : ('')}
        </div>
    )
}