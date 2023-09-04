import React, { useRef, useState } from 'react';
import './header.scss';
import UserIcon from 'src/version2.0/assets/images/icons/userIcons.svg';
import AppsIcon from 'src/version2.0/assets/images/icons/appsIcon.svg';
import BookmarkIcon from 'src/version2.0/assets/images/icons/bookmarkIcon.svg';
import ClockIcon from 'src/version2.0/assets/images/icons/clockIcon.svg';
import FolderIcon from 'src/version2.0/assets/images/icons/folderIcon.svg';
import LabIcon from 'src/version2.0/assets/images/icons/labIcon.svg';
import ScheduleIcon from 'src/version2.0/assets/images/icons/scheduleIcon.svg';
import CogIcon from 'src/version2.0/assets/images/icons/cogIcon.svg';
import visualizeIcon from 'src/version2.0/assets/images/icons/visualizeIcon.svg';
import DocumentLibrary from '../../../../version2.0_temp/components/documentsLibrary/DocumentLibrary';
import { Popover } from '../popover/popover';
import { Phase } from './phase';
import ProjectSetup from '../header-project-setup/project-setup/ProjectSetup'
import { useHistory } from "react-router-dom";

const UserOptionList = [
	{
		name: 'App',
		icon: AppsIcon,
		action: 'APP',
	},
	{
		name: 'Schedule',
		icon: ScheduleIcon,
		action: 'SCHEDULE',
	},
	{
		name: 'Reminders',
		icon: ClockIcon,
		action: 'REMINDERS',
	},
	{
		name: 'Documents',
		icon: FolderIcon,
		action: 'DOCUMENTS',
	},
	{
		name: 'Phase',
		icon: LabIcon,
		action: 'PHASE',
	},
	{
		name: 'Favourites',
		icon: BookmarkIcon,
		action: 'FAVOURITES',
	},
	{
		name: 'Visualize',
		icon: visualizeIcon,
		action: 'VISUALIZE',
	},
];

export const Header = (): React.ReactElement => {
	const headerOptionRef = useRef<HTMLDivElement>(null);
	const [openPhasePopover, setOpenPhasePopover] = useState(false);
	const [optionPopover, setOptionPopover] = useState(false);
	const [openDocumentsLibrary, setOpenDocumentsLibrary] = useState(false);
	const history = useHistory();
	const togglePopover = () => {
		setOptionPopover(!optionPopover);
		setOpenPhasePopover(false);
	};
	const onClickPhase = () => {
		setOpenPhasePopover(!openPhasePopover);
	};
	const optionOnClick = (ele: any) => {
		if (ele.action === 'PHASE') {
			onClickPhase();
		} else if (ele.action === 'DOCUMENTS') {
			setOpenDocumentsLibrary(true);
		} else if (ele.action === 'VISUALIZE') {
			history.push("/v2/visualize");
		}
	};
	return (
		<div className="v2-header">
			<h1>Welcome to Slate!</h1>
			<div><ProjectSetup/></div>
			<div className="v2-header-user">
				<div className="v2-header-user-name">Welcome User !</div>
				<div
					className="v2-header-user-icon"
					onClick={togglePopover}
				>
					<img
						src={UserIcon}
						alt=""
					/>
				</div>
				<div
					className={
						'v2-header-user-option ' + (optionPopover ? 'open' : 'close')
					}
				>
					<div className="v2-header-user-option-bar">
						<div className="v2-header-user-option-bar-title">Organizer</div>
						<div className="v2-header-user-option-bar-icon">
							<img
								src={CogIcon}
								alt=""
							/>
						</div>
					</div>
					<div
						ref={headerOptionRef}
						className="v2-header-user-option-group"
					>
						{UserOptionList.map((ele, index) => {
							return (
								<div
									key={'option-' + index}
									onClick={() => optionOnClick(ele)}
									className="v2-header-user-option-group-btn"
								>
									<img
										src={ele.icon}
										alt={ele.name}
									/>
									<label>{ele.name}</label>
								</div>
							);
						})}
						<Popover
							notch={false}
							trigger={<></>}
							open={openPhasePopover}
							foreignTrigger={true}
							foreignTarget={headerOptionRef}
						>
							<Phase
								onCancel={() => {
									setOpenPhasePopover(false);
								}}
							/>
						</Popover>
					</div>
				</div>
				{openDocumentsLibrary && (
					<div className="v2-header-document-lib-model">
						<div className="v2-header-document-lib-model-content">
							<DocumentLibrary
								closeDocumentLibrary={() => setOpenDocumentsLibrary(false)}
							/>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
