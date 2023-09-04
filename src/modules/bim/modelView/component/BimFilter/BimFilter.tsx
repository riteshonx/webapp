import React, { useState, useEffect, useContext } from 'react';
import './BimFilter.scss'
import { Button, Tooltip } from '@material-ui/core';
import { filterType } from '../../../constants/query'
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import DeleteIcon from '@material-ui/icons/Delete';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import TextField from '@material-ui/core/TextField';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog/ConfirmDialog';
import { bimContext } from '../../../contextAPI/bimContext';
import { hexToRgb, rgbToHex } from '../../../container/utils';
import { setActiveFilter, setActiveFilterList, setActiveFilterTaskFilters, setSkipUpdateFilter} from '../../../contextAPI/action';
import QueryView from '../QueryView/QueryView';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import { setIsLoading } from '../../../../root/context/authentication/action';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { UPDATE_BIM_FILTER } from '../../../graphql/bimQuery';
import { projectFeatureAllowedRoles } from '../../../../../utils/role';
import Notification,{ AlertTypes } from '../../../../shared/components/Toaster/Toaster';
import { client } from '../../../../../services/graphql';
import BimAutomation from './BimAutomation/BimAutomation';
import { FETCH_SPATIAL_PROPS_BY_ID_LIST } from '../../../graphql/bimQuery';

interface message {
    header: string,
    text: string,
    cancel: string,
    proceed: string,
}

const confirmDeleteMessage: message = {
    header: "Are You Sure?​",
    text: `This action will delete existing Filter from view`,
    cancel: "Cancel",
    proceed: "Yes"
}

