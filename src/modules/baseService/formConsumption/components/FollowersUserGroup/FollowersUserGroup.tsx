import React, { ReactElement } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Menu, { MenuProps } from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import PeopleIcon from '@material-ui/icons/People';
import { IconButton, Tooltip } from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';
import { Avatar } from '@material-ui/core';
import './FollowersUserGroup.scss';

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

export default function FollowersUserGroupInfo(props: any): ReactElement {
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
    <div className="FollowruserGroupDetails">
       <IconButton
       data-testId={`group-${props.group.name}`}
        className="FollowruserGroupDetails__btn"
        aria-label="info"
        aria-controls="info-menu"
        aria-haspopup="true"
        onClick={handleClick}>
        <InfoIcon className="FollowruserGroupDetails__btn__icon"/>
      </IconButton>
      <StyledMenu
        className="FollowruserGroupDetails__menu"
        id="customized-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <StyledMenuItem onClick={(e)=>stopPropogation(e)} className="FollowruserGroupDetails__valuitems">
          <ListItemIcon>
            <PeopleIcon className="FollowruserGroupDetails__valuitems__groupIcon" />
          </ListItemIcon>
          <div  className="FollowruserGroupDetails__valuitems__text">
            {props.group.name}
            {`${props.group.users.length>0?` (${props.group.users.length})`:""}`}</div>
        </StyledMenuItem>
        {
          props.group.users.map((item: any)=>(
            <StyledMenuItem onClick={(e)=>stopPropogation(e)} key={`menuitem-${item.id}`} className="FollowruserGroupDetails__valuitems">
                <Avatar alt={`${item.name}`} src="/" className="FollowruserGroupDetails__valuitems__icon" />
                <div className="FollowruserGroupDetails__valuitems__text">
                   <div className="FollowruserGroupDetails__valuitems__text__name">
                   <Tooltip title={item.name} aria-label="email">
                    <span> {item.name}</span>
                    </Tooltip>
                  </div>
                  <div className="FollowruserGroupDetails__valuitems__text__email">
                  <Tooltip title={item.email} aria-label="email">
                      <span>{item?.email}</span>
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