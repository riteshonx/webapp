import React, { ReactElement, useContext, useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import './DrawingAction.scss';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
// import GetAppIcon from '@material-ui/icons/GetApp';
import TuneOutlinedIcon from '@material-ui/icons/TuneOutlined';
import AppsIcon from '@material-ui/icons/Apps';
import ViewListIcon from '@material-ui/icons/ViewList';
import Tooltip from '@material-ui/core/Tooltip';
import { match, useHistory, useRouteMatch } from 'react-router-dom';
import { DrawingLibDetailsContext } from '../../context/DrawingLibDetailsContext';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog/ConfirmDialog';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { setConfirmBoxStatus, setFilterDrawingList, setSelectedFilterData } from '../../context/DrawingLibDetailsAction';
import { Badge } from '@material-ui/core';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

export interface Params {
    projectId: string;
}
interface message {
    header: string,
    text: string,
    cancel: string,
    proceed: string
}

const confirmMessage: message = {
    header: "Are you sure?",
    text: `If you delete these, all data related to these drawings will be lost.`,
    cancel: "Cancel",
    proceed: "Confirm",
}
  

export default function DrawingAction(props: any): ReactElement {
    
    const history = useHistory();
    const { state }: any = useContext(stateContext);
    const pathMatch:match<Params>= useRouteMatch();
    const [viewType, setViewType] = useState('list');
    const [enableIcons, setEnableIcons] = useState<boolean>(false);
    const {DrawingLibDetailsState, DrawingLibDetailsDispatch}: any = useContext(DrawingLibDetailsContext);
    const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
    const [isClearBtnEnable, setIsClearBtnEnable] = useState<boolean>(false)
    const [filterCount, setFilterCount] = useState(0)
    const [currentDrawings, setCurrentDrawings] = useState<boolean>(true)

    useEffect(() => {
        if(pathMatch.path.includes('/drawings/projects/') && pathMatch.path.includes('/lists') && state.selectedProjectToken){
            const sessionData: any = sessionStorage.getItem('drawing_filters');
            if(sessionData){
                handleFilterBar();
            }
        }
        const currentDrawingFromStore = sessionStorage.getItem('currentVesrionDrawings')
        if(currentDrawingFromStore && currentDrawingFromStore == 'n') {
                setCurrentDrawings(false);
        }
    }, [state.selectedProjectToken])

    useEffect(() => {
       if(DrawingLibDetailsState?.drawingsLists.length > 0){
            const isSelected = DrawingLibDetailsState?.drawingsLists.filter((item: any) => item.isPartOf);
            if(isSelected?.length > 0){
                setEnableIcons(true);
            }else{
                setEnableIcons(false);
            }
       }else{
        setEnableIcons(false);
       }
    }, [DrawingLibDetailsState?.drawingsLists]);

    useEffect(() => {
        if(DrawingLibDetailsState.isConfirmOpen){
          handleConfirmBoxClose();
        }
      }, [DrawingLibDetailsState.isConfirmOpen])

    useEffect(() => {
    if(DrawingLibDetailsState.selectedFilterData){
        filerCount()
    }
    }, [DrawingLibDetailsState.selectedFilterData]);

    const filerCount = () => {
        let count: any = 0
        if(DrawingLibDetailsState?.selectedFilterData?.drawingCategories?.length > 0){
            count = count + 1;
        }
        if(DrawingLibDetailsState?.selectedFilterData?.versionName?.length > 0){
            count = count + 1;
        }
        if(DrawingLibDetailsState?.selectedFilterData?.versionDate?.length > 0){
            count = count + 1;
        }
        // if(DrawingLibDetailsState?.selectedFilterData?.versionStartDate && DrawingLibDetailsState?.selectedFilterData?.versionEndDate ){
        //     count = count + 1;
        // }
        if(DrawingLibDetailsState?.selectedFilterData?.drawingRevision?.length > 0){
            count = count + 1;
        }

        setFilterCount(count)
    }


    const toggleView = (type: string) => {
        setViewType(type)
        props.viewType(type)
    }

    const openDrawingsLibrary = () => {
        history.push(`/drawings/projects/${pathMatch.params.projectId}/drawing-management`);     
    }

    const handleSearchChange = (value:string) => {
        props.searchTask(value);
    }

    const handleMultiDelete = () => {
        DrawingLibDetailsDispatch(setConfirmBoxStatus(false));
        setConfirmOpen(true);
    }
    
    const handleConfirmBoxClose = () => {
        setConfirmOpen(false);
    }

    const deleteFileDoc = () => {
        props.multiDelete();
    }

    const handleMultiDownload = () => {
        props.multiDownload()
    }

    const handleFilterBar = () => {
        setIsClearBtnEnable(true)
        props.isFilterOpen(true)
    }

    const clearFilterBar = () => {
       clearFilter();
    }

    const clearFilter= async () =>{
        const initialValues = {
            versionName: [],
            versionDate: [],
            drawingCategories: [],
            drawingRevision: []
        }

        await sessionStorage.removeItem("drawing_filters");
        await DrawingLibDetailsDispatch(setFilterDrawingList([]));
        await DrawingLibDetailsDispatch(setSelectedFilterData({...initialValues}));

        await setIsClearBtnEnable(false)
        await props.isFilterOpen(false)
    }

    const handleCurrentDrawings = () => {
        const targetCurrentDrawing = !currentDrawings;
        setCurrentDrawings(targetCurrentDrawing);
        sessionStorage.setItem('currentVesrionDrawings', targetCurrentDrawing? 'y': 'n' );
        props.filter();
    }
    
    return (
        <>
            <div className="drawings-action">
                <div className="drawings-action__middle">
                    {/* <Button
                        data-testid={'activity'}
                        variant="outlined"
                        className="toggle-primary"
                        disabled={true}
                    >
                        Activity
                    </Button> */}
                    <div className="drawings-action__middle__search">
                        <TextField
                            value={props.searchText}
                            id="drawings-lists-search-text"
                            type="text"
                            fullWidth
                            placeholder="Search"
                            autoComplete="search"
                            variant="outlined"
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                        <SearchIcon className="drawings-action__middle__search__icon"/>
                        {
                            DrawingLibDetailsState?.drawingsLists && props?.totalCount > 0 && (
                                <div className="drawings-action__middle__count">
                                    Showing {DrawingLibDetailsState?.drawingsLists?.length} entries out of {props?.totalCount}
                                </div>
                            )
                        }
                       
                    </div>
                    {/*  commented code is required for 1.1 */}
                    <div className="drawings-action__middle__icon">
                        <Tooltip title={'List View'} aria-label="first name">
                            <label>
                                <IconButton color="primary" aria-label="list-view" onClick={() => toggleView('list')}>
                                    <ViewListIcon  className={viewType === 'gallery' ? 'inactive' : ''}/>
                                </IconButton>
                            </label>
                        </Tooltip>
                    </div>
                    <div className="drawings-action__middle__icon">
                        <Tooltip title={'Gallery View'} aria-label="first name">
                            <label>
                                <IconButton color="primary" aria-label="grid-view" onClick={() => toggleView('gallery')}>
                                    <AppsIcon className={viewType === 'list' ? 'inactive' : ''}/>
                                </IconButton>
                            </label>
                        </Tooltip>
                    </div>
                    <div className="drawings-action__middle__icon">
                        {
                            !isClearBtnEnable ? 
                            (
                            <Tooltip title={'Filter'} aria-label="first name">
                                    <label>
                                        <IconButton disabled={false} color="primary" aria-label="filter" onClick={handleFilterBar}>
                                            <TuneOutlinedIcon className={isClearBtnEnable ? 'filter-icon' : ''} />
                                        </IconButton>
                                        </label>
                                </Tooltip>
                            ) :
                            (
                                <Badge badgeContent={filterCount} color="primary">
                                    <Button
                                        data-testid={'clear-filter'}
                                        variant="outlined"
                                        className="btn btn-secondary"
                                        onClick={clearFilterBar}
                                        size='small'
                                    >
                                        Clear Filter
                                    </Button>
                                </Badge>
                            )
                        }
                    </div>
                    <div className="drawings-action__middle__icon">
                        <FormControlLabel
                            className="drawings-action__middle__icon__currentDrawings"
                            control={<Checkbox color="default" 
                            checked={currentDrawings} 
                            onChange={handleCurrentDrawings} 
                            size={"small"} name="Current Drawings" />}
                            label="Current Drawings"
                        />
                </div>
                </div>
                <div className="drawings-action__right">
                    {
                        viewType === 'list' && (
                            <>
                                {
                                    state?.projectFeaturePermissons?.candeleteDrawings && (
                                        <div className="drawings-action__right__icon">
                                            <Tooltip title={'Delete'} aria-label="first name">
                                                <label>
                                                    <IconButton color="primary" aria-label="delete" disabled={!enableIcons} 
                                                                onClick={handleMultiDelete}>
                                                        <DeleteIcon className={enableIcons ? '': 'disable-icon'} />
                                                    </IconButton>
                                                </label>
                                            </Tooltip>
                                        </div>
                                    )
                                }

                            </>
                        )
                    }
                    {
                        state?.projectFeaturePermissons?.canuploadDrawings && (
                            <Button
                                data-testid={'drawing-library'}
                                variant="outlined"
                                className="btn-primary"
                                onClick={openDrawingsLibrary}
                            >
                                Drawing Management
                            </Button>
                         )
                    }
                </div>
            </div>
        
            {
                confirmOpen ? (
                    <ConfirmDialog open={confirmOpen} message={confirmMessage} 
                    close={handleConfirmBoxClose} proceed={deleteFileDoc} />
                ) : ('')
            }
        </>
    )
}