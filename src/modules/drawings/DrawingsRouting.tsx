import React, { lazy, ReactElement } from 'react';
import {Route, Redirect, Router, Switch, useHistory} from "react-router-dom";
import Grid from '@material-ui/core/Grid';

const DrawingListsRouting = lazy(()=> import('./drawingLists/pages/DrawingListsRouting'))

export default function DrawingsLanding(): ReactElement {
    const history= useHistory();
    return (
      <Grid container style={{height: '100%'}}>
          <Grid item xs={12} style={{display:"flex",flexGrow:1}}>
            <Router history={history}>
                <Switch>
                      <Route path={'/drawings/projects'} component={DrawingListsRouting} />
                      <Route exact path={'/drawings/projects/:projectId/lists'}>
                          <Redirect to="/drawings/projects/:projectId/lists"></Redirect>  
                      </Route>
                  </Switch>
            </Router>
          </Grid>
      </Grid>
    )
}
