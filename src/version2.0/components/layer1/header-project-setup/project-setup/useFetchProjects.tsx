import { useContext, useState } from 'react';
import NotificationMessage, {
	AlertTypes,
} from '../../../../../modules/shared/components/Toaster/Toaster';

import {
	FETCH_MYPORJECT_PORTFOLIO
} from '../../../../../graphhql/queries/projects';

import { client } from '../../../../../services/graphql';

import {
	setCurrentProject,
	setIsLoading,
	setProjectList,
	setSelectedProject,
} from '../../../../../modules/root/context/authentication/action';

import {
	stateContext
} from '../../../../../modules/root/context/authentication/authContext';

export const useFetchProjects = () => {
	const { dispatch, state }: any = useContext(stateContext);

	//will use this in more concise manner when we will extract projectId from ur
	const [projectIdFromUrl, setProjectIdFromUrl] = useState(-1); 

	const getProjects = async () => {
		try {
			dispatch(setIsLoading(true));

			const response = await client.query({
				query: FETCH_MYPORJECT_PORTFOLIO,
				fetchPolicy: 'network-only',
				context: {
					role: 'viewMyProjects',
				},
				variables: {
					portfolioId: state.currentPortfolio.portfolioId,
				},
			});

			if (response?.data?.project) {
				const targetResponse: Array<any> = [];
				response?.data?.project.forEach((projectItem: any) => {
					targetResponse.push({
						portfolioId:
							projectItem
								?.projectPortfolioAssociations[0]
								?.portfolioId,
						projectId: projectItem?.id,
						projectName: projectItem?.name,
					});
				});

				const data = [
					{
						projectId: 0,
						projectName: 'All',
						isRecent: 'true',
					},
					...targetResponse,
				];

				const selectedProject: any = sessionStorage.getItem('selectedProject');
				if (JSON.parse(selectedProject)) {
					const isExist = data.find(
						(item: any) =>
							item.projectId === JSON.parse(selectedProject).projectId
					);
					if (isExist?.projectId) {
						const project: any = sessionStorage.getItem('selectedProject');
						dispatch(setCurrentProject(JSON.parse(project)));
					} else {
						sessionStorage.setItem(
							'selectedProject',
							JSON.stringify(data[1] || null)
						);
						dispatch(setCurrentProject(data[1] || data[0]));
					}
				} else {
					if (projectIdFromUrl > 0) {
						const targetProject = data.find(
							(item: any) => item.projectId === projectIdFromUrl
						);

						if (targetProject) {
							dispatch(setCurrentProject(targetProject));
							dispatch(setSelectedProject(targetProject));
							sessionStorage.setItem(
								'selectedProject',
								JSON.stringify(targetProject)
							);
						} else {
							dispatch(setCurrentProject(data[state?.isOnxTenant ? 1 : 0]));
							dispatch(setSelectedProject(data[state?.isOnxTenant ? 1 : 0]));
							sessionStorage.setItem(
								'selectedProject',
								JSON.stringify(data[state?.isOnxTenant ? 1 : 0])
							);
						}
					} else {
						state?.isOnxTenant
							? dispatch(setCurrentProject(data[1]))
							: dispatch(setCurrentProject(data[0]));
					}
				}
				dispatch(setProjectList(data));
				dispatch(setIsLoading(false));
			}
		} catch (error) {
			console.error(error);
			NotificationMessage.sendNotification(
				`We are unable fetch projects`,
				AlertTypes.error
			);
			dispatch(setIsLoading(false));
		}
	};

	return { getProjects, projectIdFromUrl };
};
