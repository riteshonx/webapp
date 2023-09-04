import React, { createContext, ReactElement, useContext, useEffect, useState } from "react";
import LibraryAction from "../../components/LibraryAction/LibraryAction";
import LibraryHeader from "../../components/LibraryHeader/LibraryHeader";
import "./TaskLibrary.scss";
import TaskTable from "../../components/TaskTable/TaskTable";
import TaskGrid from "../../components/TaskGrid/TaskGrid";
import {DELETE_TASK_LIBRARY, LOAD_TASK_LIBRARY} from "../../grqphql/queries/taskLibrary";
import { useLazyQuery, useMutation } from "@apollo/client";
import { TaskRoles } from "../../../../../utils/role";
import { stateContext } from "../../../../root/context/authentication/authContext";
import { setIsLoading } from "../../../../root/context/authentication/action";
import Notification,{ AlertTypes } from "../../../../shared/components/Toaster/Toaster";
import { TaskLibraryModel } from "../../grqphql/models/dataModels";
import { useDebounce } from "../../../../../customhooks/useDebounce";
import NoDataMessage from "../../../../shared/components/NoDataMessage/NoDataMessage";
import { viewTenantTask } from "../../../permission/scheduling";
import { client } from "../../../../../services/graphql";

interface librarayHeader {
  name: string;
  description: string;
}

const headerInfo: librarayHeader = {
  name: "Task Library",
  description: "Repository of task templates",
};

const noDataMessage= 'No task libraries were found.';
const noPermissionMessage = "You don't have permission to view task library";


export const TaskLibContext = createContext<any>({});

export default function TaskLibrary(): ReactElement {
  const {dispatch, state }:any = useContext(stateContext);
  const [viewType, setViewType] = useState("gallery");
  const [taskData, setTaskData] = useState<Array<TaskLibraryModel>>([]);
  const [deleteTaskLibrary, { loading: deleteTaskLoading, data: deleteTaskData, error: deleteError }] = useMutation(
    DELETE_TASK_LIBRARY,{context:{role: TaskRoles.deleteTenantTask}});
  const [searchText, setsearchText] = useState('');
  const debounceName = useDebounce(searchText, 1000);

  const toggleView = (type: string) => {
    setViewType(type);
  };

  useEffect(() => {
    if(viewTenantTask)
      getTaskLibrariesList();
  }, [])

  const getTaskLibrariesList= async()=>{
    try{
        dispatch(setIsLoading(true));
        const response: any= await client.query({
          query: LOAD_TASK_LIBRARY,
          variables:{
            limit: 1000,
            offset: 0,
            taskName: `%${debounceName}%`
          },
          fetchPolicy: 'network-only', context:{role: TaskRoles.viewTenantTask}
        });
        const taskDataLists: Array<TaskLibraryModel> = [];
        response.data.taskLibrary.forEach((item: TaskLibraryModel) => {
          const newTemplate: TaskLibraryModel = {
            taskName: item.taskName,
            description: item.description,
            taskType: item.taskType,
            duration: item.duration,
            customId: item.customId,
            customTaskType: item.customTaskType,
            classification: item.classification,
            tag: item.tag,
            id: item.id,
            createdBy: item.createdBy,
            createdAt: item.createdAt,
            tenantAssociation: item.tenantAssociation

          }
          taskDataLists.push(newTemplate);
        })
        setTaskData(taskDataLists);
        dispatch(setIsLoading(false));
    }catch(error:any){
      console.log(error.message);
      dispatch(setIsLoading(false));
    }
  }


  useEffect(() => {
    if(viewTenantTask)
    refreshList();
  }, [debounceName])

  const searchTaskByName = (value: string) => {
    setsearchText(value)
  }

  const refreshList = () => {
    getTaskLibrariesList();
  }

  //delete task starts

  useEffect(() => {
    if(deleteTaskLoading){
         dispatch(setIsLoading(true));
    }
    if(deleteTaskData){
        Notification.sendNotification('Deleted  successfully', AlertTypes.success);
        dispatch(setIsLoading(false));
        refreshList();
    }
    if(deleteError){
        dispatch(setIsLoading(false));
        Notification.sendNotification('Invalid Project feature', AlertTypes.warn);
    }
 }, [deleteTaskData, deleteError, deleteTaskLoading]);


  const deleteTask = (id: number) => {
    if(id){
      deleteTaskLibrary({
        variables:{
          id: id
        }
      });
    }
  }
  //delete task ends
  
  return (<>
    {
    viewTenantTask ? (
    <div className="task-lib">
      <LibraryHeader header={headerInfo} />
      <LibraryAction toggleView={toggleView} refresh={refreshList} searchText={searchText} searchTask={searchTaskByName} view={viewType} />
      <TaskLibContext.Provider value = {taskData}>
        <div className="task-lib__main">
          {viewType === "gallery" ? (
            // *******************  list view *******************
            <div className="task-lib__grid-view">
              {
                taskData.length>0 ? (
                  <TaskGrid deleteTask={deleteTask} refresh={refreshList}/>
                ): ( !state.isLoading ? (
                    <div className="no-data-wrapper">
                      <NoDataMessage message={noDataMessage}/>
                    </div>
                  ): ("")  
                )
              }
            </div>
          ) : (
          // *******************  list view *******************
              <div className="task-lib__list-view">
                <TaskTable deleteTask={deleteTask} refresh={refreshList}/>
              </div>
          )}
        </div>
       </TaskLibContext.Provider>  
    </div>
  ): (
    <div className="no-data-wrapper">
      <NoDataMessage message={noPermissionMessage}/> 
    </div>
  )} 
  </>) 
}
