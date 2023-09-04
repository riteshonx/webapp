import { Tooltip } from '@material-ui/core'
import React, { ReactElement, useContext, useEffect, useState } from 'react'
import { TaskLibContext } from '../../pages/TaskLibrary/TaskLibrary';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import CreateTask from '../CreateTask/CreateTask'
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import ConfirmDialog from '../../../../shared/components/ConfirmDialog/ConfirmDialog';
import { TaskLibraryModel } from '../../grqphql/models/dataModels';
import './TaskGrid.scss';
import { createTenantTask, deleteTenantTask, updateTenantTask, viewTenantTask } from '../../../permission/scheduling';
import NoDataMessage from '../../../../shared/components/NoDataMessage/NoDataMessage';
import { getUniqueName } from '../../../../../utils/helper';
interface nameBtn {
    name: string,
    submit: string
}

interface taskLib {
    duration: number,
    taskName: string,
    taskType: string,
    customId: string,
    customTaskType: string,
    classification: string,
    description: string,
    tag: null,
    id: number,
    createdBy: number,
    createdAt: Date   
}

interface message {
    header: string,
    text: string,
    cancel: string,
    proceed: string,
}

interface actionData{
    actionType:string,
    taskData:taskLib
}
const btnNamae: nameBtn = {
    name: "Edit Task",
    submit: "Update",
};

const confirmMessage: message = {
    header: "Are you sure?",
    text: "If you delete this task, all data related to this task will be lost.",
    cancel: "Cancel",
    proceed: "Proceed",
}

const noPermissionMessage = "You don't have permission to view this task";


export default function TaskGrid(props: any): ReactElement {
    const taskData = useContext(TaskLibContext);
    const [GridData, setTableData] = useState(taskData)
    const [selectItem, setSelectItem] = useState({});
    const [dialogOpen, setDialogOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<any>()
    const [actionData,setActionData] = useState<actionData>();

    useEffect(() => {
        setTableData(taskData);
    }, [GridData]);

    const handleDialogOpen = (item:taskLib, actionType: string) => {
        setDialogOpen(true);
        setSelectItem(item);
        const data= {...item};
        if(actionType=== 'copy'){
            const namesList= taskData.map((current: any)=>current.taskName);
            namesList.push(data.taskName);
            data.taskName= getUniqueName(namesList);
        }
        setActionData({ actionType:actionType, taskData:data});
    }

    const handleDialogClose = () => {
        setDialogOpen(false)
    }

    const handleConfirmBoxOpen = (id: number) => {
        setConfirmOpen(true);
        setSelectedId(id);
    }

    const handleConfirmBoxClose = () => {
        setConfirmOpen(false);
    }

    const deleteTask = () => {
        props.deleteTask(selectedId);
        setConfirmOpen(false);
    };

    const refreshTaskList = () => {
        props.refresh();
    }
    
        return (
        <>
          {viewTenantTask ? (
             taskData.map((item: TaskLibraryModel) => 
            <div className="grid-view__card" key={item.id}>
                <div className="grid-view__card__name">{item.taskName}</div>
                <div className="grid-view__card__description">
                    {item.description}
                </div>
                <div className="grid-view__card__info">
                    <div className="grid-view__card__info__type">
                    <div className="grid-view__card__info__type__task-type">
                        {item.taskType}
                    </div>
                    <div className="grid-view__card__info__type__duration">
                        {item.duration > 1 ? `${item.duration} days` : `${item.duration} day`}
                    </div>
                    </div>
                    <div className="grid-view__card__info__action">
                    {createTenantTask ? (
                    <Tooltip title="Copy">
                      <FileCopyIcon
                        data-testid={`edit-task-${item.id}`}
                        className="formlistTable__cellicon"
                        onClick={() => handleDialogOpen(item,'copy')}
                      />
                    </Tooltip>
                  ) : (
                    ''
                  )}
                    { updateTenantTask ? (
                    <Tooltip title="Edit">
                        <EditIcon data-testid={`edit-task-${item.id}`} className="grid-view__card__info__action__icon"
                        onClick={() => handleDialogOpen(item,'edit')} 
                        />
                    </Tooltip> )
                     : '' }
                    { deleteTenantTask ? (
                    <Tooltip title="Delete">
                        <DeleteIcon data-testid={`delete-task-${item.id}`} className="grid-view__card__info__action__icon"
                        onClick={() => handleConfirmBoxOpen(item.id)} />
                    </Tooltip>
                    )
                    : '' }
                    </div>
                </div>
            </div>
            )
            ):(
                <div className="no-permission">
                  <NoDataMessage message={noPermissionMessage}/> 
                </div>
              )}
            {
                dialogOpen ?(
                    <CreateTask open={dialogOpen} taskActionItem={actionData} btnName={btnNamae} 
                    refreshTaskList={refreshTaskList} close={handleDialogClose} />
                ) : ('')
            }
            {
                confirmOpen ?(
                    <ConfirmDialog open={confirmOpen} message={confirmMessage} close={handleConfirmBoxClose} proceed={deleteTask} />
                ) : ('')
            }
        </>
    )
}
