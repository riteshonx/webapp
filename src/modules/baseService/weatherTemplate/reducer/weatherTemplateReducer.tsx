import { GET_WEATHER_TEMPLATE } from './types';

export default (state: any, action: any) => {
	console.log('action', action);
	switch (action.type) {
		case GET_WEATHER_TEMPLATE: {
			return { ...state, weatherTemplateList: action.payload };
		}
		default: {
			return state;
		}
	}
};
