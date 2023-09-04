import { 
    IS_VISUALIZEJS,
    IS_VIEWER,
    DISPLAY_OBJECTEXPLORER,
    FILE,
    MODEL_LIST,
    IS_CUTTING_CHOOSE,
    IS_GEOMETRY_LOADED,
    HAS_VIEWPOINT_TOSAVE,
    OPEN_CLOUD,
    ACTIVE_DRAGGER_NAME,
    HIGHLIGHTED_ELEMENT_ID,
    GEOMETRY_PROGRESS,
    ACTIVE_MODEL,
    JOBRUNNER_VERSION,
    PROPERTIES,
    SETTINGS,
    CURRENT_PLUGIN,
    VIEWER_PLUGIN,
    SYSTEM_VIEW_LIST,
    SAVED_VIEW_LIST,
    GEOMETRY_LIST,
    ACTIVE_GEOMETRY_NAME,
    ACTIVE_VIEW,
    IS_ACTIVE_VIEW_SAVED,
    IS_ACTIVE_VIEW_SYSTEM_CUSTOM,
    UPDATE_FILTER,
    SKIP_UPDATE_FILTER,
    ACTIVE_FILTER,
    ACTIVE_FILTER_LIST,
    ACTIVE_FILTER_TASK,
    ACTIVE_FILTER_TASK_FILTERS,
    SPATIAL_QUERY_ACTIVE,
    QUERY_SELECTED_ELEMENTS,
    PREFETCH_PRIORITY_LIST,
    PREFETCH_NON_PRIORITY_LIST,
    IS_ACTIVE_VIEW_SCHEDULE,
    IS_ACTIVE_VIEW_TIMELINE,
    IS_ASSEMBLY,
    ASSEMBLY_MODEL_LIST
} from './action';


export const initialState = {
    visualizeJS: null,
    viewer: null,
    displayObjectExplorer: false,
    file: null,
    modelList: [],
    cuttingChoose: false,
    properties: false,
    settings: false,
    geometryLoaded: false,
    geometryProgress: null,
    markupMode: false,
    hasViewPointToSave: false,
    displayObjectModel: false,
    activeDraggerName: '',
    highLightedElementId: null,
    openCloud: null,
    activeModel: null,
    jobrunnerVersion: '23.4',
    viewerPlugin: null,
    currentPlugin: null,
    systemViewList: [],
    savedViewList: [],
    geometryInfo: [],
    activeGeometryName: '3D-Views',
    activeView: null,
    isActiveViewSaved: false,
    isActiveViewSystemCustom: false,
    activeFilter: null,
    activeFilterTask: null,
    activeFilterTaskFilters: [],
    activeFilterList: [],
    updateFilter: 0,
    skipUpdateFilter: false,
    spatialQueryActive: false,
    querySelectedElements: null,
    prefetchNonPriorityList: null,
    prefetchPriorityList: null,
    isActiveViewSchedule: false,
    isActiveViewTimeline: false,
    isAssembly: false,
    assemblyModelList: [],
}

