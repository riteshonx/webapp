import React, { ReactElement, useCallback, useContext, useState } from 'react'
import { TemplateData } from '../../models/template';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import CreateIcon from '@material-ui/icons/Create';
import { IconButton, Tooltip } from '@material-ui/core';
import './CustomHeadCell.scss';
import CustomCellDialog from '../CustomCellDialog/CustomCellDialog';
import { templateCreationContext } from '../../context/templateCreation/context';
import { setSelectedTemplateField, setTemplateList } from '../../context/templateCreation/action';
import { InputType } from '../../../../../utils/constants';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog/ConfirmDialog';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import TextFieldsIcon from '@material-ui/icons/TextFields';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import QueryBuilderIcon from '@material-ui/icons/QueryBuilder';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import ChatBubbleOutlineIcon from '@material-ui/icons/ChatBubbleOutline';
import TableChartIcon from '@material-ui/icons/TableChart';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import ViewListIcon from '@material-ui/icons/ViewList';
import FormatListNumberedRtlIcon from '@material-ui/icons/FormatListNumberedRtl';
import BusinessIcon from '@material-ui/icons/Business';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import DialpadIcon from '@material-ui/icons/Dialpad';
import ToggleOnIcon from '@material-ui/icons/ToggleOn';

interface ICell{
    field: TemplateData,
    index: number,
    cellIndex: number,
    cellData: any
}

const confirmMessage = {
    header: "Are you sure?",
    text: "You want to delete column.",
    cancel: "Go back",
    proceed: "Yes, I\'m sure",
}

function CustomHeadCell({cellData, index,field, cellIndex}: ICell): ReactElement {
    const [isEditOpen, setisEditOpen] = useState(false);
    const {createTemplateState, createTemplateDispatch }:any = useContext(templateCreationContext);
    const [confirmOpen, setConfirmOpen] = useState(false);
    


    const editColumn=()=>{
        setisEditOpen(true);
    }

    const deleteColumn=async ()=>{
        try{
            if(createTemplateState.isEdit){
                setConfirmOpen(true);
            } else{
                const items= JSON.parse(JSON.stringify(createTemplateState.templateList));
                items[index].metadata.colData.splice(cellIndex, 1);
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
            const column: any= {
                caption: argPayload.caption,
                fieldTypeId: argPayload.inputType,
                required: argPayload.isRequired==1,
                position:  cellIndex+1
            }
            if(column.fieldTypeId == InputType.CUSTOMDROPDOWN){
                column.configListId= argPayload.configListId;
            }
            items[index].metadata.colData[cellIndex]=column
            createTemplateDispatch(setTemplateList(items));
            createTemplateDispatch(setSelectedTemplateField(createTemplateState.selectedTemplateField));
        }catch(error: any){
            console.log(error);
        }
    }

    const confirmDeleteColumn=async ()=>{
        try{
            setConfirmOpen(false);
            const items= JSON.parse(JSON.stringify(createTemplateState.templateList));
            items[index].metadata.colData.splice(cellIndex, 1);
            createTemplateDispatch(setTemplateList(items));
            createTemplateDispatch(setSelectedTemplateField(createTemplateState.selectedTemplateField));
        } catch(error: any){
            console.log(error);
        }
    }

    const renderExistingFields=useCallback(() => {
        switch(cellData.fieldTypeId){
            case InputType.TEXT:
            case InputType.LONGTEXT:
            case InputType.COMMENTS:{
               return <TextFieldsIcon  className={"CustomHeadCell__icon"}/>
            }
           case InputType.DATEPICKER:{
               return <CalendarTodayIcon  className={"CustomHeadCell__icon"}/>
           }
           case InputType.DATETIMEPICKER:{
            return <CalendarTodayIcon  className={"CustomHeadCell__icon"}/>
           }
           case InputType.TIMEPICKER:{
               return <QueryBuilderIcon  className={"CustomHeadCell__icon"}/>
           }
           case InputType.ATTACHMENT:{
               return <AttachFileIcon  className={"CustomHeadCell__icon"}/>
           }
           case InputType.INTEGER:{
               return <DialpadIcon className="CustomHeadCell__icon"/>
           }
           case InputType.COMMENTS:{
               return <ChatBubbleOutlineIcon  className={"CustomHeadCell__icon"}/>
           }
           case InputType.CUSTOMDROPDOWN:
           case InputType.CUSTOMNESTEDDROPDOWN:{
            return <FormatListNumberedRtlIcon  className={"CustomHeadCell__icon"}/>
           }
           case InputType.SINGLEVALUEUSER:{
            return <PeopleAltIcon  className={"CustomHeadCell__icon"}/>
           }
           case InputType.SINGLEVALUECOMPANY:{
            return <BusinessIcon  className={"CustomHeadCell__icon"}/>
           }
           case InputType.MULTIVALUEUSER:
           case InputType.MULTIVALUECOMPANY:{
               return <ViewListIcon  className={"CustomHeadCell__icon"}/>
           }
           case InputType.BOOLEAN:{
               return <ToggleOnIcon  className={"CustomHeadCell__icon"}/>
           }
           case InputType.TABLE:{
            return <TableChartIcon  className={"CustomHeadCell__icon"}/>
           }
           case InputType.LOCATION:{
               return <LocationOnIcon className={"CustomHeadCell__icon"}/>
           }
           case InputType.LOCATIONTREE:{
            return <AccountTreeIcon  className={"CustomHeadCell__icon"}/>
           }
        }
        },[cellData])


    return (
        <div className="CustomHeadCell">
            {renderExistingFields()}
            {
                cellData?.caption ?( 
                <Tooltip title={cellData?.caption} >
                    <div className="CustomHeadCell__caption">
                        {cellData?.caption} {cellData?.required?"*": ""}
                    </div>
                </Tooltip>):(
                <Tooltip title={cellData?.caption} >
                    <div className="CustomHeadCell__placeholder" onClick={editColumn}>
                            Click to Define
                    </div>
                </Tooltip>
           )}
            <div className="CustomHeadCell__action">
                <Tooltip title={`Edit ${cellData?.caption}`} >
                    <IconButton className="CustomHeadCell__action__delete" 
                        onClick={editColumn}>
                        <CreateIcon className="CustomHeadCell__action__delete__icon"/>
                    </IconButton>
                </Tooltip>
                {createTemplateState.templateList[index].metadata.colData.length>1 &&(
                <Tooltip title={`Delete ${cellData?.caption}`} >
                    <IconButton className="CustomHeadCell__action__delete" 
                        onClick={deleteColumn}>
                        <DeleteOutlineIcon className="CustomHeadCell__action__delete__icon"/>
                    </IconButton>
                </Tooltip>)}
            </div>
            {isEditOpen && <CustomCellDialog cellData={cellData} isEditOpen={isEditOpen} index={index} 
                cellIndex={cellIndex} elementId={field.elementId}
                cancel={handleClose} save={saveChanges}/>}
             {<ConfirmDialog open={confirmOpen} message={confirmMessage} close={()=>setConfirmOpen(false)} proceed={confirmDeleteColumn} />}
        </div>
    )
}

export default CustomHeadCell;
