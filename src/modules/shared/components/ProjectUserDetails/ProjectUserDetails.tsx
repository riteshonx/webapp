import React, { ReactElement } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Menu, { MenuProps } from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import PeopleIcon from '@material-ui/icons/People';
import { Tooltip } from '@material-ui/core';
import { AvatarGroup } from '@material-ui/lab';
import { Avatar } from '@material-ui/core';
import './ProjectUserDetails.scss';

const StyledMenu = withStyles({
  paper: {
    border: '1px solid #d3d4d5',
  },
})((props: MenuProps) => (
  <Menu
    elevation={1}
    getContentAnchorEl={null}
    anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
    transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
    }}
    {...props}
  />
));

const StyledMenuItem = withStyles((theme) => ({
  root: {
    maxHeight: 300,
    width:250,
    overflow: 'auto',
  },
}))(MenuItem);

export default function ProjectUserDetails(props: any): ReactElement {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(null);
  };

  const stopPropogation=(e: React.MouseEvent<HTMLLIElement, MouseEvent>)=>{
    e.stopPropagation();
    e.preventDefault();
  }

  return (
    <div className="ProjectUserDetails">
      <AvatarGroup max={5} className="ProjectUserDetails__avatargroup"
            onClick={handleClick}>{
             props.users.map((user: any, userIndex: number)=>(
                 <Tooltip key={`Icon-${userIndex}-${user.assignee}`} title={user?.user.firstName 
                 ? `${user?.user?.firstName} ${user?.user?.lastName}`
                 : `${user?.user?.email}`}>
                     <Avatar alt={user?.user?.firstName
                 ? `${user?.user?.firstName} ${user?.user?.lastName}`
                 : `${user?.user?.email}`} src="/" />
                 </Tooltip>
             ))}
      </AvatarGroup>
      <StyledMenu
        className="ProjectUserDetails__menu"
        id="customized-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {
          props.users.map((item: any)=>(
            <StyledMenuItem onClick={(e)=>stopPropogation(e)} key={`menuitem-${item.id}`} className="ProjectUserDetails__valuitems">
                <Avatar alt={item?.user.firstName 
                      ? `${item?.user?.firstName} ${item?.user?.lastName}`
                      : `${item?.user?.email}`} src="/" className="ProjectUserDetails__valuitems__icon" />
                <div className="ProjectUserDetails__valuitems__text">
                   <div className="ProjectUserDetails__valuitems__text__name">
                   <Tooltip title={item?.user.firstName 
                      ? `${item?.user?.firstName} ${item?.user?.lastName}`
                      : `${item?.user?.email}`}>
                      <span> 
                          {item?.user.firstName 
                        ? `${item?.user?.firstName} ${item?.user?.lastName}`
                        : `${item?.user?.email}`}
                      </span>
                    </Tooltip>
                  </div>
                  <div className="ProjectUserDetails__valuitems__text__email">
                  <Tooltip title={item.email} aria-label="email">
                      <span>{item?.user?.email}</span>
                  </Tooltip>
                  </div>
                </div>
          </StyledMenuItem>
          ))
        }
      </StyledMenu>
    </div>
  )
}