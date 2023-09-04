/* eslint-disable max-len */
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { match, useHistory, useRouteMatch } from 'react-router-dom';
import { client } from '../../../../../services/graphql';
import { myProjectRole, projectFeatureAllowedRoles } from '../../../../../utils/role';
import { setIsLoading } from '../../../../root/context/authentication/action';
import { stateContext } from '../../../../root/context/authentication/authContext';
import DrawingHeaders from '../../components/DrawingHeaders/DrawingHeaders'
import DrawingSheetsMain from '../../components/DrawingSheetsMain/DrawingSheetsMain'
import { FETCH_DRAWING_LIBRARY_DATA, 
    FETCH_DRAWING_SHEETS_DATA, 
    PUBLISH_DRAWING, 
    SPLIT_DRAWING_NUMBER, 
    UPDATE_DRAWING_LIBRARY, UPDATE_DRAWING_LIBRARY_ROTATION, UPDATE_DRAWING_LIBRARY_STATUS } from '../../graphql/queries/drawing';
import Notification,{ AlertTypes } from '../../../../shared/components/Toaster/Toaster'
import './DrawingReview.scss';
import { DrawingLibDetailsContext } from '../../context/DrawingLibDetailsContext';
import { setDrawingLibDetails, 
         setDrawingSheetsDetails, 
         setIsPublishEnabled,
         setLastAutoGenNum,
         setPublishedDrawingLists } from '../../context/DrawingLibDetailsAction';
import PdfTron from '../../components/PdfTron/PdfTron';
import NoDataMessage from '../../../../shared/components/NoDataMessage/NoDataMessage';
import Header from '../../../../shared/components/Header/Header';
import moment from 'moment';
import { FETCH_PROJECT_USERS_LIST, FETCH_PUBLISHED_DRAWINGS_DATA } from '../../graphql/queries/drawingSheets';
import { PublishEmailTemplate } from 'src/modules/drawings/templates/publish';
import { decodeExchangeToken } from 'src/services/authservice';
import { features } from 'src/utils/constants';
import { axiosApiInstance } from 'src/services/api';

export interface Params {
    projectId: string;
    documentId: string;
}

const noPermissionMessage = `You don't have permission to publish drawings`;
const published = `This drawing is already published`;
const NOTIFICATION_URL: any = process.env["REACT_APP_NOTIFICATION_URL"];
const NOTIFICATION_PATH = "V1/notification";

