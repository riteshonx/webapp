import React, { ReactElement, useContext, useReducer, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom';
import { bimReducer, initialState } from '../../../contextAPI/bimReducer';
import { bimContext } from '../../../contextAPI/bimContext';
import ActionPanel from '../../component/ActionPanel/actionPanel';
import TimeLineContainer from '../../component/TimeLineViewer/TimeLineContainer/TimeLineContainer';
import CubeNavigaion from '../../component/CubeNavigaion/cubeNavigaion';
import { setVisualizeJS, setOpenCloud, setViewer, setActiveModel, setIsGeometryLoaded, setSystemViewList, setActiveView, setIsActiveViewSaved, setSavedViewList, setGeometryInfo, setActiveGeometryName, setSkipUpdateFilter, setHighLightedElementId } from '../../../contextAPI/action';
import { postApi } from '../../../../../services/api';
import UploadFile from '../../component/UploadFile/UploadFile'
import Sidebar from '../../component/Sidebar/Sidebar'
import { projectFeatureAllowedRoles } from '../../../../../utils/role';
import { BIM_MODEL_STATUS, CREATE_BIM_SPATIAL_PROP, UPDATE_SPATIAL_STATUS } from '../../../graphql/bimUpload';
import { UPDATE_BIM_VIEW } from '../../../graphql/bimQuery';
import { client } from '../../../../../services/graphql';
import { stateContext } from '../../../../root/context/authentication/authContext';
import Notification, { AlertTypes } from '../../../../shared/components/Toaster/Toaster';
import { CircularProgress } from '@material-ui/core';
import { decodeToken } from '../../../../../services/authservice';
import "./Viewer.scss"
import ODA from 'open-cloud-client';
import { setIsLoading } from '../../../../root/context/authentication/action';

let canvas: any = null;
let visualizeJS: any = null;
let openCloud: any = null;
let viewer: any = null;
let defualtVisualStyle = '';
let filterColorList: any = {};
let filterStyleList: any = {};

export default function Viewer(): ReactElement {
    const [bimState] = useReducer(bimReducer, initialState);
    const { dispatch, state }: any = useContext(stateContext);
    const context: any = useContext(bimContext);
    const [isBimAvial, setIsBimAvial] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [libProgress, setLibProgress] = useState(0);
    const history = useHistory();

    useEffect(() => {
        if (state.selectedProjectToken) {
            setIsBimAvial(false);
            setIsUpdating(false);
            if (viewer) {
                visualizeJS.Viewer.destroy();
            }
        }
        return () => {
            window.removeEventListener("resize", resize);
            (viewer) ? visualizeJS.Viewer.destroy() : null;
            if (openCloud) {
                openCloud.cancel();
                openCloud.dispose();
            }
        };
    }, [state.selectedProjectToken])

    useEffect(() => {
        if (context.state.activeGeometryName !== '3D-Views' || context.state.skipUpdateFilter) {
            context.dispatch(setSkipUpdateFilter(false))
            return;
        }
        if (context.state.isActiveViewSaved || context.state.isActiveViewSystemCustom || context.state.isActiveViewTimeline) {
            updateFilter()
        } else {
            resetFilter()
        }
    }, [context.state.activeFilterList, context.state.updateFilter, context.state.activeFilterTask])

    useEffect(() => {
        loadSheets();
    }, [context.state.activeGeometryName])


    const load3Dmodel = async (modelId: string) => {
        try {
            const client = await ODA.createClient({ serverUrl: "" })

            canvas = document.getElementById("canvas");
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;

            openCloud = await client.createViewer({
                target: canvas,
                visualizeJsUrl: "https://opencloud.azureedge.net/libs/visualizejs/23.4/Visualize.js",
                onprogress: (ev: any) => setLibProgress(((100 * ev.loaded) / ev.total) | 0)
            });

            visualizeJS = openCloud.visLib();
            viewer = openCloud.visViewer();

            context.dispatch(setViewer(viewer));
            context.dispatch(setOpenCloud(openCloud));
            context.dispatch(setVisualizeJS(visualizeJS));

            // window.addEventListener("resize", resize);
            viewer.setDefaultViewPositionWithAnimation(visualizeJS.DefaultViewPosition.k3DViewSE);
            viewer.setEnableWCS(false);

            const modelInformation = await getModelInfo(modelId);
            const geometryInfo =  modelInformation.geometryInfo;
            if (modelInformation) {
                context.dispatch(setGeometryInfo(geometryInfo))
                const s3Links = await fetchS3links(modelId, geometryInfo);
                await openModelFromS3(s3Links);
            }

            viewer.setEnableSceneGraph(true);
            viewer.setBackgroundColor([255, 255, 255]);
            viewer.fxaaAntiAliasing3d = true;
            viewer.fxaaQuality = 5;
            viewer.shadows = false;
            //viewer.lineSmoothing = true;
            viewer.getActiveDevice().invalidate([0, visualizeJS.canvas.clientWidth, visualizeJS.canvas.clientHeight, 0]);


            viewer.setHighlightColor(0xFF, 0x98, 0x00, 125);
            // const light = viewer.getActiveModel().appendLight("DirectionLight").openObjectAsLight();
            // light.setLightType(1);
            // light.setOn(true);
            // light.setIntensity(0.4);
            // light.setPosition([0, 0, 100]);
            // light.setLightDirection([0, 0, -1]);
            // viewer.activeView.setAmbientLightColor(new visualizeJS.OdTvColorDef(150, 150, 150));
            // viewer.activeView.enableDefaultLighting(false, visualizeJS.DefaultLightingType.kUserDefined);

            viewer.zoomExtents();
            context.dispatch(setIsGeometryLoaded(true));
            defualtVisualStyle = viewer.getActiveVisualStyle();

            if (modelInformation && !modelInformation.spatialPropertyStatus) {
                state.projectFeaturePermissons?.cancreateBimModel &&
                    state.projectFeaturePermissons?.canupdateBimModel && updateSpatialProperty(modelInformation.id)
            }
        } catch (error: any) {
            console.error(error.message);
        } 
    }

    async function loadSheets() {
        if (context.state.geometryInfo.length > 0) {
            try {
                filterStyleList = {};
                filterColorList = {};
                setIsUpdating(true)
                dispatch(setIsLoading(true));
                const s3Links = await fetchS3links(context.state.activeModel, context.state.geometryInfo, context.state.activeGeometryName);
                await openModelFromS3(s3Links);
                setIsUpdating(false)
                dispatch(setIsLoading(false));
                if (context.state.activeGeometryName === '3D-Views' &&  (context.state.isActiveViewSaved || context.state.isActiveViewSystemCustom)) {
                    updateFilter()
                }
            } catch (error: any) {
                console.error(error.message);
                setIsUpdating(false);
                dispatch(setIsLoading(false));
            }
        }
    }

    const getModelInfo = async (modelId: string) => {
        const bimStatus = await fetchBimModelStatus(BIM_MODEL_STATUS, {
            _eq: modelId
        })
        if (bimStatus) {
            return bimStatus;
        }
        return [];
    }

    async function fetchS3links(modelId: string, geometryInfo: any, sheetId = '3D-Views') {
        if (localStorage.getItem(modelId + sheetId)) {
            const links = JSON.parse(localStorage.getItem(modelId + sheetId) || '');
            const decodeTkn = decodeToken(links[0].url.split("/").pop());
            const timeNow = Date.now() / 1000;
            if (timeNow < decodeTkn.exp) {
                return links;
            }
        }
        try {
            const sheetGeometryInfo = (sheetId !== '3D-Views') ? geometryInfo.find((info: any) => info.name == sheetId)
                : geometryInfo.find((info: any) => info.name.includes('3D Views')) || geometryInfo[0];
            const geometryKeys = await Promise.all([sheetGeometryInfo.database, ...sheetGeometryInfo.geometry].map((value: any) => {
                return {
                    key: value,
                    expiresIn: 604800
                }
            }))
            const response = await postApi('V1/S3/downloadLink', geometryKeys);
            localStorage.setItem(modelId + sheetId, JSON.stringify(response.success));
            return response.success;
        } catch (error: any) {
            Notification.sendNotification('Some error occured on getting model data, Please refresh', AlertTypes.error);
            console.error(error.message);
        }
        return null;
    }

    function openModelFromS3(s3Links: [any]) {
        viewer.clear();
        openCloud?.cancel();
        viewer?.unselect()

        if (".vsfx" === s3Links[0].key.substr(-5)) {
            return openVsfxPartialStream(s3Links[0])
        }

        return s3Links.reduce((acc, chunk, index) => {
            return acc
                .then(() => fetch(chunk.url,
                    { method: "GET" }))
                .then((responce: any) => responce.arrayBuffer())
                .then((arrayBuffer: any) => {
                    viewer.parseStream(new Uint8Array(arrayBuffer))
                    if (!index) {
                        viewer.setEnableWCS(false);
                        viewer.setDefaultViewPositionWithAnimation(visualizeJS.DefaultViewPosition.k3DViewSE);
                        viewer.setBackgroundColor([255, 255, 255]);
                    }
                    viewer.update();
                })
        }, Promise.resolve())
    }

    async function openVsfxStream(database: any) {
        return fetch(database.url,
            { method: "GET" })
            .then((responce: any) => responce.arrayBuffer())
            .then((arrayBuffer: any) => {
                viewer.parseVsfx(new Uint8Array(arrayBuffer))
            });
    }

    async function openVsfxPartialStream(database: any) {
        const abortController = new AbortController();
        openCloud.emitEvent({ type: "geometry-start", data: context.state.geometryInfo });
        openCloud.visViewer().update();
        let isFireDatabaseChunk = false;
        try {
            await partialDownloadResource(database.url,
                abortController.signal,
                (progress: any, value: any) => {
                    const state = openCloud.visViewer().parseVsfx(value);
                    if (state === openCloud.visLib().DatabaseStreamStatus.ReadyServiceData ||
                        state === openCloud.visLib().DatabaseStreamStatus.Complete && !isFireDatabaseChunk) {
                        isFireDatabaseChunk = true;
                        openCloud.emitEvent({ type: 'database-chunk', data: value });
                        viewer.setEnableWCS(false);
                        viewer.setDefaultViewPositionWithAnimation(visualizeJS.DefaultViewPosition.k3DViewSE);
                        viewer.setBackgroundColor([255, 255, 255]);
                    } else if (state === openCloud.visLib().DatabaseStreamStatus.AwaitingObjectsData) {
                        openCloud.emitEvent({ type: 'geometry-chunk', data: value });
                    }
                    openCloud.emitEvent({ type: 'geometry-progress', data: progress });
                }
            );
            openCloud.emitEvent({ type: "geometry-end", data: context.state.geometryInfo });
        } catch (error: any) {
            openCloud.emitEvent({ type: "error", data: error.message || error });
            throw error
        }
    }

    async function partialDownloadResource(url: string, signal: any, onProgress: any) {
        const response: any = await fetch(url, { signal: signal });
        const contentLength = response.headers.get('content-length');
        const total = parseInt(contentLength, 10);

        let loaded = 0;

        const reader = response.body.getReader();
        const condition = true;
        while (condition) {
            const { done, value } = await reader.read();

            if (done) {
                break
            }
            loaded += value.byteLength;
            onProgress(loaded / total, value);
        }
    }

    const fetchBimModelStatus = async (query: any, varable: any) => {
        try {
            const responseData = await client.query({
                query: query,
                variables: varable,
                fetchPolicy: 'network-only',
                context: { role: projectFeatureAllowedRoles.viewBimModel, token: state.selectedProjectToken }
            });
            return responseData.data.bimModelStatus[0];
        } catch (error: any) {
            console.error(error.message);
        }
    }

    function showBimModel(modelId: string) {
        context.dispatch(setIsGeometryLoaded(false));
        context.dispatch(setActiveModel(modelId));
        context.dispatch(setActiveGeometryName('3D-Views'));
        context.dispatch(setGeometryInfo([]));
        context.dispatch(setActiveView(null));
        context.dispatch(setSystemViewList([]));
        context.dispatch(setIsActiveViewSaved(false));
        setIsBimAvial(true)
        setIsUpdating(false);
        load3Dmodel(modelId)
        filterStyleList = {};
        filterColorList = {};
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
                    if (filterColorList[child.getUniqueSourceID()]) {
                        entity.setVisibility(showDef, visualizeJS.GeometryTypes.kAll)
                        colorDef.setColor(...filterColorList[child.getUniqueSourceID()]);
                        entity.setColor(colorDef, visualizeJS.GeometryTypes.kFaces);
                        entity.setColor(colorDef, visualizeJS.GeometryTypes.kAll);
                        entity.setVisualStyle(defaltStyleId)
                    }
                }
                setTimeout(async () => {
                    try {
                        await iterrateOverElements(resetColor.bind(null, colorDef))
                        viewer.unisolateSelectedObjects(true)
                        viewer.setActiveVisualStyle(defualtVisualStyle);
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
                if (entityId.getType() >= 1) {
                    const handleId = child.getUniqueSourceID();
                    if (handleList[handleId]) {
                        selectionSetObj.appendEntity(entityId);
                        if (!filterColorList[handleId]) {
                            filterColorList[handleId] = entity.getColor(visualizeJS.GeometryTypes.kAll).getColor();
                            filterStyleList[handleId] = entity.getVisualStyle();
                        }
                        colorDef.setColor(...handleList[handleId]);
                        entity.setColor(colorDef, visualizeJS.GeometryTypes.kFaces);
                        entity.setColor(colorDef, visualizeJS.GeometryTypes.kAll);
                        entity.setVisualStyle(visualStyleId)
                        entity.setVisibility(showDef, visualizeJS.GeometryTypes.kAll)
                    } else if (hiddenList.includes(parseInt(handleId))) {
                        entity.setVisibility(hideDef, visualizeJS.GeometryTypes.kAll)
                    } else if (filterColorList[handleId]) {
                        colorDef.setColor(...filterColorList[handleId]);
                        entity.setColor(colorDef, visualizeJS.GeometryTypes.kFaces);
                        entity.setColor(colorDef, visualizeJS.GeometryTypes.kAll);
                        entity.setVisualStyle(filterStyleList[handleId]);
                        entity.setVisibility(showDef, visualizeJS.GeometryTypes.kAll)
                    }
                } else {
                    selectionSetObj.appendEntity(entityId);
                }
            }
            setTimeout(async () => {
                try {
                    await iterrateOverElements(updateColor.bind(null, selectionSetObj, colorDef, defaltStyleId))

                    if (currViewDetails && currViewDetails.ghostExcluded) {
                        viewer.unisolateSelectedObjects(true)
                        const ghostVisualStyleName = "vs1" + Date.now();
                        const ghostVisualStyleId = viewer.createVisualStyle(ghostVisualStyleName);
                        const ghostvisualStyle = ghostVisualStyleId.openObject();
                        ghostvisualStyle.copyFrom(defaltStyleId)
                        // ghostvisualStyle.setOptionInt32(visualizeJS.VisualStyleOptions.kDisplayStyles, 4, visualizeJS.VisualStyleOperations.kSet)
                        ghostvisualStyle.setOptionInt32(visualizeJS.VisualStyleOptions.kEdgeModel, 0, visualizeJS.VisualStyleOperations.kSet)
                        ghostvisualStyle.setOptionInt32(visualizeJS.VisualStyleOptions.kEdgeStyles, 0, visualizeJS.VisualStyleOperations.kSet)
                        ghostvisualStyle.setOptionInt32(visualizeJS.VisualStyleOptions.kEdgeModifiers, 128, visualizeJS.VisualStyleOperations.kSet)
                        ghostvisualStyle.setOptionInt32(visualizeJS.VisualStyleOptions.kFaceModifiers, 1, visualizeJS.VisualStyleOperations.kSet)
                        ghostvisualStyle.setOptionDouble(visualizeJS.VisualStyleOptions.kEdgeOpacityAmount, 0.25, visualizeJS.VisualStyleOperations.kSet)
                        ghostvisualStyle.setOptionDouble(visualizeJS.VisualStyleOptions.kFaceOpacityAmount, 0.25, visualizeJS.VisualStyleOperations.kSet)
                        viewer.setActiveVisualStyle(ghostVisualStyleName)
                        if (context.state.highLightedElementId && hiddenList.includes(parseInt(context.state.highLightedElementId))) {
                            viewer?.unselect()
                            context.dispatch(setHighLightedElementId(null));
                        }
                    } else {
                        viewer?.unselect()
                        context.dispatch(setHighLightedElementId(null));
                        viewer.setSelected(selectionSetObj)
                        viewer.isolateSelectedObjects(true)
                        viewer.setActiveVisualStyle(defualtVisualStyle)
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

    function resize() {
        setTimeout(() => {
            try {
                canvas.width = canvas.offsetWidth * window.devicePixelRatio;
                canvas.height = canvas.offsetHeight * window.devicePixelRatio;
                viewer.resize(0, canvas.width, canvas.height, 0);
                viewer.update();
            } catch (error: any) {
                console.error(error.message);
                setIsUpdating(false);
            }
        }, 1000)
    }

    function setSavedThumbnail() {
        setTimeout(async () => {
            try {
                const lowQuality = canvas.toDataURL('image/jpeg', 0.05);
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

    async function iterrateOverElements(operFun: any) {
        const iter = viewer.getCDATreeIterator();
        const tree = iter.getCDATreeStorage().getTree();
        const node = tree.getDatabaseNode();
        const childrens = node.getChildren()

        async function findChildrens(childrens: any): Promise<any> {
            const promises = []
            for (let i = 0; i < childrens.length(); i++) {
                const child = childrens.get(i);
                const entityId = child.getTvEntityId(viewer.activeView);
                const entity = (entityId.getType() === 1) ? entityId.openObject() : entityId.openObjectAsInsert();
                operFun(entityId, entity, child)
                if (child.getChildren().length() > 0) {
                    promises.push(findChildrens(child.getChildren()))
                }
            }
            return Promise.all(promises)
        }
        return findChildrens(childrens);
    }

    async function updateSpatialProperty(bimStatusId: any) {
        setIsUpdating(true);
        const spatialProperty: any = [];
        const promises = []

        const updateSpatialPropertyList = (spatialProperty: any, entityId: any, entity: any, child: any) => {
            if (child.getChildren().length() <= 0) {
                if (entityId.getType() !== 0) {
                    const extents = entity.getExtents();
                    spatialProperty.push({
                        handleId: parseInt(child.getUniqueSourceID()),
                        minBoundingBox: extents.min(),
                        maxBoundingBox: extents.max(),
                        centerBoundingBox: extents.center(),
                    })
                }
            }
        }
        await iterrateOverElements(updateSpatialPropertyList.bind(null, spatialProperty))

        const perChunk = 1000;
        for (let i = 0, j = spatialProperty.length; i < j; i += perChunk) {
            const chunk = spatialProperty.slice(i, i + perChunk);
            promises.push(updateQuery(CREATE_BIM_SPATIAL_PROP, {
                bimModelStatusId: bimStatusId,
                spatialProperties: chunk
            }, projectFeatureAllowedRoles.createBimModel))
        }

        try {
            await Promise.all(promises);
            await updateQuery(UPDATE_SPATIAL_STATUS, { bimModelStatusId: bimStatusId }, projectFeatureAllowedRoles.updateBimModel);
            setIsUpdating(false);
        } catch (error: any) {
            console.error(error.message);
            setIsUpdating(false);
        }
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

    const backToUploadDetails = () => {
        if (openCloud) {
            openCloud.cancel();
            openCloud.dispose();
        }
        context.dispatch(setIsGeometryLoaded(false));
        setIsBimAvial(false);
        context.dispatch(setActiveModel(null));
    }

    return (
        <div className="bimMainContainer">
            {isBimAvial ? <Sidebar resize={resize} backNavDescp="Back to Upload Details" backNavigation={backToUploadDetails} /> :
                <Sidebar resize={resize} backNavigation={() => history.push('/')} />
            }
            <div className="canvasDiv" >
                {!isBimAvial ? <UploadFile showBimModel={showBimModel} /> :
                    <>
                        {context.state.geometryLoaded && context.state.activeGeometryName === '3D-Views' && <CubeNavigaion canvas={canvas} />}
                        <canvas id="canvas" className="canvasStyle"></canvas>
                        {context.state.geometryLoaded ? <ActionPanel /> : null}
                        {!context.state.geometryLoaded && context.state.viewer ?
                            <div className="loading-info2">
                                <CircularProgress color="inherit" /><br />
                                Loading Model...
                            </div> : null
                        }
                        {!context.state.visualizeJS ?
                            <div className="loading-info">
                                <span className='libProgress'>{libProgress + '%'}</span><br />
                                {"Loading Library..."}
                            </div> : null
                        }
                        {context.state.geometryLoaded && !context.state.isActiveViewSaved
                            && !context.state.isActiveViewSystemCustom && <TimeLineContainer />}
                    </>
                }
            </div>
            {isUpdating && isBimAvial && <div className="loading-info3">Updating Model...</div>}
        </div>
    )
}