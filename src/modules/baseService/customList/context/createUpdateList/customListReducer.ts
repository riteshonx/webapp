
import { Action } from '../../../../../models/context';
import { ICustomListState } from '../../models/customList'; 
import { LISTOFCONFIGVALUES } from './customListActiions';

export const initailState: ICustomListState={
    listOfConfigValues: []
}

export const createUpdateCustomListReducer=(state: ICustomListState=initailState, action: Action): ICustomListState=>{
    switch(action.type){
        case LISTOFCONFIGVALUES:{
            return {
                ...state,
                listOfConfigValues: action.payload
            }    
        }
        default: return state;
    }
}