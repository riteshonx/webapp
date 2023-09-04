import { useContext } from 'react';
import {
	projectExchangeTokenFeatures
} from '../../../../../modules/authentication/utils';
import NotificationMessage, {
	AlertTypes,
} from '../../../../../modules/shared/components/Toaster/Toaster';
import { postApi } from '../../../../../services/api';

import {
	decodeExchangeToken,
	decodeProjectExchangeToken,
	setProjectExchangeToken,
} from '../../../../../services/authservice';

import { projectFeatureAllowedRoles } from '../../../../../utils/role';

import {
	setIsLoading,
	setProjectPermissions,
	setProjectToken,
} from '../../../../../modules/root/context/authentication/action';

import {
	stateContext
} from '../../../../../modules/root/context/authentication/authContext';

export const useFetchProjectToken = () => {
	const { dispatch }: any = useContext(stateContext);

	const fetchProjectToken = async (argProjectId: number) => {
		try {
			dispatch(setIsLoading(true));
			const ProjectToken: any = {
				tenantId: Number(decodeExchangeToken().tenantId),
				projectId: argProjectId,
				features: projectExchangeTokenFeatures,
			};
			const projectTokenResponse = await postApi(
				'V1/user/login/exchange',
				ProjectToken
			);
			const projectToken = projectTokenResponse.success;
			setProjectExchangeToken(projectToken);
			setProjectSpecificPermission(projectToken);
			dispatch(setProjectToken(projectToken));
			dispatch(setIsLoading(false));
		} catch (error) {
			NotificationMessage.sendNotification(
				`We are unable fetch project token. Please refresh the page`,
				AlertTypes.error
			);
			dispatch(setIsLoading(false));
		}
	};

	const setProjectSpecificPermission = (argToken: string) => {
		const allowedRoles = decodeProjectExchangeToken(argToken).allowedRoles;
		const permissions: any = {};
		for (const [key, value] of Object.entries(projectFeatureAllowedRoles)) {
			const currentRole: any = value;
			permissions[`can${key}`] = allowedRoles.indexOf(currentRole) > -1;
		}
		dispatch(setProjectPermissions(permissions));
	};

	return { fetchProjectToken };
};
