import React, {ReactElement, useContext, useEffect, useState} from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import './CustomListInput.scss';
import { TemplateData } from '../../models/template';
import { templateCreationContext } from '../../context/templateCreation/context';
import {CustomList} from '../../models/template';
import { setTemplateList } from '../../context/templateCreation/action';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { setIsLoading } from '../../../../root/context/authentication/action';
import { CustomPopOver } from '../../../../shared/utils/CustomPopOver';
import LaunchIcon from '@material-ui/icons/Launch';
import { useHistory } from 'react-router-dom';
import { canUpdateCustomList, canViewCustomList } from 'src/modules/baseService/customList/utils/permission';
import { IconButton, Tooltip } from '@material-ui/core';

interface ISelect{
    field: TemplateData,
    index: number
}

export default function CustomListInput({field,index}: ISelect): ReactElement {
    const {createTemplateState, createTemplateDispatch }:any = useContext(templateCreationContext);
    const {dispatch }:any = useContext(stateContext);
    const classes= CustomPopOver();
    const [customListItems, setCustomListItems] = useState<Array<any>>([]);
    const history= useHistory();

    useEffect(() => {
       const items= [...createTemplateState.templateList];
       const nonDeletedField= createTemplateState.customList.filter((item: any)=> !item.deleted);
        // when field configId is null or invalid
       if(field.configListId<0 && createTemplateState.customList.length>0){
           if(!createTemplateState.isEdit){
                const selectedCustomList= createTemplateState.customList.filter((item: any)=>item.name===field.caption && !item.deleted);
                if(selectedCustomList.length>0){
                    items[index].configListId=selectedCustomList[0].id;
                } else{
                    items[index].configListId=createTemplateState.customList[0].id;
                }
                createTemplateDispatch(setTemplateList(items));
           } else{
                if(nonDeletedField.length>0){
                    update(nonDeletedField[0].id); 
                }
            }
       } else if(field.configListId>0 && createTemplateState.customList.length>0){
            // When field config Id is valid 
           
            const deletedConfigItem= createTemplateState.customList.find((item: any)=> item.deleted && field.configListId===item.id);
            if(deletedConfigItem){
                nonDeletedField.push(deletedConfigItem);
            }
       }
       setCustomListItems(nonDeletedField);
    }, [createTemplateState.customList]);

    const update = async (value: number)=>{
        try{
             const items= [...createTemplateState.templateList];
             items[index].configListId=value;
             createTemplateDispatch(setTemplateList(items));
        }catch(error){
            dispatch(setIsLoading(false));
        }
    }

    const changeInConfig= (e: React.ChangeEvent<{name?: string | undefined;value: unknown}>)=>{
        const nonDeletedField= customListItems.filter((item: any)=> !item.deleted);
        const currentDeletedValue= customListItems.find((item: any)=> item.deleted && item.id == e.target.value);
        if(currentDeletedValue){
            nonDeletedField.push(currentDeletedValue);
        }
        if(!createTemplateState.isEdit){
            const items= [...createTemplateState.templateList];
            items[index].configListId=e.target.value;
            createTemplateDispatch(setTemplateList(items));
        } else{
            update(e.target.value as number) 
        }
        setCustomListItems(nonDeletedField);
    }

    const viewCustomList=  ()=>{
        const protocol = location.protocol;
        const host = location.host;
        const url = `${protocol}//${host}/base/customList`;
        if(canUpdateCustomList || canViewCustomList){
            if(canUpdateCustomList){
                window.open(`${url}/${field.configListId}`, "_blank");
                return;
            } else{
                window.open(`${url}/view/${field.configListId}`, "_blank");
              return;
            }
        }
     }

    return (
        <>
        <FormControl  variant="outlined" className="customListSelect">
            <Select disabled={field.fixed} defaultValue="" 
            className={`${field.fixed ? " customListSelect__fixed" : ""}`}
            data-testid={`customlist-${index}`} 
             value={field.configListId} id={`grouped-select-${index}`} onChange={(e)=>changeInConfig(e)}
             MenuProps={{ classes: { paper: classes.root },  anchorOrigin: {
                vertical: "bottom",
                horizontal: "left"
                },
                transformOrigin: {
                vertical: "top",
                horizontal: "left"
                },
                getContentAnchorEl: null }}>
                { customListItems.map((item: CustomList)=>(
                    <MenuItem value={item.id} key={`customitem-${item.name}-${item.id}`} 
                        className="mat-menu-item-sm"
                        data-testid={`customlist-${index}-item-${item.id}`} >
                        {item.name}
                    </MenuItem>
                   ))}
            </Select>
            {canUpdateCustomList || canViewCustomList?(
            <Tooltip title={`${canUpdateCustomList?'Click here to view and edit this list':'Click here to view this list'}`}>
                <IconButton onClick={viewCustomList} className='customListSelect__launch'>
                    <LaunchIcon  /> 
                </IconButton>
            </Tooltip>):("")}
      </FormControl>
      </>
    )
}