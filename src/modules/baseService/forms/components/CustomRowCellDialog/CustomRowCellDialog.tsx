import { Button, Dialog, DialogActions, DialogContent, TextField } from '@material-ui/core';
import React, { ReactElement, useContext, useEffect, useState } from 'react'
import { match, useRouteMatch } from 'react-router-dom';
import { useDebounce } from '../../../../../customhooks/useDebounce';
import { client } from '../../../../../services/graphql';
import { InputType } from '../../../../../utils/constants';
import { FormsRoles } from '../../../../../utils/role';
import { templateCreationContext } from '../../context/templateCreation/context';
import { LOAD_TABLE_METADATA_BASEDON_ELEMENTID } from '../../grqphql/queries/formTemplates';
import './CustomRowCellDialog.scss';

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

function CustomRowCellDialog({cellData, isEditOpen, index, cellIndex, elementId, cancel, save}: Props): ReactElement {
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

    useEffect(() => {
        validateCaptionName();
    }, [debounceName]);
    

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
        const items= JSON.parse(JSON.stringify(createTemplateState.templateList[index].metadata.rowData));
        const duplicateList= items.filter((item: any, currentCellIndex: number)=>item.caption.toLowerCase().trim()== caption.toLowerCase().trim() &&
            currentCellIndex  !== cellIndex);
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

    const changeInCaption=(e: any)=>{
        setCaption(e.target.value);
        setisDirty(true);
        if(!e.target.value.trim()){
            setisCaptionrequired(true);
        } else{
            setisCaptionrequired(false);
        }
    }

    const onCaptionInputBlur=(event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        if(!event.target.value.trim()){
            setisCaptionrequired(true);
        } else{
            setisCaptionrequired(false);
        }
    }

    const isSaveEnabled=(): boolean=>{
        if(isEditCell){
            return duplicateCaption || !isDirty || !caption.trim();
        } else{
            return duplicateCaption || !caption.trim();
        }
    }


    return (
        <div className="CustomRowCellDialog">
            <Dialog className="CustomRowCellDialog__dialog"
                    fullWidth={true}
                    maxWidth={"xs"}
                    open={isEditOpen}
                    onClose={handleClose}
                    aria-labelledby="max-width-dialog-title"
                >
                    {/* <div className="CustomRowCellDialog__dialog__title" id="max-width-dialog-title">Select your list item</div> */}
                    <DialogContent className="CustomRowCellDialog__dialog__body">
                        <div className="CustomRowCellDialog__dialog__body__item">
                            <label className="CustomRowCellDialog__dialog__body__item__label">Caption</label>
                            <TextField id="outlined-basic"  variant="outlined" value={caption} 
                                placeholder="Caption"
                                autoFocus={true}
                                onBlur={(e)=>onCaptionInputBlur(e)}
                                onChange={(e:any)=>changeInCaption(e)} />
                           {isCaptionrequired?<label className="CustomRowCellDialog__dialog__body__item__error">
                                Caption is required</label>:
                            duplicateCaption ?<label className="CustomRowCellDialog__dialog__body__item__error">Caption already exists</label>:("")}
                        </div>
                    </DialogContent>
                    <DialogActions className="CustomRowCellDialog__dialog__action">
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

export default CustomRowCellDialog;
