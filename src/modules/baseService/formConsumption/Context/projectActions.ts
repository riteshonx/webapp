import { Action } from "../../../../models/context";
export const SHOWFILTER = 'SHOWFILTER';
export const FILTEROPTIONS = 'FILTEROPTIONS';
export const FILTERDATA = 'FILTERDATA';
export const CURRENT_FEATURE = 'CURRENT_FEATURE';
export const FEATURE_ROLES = 'FEATURE_ROLES';
export const FEATURE_PERMISSIONS = 'FEATURE_PERMISSIONS';
export const RESET = 'RESET';
export const ALLOWED_FEATURE_PERMISSIONS = 'ALLOWED_FEATURE_PERMISSIONS';
export const FORM_FEATURE_LIST= 'FORM_FEATURE_LIST';
export const REFRESH_FEATURES_LIST= 'REFRESH_FEATURES_LIST';
export const TENANT_COMPANIES= 'TENANT_COMPANIES';
export const PROJECT_USERS= 'PROJECT_USERS';
export const PROJECT_CUSTOM_LIST= 'PROJECT_CUSTOM_LIST';
export const PROJECT_LOCATION_TREE= 'PROJECT_LOCATION_TREE';
export const LOCATION_TREE_DATA_STRUCTURE= 'LOCATION_TREE_DATA_STRUCTURE';
export const FORM_CATEGORY_OPTION= 'FORM_CATEGORY_OPTION';
export const ACTIVE_FILTER_DATA= 'ACTIVE_FILTER_DATA';
export const ACTIVE_PAGE_NUMBER='ACTIVE_PAGE_NUMBER';
export const ACTIVE_LIMIT_PAGE='ACTIVE_LIMIT_PAGE';

export const setFilter = (payload: boolean): any => {
    return {
        type: SHOWFILTER,
        payload
    }
}

export const setFilterOptions = (payload: Array<any>): any => {
    return {
        type: FILTEROPTIONS,
        payload
    }
}

export const setFilterData=(payload: Array<any>): any => {
    return {
        type: FILTERDATA,
        payload
    }
}

export const setCurrentFeature = (payload: any): any => {
    return {
        type: CURRENT_FEATURE,
        payload
    }
}

export const setFeatureRoles = (payload: any): any => {
    return {
        type: FEATURE_ROLES,
        payload
    }
}

export const setFeaturePermissions = (payload: any): any => {
    return {
        type: FEATURE_PERMISSIONS,
        payload
    }
}


export const setReset = (): any => {
    return {
        type: RESET,
        payload: ''
    }
}

export const setAllowedFeaturePermissions=(payload: any): Action=>{
    return {
        type: ALLOWED_FEATURE_PERMISSIONS,
        payload
    }
}

export const setFormFeaturesList=(payload: Array<any>): Action=>{
    return{
        type: FORM_FEATURE_LIST,
        payload
    }
}

export const refreshFeaturesList=(payload: boolean): Action=>{
    return{
        type: REFRESH_FEATURES_LIST,
        payload
    }
}

export const setLocationTreeData=(payload: Array<any>): Action=>{
    return{
        type: PROJECT_LOCATION_TREE,
        payload
    }
}

export const setTenantCompanies=(payload: Array<any>): Action=>{
    return{
        type: TENANT_COMPANIES,
        payload
    }
}

export const setProjectCustomListValues=(payload: Array<any>): Action=>{
    return{
        type: PROJECT_CUSTOM_LIST,
        payload
    }
}

export const setProjectUsers=(payload: Array<any>): Action=>{
    return{
        type: PROJECT_USERS,
        payload
    }
}

export const setLocationTreeStructure=(payload: Array<any>): Action=>{
    return{
        type: LOCATION_TREE_DATA_STRUCTURE,
        payload
    }
}

export const setFormCategoryOption=(payload: Array<string>): Action=>{
    return{
        type: FORM_CATEGORY_OPTION,
        payload
    }
}

export const setActiveFilterData = (payload: Array<any>): Action => {
    return {
        type: ACTIVE_FILTER_DATA,
        payload
    }
}

export const setActivePageNumber = (payload:any): Action => {
    return {
        type: ACTIVE_PAGE_NUMBER,
        payload
    }  
}
export const setActivePageLimit=(payload:any):Action =>{
    return{
         type: ACTIVE_LIMIT_PAGE,
        payload
    }
}  