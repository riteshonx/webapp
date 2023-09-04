import React, { lazy, ReactElement } from 'react'
import { Route, Redirect,Switch } from 'react-router-dom';
const CreateCustomList = lazy(() => import( './CreateCustomList/CreateCustomList'));
const CustomListView = lazy(() => import( './CustomListView/CustomListView'));
const EditListView = lazy(() => import( './EditCustomList/EditCustomList'));
const ViewCustomList = lazy(() => import( './ViewCustomList/ViewCustomList'));

function CustomListRouting(): ReactElement {
    return (
        <Switch>
            <Route path={'/base/customList/view/:id'} component={ViewCustomList}></Route>
            <Route path={'/base/customList/view'} component={CustomListView}></Route>
            <Route path={'/base/customList/create'} component={CreateCustomList}></Route>
            <Route path={'/base/customList/:id'} component={EditListView}></Route>
            <Route path={'/base/customList'}>
                <Redirect to={'/base/customList/view'}></Redirect>
            </Route>
        </Switch>
    )
}

export default CustomListRouting;
