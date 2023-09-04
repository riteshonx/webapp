export const IS_VISUALIZEJS="IS_VISUALIZEJS";
export const IS_VIEWER="IS_VIEWER";
export const DISPLAY_OBJECTEXPLORER= "DISPLAY_OBJECTEXPLORER";
export const FILE= "FILE";
export const MODEL_LIST= "MODEL_LIST";
export const IS_CUTTING_CHOOSE= "IS_CUTTING_CHOOSE";
export const IS_GEOMETRY_LOADED= "IS_GEOMETRY_LOADED";
export const GEOMETRY_PROGRESS= "GEOMETRY_PROGRESS";
export const HAS_VIEWPOINT_TOSAVE= "HAS_VIEWPOINT_TOSAVE";
export const ACTIVE_DRAGGER_NAME= "ACTIVE_DRAGGER_NAME";
export const HIGHLIGHTED_ELEMENT_ID= "HIGHLIGHTED_ELEMENT_ID";

export const OPEN_CLOUD = "OPEN_CLOUD";
export const ACTIVE_MODEL = "ACTIVE_MODEL";
export const PROPERTIES = "ACTIVE_MODEL";
export const SETTINGS = "ACTIVE_MODEL";
export const CURRENT_PLUGIN = "CURRENT_PLUGIN";
export const VIEWER_PLUGIN = "VIEWER_PLUGIN";
export const JOBRUNNER_VERSION= "JOBRUNNER_VERSION";


export const SAVED_VIEW_LIST = "SAVED_VIEW_LIST";
export const SYSTEM_VIEW_LIST = "SYSTEM_VIEW_LIST";
export const GEOMETRY_LIST = "GEOMETRY_LIST";
export const ACTIVE_VIEW = "ACTIVE_VIEW";
export const ACTIVE_GEOMETRY_NAME = "ACTIVE_GEOMETRY_NAME";
export const IS_ACTIVE_VIEW_SAVED = "IS_ACTIVE_VIEW_SAVED";
export const IS_ACTIVE_VIEW_SYSTEM_CUSTOM = "IS_ACTIVE_VIEW_SYSTEM_CUSTOM";
export const IS_ACTIVE_VIEW_SCHEDULE = "IS_ACTIVE_VIEW_SCHEDULE";
export const IS_ACTIVE_VIEW_TIMELINE = "IS_ACTIVE_VIEW_TIMELINE";


export const ACTIVE_FILTER = "ACTIVE_FILTER";
export const ACTIVE_FILTER_LIST = "ACTIVE_FILTER_LIST";
export const UPDATE_FILTER = "UPDATE_FILTER";
export const SKIP_UPDATE_FILTER = "SKIP_UPDATE_FILTER";
export const ACTIVE_FILTER_TASK = "ACTIVE_FILTER_TASK";
export const ACTIVE_FILTER_TASK_FILTERS = "ACTIVE_FILTER_TASK_FILTERS";
export const SPATIAL_QUERY_ACTIVE = "SPATIAL_QUERY_ACTIVE";
export const QUERY_SELECTED_ELEMENTS = "QUERY_SELECTED_ELEMENTS";

export const PREFETCH_PRIORITY_LIST = "PREFETCH_PRIORITY_LIST";
export const PREFETCH_NON_PRIORITY_LIST = "PREFETCH_NON_PRIORITY_LIST";

export const IS_ASSEMBLY = "IS_ASSEMBLY";
export const ASSEMBLY_MODEL_LIST = "ASSEMBLY_MODEL_LIST";

export const setVisualizeJS=(payload: any)=>{
        return {
            type: IS_VISUALIZEJS,
            payload
        }
}

export const setViewer=(payload: any)=>{
    return {
        type: IS_VIEWER,
        payload
    }
}

export const setIsDisplayObjectExplorer=(payload: any)=>{
    return {
        type: DISPLAY_OBJECTEXPLORER,
        payload
    }
}

export const setFile=(payload: any)=>{
    return {
        type: FILE,
        payload
    }
}

export const setModelList=(payload: any)=>{
    return {
        type: MODEL_LIST,
        payload
    }
}

export const setIsCuttingChoose=(payload: any)=>{
    return {
        type: IS_CUTTING_CHOOSE,
        payload
    }
}

export const setIsGeometryLoaded =(payload: any)=>{
    return {
        type: IS_GEOMETRY_LOADED,
        payload
    }
}

