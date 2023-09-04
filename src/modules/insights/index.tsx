import { lazy, ReactElement, useContext } from 'react';
import { Route, Router, Switch, useHistory } from 'react-router-dom';
import { stateContext } from '../root/context/authentication/authContext';
import Grid from '@material-ui/core/Grid';

const InsightsMain = lazy(() => import('./insightsView/pages/Main/Main'));

function Insights(): ReactElement {
  const history = useHistory();
  const { state }: any = useContext(stateContext);
  if (state?.projectFeaturePermissons?.canviewMasterPlan) {
    return (
      <Grid container style={{ height: '100%' }}>
        <Grid item xs={12} style={{ display: 'flex', flexGrow: 1 }}>
          <Router history={history}>
            <Switch>
              <Route
                exact
                path={`/insights/projects/:projectId/:tabName`}
                component={InsightsMain}
              />
              <Route
                path={`/insights/projects/:projectId/:tabName/insight/:id`}
                component={InsightsMain}
              />
            </Switch>
          </Router>
        </Grid>
      </Grid>
    );
  }
  {
    return <></>;
  }
}

export default Insights;
