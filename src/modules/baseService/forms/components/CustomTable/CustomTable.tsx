import { IconButton, Tooltip } from '@material-ui/core';
import React, { ReactElement, useContext, useEffect, useState } from 'react'
import { InputType } from '../../../../../utils/constants';
import { setTemplateList } from '../../context/templateCreation/action';
import { templateCreationContext } from '../../context/templateCreation/context';
import { TemplateData } from '../../models/template';
import AddIcon from '@material-ui/icons/Add';
import './CustomTable.scss';
import CustomHeadCell from '../CustomHeadCell/CustomHeadCell';
import CustomCellDialog from '../CustomCellDialog/CustomCellDialog';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog/ConfirmDialog';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import { setIsLoading } from 'src/modules/root/context/authentication/action';
import CustomRowCell from '../CustomRowCell/CustomRowCell';
import CustomRowCellDialog from '../CustomRowCellDialog/CustomRowCellDialog';
import CreateIcon from '@material-ui/icons/Create';
import CustomIndexCell from '../CustomIndexCell/CustomIndexCell';

interface ITable{
    field: TemplateData,
    index: number
}

const confirmMessage = {
    header: "Are you sure?",
    text: "You want to delete the row.",
    cancel: "Go back",
    proceed: "Yes, I\'m sure",
}

