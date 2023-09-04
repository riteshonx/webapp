import { Router, Switch, Route, useHistory } from 'react-router-dom';
import '../styles/index.scss';
import CdpLanding from './CdpLanding/CdpLanding';
import ModularSubstation from './modularSubstation/modularSubstation';
import { CDPContext } from '../context/context';
import { useReducer } from 'react';
import { cdpInitialState, cdpReducer } from '../context/reducer';
export default (): React.ReactElement => {
  const [cdpState, cdpDispatch] = useReducer(cdpReducer, cdpInitialState);
  const history = useHistory();
  return (
    <CDPContext.Provider value={{ cdpState, cdpDispatch }}>
      <div className="cdp">
        <Router history={history}>
          <Switch>
            <Route exact path={`/generator`} component={CdpLanding} />
            <Route
              exact
              path={`/generator/modular-substation/:substationId`}
              component={ModularSubstation}
            />
          </Switch>
        </Router>
      </div>
    </CDPContext.Provider>
  );
};
