import { SET_ATTCHED_FILES, SET_ALL_UPLOADED_FILES } from "./type";


export default (state: any, action: any): any => {
    switch(action.type){
        case SET_ATTCHED_FILES: {
            return {
                ...state,
                attachedFile: action.payload
            }
        }
        case SET_ALL_UPLOADED_FILES: {
            return {
                ...state,
                allUploadedFiles: action.payload
            }
        }

        default: return state
    }
}