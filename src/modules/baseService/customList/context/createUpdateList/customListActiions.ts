import { Action } from "../../../../../models/context";
import { ConfigListItem } from "../../models/customList";

export const LISTOFCONFIGVALUES= 'LISTOFCONFIGVALUES';

export const setListOfConfigValues= (payload: Array<ConfigListItem>): Action=>{
    return {
        type: LISTOFCONFIGVALUES,
        payload
    }
}