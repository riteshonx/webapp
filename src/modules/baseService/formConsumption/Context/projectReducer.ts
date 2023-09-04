import { Action } from "../../../../models/context";
import { ACTIVE_LIMIT_PAGE, ACTIVE_PAGE_NUMBER, FILTERDATA, FILTEROPTIONS, SHOWFILTER } from "./projectActions";
import { CURRENT_FEATURE, FEATURE_ROLES, FEATURE_PERMISSIONS, RESET,
    REFRESH_FEATURES_LIST, ALLOWED_FEATURE_PERMISSIONS, FORM_FEATURE_LIST,
    TENANT_COMPANIES, PROJECT_USERS, PROJECT_CUSTOM_LIST, PROJECT_LOCATION_TREE,
    LOCATION_TREE_DATA_STRUCTURE, FORM_CATEGORY_OPTION, ACTIVE_FILTER_DATA } from "./projectActions";

export const projectInitialState = {
    showFilter: false,
    filterOptions: [],
    filterData: [],
    currentFeature: null,
    featureRoles: null,
    featurePermissions: null,
    allowedFeaturePermissions: null,
    formFeaturesList: [],
    refreshList: true,
    customListValues: {},
    projectUsers: [],
    locationTree: [],
    tenantCompanies: [],
    locationTreeStructure:[],
    formCategoryOption: [],
    activeFilterData: [],
    activePageNumber:1,
    activePageLimit:10,
}

export const projectReducer=(state: any = projectInitialState, action: Action): any=>{
    switch (action.type) {
			case SHOWFILTER: {
				return { ...state, showFilter: action.payload };
			}
			case FILTEROPTIONS: {
				return {
					...state,
					filterOptions: action.payload,
				};
			}
			case FILTERDATA: {
				return {
					...state,
					filterData: action.payload,
				};
			}
			case CURRENT_FEATURE: {
				return {
					...state,
					currentFeature: action.payload,
				};
			}
			case FEATURE_ROLES: {
				return {
					...state,
					featureRoles: action.payload,
				};
			}
			case FEATURE_PERMISSIONS: {
				return {
					...state,
					featurePermissions: action.payload,
				};
			}
			case RESET: {
				return {
					...projectInitialState,
				};
			}
			case ALLOWED_FEATURE_PERMISSIONS: {
				return {
					...state,
					allowedFeaturePermissions: action.payload,
				};
			}
			case FORM_FEATURE_LIST: {
				return {
					...state,
					formFeaturesList: action.payload,
				};
			}
			case REFRESH_FEATURES_LIST: {
				return {
					...state,
					refreshList: action.payload,
				};
			}
			case PROJECT_LOCATION_TREE: {
				return {
					...state,
					locationTree: action.payload,
				};
			}
			case TENANT_COMPANIES: {
				return {
					...state,
					tenantCompanies: action.payload,
				};
			}
			case PROJECT_CUSTOM_LIST: {
				return {
					...state,
					customListValues: action.payload,
				};
			}
			case PROJECT_USERS: {
				return {
					...state,
					projectUsers: action.payload,
				};
			}
			case LOCATION_TREE_DATA_STRUCTURE: {
				return {
					...state,
					locationTreeStructure: action.payload,
				};
			}
			case FORM_CATEGORY_OPTION: {
				return {
					...state,
					formCategoryOption: action.payload,
				};
			}
			case ACTIVE_FILTER_DATA: {
				return {
					...state,
					activeFilterData: action.payload,
				};
			}
			case ACTIVE_PAGE_NUMBER: {
				return {
					...state,
					activePageNumber: action.payload,
				};
			}
			case ACTIVE_LIMIT_PAGE: {
				return {
					...state,
					activePageLimit: action.payload,
				};
			}
			default:
				return state;
		}
}