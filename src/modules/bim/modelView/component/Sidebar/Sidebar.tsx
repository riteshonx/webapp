import React, { ReactElement, useState, useContext, useEffect } from 'react'
import Drawer from '@material-ui/core/Drawer';
import MenuIcon from '@material-ui/icons/Menu';
import AppsIcon from '@material-ui/icons/Apps';
import ListIcon from '@material-ui/icons/List';
import BimQuery from '../BimQuery/BimQuery';
import ScheduleForm from '../Scheduler/ScheduleForm/ScheduleForm';
import LevelForm from '../Level/LevelForm/LevelForm';
import SheetForm from '../Sheet/SheetForm/SheetForm';
import BimGalleryView from '../BimGalleryView/BimGalleryView';
import BimListView from '../BimListView/BimListView';
import ElementTable from '../ElementTable/ElementTable';
import './Sidebar.scss'
import { bimContext } from '../../../contextAPI/bimContext';
import { setSavedViewList, setActiveView, setIsActiveViewSaved, setActiveFilter, setActiveFilterList, setSpatialQueryStatus, setSystemViewList, setIsActiveViewSchedule, setIsActiveViewSystemCustom, setActiveGeometryName, setHighLightedElementId } from '../../../contextAPI/action';
import { Button, TextField, Tooltip } from '@material-ui/core';
import { projectFeatureAllowedRoles } from '../../../../../utils/role';
import { client } from '../../../../../services/graphql';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { FETCH_BIM_VIEW_BY_MODEL, FETCH_BIM_VIEW_BY_VIEW, DELETE_BIM_VIEW } from '../../../graphql/bimQuery';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { setIsLoading } from '../../../../root/context/authentication/action';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog/ConfirmDialog';
import Notification,{ AlertTypes } from '../../../../shared/components/Toaster/Toaster';
import { useBimQueryUpdater } from "../../../container/queryResultUpdaterHook"
import { createFilterList } from '../../../container/utils';

interface message {
    header: string,
    text: string,
    cancel: string,
    proceed: string,
}

const confirmDeleteMessage: message = {
    header: "Are You Sure?​",
    text: `This action will delete existing view`,
    cancel: "Cancel",
    proceed: "Yes"
}

