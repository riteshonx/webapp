import React, { useContext, useRef, useState,useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import UserIcon from 'src/version2.0/assets/images/icons/userIcons.svg';
import LogoutIcon from 'src/version2.0_temp/assets/images/icons/logoutIcon.svg';
import slateLogo from 'src/version2.0_temp/assets/images/logoWhite.png';
import AppsIcon from 'src/version2.0/assets/images/icons/appsIcon.svg';
import BookmarkIcon from 'src/version2.0/assets/images/icons/bookmarkIcon.svg';
import ClockIcon from 'src/version2.0/assets/images/icons/clockIcon.svg';
import FolderIcon from 'src/version2.0/assets/images/icons/folderIcon.svg';
import LabIcon from 'src/version2.0/assets/images/icons/labIcon.svg';
import ScheduleIcon from 'src/version2.0/assets/images/icons/scheduleIcon.svg';
import CogIcon from 'src/version2.0/assets/images/icons/cogIcon.svg';
import { Popover } from 'src/version2.0/components/layer1/popover/popover';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import {setLogout} from 'src/modules/root/context/authentication/action';
import {logout} from 'src/services/authservice';
import { Phase } from './phase';
import DocumentLibrary from '../../documentsLibrary/DocumentLibrary';
import './header.scss';
import ProjectSetup from './project-setup/ProjectSetup';

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
    name: 'Auto Link',
    icon: BookmarkIcon,
    action: 'AUTO_LINK',
  },
  {
    name: 'Logout',
     icon: LogoutIcon,
    action: 'LOG_OUT',
  },
];

export const Header = (): React.ReactElement => {
  const headerOptionRef = useRef<HTMLDivElement>(null);
  const [openPhasePopover, setOpenPhasePopover] = useState(false);
  const [optionPopover, setOptionPopover] = useState(false);
  const [openDocumentsLibrary, setOpenDocumentsLibrary] = useState(false);
  const { state,dispatch } = useContext(stateContext)
  const history = useHistory();

  const loggingOut = () => {
      dispatch(setLogout());
      logout();
  };

  const closeAllPopover = () => {
    setOpenPhasePopover(false);
    setOptionPopover(false);
  };

  const togglePopover = () => {
    setOptionPopover(!optionPopover);
    setOpenPhasePopover(false);
  };
  const onClickPhase = () => {
    setOpenPhasePopover(!openPhasePopover);
  };
  const onClickDocuments=()=>{
    history.push(`/v2/${state.currentProject.projectId}/document`)
      setOpenDocumentsLibrary(true);
   
  }
  const optionOnClick = (ele: any) => {
    switch (ele.action) {
      case 'APP':
        history.push(`/v2/${state.currentProject.projectId}`);
        closeAllPopover();
        break;
      case 'PHASE':
        onClickPhase();
        break;
      case 'AUTO_LINK':
        history.push(`/v2/${state.currentProject.projectId}/autolink`);
        closeAllPopover();
        break;
      case 'DOCUMENTS':
      onClickDocuments();
      closeAllPopover();
      break;
        
        case 'LOG_OUT':
         loggingOut();
         break;
    }
  };

  const handleNavigate=()=>{
    history.push(`/v2/${state.currentProject.projectId}`)
    history.go(0)
  }
  return (
    <div className="v2-header">
			<div className="v2-header-logo">
				<img
					src={slateLogo}
					alt="slate-logo"
					onClick={handleNavigate}
				/>
				<h1>Welcome to Slate!</h1>
			</div>
      <div><ProjectSetup /></div>
      <div className="v2-header-user">
        <div className="v2-header-user-name">Welcome User !</div>
        <div className="v2-header-user-icon" onClick={togglePopover}>
          <img src={UserIcon} alt="" />
        </div>
        <div
          className={
            'v2-header-user-option ' + (optionPopover ? 'open' : 'close')
          }
        >
          <div className="v2-header-user-option-bar">
            <div className="v2-header-user-option-bar-title">Organizer</div>
            <div className="v2-header-user-option-bar-icon">
              <img src={CogIcon} alt="" />
            </div>
          </div>
          <div ref={headerOptionRef} className="v2-header-user-option-group">
            {UserOptionList.map((ele, index) => {
              return (
                <div
                  key={'option-' + index}
                  onClick={() => optionOnClick(ele)}
                  className="v2-header-user-option-group-btn"
                >
                  <img src={ele?.icon} alt={ele.name} />
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
