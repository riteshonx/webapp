import { MenuItem, Select } from '@material-ui/core';
import { Tooltip } from '@mui/material';
import React, { ReactElement, useEffect, useState } from 'react'
import { CustomPopOver } from '../../../../shared/utils/CustomPopOver';
import "./ProjectUserRoleSelect.scss"
interface IProps {
    roles: Array<any>,
    currentUser: any,
    changeInRole: (argRole: number, argUser: any)=> void
}

function ProjectUserRoleSelect({roles,currentUser,changeInRole}: IProps): ReactElement {
    const [rolesLists, setrolesLists] = useState<Array<any>>([]);
    const classes= CustomPopOver();

    useEffect(() => {
        const targetList: Array<any>=[];
        const currentRole= roles.find((item: any)=> item.id === currentUser.role)
        roles.forEach((item)=>{
            if(!item.deleted){
                targetList.push(item);
            }
        })
       if(currentRole){
        currentRole.deleted?targetList.push(currentRole):null;
       }
       setrolesLists(targetList);
    }, [roles])

    const handleRoleChange = (e: any, row: any) => {
        const currentRole= rolesLists.find((item: any)=> item.id === currentUser.role);
        if(currentRole?.deleted && e.target.value !== currentUser?.role){
            const index= rolesLists.indexOf(currentRole);
            rolesLists.splice(index,1);
            setrolesLists([...rolesLists]);
        }
        changeInRole(e,row);
    }

    return (
        <div className='projectRoleSelect'>
        <Select
        className="MuiInputBase-input"
        MenuProps={{ classes: { paper: classes.root },
            anchorOrigin: {
            vertical: "bottom",
            horizontal: "left"
            },
            transformOrigin: {
            vertical: "top",
            horizontal: "left"
            },
            getContentAnchorEl: null }}
        value={currentUser?.role}
        id={`user-role-${currentUser?.user?.id}`}
        fullWidth
        autoComplete='off'
        placeholder="select a value"
        onChange={(e: any) => handleRoleChange(e, currentUser)}
        disabled={!currentUser.isPartOf}
    >   
        {
            rolesLists?.map((role: any) => (
                <MenuItem className="mat-menu-item-sm" key={role.id} value={role.id}>
                    <Tooltip title={role.role}>
                        <span>
                        {role.role.length>30?`${role.role.slice(0,26)}..`:role.role}
                        </span>
                    </Tooltip>
                </MenuItem>
            ))
        }
    </Select> 
    </div>
    )
}

export default ProjectUserRoleSelect
