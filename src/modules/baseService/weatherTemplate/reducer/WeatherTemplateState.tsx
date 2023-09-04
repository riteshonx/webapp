import { useContext, useReducer } from 'react';
import axios from 'axios';
import { client } from 'src/services/graphql';
import Notification, {
	AlertTypes,
} from '../../../shared/components/Toaster/Toaster';
import {
	GET_WEATHER_CONSTRAINT_TEMPLATE,
	UPDATE_WEATHER_CONSTRAINT_TEMPLATE,
} from '../graphql/query';
import WeatherTemplateContext from '../context/weatherTemplateContext';
import weatherTemplateReducer from './weatherTemplateReducer';
import { GET_WEATHER_TEMPLATE } from './types';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import { setIsLoading } from 'src/modules/root/context/authentication/action';
import { getExchangeToken } from 'src/services/authservice';

const WeatherTemplateState = (props: any) => {
	const initialState = {
		weatherTemplateList: [],
	};


	const [state, dispatch] = useReducer(weatherTemplateReducer, initialState);
	const authContext = useContext(stateContext);

	// const getWeatherTemplateList = async () => {
	// 	try {
	// 		authContext.dispatch(setIsLoading(true));
	// 		const res = await client.query({
	// 			query: GET_WEATHER_CONSTRAINT_TEMPLATE,
	// 			fetchPolicy: 'network-only',
	// 			variables: {},
	// 			context: { role: 'updateCustomList', },
	// 		});
	// 		authContext.dispatch(setIsLoading(false));
	// 		dispatch({
	// 			type: GET_WEATHER_TEMPLATE,
	// 			payload: res.data.weatherConstraintTemplate,
	// 		});
	// 		return res.data.weatherConstraintTemplate
	// 	} catch (err) {
	// 		console.log('error while fetching weather template', err);
	// 		authContext.dispatch(setIsLoading(false));
	// 	}
	// };
const getWeatherTemplateList = async(name:any,sortBy:any,sortOrder:any)=>{
	try{
    authContext.dispatch(setIsLoading(true));
		const token = getExchangeToken();
    const apiUrl = `${process.env["REACT_APP_AUTHENTICATION_URL"]}V1/getWeatherConstraintTemplates`;
		const requestBody = {
			name:name ? `%${name}%` : `%${''}%`,
			sortBy: sortBy? sortBy : "name",
			sortOrder: sortOrder? sortOrder : "asc",
			limit:50,
			offset:0
		}
		const response = await axios.post(
      apiUrl,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
		dispatch({
				type: GET_WEATHER_TEMPLATE,
				payload: response.data.success.data,
			});
		authContext.dispatch(setIsLoading(false));
	}
	catch(err){
		console.log('error while fetching weather template', err);
		authContext.dispatch(setIsLoading(false));
	}
}
const updateWeatherTemplate = async (editedWeatherTemplate: any) => {
  try {
    authContext.dispatch(setIsLoading(true));
    const token = getExchangeToken();
    const apiUrl = `${process.env["REACT_APP_AUTHENTICATION_URL"]}V1/weatherConstraintTemplate`;
		const requestBody = {
      weatherConstraintTemplates: editedWeatherTemplate
    };
    const response = await axios.post(
      apiUrl,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    authContext.dispatch(setIsLoading(false));
		 Notification.sendNotification(
        "Successfully updated Weather Template",
        AlertTypes.success
      );
  } catch (err) {
    authContext.dispatch(setIsLoading(false));
		 Notification.sendNotification(
        "Error in updating",
        AlertTypes.error
      );
    console.log('Error while updating weather template', err);
  }
};


	return (
		<WeatherTemplateContext.Provider
			value={{
				weatherTemplateList: state.weatherTemplateList,
				getWeatherTemplateList,
				updateWeatherTemplate,
			}}
		>
			{props.children}
		</WeatherTemplateContext.Provider>
	);
};

export default WeatherTemplateState;
