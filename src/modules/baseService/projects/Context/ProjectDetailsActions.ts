import { Action } from "../../../../models/context";

export const PROJECT_DETAILS = 'PROJECT_DETAILS';
export const PROJECT_INFO = 'PROJECT_INFO';
export const PROJECT_MTERICS_DETAILS = 'PROJECT_MTERICS_DETAILS';
export const PROJECT_DETAILS_DIRTY = 'PROJECT_DETAILS_DIRTY';
export const PROJECT_DETAILS_VIEW = 'PROJECT_DETAILS_VIEW';
export const PROJECT_TOKEN = 'PROJECT_TOKEN';
export const PROJECT_PERMISSION= 'PROJECT_PERMISSION';
export const RESET= 'RESET';
export const PROJECT_UPDATE_PERMISSION = 'PROJECT_UPDATE_PERMISSION';
export const DISABLE_UPDATE_PERMISSION = 'DISABLE_UPDATE_PERMISSION';

export const setProjectDetails = (payload: Array<any>): any => {
    return {
        type: PROJECT_DETAILS,
        payload
    }
}

export const setProjectInfo = (payload: any): any => {
    return {
        type: PROJECT_INFO,
        payload
    }
}

export const setProjectMetricsDetails = (payload: any): any => {
    return {
        type: PROJECT_MTERICS_DETAILS,
        payload
    }
}

export const setProjecDetailsDirty = (payload: any): any => {
    return {
        type: PROJECT_DETAILS_DIRTY,
        payload
    }
}

export const setProjecDetailsView = (payload: any): any => {
    return {
        type: PROJECT_DETAILS_VIEW,
        payload
    }
}

export const setProjectSettingToken=(payload: any): Action=>{
    return {
        type: PROJECT_TOKEN,
        payload
    }
}

export const setProjectPermission=(payload: any): Action=>{
    return {
        type: PROJECT_PERMISSION,
        payload
    }
}

export const resetProjectDetails=(payload: any): Action=>{
    return {
        type: RESET,
        payload
    }
}

export const setProjectUpdatePermission=(payload: any): Action=>{
    return {
        type: PROJECT_UPDATE_PERMISSION,
        payload
    }
}

export const setDisableUpdatePermission=(payload: boolean): Action=>{
    return {
        type: DISABLE_UPDATE_PERMISSION,
        payload
    }
}