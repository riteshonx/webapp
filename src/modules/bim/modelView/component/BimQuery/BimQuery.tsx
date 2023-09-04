import React, { useState, useEffect, useContext, useRef } from 'react';
import './BimQuery.scss'
import { Close } from "@material-ui/icons";
import QueryList from '../QueryList/QueryList';
import BimFilter from '../BimFilter/BimFilter';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import Tooltip from '@material-ui/core/Tooltip';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { setSavedViewList, setActiveView, setIsActiveViewSaved, setUpdateFilter, setSystemViewList, setActiveFilterList } from '../../../contextAPI/action';
import { bimContext } from '../../../contextAPI/bimContext';
import { projectFeatureAllowedRoles } from '../../../../../utils/role';
import Notification, { AlertTypes } from '../../../../shared/components/Toaster/Toaster';
import { client } from '../../../../../services/graphql';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { CHECK_VIEW_NAME_DUPLICATE, INSERT_BIM_VIEW, UPDATE_BIM_VIEW } from '../../../graphql/bimQuery';
import { setIsLoading } from '../../../../root/context/authentication/action';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import { viewNameMapping } from '../../../constants/query'

export default function BimQuery(props: any) {
    const [showQueryList, setShowQueryList] = useState(false);
    const [isNewView, setIsNewView] = useState(props.isNewView);
    const [isEditViewName, setIsEditViewName] = useState(props.isNewView);
    const [isEditFilterName, setIsEditFilterName] = useState(false);
    const [viewDetails, setViewDetails] = useState<any>({
        id: (Math.random() + 1).toString(36).substring(7),
        viewName:  "",
        ghostExcluded:  true,
        filterId: []
    });
    const context: any = useContext(bimContext);
    const { dispatch, state }:any = useContext(stateContext);
    const mountedRef = useRef(false);
    const [viewNameError,setViewNameError] = useState("");

    const { viewName } = viewDetails || '';

    useEffect(()=>{
        setViewNameError("")
    },[setViewNameError,viewName])

    useEffect(()=>{
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        }
    },[]);
    
    useEffect(()=> {
        if(!isNewView) {
            fetchViewDetails()
        }
    }, [context.state.activeView])

    useEffect(()=> {
        if(!context.state.isActiveViewSaved && !context.state.isActiveViewSchedule && !props.isNewView) {
            props.showQueryWindw(false)
        }
    }, [context.state.isActiveViewSaved])

    function fetchViewDetails() {
        const viewList =  context.state.isActiveViewSystemCustom ? context.state.systemViewList : context.state.savedViewList;
        const currViewDetails = viewList.find((view: any) => view.id === context.state.activeView)
        setViewDetails(currViewDetails)
    }

    async function onViewNameBlur(event: any) {
        if(!mountedRef.current){
            return
        }
        if(viewDetails.viewName === '') {
            setViewNameError('View name cannot be blank');
            event.target.focus();
            return;
        } 
        const viewNameUnique = await checkNameDuplication(viewDetails.viewName);
        if(!viewNameUnique){
            setViewNameError('View name already exists');
            event.target.focus();
            return;
        }
        setIsEditViewName(false)
        if(isNewView) {
            dispatch(setIsLoading(true));
            const data = await createViewModel(INSERT_BIM_VIEW, {
                "modelId": context.state.activeModel ,
                "viewName": viewDetails.viewName,
                "ghostExcluded": viewDetails.ghostExcluded
            }, projectFeatureAllowedRoles.createBimModel)
            if(data) {
                const newId = data.insert_bimView.returning[0].id;
                setViewDetails({...viewDetails, id: newId })
                context.dispatch(setSavedViewList([{
                    ...viewDetails,
                    id: newId
                }, ...context.state.savedViewList]));
                context.dispatch(setIsActiveViewSaved(true));
                context.dispatch(setActiveView(newId));
                context.dispatch(setActiveFilterList([]))
                setIsNewView(false);
            }
            dispatch(setIsLoading(false));
        } else {
            updateSavedViewList(viewDetails);
        }
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

    const checkNameDuplication = async (name: string) => {
        let responseData;
        try {
            responseData = await client.query({
                query: CHECK_VIEW_NAME_DUPLICATE,
                variables: {
                    "name": name,
                    "modelId": context.state.activeModel,
                    "viewId": isNewView ? undefined : viewDetails.id
                },
                fetchPolicy:'network-only',
                context:{role: projectFeatureAllowedRoles.viewBimModel, token: state.selectedProjectToken}
            });
        } catch(error: any) {
            console.log(error)
        }finally{
            if(responseData?.data){
                const length = responseData?.data?.bimView?.length;
                if(length === 0){
                    return true
                }
            }
            return false;
        }
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

    function handleViewNameChange(event: any) {
        setViewDetails({...viewDetails, viewName: event.target.value})
    }

    function handleGhostChange(event: any, value: any) {
        setViewDetails({...viewDetails, ghostExcluded: value})
        updateSavedViewList({...viewDetails, ghostExcluded: value});
    }

    const delayedBlurHandler = (event:any) => {
        setTimeout(()=>{
            onViewNameBlur(event)
        },200)
    }

    return (
        <div className="bimQuery">
            {!showQueryList ? 
                <>
                    <div className={`queryBody ${isEditViewName && ' onViewNameEdit'} ${isEditFilterName && ' onFilterNameEdit' }` }>
                        {isEditViewName ?
                            <>
                                <TextField
                                    onKeyDown={(e: any) => {
                                        e.stopPropagation();
                                        if (e.key === "Enter") {
                                            onViewNameBlur(e);
                                        }
                                    }}
                                    onBlur={delayedBlurHandler}
                                    onChange={handleViewNameChange}
                                    autoFocus={isEditViewName}
                                    className="heading textBox"
                                    size={"small"}
                                    placeholder={"Add new view"}
                                    value={viewDetails.viewName}
                                    required={true} fullWidth={true} variant="outlined"
                                    InputProps={{
                                        endAdornment: (
                                            <Tooltip title={props.backToolTipMsg || "Back to Views"} aria-label={props.backToolTipMsg || "Back to Views"}>
                                                <Close onClick={() => props.showQueryWindw(false)} className='bimCloseButton' />
                                            </Tooltip>
                                        ),
                                    }}
                                />
                                <div className="view-error">{viewNameError}</div>
                            </>: 
                            <div className="heading blodText1" >
                                <Tooltip title={props.backToolTipMsg || "Back to Views"} aria-label={props.backToolTipMsg || "Back to Views"}>
                                    <span className="backButton" onClick={() => props.showQueryWindw(false)} >Views</span>
                                </Tooltip>
                                <ArrowForwardIosIcon viewBox={"-4 0 24 24"} fontSize={'small'} className='menuButton'/>
                                <span onClick={() => !context.state.isActiveViewSystemCustom && setIsEditViewName(true)} >
                                    {viewNameMapping[viewDetails?.viewName] || viewDetails?.viewName }
                                </span>
                            </div>
                        }
                        <FormControlLabel
                            className={"checkbox"}
                            control={<Checkbox color="default" checked={viewDetails?.ghostExcluded} onChange={handleGhostChange} size={"small"} name="ghostExcluded" />}
                            label="Ghost Excluded"
                        />
                        {!isNewView && <BimFilter onFilterNameEdit={setIsEditFilterName} showQueryList={() => setShowQueryList(true)}/> }
                    </div>
                </>
            : <QueryList backNavigation={() => {setShowQueryList(false)}} />  }
        </div>
    );
}