import { Action } from "../../../../models/context";
import { WORKFLOW_OUTCOMES, WORKFLOW_STEPS, WORKFLOW_ASSIGNEES,
    WORKFLOW_VIEW_TYPE,
    WORKFLOW_ROOT_ID,WORKFLOW_ALLOWED_ROLES,
    WORKFLOW_FEATURE_TYPE,WORKFLOW_TEMPLATE_MAX_ID} from "./workflowAction";

interface IWorklowInitalState{
    steps: Array<any>,
    outcomes: Array<any>,
    stepAssignees: Array<any>,
    viewType: string,
    workFlowRootId: number,
    featureType: number,
    allowedRoles: Array<any>,
    workflowTemplateMaxId: string|number|null
}

export const workFlowInitial: IWorklowInitalState={
    steps: [],
    outcomes: [],
    stepAssignees:[],
    viewType:'PROJECT',
    workFlowRootId: -1,
    featureType: -1,
    allowedRoles: [],
    workflowTemplateMaxId:null
}

export const workflowReducer=(state: IWorklowInitalState=workFlowInitial, action: Action): IWorklowInitalState=>{
    switch(action.type){
        case WORKFLOW_OUTCOMES:{
            return {
                ...state,
                outcomes: action.payload
            }
        }
        case WORKFLOW_STEPS:{
            return {
                ...state,
                steps: action.payload
            }
        }
        case WORKFLOW_ASSIGNEES:{
            return {
                ...state,
                stepAssignees: action.payload
            }
        }
        case WORKFLOW_VIEW_TYPE:{
            return {
                ...state,
                viewType: action.payload
            }
        }
        case WORKFLOW_ROOT_ID:{
            return {
                ...state,
                workFlowRootId: action.payload
            }
        }
        case WORKFLOW_FEATURE_TYPE:{
            return{
                ...state,
                featureType: action.payload
            }
        }
        case WORKFLOW_ALLOWED_ROLES:{
            return{
                ...state,
                allowedRoles: action.payload
            }
        }
        case WORKFLOW_TEMPLATE_MAX_ID:{
            return{
                ...state,
                workflowTemplateMaxId:action.payload
            }
        }
        default:return state;
    }
}