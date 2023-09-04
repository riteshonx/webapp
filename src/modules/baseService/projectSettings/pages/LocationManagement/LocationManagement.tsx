import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { match, useRouteMatch } from 'react-router-dom';
import { IconButton, Tooltip } from '@material-ui/core';
import { LOAD_LOCATION_DATA } from '../../graphql/queries/location';
import './LocationManagement.scss';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { setIsLoading } from '../../../../root/context/authentication/action';
import { client } from '../../../../../services/graphql';
import { myProjectRole } from '../../../../../utils/role';
import { LocationNode } from '../../models/location';
import AddIcon from '@material-ui/icons/Add';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import LocationSubItem from '../../components/LocationSubItem/LocationSubItem';
import { locationContext } from '../../../context/locationContext';
import { projectDetailsContext } from '../../../projects/Context/ProjectDetailsContext';
import ProjectSettingsHeader from '../../components/ProjectSettingsHeader/ProjectSettingsHeader';


export interface Params {
    projectId: string;
}

export default function LocationManagement(): ReactElement {
    const pathMatch:match<Params>= useRouteMatch();
    const [locationItem, setLocationItem] = useState<Array<LocationNode>>([]);
    const { dispatch, state }: any = useContext(stateContext);
    const {projectDetailsState}: any = useContext(projectDetailsContext);
    
    useEffect(() => {
        fetchProjectLocationTreeData();
    }, [])

    const fetchProjectLocationTreeData= async ()=>{
        try{
            dispatch(setIsLoading(true));
            const responseData= await client.query({
                query: LOAD_LOCATION_DATA,
                variables:{
                    projectId: Number(pathMatch.params.projectId)
                },
                fetchPolicy:'network-only',
                context:{role: myProjectRole.viewMyProjects}
            });
            let list: Array<LocationNode>=[];
            if(responseData.data.projectLocationTree.length>0){
               list = transformLocationData(responseData.data.projectLocationTree);
               if(list[0].childNodes.length>0){
                list[0].isOpen=true;
               }
            }
            setLocationItem(list);
            dispatch(setIsLoading(false));
        }
        catch(error: any){
            console.log(error.message);
            dispatch(setIsLoading(false));
        }
    }

    

    const transformLocationData=(argList: Array<LocationNode>): Array<LocationNode>=>{
        const returnValue:Array<LocationNode>=[];
        argList.forEach((item: LocationNode)=>{
            const childNodes=computeChildNodes(item.childNodes);
            const newItem: LocationNode= new LocationNode(item.nodeName,item.parentId,item.id,childNodes);
            returnValue.push(newItem);
        })
        return returnValue;
    }

    const computeChildNodes=(argList: Array<LocationNode>): Array<LocationNode>=>{
        const returnValue:Array<LocationNode>=[];
        argList.forEach((item: LocationNode)=>{
            const childNodes=computeChildNodes(item.childNodes);
            const newItem: LocationNode= new LocationNode(item.nodeName,item.parentId,item.id,childNodes);
            returnValue.push(newItem);
        })
        return returnValue
    }

    const showMore=()=>{
        locationItem[0].isOpen=true;
        setLocationItem([...locationItem]);
    }

    const showLess=()=>{
        locationItem[0].isOpen=false;
        setLocationItem([...locationItem]);
    }

    const updateValues=()=>{
        setLocationItem([...JSON.parse(JSON.stringify(locationItem))]);
    }
  

    return (
        <locationContext.Provider value={{locationValues: locationItem,updateValues}}>
            <div className="LocationManagement">
                <div className="LocationManagement__header">
                    <ProjectSettingsHeader header={"Location Management"}/>
                </div>
                {projectDetailsState?.projectPermission?.canViewLocation?(
                        <div className="LocationManagement__body">
                        <div className="LocationManagement__body__header">
                            <div className="LocationManagement__body__header__left">
                                List Items
                            </div>
                            <div className="LocationManagement__body__header__right">
                                Action
                            </div>
                        </div>
                        <div className="LocationManagement__body__content">
                            {locationItem.map((item: LocationNode, index: number)=>
                            <>
                            <div className="LocationManagement__body__content__item" key={`Item-${item.id}`}>
                                <div className="LocationManagement__body__content__item__left">
                                    {item.isOpen?( <IconButton className="LocationManagement__body__content__item__left__btn"
                                        onClick={showLess}>
                                        <ExpandMoreIcon/>
                                    </IconButton>):(item.childNodes.length===0?(
                                        projectDetailsState?.projectPermission.canCreateLocation &&
                                        <Tooltip title={`Add sublist`}>
                                            <IconButton className="LocationManagement__body__content__item__left__btn"
                                                onClick={showMore}>
                                                <AddIcon/>
                                            </IconButton>
                                        </Tooltip>):(
                                        <IconButton className="LocationManagement__body__content__item__left__btn"
                                            onClick={showMore}>
                                            <ChevronRightIcon/>
                                        </IconButton>))}
                                    {item.nodeName}
                                </div>
                            </div>
                            {item.isOpen&& (<LocationSubItem subListItem={item}
                                            subItemIndex={`${index}`}/>)}
                            </>)}
                        </div>
                    </div>    
                ): !state.isLoading ?(
                <div className="LocationManagement__nopermission">
                    You don't have permission to view location managment
                </div>
                ):("")}
                </div>
        </locationContext.Provider>
    )
}