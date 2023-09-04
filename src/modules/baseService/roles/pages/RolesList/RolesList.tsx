import React, { ReactElement, useContext, useEffect, useState } from 'react';
import BackNavigation from '../../../../shared/components/BackNavigation/BackNavigation';
import { Button, TextField } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { client } from '../../../../../services/graphql';
import './RolesList.scss';
import { LOAD_TENANT_ROLE, LOAD_PROJECT_ROLES, COPY_ROLE,
     DELETE_PROJECT_ROLE, DELETE_SYSTEM_ROLE } from '../../graphql/queries/role';
import { useDebounce } from '../../../../../customhooks/useDebounce';
import { tenantRoles } from '../../../../../utils/role';
import EnhancedRoleTable from '../../components/RoleListTable/RoleListTable';
import {Role, RoleTye, CopyRolePayload} from '../../models/role';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { setIsLoading } from '../../../../root/context/authentication/action';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog/ConfirmDialog';
import { getUniqueName } from '../../../../../utils/helper';
import Notification,{ AlertTypes } from '../../../../shared/components/Toaster/Toaster';
import CreateSystemRole from '../../components/CreateSystemRole/CreateSystemRole';
import CreateProjectRole from '../../components/CreateProjectRole/CreateProjectRole';
import EditSystemRole from '../../components/EditSystemRole/EditSystemRole';
import EditProjectRole from '../../components/EditProjectRole/EditProjectRole';
import { canCreateProjectRole, canCreateSystemtRole, canViewProjectRole,
     canViewSystemRole,canUpdateProjectRole, 
     canUpdateSystemRole,canDeleteSystemRole,canDeleteProjectRole } from '../../utils/permission';

import CommonHeader from "../../../../shared/components/CommonHeader/CommonHeader"
import { useHistory } from 'react-router-dom';
import NoPermission from 'src/modules/shared/components/NoPermission/NoPermission';

const confirmMessage = {
    header: "Are you sure?",
    text: "If you cancel now, Role won't be deleted.",
    cancel: "Go back",
    proceed: "Yes, I\'m sure",
  }

  const headerInfo = {
      name : "Roles",
      description : ""
  }

