import React, { ReactElement, useContext, useEffect, useState } from "react";
import { match, useHistory, useRouteMatch } from "react-router-dom";
import { useDebounce } from "../../../../../customhooks/useDebounce";
import { client } from "../../../../../services/graphql";
import { projectFeatureAllowedRoles } from "../../../../../utils/role";
import { setIsLoading } from "../../../../root/context/authentication/action";
import { stateContext } from "../../../../root/context/authentication/authContext";
import DrawingViewerHeader from "../../components/DrawingViewerHeader/DrawingViewerHeader";
import DrawingViewerLeftBar from "../../components/DrawingViewerLeftBar/DrawingViewerLeftBar";
import PdfViewer from "../../components/PdfViewer/PdfViewer";
import {
  ACTIVATE_DRAWING_USER_Session_Status,
  DEACTIVATE_DRAWING_SESSION,
  DEACTIVATE_DRAWING_USER_Session_Status,
  FETCH_DRAWING_SHEET,
  FETCH_DRAWING_SHEET_VERSION,
  FETCH_PUBLISHED_DRAWINGS_VIEWER,
  FETCH_SESSION_BASED_ON_DRAWING,
} from "../../graphql/queries/drawingSheets";
import "./DrawingSheetViewer.scss";
import Notification, {
  AlertTypes,
} from "../../../../shared/components/Toaster/Toaster";
import { postApi } from "../../../../../services/api";
import { DrawingLibDetailsContext } from "../../context/DrawingLibDetailsContext";
import {
  setCollabrationEnabled,
  setDrawingAnnotationLists,
  setDrawingSheetList,
  setDrawingVersionLists,
  setDrawingViewerUrl,
  setDrawingSessionId,
  setActiveSessionUsers,
  setSessionCreated,
  setIsLoadingSession,
} from "../../context/DrawingLibDetailsAction";
import NoDataMessage from "../../../../shared/components/NoDataMessage/NoDataMessage";
import { ACTIVE_USER_SUBSCRIPTION, ANNOTATION_SUBSCRIBE, FETCH_ANNOTATION } from "../../graphql/queries/annotations";
import { decodeExchangeToken, decodeProjectFormExchangeToken } from "src/services/authservice";
import MenuOpenIcon from '@material-ui/icons/MenuOpen';
import Tooltip from "@material-ui/core/Tooltip";

export interface Params {
  projectId: string;
  drawingId: string;
}

const noPermissionMessage = `You don't have permission to view drawing viewer`;
let annotationSubscription: any;
let activeUserSubscription: any;
let CurrentDrawingSessionId='';