export default function DrawingReview(): ReactElement {

    const history = useHistory();
    const pathMatch: match<Params>= useRouteMatch();
    const {dispatch, state }:any = useContext(stateContext);
    const {DrawingLibDetailsState, DrawingLibDetailsDispatch}: any = useContext(DrawingLibDetailsContext);
    const [fileName, setFileName] = useState<any>({name: '', description: ''});
    const [drawingSheetsDetails, setDrawingSheetsDetailsState] = useState<any>([]);
    const [loadPage, setLoadPage] = useState(false)
    const [isDrawingPublished, setIsDrawingPublished] = useState(false)
    const [drawingSheetList, setDrawingSheetList] = useState<any>([]);
    const [isReviewExpand, setIsReviewExpand] = useState(false);
    const [usersList, setUsersList] = useState<Array<any>>([]);

    useEffect(() => {
        if(state.selectedProjectToken){
            fetchPublishedDrawings();
            fetchDrawingLibraryDetails();
            fetchDrawingSheetsData();
            fetchProjectUsers();
        }
    }, [state.selectedProjectToken, pathMatch.params.documentId ]);

    useEffect(() => {
       if(DrawingLibDetailsState.drawingLibDetails.length > 0 && DrawingLibDetailsState.isAutoUpdate){
            updateDrawingLibrary(false)
       }
    }, [DrawingLibDetailsState?.drawingCategoryDetails, 
        DrawingLibDetailsState?.drawingVersionDetails])

    useEffect(() => {
        if(DrawingLibDetailsState.drawingLibDetails.length > 0 && DrawingLibDetailsState.isAutoUpdate){
            // updateDrawingSheetData(false);
        }    
    }, [DrawingLibDetailsState?.drawingSheetsDetails])


    //fetch drawing libraries
    const fetchDrawingLibraryDetails = async()=>{
        try{
            dispatch(setIsLoading(true));

            const drawingLibraryResponse = await client.query({
                query: FETCH_DRAWING_LIBRARY_DATA,
                variables:{
                    drawingId: pathMatch.params.documentId,
                },
                fetchPolicy: 'network-only',
                context:{role: projectFeatureAllowedRoles.viewDrawings, token: state.selectedProjectToken}
            });
            const drawingLibraryDetails: any = [];
            if(drawingLibraryResponse?.data?.drawingUploadStatus.length > 0){
                drawingLibraryResponse?.data?.drawingUploadStatus?.forEach((drawing:any) => {
                    drawingLibraryDetails.push(drawing)
                    const headerInfo = {...fileName, name: drawing.fileName}
                    setFileName(headerInfo)
                })
                const drawingLibraryDetailsCopy = JSON.parse(JSON.stringify(drawingLibraryDetails));
                drawingLibraryDetailsCopy[0]?.status === 'PUBLISHED' ? setIsDrawingPublished(true) : setIsDrawingPublished(false)
                if(drawingLibraryDetailsCopy[0]?.sheetsReviewed?.sheets?.length > 0){
                    if(!drawingLibraryDetailsCopy[0]?.sheetsReviewed?.sheets[0]?.autoGenNum){
                        drawingLibraryDetailsCopy[0].sheetsReviewed.sheets[0].autoGenNum = 0;
                        DrawingLibDetailsDispatch(setLastAutoGenNum(0));
                    }else{
                        const autoNum = Number(drawingLibraryDetailsCopy[0].sheetsReviewed.sheets[0].autoGenNum)
                        DrawingLibDetailsDispatch(setLastAutoGenNum(autoNum));
                    }
                }
                DrawingLibDetailsDispatch(setDrawingLibDetails(drawingLibraryDetailsCopy));
                setDrawingSheetsDetailsState(drawingLibraryDetails[0])
            }
            setLoadPage(true)
            dispatch(setIsLoading(false));
        }catch(error:any){
            console.log(error);
            if(error?.toString().includes('invalid input syntax for type uuid')){
                setTimeout(() => {
                    history.push(`/drawings/projects/${pathMatch.params.projectId}/drawing-management`);
                }, 1000)
            }
            Notification.sendNotification(error, AlertTypes.warn);
            dispatch(setIsLoading(false));
        }
    }

    const fetchProjectUsers = async () => {
        try {
            const projectTeammatesResponse= await client.query({
                query:FETCH_PROJECT_USERS_LIST,
                variables:{
                    projectId: Number(pathMatch.params.projectId),
                    featureId: [5]
                },
                fetchPolicy: 'network-only',
                context:{role: myProjectRole.viewMyProjects }
                });
            const users: Array<any> =[];
             projectTeammatesResponse?.data.projectAssociation.forEach((item: any)=>{
                const userItem= {
                    id: item?.user?.id,
                    firstName:item?.user?.firstName,
                    lastName:item?.user?.lastName,
                    email: item?.user?.email,
                    status: item?.status
                }
                users.push(userItem);
            });
            setUsersList(users);
        } catch (error : any) {
            console.log(error);
        }
    }

    //fetch drawing sheets data for review
    const fetchDrawingSheetsData = async () => {
        try{
            dispatch(setIsLoading(true));

            const drawingSheetsResponse = await client.query({
                query: FETCH_DRAWING_SHEETS_DATA,
                variables:{
                    sourceId: pathMatch.params.documentId,
                },
                fetchPolicy: 'network-only',
                context:{role: projectFeatureAllowedRoles.uploadDrawings, token: state.selectedProjectToken}
            });
            const drawingSheetsResponseList: any = [];
            if(drawingSheetsResponse?.data?.drawingSheets?.length > 0){
                drawingSheetsResponse?.data?.drawingSheets.forEach((item: any) => {
                    drawingSheetsResponseList.push(item);
                })
            }

            const drawingLibraryDetailsCopy = JSON.parse(JSON.stringify(drawingSheetsResponseList));
            const mapSheetData : any = [];
            if(drawingLibraryDetailsCopy?.length > 0){
                drawingLibraryDetailsCopy.forEach((item: any) => {
                    // const reviewInfo = {
                    //     review: item?.revisionInfo ? item?.revisionInfo?.review : false,
                    //     status: item?.revisionInfo ? item?.revisionInfo?.status : '',
                    //     autoGenNum: item?.revisionInfo ? (item?.revisionInfo?.autoGenNum ? item.revisionInfo.autoGenNum : 0) : 0,
                    //     isInvalidDwgNo : item?.revisionInfo ? item?.revisionInfo?.isInvalidDwgNo : false,
                    //     templateID: DrawingLibDetailsState?.drawingLibDetails[0]?.drawingTemplateFormat?.id
                    // }

                    const data: any = {}

                        data.id = item.id,
                        data.category = item.drawingCategory ? item.drawingCategory : '',
                        data.dwgname = item.drawingName ? item.drawingName : '',
                        data.dwgnum = item.drawingNumber ? item.drawingNumber : '',
                        data.drawingSequence = item.drawingSequence,
                        data.drawing_classification = item.dwgClassification ? item.dwgClassification : '',
                        data.drawing_level = item.dwgLevel ? item.dwgLevel : '',
                        data.drawing_originator = item.dwgOriginator ? item.dwgOriginator : '',
                        data.drawing_project_number = item.dwgProjectNumber ? item.dwgProjectNumber : '',
                        data.drawing_revision = item.dwgRevision ? item.dwgRevision : '',
                        data.drawing_role = item.dwgRole ? item.dwgRole : '',
                        data.drawing_sheet_number = item.dwgSheetNumber ? item.dwgSheetNumber : '',
                        data.drawing_status = item.dwgStatus ? item.dwgStatus : '',
                        data.drawing_suitability = item.dwgSuitability ? item.dwgSuitability : '',
                        data.drawing_type = item.dwgType ? item.dwgType : '',
                        data.drawing_volume = item.dwgVolume ? item.dwgVolume : '',
                        data.revisionInfo = item?.revisionInfo ? item?.revisionInfo : {},
                        data.drawing_zone = item.dwgZone ? item.dwgZone : '',

                    mapSheetData.push(data)
                })
            }
            setDrawingSheetList(mapSheetData)
            DrawingLibDetailsDispatch(setDrawingSheetsDetails([...mapSheetData]));
            dispatch(setIsLoading(false));
        }catch(error:any){
            console.log(error);
            Notification.sendNotification(error, AlertTypes.warn);
            dispatch(setIsLoading(false));
        }
    }

    const navigateBack = () => {
        history.push(`/drawings/projects/${pathMatch.params.projectId}/drawing-management`);
    }

    const updateDrawingLibrary = async (isLoader: boolean) => {
        try{
            if(isLoader){
                dispatch(setIsLoading(true));
            }
            const versionInfo: any = {
                versionInfo: {
                    Set_Title:  DrawingLibDetailsState.drawingVersionDetails?.Set_Title ? 
                                DrawingLibDetailsState.drawingVersionDetails?.Set_Title : '',
                    Version_Date: DrawingLibDetailsState.drawingVersionDetails?.Version_Date ? 
                                DrawingLibDetailsState.drawingVersionDetails?.Version_Date : '',
                    Set_Version_Name: DrawingLibDetailsState.drawingVersionDetails?.Set_Version_Name ? 
                                DrawingLibDetailsState.drawingVersionDetails?.Set_Version_Name : ''
                  }
            }

            const versionInfoData = DrawingLibDetailsState?.drawingVersionDetails;
            const momentDate = versionInfoData.Version_Date ? moment(versionInfoData.Version_Date).format('DD-MMM-YYYY') : '';
            const momentUtc = momentDate ? moment(momentDate).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'): ''
            const resDate = momentUtc && momentUtc !== 'Invalid date' ? momentUtc : null;

            const updateDrawingResponse: any = await client.mutate({
                mutation: UPDATE_DRAWING_LIBRARY,
                variables: {
                    id: pathMatch.params.documentId,
                    categoriesReviewed: {categories: DrawingLibDetailsState.drawingCategoryDetails},
                    versionInfoReviewed: versionInfo,
                    status: 'REVIEWING',
                    setTitle: versionInfo.versionInfo.Set_Title,
                    setVersionName: versionInfo.versionInfo.Set_Version_Name,
                    setVersionDate: resDate || null
                },
                context:{role: projectFeatureAllowedRoles.uploadDrawings, token: state.selectedProjectToken}
            })
            if(updateDrawingResponse?.data?.update_drawingUploadStatus?.affected_rows > 0 && isLoader){
                Notification.sendNotification("Document updated successfully", AlertTypes.success);
                history.push(`/drawings/projects/${pathMatch.params.projectId}/lists`);
            }
            dispatch(setIsLoading(false));
        }
        catch(err: any){
            dispatch(setIsLoading(false));
            Notification.sendNotification(err, AlertTypes.warn);
            console.log(err)
        }
    }

    const handlePublishDrawings = () => {
        publishDocument()
    }

    const publishDocument= async ()=>{
        try{
            dispatch(setIsLoading(true));
            notifyProjectUsers();
            const publishResponse: any = await client.mutate({
                mutation: PUBLISH_DRAWING,
                variables:{
                    sourceId: pathMatch.params.documentId,
                },
                context:{role: projectFeatureAllowedRoles.createDrawings, token: state.selectedProjectToken}
            })
            if(publishResponse?.data?.publishDrawing_mutation?.message === 'Published succesfully'){
                Notification.sendNotification("Drawing published successfully", AlertTypes.success);
                updateDrawingLibraryStatus()
            }
            dispatch(setIsLoading(false));
        }catch(err: any){
            dispatch(setIsLoading(false));
            Notification.sendNotification(err, AlertTypes.warn);
            Notification.sendNotification('Publish Failed', AlertTypes.warn);
            console.log(err)
        }
    }

    // call this query inside publish API
    const updateDrawingLibraryStatus = async () => {
        try{
            dispatch(setIsLoading(true));
            const updateDrawingResponse: any = await client.mutate({
                mutation: UPDATE_DRAWING_LIBRARY_STATUS,
                variables: {
                    id: pathMatch.params.documentId,
                    status: 'PUBLISHED'
                },
                context:{role: projectFeatureAllowedRoles.uploadDrawings, token: state.selectedProjectToken}
            })
            if(updateDrawingResponse?.data?.update_drawingUploadStatus?.affected_rows > 0){
                history.push(`/drawings/projects/${pathMatch.params.projectId}/lists`);
            }
            
            dispatch(setIsLoading(false));
        }
        catch(err: any){
            dispatch(setIsLoading(false));
            Notification.sendNotification(err, AlertTypes.warn);
            console.log(err)
        }
    }


    //fetch published drawing lists for validation
    const fetchPublishedDrawings = async()=>{
        try{
            dispatch(setIsLoading(true));
            const drawingLibraryResponse = await client.query({
                query: FETCH_PUBLISHED_DRAWINGS_DATA,
                variables:{
                    offset: 0,
                    limit: 10000,
                },
                fetchPolicy: 'network-only',
                context:{role: projectFeatureAllowedRoles.viewDrawings, token: state.selectedProjectToken}
            });
            const drawingLibraries: any = [];
            let uniqueDrawingVersions: any = [];
            if(drawingLibraryResponse?.data?.drawingSheets.length > 0){
                drawingLibraryResponse?.data?.drawingSheets.forEach((item: any) => {
                    const newItem= JSON.parse(JSON.stringify(item));
                    const versionInfo = {
                        Set_Title: newItem.setTitle,
                        Version_Date: moment(newItem.setVersionDate).format('DD-MMM-YYYY').toString(), //convert 4-OCt-2021 format
                        Set_Version_Name: newItem.setVersionName,
                        sourceId: newItem.sourceId
                    }
                    drawingLibraries.push(versionInfo);
                })

            }   

            if(drawingLibraries.length > 0){
                const arrayUniqueByKey: any = new Map(drawingLibraries.map((item: any) =>
                    [item['sourceId'], item])).values();
                uniqueDrawingVersions = [...arrayUniqueByKey];
            }
            
            //get category list from here
            DrawingLibDetailsDispatch(setPublishedDrawingLists(JSON.parse(JSON.stringify(uniqueDrawingVersions))));
            dispatch(setIsLoading(false));
            
        }catch(error: any){
            console.log(error);
            if(error?.toString().includes('invalid input syntax for type uuid')){
                setTimeout(() => {
                    history.push(`/drawings/projects/${pathMatch.params.projectId}/drawing-management`);
                }, 1000)
            }
            Notification.sendNotification(error, AlertTypes.warn);
            dispatch(setIsLoading(false));
        }
    }

    const handleSplitDrawingNumber = (splitKey: string) => {
        const payload = {...DrawingLibDetailsState?.localSplittedNumber}
        payload.dwgNumberSplitted = DrawingLibDetailsState?.localSplittedNumber.dwgNumberSplitted.filter((item: any) => item.field)
        payload.splitKey = splitKey
        splitDrawingNumber(payload);
    }

    //split drawing number format
    const splitDrawingNumber = async (payload: any)=>{
        try{
            dispatch(setIsLoading(true));
            const splitDrawingNumberResponse = await client.mutate({
                mutation: SPLIT_DRAWING_NUMBER,
                variables:{
                    drawingNumFormat: payload,
                    sourceId: pathMatch.params.documentId 
                },
                context:{role: projectFeatureAllowedRoles.uploadDrawings, token: state.selectedProjectToken}
            })

            if(splitDrawingNumberResponse?.data?.update_drawingNumberFormat_mutation?.message === "Updated successfully"){
                Notification.sendNotification("Drawing number split successfully", AlertTypes.success);
                fetchDrawingLibraryDetails();
                fetchDrawingSheetsData();
            }
            dispatch(setIsLoading(false));
        }catch(err: any){
            dispatch(setIsLoading(false));
            Notification.sendNotification(err, AlertTypes.warn);
            console.log(err)
        }
    }

    const toggleReview = () => {
        setIsReviewExpand(!isReviewExpand)
    }

    const updateRotation = (rotation:  number) => {
        updateDrawingRotation(rotation)
    }

    const updateDrawingRotation = async (rotation: number) => {
        try{
            await client.mutate({
                mutation: UPDATE_DRAWING_LIBRARY_ROTATION,
                variables: {
                    id: pathMatch.params.documentId,
                    sheetsReviewed: {
                        sheets: [],
                        pdfRotation: rotation
                    },
                },
                context:{role: projectFeatureAllowedRoles.uploadDrawings, token: state.selectedProjectToken}
            })
  
        }
        catch(err: any){
            Notification.sendNotification(err, AlertTypes.warn);
            console.log(err)
        }
    }

    const frameEmailPayload=()=>{
        const users = [...usersList];
        const selectedUsers = users?.filter((user: any) => decodeExchangeToken().userId !== user.id)
        ?.map((item: any) => ({id: item.id, email: item.email}));
        const host= `${location.protocol}//${location.host}`;
        const redirectionUrl = `${host}/drawings/projects/${pathMatch.params.projectId}/pdf-viewer/${pathMatch.params.documentId}?tenant-id=${decodeExchangeToken().tenantId}`;
        // const currentDrawing = DrawingLibDetailsState?.drawingSheetLists.find((item: any)=> item.id == pathMatch.params.documentId);
        const currentProject = state.projectList.find((item: any)=> item.projectId == pathMatch.params.projectId);
        const htmlEmail= PublishEmailTemplate({
          projectName: currentProject?.projectName || '',
          drawingName: fileName?.name ||'Drawing.pdf',
          userName: decodeExchangeToken().userName,
          versionName: DrawingLibDetailsState.drawingVersionDetails?.Set_Version_Name?DrawingLibDetailsState.drawingVersionDetails?.Set_Version_Name:'',
          redirectionUrl
        })
        const payload: any = [{
          users:selectedUsers,
          email: true,
          // eslint-disable-next-line max-len
          emailTemplate: htmlEmail,
          subject: `${decodeExchangeToken().userName} published ${fileName?.name ||'Drawing.pdf'}-${DrawingLibDetailsState.drawingVersionDetails?.Set_Version_Name||''}`,
          contentModified: {    
            actionType: "ADDED",    
            featureType: features.DRAWINGS,    
            tenantFeatureId: null,    
            projectFeatureId: 5, 
            projectId: pathMatch.params.projectId, 
            fieldName: "Drawing Name",
            oldValue: null,   
            newValue: null,
            navigationUrl: {    
                  serviceName: "authentication",    
                  path: `/drawings/projects/${pathMatch.params.projectId}/pdf-viewer/${pathMatch.params.documentId}?tenant-id=${decodeExchangeToken().tenantId}`
            }
          }  
        }  
      ]
      return payload;
      }

    const notifyProjectUsers = async () => {
        try {
            const payload= frameEmailPayload();
            dispatch(setIsLoading(true));
            await axiosApiInstance.post(
              `${NOTIFICATION_URL}${NOTIFICATION_PATH}`,
              payload,
              {
                headers: {
                  token: "exchange",
                },
              }
            );
        } catch(error: any) {

        }
    }


    return (
        <>
            {
                loadPage ? (
                    <div className="review">
                        <>
                            {
                                !isDrawingPublished ? (
                                    <>
                                        {
                                            state?.projectFeaturePermissons?.cancreateDrawings ? (
                                                <div className={`review__wrapper ${isReviewExpand ? "review__expand" : ""}`}>
                                                    <div className="review__wrapper__left">
                                                        <div className="review__wrapper__left__header">
                                                            <DrawingHeaders  headerInfo={fileName} navigate={navigateBack}/> 
                                                        </div> 
                                                        <div className="review__wrapper__left__pdf">
                                                            <PdfTron drawingSheetsDetails={drawingSheetsDetails} updateRotation={updateRotation}/>
                                                        </div>
                                                    </div>
                                                    <div className="review__wrapper__sheets">
                                                        <DrawingSheetsMain publish={handlePublishDrawings} 
                                                        splitDrawingNumber={handleSplitDrawingNumber} drawingSheetList={drawingSheetList}/>
                                                        <div className="review__wrapper__sheets__toggle" onClick={toggleReview}></div>
                                                    </div>
                                                </div>
                                            )  :
                                            state.projectFeaturePermissons &&
                                            (!state.projectFeaturePermissons?.cancreateDrawings ? (
                                                <div className="noPublishDrawingPermission">
                                                    <div className="noCreatePermission__header">
                                                        <Header header={'Drawing Review'} navigate={navigateBack}/>
                                                    </div>
                                                    <div className="no-permission">
                                                        <NoDataMessage message={noPermissionMessage}/> 
                                                    </div>
                                                </div>
                                            ) : (
                                                ''
                                            ))  
                                        }
                                    </>
                                ): (
                                <div className="noPublishDrawingPermission">
                                    <div className="noCreatePermission__header">
                                        <Header header={'Drawing Review'} navigate={navigateBack}/>
                                    </div>
                                    <div className="no-permission">
                                        <NoDataMessage message={published}/> 
                                    </div>
                                </div>
                                )
                            }
                        </>
                        
                    </div> 
                ): (
                    ''
                )
            }
        </>     
    )
}
