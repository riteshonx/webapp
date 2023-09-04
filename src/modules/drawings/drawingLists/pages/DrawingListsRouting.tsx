import React, { lazy, ReactElement, useReducer } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { DrawingLibDetailsContext } from '../context/DrawingLibDetailsContext';
import { DrawingLibDetailsInitialState, DrawingLibDetailsReducer } from '../context/DrawingLibDetailsReducer';

const DrawingLists = lazy(() => import( './DrawingsLanding/DrawingsLanding'));
const DrawingLibrary = lazy(() => import( './DrawingsLibrary/DrawingsLibrary'));
const DrawingReview = lazy(() => import( './DrawingReview/DrawingReview'));
const DrawingSheetViewer = lazy(() => import( './DrawingSheetViewer/DrawingSheetViewer'));
const CustomTemplateLists = lazy(() => import( './CustomTemplateLists/CustomTemplateLists'));
const CreateCustomTemplate = lazy(() => import( './CreateCustomTemplate/CreateCustomTemplate'));


export default function DrawingListsRouting(): ReactElement {
    const [DrawingLibDetailsState, DrawingLibDetailsDispatch] = useReducer(DrawingLibDetailsReducer, DrawingLibDetailsInitialState);

    return (
        <DrawingLibDetailsContext.Provider value = {{DrawingLibDetailsState, DrawingLibDetailsDispatch}} >
            <Switch>
                <Route path={'/drawings/projects/:projectId/create-custom-template'} component={CreateCustomTemplate}></Route>
                <Route path={'/drawings/projects/:projectId/update-custom-template/:templateId'} component={CreateCustomTemplate}></Route>
                <Route path={'/drawings/projects/:projectId/custom-template-lists'} component={CustomTemplateLists}></Route>
                <Route path={'/drawings/projects/:projectId/pdf-viewer/:drawingId'} component={DrawingSheetViewer}></Route>
                <Route path={'/drawings/projects/:projectId/review/:documentId'} component={DrawingReview}></Route>
                <Route path={'/drawings/projects/:projectId/drawing-management'} component={DrawingLibrary}></Route>
                <Route exact path={'/drawings/projects/:projectId/lists'} component={DrawingLists}></Route> 
                <Route path="*">
                    <Redirect to={'/drawings/projects/:projectId/lists'} /> 
                </Route>
            </Switch>   
        </DrawingLibDetailsContext.Provider>    
    )
}
