import { IconButton, Menu, MenuItem } from "@material-ui/core";
import React, { ReactElement, useState } from 'react';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import './CustomMenuItem.scss';
import { ITemplate } from "../../models/template";
import { canUpdateTemplates ,canUpdateFormTemplateStatus} from "../../utils/permission";


export const CustomMenuList=(props: any): ReactElement=>{
    const [anchorEl, setAnchorEl] = useState<any>(null);
    const open = Boolean(anchorEl);
  
    const close=(event: any)=>{
      event.stopPropagation();
      event.preventDefault();
      setAnchorEl(null);
    }

    const makeDefault=(event:React.MouseEvent<HTMLLIElement, MouseEvent>,argItem: ITemplate)=>{
      event.stopPropagation();
      event.preventDefault();
      props.makeDefault(argItem);
      close(event);
    }

    const deleteTemplate=(event:React.MouseEvent<HTMLLIElement, MouseEvent>,argItem: ITemplate)=>{
      event.stopPropagation();
      event.preventDefault();
      props.deleteTemplate(argItem);
      close(event);
    }

    const configureTemplate=(event:React.MouseEvent<HTMLLIElement, MouseEvent>,argItem: ITemplate)=>{
      event.stopPropagation();
      event.preventDefault();
      props.configureTemplate(argItem);
      close(event);
    }

    const previewTemplate=(event:React.MouseEvent<HTMLLIElement, MouseEvent>,argItem: ITemplate)=>{
      event.stopPropagation();
      event.preventDefault();
      props.previewTemplate(argItem);
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
          className="cellicon__button"
        >
          <MoreVertIcon className="cellicon"/> 
        </IconButton>
        <Menu
          elevation={0}
          id="long-menu"
          anchorEl={anchorEl}
          keepMounted
          className="custommenu"
          open={open}
          transformOrigin={{
            vertical: "top",
            horizontal: "center"
          }}
          onClose={(e)=>close(e)}
        >
          {
            canUpdateTemplates&& (
              !props.row.default?(<MenuItem className="custommenu__menu__item"
              data-testid={`template-setDefault-${props.index}`} onClick={(e)=>makeDefault(e,props.row)}>Set as default</MenuItem>):("")
              
            ) 
          }
          {
            canUpdateFormTemplateStatus && !props.row.systemGenerated && (
              <MenuItem className="custommenu__menu__item"
              data-testid={`template-delete-${props.index}`} onClick={(e)=>deleteTemplate(e,props.row)}>Delete</MenuItem>
            )
          }
        <MenuItem className="custommenu__menu__item"
              data-testid={`configureTemplate-${props.index}`} 
            onClick={(e)=>configureTemplate(e,props.row)}>Column Configuration</MenuItem>
        {/* <MenuItem className="custommenu__menu__item"
              data-testid={`template-preview-${props.index}`} onClick={(e)=>previewTemplate(e,props.row)}>Preview</MenuItem>*/}
        </Menu> 
      </React.Fragment>
    );
  }