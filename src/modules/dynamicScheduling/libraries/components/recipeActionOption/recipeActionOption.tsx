import { ReactElement } from 'react';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import {
    createTenantCalendar,
    deleteTenantCalendar,
    updateTenantCalendar,
  } from '../../../permission/scheduling';
import IconButton from '@material-ui/core/IconButton';
import React from 'react';


const useStyles = makeStyles((theme: Theme) =>
createStyles({
  typography: {
    padding: theme.spacing(1),
  },
}),
);

interface Props {
    item: any,
    index: number,
    handleDialogOpen: (item: any, action: string)=> void,
    confirmDelete: (item: any, action: string)=> void
  }
  
  export default function CalenderOption({item, index, handleDialogOpen, confirmDelete}: Props): ReactElement {
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;
    const classes = useStyles();
  
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
  
    const handleClose = () => {
      setAnchorEl(null);
    };
  
    const copypDuplicate=(argAction: string)=>{
      handleDialogOpen(item, argAction);
      handleClose();
    }
  
    const deleteConfirm=()=>{
      confirmDelete(item, 'delete');
      handleClose();
    }
    
    return (
      <>
         { updateTenantCalendar ?
                  <IconButton style={{padding: '0px'}} aria-describedby={item.id}  onClick={(event)=>handleClick(event)}>
                    <MoreVertIcon className="cellicon"/>
                  </IconButton> : '' }
               
                  {true ? (
                      <div className="calendar-grid-view__card__info__action">
                        <Popover
                          id={id}
                          open={open}
                          anchorEl={anchorEl}
                          onClose={handleClose}
                          className="popOverAction"
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center',
                          }}
                          elevation = {1}
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'center',
                          }}
                       >
  
            {updateTenantCalendar ? 
              (<Typography className={classes.typography}  onClick={()=>copypDuplicate('edit')}>Edit</Typography>): ('')}
            {createTenantCalendar ? 
              (<Typography className={classes.typography}  
                onClick={() => copypDuplicate('duplicate')}>Duplicate</Typography>):('')}
            {/* <Typography className={classes.typography}>Add MileStone</Typography> */}
            {item.isEditable && deleteTenantCalendar ?
              (<Typography 
              className={classes.typography} onClick={deleteConfirm}>Delete</Typography>) : ('')}
        
        </Popover>
         </div>)
                         : 
                       ('')
                        }
      </>
    )
  }