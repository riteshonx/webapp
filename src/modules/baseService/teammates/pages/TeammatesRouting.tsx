import React, { lazy, ReactElement, useEffect, useReducer } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
// import { resetProjectDetails, setProjecDetailsView } from '../Context/ProjectDetailsActions';
import {teammatesContext} from '../context/TeammatesContext';
import { teammatesInitialState, teammatesReducer } from '../context/TeammatesReducer';
const Teammates = lazy(() => import( './TeammatesLanding/teammatesLanding'));
// const AddNewTeammate = lazy(() => import('./AddTeammates/addNewTeammate'))
// const ProjectSettings = lazy(() => import( './ProjectSettings/ProjectSettings'));

export default function TeammatesRouting(): ReactElement {
    const [teammatesState, teammatesDispatch] = useReducer(teammatesReducer, teammatesInitialState);

    return (
        <teammatesContext.Provider value = {{teammatesState, teammatesDispatch}} >
            <Switch>
                <Route exact path={'/base/teammates/lists'} component={Teammates}></Route> 
                {/* <Route exact path={'/base/teammates/invite'} component={AddNewTeammate}/> */}
                <Route path="*">
                    <Redirect to={'/base/teammates/lists'} /> 
                </Route>
            </Switch>  
        </teammatesContext.Provider>
    )
}
