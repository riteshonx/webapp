import React, { ReactElement, useContext, useReducer, useState, useEffect } from 'react'
import { bimReducer, initialState } from '../../../contextAPI/bimReducer';
import { bimContext } from '../../../contextAPI/bimContext';
import ActionPanel from '../../component/ActionPanel/actionPanel';
import BimRightPanel from '../../component/BimRightPanel/BimRightPanel';
import TimeLineContainer from '../../component/TimeLineViewer/TimeLineContainer/TimeLineContainer';
import CubeNavigaion from '../../component/CubeNavigaion/cubeNavigaion';
import { setVisualizeJS, setOpenCloud, setViewer, setActiveModel, setIsGeometryLoaded, setSystemViewList, setActiveView, setIsActiveViewSaved, setUpdateFilter, setGeometryInfo, setActiveGeometryName, setIsAssembly, setAssemblyModelList, setJobrunnerVersion } from '../../../contextAPI/action';
import { postApi } from '../../../../../services/api';
import Sidebar from '../../component/Sidebar/Sidebar';
import FilterHook from '../../component/FilterHook/FilterHook';
import { projectFeatureAllowedRoles } from '../../../../../utils/role';
import { BIM_MODEL_STATUS, CREATE_BIM_SPATIAL_PROP, UPDATE_SPATIAL_STATUS } from '../../../graphql/bimUpload';
import { client } from '../../../../../services/graphql';
import { stateContext } from '../../../../root/context/authentication/authContext';
import Notification, { AlertTypes } from '../../../../shared/components/Toaster/Toaster';
import { CircularProgress } from '@material-ui/core';
import { decodeToken } from '../../../../../services/authservice';
import "./Viewer.scss"
import ODA from 'open-cloud-client';
import { setIsLoading } from '../../../../root/context/authentication/action';
import { match, useHistory, useRouteMatch, useLocation } from "react-router-dom";

let canvas: any = null;
let visualizeJS: any = null;
let openCloud: any = null;
let viewer: any = null;

export interface Params {
    projectId: string;
    modelId: string;
}

