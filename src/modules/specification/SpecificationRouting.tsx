import React, { lazy, ReactElement } from 'react';
import { Route, Redirect, Router, Switch, useHistory } from "react-router-dom";
import Grid from '@material-ui/core/Grid';

const SpecificationListsRouting = lazy(() => import('./specificationLists/pages/SpecificationListsRouting'))

export default function SpecificationLanding(): ReactElement {
    const history = useHistory();
    return (
        <Grid container style={{ height: '100%' }}>
            <Grid item xs={12} style={{ display: "flex", flexGrow: 1 }}>
                <Router history={history}>
                    <Switch>
                        <Route path={'/specifications/projects'} component={SpecificationListsRouting} />
                        <Route exact path={'/specifications/projects/:projectId/lists'}>
                            <Redirect to="/specifications/projects/:projectId/lists"></Redirect>
                        </Route>
                    </Switch>
                </Router>
            </Grid>
        </Grid>
    )
}
