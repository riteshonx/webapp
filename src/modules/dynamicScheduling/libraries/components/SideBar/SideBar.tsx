import React, { ReactElement } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  CALENDAR,
  PROJECT_PLAN,
  SCHEDULING,
  TASK_LIBRARY,
  SCHEDULE_RECIPES,
  MATERIAL_MASTER
} from '../../../constatnts/route';
import './SideBar.scss';
import BackNavigation from '../../../../shared/components/BackNavigation/BackNavigation';

const navItem = [
  {
    name: 'Task Library',
    path: `/${SCHEDULING}/library/${TASK_LIBRARY}`,
    id: 1,
  },
  {
    name: 'Calendar',
    path: `/${SCHEDULING}/library/${CALENDAR}`,
    id: 2,
  },
  {
    name: 'Schedule Recipes',
    path: `/${SCHEDULING}/library/${SCHEDULE_RECIPES}`,
    id: 3,
  },
  {
    name: 'Material Master',
    path: `/${SCHEDULING}/library/${MATERIAL_MASTER}`,
    id: 4,
  },
  /*{
    name: 'ProjectPlan',
    path: `/${SCHEDULING}/${PROJECT_PLAN}`,
    id: 3,
  },*/
];

export default function SideBar(): ReactElement {
  const location = useLocation();
  const history = useHistory();

  const navigateHandler = (path: string) => {
    history.push(path);
  };

  return (
    <div className="sideBar">
      <div className="sideBar__header">
      <BackNavigation />
        <div className="sideBar__header__text">Libraries</div>
      </div>
      <div className="sideBar__nav">
        {navItem.map((item) => (
          <div
            key={item.id}
            data-testid={`lps-nav-${item.id}`}
            className="sideBar__nav__content"
            onClick={() => navigateHandler(item.path)}
          >
            <div
              className={
                location.pathname.includes(item.path)
                  ? 'sideBar__nav__active'
                  : 'sideBar__nav__hidden'
              }
            ></div>
            <div className="sideBar__nav__content__text">{item.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
