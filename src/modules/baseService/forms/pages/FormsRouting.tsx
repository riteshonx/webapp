import React, { lazy, ReactElement } from 'react'
import { Route, Redirect,Switch } from 'react-router-dom';
const CreateTemplate = lazy(() => import( './CreateTemplate/CreateTemplate'));
const FormsList = lazy(() => import( './FormsList/FormsList'));
const Update = lazy(() => import( './UpdateTemplate/UpdateTemplate'));
const CopyTemplate = lazy(() => import( './CopyTemplate/CopyTemplate'));
const CreateForm = lazy(() => import( './CreateFeatureTemplate/CreateFeatureTemplate'));
function FormsLanding(): ReactElement {
    return (
        <Switch>
            <Route path={'/base/forms/create/:featureId'} component={CreateTemplate}></Route>
            <Route path={'/base/forms/create'} component={CreateForm}></Route>
            <Route path={'/base/forms/details/:id'} component={Update}></Route>
            <Route path={'/base/forms/copy/:id/:name'} component={CopyTemplate}></Route>
            <Route path={'/base/forms/:id'} component={FormsList}></Route>
            <Route exact path={'/base/forms'} component={FormsList}></Route>
            <Route path={'/base/forms/create'}>
                <Redirect to={'/base/forms'}></Redirect>
            </Route>
        </Switch>
    )
}

export default FormsLanding;
