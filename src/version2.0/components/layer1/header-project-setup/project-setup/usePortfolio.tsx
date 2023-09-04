import { useState, useContext } from 'react';
import NotificationMessage, {
	AlertTypes,
} from '../../../../../modules/shared/components/Toaster/Toaster';
import {
	stateContext
} from '../../../../../modules/root/context/authentication/authContext';
import {
	setCurrentLevel,
	setCurrentPortfolio,
	setCurrentProject,
	setIsLoading,
	setPortfolioList,
	setTenantSwitch,
} from '../../../../../modules/root/context/authentication/action';
import { client } from '../../../../../services/graphql';
import { genPreference, genTenantDetails, genTenantRole } from './project-util';

import { FETCH_PORTFOLIOS } from '../../../../../graphhql/queries/projects';
import { useHistory } from 'react-router-dom';

export const usePortfolios = () => {
	const { dispatch, state }: any = useContext(stateContext);
	const [portfolioProjectAssList, setPortfolioProjectAssociationList] =
		useState();
	const history = useHistory();

	const getPortfolios = async (projectId = -1) => {
		try {
			dispatch(setIsLoading(true));
			// await genPreference(dispatch, state);
			// await genTenantDetails();
			// await genTenantRole();
			const response = await client.query({
				query: FETCH_PORTFOLIOS,
				fetchPolicy: 'network-only',
				context: {
					role: 'viewMyProjects',
				},
			});
			if (response?.data?.portfolio?.length) {
				const portfolioData: Array<any> = response?.data?.portfolio.map(
					(p: any) => ({
						portfolioId: p.id,
						portfolioName: p.name,
						projectInfos: p.projectPortfolioAssociations,
					})
				);

				dispatch(setPortfolioList(portfolioData));
				const selectedPortfolio = sessionStorage.getItem('selectedPortfolio');
				const portfolioProjectList: any = [];

				for (let i = 0; i < portfolioData?.length; i++) {
					const data = portfolioData[i]?.projectInfos.map((val: any) => {
						return { [val.projectId]: portfolioData[i]?.portfolioId };
					});
					portfolioProjectList.push(...data);
				}
				setPortfolioProjectAssociationList(portfolioProjectList);
				!state?.isOnxTenant &&
					dispatch(setCurrentProject(state.projectList[0]));

				if (
					selectedPortfolio &&
					portfolioData.find(
						(item) =>
							item.portfolioId === JSON.parse(selectedPortfolio).portfolioId
					)
				) {
					const portfolio: any = 
						sessionStorage.getItem('selectedPortfolio');
					dispatch(setCurrentPortfolio(JSON.parse(portfolio)));
				} else {
					if (projectId > 0) {
						const currentPortfolioId = portfolioProjectList.find(
							(val: any) => projectId === Number(Object.keys(val)[0])
						);
						let targetPorfolio = portfolioData;
						if (currentPortfolioId) {
							targetPorfolio = portfolioData.filter(
								(pd) => pd.portfolioId == currentPortfolioId[projectId]
							);
						}

						sessionStorage.setItem(
							'selectedPortfolio',
							JSON.stringify(targetPorfolio[0])
						);
						dispatch(setCurrentPortfolio(targetPorfolio[0]));
					} else {
						sessionStorage.setItem(
							'selectedPortfolio',
							JSON.stringify(portfolioData[0])
						);
						dispatch(setCurrentPortfolio(portfolioData[0]));
					}
				}

				if (state.tenantSwitch) {
					dispatch(setTenantSwitch(false));
					sessionStorage.setItem('level', 'portfolio');
					!state?.isOnxTenant &&
						dispatch(setCurrentProject(state?.projectList[0]));
					dispatch(setCurrentLevel('portfolio'));
					history.push('/v2');
				}

				dispatch(setIsLoading(false));
			}
		} catch (error) {
			console.error(error);
			NotificationMessage.sendNotification(
				`Error occurred while fetching portfolios`,
				AlertTypes.error
			);
			dispatch(setIsLoading(false));
		}
	};

	return { portfolioProjectAssList, getPortfolios };
};
