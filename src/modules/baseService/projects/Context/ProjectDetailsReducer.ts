import { Action } from "../../../../models/context";
import { initialState } from "../../../root/context/authentication/reducer";
import { PROJECT_DETAILS, PROJECT_DETAILS_DIRTY, PROJECT_DETAILS_VIEW,
    PROJECT_INFO, PROJECT_MTERICS_DETAILS, PROJECT_TOKEN,
    RESET, PROJECT_PERMISSION,PROJECT_UPDATE_PERMISSION, DISABLE_UPDATE_PERMISSION } from "./ProjectDetailsActions";

export const projectDetailsInitialState = {
    projectDetails: [],
    projectInfo: null,
    projectMetricsDetails: null,
    projectDetailsDirty: false,
    projectDetailsView: null,
    projectToken: null,
    projectPermission:{},
    projectUpdatePermission:{},
    disableUpdatePermission: null
}

export const ProjectDetailsReducer = (state: any = projectDetailsInitialState, action: Action): any => {
    switch(action.type){
        case PROJECT_DETAILS:{
            return {
                ...state,
                projectDetails:action.payload
            }
        }
        case PROJECT_INFO:{
            return {
                ...state,
                projectInfo:action.payload
            }
        }
        case PROJECT_MTERICS_DETAILS:{
            return {
                ...state,
                projectMetricsDetails:action.payload
            }
        }
        case PROJECT_DETAILS_DIRTY:{
            return {
                ...state,
                projectDetailsDirty:action.payload
            }
        }
        case PROJECT_DETAILS_VIEW:{
            return {
                ...state,
                projectDetailsView:action.payload
            }
        }
        case PROJECT_TOKEN:{
            return {
                ...state,
                projectToken:action.payload
            }
        }
        case PROJECT_PERMISSION:{
            return {
                ...state,
                projectPermission: action.payload
            }
        }
        case RESET:{
            return{
                ...action.payload
            }
        }
        case PROJECT_UPDATE_PERMISSION:{
            return {
                ...state,
                projectUpdatePermission: action.payload
            }
        }
        case DISABLE_UPDATE_PERMISSION:{
            return {
                ...state,
                disableUpdatePermission: action.payload
            } 
        }
        default: return state
    }
}