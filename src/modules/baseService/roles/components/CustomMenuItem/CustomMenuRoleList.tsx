import { IconButton, Menu, MenuItem } from "@material-ui/core";
import React, { ReactElement, useState } from 'react';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import './CustomMenuRoleList.scss';
import { canDeleteProjectRole, canDeleteSystemRole } from "../../utils/permission";
import { Role, RoleTye } from "../../models/role";

interface IProps{
  row: Role,
  index: number,
  roleType: RoleTye,
  deleteRole: (argRole: Role)=> void
}

export const CustomMenuRoleList=(props: IProps): ReactElement=>{
    const [anchorEl, setAnchorEl] = useState<any>(null);
    const open = Boolean(anchorEl);
  
    const close=(event: any)=>{
      event.stopPropagation();
      event.preventDefault();
      setAnchorEl(null);
    }

    const deleteRole=(event:React.MouseEvent<HTMLLIElement, MouseEvent>,argItem: Role)=>{
      event.stopPropagation();
      event.preventDefault();
      props.deleteRole(argItem);
      close(event);
    }

    const showMenuItems = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>)=>{
      event.stopPropagation();
      event.preventDefault();
      setAnchorEl(event.currentTarget)
    }

    return (
      <React.Fragment>
        <IconButton
        data-testid={`template-moreoption-${props.index}`}
          aria-label="more"
          aria-controls="long-menu"
          aria-haspopup="true"
          onClick={(event) => showMenuItems(event)}
        >
          <MoreVertIcon className="cellicon"/> 
        </IconButton>
        <Menu
          elevation={0}
          id="long-menu"
          anchorEl={anchorEl}
          keepMounted
          className="customRoleMenu"
          open={open}
          transformOrigin={{
            vertical: "top",
            horizontal: "center"
          }}
          onClose={(e)=>close(e)}
        >
        {canDeleteProjectRole && props.roleType == RoleTye.project && !props.row.systemGenerated &&( <MenuItem className="customRoleMenu__menu__item"
            data-testid={`delete-Role-${props.index}`} 
            onClick={(e)=>deleteRole(e,props.row)}>Delete</MenuItem>)}
        {canDeleteSystemRole && props.roleType == RoleTye.tenant  && !props.row.systemGenerated &&( <MenuItem className="customRoleMenu__menu__item"
            data-testid={`delete-Role-${props.index}`} 
            onClick={(e)=>deleteRole(e,props.row)}>Delete</MenuItem>)}
        <MenuItem className="customRoleMenu__menu__item"
              data-testid={`activity-role-${props.index}`}>Activity</MenuItem>
        </Menu>
      </React.Fragment>
    );
  }