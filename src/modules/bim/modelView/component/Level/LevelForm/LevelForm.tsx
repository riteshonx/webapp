import React, { useContext, useState, useEffect } from 'react';
import './LevelForm.scss'
import { projectFeatureAllowedRoles } from '../../../../../../utils/role';
import { stateContext } from '../../../../../root/context/authentication/authContext';
import { client } from '../../../../../../services/graphql'
import { bimContext } from '../../../../contextAPI/bimContext';
import {setActiveFilterTask, setActiveFilterTaskFilters, setSavedViewList, setSystemViewList, setUpdateFilter } from '../../../../contextAPI/action';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { setIsLoading } from '../../../../../root/context/authentication/action';
import { UPDATE_BIM_VIEW } from '../../../../graphql/bimQuery';
import Notification, { AlertTypes } from '../../../../../shared/components/Toaster/Toaster';
import Tooltip from '@material-ui/core/Tooltip';
import LevelTree from "../LevelTree/LevelTree"

export default function LevelForm(props: any) {
    const { dispatch, state }:any = useContext(stateContext);
    const context: any = useContext(bimContext);
    const [viewDetails, setViewDetails] = useState<any>({
        id: (Math.random() + 1).toString(36).substring(7),
        viewName:  "",
        ghostExcluded:  true,
        filterId: []
    });

    useEffect(() => {
        fetchViewDetails();
        return () => {
            context.dispatch(setActiveFilterTask(null));
            context.dispatch(setActiveFilterTaskFilters([]));
        }
    }, []);

    function fetchViewDetails() {
        const viewList =  context.state.isActiveViewSystemCustom ? context.state.systemViewList : context.state.savedViewList;
        const currViewDetails = viewList.find((view: any) => view.id === context.state.activeView)
        setViewDetails(currViewDetails)
    }

    async function updateSavedViewList(newViewDetails: any) {
        dispatch(setIsLoading(true));
        const data = await createViewModel(UPDATE_BIM_VIEW, {
            "id": newViewDetails.id ,
            "fields": {
                "viewName": newViewDetails.viewName,
                "ghostExcluded": newViewDetails.ghostExcluded
            }
        }, projectFeatureAllowedRoles.updateBimModel)
        if(data) {
            const viewList =  context.state.isActiveViewSystemCustom ? context.state.systemViewList : context.state.savedViewList;
            const currViewIndex = viewList.findIndex((view: any) => view.id === context.state.activeView)
            const updatedList = [...viewList.slice(0, currViewIndex), 
                newViewDetails, 
                ...viewList.slice(currViewIndex + 1)
            ]
            context.state.isActiveViewSystemCustom ? context.dispatch(setSystemViewList(updatedList)) : context.dispatch(setSavedViewList(updatedList));
            if(viewList[currViewIndex].ghostExcluded !== newViewDetails.ghostExcluded) {
                context.dispatch(setUpdateFilter(context.state.updateFilter + 1))
            }
        }
        dispatch(setIsLoading(false));
    }

    const createViewModel = async (query: any, variable: any, role: any) => {
        let responseData;
        try {
            responseData = await client.mutate({
                mutation: query,
                variables: variable,
                context: { role: role, token: state.selectedProjectToken}
            })
            return responseData.data;
        } catch (error: any) {
            console.log(error.message);
            Notification.sendNotification('Some error occured on create/update View', AlertTypes.error);
        } finally {
            return (responseData?.data) ? responseData.data : null;
        }
    }

    function handleGhostChange(event: any, value: any) {
        setViewDetails({...viewDetails, ghostExcluded: value})
        updateSavedViewList({...viewDetails, ghostExcluded: value});
    }

    return (
      <div className="bimLevelFormContainer">
        <div className="bimLevelForm">
          <div className="levelBody">
            <div className="heading blodText1">
              <Tooltip title="Back to Views" aria-label="Back to Views">
                <span
                  className="backButton"
                  onClick={() => props.showLevelWindw(false)}
                >
                  Views
                </span>
              </Tooltip>
              <ArrowForwardIosIcon
                viewBox={'-4 0 24 24'}
                fontSize={'small'}
                className="menuButton"
              />
              By Level
            </div>
            <FormControlLabel
              className={'checkbox'}
              control={
                <Checkbox
                  color="default"
                  checked={viewDetails?.ghostExcluded}
                  onChange={handleGhostChange}
                  size='small'
                  name="ghostExcluded"
                />
              }
              label="Ghost Excluded"
            />
            <LevelTree />
          </div>
        </div>
      </div>
    );
}
