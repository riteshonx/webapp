import {Action} from '../../../../../models/context';
import { Forms, ITemplate } from '../../models/template';
export const STANDARDFORMS="STANDARDFORMS";
export const OPENFORMS="OPENFORMS";
export const CURRENTFEATURE="CURRENTFEATURE";
export const TEMPLATES= "TEMPLATES";
export const CURRENT_FEATURE_ID= "CURRENT_FEATURE_ID";

export const setStandardFroms=(payload: Array<Forms>): Action=>{
        return {
            type:STANDARDFORMS,
            payload
        }
}

export const setOpenFroms=(payload: Array<Forms>): Action=>{
    return {
        type:OPENFORMS,
        payload
    }
}

export const setCurrentFeature=(payload: Forms): Action=>{
    return {
        type:CURRENTFEATURE,
        payload
    }
}

export const setTemplates=(payload: Array<ITemplate>): Action=>{
    return {
        type:TEMPLATES,
        payload
    }
}

export const setCurrentFeatureId=(payload: any): Action=>{
    return {
        type:CURRENT_FEATURE_ID,
        payload
    }
}