function CustomTable({field, index}: ITable): ReactElement {
    const {createTemplateState, createTemplateDispatch }:any = useContext(templateCreationContext);
    const [isAddNewColunOpen, setIsAddNewColunOpen] = useState(false);
    const [cellData] = useState({fieldTypeId: 1,caption:'',required: false,configListId: -1});
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteRowIndex, setDeleteRowIndex] = useState(-1);
    const {dispatch }:any = useContext(stateContext);
    const [addNewRowOpen, setaddNewRowOpen] = useState(false);
    const [editIndexCell, setEditIndexCell] = useState(false);

    useEffect(() => {
       if(field.metadata?.rowData || field.metadata?.colData){
       }else{
         const colData: Array<any>=[];
         const rowData: Array<any>=[];
         for(let i=0;i<5;i++){
             colData.push({
                caption: `Configure column ${i+1}`,
                fieldTypeId: InputType.TEXT,
                required: false,
                position: i+1
             })
         }
         for(let i=0;i<5;i++){  
            rowData.push({
                caption: `Configure row ${i+1}`,
                position: i+1
            })
        }
        const items= [...createTemplateState.templateList];
        items[index].metadata={
            colData,
            rowData,
            index: 'configure header'
        }
        createTemplateDispatch(setTemplateList(items));
       }
    }, [field])


    const handleClose=()=>{
        setIsAddNewColunOpen(false);
    }

    const saveChanges=async(argPayload: any)=>{
        try{
            const items= JSON.parse(JSON.stringify(createTemplateState.templateList));
            const column: any= {
                caption: argPayload.caption,
                fieldTypeId: argPayload.inputType,
                required: argPayload.isRequired===1,
                position:  items[index].metadata.colData.length+1
            }
            if(column.fieldTypeId=== InputType.CUSTOMDROPDOWN){
                column.configListId= argPayload.configListId;
            }
            setIsAddNewColunOpen(false);
            items[index].metadata.colData.push(column);
            createTemplateDispatch(setTemplateList(items));
        } catch(error: any){
            console.log(error);
            dispatch(setIsLoading(false));
        }
    }

    const addNewColumn= ()=>{
        setIsAddNewColunOpen(true);
    }

    const addNewRow=async ()=>{
        setaddNewRowOpen(true);
    }

    const confirmDeleteRow=async ()=>{
        try{
            const items= JSON.parse(JSON.stringify(createTemplateState.templateList));
            setConfirmOpen(false);
            if(deleteRowIndex>-1){
                items[index].metadata.rowData.splice(deleteRowIndex,1);
                createTemplateDispatch(setTemplateList(items));
                setDeleteRowIndex(-1);
            }
            dispatch(setIsLoading(false));
        } catch(error: any){
            console.log(error);
            dispatch(setIsLoading(false));
        }
    }

    const saveindexRow= (argPayload: any)=>{
        try{
            const items= JSON.parse(JSON.stringify(createTemplateState.templateList));
            setEditIndexCell(false);
            items[index].metadata.index= argPayload.caption;
            createTemplateDispatch(setTemplateList(items));
        } catch(error: any){
            console.log(error);
            dispatch(setIsLoading(false));
        }
    }

    const saveNewRow= (argPayload: any)=>{
        try{
            const items= JSON.parse(JSON.stringify(createTemplateState.templateList));
            setaddNewRowOpen(false);
            items[index].metadata.rowData.push({caption:argPayload.caption });
            createTemplateDispatch(setTemplateList(items));
        } catch(error: any){
            console.log(error);
            dispatch(setIsLoading(false));
        }
    }

    const handleEditIndexCell=()=>{
        setEditIndexCell(true);
    }

    return (
        <div className="CustomTable">
            {field.metadata?.colData?.length<15 &&
                <Tooltip title="Add new column">
                    <IconButton className="CustomTable__addcolumn" onClick={addNewColumn}>
                        <AddIcon className="CustomTable__addcolumn__icon"/>
                    </IconButton>
                </Tooltip>
            }
            {field.metadata?.rowData?.length<30 &&
                <Tooltip title="Add new row">
                    <IconButton className="CustomTable__addRow" onClick={addNewRow}>
                        <AddIcon className="CustomTable__addRow__icon"/>
                    </IconButton>
                </Tooltip>
            }
            <div className="CustomTable__container">
                <table className="CustomTable__container__table">
                    <thead>
                        <tr>
                        {field.showNumberColumn && <th className="CustomTable__container__table__slnoth">Slno</th>} 
                        <th className="CustomTable__container__table__indexcell">
                            <div  className="CustomTable__container__table__indexcell__field">
                            {field.metadata.index?(<div className="CustomTable__container__table__indexcell__field__label">
                                    {field.metadata.index}
                                </div>):(
                                <div className="CustomTable__container__table__indexcell__label" onClick={handleEditIndexCell}>
                                    Click to Define
                                </div>)}
                                <Tooltip title={`Edit ${cellData?.caption}`} >
                                    <IconButton className="action" 
                                        onClick={handleEditIndexCell}>
                                        <CreateIcon className="action__icon"/>
                                    </IconButton>
                                </Tooltip>
                            </div>
                        </th>
                            {field.metadata?.colData && field.metadata?.colData.length>0 &&
                             field.metadata?.colData.map((headCell: any, headeCellIndex: number)=><th key={`headecell-${headeCellIndex}`}
                                className="CustomTable__container__table__headcell">
                                    <CustomHeadCell cellData={headCell} field={field} index={index} cellIndex={headeCellIndex}/>
                                </th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {field.metadata?.rowData && field.metadata?.rowData.length>0 && 
                        field.metadata?.rowData.map((rowData: any, rowIndex: number)=>(
                        <tr className="CustomTable__container__table__row" key={`row-${rowIndex}-${rowData.caption}`}>
                             {field.showNumberColumn && <td className="CustomTable__container__table__row__slnotd">{rowIndex+1}</td>} 
                             <td className="CustomTable__container__table__row__slnotd">
                                <CustomRowCell cellData={rowData} field={field} index={index} cellIndex={rowIndex}/>
                             </td>
                            {field.metadata?.colData.map((headCell: any, cellIndex: number)=><td key={`row-${rowIndex}=${cellIndex}`} 
                                className="CustomTable__container__table__row__cell">
                                   
                                </td>)}
                        </tr>))}
                    </tbody>
                </table>
            </div>
            {isAddNewColunOpen && <CustomCellDialog cellData={cellData} isEditOpen={isAddNewColunOpen} elementId={field?.elementId||''}
                index={index} cellIndex={createTemplateState.templateList[index].metadata.colData.length}
                cancel={handleClose} save={saveChanges}/>}

            {addNewRowOpen && <CustomRowCellDialog cellData={cellData} isEditOpen={addNewRowOpen} elementId={field?.elementId||''}
                index={index} cellIndex={createTemplateState.templateList[index].metadata.colData.length}  cancel={()=>setaddNewRowOpen(false)} 
                save={saveNewRow}/>}
            {<ConfirmDialog open={confirmOpen} message={confirmMessage} close={()=>setConfirmOpen(false)} proceed={confirmDeleteRow} />}
            {editIndexCell && <CustomIndexCell indexCaption={field.metadata.index} isEditOpen={editIndexCell} 
            cancel={()=>setEditIndexCell(false)} save={saveindexRow}/>}
        </div>
    )
}

export default React.memo(CustomTable);