export default function BimFilter(props: any) {

    const [updateFilterIndex, setUpdateFilterIndex] = useState(-1);
    const [updateFilterName, setUpdateFilterName] = useState('');
    const [showFilterIndex, setShowFilterIndex] = useState(-1);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [deleteFilterIndex, setDeleteFilterIndex] = useState(-1);
    const [isEditFilterName, setIsEditFilterName] = useState(false);
    const [updateColor, setUpdateColor] = useState("");
    const context: any = useContext(bimContext);
    const { dispatch, state }:any = useContext(stateContext);
    const [showAutomation, setShowAutomation] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState("");
    
    useEffect(()=> {
        addColorChangeListner();        
        return () => {
            const colorPicker =  document.querySelectorAll("#colorPicker");
            if(colorPicker) {
                colorPicker.forEach(elem => { 
                    elem.removeEventListener("change", onColorBlur)
                });
            }
        };
    }, [context.state.activeFilterList])
    
    
    function addFilter() {
        const id = (Math.random() + 1).toString(36).substring(7)
        context.dispatch(setSkipUpdateFilter(true))
        context.state.isActiveViewSchedule && context.dispatch(setActiveFilterTaskFilters([...context.state.activeFilterTaskFilters, id]))
        context.dispatch(setActiveFilterList([...context.state.activeFilterList, {
            id: id,
            title: getNewFilterName(context.state.activeFilterList.length + 1),
            color: hexToRgb("#EEEEEE"),
            queryIds: null,
            handleIds: [],
            isNewFilter: true,
            queryParams: [],
            queryName: '',
            hidden: false
        }]))
    }

    async function updateFilter(filter: filterType, index: number) {
        dispatch(setIsLoading(true));
        if(!filter.isNewFilter) {
            await updateFilterDetails(UPDATE_BIM_FILTER, {
                "viewId": context.state.activeView,
                "filterId": filter.id ,
                "colours": filter.color,
                "filterName": filter.title,
                "delete": "false",
                "modelId": context.state.activeModel
            }, projectFeatureAllowedRoles.updateBimModel)
        } else {
            context.dispatch(setSkipUpdateFilter(true))
        }
        context.dispatch(setActiveFilterList([...context.state.activeFilterList.slice(0, index), filter, ...context.state.activeFilterList.slice(index + 1)]));
        dispatch(setIsLoading(false));
    }

    function setAutomationEnable(val: any)
    {
        const matchAttributes = ["categoryName"];
        const matchValues = ["Curtain Wall Mullions", "OST_CurtainWallMullions"];

        const queryParams = val.queryParams
            .map((item:any)=>{
                return matchAttributes.includes(item.attribute) && item.values
            })
            .filter((item: any, i: number, ar: any) => item && ar.indexOf(item) === i);
        
        return queryParams.some((item: any) => matchValues.includes(item));
    }

    async function deleteFilter() {
        dispatch(setIsLoading(true));
        setUpdateFilterIndex(-1)
        
        setTimeout(async () => {
            const filter = context.state.activeFilterList[deleteFilterIndex];
            if(!filter.isNewFilter) {
                await updateFilterDetails(UPDATE_BIM_FILTER, {
                    "viewId": context.state.activeView,
                    "filterId": filter.id ,
                    "colours": filter.color,
                    "filterName": filter.title,
                    "delete": "true",
                    "modelId": context.state.activeModel
                }, projectFeatureAllowedRoles.updateBimModel)
            } else {
                context.dispatch(setSkipUpdateFilter(true))
            }
            context.dispatch(setActiveFilterList([...context.state.activeFilterList.slice(0, deleteFilterIndex), ...context.state.activeFilterList.slice(deleteFilterIndex + 1)]));
            setOpenDeleteModal(false);
            setShowAutomation(false)
            dispatch(setIsLoading(false));
        }, 1000);
    }

    function addColorChangeListner() {
        const colorPicker =  document.querySelectorAll("#colorPicker");
        if(colorPicker) {
            colorPicker.forEach(elem => { 
                elem.addEventListener("change", onColorBlur, false)
            });
        }
    }

    function changeColor(index: number, value: any) {
        setUpdateFilterIndex(index)
        setUpdateColor(value)
    }

    function onColorBlur(event: any) {
        const index = parseInt(event.target.getAttribute("data-id"));
        const filter = context.state.activeFilterList[index];
        if( filter && rgbToHex(filter.color) != event.target.value) {
            filter.color = hexToRgb(event.target.value);
            updateFilter(filter, index)
        }
        setUpdateFilterIndex(-1)
    }

    function onFilterNameBlur(event: any ) {
        if (updateFilterName === '' || isDuplicateFilter(updateFilterName, updateFilterIndex)) {
            event.target.focus();
            Notification.sendNotification(updateFilterName === '' ? 'Filter name cannot be blank' : 'Filter name already exists', AlertTypes.error);
            return;
        } 
        setIsEditFilterName(false)
        props.onFilterNameEdit(false);
        const filter = context.state.activeFilterList[updateFilterIndex];
        if(updateFilterName !== filter.title) {
            filter.title = updateFilterName;
            updateFilter(filter, updateFilterIndex)
        }
        setUpdateFilterIndex(-1)
    }

    const isDuplicateFilter = (filterName: any, updateFilterIndex: number) => {
        return context.state.activeFilterList.find((filterData: any, index: number) => {
            return filterData.title === filterName && updateFilterIndex !== index;
        });
    }

    const getNewFilterName = (numb: number): any => {
        const newName = "New Filter - " + numb;
        if (isDuplicateFilter(newName, -1)) {
            return getNewFilterName(numb + 1);
        }
        return newName;
    }

    function onFilterNameClick(index: number) {
        props.onFilterNameEdit(true);
        setUpdateFilterIndex(index); 
        setIsEditFilterName(true)
    }
    
    function handleFilterNameChange(event: any) {
        setUpdateFilterName(event.target.value)
    }

    function showQueryList(index: number, id: string) {
        context.dispatch(setActiveFilter(id));
        setUpdateFilterIndex(index)
        props.showQueryList();
    }

    function onFilterVisibilityChange(index: number, value: any) {
        setUpdateFilterIndex(index)
        const filter = context.state.activeFilterList[index];
        filter.hidden = value;
        setUpdateColor(rgbToHex(filter.color));
        updateFilter(filter, index)
    }

    function setAutomation(val: string) {
      console.log(val);
      setSelectedFilter(val);
      setShowAutomation(true);
    }

    const updateFilterDetails = async (query: any, variable: any, role: any) => {
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
            Notification.sendNotification('Some error occured on create/update Filter', AlertTypes.error);
        } finally {
            return (responseData?.data) ? responseData.data : null;
        }
    }    

    return (
      <>
        <div className="bimFilter">
            <div className="add-filter">
                <Button className="btn-secondary" size={"small"} onClick={() => addFilter()} >Add a Filter</Button>
            </div>
            {context.state.activeFilterList.map((filter:any, index:number)=> {
                return (
                    (!context.state.isActiveViewSchedule || context.state.activeFilterTaskFilters.includes(filter.id)) 
                    && <div key={`filter-${index}`}>
                        <div className="filterItem">
                            <div className="operations">
                                {(index === showFilterIndex) ?
                                    <ExpandLessIcon onClick={() => setShowFilterIndex(-1)} fontSize={"small"} /> :
                                    <ExpandMoreIcon onClick={() => setShowFilterIndex(index)} fontSize={"small"} />
                                }
                                <div className="title boldText">
                                    {isEditFilterName &&  updateFilterIndex === index ?
                                        <TextField
                                            onKeyDown={(e: any) => {
                                                e.stopPropagation()
                                                if (e.key === "Enter") {
                                                    onFilterNameBlur(e);
                                                }
                                            }}
                                            onFocus={() => setUpdateFilterName(filter.title)}
                                            onBlur={(e: any) => onFilterNameBlur(e)}
                                            onChange={handleFilterNameChange}
                                            autoFocus={true}
                                            size={"small"}
                                            value={(index === updateFilterIndex) ? updateFilterName : filter.title }
                                            required={true} fullWidth={true} variant="outlined"/>
                                        : <div onClick={() => onFilterNameClick(index)} >{filter.title}</div>
                                    }
                                </div>
                            </div>
                            <div className="operations">
                                <input type="color" 
                                    id="colorPicker"
                                    data-id= {index}
                                    onChange={e => changeColor(index, e.target.value)} 
                                    name="color" 
                                    value={(index === updateFilterIndex) ? updateColor : rgbToHex(filter.color) } 
                                />
                                +
                                <Tooltip title="Edit Query"><span onClick={() => showQueryList(index, filter.id)} className="queryLink">Query</span></Tooltip>
                                {
                                setAutomationEnable(filter) &&
                                <Tooltip title="Generate design data" >
                                  <PlayCircleOutlineIcon
                                    onClick={() => setAutomation(filter.id)}
                                    fontSize="small"
                                    className="playIcon"
                                  />
                                </Tooltip>
                                }
                                {filter.hidden ? 
                                    <Tooltip title="Show Filter">
                                        <VisibilityOffIcon onClick={() => onFilterVisibilityChange(index, false)} fontSize="small" /> 
                                    </Tooltip>:
                                    <Tooltip title="Hide Filter">
                                        <VisibilityIcon onClick={() => onFilterVisibilityChange(index, true)} fontSize="small" />
                                    </Tooltip> 
                                }
                                <Tooltip title="Delete Filter">
                                    <DeleteIcon onClick={() =>{ setDeleteFilterIndex(index);  setOpenDeleteModal(true)}} fontSize="small" />
                                </Tooltip>
                            </div>
                        </div>
                        {(index === showFilterIndex) ? <QueryView queryId={filter.queryIds} query={filter.queryParams} queryResult={filter?.handleIds?.length} name={filter.queryName}/> : null}
                    </div>
                )
            })}
            <ConfirmDialog open={openDeleteModal} message={confirmDeleteMessage} close={() => setOpenDeleteModal(false)} proceed={deleteFilter} />
        </div>
        {showAutomation && (
          <BimAutomation
            selectedFilter={selectedFilter}
            onClose={() => {
              setShowAutomation(false);
            }}
          />
        )}
      </>
    );
}