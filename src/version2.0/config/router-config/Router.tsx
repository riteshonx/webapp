import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { ProjectInfo } from '../../components/layer1/ProjectInfo';
import { Schedule } from '../../components/layer1/Schedule';
import { UserInsight } from '../../components/layer1/insights/UserInsight';
import AnalyticsProvidedVisualize from 'src/version2.0_temp/views/Visualize/Visualize';

const RouterConfigurations = (): React.ReactElement => {
  return (
    <Switch>
      <Route exact path="/v2">
        <ProjectInfo />
      </Route>
      <Route path="/v2/insights">
        <UserInsight />
      </Route>
      <Route exact path="/v2/visualize">
        <AnalyticsProvidedVisualize />
      </Route>
      <Route path="/">
        <Schedule />
      </Route>
    </Switch>
  );
};

export default RouterConfigurations;
