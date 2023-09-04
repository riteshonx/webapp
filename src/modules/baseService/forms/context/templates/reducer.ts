import {STANDARDFORMS, OPENFORMS, CURRENTFEATURE, TEMPLATES, CURRENT_FEATURE_ID} from './action';
import {Action} from '../../../../../models/context';
import { Template } from '../../models/template';

export const templatesInitialState: Template={
    standardForms: [],
    openForms: [],
    templates: [],
    currentFeature: null,
    currentFeatureId: null
}

export const templateReducer=(state: Template=templatesInitialState, action: Action): Template=>{
    switch(action.type){
        case STANDARDFORMS:{
            return {
                ...state,
                standardForms:action.payload
            }
        }
        case OPENFORMS:{
            return {
                ...state,
                openForms:action.payload
            }
        }
        case CURRENTFEATURE:{
            return {
                ...state,
                currentFeature:action.payload
            }
        }
        case TEMPLATES:{
            return {
                ...state,
                templates:action.payload
            }
        }
        case CURRENT_FEATURE_ID:{
            return{
                ...state,
                currentFeatureId: action.payload
            }
        }
        default: return state
    }
}