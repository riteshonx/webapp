import { Action } from "../../../../models/context";

export const WORKFLOW_STEPS= "WF_STEPS";
export const WORKFLOW_OUTCOMES= "WF_OUTCOMES";
export const WORKFLOW_ASSIGNEES= "WORKFLOW_ASSIGNEES";
export const WORKFLOW_VIEW_TYPE= "WORKFLOW_VIEW_TYPE";
export const WORKFLOW_ROOT_ID= "WORKFLOW_ROOT_ID";
export const WORKFLOW_FEATURE_TYPE="WORKFLOW_FEATURE_TYPE";
export const WORKFLOW_ALLOWED_ROLES= "WORKFLOW_ALLOWED_ROLES";
export const WORKFLOW_STATE_TOKEN= "WORKFLOW_STATE_TOKEN";
export const WORKFLOW_TEMPLATE_MAX_ID = "WORKFLOW_TEMPLATE_MAX_ID";


export const setWorkflowTemplateMaxId= (payload: string|number|null): Action=>{
    return {
        type: WORKFLOW_TEMPLATE_MAX_ID,
        payload
    }
}

export const setWorkflowSteps= (payload: Array<any>): Action=>{
    return {
        type: WORKFLOW_STEPS,
        payload
    }
}


export const setWorkflowOutComes= (payload: Array<any>): Action=>{
    return {
        type: WORKFLOW_OUTCOMES,
        payload
    }
}

export const setWorkFlowStepAssignees=(payload: Array<any>)=>{
    return {
        type: WORKFLOW_ASSIGNEES,
        payload
    }
}

export const setWorkFlowViewType=(payload: string)=>{
    return{
        type: WORKFLOW_VIEW_TYPE,
        payload
    }
}

export const setWorkFlowRootId=(payload: number)=>{
    return{
        type: WORKFLOW_ROOT_ID,
        payload
    }
}

export const setWorkFlowFeatureType=(payload: number)=>{
    return{
        type: WORKFLOW_FEATURE_TYPE,
        payload
    }
}

export const setAllowedWorkflowRoles=(payload: any)=>{
    return{
        type: WORKFLOW_ALLOWED_ROLES,
        payload
    }
}