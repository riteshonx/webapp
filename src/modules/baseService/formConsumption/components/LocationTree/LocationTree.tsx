import { Button, Dialog, DialogActions, DialogContent, IconButton, TextField, Tooltip } from '@material-ui/core';
import React, { ReactElement, useCallback, useContext, useEffect, useState } from 'react'
import { LocationNode } from '../../../projectSettings/models/location';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import './LocationTree.scss'; 
import { formStateContext, locationTreeContext, projectContext } from '../../Context/projectContext';
import LocationSubTree from '../LocationSubTree/LocationSubTree';
import CloseIcon from '@material-ui/icons/Close';
import LocationTreeDialog from './LocationTreeDialog';
import { CustomPopOver } from "../../../../shared/utils/CustomPopOver";

let getLabelValue=false;

interface ILocationTree{
    field: any;
    formData: any;
    isEditAllowed: boolean;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function LocationTree(props: ILocationTree): ReactElement {
    const [locationItemList, setLocationItemList] = useState<Array<LocationNode>>([])
    const [open, setOpen] = React.useState(false);
    const [currentValue, setcurrentValue] = useState<any>(null);
    const [valueLabel, setValueLabel] = useState('');
    const {projectState}: any = useContext(projectContext);
    const {setValue,setError, getValues, setIsDirty}: any = useContext(formStateContext);

    const [selectedValue, setSelectedValue] = React.useState<string[]>([]);
    const popOverclasses = CustomPopOver();

    const handleChangeValue = (event: SelectChangeEvent<typeof selectedValue>) => {
      const {
        target: { value },
      } = event;
      setSelectedValue(
        // On autofill we get a stringified value.
        typeof value === 'string' ? value.split(',') : value,
      );
    };

    useEffect(() => {
        try{
            const value= getValues(props.field.name);
            if((typeof value==='string' || !value) && currentValue !== value){
                setValue(props.field.name,currentValue || '');
                if(currentValue){
                    setError(props.field.name,'');
                }
                getLabelValue=false;
            } else if(value.length===0 && value){
                setValue(props.field.name,currentValue || '');
                if(currentValue){
                    setError(props.field.name,'');
                }
                getLabelValue=false;
            }
            if( projectState.locationTree.length>0 && !getLabelValue){
                getCurrentValueLabel();
            }
        }catch(error: any){
            console.log(error);
        }
    }, [currentValue,  projectState.locationTree])

    useEffect(() => {
        setLocationItemList(JSON.parse(JSON.stringify(projectState.locationTreeStructure)));
     }, [ projectState.locationTreeStructure])

     useEffect(() => {
         try{
            const value= getValues(props.field.name);
            if(!value) {
                return;
            }
            if(typeof value==='string'){
                if(!getLabelValue){
                    setcurrentValue(value);
                }
            } else{
                if(value.length>0){
                    setcurrentValue(value[0]?.locationReferenceId);
                    setValue(props.field.name, value[0]?.locationReferenceId || '');
                    const values=[...value[0].locationValue];
                    const label=values.reverse().join('>');
                    getLabelValue=true;
                    setValueLabel(label);
                }
            }
         } catch(error: any){
             console.log(error)
         }
    }, [props.field])

    const getCurrentValueLabel=()=>{
        let label='';
        const currentValueLabel= projectState.locationTree.find((item: LocationNode)=>item.id===currentValue);
        if(currentValueLabel){
            label+=`${currentValueLabel?.nodeName}`;
            if(currentValueLabel.parentId){
               label= getParentLabelName(currentValueLabel.parentId,label);
            }
        }
        setValueLabel(label);
    }

    const getParentLabelName=(argParentId: any,label: string): string=>{
        const currentValueLabel= projectState.locationTree.find((item: LocationNode)=>item.id===argParentId);
        if(currentValueLabel){
            label=`${currentValueLabel?.nodeName} > ${label}`;
            if(currentValueLabel.parentId){
                label=getParentLabelName(currentValueLabel.parentId,label);
            }
        }
        return label;
    }

    const handleChange=(argValue: string) => {
        setcurrentValue(currentValue===argValue?'':argValue);
    };

    const toggleChildView=(argIndex: number)=>{
        const list=[...locationItemList];
        list[argIndex].isOpen=!list[argIndex].isOpen;
        setLocationItemList([...list]);
    }

    const handleClickOpen = () => {
        if(!props.isEditAllowed){
            setOpen(true);
            openSelectedTreeStructure();
        }
    };
    
    const handleClose = () => {
        setOpen(false);
    };

    const saveChanges=()=>{
        setValue(props.field.name,currentValue || '');
        getLabelValue=false;
        props.field.onChange(currentValue);
        setIsDirty(true);
        setOpen(false);
    }

    const applyChanges=()=>{
        setLocationItemList([...locationItemList]);
    }

    const openSelectedTreeStructure=()=>{
        locationItemList.forEach((subItem)=>{
            if(subItem.childNodes.length>0){
                const response= checkIfChildNodeSlectedOne(subItem);
                if(response){
                    subItem.isOpen=true;
                }
            }
        })
        applyChanges();
    }

    const clearValues=()=>{
        if(!props.isEditAllowed){
            setValueLabel('');
            setcurrentValue('');
            setIsDirty(true);
        }
    }

    const checkIfChildNodeSlectedOne=(argSubItem: any): boolean=>{
        let returnValue=false;
        argSubItem.childNodes.forEach((subItem: any)=>{
            if(subItem.childNodes.length>0){
                const response= checkIfChildNodeSlectedOne(subItem);
                if(response && !returnValue){
                    subItem.isOpen= true;
                    returnValue= true;
                } else{ 
                    returnValue= false;
                }
            } else{
                returnValue= currentValue=== subItem.id;
            }
        })
        return returnValue;
    }
// childNodes: []
// id: "dd61f4bf-caed-43b3-b02f-ed429d26760f"
// isEdit: false
// isOpen:true
// nodeName: "19-01-2022"
// parentId:null
    const renderLocationList = (locationItemList:any, icon?:any)=>
    { return locationItemList.map((listItem:any, itemIndex:any) => (
        <MenuItem key={listItem?.id} value={listItem?.nodeName}>
          {icon}
          <Checkbox checked={selectedValue.indexOf(listItem?.nodeName) > -1} />
          <ListItemText primary={listItem.nodeName} />
          {renderLocationList(listItem?.childNodes, <ChevronRightIcon/>)}
        </MenuItem>
      ))}

    return (
      <locationTreeContext.Provider
        value={{ handleChange, applyChanges, currentValue, locationItemList }}
      >
        <div className="LocationTree">
          <div  className="LocationTree__input">
                <Tooltip title={valueLabel?(valueLabel):("Click here to select")}>
                    <TextField
                        id="custom-dropdown"
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
                        <IconButton className="LocationTree__input__close" onClick={clearValues}>
                            <CloseIcon className="LocationTree__input__close__icon"/>
                        </IconButton>
                    </Tooltip>}
                </div>
          {open&& <LocationTreeDialog 
                            open={open} 
                            locationItemList={locationItemList} 
                            toggleChildView={toggleChildView}
                            currentValue={currentValue}
                            handleChange={handleChange}
                            handleClose={handleClose}
                            saveChanges={saveChanges}
                         />}

          {/* <FormControl fullWidth>
            <Select
              labelId="demo-multiple-checkbox-label"
              id="demo-multiple-checkbox"
              multiple
              value={selectedValue}
              onChange={handleChangeValue}
              renderValue={(selected) => selected.join(", ")}
              variant="outlined"
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
            >
              {renderLocationList(locationItemList)}
            </Select>
          </FormControl> */}
        </div>
      </locationTreeContext.Provider>
    );
}

export default React.memo(LocationTree);