export default function Sidebar(props: any): ReactElement {
    const [isNewView, setIsNewView] = useState(false);
    const [viewSearch,setViewSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [openQuery, setOpenQuery] = useState(false);
    const [openElementTable, setOpenElementTable] = useState(false);
    const [openElementTableViewId, setOpenElementTableViewId] = useState(null);
    const [resUpdateViewId, setResUpdateViewId] = useState<string | null>(null);
    const [resUpdateFilterSet, setResUpdateFilterSet] = useState<[] | null>(null);
    const [openSchedule, setOpenSchedule] = useState(false);
    const [openLevel, setOpenLevel] = useState(false);
    const [openSheet, setOpenSheet] = useState(false);
    const [savedGridView, setSavedGridView] = useState(true);
    const [systemGridView, setSystemGridView] = useState(true);
    const [openDeleteModel, setOpenDeleteModel] = useState(false);
    const [deleteViewIndex, setDeleteViewIndex] = useState(-1);
    const context: any = useContext(bimContext);
    const { dispatch, state }:any = useContext(stateContext);
    const viewer = context.state.viewer;

    useEffect(()=> {
        if(context.state.activeModel) {
            context.dispatch(setSavedViewList([]));
            // fetchSavedView();
        }
    }, [context.state.activeModel])

    useEffect(()=> {
        if(context.state.geometryLoaded) {
            fetchSavedView();
            // setSystemThumbnail();
        }
    }, [context.state.geometryLoaded])

    function toggleDrawerOpen () {
        (openSchedule) ? setOpenSchedule(false) : null;
        (openLevel) ? setOpenLevel(false) : null;
        (openSheet) ? setOpenSheet(false) : null;
        (open) ? setOpenQuery(false) : null;
        setOpen(!open);
        //props.resize();
    }

    async function fetchSavedView() {
        const data = await fetchData(FETCH_BIM_VIEW_BY_MODEL, {
            "modelId": context.state.activeModel
        }) 
        const canvas: any = document.getElementById("canvas");
        const lowQuality = canvas.toDataURL('image/jpeg', 0.05);
        const isSheetAvialable = context.state.geometryInfo.find((info: any) => info.name.includes('Sheet'));
        const newSystemViewList = isSheetAvialable ? [{id: '3dview', viewName: 'Home', viewThumbnail: lowQuality}, {id: 'sheet', viewName: 'By Sheet', viewType: 'Sheet', viewThumbnail: lowQuality}]
            : [{id: '3dview', viewName: 'Home', viewThumbnail: lowQuality}];
        if(data) {
            const savedViewList = data.bimView.filter((view: any) => !view.isSystemView && checkIsImportPermission(view.isImport));
            context.dispatch(setSavedViewList(savedViewList));
            const systemViewList = data.bimView.filter((view: any) => view.isSystemView && checkIsImportPermission(view.isImport));
            context.dispatch(setSystemViewList([...newSystemViewList, ...systemViewList]));
            context.dispatch(setActiveView('3dview'));
        } else {
            context.dispatch(setSystemViewList([...newSystemViewList]));
            context.dispatch(setActiveView('3dview'));
        }
    }

    const checkIsImportPermission = (isImported: boolean) => {
        return !isImported ||  
            (isImported && state.projectFeaturePermissons?.cancreateBimModel && state.projectFeaturePermissons?.canupdateBimModel)
    }

    // function setSystemThumbnail() {
    //     setTimeout(() => {
    //         const canvas: any = document.getElementById("canvas");
    //         const lowQuality = canvas.toDataURL('image/jpeg', 0.05);
    //         const isSheetAvialable = context.state.geometryInfo.find((info: any) => info.name.includes('Sheet'));
    //         const newSystemViewList = isSheetAvialable ? [{id: '3dview', viewName: 'Home', viewThumbnail: lowQuality}, {id: 'sheet', viewName: 'By Sheet', viewType: 'Sheet', viewThumbnail: lowQuality}]
    //             : [{id: '3dview', viewName: 'Home', viewThumbnail: lowQuality}];
    //         context.dispatch(setSystemViewList([...newSystemViewList, ...context.state.systemViewList]));
    //         context.dispatch(setActiveView('3dview'));
    //     }, 1000);
    // }

    async function setSavedSelectedView(id: string) {
        if (context.state.activeView === id) return;
        viewer?.unselect()
        context.dispatch(setHighLightedElementId(null));
        context.dispatch(setActiveView(id));
        context.dispatch(setIsActiveViewSaved(true));
        context.dispatch(setIsActiveViewSchedule(false));
        context.dispatch(setIsActiveViewSystemCustom(false));
        context.dispatch(setActiveFilter(null));
        context.dispatch(setSpatialQueryStatus(false));
        dispatch(setIsLoading(true));
        await setFilterList(id);
        context.dispatch(setActiveGeometryName('3D-Views'))
        dispatch(setIsLoading(false));
    }

    function setSystemSelectedView(id: string) {
        viewer?.unselect();
        context.dispatch(setHighLightedElementId(null));
        if(id !== "3dview") {
            context.dispatch(setActiveView(id));
            context.dispatch(setIsActiveViewSaved(false));
            context.dispatch(setIsActiveViewSystemCustom(true));
            const currViewDetails = context.state.systemViewList.find((view: any) => view.id === id)
            if(currViewDetails.viewType === 'Level') {
                setOpenLevel(true);
                context.dispatch(setIsActiveViewSchedule(false));
            } else if(currViewDetails.viewType === 'Sheet') {
                setOpenSheet(true);
                context.dispatch(setIsActiveViewSchedule(false));
            } else if(currViewDetails.viewType === 'Model') {
                context.dispatch(setIsActiveViewSchedule(false));
                setFilterList(currViewDetails.id);
            } else {
                setOpenSchedule(true);
                context.dispatch(setIsActiveViewSchedule(true));
            }
        } else {
            if (context.state.activeView === id) return;
            context.dispatch(setActiveView(id));
            context.state.activeGeometryName === '3D-Views' ? context.dispatch(setActiveFilterList([]))
                : context.dispatch(setActiveGeometryName('3D-Views'))
            context.dispatch(setIsActiveViewSaved(false));
            context.dispatch(setIsActiveViewSchedule(false));
            context.dispatch(setIsActiveViewSystemCustom(false));
            context.dispatch(setSpatialQueryStatus(false));
        }
    }

    async function setFilterList(id: string) {
        const data = await fetchData(FETCH_BIM_VIEW_BY_VIEW, {
            "id": id
        })
        if(data.bimView.length > 0 && data.bimView[0].bimViewFilterAssociations) {
            const filterSet = createFilterList(data.bimView[0].bimViewFilterAssociations);
            context.dispatch(setActiveFilterList(filterSet))
            if(data.bimView[0].isImport) {
                setResUpdateFilterSet(filterSet);
                setResUpdateViewId(id);
            }
        } else {
            context.dispatch(setActiveFilterList([]));
        }
    }

    function openQueryDialog(isNewQuery: boolean) {
        if(state.projectFeaturePermissons?.cancreateBimModel && state.projectFeaturePermissons?.canupdateBimModel ) {
            context.dispatch(setIsActiveViewSchedule(false));
            context.dispatch(setIsActiveViewSystemCustom(false));
            setIsNewView(isNewQuery)
            setOpenQuery(!openQuery)
            context.dispatch(setActiveGeometryName('3D-Views'))
        }
    }

    function setDeleteBimViewIndex(index: number) {
        setDeleteViewIndex(index)
        setOpenDeleteModel(true);
    }

    async function confirmDeleteBimView(event: any) {
        dispatch(setIsLoading(true));
        const viewId = context.state.savedViewList[deleteViewIndex].id;
        await updateQuery(DELETE_BIM_VIEW, {
            "viewId": viewId,
        }, projectFeatureAllowedRoles.updateBimModel)
        context.dispatch(setSavedViewList([...context.state.savedViewList.slice(0, deleteViewIndex), ...context.state.savedViewList.slice(deleteViewIndex + 1)]));
        if(viewId === context.state.activeView) {
            setSystemSelectedView("3dview");
        }
        setOpenDeleteModel(false);
        dispatch(setIsLoading(false));
    }

    const fetchData = async (query: any, variables: any) => {
        let responseData;
        try {
            responseData = await client.query({
                query: query,
                variables: variables,
                fetchPolicy:'network-only',
                context:{role: projectFeatureAllowedRoles.viewBimModel, token: state.selectedProjectToken}
            });
            
        } catch(error: any) {
            console.log(error)
        } finally {
            return (responseData?.data) ? responseData.data : null;
        }
    }

    const updateQuery = async (query: any, variable: any, role: any) => {
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
            Notification.sendNotification('Some error occured on Delete view', AlertTypes.error);
        } finally {
            return (responseData?.data) ? responseData.data : null;
        }
    }

    const handleSearchChange = (event: any) => {
        setViewSearch(event.target.value)
    }

    const handleBackNav = () => {
        setOpen(false); 
        setOpenQuery(false)
        props.backNavigation();
    }

    const openElmntTable = (id: any) => {
        setOpenElementTableViewId(id); 
        setOpenElementTable(true);
    }

    return (
        <div className={'bimSideBar'}>
            {useBimQueryUpdater(resUpdateViewId, resUpdateFilterSet)}
            <div className={`menuIcons ${open && ' open'}`} >
                {context.state.geometryLoaded ?
                    !open ? 
                        <Tooltip title="Open Views" aria-label="Open Views">
                            <MenuIcon onClick={toggleDrawerOpen} fontSize={'small'} className='menuButton'/> 
                        </Tooltip>
                        : <Tooltip title="Close Views" aria-label="Close Views">
                            <MenuIcon className='menuButton' fontSize={'small'} onClick={toggleDrawerOpen} /> 
                        </Tooltip>
                    : null 
                }
                {/* {!openSchedule && !openQuery && !openLevel  && !openSheet && <div>
                    <Tooltip title={props.backNavDescp || ''} aria-label={props.backNavDescp || ''}>
                        <ArrowBackIosIcon onClick={handleBackNav} viewBox={"-4 0 24 24"} fontSize={'small'} className='menuButton'/>
                    </Tooltip>
                </div>} */}
            </div>
            { openSheet && <SheetForm  showSheetWindw={setOpenSheet}/> }
            { openLevel && <LevelForm  showLevelWindw={setOpenLevel}/> }
            { openSchedule && <ScheduleForm  showScheduleWindw={setOpenSchedule}/> }
            { openQuery && <BimQuery isNewView={isNewView} showQueryWindw={setOpenQuery}/> }
            { !openQuery && !openSchedule && !openLevel  && !openSheet && <div className={'sideBar ' + (open? 'open' : '')}>
                    <Drawer variant="persistent" open={open} className={'bimDrawer ' + (open? 'bimDrawerOpen' : 'bimDrawerClose')}>
                        {(state.projectFeaturePermissons?.cancreateBimModel && state.projectFeaturePermissons?.canupdateBimModel) ?
                            <Tooltip title={'View can be created/edited by selecting multiple elements (using shift key) and right click from viewport'}>
                                <Button onClick={() => openQueryDialog(true)} className="btn-primary AddNewViewBtn">Add a New View</Button>
                            </Tooltip>
                        : null }
                        <div className="displyFlex blodText1">
                            Views
                        </div>
                        <TextField
                            onChange={handleSearchChange}
                            size={"small"}
                            placeholder={"Search"}
                            value={viewSearch}
                            fullWidth={true} 
                            variant="outlined"
                            onKeyDown={(e: any) => {
                                e.stopPropagation()
                            }}
                        />
                        <div className="displyFlex blodText2">
                            Saved Views
                            <div>
                                <Tooltip title="List view" aria-label="List view"><ListIcon onClick={() => setSavedGridView(false)} color={(savedGridView? 'disabled' : 'inherit')} /></Tooltip>
                                <Tooltip title="Grid view" aria-label="Grid view"><AppsIcon onClick={() => setSavedGridView(true)} viewBox='-5 0 32 24' color={(!savedGridView? 'disabled' : 'inherit')}/></Tooltip>
                            </div>
                        </div>
                        {(savedGridView) ? <BimGalleryView openElementTable={openElmntTable} items={context.state.savedViewList} showEditOptn={true} onDobleClick={openQueryDialog} selectedItem={context.state.activeView} setSelected={setSavedSelectedView} onDelete={setDeleteBimViewIndex} search={viewSearch}/> 
                            : <BimListView openElementTable={openElmntTable} items={context.state.savedViewList} showEditOptn={true} onDobleClick={openQueryDialog} selectedItem={context.state.activeView} setSelected={setSavedSelectedView} onDelete={setDeleteBimViewIndex} search={viewSearch}/>}
                        <div className="displyFlex blodText2">
                            System Views
                            <div>
                                <Tooltip title="List view" aria-label="List view"><ListIcon onClick={() => setSystemGridView(false)} color={(systemGridView? 'disabled' : 'inherit')} /></Tooltip>
                                <Tooltip title="Grid view" aria-label="Grid view"><AppsIcon onClick={() => setSystemGridView(true)} viewBox='-5 0 32 24' color={(!systemGridView? 'disabled' : 'inherit')}/></Tooltip>
                            </div>
                        </div>
                        {(systemGridView) ? <BimGalleryView openElementTable={openElmntTable} items={context.state.systemViewList} selectedItem={context.state.activeView}  setSelected={setSystemSelectedView} /> 
                            : <BimListView openElementTable={openElmntTable} items={context.state.systemViewList} selectedItem={context.state.activeView}  setSelected={setSystemSelectedView} /> }
                    </Drawer>
                </div>
            }
            <ElementTable id={openElementTableViewId} open={openElementTable} handleClose={() => setOpenElementTable(false)} />
            <ConfirmDialog open={openDeleteModel} message={confirmDeleteMessage} close={() => setOpenDeleteModel(false)} proceed={confirmDeleteBimView} />
        </div>
    )
}
