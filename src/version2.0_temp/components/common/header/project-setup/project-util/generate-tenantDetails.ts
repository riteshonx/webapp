import { client } from 'src/services/graphql';

import { 
	FETCH_TENANT_DETAILS 
} from 'src/modules/Dashboard/graphql/queries/dashboard';
import NotificationMessage, {
	AlertTypes,
} from 'src/modules/shared/components/Toaster/Toaster';

export const genTenantDetails = async (): Promise<boolean> => {
	return new Promise(async (resolve, reject) => {
		try {
			const tenantDetailsResponse = await client.query({
				query: FETCH_TENANT_DETAILS,
				fetchPolicy: 'network-only',
				context: {
					role: 'viewMyProjects',
				},
			});
			resolve(
				tenantDetailsResponse?.data?.tenant[0]?.productionCenterEnabled
			);
		} catch (err) {
			console.error('Error occurred while fetching tenant details');
			NotificationMessage.sendNotification(
				`Error occurred while fetching tenant details`,
				AlertTypes.error
			);
			reject(err);
		}
	});
};
