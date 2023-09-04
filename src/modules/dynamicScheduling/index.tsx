import React, { lazy } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import {
  LIBRARY,
  PROJECT_PLAN,
  SCHEDULING,
  TASK_LIBRARY,
} from './constatnts/route';

const ProjectPlanState = lazy(() => import("./context/projectPlan/ProjectPlanState"));
const projectPlan = lazy(() => import("./features/ProjectPlan/ProjectPlan"));
const Library = lazy(() => import("./libraries/pages/Main/Main"));

export default function Scheduleing(): any {
  return (
    <ProjectPlanState>
      <Switch>
        <Route
          path={`/${SCHEDULING}/${PROJECT_PLAN}/:id`}
          component={projectPlan}
        />
        <Route path={`/${SCHEDULING}/${LIBRARY}`} component={Library} />
        <Route exact path={`/${SCHEDULING}`}>
          <Redirect to={`/${SCHEDULING}/${LIBRARY}`}></Redirect>
        </Route>
        <Route path="*">
          <Redirect to={`/${SCHEDULING}/${LIBRARY}/${TASK_LIBRARY}`} />
        </Route>
      </Switch>
    </ProjectPlanState>
  );
}
