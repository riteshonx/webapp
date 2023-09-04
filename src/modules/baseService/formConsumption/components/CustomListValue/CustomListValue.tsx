import React, { ReactElement, useContext, useEffect, useState } from 'react'
import { ConfigListItem, ConfigurationValue } from '../../../customList/models/customList';
import FormControl from '@mui/material/FormControl';
import { IconButton, TextField, Tooltip } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { CustomNestedDropDownContext, formStateContext, projectContext } from '../../Context/projectContext';
import CustomListDialog from './CustomListValueDialog';
import { CustomPopOver } from "../../../../shared/utils/CustomPopOver";
import './CustomListValue.scss';

interface ICustomListValue{
    field: any;
    formData: any;
    isEditAllowed: boolean;
}

let getLabelValue=false;
function CustomListValue(props: ICustomListValue): ReactElement {
    const [originalListArray, setOriginalListArray] = useState<Array<any>>([])
    const [customListArray, setCustomListArray] = useState<Array<ConfigListItem>>([])
    const [open, setOpen] = React.useState(false);
    const [currentValue, setcurrentValue] = useState<any>(null);
    const [valueLabel, setValueLabel] = useState('');
    const {projectState}: any = useContext(projectContext);
    const {setValue,setError, getValues, setIsDirty}: any = useContext(formStateContext);
    const [selectedValue, setSelectedValue] = useState("");
    const popOverclasses = CustomPopOver();


    const handleChangeSelect = (event: SelectChangeEvent) => {
        setSelectedValue(event.target.value);
      };

    useEffect(() => {
        const value= getValues(props.field.name);
        if((typeof value==='string'||!value) && currentValue !== value){
            setValue(props.field.name,currentValue || "");
            if(currentValue){
                setError(props.field.name,'');
                getLabelValue=false;
            }
        }
        if(currentValue && originalListArray && !getLabelValue){
            getCurrentValueLabel();
        }
    }, [currentValue,originalListArray])

    useEffect(() => {
        const value= getValues(props.field.name);
        if(!value){
            setValueLabel('');
           return;
        }
        if(typeof value==='string'){
            setcurrentValue(value);
        } else{
            if(value.length>0){
                setcurrentValue(value[0]?.configReferenceId);
                setValue(props.field.name,value[0]?.configReferenceId || "");
                const values=[...value[0].configValue];
                const label=values.reverse().join('>');
                getLabelValue=true;
                setValueLabel(label);
            }
        }
    }, [props.field])

    const getCurrentValueLabel=()=>{
        let label='';
        const currentItemValue= originalListArray.find((item: any)=>item.id=== currentValue);
        if(currentItemValue?.parentId){
            const parentValue= originalListArray.find((item: any)=>item.id=== currentItemValue.parentId);
            if(parentValue?.parentId){
                const grandParentValue= originalListArray.find((item: any)=>item.id=== parentValue.parentId);
                label= grandParentValue?` ${grandParentValue.nodeName} > ${parentValue.nodeName} > ${currentItemValue.nodeName}`:
                `${parentValue.nodeName} > ${currentItemValue.nodeName}`;
            } else{
                label=parentValue? `${parentValue.nodeName} > ${currentItemValue.nodeName}`:`${currentItemValue.nodeName}`;
            }
        } else{
            label= currentItemValue?`${currentItemValue.nodeName}`:'';
        }
        setValueLabel(label);
    }

    const handleClickOpen = () => {
        if(!props.isEditAllowed){
            setOpen(true);
        }
    };
  
    const handleClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        if(projectState.customListValues){
            const data= projectState.customListValues[`${Number(props?.formData?.configListId)}`];
            if(data){
                const selectedList : any = []
                const configValuesTemp = data?.configurationValues
                const projectAssociationTemp : any = []
                setOriginalListArray(data?.configurationValues);
                const list : any = getNodeListStructure(configValuesTemp);
                // take out configValueId from associated project config || these are the associated values
                for(let i = 0; i < data?.projectConfigAssociations.length; i++){
                    projectAssociationTemp.push(data?.projectConfigAssociations[i].configValueId)
                }
                // use indexOf to check if the ids exist in the above  projectAssociationTemp only those will be shown in the ui
                if(projectAssociationTemp.length > 0){
                    for(let i=0; i < list.length; i++ ){
                    if(list[i]?.childItems?.length == 0){
                            if(projectAssociationTemp.indexOf(list[i].id)>-1){
                                selectedList.push(list[i])
                        }
                    }
                    else if(list[i]?.childItems?.length > 0){
                        selectedList.push(list[i])
                        const firstChild : any = list[i]?.childItems 
                        for(let j = 0; j < firstChild.length; j++){
                            if(firstChild[j]?.childItems.length == 0){
                                    if(projectAssociationTemp.indexOf(firstChild[j].id)==-1){
                                        delete selectedList[i]?.childItems[j]
                                    }
                            }
                            else if(firstChild[j]?.childItems?.length  > 0){
                                const grandChild : any = firstChild[j]?.childItems
                                for(let l = 0; l < grandChild.length; l++){
                                        if(projectAssociationTemp.indexOf(grandChild[l].id)==-1){
                                            delete selectedList[i]?.childItems[j]?.childItems[l]
                                        }
                                }
                            }
                        }
                    }
                }}
                if(selectedList.length === 0) {
                    setCustomListArray(list)
                }
                else {
                    setCustomListArray(selectedList)
                }
            }
        }
    }, [projectState.customListValues])


    const getNodeListStructure=(argValues: Array<ConfigurationValue>): Array<ConfigListItem>=>{
        const returnValue: Array<ConfigListItem>= [];
        const parentNodes= argValues.filter((item: ConfigurationValue)=>!item.parentId);

        parentNodes.forEach(item=>{
            const newItem: ConfigListItem= new ConfigListItem(item.id,item.nodeName,item.parentId,[],true);
            const childNodes= argValues.filter((childItem:ConfigurationValue)=>childItem.parentId === newItem.id);
            const childItems: Array<ConfigListItem> =[];
            childNodes.forEach((childItem:ConfigurationValue)=>{
                const newChildNode: ConfigListItem= new ConfigListItem(childItem.id,childItem.nodeName,childItem.parentId,[], true);
                const grandChildNodes= argValues.filter((childNode:ConfigurationValue)=>childNode.parentId === newChildNode.id);
                const grandChildItems: Array<ConfigListItem>=[];
                grandChildNodes.forEach((grandChildItem:ConfigurationValue)=>{
                    const newGrandChildNode: ConfigListItem= 
                        new ConfigListItem(grandChildItem.id,grandChildItem.nodeName,grandChildItem.parentId,[], true);
                    grandChildItems.push(newGrandChildNode);
                })
                newChildNode.childItems= grandChildItems;
                childItems.push(newChildNode);
            })
            newItem.childItems=childItems;
            returnValue.push(newItem);
        })
        return returnValue;
    }

    const handleChange=(argValue: string) => {
        if(currentValue!==argValue){
            setcurrentValue(argValue);
            setOpen(false);
            setIsDirty(true);
        }
    };

    const toggleChildView=(argIndex: number)=>{
        const list=[...customListArray];
        list[argIndex].isOpen=!list[argIndex].isOpen;
        setCustomListArray([...list]);
    }

    const applyChanges=()=>{
        setCustomListArray([...customListArray]);
    }

    const clearValues=()=>{
        if(!props.isEditAllowed){
            setValueLabel('');
            setcurrentValue('');
            setIsDirty(true);
        }
    }
    const renderOptions = (arrayItems: any, icon?: any) => {
      return arrayItems.map((listItem: any, itemIndex: any) => (
        <MenuItem
          key={listItem.id}
          value={listItem.id}
          className="mat-menu-item-sm"
        >
          {icon} {listItem.nodeName}
          {renderOptions(listItem.childItems, <ChevronRightIcon />)}
        </MenuItem>
      ));
    };

    return (
      <CustomNestedDropDownContext.Provider
        value={{ handleChange, applyChanges, currentValue, customListArray }}
      >
        <div className="CustomListValue">
          <div className="CustomListValue__input">
                    <Tooltip title={valueLabel?(valueLabel):("Click here to select")}>
                    <TextField
                        // id="custom-dropdown"
                        fullWidth
                        onClick={handleClickOpen}
                        disabled={props.isEditAllowed}
                        variant="outlined"
                        autoComplete='off'
                        value={valueLabel?(`${valueLabel.length>55?`${valueLabel.slice(0,53)}...`: valueLabel}`):("")}
                        placeholder={valueLabel?(valueLabel):("Click here to select")}
                    />
                    </Tooltip>
                    {currentValue && !props.isEditAllowed && <Tooltip title={valueLabel?(valueLabel):("Clear value")}>
                        <IconButton className="CustomListValue__input__close" onClick={clearValues}>
                            <CloseIcon className="CustomListValue__input__close__icon"/>
                        </IconButton>
                    </Tooltip>}
                </div>
               {open&&(<CustomListDialog 
                            open={open}
                            customListArray={customListArray}
                            toggleChildView={toggleChildView}
                            handleClose={handleClose}
                            handleChange={handleChange}
                            currentValue={currentValue}/>)}
          {/* <FormControl fullWidth>
            <Select
              value={selectedValue}
              onChange={handleChangeSelect}
              autoComplete="off"
              variant="outlined"
              displayEmpty
              placeholder="Multi select"
              MenuProps={{
                classes: { paper: popOverclasses.root },
                anchorOrigin: {
                  vertical: "bottom",
                  horizontal: "left",
                },
                transformOrigin: {
                  vertical: "top",
                  horizontal: "left",
                },
              }}
              className="CustomListValue__nested_select"
            >
              <MenuItem value="" className="mat-menu-item-sm">
                None
              </MenuItem>
              {renderOptions(customListArray)}
            </Select>
          </FormControl> */}
        </div>
      </CustomNestedDropDownContext.Provider>
    );
}

export default React.memo(CustomListValue);
