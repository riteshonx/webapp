import { Button, Grid, TextField } from '@material-ui/core'
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { useDebounce } from '../../../../../customhooks/useDebounce';
import { postApiWithEchange } from '../../../../../services/api';
import { client } from '../../../../../services/graphql';
import { tenantRoles } from '../../../../../utils/role';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { LOAD_PROJECT_FEATURE, LOAD_PROJECT_ROLE_BY_NAME } from '../../graphql/queries/role';
import { Permission, PermissionType, RolePayload, RoleTye } from '../../models/role';
import RoleRadioGroup from '../RoleRadioGroup/RoleRadioGroup';
import Notification,{ AlertTypes } from '../../../../shared/components/Toaster/Toaster';
import './CreateProjectRole.scss';
import { setIsLoading } from '../../../../root/context/authentication/action';

interface IProps{
    close:(argValue: boolean)=> void,
    open: boolean
}

function CreateProjectRole({close, open}: IProps): ReactElement {
    const [roleName, setRoleName] = useState('');
    const [roleDescription, setRoleDescription] = useState('');
    const [roleNameDuplicate, setRoleNameDuplicate] = useState(false);
    const [roleNameRequired, setRoleNameRequired] = useState(false);
    const [projectFeaturePermissions, setProjectFeaturePermissions] = useState<Array<any>>([]);

    const { dispatch }:any = useContext(stateContext);
    const debounceName = useDebounce(roleName,300);

    useEffect(() => {
        const value=debounceName.trim();
        if(value){
            getRoleByName();
        } else{
            setRoleNameDuplicate(false);
        }
    }, [debounceName])

    useEffect(() => {
        fetchprojectRoleFeature();
    }, [])
    
    const fetchprojectRoleFeature = async () =>{
        try{
            const responseData: any= await client.query({
                query: LOAD_PROJECT_FEATURE,
                variables: {},
                fetchPolicy: 'network-only',
                context:{role: tenantRoles.viewProjectRoles}
            });
            if(responseData.data.projectFeature.length>0){
                const roleList: Array<any>=[]
                responseData.data.projectFeature.forEach((element: any) => {
                    const roleItem={
                        caption: element.caption,
                        description: element.description,
                        feature:element.feature,
                        value: PermissionType.none
                    }
                    roleList.push(roleItem);
                });
                setProjectFeaturePermissions(roleList);
            }
        }catch(error: any){
            console.log(error);
        }
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
                setRoleNameDuplicate(true);
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

    const onRoleNameChange=(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        setRoleName(event.target.value);
    }

    const onRoleDescriptionChange=(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        setRoleDescription(event.target.value);
    }

    const createRole= async ()=>{
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
            await postApiWithEchange('V1/permission',rolePayload);
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
    }

    const isCreateDisabled=(): boolean=>{
        const nonNullPermission = projectFeaturePermissions.filter((item: any)=>item.value !== PermissionType.none);
        return (nonNullPermission.length===0 || !roleName || roleNameDuplicate || roleNameRequired)
    }

    return (
        <div className={`CreateProjectRole ${open?'open':'close'}`}>
            <div className="CreateProjectRole__left">

            </div>
            <div className="CreateProjectRole__right">
                <div className="CreateProjectRole__right__header">
                    <div className="CreateProjectRole__right__header__name">
                        <TextField variant="outlined" data-testid="project-role-name"
                            className="CreateProjectRole__right__header__name__input"
                            onBlur={(e)=>onBlur()}
                            onChange={(e)=> onRoleNameChange(e)} value={roleName} placeholder="Enter Role name"/>  
                            {roleNameRequired?(
                                <div data-testid="roleNameerror" className="CreateProjectRole__right__header__name__error"> 
                                    Role name is required</div>):roleNameDuplicate?(
                                <div data-testid="roleNameerror" className="CreateProjectRole__right__header__name__error"> 
                                    Role name already exists</div>):(<div className="CreateProjectRole__right__header__name__error"></div>)}
                    </div>
                    {/* <div className="CreateProjectRole__right__header__description">
                        <TextField variant="outlined" data-testid="project-role-description"
                            className="CreateProjectRole__right__header__description__input"
                            onChange={(e)=> onRoleDescriptionChange(e)} value={roleDescription} placeholder="Enter role description"/>  
                    </div> */}
                </div>  
                <div className="CreateProjectRole__right__body">
                    <div className="CreateProjectRole__right__body__header">
                        <Grid container className="permission">
                            <Grid item xs={5} className="permission__left">
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
                    <div className="CreateProjectRole__right__body__content">
                        {projectFeaturePermissions.length>0 && projectFeaturePermissions.map((item: any,index: number)=>
                          <Grid container className="permission" key={item.feature}>
                                <Grid item xs={5} className="permission__left">
                                    <div className="permission__left__label">{item.caption}</div>
                                    {/* <div className="permission__left__description">
                                    {item.description}
                                    </div> */}
                                </Grid>
                                <Grid item xs={7} className="permission__right">
                                    <RoleRadioGroup isView={false} value={item.value} index={index} setValue={changeInPermissionValue}/>    
                                </Grid>
                          </Grid>)}
                    </div>
                </div>  
                <div className="CreateProjectRole__right__footer">
                    <Button variant="outlined" data-testid="templateAssociate"
                                    onClick={()=>close(false)}  className="CreateProjectRole__right__footer__btn btn-secondary">Cancel</Button>
                    <Button variant="outlined" data-testid="templateAssociate" onClick={createRole} 
                        disabled={isCreateDisabled()}
                    className={`CreateProjectRole__right__footer__btn ${isCreateDisabled()?'btn-disabled':'btn-primary'}`}>Create</Button>
                </div>    
            </div>
        </div>
    )
}

export default CreateProjectRole
