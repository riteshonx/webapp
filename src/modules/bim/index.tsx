import React, { ReactElement } from 'react';
import {Redirect, Switch, Route} from 'react-router-dom';
import { BIM, MODEL_VIEW, MODEL_LIST } from './constants/route';
import View from './modelView/pages/Main/Main';
import List from './modelList/pages/Main/Main';
import Dva from './Dva/pages/Main/Main';

function Index(): ReactElement {
    return (
        <Switch>
            <Route path="/bim/:projectId/list" component={List}/>
            <Route path="/bim/:projectId/view/:modelId" component={View}/>
            <Route path="/bim/:projectId/scriptmanagement" component={Dva}/>
            <Route path="*">
                <Redirect to={'/bim/:projectId/list'} /> 
            </Route>
        </Switch>
    )
}

export default Index;
