import { Action } from "../../../../models/context";
import { COMPANY_DETAILS, COMPANY_DETAILS_DIRTY, 
    COMPANY_DETAILS_VALIDATION, COMPANY_DETAILS_VIEW, COMPANY_ID_VALIDATION, COMPANY_INFO, COMPANY_MTERICS_DETAILS } from "./CompanyDetailsAction";

export const CompanyDetailsInitialState = {
    companyDetails: [],
    companyInfo: null,
    companyMetricsDetails: null,
    companyDetailsDirty: false,
    companyDetailsView: null,
    companyValidation: false,
    companyIDValidation: false
}

export const CompanyDetailsReducer = (state: any = CompanyDetailsInitialState, action: Action): any => {
    switch(action.type){
        case COMPANY_DETAILS:{
            return {
                ...state,
                companyDetails:action.payload
            }
        }
        case COMPANY_INFO:{
            return {
                ...state,
                companyInfo:action.payload
            }
        }
        case COMPANY_MTERICS_DETAILS:{
            return {
                ...state,
                companyMetricsDetails:action.payload
            }
        }
        case COMPANY_DETAILS_DIRTY:{
            return {
                ...state,
                companyDetailsDirty:action.payload
            }
        }
        case COMPANY_DETAILS_VIEW:{
            return {
                ...state,
                companyDetailsView:action.payload
            }
        }
        case COMPANY_DETAILS_VALIDATION:{
            return {
                ...state,
                companyValidation:action.payload
            }
        }
        case COMPANY_ID_VALIDATION:{
            return {
                ...state,
                companyIDValidation:action.payload
            }
        }
        default: return state
    }
}