export default function Viewer(): ReactElement {
    const [bimState] = useReducer(bimReducer, initialState);
    const { dispatch, state }: any = useContext(stateContext);
    const context: any = useContext(bimContext);
    const [isBimAvial, setIsBimAvial] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [libProgress, setLibProgress] = useState(0);
    const pathMatch: match<Params> = useRouteMatch();
    const history = useHistory();
    const search = useLocation().search;
    const showEdges = new URLSearchParams(search).get('edges');

    useEffect(() => {
        if (state.selectedProjectToken && state?.projectFeaturePermissons?.canviewBimModel) {
            const modelId = context.state.activeModel || pathMatch.params.modelId;
            if (modelId) {
                context.dispatch(setIsGeometryLoaded(false));
                context.dispatch(setActiveGeometryName('3D-Views'));
                context.dispatch(setGeometryInfo([]));
                context.dispatch(setActiveView(null));
                context.dispatch(setSystemViewList([]));
                context.dispatch(setIsActiveViewSaved(false));
                context.dispatch(setActiveModel(modelId))
                setIsBimAvial(true)
                setIsUpdating(false);
                load3Dmodel(modelId)
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
    }, [state.selectedProjectToken, pathMatch.params.modelId])

    useEffect(() => {
        loadSheets();
    }, [context.state.activeGeometryName])


    const load3Dmodel = async (modelId: string) => {
        try {
            const client = await ODA.createClient({ serverUrl: "" })

            canvas = document.getElementById("canvas");
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;

            const modelInformation = await getModelInfo(modelId);
            context.dispatch(setJobrunnerVersion(modelInformation.jobrunnerVersion));

            openCloud = await client.createViewer({
                target: canvas,
                visualizeJsUrl: `https://opencloud.azureedge.net/libs/visualizejs/${modelInformation.jobrunnerVersion}/Visualize.js`,
                onprogress: (ev: any) => setLibProgress(((100 * ev.loaded) / ev.total) | 0)
            });

            visualizeJS = openCloud.visLib();
            viewer = openCloud.visViewer();

            console.log(openCloud, visualizeJS, viewer)

            context.dispatch(setViewer(viewer));
            context.dispatch(setOpenCloud(openCloud));
            context.dispatch(setVisualizeJS(visualizeJS));

            // window.addEventListener("resize", resize);
            viewer.setDefaultViewPositionWithAnimation(visualizeJS.DefaultViewPosition.k3DViewSE);
            viewer.setEnableWCS(false);

            const geometryInfo = modelInformation.geometryInfo;
            if (modelInformation) {
                context.dispatch(setGeometryInfo(geometryInfo))
                const s3Links = await fetchS3links(modelId, geometryInfo);
                await openModelFromS3(s3Links);
                if (modelInformation.isAssembly) {
                    context.dispatch(setIsAssembly(true))
                    context.dispatch(setAssemblyModelList(modelInformation.sourceModelIds))
                }
            }

            viewer.setEnableSceneGraph(true);
            viewer.setBackgroundColor([255, 255, 255]);
            viewer.fxaaAntiAliasing3d = true;
            viewer.fxaaQuality = 5;
            viewer.shadows = false;
            //viewer.lineSmoothing = true;
            viewer.getActiveDevice().invalidate([0, visualizeJS.canvas.clientWidth, visualizeJS.canvas.clientHeight, 0]);

            viewer.setHighlightColor(0xFF, 0x98, 0x00, 125);
            viewer.zoomExtents();
            context.dispatch(setIsGeometryLoaded(true));

            if (modelInformation && !modelInformation.spatialPropertyStatus && !modelInformation.isAssembly) {
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
                setIsUpdating(true)
                dispatch(setIsLoading(true));
                const s3Links = await fetchS3links(context.state.activeModel, context.state.geometryInfo, context.state.activeGeometryName);
                await openModelFromS3(s3Links);
                setIsUpdating(false)
                if (context.state.activeGeometryName === '3D-Views' && (context.state.isActiveViewSaved || context.state.isActiveViewSystemCustom)) {
                    context.dispatch(setUpdateFilter(context.state.updateFilter + 1))
                }
                dispatch(setIsLoading(false));
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
                        if (showEdges === 'false') {
                            const styleIdList = []
                            const iter = openCloud.visViewer().getVisualStylesIterator();
                            for (; !iter.done(); iter.step()) {
                                const vs = iter.getVisualStyle();
                                styleIdList.push(vs.openObject().getName())
                            }
                            styleIdList.forEach((id: string) => {
                                if ((
                                    id.length &&
                                    !id[id.length - 1].match(new RegExp('OdBmOverridden'))) ||
                                    id === 'OdBmDBView3d' || id === 'OpenCloud') {
                                    const lib = openCloud.visLib();
                                    const visualStyleId = openCloud.visViewer().findVisualStyle(id);
                                    const visualStylePtr = visualStyleId.openObject();
                                    visualStylePtr.setOptionInt32(lib.VisualStyleOptions.kEdgeModel, 0, lib.VisualStyleOperations.kSet);
                                    visualStylePtr.setOptionInt32(lib.VisualStyleOptions.kEdgeStyles, 0, lib.VisualStyleOperations.kSet);
                                    visualStylePtr.setOptionInt32(lib.VisualStyleOptions.kEdgeModifiers, 0, lib.VisualStyleOperations.kSet);
                                    visualStylePtr.delete();
                                }
                            })
                        }
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

    async function iterrateOverElements(operFun: any) {
        const iter = viewer.getCDATreeIterator();
        const tree = iter.getCDATreeStorage().getTree();
        const node = tree.getDatabaseNode();
        const childrens = node.getChildren()

        async function findChildrens(childrens: any): Promise<any> {
            const promises: any = []
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
        const promises: any = []

        const updateSpatialPropertyList = (spatialProperty: any, entityId: any, entity: any, child: any) => {
            if (child.getChildren().length() <= 0) {
                if (entityId.getType() !== 0) {
                    const extents = entity.getExtents();
                    if (extents.isValidExtents()) {
                        spatialProperty.push({
                            handleId: parseInt(child.getUniqueSourceID()),
                            minBoundingBox: extents.min(),
                            maxBoundingBox: extents.max(),
                            centerBoundingBox: extents.center(),
                        })
                    }
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
        history.push(`/bim/${pathMatch.params.projectId}/list`)
    }

    return (
        <div className="bimMainContainer">
            <Sidebar resize={resize} backNavDescp="Back to Upload Details" backNavigation={backToUploadDetails} />
            <div className="canvasDiv" >
                {context.state.geometryLoaded && context.state.activeGeometryName === '3D-Views' && <CubeNavigaion canvas={canvas} />}
                <canvas id="canvas" className="canvasStyle"></canvas>
                {context.state.geometryLoaded ? <ActionPanel /> : null}
                {context.state.geometryLoaded ? <BimRightPanel /> : null}
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
            </div>
            {isUpdating && isBimAvial && <div className="loading-info3">Updating Model...</div>}
            <FilterHook />
        </div>
    )
}