function RolesList(): ReactElement {
    const history = useHistory()
    const {dispatch }:any = useContext(stateContext);
    const [roleType, setRoleType] = useState(RoleTye.tenant);
    const [searchText, setSearchText] = useState('');
    const debounceName= useDebounce(searchText,1000);
    const [rolesList, setRolesList] = useState<Array<Role>>([]);
    const [deleteRoledata, setDeleteRoledata] = useState<Role | null>(null);
    const [isconfirmdialogopen, setIsconfirmdialogopen] = useState(false);
    const [createTenantRole, setCreateTenantRole] = useState(false);
    const [createProjectRole, setCreateProjectRole] = useState(false);
    const [editSystemRole, setEditSystemRole] = useState(false);
    const [editProjectRole, setEditProjectRole] = useState(false);
    const [editedRole, setEditedRole] = useState<Role| null>(null);
    const [viewSysstemRole, setviewSysstemRole] = useState(false);
    const [viewProjectRole, setviewProjectRole] = useState(false);
    const [currentViewRole, setCurrentViewRole] = useState<any>(null);

    const toggleView=(argType: RoleTye)=>{
        setRoleType(argType);
    }

    useEffect(() => {
        if(roleType===RoleTye.tenant){
            if(canViewSystemRole){
                loadSystemRoles();
            }
        } else{
            if(canViewProjectRole){
                loadProjectRoles();
            }
        }
    }, [debounceName, roleType]);


    const loadSystemRoles= async ()=>{
        try{
            dispatch(setIsLoading(true));
            const resoponseData: any= await client.query({
                query: LOAD_TENANT_ROLE,
                variables:{
                    offset: 0, 
                    limit: 1000,
                    searchText: `%${debounceName}%`
                },
                fetchPolicy:'network-only',
                context:{role: tenantRoles.viewTenantRoles}
            })
            const targetList: Array<Role>=[];
            resoponseData.data.tenantRole.forEach((item: Role)=>{
                const newRole: Role= new Role(item.id, item.role,item.updatedAt, item.createdAt,
                    item.description|| '', item.tenantId, item.tenantId?false:true)
                targetList.push(newRole);
            })
            setRolesList(targetList);
            dispatch(setIsLoading(false));
        } catch(error: any){
            console.log(error.message)
            dispatch(setIsLoading(false));
        }
    }

    const loadProjectRoles= async ()=>{
        try{
            dispatch(setIsLoading(true));
            const resoponseData: any= await client.query({
                query: LOAD_PROJECT_ROLES,
                variables:{
                    offset: 0, 
                    limit: 1000,
                    searchText: `%${debounceName}%`
                },
                fetchPolicy:'network-only',
                context:{role: tenantRoles.viewProjectRoles}
            })
            const targetList: Array<Role>=[];
            resoponseData.data.projectRole.forEach((item: Role)=>{
                if(!item.deleted){
                    const newRole: Role= new Role(item.id, item.role,item.updatedAt, item.createdAt,
                        item.description|| '', item.tenantId, item.systemGenerated)
                    targetList.push(newRole);
                }   
            })
            setRolesList(targetList);
            dispatch(setIsLoading(false));
        } catch(error: any){
            console.log(error.message)
            dispatch(setIsLoading(false));
        }
    }

    const deleteRole= (argRole: Role)=>{
        setDeleteRoledata(argRole);
        setIsconfirmdialogopen(true);
    }

    const copy= async (argRole: Role)=>{
        try{
            const role= roleType===RoleTye.tenant?tenantRoles.createTenantRole:tenantRoles.createProjectRole;
            const names: Array<string>= rolesList.map((item: Role)=> item.role);
            names.push(argRole.role);
            const uniqueName= getUniqueName(names);
            const payload= new CopyRolePayload(argRole.id,uniqueName, roleType);
            dispatch(setIsLoading(true));
            await client.mutate({
                mutation: COPY_ROLE,
                variables:{
                    ...payload
                },
                context:{role}
            });
            if(roleType===RoleTye.tenant){
                loadSystemRoles();
            } else{
                loadProjectRoles();
            }
        } catch(error: any){
            dispatch(setIsLoading(false));
            Notification.sendNotification(error.message,AlertTypes.error);
        }
    }

    const deleteSelectedRole=()=>{
        if(roleType=== RoleTye.project){
            deleteProjectRole();
        } else{
            deleteTenanttRole();
        }
    }

    const deleteProjectRole=async ()=>{
        try{
            setIsconfirmdialogopen(false)
            dispatch(setIsLoading(true));
            await client.mutate({
                mutation: DELETE_PROJECT_ROLE,
                variables:{
                    roleId: deleteRoledata?.id
                },
                context:{role:tenantRoles.updateProjectRoleStatus}
            });
            loadProjectRoles();
        } catch(error: any){
            dispatch(setIsLoading(false));
            Notification.sendNotification(error.message,AlertTypes.error);
        }
    }

    const deleteTenanttRole=async ()=>{
        try{
            setIsconfirmdialogopen(false)
            dispatch(setIsLoading(true));
            await client.mutate({
                mutation: DELETE_SYSTEM_ROLE,
                variables:{
                    roleId: deleteRoledata?.id
                },
                context:{role:tenantRoles.updateTenantRoleStatus}
            });
            loadSystemRoles();
        } catch(error: any){
            dispatch(setIsLoading(false));
            Notification.sendNotification(error.message,AlertTypes.error);
        }
    }

    const addNewRole=()=>{
        if(roleType === RoleTye.tenant ){
            if(!createProjectRole){
                setCreateTenantRole(true);
            }
        } else{
            if(!createTenantRole){
                setCreateProjectRole(true);
            }
        }
    }

    const closeCreateSystemRole=(argValue: boolean)=>{
        if(argValue){
            loadSystemRoles();
        }
        setCreateTenantRole(false)
    }

    const closeCreateProjectRole=(argValue: boolean)=>{
        if(argValue){
            loadProjectRoles();
        }
        setCreateProjectRole(false)
    }

    const editRole=(argRole: Role)=>{
        setEditedRole(argRole);
        if(roleType === RoleTye.tenant){
            setEditProjectRole(false);
            setEditSystemRole(true);
        } else{
            setEditProjectRole(true);
            setEditSystemRole(false);
        }
    }

    const closeEditSystemRole=(argValue: boolean)=>{
        setEditedRole(null);
        if(argValue){
            loadSystemRoles();
        }
        setEditSystemRole(false);
    }

    const closeEditProjectRole=(argValue: boolean)=>{
        setEditedRole(null);
        if(argValue){
            loadProjectRoles();
        }
        setEditProjectRole(false);
    }

    const closeView=()=>{
        setCurrentViewRole(null);
        setviewSysstemRole(false);
        setviewProjectRole(false);
    }

    const viewRole=(argRole: Role)=>{
        if(roleType === RoleTye.project){
            if(!argRole.systemGenerated){
                if(canViewProjectRole  && !canUpdateProjectRole && !canDeleteProjectRole){
                    setCurrentViewRole(argRole);
                    setviewProjectRole(true);
                }else{
                    setviewProjectRole(false);
                }
                if(canUpdateProjectRole || canDeleteProjectRole){
                    setEditedRole(argRole);
                    setEditProjectRole(true);
                }else{
                    setEditProjectRole(false);
                }
            }else{
                setCurrentViewRole(argRole);
                setviewProjectRole(true);
            }
        } else{
            if(!argRole.systemGenerated){
                if(canViewSystemRole && !canUpdateSystemRole && !canDeleteSystemRole){
                    setCurrentViewRole(argRole);
                    setviewSysstemRole(true);
                }else{
                    setviewSysstemRole(false);
                }
                if(canUpdateSystemRole || canDeleteSystemRole) {
                    setEditedRole(argRole);
                    setEditSystemRole(true);
                }else{
                    setEditSystemRole(false);
                }
            }else{
                setCurrentViewRole(argRole);
                setviewSysstemRole(true);
            }
        }
    }

    const navigateBack = () => {
        history.push("/")
    }


    return (
			<div className="RolesList">
				{canViewSystemRole && canViewProjectRole ? (
					<>
						<div className="RolesList__header">
							<CommonHeader headerInfo={headerInfo} />
							{/* <div className="RolesList__header__subtitle"> 
                                View all the roles that are created System Roles
                            </div> */}
						</div>

						<div className="RolesList__action">
							<div className="RolesList__action__left">
								<Button
									data-testid={'grid-view'}
									variant="outlined"
									className={`RolesList__action__left__btn ${
										roleType === RoleTye.tenant
											? 'RolesList__action__left__active'
											: ''
									}`}
									onClick={() => {
										toggleView(RoleTye.tenant);
										closeCreateProjectRole(false);
									}}
								>
									System
								</Button>
								<Button
									data-testid={'list-view'}
									variant="outlined"
									className={`RolesList__action__left__btn ${
										roleType === RoleTye.project
											? 'RolesList__action__left__active'
											: ''
									}`}
									onClick={() => {
										toggleView(RoleTye.project);
										closeCreateSystemRole(false);
									}}
								>
									Project
								</Button>
							</div>
							<div className="RolesList__action__right">
								<div className="RolesList__action__right__search">
									<TextField
										value={searchText}
										id="roles-search-text"
										data-testid="roles-search-text"
										type="text"
										fullWidth
										placeholder="Search"
										variant="outlined"
										onChange={(e) => setSearchText(e.target.value)}
									/>
									<SearchIcon className="RolesList__action__right__search__icon" />
								</div>
								{roleType == RoleTye.tenant
									? canCreateSystemtRole && (
											<Button
												variant="outlined"
												data-testid="templateAssociate"
												onClick={addNewRole}
												className="RolesList__action__right__btn btn-primary"
											>
												Create Role
											</Button>
									  )
									: canCreateProjectRole && (
											<Button
												variant="outlined"
												data-testid="templateAssociate"
												onClick={addNewRole}
												className="RolesList__action__right__btn btn-primary"
											>
												Create Role
											</Button>
									  )}
							</div>
						</div>

						<div className="RolesList__data">
							<EnhancedRoleTable
								rows={rolesList}
								roleType={roleType}
								deleteRole={deleteRole}
								closeCreateSystemRole={closeCreateSystemRole}
								closeCreateProjectRole={closeCreateProjectRole}
								closeView={closeView}
								copyRole={copy}
								editRole={editRole}
								addRole={addNewRole}
								view={viewRole}
								closeEditSystemRole={closeEditSystemRole}
							/>
						</div>
					</>
				) : (
					<NoPermission
						header={'Roles'}
						navigateBack={navigateBack}
						noPermissionMessage={"You don't have permission to view Roles"}
					/>
				)}

				{isconfirmdialogopen ? (
					<ConfirmDialog
						open={isconfirmdialogopen}
						message={confirmMessage}
						close={() => setIsconfirmdialogopen(false)}
						proceed={deleteSelectedRole}
					/>
				) : (
					''
				)}
				{createTenantRole ? (
					<CreateSystemRole
						close={closeCreateSystemRole}
						open={createTenantRole}
					/>
				) : (
					''
				)}
				{createProjectRole ? (
					<CreateProjectRole
						close={closeCreateProjectRole}
						open={createProjectRole}
					/>
				) : (
					''
				)}
				{editSystemRole && editedRole ? (
					<EditSystemRole
						close={closeEditSystemRole}
						isView={false}
						open={editSystemRole}
						roleId={editedRole.id}
					/>
				) : (
					''
				)}
				{editProjectRole && editedRole ? (
					<EditProjectRole
						close={closeEditProjectRole}
						isView={false}
						open={editProjectRole}
						roleId={editedRole.id}
					/>
				) : (
					''
				)}
				{viewSysstemRole && currentViewRole ? (
					<EditSystemRole
						close={closeView}
						isView={true}
						open={viewSysstemRole}
						roleId={currentViewRole.id}
					/>
				) : (
					''
				)}
				{viewProjectRole && currentViewRole ? (
					<EditProjectRole
						close={closeView}
						isView={true}
						open={viewProjectRole}
						roleId={currentViewRole.id}
					/>
				) : (
					''
				)}
			</div>
		);
}

export default RolesList
