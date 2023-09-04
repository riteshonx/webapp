import React, { ReactElement, useContext, useState } from 'react'
import { TemplateData } from '../../models/template';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import CreateIcon from '@material-ui/icons/Create';
import { IconButton, Tooltip } from '@material-ui/core';
import { templateCreationContext } from '../../context/templateCreation/context';
import { setSelectedTemplateField, setTemplateList } from '../../context/templateCreation/action';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog/ConfirmDialog';
import CustomRowCellDialog from '../CustomRowCellDialog/CustomRowCellDialog';
import './CustomRowCell.scss';

interface ICell{
    field: TemplateData,
    index: number,
    cellIndex: number,
    cellData: any
}

const confirmMessage = {
    header: "Are you sure?",
    text: "You want to delete row.",
    cancel: "Go back",
    proceed: "Yes, I\'m sure",
}

function CustomRowCell({cellData, index,field, cellIndex}: ICell): ReactElement {
    const [isEditOpen, setisEditOpen] = useState(false);
    const {createTemplateState, createTemplateDispatch }:any = useContext(templateCreationContext);
    const [confirmOpen, setConfirmOpen] = useState(false);


    const editRow=()=>{
        setisEditOpen(true);
    }

    const deleteRow=async ()=>{
        try{
            if(createTemplateState.isEdit){
                setConfirmOpen(true);
            } else{
                const items= JSON.parse(JSON.stringify(createTemplateState.templateList));
                items[index].metadata.rowData.splice(cellIndex, 1);
                createTemplateDispatch(setTemplateList(items));
            }
        }catch(error: any){
            console.log(error.message);
        }
    }

    const handleClose=()=>{
        setisEditOpen(false);
    }

    const saveChanges=async (argPayload: any)=>{
        try{
            setisEditOpen(false);
            const items= JSON.parse(JSON.stringify(createTemplateState.templateList));
            const rowCell: any= {
                ...items[index].metadata.rowData[cellIndex],
                caption: argPayload.caption,
            }
            items[index].metadata.rowData[cellIndex]=rowCell;
            createTemplateDispatch(setTemplateList(items));
            createTemplateDispatch(setSelectedTemplateField(createTemplateState.selectedTemplateField));
        }catch(error: any){
            console.log(error);
        }
    }

    const confirmDeleteRow=async ()=>{
        try{
            const items= JSON.parse(JSON.stringify(createTemplateState.templateList));
            items[index].metadata.rowData.splice(cellIndex, 1);
            createTemplateDispatch(setTemplateList(items));
            createTemplateDispatch(setSelectedTemplateField(createTemplateState.selectedTemplateField));
        } catch(error: any){
            console.log(error);
        }
    }

    return (
        <div className="CustomRowCell">
            {
                cellData?.caption ?( 
                <Tooltip title={cellData?.caption} >
                    <div className="CustomRowCell__caption">
                        {cellData?.caption} {cellData?.required?"*": ""}
                    </div>
                </Tooltip>):(
                <Tooltip title={cellData?.caption} >
                    <div className="CustomRowCell__placeholder" onClick={editRow}>
                            Click to Define
                    </div>
                </Tooltip>
           )}
            <div className="action">
                <Tooltip title={`Edit ${cellData?.caption}`} >
                    <IconButton className="action__delete" 
                        onClick={editRow}>
                        <CreateIcon className="action__delete__icon"/>
                    </IconButton>
                </Tooltip>
                {
                    createTemplateState.templateList[index].metadata.rowData.length>1 &&
                    <Tooltip title={`Delete ${cellData?.caption}`} >
                        <IconButton className="action__delete" 
                            onClick={deleteRow}>
                            <DeleteOutlineIcon className="action__delete__icon"/>
                        </IconButton>
                    </Tooltip>
                }
            </div>
            {isEditOpen && <CustomRowCellDialog cellData={cellData} isEditOpen={isEditOpen} index={index} 
                cellIndex={cellIndex} elementId={field.elementId}
                cancel={handleClose} save={saveChanges}/>}
             {<ConfirmDialog open={confirmOpen} message={confirmMessage} close={()=>setConfirmOpen(false)} proceed={confirmDeleteRow} />}
        </div>
    )
}

export default CustomRowCell;
