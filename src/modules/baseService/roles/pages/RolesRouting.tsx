import React, { ReactElement } from 'react';
import { Route, Switch } from 'react-router-dom';
import RolesList from './RolesList/RolesList';

function RolesRouting(): ReactElement {
    return (
        <Switch>
        <Route path={'/base/roles'} component={RolesList}/>
    </Switch>
    )
}

export default RolesRouting;
