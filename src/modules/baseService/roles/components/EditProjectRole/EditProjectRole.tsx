import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { Button, Grid } from '@material-ui/core';
import { useDebounce } from '../../../../../customhooks/useDebounce';
import { client } from '../../../../../services/graphql';
import { tenantRoles } from '../../../../../utils/role';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { FETCH_PROJECT_ROLE_PERMISSION, FETCH_PROJECT_ROLE_BY_ID, LOAD_PROJECT_ROLE_BY_NAME,
         UPDATE_ROLE, LOAD_PROJECT_FEATURE } from '../../graphql/queries/role';
import { Permission, PermissionType, RolePayload, RoleTye } from '../../models/role';
import RoleRadioGroup from '../RoleRadioGroup/RoleRadioGroup';
import Notification,{ AlertTypes } from '../../../../shared/components/Toaster/Toaster';
import './EditProjectRole.scss';
import { setIsLoading } from '../../../../root/context/authentication/action';
import { getAuthValue } from '../../utils/helper';

interface IProps{
    roleId: number,
    close:(argValue: boolean)=> void,
    open: boolean,
    isView: boolean 
}

function EditProjectRole({close, open, roleId, isView}: IProps): ReactElement {
    const [roleName, setRoleName] = useState('');
    const [roleDescription, setRoleDescription] = useState('');
    const [roleNameDuplicate, setRoleNameDuplicate] = useState(false);
    const [roleNameRequired, setRoleNameRequired] = useState(false);
    const [projectFeaturePermissions, setProjectFeaturePermissions] = useState<Array<any>>([]);
    const { dispatch }:any = useContext(stateContext);
    const debounceName = useDebounce(roleName,300);
    const [isEdited, setIsEdited] = useState(false);

    useEffect(() => {
        const value=debounceName.trim();
        if(value && !isView){
            getRoleByName();
        } else{
            setRoleNameDuplicate(false);
        }
    }, [debounceName])

    useEffect(() => {
        if(roleId){
            fetchRoleDetails();
        }
    }, [roleId])
            
    const fetchRoleDetails= async ()=>{
        dispatch(setIsLoading(true));
        try{
            const promiseList=[];
            promiseList.push(
                client.query({
                    query: FETCH_PROJECT_ROLE_BY_ID,
                    variables:{id: roleId},
                    fetchPolicy: 'network-only',
                    context:{role: tenantRoles.viewProjectRoles}
                })
            )
            promiseList.push(
                client.query({
                    query: LOAD_PROJECT_FEATURE,
                    variables: {},
                    fetchPolicy: 'network-only',
                    context:{role: tenantRoles.viewProjectRoles}
                })
            )
            promiseList.push(
                client.query({
                    query: FETCH_PROJECT_ROLE_PERMISSION,
                    variables:{id: roleId},
                    fetchPolicy: 'network-only',
                    context:{role: tenantRoles.viewProjectRoles}
                })
            )
            const responseData: any= await Promise.all(promiseList);
            if(responseData.length===3){
                if(responseData[0].data.projectRole.length>0){
                    setRoleNameAndDescription(responseData[0].data.projectRole[0])
                }
                const roleList: Array<any>=[];
                if(responseData[1].data.projectFeature.length>0){
                    responseData[1].data.projectFeature.forEach((element: any) => {
                        const roleItem={
                            caption: element.caption,
                            description: element.description,
                            feature:element.feature,
                            value: PermissionType.none
                        }
                        roleList.push(roleItem);
                    });
                }
                if(responseData[2].data.projectPermission.length>0){
                    responseData[2].data.projectPermission.forEach((item: any)=>{
                        roleList.forEach((roleItem: any)=>{
                            if(item.feature === roleItem.feature){
                                roleItem.value= getAuthValue(item.authValue)
                            }
                        })
                    })
                }
                setProjectFeaturePermissions(roleList);
            }
            dispatch(setIsLoading(false));
        } catch(error: any){
            console.log(error);
            dispatch(setIsLoading(false));
        }
    }

    const setRoleNameAndDescription=(argRoleDetail: any)=>{
        setRoleName(argRoleDetail.role||'');
        setRoleNameRequired(false);
        setRoleDescription(argRoleDetail.description||'');
    }


    const getRoleByName= async ()=>{
        try{
            const responseData: any= await client.query({
                query: LOAD_PROJECT_ROLE_BY_NAME,
                variables: {name:debounceName.trim()},
                fetchPolicy: 'network-only',
                context:{role: tenantRoles.viewProjectRoles}
            });
            if(responseData.data.projectRole.length>0){
                if(responseData.data.projectRole[0].id !== roleId){
                    setRoleNameRequired(false);
                    setRoleNameDuplicate(true);
                } else{
                    setRoleNameDuplicate(false);
                }
            } else{
                setRoleNameDuplicate(false);
            }
        }catch(error: any){
            console.log(error.message);
        }
    }
    
    const onBlur=()=>{
       if(roleName.trim()){
        setRoleNameRequired(false);
       } else{
        setRoleNameRequired(true);
       }
    }

    const onRoleNameChange=(event: React.ChangeEvent<HTMLInputElement>)=>{
        setRoleName(event.target.value);
        setIsEdited(true);
    }

    const onRoleDescriptionChange=(event: React.ChangeEvent<HTMLInputElement>)=>{
        setRoleDescription(event.target.value);
        setIsEdited(true);
    }

    const updateRole= async ()=>{
        try{
            const rolePayload= new RolePayload(roleName.trim(),roleDescription.trim(),RoleTye.project,[]);
            projectFeaturePermissions.forEach((item: any)=>{
                if(item.value !== PermissionType.none){
                    const permission: Permission={
                        feature: item.feature,
                        permission: item.value
                      };
                    rolePayload.permissions.push(permission);
                }
            })
            dispatch(setIsLoading(true));
              await client.mutate({
                    mutation: UPDATE_ROLE,
                    variables:{
                        roleId,
                        roleName: rolePayload.roleName,
                        description: rolePayload.description,
                        roleType: rolePayload.roleType,
                        permissions: rolePayload.permissions
                    },
                    context:{role: tenantRoles.updateTenantRole}
              });
              Notification.sendNotification('Successfully created project role',AlertTypes.success);
              close(true)
        } catch(error: any){
            console.log(error.msg);
            dispatch(setIsLoading(false));
            Notification.sendNotification(error.message,AlertTypes.error);
        }
    }

    const changeInPermissionValue=(argValue: PermissionType, argIndex: number)=>{
        const list=[...projectFeaturePermissions];
        list[argIndex].value= argValue;
        setProjectFeaturePermissions(list);
        setIsEdited(true);
    }

    const isCreateDisabled=(): boolean=>{
        const nonNullPermission = projectFeaturePermissions.filter((item: any)=>item.value !== PermissionType.none);
        return (nonNullPermission.length===0 || !roleName || roleNameDuplicate || roleNameRequired || !isEdited)
    }

    return (
        <div className={`EditProjectRole ${open?'open':'close'}`}>
            <div className="EditProjectRole__left">

            </div>
            <div className="EditProjectRole__right">
                <div className="EditProjectRole__right__header">
                    <div className="EditProjectRole__right__header__name">
                        <input data-testid="project-role-name"
                            className="EditProjectRole__right__header__name__input"
                            disabled={isView}
                            onBlur={(e)=>onBlur()}
                            onChange={(e)=> onRoleNameChange(e)} value={roleName} placeholder="Enter Role name"/>  
                            {roleNameRequired?(
                                <div data-testid="roleNameerror" className="EditProjectRole__right__header__name__error"> 
                                    Role name is required</div>):roleNameDuplicate?(
                                <div data-testid="roleNameerror" className="EditProjectRole__right__header__name__error"> 
                                    Role name already exists</div>):(<div className="EditProjectRole__right__header__name__error"></div>)}
                    </div>
                    {/* <div className="EditProjectRole__right__header__description">
                        <input data-testid="project-role-description"
                            disabled={isView}
                            className="EditProjectRole__right__header__description__input"
                            onChange={(e)=> onRoleDescriptionChange(e)} value={roleDescription} placeholder="Enter role description"/>  
                    </div> */}
                </div>  
                <div className="EditProjectRole__right__body">
                    <div className="EditProjectRole__right__body__header">
                        <Grid container className="permission" style={{alignItems:'center'}}>
                            <Grid item xs={5}>
                                <div className="permission__left__label">Project role permissions</div>
                            </Grid>
                            <Grid item xs={7} className="permission__right">
                                <Grid container spacing={4}>
                                    <Grid item xs={3} className="permission__right__label">
                                        Admin
                                    </Grid>
                                    <Grid item xs={3} className="permission__right__label">
                                        Editor
                                    </Grid>
                                    <Grid item xs={3} className="permission__right__label">
                                        Viewer
                                    </Grid>
                                    <Grid item xs={3} className="permission__right__label">
                                        None
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </div>
                    <div className="EditProjectRole__right__body__content">
                        {projectFeaturePermissions.length>0 && projectFeaturePermissions.map((item: any,index: number)=>
                            <Grid container className="permission" key={item.feature}>
                                    <Grid item xs={5} className="permission__left">
                                        <div className="permission__left__label">{item.caption}</div>
                                        {/* <div className="permission__left__description">
                                        {item.description}
                                        </div> */}
                                    </Grid>
                                    <Grid item xs={7} className="permission__right">
                                         <RoleRadioGroup isView={isView} value={item.value} index={index} setValue={changeInPermissionValue}/>    
                                    </Grid>
                                </Grid>
                        )}
                    </div>
                </div>  
                <div className="EditProjectRole__right__footer">
                    <Button variant="outlined" data-testid="templateAssociate"
                                    onClick={()=>close(false)}  
                                    className={`EditProjectRole__right__footer__btn ${isView?'btn-primary':'btn-secondary'}`}>{isView?`Close`:`Cancel`}</Button>
                   
                   {!isView?(<Button variant="outlined" data-testid="templateAssociate" onClick={updateRole}
                    disabled={isCreateDisabled()}
                        className={`EditProjectRole__right__footer__btn ${isCreateDisabled() ? 'btn-disabled':'btn-primary'}`}>Update</Button>):("")} 
                </div>    
            </div>
        </div>
    )
}

export default EditProjectRole
