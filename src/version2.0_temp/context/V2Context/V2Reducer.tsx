import { TOGGLE_INSIGHT_ICON,IS_LOADING } from './V2Action';
import {Action} from '../../models';

export const V2InitialState = {
	togggleFeeds: false,
	isLoading:false,
};

export type V2ReducerState = typeof V2InitialState;

export const V2Reducer = (
	state: V2ReducerState = V2InitialState,
	action: Action
): any => {
	switch (action.type) {
		case TOGGLE_INSIGHT_ICON: {
			return {
				...state,
				togggleFeeds: action.payload,
			};
		}
		case IS_LOADING:{
			return{
				...state,
				isLoading:action.payload
			}
		}
		default:
			return state;
	}
};
