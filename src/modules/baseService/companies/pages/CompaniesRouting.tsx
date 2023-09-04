import React, { lazy, ReactElement, useReducer } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { CompanyDetailsContext } from '../Context/CompanyDetailsContext';
import { CompanyDetailsInitialState, CompanyDetailsReducer } from '../Context/CompanyDetailsReducer';
const Company = lazy(() => import( './CompaniesLanding/CompaniesLanding'));
const updateCompany = lazy(() => import( './UpdateCompany/UpdateCompany'));

export default function CompanyRouting(): ReactElement {
    const [companyDetailsState, companyDetailsDispatch] = useReducer(CompanyDetailsReducer, CompanyDetailsInitialState);

    return (
        <CompanyDetailsContext.Provider value = {{companyDetailsState, companyDetailsDispatch}} >
            <Switch>
                <Route path={'/base/companies/:companyId/details'} component={Company}></Route>
                {/* <Route path={'/base/companies/:companyId/settings'} component={ProjectSettings}></Route> */}
                <Route exact path={'/base/companies'} component={Company}></Route> 
                <Route path="*">
                    <Redirect to={'/base/companies'} /> 
                </Route>
            </Switch>  
        </CompanyDetailsContext.Provider>    
    )
}

