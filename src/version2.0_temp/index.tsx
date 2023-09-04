import React,{useReducer} from 'react';
import './assets/styles/index.scss';
import { BrowserRouter as Router } from 'react-router-dom';
import { Route, Switch } from 'react-router-dom';
import * as Views from './views';
import { Header } from './components/common';
import { V2Reducer, V2InitialState} from './context';
import {V2Context} from  './context';
import {FloatingFooter} from './components/common';

export default (): React.ReactElement => {
  const [ V2State, V2Dispatch] = useReducer(V2Reducer, V2InitialState)
  return (
    <V2Context.Provider value = {{V2State, V2Dispatch}}>
    <div className="v2">
      <Router>
        <Header />
        <div className="v2-container">
          <Switch>
            <Route exact path="/v2">
              <Views.HomeView />
            </Route>
            <Route exact path="/v2/:projectId">
              <Views.HomeView />
            </Route>
            <Route exact path="/v2/:projectId/autolink">
              <Views.AutoLink />
            </Route>
            <Route exact path="/v2/visualize">
              <Views.AnalyticsProvidedVisualize />
            </Route>
          </Switch>
        </div>
      </Router>
      <FloatingFooter/>
    </div>
    </V2Context.Provider>
  );
};
