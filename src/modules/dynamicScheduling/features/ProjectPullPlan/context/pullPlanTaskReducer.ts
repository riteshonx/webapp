import { Action } from "../../../../../models/context";
import { MYPTASK, ALLPTASK } from "./pullPlanTaskAction";

interface IPullPlanTask{
    allTaskList: Array<any>;
    myTaskList: Array<any>;
}

export const initailState: IPullPlanTask={
    allTaskList: [],
    myTaskList: []
}

export const pullPlanTaskRedcer=(state: IPullPlanTask=initailState, action: Action): IPullPlanTask=>{
    switch(action.type){
        case MYPTASK:{
            return {
                ...state,
                myTaskList: action.payload
            }    
        }
        case ALLPTASK:{
            return {
                ...state,
                allTaskList: action.payload
            }    
        }
        default: return state;
    }
}