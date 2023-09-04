import { Button, Dialog, DialogActions, DialogContent, FormControl, MenuItem, Select, TextField } from '@material-ui/core';
import React, { ReactElement, useContext, useEffect, useState } from 'react'
import { match, useRouteMatch } from 'react-router-dom';
import { useDebounce } from '../../../../../customhooks/useDebounce';
import { FieldAs, FieldAsList, InputType, nonpermittedFieldsForFormTable } from '../../../../../utils/constants';
import { CustomPopOver } from '../../../../shared/utils/CustomPopOver';
import { templateCreationContext } from '../../context/templateCreation/context';
import { CustomList } from '../../models/template';
import './CustomCellDialog.scss';

interface Props {
    index: number,
    cellIndex: number,
    cellData: any,
    isEditOpen: boolean,
    elementId: string,
    cancel:()=> void,
    save:(argPayload: any)=> void,
}

export interface Params {
    id: string;
}

function CustomCellDialog({cellData, isEditOpen, index, cellIndex, elementId, cancel, save}: Props): ReactElement {
    const classes= CustomPopOver();
    const pathMatch:match<Params>= useRouteMatch();
    const [inputType, setInputType] = useState<number>(-1);
    const [caption, setCaption] = useState('');
    const [isRequired, setIsRequired] = useState(-1);
    const [configListId, setConfigListId] = useState(-1);
    const {createTemplateState }:any = useContext(templateCreationContext);
    const debounceName = useDebounce(caption,300);
    const [isDirty, setisDirty] = useState(false);
    const [duplicateCaption, setduplicateCaption] = useState(false);
    const [isEditCell, setIsEditCell] = useState(false);
    const [isCaptionrequired, setisCaptionrequired] = useState(false);
    const [customListItems, setCustomListItems] = useState<Array<any>>([])

    useEffect(() => {
        validateCaptionName();
    }, [debounceName]);

    useEffect(() => {
        const nonDeletedField= createTemplateState.customList.filter((item: any)=> !item.deleted);
        if(cellData?.configListId>-1){
            // when field configId is null or invalid
            if(configListId<0 && createTemplateState.customList.length>0){
                if(!createTemplateState.isEdit){
                    const selectedCustomList= createTemplateState.customList.filter((item: any)=>item.name===caption && !item.deleted);
                    if(selectedCustomList.length>0){
                        setConfigListId(selectedCustomList[0].id);
                    } else{
                        setConfigListId(createTemplateState.customList[0].id);
                    }
                }
            } else if(configListId>0 && createTemplateState.customList.length>0){
                // When field config Id is valid 
                
                const deletedConfigItem= createTemplateState.customList.find((item: any)=> item.deleted && configListId===item.id);
                if(deletedConfigItem){
                    nonDeletedField.push(deletedConfigItem);
                }
            }
        }
        setCustomListItems(nonDeletedField);
     }, [configListId]);
    

    useEffect(() => {
       if(cellData){
        setInputType(isNaN(cellData.fieldTypeId)?Number(cellData.fieldTypeId):cellData.fieldTypeId);
        setCaption(cellData.caption);
        setIsRequired(cellData.required?1:0);
        if(cellData.fieldTypeId== InputType.CUSTOMDROPDOWN){
            setConfigListId(cellData.configListId);
        }
        setIsEditCell(true);
       } else{
        setIsEditCell(false);
       }
    }, [cellData])

    const validateCaptionName=()=>{
        const items= JSON.parse(JSON.stringify(createTemplateState.templateList[index].metadata.colData));
        const duplicateList= items.filter((item: any, columnIndex: number)=>item.caption.toLowerCase().trim()== caption.toLowerCase().trim() &&
            columnIndex !== cellIndex);
        if(duplicateList.length>0){
            setduplicateCaption(true);
        } else{
            setduplicateCaption(false);
        }
    }

    const handleClose=()=>{
        cancel();
    }

    const saveChanges=()=>{
       save({inputType:Number(inputType),caption: caption.trim(),isRequired, configListId:Number(configListId)});
    }

    const changeInFieldType=(argEvent: any)=>{
        setInputType(argEvent.target.value);
        if(argEvent.target.value === InputType.CUSTOMDROPDOWN){
            const defaultConfigListId= customListItems.length>0?customListItems[0].id : -1;
            setConfigListId(defaultConfigListId);
        }
        setisDirty(true);
    }

    const changeInCaption=(e: any)=>{
        setCaption(e.target.value);
        setisDirty(true);
        if(!e.target.value.trim()){
            setisCaptionrequired(true);
        } else{
            setisCaptionrequired(false);
        }
    }

    const onCaptionINputBlur=(event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        if(!event.target.value.trim()){
            setisCaptionrequired(true);
        } else{
            setisCaptionrequired(false);
        }
    }

    const changeInFieldAs=(e: any)=>{
        setIsRequired(e.target.value);
        setisDirty(true);
    }

    const changeInCustomListId=(e: any)=>{
        setConfigListId(e.target.value);
        setisDirty(true);
    }

    const isSaveEnabled=(): boolean=>{
        if(isEditCell){
            return duplicateCaption || !isDirty;
        } else{
            return duplicateCaption;
        }
    }


    return (
        <div className="CustomCellDialog">
            <Dialog className="CustomCellDialog__dialog"
                    fullWidth={true}
                    maxWidth={"xs"}
                    open={isEditOpen}
                    onClose={handleClose}
                    aria-labelledby="max-width-dialog-title"
                >
                    {/* <div className="CustomCellDialog__dialog__title" id="max-width-dialog-title">Select your list item</div> */}
                    <DialogContent className="CustomCellDialog__dialog__body">
                        <div className="CustomCellDialog__dialog__body__item">
                            <label className="CustomCellDialog__dialog__body__item__label">Caption</label>
                            <TextField id="outlined-basic"  variant="outlined" value={caption} 
                                placeholder="Caption"
                                autoFocus={true}
                                onBlur={(e)=>onCaptionINputBlur(e)}
                                onChange={(e:any)=>changeInCaption(e)} />
                           {isCaptionrequired?<label className="CustomCellDialog__dialog__body__item__error">
                                Caption is required</label>:
                            duplicateCaption ?<label className="CustomCellDialog__dialog__body__item__error">Caption already exists</label>:("")}
                        </div>
                        <div className="CustomCellDialog__dialog__body__item">
                            <label className="CustomCellDialog__dialog__body__item__label">Input Type</label>
                            <FormControl fullWidth  variant="outlined"  
                                className="fieldsContainer__existing__item__details__field__input">
                                <Select defaultValue="" id="inputType" 
                                data-testid={`create-headcell-inputType`}
                                value={inputType}
                                onChange={(e: any)=>changeInFieldType(e)}  
                                MenuProps={{ classes: { paper: classes.root },  anchorOrigin: {
                                    vertical: "bottom",
                                    horizontal: "left"
                                    },
                                    transformOrigin: {
                                    vertical: "top",
                                    horizontal: "left"
                                    },
                                    getContentAnchorEl: null }}>
                                    {createTemplateState.fieldList.map((row: any)=>
                                    nonpermittedFieldsForFormTable.indexOf(row.id)===-1 &&
                                        <MenuItem key={row.id}
                                        className="mat-menu-item-sm"
                                            value={row.id}>{row.fieldType}</MenuItem>)}
                                    </Select>
                            </FormControl>
                        </div>
                        {
                           inputType == InputType.CUSTOMDROPDOWN && 
                        <div className="CustomCellDialog__dialog__body__item">
                            <label className="CustomCellDialog__dialog__body__item__label">Custom List</label>
                            <FormControl fullWidth variant="outlined" 
                                className="fieldsContainer__existing__item__details__field__input">
                                    <Select defaultValue="" id="tableCellFieldas"
                                        data-testid={`header-cell-is-required`}
                                        value={configListId}
                                        onChange={(e: any)=>changeInCustomListId(e)}
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
                                            <MenuItem value={item.id} key={`customitem-${item.name}-${item.id}`} className="mat-menu-item-sm"
                                             data-testid={`customlist--item-${item.id}`} >
                                                {item.name}
                                            </MenuItem>
                                        ))}
                                        
                                        </Select>
                            </FormControl>
                         </div>
                        }

                        <div className="CustomCellDialog__dialog__body__item">
                            <label className="CustomCellDialog__dialog__body__item__label">Field as</label>
                            <FormControl fullWidth  variant="outlined"
                                className="fieldsContainer__existing__item__details__field__input">
                                    <Select defaultValue="" id="tableCellFieldas"
                                        data-testid={`header-cell-is-required`}
                                        value={isRequired}
                                        onChange={(e: any)=>changeInFieldAs(e)}
                                        MenuProps={{ classes: { paper: classes.root },  anchorOrigin: {
                                            vertical: "bottom",
                                            horizontal: "left"
                                            },
                                            transformOrigin: {
                                            vertical: "top",
                                            horizontal: "left"
                                            },
                                            getContentAnchorEl: null }}>
                                        {FieldAsList.map((fieldItem: FieldAs)=><MenuItem key={fieldItem.label} 
                                        className="mat-menu-item-sm"
                                        value={fieldItem.value}>{fieldItem.label}</MenuItem>)}
                                        
                                        </Select>
                            </FormControl>
                        </div>
                    </DialogContent>
                    <DialogActions className="CustomCellDialog__dialog__action">
                        <Button onClick={handleClose} className="btn-secondary">
                            Cancel
                        </Button>
                        <Button onClick={saveChanges} className="btn-primary" disabled={isSaveEnabled()}>
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>
        </div>
    )
}

export default CustomCellDialog
