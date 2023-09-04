import moment from 'moment';
import { transformDate } from './ganttDataTransformer';
 
  interface responseTasks {
    id: string;
    parentId: any;
    taskName: string;
    createdBy: string;
    updatedBy: string;
    serialNumber: number;
    isCritical: boolean;
    level: number;
    endDate: string;
    startDate: string;
    duration: number;
    type: string;
    recipeId: number;
   // floatValue: any;
  }
  
  interface ganttTasks {
    id: string;
    type: string;
    text: string;
  //  description: string;
    start_date: string;
    duration: number;
    parent: string;
    end_date: string;
    createdBy: string;
    updatedBy: string;
    serialNumber: number;
  //  floatValue: number;
    isCritical: boolean;
    level: number;
    open?: boolean;
    $index?: number;
 //   status: string;
  }

  interface ganttLinks {
    id: string;
    source: string;
    target: string;
    type: string;
    lag: number;
    createdBy: string;
    color: string;
    recipeSetId: any;
  }
  
  interface reponseLinks {
    id: string;
    lag: number;
    source: string;
    target: string;
    type: string;
    createdBy: string;
    recipeSetId: number;
  }
  
  interface ganttObject {
    data: ganttTasks[];
    links: ganttLinks[];
  }
  
  interface responseObject {
    data: {
      recipetasks: responseTasks[];
      recipelinks: reponseLinks[];
    };
  }
  
  interface saveRecipePlanPayload {
    tasks: responseTasks[];
    deleteTasksIds: string[];
    links: reponseLinks[];
  }

  export const responseToGantt = (data: responseObject) : ganttObject => {
    const returnValue: ganttObject = { data: [], links: [] };
    for (let i = 0; i < data.data.recipetasks.length; i++) {
      const end_date = moment.utc(data.data.recipetasks[i].endDate);
  
    //  if (data.data.recipetasks[i].type !== 'milestone') {
      //  end_date.add(1, 'd');
    //  }
      returnValue.data.push({
        id: data.data.recipetasks[i].id,
        text: data.data.recipetasks[i].taskName,
        type: data.data.recipetasks[i].type.toLowerCase(),
      //  description: data.data.tasks[i]?.description,
        parent: data.data.recipetasks[i].parentId || null,
        start_date: data.data.recipetasks[i].startDate,
        end_date: end_date.format('YYYY/MM/DD'),
        duration: data.data.recipetasks[i].duration,
        createdBy: data.data.recipetasks[i].createdBy,
        updatedBy: data.data.recipetasks[i].updatedBy,
        serialNumber: data.data.recipetasks[i].serialNumber,
      //  floatValue: data.data.tasks[i].floatValue,
        isCritical: data.data.recipetasks[i].isCritical,
        level: data.data.recipetasks[i].level,
     //   status: data.data.tasks[i].status,
        open: true
      });
    }
  
    for (let i = 0; i < data.data.recipelinks.length; i++) {
      returnValue.links.push({
        id: data.data.recipelinks[i].id,
        source: data.data.recipelinks[i].source,
        target: data.data.recipelinks[i].target,
        type: data.data.recipelinks[i].type,
        lag: data.data.recipelinks[i].lag,
        createdBy: data.data.recipelinks[i].createdBy,
        color: 'black',
        recipeSetId: data.data.recipelinks[i].recipeSetId,
      });
    }
    return returnValue;
  };
  
  export const ganttToPayload = (tasks: ganttTasks[], links: ganttLinks[]): saveRecipePlanPayload => {
    const returnPayload: saveRecipePlanPayload = {
      tasks: [],
      links: [],
      deleteTasksIds: [],
    };
    for (let i = 0; i < tasks.length; i++) {
      const tempTask = tasks[i];
      const date = new Date(tempTask.end_date);
      // if (tempTask.type !== 'milestone') {
         date.setDate(new Date(tempTask.end_date).getDate() - 1);
      // }
      returnPayload.tasks.push({
        id: tempTask.id,
        taskName: tempTask.text,
       // parentId:  null,
        parentId: tempTask.parent.length > 0 ?  tempTask.parent : null,
        endDate: transformDate(tempTask.end_date), //"2021-06-06",
        startDate: transformDate(tempTask.start_date), //"2021-06-06",
        duration: tempTask.duration,
        type: tempTask.type.toLowerCase(),
        recipeId: 2, 
        createdBy: tempTask.createdBy,
        updatedBy: tempTask.createdBy,
        serialNumber: tempTask.$index || 0,
        isCritical: false,
        level: tempTask.parent.length > 0 ? 1 : 0
      //  floatValue: tempTask.floatValue ?  tempTask.floatValue : 0
      });
    }
  
    for (let i = 0; i < links.length; i++) {
      const tempLinks = links[i];
      returnPayload.links.push({
        id: tempLinks.id,
        source: tempLinks.source,
        target: tempLinks.target,
        type: tempLinks.type,
        lag: 0,
        createdBy: tempLinks.createdBy,
        recipeSetId: tempLinks.recipeSetId
      });
    }
  
    return returnPayload;
  };