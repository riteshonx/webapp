export const TOGGLE_INSIGHT_ICON = 'TOGGLE_INSIGHT_ICON';
export const IS_LOADING = 'IS_LOADING';



export const setIsLoading = (payload:boolean)=>{
    return{
        type:IS_LOADING,
        payload:payload
    }
}

export const setToggleInsight = (payload:boolean)=>{
    return{
        type:TOGGLE_INSIGHT_ICON,
        payload:payload
    }
}

export{}