let drawingAnnotationLists : Array<any> = [];
export default function DrawingSheetViewer(): ReactElement {
  const history = useHistory();
  const pathMatch: match<Params> = useRouteMatch();
  const { dispatch, state }: any = useContext(stateContext);
  const [drawingSheetsDetails, setDrawingSheetsDetails] = useState<any>([]);
  const [searchSheetText, setSearchSheetText] = useState("");
  const debounceName = useDebounce(searchSheetText, 1000);
  const [searchLayerText, setSearchLayerText] = useState("");
  const debounceLayerName = useDebounce(searchLayerText, 1000);
  const { DrawingLibDetailsDispatch, DrawingLibDetailsState }: any = useContext(
    DrawingLibDetailsContext
  );
  const [showLeftSideBar, setShowLeftSideBar] = useState(false);
  const observer = client.subscribe({
    query:ANNOTATION_SUBSCRIBE,
    variables:{
      drawingId: pathMatch.params.drawingId,
    },
    context:{role: projectFeatureAllowedRoles.viewDrawings, token: state.selectedProjectToken}
  });
  
  const activeUserObserver= client.subscribe({
    query: ACTIVE_USER_SUBSCRIPTION,
    variables:{
      drawingId: pathMatch.params.drawingId
    },
    context:{role: projectFeatureAllowedRoles.viewDrawings, token: state.selectedProjectToken}
  })

  useEffect(() => {
    if(Number(pathMatch.params.projectId)>0){
      if (pathMatch.path.includes("/drawings/projects/") && pathMatch.path.includes("/pdf-viewer") && state.selectedProjectToken &&
        state?.projectFeaturePermissons?.canviewDrawings) {
        fetchPublishedDrawings();
        fetchDrawingSheet(true);
        fetchDrawingAnnotation();
      }
    } else {
      history.push('/');
    }
  }, [state.selectedProjectToken, pathMatch.params.projectId]);
  

  useEffect(() => {
    if(state.selectedProjectToken){
      const role = {'project': "viewDrawings"};
      sessionStorage.setItem("X-Hasura-Role", JSON.stringify(role));
      DrawingLibDetailsDispatch(setDrawingAnnotationLists([]));
      if(pathMatch.path.includes("/drawings/projects/") && pathMatch.path.includes("/pdf-viewer") && state.selectedProjectToken &&
      state?.projectFeaturePermissons?.canviewDrawings){
        fetchDrawingSheet(false)
        fetchDrawingAnnotation();
      }
      if(pathMatch.params.drawingId){
        fetchDrawingSessions();
      }
    }
    return ()=>{
      if(CurrentDrawingSessionId){
        deactivateSessionStatus(CurrentDrawingSessionId);
        DrawingLibDetailsDispatch(setDrawingSessionId(''));
        DrawingLibDetailsDispatch(setSessionCreated(true));
        if(annotationSubscription){ 
          annotationSubscription.unsubscribe();
          drawingAnnotationLists = [];
        }
        if(activeUserSubscription){
          activeUserSubscription.unsubscribe();
        }
      }
    }
  }, [pathMatch.params.drawingId, state.selectedProjectToken])
  

  useEffect(() => {
    drawingAnnotationLists = DrawingLibDetailsState?.drawingAnnotationLists
  }, [DrawingLibDetailsState?.drawingAnnotationLists]);
  
  useEffect(() => {
    CurrentDrawingSessionId= DrawingLibDetailsState.drawingSessionId;
  }, [DrawingLibDetailsState.drawingSessionId])
  


  useEffect(() => {
    return () => {
      DrawingLibDetailsDispatch(setDrawingSheetList([]));
      DrawingLibDetailsDispatch(setDrawingViewerUrl(null));
      DrawingLibDetailsDispatch(setDrawingVersionLists([]));
      DrawingLibDetailsDispatch(setDrawingAnnotationLists([]));
    };
  }, []);

  useEffect(() => {
    // window.addEventListener('beforeunload', alertUser)
    window.addEventListener('unload', handleUnload)
    return () => {
      // window.removeEventListener('beforeunload', alertUser)
      window.removeEventListener('unload', handleUnload)
    }
  }, [])

  useEffect(() => {
    if(state.isAboutToLogout && CurrentDrawingSessionId){
      deactivateSessionStatus(CurrentDrawingSessionId);
    }
  }, [state.isAboutToLogout])

  const handleUnload = () => {
    deactivateSessionStatus(CurrentDrawingSessionId);
  }

  useEffect(() => {
    refreshList();
  }, [debounceName]);

  useEffect(() => {
    if(DrawingLibDetailsState.sessionCreated){
      fetchDrawingSessions();
    }
  }, [DrawingLibDetailsState.sessionCreated]);
  

  const fetchDrawingSessions= async ()=>{
    try{

      const drawingSessionResponse= await client.query({
        query: FETCH_SESSION_BASED_ON_DRAWING,
        variables:{
          drawingId: pathMatch.params.drawingId
        },
        fetchPolicy: "network-only",
        context: {
          role: projectFeatureAllowedRoles.viewDrawings,
          token: state.selectedProjectToken,
        },
        
      });
      DrawingLibDetailsDispatch(setSessionCreated(false));
      if(drawingSessionResponse.data.dwgSession.length>0){
        DrawingLibDetailsDispatch(setDrawingSessionId(drawingSessionResponse.data.dwgSession[0].id));
       const currentUser = drawingSessionResponse.data.dwgSession[0].dwgUserSessionAssociations
       .find((item: any)=>item.userId == decodeExchangeToken().userId);
       if(currentUser){
        subscribeToAnnotations();
        subscribeToActiveUsers();
        if(currentUser.status){
          DrawingLibDetailsDispatch(setCollabrationEnabled(true));
        } else{
          activateSessionStatus(drawingSessionResponse.data.dwgSession[0].id);
        }
       }
      } else{
        DrawingLibDetailsDispatch(setCollabrationEnabled(false));
        DrawingLibDetailsDispatch(setActiveSessionUsers([]));
      }
      DrawingLibDetailsDispatch(setIsLoadingSession(false));
    } catch(error: any){
      console.log(error);
      DrawingLibDetailsDispatch(setIsLoadingSession(false));
    }
  }

  const activateSessionStatus= async (argSessionId: string)=>{
    try{
      const allowedRoles= decodeProjectFormExchangeToken(state.selectedProjectToken).allowedRoles;
      const role= allowedRoles.includes(projectFeatureAllowedRoles.createDrawings)?projectFeatureAllowedRoles.createDrawings:"";
      await client.mutate({
        mutation: ACTIVATE_DRAWING_USER_Session_Status,
        variables:{
          drawingSessionId: argSessionId,
          userId: decodeExchangeToken().userId
        },
        context:{
          role,
          token: state.selectedProjectToken,
         }
      })
      DrawingLibDetailsDispatch(setCollabrationEnabled(true));
    } catch(error: any){

    }
  }

  const deactivateSessionStatus= async (argSessionId: string)=>{
    try{
      const allowedRoles= decodeProjectFormExchangeToken(state.selectedProjectToken).allowedRoles;
      const role= allowedRoles.includes(projectFeatureAllowedRoles.createDrawings)?projectFeatureAllowedRoles.createDrawings:'';
      if(argSessionId){
        await client.mutate({
          mutation: DEACTIVATE_DRAWING_USER_Session_Status,
          variables:{
            drawingSessionId: argSessionId,
            userId: decodeExchangeToken().userId
          },
          context:{
            role,
            token: state.selectedProjectToken,
           }
        })
        DrawingLibDetailsDispatch(setCollabrationEnabled(false));
        const drawingSessionResponse= await client.query({
          query: FETCH_SESSION_BASED_ON_DRAWING,
          variables:{
            drawingId: pathMatch.params.drawingId
          },
          fetchPolicy: "network-only",
          context: {
            role: projectFeatureAllowedRoles.viewDrawings,
            token: state.selectedProjectToken,
          },
        });
        if(drawingSessionResponse.data.dwgSession.length>0){
          const activeUsers = drawingSessionResponse.data.dwgSession[0].dwgUserSessionAssociations
          .filter((item: any)=> item.status);
          if(activeUsers.length===0){
            await client.mutate({
              mutation: DEACTIVATE_DRAWING_SESSION,
              variables:{
                drawingSessionId: argSessionId
              },
              context:{
                role,
                token: state.selectedProjectToken,
               }
            })
          }
        }
        CurrentDrawingSessionId='';
      }
    } catch(error: any){
      console.log(error);
    }
  }

  const subscribeToAnnotations=()=>{
      if(annotationSubscription){ 
        annotationSubscription.unsubscribe();
      }
      annotationSubscription = observer.subscribe((response)=>{
      const drawingLibraries: any = [];
      if (response?.data?.annotations.length > 0) {
        response?.data?.annotations.forEach((item: any) => {
          drawingLibraries.push(item);
        });
      }
      DrawingLibDetailsDispatch(setDrawingAnnotationLists(drawingLibraries));
    },(error: any)=>{
      console.log(error);
    })
  }

  const subscribeToActiveUsers= async ()=>{
      if(activeUserSubscription){ 
        activeUserSubscription.unsubscribe();
      }
      activeUserSubscription = activeUserObserver.subscribe((response)=>{
        if(response.data.dwgSession.length>0){
          DrawingLibDetailsDispatch(setActiveSessionUsers(response.data.dwgSession[0].dwgUserSessionAssociations?
            JSON.parse(JSON.stringify(response.data.dwgSession[0].dwgUserSessionAssociations)):[]));
        }
      },(error: any)=>{
        console.log(error);
        location.reload();
      })
  }

  const refreshList = () => {
    if(state.selectedProjectToken && state?.projectFeaturePermissons?.canviewDrawings){
        fetchPublishedDrawings();
    }
}

  const navigateBack = () => {
    history.push(`/drawings/projects/${pathMatch.params.projectId}/lists`);
  };

  //fetch published drawing
  const fetchPublishedDrawings = async () => {
    try {
      dispatch(setIsLoading(true));
      const drawingLibraryResponse = await client.query({
        query: FETCH_PUBLISHED_DRAWINGS_VIEWER,
        variables: {
          searchText: `%${debounceName}%`,
          offset: 0,
          limit: 10000,
          currentDrawing: true,
          sortColumn:'drawingNumber'
        },
        fetchPolicy: "network-only",
        context: {
          role: projectFeatureAllowedRoles.viewDrawings,
          token: state.selectedProjectToken,
        },
      });
      const drawingLibraries: any = [];
      if (drawingLibraryResponse?.data?.drawingSheet_query.data.length > 0) {
        drawingLibraryResponse?.data?.drawingSheet_query.data.forEach((item: any) => {
          drawingLibraries.push(item);
        });
        DrawingLibDetailsDispatch(setDrawingSheetList(drawingLibraries));
      }
      else{
        DrawingLibDetailsDispatch(setDrawingSheetList([]));
      }
      dispatch(setIsLoading(false));
    } catch (error) {
      console.log(error);
      Notification.sendNotification(error, AlertTypes.warn);
      dispatch(setIsLoading(false));
    }
  };

  const fetchDrawingSheet = async (isLoadVersion: boolean) => {
    try {
      dispatch(setIsLoading(true));
      const drawingLibraryResponse = await client.query({
        query: FETCH_DRAWING_SHEET,
        variables: {
          id: `${pathMatch.params.drawingId}`,
        },
        fetchPolicy: "network-only",
        context: {
          role: projectFeatureAllowedRoles.viewDrawings,
          token: state.selectedProjectToken,
        },
      });
      const drawingLibraries: any = [];
      if (drawingLibraryResponse?.data?.drawingSheets.length > 0) {
        drawingLibraryResponse?.data?.drawingSheets.forEach((item: any) => {
          drawingLibraries.push(item);
        });
      }
      if (drawingLibraries.length > 0) {
        setDrawingSheetsDetails(drawingLibraries[0]);
        if(isLoadVersion){
          getDrawingVersions(drawingLibraries[0])
        }
      }
      dispatch(setIsLoading(false));
    } catch (error) {
      console.log(error);
      Notification.sendNotification(error, AlertTypes.warn);
      dispatch(setIsLoading(false));
    }
  };

  const fetchDrawingAnnotation = async () => {
    try {
      dispatch(setIsLoading(true));
      const drawingAnnotationResponse = await client.query({
        query: FETCH_ANNOTATION,
        variables: {
          drawingId: `${pathMatch.params.drawingId}`,
        },
        fetchPolicy: "network-only",
        context: {
          role: projectFeatureAllowedRoles.viewDrawings,
          token: state.selectedProjectToken,
        },
      });
      const drawingLibraries: any = [];
      if (drawingAnnotationResponse?.data?.annotations.length > 0) {
        drawingAnnotationResponse?.data?.annotations.forEach((item: any) => {
          drawingLibraries.push(item);
        });
      }
      if (drawingLibraries.length > 0) {
       DrawingLibDetailsDispatch(setDrawingAnnotationLists(drawingLibraries));
      //  console.log(drawingLibraries)
      }else{
        DrawingLibDetailsDispatch(setDrawingAnnotationLists([]));
      }
      dispatch(setIsLoading(false));
    } catch (error) {
      console.log(error);
      Notification.sendNotification(error, AlertTypes.warn);
      dispatch(setIsLoading(false));
    }
  };

  const fetchSheetUrl = (drawing: any) => {
    const payload = [
      {
        fileName: `${drawing.drawingSequence}.pdf`,
        key: drawing.filePath,
        expiresIn: 100000,
        processed: true,
      },
    ];

    getSheetUrl(payload);
  };

  // get download link URL
  const getSheetUrl = async (payload: any) => {
    try {
      dispatch(setIsLoading(true));
      const fileUploadResponse = await postApi("V1/S3/downloadLink", payload);
      if (fileUploadResponse.success) {
        const fileData = {
          s3Key: payload[0].key,
          url: fileUploadResponse.success[0].url,
        };
        DrawingLibDetailsDispatch(setDrawingViewerUrl(fileData));
      }
      dispatch(setIsLoading(false));
    } catch (error) {
      Notification.sendNotification(error, AlertTypes.warn);
      dispatch(setIsLoading(false));
    }
  };

  const handleFetchSheetUrl = (drawing: any) => {
    fetchSheetUrl(drawing);
    getDrawingVersions(drawing);
  }

  const handleSarchSheetsText = (value: string) => {
    setSearchSheetText(value?.trim())
  }

  const handleSarchLayersText = (value: string) => {
    setSearchLayerText(value?.trim())
  }

  const getDrawingVersions = (sheetDetails: any) => {
    const payload = {
      drawingName: sheetDetails.drawingName,
      drawingNumber: sheetDetails.drawingNumber,
      setVersionName: sheetDetails.setVersionName,
      id: sheetDetails?.id
    }
    fetchDrawingVersions(payload);
  }

    //fetch published drawing
    const fetchDrawingVersions = async (payload: any) => {
      try {
        dispatch(setIsLoading(true));
        const drawingVersionsResponse = await client.query({
          query: FETCH_DRAWING_SHEET_VERSION,
          variables: {
            drawingName: payload.drawingName,
            drawingNumber: payload.drawingNumber,
            setVersionName: payload.setVersionName,
          },
          fetchPolicy: "network-only",
          context: {
            role: projectFeatureAllowedRoles.viewDrawings,
            token: state.selectedProjectToken,
          },
        });
        let drawingLibraries: any = [];
        if (drawingVersionsResponse?.data?.drawingSheets.length > 0) {
          let duplicateVesrion = [];
          drawingVersionsResponse?.data?.drawingSheets.forEach((item: any) => {
            duplicateVesrion = drawingLibraries.filter((dL: any) => dL?.setVersionDate == item.setVersionDate);
            drawingLibraries.push(item);
          });
          if(duplicateVesrion.length) {
            drawingLibraries = drawingLibraries.filter((dL: any)=> dL?.id == payload?.id);
          } 
          DrawingLibDetailsDispatch(setDrawingVersionLists(drawingLibraries));
        }
        dispatch(setIsLoading(false));
      } catch (error) {
        console.log(error);
        Notification.sendNotification(error, AlertTypes.warn);
        dispatch(setIsLoading(false));
      }
    };

    const chnageInAnnotation=(argValue: any)=>{
      drawingAnnotationLists = [...JSON.parse(JSON.stringify(drawingAnnotationLists)), argValue];
    }

  const showHideLeftBar = () => {
    setShowLeftSideBar(!showLeftSideBar)
  }


  return (
    <div className="viewer">
      <DrawingViewerHeader
        className="viewer__header"
        navigateBack={navigateBack}
        drawingSheetsDetails={drawingSheetsDetails}
        subscribe={subscribeToAnnotations}
      />
      {
        state?.projectFeaturePermissons?.canviewDrawings ? (
          <div className={showLeftSideBar ? "viewer__main": "viewer__main1"}>
            <>
              {
                showLeftSideBar ? (
                 <div>
                    <div className="viewer__collapseIcon">
                        <Tooltip title={'Hide drawing List'} aria-label="createdBy">
                          <MenuOpenIcon className="viewer__collapseIcon__icon" onClick={showHideLeftBar}/>
                        </Tooltip>
                    </div>
                      <DrawingViewerLeftBar fetchSheetUrl={handleFetchSheetUrl}
                        searchSheets={handleSarchSheetsText} 
                        searchSheetText={searchSheetText}
                        searchLayerText={searchLayerText}
                        searchLayers={handleSarchLayersText}
                      />
                  </div>
                ): (
                  <div>
                    <div className="viewer__collapseIcon">
                        <Tooltip title={'Show drawing List'} aria-label="createdBy">
                          <MenuOpenIcon className="viewer__collapseIcon__icon" onClick={showHideLeftBar}/>
                        </Tooltip> 
                    </div>
                  </div>

                )
              }
            </>
            <PdfViewer drawingSheetsDetails={drawingSheetsDetails} changeInAnnotation={chnageInAnnotation}/>
          </div>
        ) :
        state.projectFeaturePermissons &&
        (!state.projectFeaturePermissons?.canviewDrawings ?(
            <div className="noViewerPermission">
                <div className="no-permission">
                    <NoDataMessage message={noPermissionMessage}/> 
                </div>
            </div>
        ) : ('')) 
      }
    </div>
  );
}
