
import axios from 'axios';
import NotificationMessage, {
	AlertTypes,
} from 'src/modules/shared/components/Toaster/Toaster';

import {
	decodeExchangeToken,
	getExchangeToken,
} from 'src/services/authservice';

import {
	setPreference,
	setProjectSettings,
} from 'src/modules/root/context/authentication/action';

export const genPreference = async (dispatch: any, state: any) => {
	const prefObj = {
		mode: 'minified',
		theme: 'normal',
		twitter: ['Technology'],
		widgets: {
			budget: true,
			rfi: true,
			milestone: true,
			status: true,
			ontime: true,
			ahead: true,
			behind: true,
			tmr: true,
			ppc: true,
			variances: true,
			constraints: true,
			carbonfootprint: true,
			carbondata: true,
			carbon: true,
			productivity: true,
			noncompliance: true,
			onsite: true,
			timeandstatus: true,
			spi: true,
			health: true,
		},
		dashboardType: 'default',
	};
	try {
		const token = getExchangeToken();
		const response = await axios.get(
			`${
				process.env['REACT_APP_DASHBOARD_URL']
			}dashboard/getPreferences?tenantId=${Number(
				decodeExchangeToken().tenantId
			)}&userId=${decodeExchangeToken().userId}`,
			{
				headers: {
					Accept: 'application/json',
					Authorization: `Bearer ${token}`,
				},
			}
		);
		if (response?.status === 200) {
			if (response?.data === '') {
				dispatch(setPreference(prefObj));
				dispatch(setProjectSettings(prefObj.widgets));
			} else {
				const data = response.data;
				dispatch(
          setProjectSettings({ ...prefObj.widgets, ...data.widgets })
        );
				dispatch(setPreference(data));
			}
		}
	} catch (error) {
		console.error(error);
		NotificationMessage.sendNotification(
			`Error occurred while getting preferences`,
			AlertTypes.error
		);
	}
};
