import { useContext, useState } from 'react';
import NotificationMessage, {
	AlertTypes,
} from 'src/modules/shared/components/Toaster/Toaster';

import {
	FETCH_MYPORJECT_PORTFOLIO
} from 'src/graphhql/queries/projects';

import { client } from 'src/services/graphql';

import {
	setCurrentProject,
	setIsLoading,
	setProjectList,
	setSelectedProject,
} from 'src/modules/root/context/authentication/action';

import {
	stateContext
} from 'src/modules/root/context/authentication/authContext';
import { useHistory } from 'react-router-dom';

export const useFetchProjects = () => {
	const { dispatch, state }: any = useContext(stateContext);
	const history = useHistory();
	

	//will use this in more concise manner when we will extract projectId from ur
	const [projectIdFromUrl, setProjectIdFromUrl] = useState(-1); 

	const currentProject = (project: any) => {
		dispatch(setCurrentProject(project))
		history.push(project.projectId
			? `/v2/${project.projectId}` : '/v2')
	}
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
						currentProject(JSON.parse(project));
					} else {
						sessionStorage.setItem(
							'selectedProject',
							JSON.stringify(data[1] || null)
						);
						currentProject(data[1] || data[0]);
					}
				} else {
					if (projectIdFromUrl > 0) {
						const targetProject = data.find(
							(item: any) => item.projectId === projectIdFromUrl
						);

						if (targetProject) {
							currentProject(targetProject);
							dispatch(setSelectedProject(targetProject));
							sessionStorage.setItem(
								'selectedProject',
								JSON.stringify(targetProject)
							);
						} else {
							currentProject(data[state?.isOnxTenant ? 1 : 0]);
							dispatch(setSelectedProject(data[state?.isOnxTenant ? 1 : 0]));
							sessionStorage.setItem(
								'selectedProject',
								JSON.stringify(data[state?.isOnxTenant ? 1 : 0])
							);
						}
					} else {
						state?.isOnxTenant
							? currentProject(data[1])
							: currentProject(data[0]);
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
