import { useHistory } from 'react-router-dom';
import { useState, useContext } from 'react';
import {
	stateContext
} from 'src/modules/root/context/authentication/authContext';
import {
	setCurrentLevel,
	setCurrentPortfolio,
	setCurrentProject,
} from 'src/modules/root/context/authentication/action';

export const usePortfolioSelection = () => {
	const [isOpenPortfolioDropdown, setOpenPortfolioDropdown] = useState(false);

	const { dispatch, state }: any = useContext(stateContext);
	const history = useHistory();

	const openPortfolioDropdown = () => {
		setOpenPortfolioDropdown(!isOpenPortfolioDropdown);
	};

	const handlePortfolioSelection = (val: any) => {
		const selectedPortfolio = state.portfolioList?.find(
			(item: any) => item.portfolioName === val?.portfolioName
		);
		if (state.editMode) {
			sessionStorage.setItem('promptResponse', 'INPROGRESS');
			history.push('/v2');
		} else {
			handlePortfolioChange(selectedPortfolio, true);
		}
	};

	const handlePortfolioChange = (selectedPortfolio: any, reRoute = false) => {
		if (selectedPortfolio) {
			dispatch(setCurrentPortfolio(selectedPortfolio));
			setOpenPortfolioDropdown(false);
			if (reRoute) {
				history.push('/v2');
			}
			sessionStorage.setItem(
				'selectedPortfolio',
				JSON.stringify(selectedPortfolio)
			);
			sessionStorage.setItem('selectedProject', JSON.stringify(null));
			dispatch(setCurrentProject(state.projectList[0]));
			sessionStorage.setItem('level', 'portfolio');
			dispatch(setCurrentLevel('portfolio'));
		}
	};

	return {
		openPortfolioDropdown,
		handlePortfolioSelection,
		isOpenPortfolioDropdown,
		setOpenPortfolioDropdown,
		handlePortfolioChange,
	};
};
