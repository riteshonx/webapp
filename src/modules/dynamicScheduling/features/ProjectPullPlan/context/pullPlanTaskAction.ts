import { Action } from "../../../../../models/context";

export const MYPTASK = 'MYPTASK';
export const ALLPTASK = 'ALLPTASK';

export const setMyTask = (payload: Array<any>): Action => {
    return {
        type: MYPTASK,
        payload
    }
}

export const setAllTask = (payload: Array<any>): Action => {
    return {
        type: ALLPTASK,
        payload
    }
}