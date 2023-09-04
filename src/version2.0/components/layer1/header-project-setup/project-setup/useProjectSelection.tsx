import { useHistory } from 'react-router-dom';
import { useState, useContext } from 'react';
import {
	stateContext
} from '../../../../../modules/root/context/authentication/authContext';
import {
	setCurrentLevel,
	setCurrentProject,
	setSelectedMenu,
} from '../../../../../modules/root/context/authentication/action';

export const useProjectSelection = () => {
	const { dispatch, state }: any = useContext(stateContext);
	const [isOpenDropdown, setOpenDropdown] = useState(false);
	const history = useHistory();

	const openDropdown = () => {
		setOpenDropdown(!isOpenDropdown);
	};

	const handleProjectSelection = (val: any) => {
		const selectedProject = state.projectList.find(
			(item: any) => item.projectName === val?.projectName
		);
		if (state.editMode) {
			sessionStorage.setItem('promptResponse', 'INPROGRESS');
			history.push('/v2');
		} else {
			handleProjectChange(selectedProject, true);
		}
	};

	const handleProjectChange = (selectedProject: any, reRoute = false) => {
		if (selectedProject) {
			if (selectedProject.projectName === 'All') {
				sessionStorage.setItem('selectedProject', JSON.stringify(null));
			} else {
				sessionStorage.setItem(
					'selectedProject',
					JSON.stringify(selectedProject)
				);
			}
			dispatch(setCurrentProject(selectedProject));
			setOpenDropdown(false);
			if (reRoute) {
				history.push('/v2');
			}
			if (selectedProject.projectName === 'All') {
				sessionStorage.setItem('level', 'portfolio');
				dispatch(setCurrentLevel('portfolio'));
				dispatch(setSelectedMenu('Home'));
				sessionStorage.setItem('selectedMenu', 'Home');
			} else {
				dispatch(setSelectedMenu('Home'));
				sessionStorage.setItem('selectedMenu', 'Home');
				sessionStorage.setItem('level', 'project');
				dispatch(setCurrentLevel('project'));
			}
		}
	};
	return {
		isOpenDropdown,
		openDropdown,
		handleProjectSelection,
		handleProjectChange,
	};
};
