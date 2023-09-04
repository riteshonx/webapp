import { lazy, ReactElement, useContext } from 'react';
import { Route, Router, Switch, useHistory } from 'react-router-dom';
import { stateContext } from '../root/context/authentication/authContext';
import Grid from '@material-ui/core/Grid';

const productivityMetrics = lazy(() => import('./productivityMetricsView/pages/Main/Main'))

function productivityMetricsView(): ReactElement {
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
                path={`/productivityMetrics/:projectId`}
                component={productivityMetrics}
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

export default productivityMetricsView;