export const bimReducer = (state: any, action: any) => {
    switch(action.type) {
        case IS_VISUALIZEJS : {
            return {
                ...state,
                visualizeJS: action.payload
            }
        }

        case IS_VIEWER : {
            return {
                ...state,
                viewer: action.payload
            }
        }

        case DISPLAY_OBJECTEXPLORER : {
            return {
                ...state,
                displayObjectExplorer: action.payload
            }
        }

        case FILE : {
            return {
                ...state,
                file: action.payload
            }
        }


        case MODEL_LIST : {
            return {
                ...state,
                modelList: action.payload
            }
        }

        case IS_CUTTING_CHOOSE : {
            return {
                ...state,
                cuttingChoose: action.payload
            }
        }

        case IS_GEOMETRY_LOADED : {
            return {
                ...state,
                geometryLoaded: action.payload
            }
        }

        case GEOMETRY_PROGRESS : {
            return {
                ...state,
                geometryProgress: action.payload
            }
        }
        
        case HAS_VIEWPOINT_TOSAVE : {
            return {
                ...state,
                hasViewPointToSave: action.payload
            }
        }

        case ACTIVE_DRAGGER_NAME : {
            return {
                ...state,
                activeDraggerName: action.payload
            }
        }

        case HIGHLIGHTED_ELEMENT_ID : {
            return {
                ...state,
                highLightedElementId: action.payload
            }
        }

        case OPEN_CLOUD : {
            return {
                ...state,
                openCloud: action.payload
            }
        }

        case ACTIVE_MODEL : {
            return {
                ...state,
                activeModel: action.payload
            }
        }

        case JOBRUNNER_VERSION : {
            return {
                ...state,
                jobrunnerVersion: action.payload
            }
        }

        case PROPERTIES : {
            return {
                ...state,
                properties: action.payload
            }
        }

        case OPEN_CLOUD : {
            return {
                ...state,
                settings: action.payload
            }
        }
        case CURRENT_PLUGIN : {
            return {
                ...state,
                currentPlugin: action.payload
            }
        }
        case VIEWER_PLUGIN : {
            return {
                ...state,
                viewerPlugin: action.payload
            }
        }

        case ACTIVE_VIEW : {
            return {
                ...state,
                activeView: action.payload
            }
        }

        case ACTIVE_GEOMETRY_NAME : {
            return {
                ...state,
                activeGeometryName: action.payload
            }
        }

        case SYSTEM_VIEW_LIST : {
            return {
                ...state,
                systemViewList: action.payload
            }
        }

        case SAVED_VIEW_LIST : {
            return {
                ...state,
                savedViewList: action.payload
            }
        }

        case GEOMETRY_LIST : {
            return {
                ...state,
                geometryInfo: action.payload
            }
        }

        case IS_ACTIVE_VIEW_SAVED : {
            return {
                ...state,
                isActiveViewSaved: action.payload
            }
        }

        case ACTIVE_FILTER : {
            return {
                ...state,
                activeFilter: action.payload
            }
        }

        case ACTIVE_FILTER_LIST : {
            return {
                ...state,
                activeFilterList: action.payload
            }
        }

        case ACTIVE_FILTER_TASK : {
            return {
                ...state,
                activeFilterTask: action.payload
            }
        }

        case ACTIVE_FILTER_TASK_FILTERS : {
            return {
                ...state,
                activeFilterTaskFilters: action.payload
            }
        }

        case UPDATE_FILTER : {
            return {
                ...state,
                updateFilter: action.payload
            }
        }

        case SKIP_UPDATE_FILTER : {
            return {
                ...state,
                skipUpdateFilter: action.payload
            }
        }

        case SPATIAL_QUERY_ACTIVE: {
            return {
                ...state,
                spatialQueryActive: action.payload
            }
        }

        case QUERY_SELECTED_ELEMENTS: {
            return {
                ...state,
                querySelectedElements: action.payload
            }
        }

        case PREFETCH_NON_PRIORITY_LIST: {
            return {
                ...state,
                prefetchNonPriorityList: action.payload
            }
        }

        case PREFETCH_PRIORITY_LIST: {
            return {
                ...state,
                prefetchPriorityList: action.payload
            }
        }
        
        case IS_ACTIVE_VIEW_SCHEDULE : {
            return {
                ...state,
                isActiveViewSchedule: action.payload
            }
        }

        case IS_ACTIVE_VIEW_TIMELINE : {
            return {
                ...state,
                isActiveViewTimeline: action.payload
            }
        }

        case IS_ACTIVE_VIEW_SYSTEM_CUSTOM : {
            return {
                ...state,
                isActiveViewSystemCustom: action.payload
            }
        }

        case IS_ASSEMBLY : {
            return {
                ...state,
                isAssembly: action.payload
            }
        }

        case ASSEMBLY_MODEL_LIST : {
            return {
                ...state,
                assemblyModelList: action.payload
            }
        }
        
        default: 
            return state;
    }
}

//export default bimReducer;