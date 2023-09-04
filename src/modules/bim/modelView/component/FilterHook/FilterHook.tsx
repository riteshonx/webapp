import './FilterHook.scss'
import React, { useContext, useState, useEffect } from 'react';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { bimContext } from '../../../contextAPI/bimContext';
import { client } from '../../../../../services/graphql';
import { setSystemViewList, setSavedViewList, setHighLightedElementId, setSkipUpdateFilter } from '../../../contextAPI/action';
import { projectFeatureAllowedRoles } from '../../../../../utils/role';
import { UPDATE_BIM_VIEW } from '../../../graphql/bimQuery';
import { iterrateOverElementsAssembly, iterrateOverElements } from '../../../container/utils';

let defualtVisualStyle = '';
let filterColorList: any = {};
let filterStyleList: any = {};
let ghostVisualStyleId: any;
let allHiddenList: number[] = [];

export default function FilterHook(props: any) {
    const { dispatch, state }: any = useContext(stateContext);
    const context: any = useContext(bimContext);
    const [isUpdating, setIsUpdating] = useState(false);
    const viewer = context.state.viewer;
    const visualizeJS = context.state.visualizeJS;
    
    useEffect(() => {
        filterColorList = {};
        filterStyleList = {};
        allHiddenList = [];

        return () => {
            filterColorList = {};
            filterStyleList = {};
            allHiddenList = []
        };
    }, [context.state.activeGeometryName]);
    
    useEffect(() => {
        if (context.state.activeGeometryName !== '3D-Views' || context.state.skipUpdateFilter) {
            context.dispatch(setSkipUpdateFilter(false))
            return;
        }
        if (context.state.isActiveViewSaved || context.state.isActiveViewSystemCustom || context.state.isActiveViewTimeline) {
            if (context.state.jobrunnerVersion == '23.12') { 
                const startTime = performance.now()
                updateFilter2312() 
                const endTime = performance.now()
                console.log(`Call to doSomething took ${endTime - startTime} milliseconds`)
            } 
            else  {
                const startTime = performance.now()
                updateFilter();
                const endTime = performance.now()
                console.log(`Call to doSomething took ${endTime - startTime} milliseconds`)
            }
        } else {
            (context.state.jobrunnerVersion == '23.12')? resetFilter2312() : resetFilter();
        }
    }, [context.state.activeFilterList, context.state.updateFilter, context.state.activeFilterTask])

    useEffect(()=> {
        if(context.state.geometryLoaded && viewer) {
            defualtVisualStyle = viewer.getActiveVisualStyle();
            createGhostStyle();
        }
    }, [context.state.geometryLoaded])
    
    async function updateFilter2312() {
        try {
            setIsUpdating(true);
            resetFilter2312();
            const showDef = new visualizeJS.OdTvVisibilityDef(true);
            const hideDef = new visualizeJS.OdTvVisibilityDef(false);
            const selectionSetObj = new visualizeJS.OdTvSelectionSet();
            const viewList = context.state.isActiveViewSystemCustom ? context.state.systemViewList : context.state.savedViewList;
            const currViewDetails = viewList.find((view: any) => view.id === context.state.activeView)
            
            const entityStyleName = "vs1" + Date.now();
            const defaltStyleId = viewer.findVisualStyle(defualtVisualStyle);
            const entityStyleId = viewer.createVisualStyle(entityStyleName);
            const entityStyle = entityStyleId.openObject();
            entityStyle.copyFrom(defaltStyleId)
            entityStyle.setOptionInt32(visualizeJS.VisualStyleOptions.kFaceLightingModel, 1, visualizeJS.VisualStyleOperations.kSet)

            context.state.activeFilterList.map((filter: any, index: number) => {
                if ((!context.state.isActiveViewSchedule || !context.state.activeFilterTask || context.state.activeFilterTaskFilters.includes(filter.id))) {

                    if (!filter.hidden) {
                        filter.handleIds.forEach((id: any) => {
                            const entityId = viewer.getEntityByOriginalHandle(id.toString()); 
                            if (entityId.getType() === 1) {
                                const entity =  entityId.openObject();
                                if (!filterColorList[id]) 
                                    filterColorList[id] = entity.getColor(visualizeJS.GeometryTypes.kAll).getColor();
                                
                                if (!filterStyleList[id]) 
                                    filterStyleList[id] = entity.getVisualStyle(); 
                                currViewDetails?.viewType === 'Model'? setEntityColor(entity, null, entityStyleId, showDef)
                                    :setEntityColor(entity, filter.color, entityStyleId, showDef)
                                selectionSetObj.appendEntity(entityId);
                            }
                        });
                    } else {
                        filter.handleIds.forEach((id: any) => {
                            const entityId = viewer.getEntityByOriginalHandle(id.toString()); 
                            if (entityId.getType() === 1) {
                                const entity =  entityId.openObject();
                                allHiddenList.push(...filter.handleIds);
                                entity.setVisibility(hideDef, visualizeJS.GeometryTypes.kAll)
                            }
                        });
                    }
                }
            });
            if (currViewDetails && currViewDetails.ghostExcluded) {
                viewer.setActiveVisualStyle(ghostVisualStyleId.openObject().getName())
            } else {
                viewer.setSelected(selectionSetObj)
                viewer.isolateSelectedObjects(true)
            }
            setIsUpdating(false);
        } catch (error: any) {
            console.error(error);
            setIsUpdating(false);
        }
    }

    async function resetFilter2312() {
        try {
            if (viewer) {
                setIsUpdating(true);
                const showDef = new visualizeJS.OdTvVisibilityDef(true);
                Object.keys(filterColorList).map((handleId: any, index: number) => {
                    const entityId = viewer.getEntityByOriginalHandle(handleId.toString()); 
                    if (entityId.getType() === 1) {
                        const entity =  entityId.openObject();
                        setEntityColor(entity, filterColorList[handleId], filterStyleList[handleId], showDef)
                    }
                })
                allHiddenList.forEach((id: any) => {
                    const entityId = viewer.getEntityByOriginalHandle(id.toString()); 
                    if (entityId.getType() === 1) {
                        const entity =  entityId.openObject();
                        entity.setVisibility(showDef, visualizeJS.GeometryTypes.kAll)
                    }
                });
                filterColorList = {};
                filterStyleList = {};
                allHiddenList = [];
                viewer.unisolateSelectedObjects(true)
                viewer.setActiveVisualStyle(defualtVisualStyle);
                setIsUpdating(false);
            }
        } catch (error: any) {
            console.error(error.message);
            setIsUpdating(false);
        }
    }

    async function resetFilter() {
        try {
            if (viewer) {
                setIsUpdating(true);
                viewer.unisolateSelectedObjects(true)
                const colorDef = new visualizeJS.OdTvColorDef(209, 21, 21)
                const defaltStyleId = viewer.findVisualStyle(defualtVisualStyle);
                const showDef = new visualizeJS.OdTvVisibilityDef(true);

                const resetColor = (colorDef: any, entityId: any, entity: any, child: any) => {
                    if (entityId.getType() === 1) {
                        const visJsHandleId = (context.state.isAssembly) ? entity.getNativeDatabaseHandle() : child.getUniqueSourceID();
                        setEntityColor(entity, filterColorList[visJsHandleId], filterStyleList[visJsHandleId], showDef)
                    }
                }
                setTimeout(async () => {
                    try {
                        (context.state.isAssembly) ? await iterrateOverElementsAssembly(resetColor.bind(null, colorDef), viewer)
                            : await iterrateOverElements(resetColor.bind(null, colorDef), viewer)
                        viewer.unisolateSelectedObjects(true)
                        filterColorList = {};
                        filterStyleList = {};
                        //viewer.setActiveVisualStyle(defualtVisualStyle);
                        setIsUpdating(false);
                        context.state.isActiveViewSaved && setSavedThumbnail();
                    } catch (error: any) {
                        console.error(error.message);
                        setIsUpdating(false);
                    }
                }, 1000)
            }
        } catch (error: any) {
            console.error(error.message);
            setIsUpdating(false);
        }
    }

    async function updateFilter() {
        try {
            setIsUpdating(true);
            const selectionSetObj = new visualizeJS.OdTvSelectionSet();
            const visualStyleId = viewer.createVisualStyle("vs1" + Date.now());
            const defaltStyleId = viewer.findVisualStyle(defualtVisualStyle);
            const visualStyle = visualStyleId.openObject();
            visualStyle.copyFrom(defaltStyleId)
            const colorDef = new visualizeJS.OdTvColorDef(209, 21, 21)
            const showDef = new visualizeJS.OdTvVisibilityDef(true);
            const hideDef = new visualizeJS.OdTvVisibilityDef(false);
            const colorDefEdge = new visualizeJS.OdTvColorDef(0, 0, 0)
            const viewList = context.state.isActiveViewSystemCustom ? context.state.systemViewList : context.state.savedViewList;
            const currViewDetails = viewList.find((view: any) => view.id === context.state.activeView)
            const hiddenList: number[] = [];

            const handleList = context.state.activeFilterList.reduce((result: any, filter: any, index: number) => {
                if ((!context.state.isActiveViewSchedule || !context.state.activeFilterTask || context.state.activeFilterTaskFilters.includes(filter.id))) {
                    if (!filter.hidden) {
                        filter.handleIds.forEach((id: any) => {
                            result[id] = filter.color;
                        });
                    } else {
                        hiddenList.push(...filter.handleIds);
                    }
                }
                return result;
            }, {});

            const updateColor = (selectionSetObj: any, colorDef: any, defaltStyleId: any, entityId: any, entity: any, child: any) => {
                if (entityId.getType() === 1) {
                    const visJsHandleId = (context.state.isAssembly) ? entity.getNativeDatabaseHandle() : child.getUniqueSourceID();
                    const handleId =  (context.state.isAssembly) ? visJsHandleId.split("_")[1]: visJsHandleId;
                    if (handleList[handleId]) {
                        selectionSetObj.appendEntity(entityId);
                        
                        if (currViewDetails?.viewType === 'Model') {
                            setEntityColor(entity, filterColorList[visJsHandleId], filterStyleList[visJsHandleId], showDef)
                            return;
                        }

                        if (!filterStyleList[visJsHandleId]) 
                            filterStyleList[visJsHandleId] = entity.getVisualStyle();    
                        
                        if (!filterColorList[visJsHandleId]) 
                            filterColorList[visJsHandleId] = entity.getColor(visualizeJS.GeometryTypes.kAll).getColor();
                            
                        setEntityColor(entity, handleList[handleId], visualStyleId, showDef)
                    } else if (hiddenList.includes(parseInt(handleId))) {
                        entity.setVisibility(hideDef, visualizeJS.GeometryTypes.kAll)
                    } else if (currViewDetails && currViewDetails.ghostExcluded) {
                        if (!filterStyleList[visJsHandleId]) 
                            filterStyleList[visJsHandleId] = entity.getVisualStyle();
                        filterColorList[visJsHandleId] ? setEntityColor(entity, filterColorList[visJsHandleId], ghostVisualStyleId, showDef) : entity.setVisualStyle(ghostVisualStyleId);
                    } else {
                        setEntityColor(entity, filterColorList[visJsHandleId], filterStyleList[visJsHandleId], showDef)
                    }
                } else {
                    selectionSetObj.appendEntity(entityId);
                }
            }
            setTimeout(async () => {
                try {
                    (context.state.isAssembly) ? await iterrateOverElementsAssembly(updateColor.bind(null, selectionSetObj, colorDef, defaltStyleId), viewer)
                        : await iterrateOverElements(updateColor.bind(null, selectionSetObj, colorDef, defaltStyleId), viewer)
                    if (currViewDetails && currViewDetails.ghostExcluded) {
                        viewer.unisolateSelectedObjects(true)
                        if (context.state.highLightedElementId && hiddenList.includes(parseInt(context.state.highLightedElementId))) {
                            viewer?.unselect()
                            context.dispatch(setHighLightedElementId(null));
                        }
                    } else {
                        viewer?.unselect()
                        context.dispatch(setHighLightedElementId(null));
                        if(context.state.isAssembly) {
                            const numOfModels = viewer.activeView.numModels();
                            (selectionSetObj.numItems() === 0) && appendDummyEntity(selectionSetObj)
                            for (let i = 0; i < numOfModels; i++) {
                                const model = viewer.activeView.modelAt(i);
                                model.isolateBySelectionSet(selectionSetObj, true);
                            }
                        } else {   
                            viewer.setSelected(selectionSetObj)
                            viewer.isolateSelectedObjects(true)
                        }
                    }
                    visualStyle.setOptionInt32(visualizeJS.VisualStyleOptions.kDisplayStyles, 0, visualizeJS.VisualStyleOperations.kSet)
                    setIsUpdating(false);
                    !context.state.isActiveViewTimeline && setSavedThumbnail();
                } catch (error: any) {
                    console.error(error);
                    setIsUpdating(false);
                }
            }, 1000)
        } catch (error: any) {
            console.error(error);
            setIsUpdating(false);
        }
    }

    async function setEntityColor(entity: any, color: any, style: any, visbility: any) {
        if (color) {
            const colorDef = new visualizeJS.OdTvColorDef(209, 21, 21)
            colorDef.setColor(...color);
            entity.setColor(colorDef, visualizeJS.GeometryTypes.kFaces);
            entity.setColor(colorDef, visualizeJS.GeometryTypes.kAll);
        }
        style && entity.setVisualStyle(style);
        entity.setVisibility(visbility, visualizeJS.GeometryTypes.kAll)
    }

    function appendDummyEntity(selectionSetObj: any) {
        const model = viewer.getActiveModel();
        const entityPtr = model.appendEntity("Entity");
        selectionSetObj.appendEntity(entityPtr);
    }

    function createGhostStyle() {
        const ghostVisualStyleName = "vs1" + Date.now();
        const defaltStyleId = viewer.findVisualStyle(defualtVisualStyle);
        ghostVisualStyleId = viewer.createVisualStyle(ghostVisualStyleName);
        const ghostvisualStyle = ghostVisualStyleId.openObject();
        ghostvisualStyle.copyFrom(defaltStyleId)
        
        // ghostvisualStyle.setOptionInt32(visualizeJS.VisualStyleOptions.kDisplayStyles, 4, visualizeJS.VisualStyleOperations.kSet)
        ghostvisualStyle.setOptionInt32(visualizeJS.VisualStyleOptions.kEdgeModel, 0, visualizeJS.VisualStyleOperations.kSet)
        ghostvisualStyle.setOptionInt32(visualizeJS.VisualStyleOptions.kEdgeStyles, 0, visualizeJS.VisualStyleOperations.kSet)
        ghostvisualStyle.setOptionInt32(visualizeJS.VisualStyleOptions.kEdgeModifiers, 128, visualizeJS.VisualStyleOperations.kSet)
        ghostvisualStyle.setOptionInt32(visualizeJS.VisualStyleOptions.kFaceModifiers, 1, visualizeJS.VisualStyleOperations.kSet)
        ghostvisualStyle.setOptionDouble(visualizeJS.VisualStyleOptions.kEdgeOpacityAmount, 0.25, visualizeJS.VisualStyleOperations.kSet)
        ghostvisualStyle.setOptionDouble(visualizeJS.VisualStyleOptions.kFaceOpacityAmount, 0.25, visualizeJS.VisualStyleOperations.kSet)
    }

    function setSavedThumbnail() {
        setTimeout(async () => {
            try {
                const canvas: any = document.getElementById("canvas");
                const lowQuality = canvas?.toDataURL('image/jpeg', 0.05);
                const viewList = context.state.isActiveViewSystemCustom ? context.state.systemViewList : context.state.savedViewList;
                const currViewDetailsIndex = viewList.findIndex((view: any) => view.id === context.state.activeView)
                const updatedList = [...viewList.slice(0, currViewDetailsIndex), {
                    ...viewList[currViewDetailsIndex],
                    viewThumbnail: lowQuality
                }, ...viewList.slice(currViewDetailsIndex + 1)
                ];
                context.state.isActiveViewSystemCustom ? context.dispatch(setSystemViewList(updatedList)) : context.dispatch(setSavedViewList(updatedList));
                if (state.projectFeaturePermissons?.cancreateBimModel && state.projectFeaturePermissons?.canupdateBimModel) {
                    const data = await updateQuery(UPDATE_BIM_VIEW, {
                        "id": context.state.activeView,
                        "fields": {
                            "viewThumbnail": lowQuality
                        }
                    }, projectFeatureAllowedRoles.updateBimModel)
                }
            } catch (error: any) {
                console.error(error.message);
                setIsUpdating(false);
            }
        }, 1000);
    }

    const updateQuery = async (query: any, variable: any, role: any) => {
        let responseData;
        try {
            responseData = await client.mutate({
                mutation: query,
                variables: variable,
                context: { role: role, token: state.selectedProjectToken }
            })
            return responseData.data;
        } catch (error: any) {
            console.error(error.message);
        }
    }

    return (
        <div>{isUpdating && <div className="loading-info4">Updating Model...</div>}</div>
    );
}
