import Grid from '@material-ui/core/Grid';
import React, { ReactElement } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import EquipmentMasterState from 'src/modules/dynamicScheduling/context/EquipmentMaster/EquipmentMasterState';
import EquipmentMaster from 'src/modules/dynamicScheduling/features/EquipmentMaster/EquipmentMaster';
import {
  CALENDAR,
  EQUIPMENT_MASTER,
  LIBRARY,
  MATERIAL_MASTER,
  SCHEDULE_RECIPES,
  SCHEDULE_RECIPE_Plan,
  SCHEDULING,
  TASK_LIBRARY,
} from '../../../constatnts/route';
import CalendarState from '../../../context/calendar/CalendarState';
import RecipeState from '../../../context/Recipe/RecipeAction';
import ScheduleRecipesPlan from '../../components/ScheduleRecepiePlan/ScheduleRecepiePlan';
import Calendar from '../Calendar/CalendarLibrary';
import MaterialMaster from '../MaterialMaster/MaterialMaster';
import ScheduleRecipes from '../ScheduleRecipes/ScheduleRecipes';
import TaskLibrary from '../TaskLibrary/TaskLibrary';
import './Main.scss';

export default function Main(): ReactElement {
  return (
    <Grid container className="main-section">
      {/* <Grid item md={2} sm={3}>
          <SideBar />
        </Grid> */}
      <Grid item md={12} sm={9} className="main-section__container">
        {/* library route */}
        <RecipeState>
          <CalendarState>
            <Switch>
              <Route path={`/${SCHEDULING}/${LIBRARY}/${TASK_LIBRARY}`}>
                <TaskLibrary />
              </Route>
              <Route path={`/${SCHEDULING}/${LIBRARY}/${CALENDAR}`}>
                <Calendar />
              </Route>
              <Route path={`/${SCHEDULING}/${LIBRARY}/${SCHEDULE_RECIPES}`}>
                <ScheduleRecipes />
              </Route>
              <Route
                path={`/${SCHEDULING}/${LIBRARY}/${SCHEDULE_RECIPE_Plan}/:id`}
              >
                <ScheduleRecipesPlan />
              </Route>
              <Route path={`/${SCHEDULING}/${LIBRARY}/${MATERIAL_MASTER}`}>
                <MaterialMaster />
              </Route>
              <Route exact path={`/${SCHEDULING}/${LIBRARY}/`}>
                <Redirect to={`/${SCHEDULING}/${LIBRARY}/${TASK_LIBRARY}`} />
              </Route>
              <Route path={`/${SCHEDULING}/${LIBRARY}/${EQUIPMENT_MASTER}`}>
                <EquipmentMasterState>
                  <EquipmentMaster />
                </EquipmentMasterState>
              </Route>
              <Route path="*">
                <Redirect to={`/${SCHEDULING}/${LIBRARY}/${TASK_LIBRARY}`} />
              </Route>
            </Switch>
          </CalendarState>
        </RecipeState>
        {/* library route */}
      </Grid>
    </Grid>
  );
}