export const setIsGeometryProgress =(payload: any)=>{
    return {
        type: GEOMETRY_PROGRESS,
        payload
    }
}


export const setHasViewPointToSave =(payload: any)=>{
    return {
        type: HAS_VIEWPOINT_TOSAVE,
        payload
    }
}

export const setActiveDraggerName = (payload: any)=>{
    return {
        type: ACTIVE_DRAGGER_NAME,
        payload
    }
}

export const setHighLightedElementId = (payload: any)=>{
    return {
        type: HIGHLIGHTED_ELEMENT_ID,
        payload
    }
}

export const setOpenCloud =(payload: any)=>{
    return {
        type: OPEN_CLOUD,
        payload
    }
}

export const setActiveModel =(payload: any)=>{
    return {
        type: ACTIVE_MODEL,
        payload
    }
}

export const setJobrunnerVersion =(payload: any)=>{
    return {
        type: JOBRUNNER_VERSION,
        payload
    }
}

export const setProperties =(payload: any)=>{
    return {
        type: PROPERTIES,
        payload
    }
}

export const setSettings =(payload: any)=>{
    return {
        type: SETTINGS,
        payload
    }
}

export const setCurrentPlugin =(payload: any)=>{
    return {
        type: CURRENT_PLUGIN,
        payload
    }
}

export const setViewerPlugin =(payload: any)=>{
    return {
        type: VIEWER_PLUGIN,
        payload
    }
}

export const setActiveView =(payload: any)=>{
    return {
        type: ACTIVE_VIEW,
        payload
    }
}

export const setSavedViewList =(payload: any)=>{
    return {
        type: SAVED_VIEW_LIST,
        payload
    }
}

export const setSystemViewList =(payload: any)=>{
    return {
        type: SYSTEM_VIEW_LIST,
        payload
    }
}

export const setGeometryInfo =(payload: any)=>{
    return {
        type: GEOMETRY_LIST,
        payload
    }
}

export const setActiveGeometryName =(payload: any)=>{
    return {
        type: ACTIVE_GEOMETRY_NAME,
        payload
    }
}

export const setIsActiveViewSaved = (payload: any)=>{
    return {
        type: IS_ACTIVE_VIEW_SAVED,
        payload
    }
}

export const setIsActiveViewSystemCustom = (payload: any)=>{
    return {
        type: IS_ACTIVE_VIEW_SYSTEM_CUSTOM,
        payload
    }
}

export const setActiveFilter =(payload: any)=>{
    return {
        type: ACTIVE_FILTER,
        payload
    }
}

export const setActiveFilterList =(payload: any)=>{
    return {
        type: ACTIVE_FILTER_LIST,
        payload
    }
}

export const setUpdateFilter = (payload: any)=>{
    return {
        type: UPDATE_FILTER,
        payload
    }
}

export const setSkipUpdateFilter = (payload: any)=>{
    return {
        type: SKIP_UPDATE_FILTER,
        payload
    }
}

export const setSpatialQueryStatus = (status: boolean) => {
    return {
        type: SPATIAL_QUERY_ACTIVE,
        payload: status
    }
}

export const setQuerySelectedElements = (payload: any) => {
    return {
        type: QUERY_SELECTED_ELEMENTS,
        payload: payload
    }
}

export const setPrefetchPriorityList = (payload: any)=>{
    return {
        type: PREFETCH_PRIORITY_LIST,
        payload
    }
}

export const setPrefetchNonPriorityList = (payload: any)=>{
    return {
        type: PREFETCH_NON_PRIORITY_LIST,
    }
}
        
export const setIsActiveViewSchedule = (payload: any)=>{
    return {
        type: IS_ACTIVE_VIEW_SCHEDULE,
        payload
    }
}

export const setIsActiveViewTimeLine = (payload: any)=>{
    return {
        type: IS_ACTIVE_VIEW_TIMELINE,
        payload
    }
}

export const setActiveFilterTask =(payload: any)=>{
    return {
        type: ACTIVE_FILTER_TASK,
        payload
    }
}

export const setActiveFilterTaskFilters =(payload: any)=>{
    return {
        type: ACTIVE_FILTER_TASK_FILTERS,
        payload
    }
}

export const setIsAssembly =(payload: any)=>{
    return {
        type: IS_ASSEMBLY,
        payload
    }
}

export const setAssemblyModelList =(payload: any)=>{
    return {
        type: ASSEMBLY_MODEL_LIST,
        payload
    }
}
