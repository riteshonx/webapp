import React, { lazy, ReactElement } from 'react';
import { Route, Switch } from 'react-router-dom';
const ClassificationCode = lazy(
  () => import('./ClassificationCode/ClassificationCode')
);

const ProjectBudget = lazy(() => import('./ProjectBudget/ProjectBudget'));

const ChangeOrder = lazy(() => import('./ChangeOrder/ChangeOrder'));
const ProjectUserGroups = lazy(
  () => import('./ProjectUserGroups/ProjectUserGroups')
);
const ProjectCustomList = lazy(
  () => import('./ProjectCustomList/ProjectCustomList')
);
const ProjectFormAssociation = lazy(
  () => import('./ProjectFormAssociation/ProjectFormAssociation')
);
const CalendarAssociation = lazy(
  () => import('./CalendarAssociation/CalendarAssociation')
);
const LocationManagement = lazy(
  () => import('./LocationManagement/LocationManagement')
);
const ProjectMaterialMaster = lazy(
  () => import('./ProjectMaterialMaster/index')
);
const ProjectTeams = lazy(
  () => import('../../projects/components/ProjectMember/ProjectMember')
);
const ProjectDetails = lazy(() => import('./UpdateProject/UpdateProject'));
const ProjectEquipmentMaster = lazy(() => import('./ProjectEquipmentMaster'));
const InsightsSettings = lazy(() => import('./InsightsSettings'));

export default function ProjectSettingsRouting(props: any): ReactElement {
  return (
    <Switch>
      <Route
        path={'/base/project-lists/:projectId/teams'}
        component={ProjectTeams}
      ></Route>
      <Route
        path={'/base/project-lists/:projectId/details'}
        component={ProjectDetails}
      ></Route>
      <Route
        path={'/base/project-lists/:projectId/location-management'}
        component={LocationManagement}
      ></Route>
      <Route
        path={'/base/project-lists/:projectId/user-groups'}
        component={ProjectUserGroups}
      ></Route>
      <Route
        path={'/base/project-lists/:projectId/custom-lists'}
        component={ProjectCustomList}
      ></Route>
      <Route
        exact
        path={'/base/project-lists/:projectId/form-association'}
        component={ProjectFormAssociation}
      ></Route>
      <Route
        exact
        path={'/base/project-lists/:projectId/calendar-association'}
        component={CalendarAssociation}
      ></Route>
      <Route
        exact
        path={'/base/project-lists/:projectId/project-material'}
        component={ProjectMaterialMaster}
      ></Route>
      <Route
        exact
        path={'/base/project-lists/:projectId/project-equipment'}
        component={ProjectEquipmentMaster}
      ></Route>
      <Route
        exact
        path={'/base/project-lists/:projectId/insights-settings'}
        component={InsightsSettings}
      ></Route>
      <Route
        exact
        path={'/base/project-lists/:projectId/classification-code'}
        component={ClassificationCode}
      ></Route>
      <Route
        exact
        path={'/base/project-lists/:projectId/project-budget'}
        component={ProjectBudget}
      ></Route>
      <Route
        exact
        path={'/base/project-lists/:projectId/change-order'}
        component={ChangeOrder}
      ></Route>
    </Switch>
  );
}
