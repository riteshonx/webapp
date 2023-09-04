import { client } from 'src/services/graphql';
import { 
	GET_TENANT_ROLE 
} from 'src/modules/Dashboard/graphql/queries/dashboard';
import NotificationMessage, {
	AlertTypes,
} from 'src/modules/shared/components/Toaster/Toaster';

import { decodeExchangeToken } from 'src/services/authservice';

export const genTenantRole = async (): Promise<void> => {
	try {
		const tenantAssociationResponse = await client.query({
			query: GET_TENANT_ROLE,
			variables: {
				userId: decodeExchangeToken().userId,
			},
			fetchPolicy: 'network-only',
			context: {
				role: 'updateMyUser',
			},
		});
	} catch (error) {
		console.error(error);
		NotificationMessage.sendNotification(
			`Error occurred while fetching tenant role`,
			AlertTypes.error
		);
	}
};
