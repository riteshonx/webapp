import React, { ReactElement, useState, useContext, useEffect } from 'react'
import './UploadFile.scss'
import { match, useRouteMatch } from "react-router-dom";
import { multiPartPost, postApiWithEchange } from '../../../../../services/api';
import BimHeader from '../BimHeader/BimHeader';
import BimStepper from '../Stepper/Stepper';
import BimTable from '../BimTable/BimTable';
import DragDrop from '../DragDrop/DragDrop';
import { projectFeatureAllowedRoles } from '../../../../../utils/role';
import {CREATE_BIM_MODEL, BIM_MODEL_STATUS, LAST_BIM_MODEL_STATUS, FETCH_BIM_MODEL, DELETE_BIM_MODEL, BIM_ELEMENT_PROP_COUNT, DELETE_BIM_ELEMENT_PROP, CANCEL_BIM_MODEL } from '../../../graphql/bimUpload';
import { client } from '../../../../../services/graphql';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { setIsLoading } from '../../../../root/context/authentication/action';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog/ConfirmDialog';
import Notification,{ AlertTypes } from '../../../../shared/components/Toaster/Toaster';
import { errorDescription } from '../../../constants/errorCode';
import { Button } from '@material-ui/core';
import moment from 'moment';
import axios from 'axios';

export interface Params {
    id: string;
}

interface message {
    header: string,
    text: string,
    cancel: string,
    proceed: string,
}

const confirmDeleteMessage: message = {
    header: "Are You Sure?​",
    text: `This action will delete the BIM Dataset including all Queries, Filters and View Definitions`,
    cancel: "Cancel",
    proceed: "Yes"
}

const confirmCancelMessage: message = {
    header: "Are You Sure?​",
    text: `This action will terminate the process of converting the uploaded file to a Slate BIM dataset`,
    cancel: "Cancel",
    proceed: "Yes"
}
  

const stepsDetailsModel = [{
    inProgressTitle: 'Uploading File...',
    CompletedTitle: 'File Uploaded',
    errorTitle: 'File Upload Failed',
    paramters: [
        'Uploaded on',
        'Started at',
        'Progress',
        'Avg. Upload Speed',
        'Completed at',
        'Duration',
    ],
    values: Array<any>()
},
{
    inProgressTitle: 'Converting File...',
    CompletedTitle: 'File Converted',
    errorTitle: 'File Conversion Failed',
    paramters: [
        'Started at',
        'Completed at',
        'Duration',
    ],
    values: Array<any>()
},
{
    inProgressTitle: 'Building DataSet...',
    CompletedTitle: 'DataSet Built',
    errorTitle: 'DataSet Build Failed',
    paramters: [
        'Started at',
        'Completed at',
        'Duration',
    ],
    values: Array<any>()
},
{
    inProgressTitle: 'Sending Notification...',
    CompletedTitle: 'Notification Sent',
    errorTitle: 'Notification send Failed',
    paramters: [],
    values: Array<any>()
},
{
    inProgressTitle: 'Model Available',
    CompletedTitle: 'Model Available',
    errorTitle: '',
    paramters: [],
    values: Array<any>()
}]
let statuCheckInterval: any = null;
let delStatuCheckInterval: any = null;
let cancelTokenSource: any = null;

export default function UploadFile(props: any): ReactElement {
    const { dispatch, state }:any = useContext(stateContext);
    const [progress, setProgress] = useState(0);
    const [activeStep, setActiveStep] = useState(0);
    const steps = ['Upload File', 'Convert File', 'Build Database', 'Send Notification.', 'Manage Model​'];
    const [inProccessing, setInProccessing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState(false);
    const [srvErrorMsg, setSrvErrorMsg] = useState('');
    const [success, setsuccess] = useState(false);
    const [hideUpload, setHideUpload] = useState(true);
    const [shwQueueWarn, setShwQueueWarn] = useState(false);
    const [shwDurtWarn, setShwDurtWarn] = useState(false);
    const [stepsDetails, setStepsDetails] = useState(stepsDetailsModel);
    const [currentModelId, setcurrentModelId] = useState('');
    const [openDeleteModel, setOpenDeleteModel] = useState(false);
    const [openCancelModel, setOpenCancelModel] = useState(false);
    const [file, setFile] = useState({
        fileName: '',
        type: '',
        size: '',
        uploadedTime: '',
        categoryCount: '-',
        elementCount: '-',
        uploadedBy: ''
    });
    const pathMatch: match<Params> = useRouteMatch();
    const featureId = 3;
    let uploadStartTime: any;

    useEffect(() => {
        setHideUpload(true)
        if(state.selectedProjectToken && state.projectFeaturePermissons?.canviewBimModel) {
            dispatch(setIsLoading(true));
            (cancelTokenSource) ? cancelTokenSource.cancel() : null;
            checkBimStatus()
        }
        return () => {
            (cancelTokenSource) && cancelTokenSource.cancel();
            clearInterval(statuCheckInterval);
            clearInterval(delStatuCheckInterval);
        }
    }, [state.selectedProjectToken]);

    async function checkBimStatus() {
        reset();
        const bimModelStatusResp = await fetchBimModel(LAST_BIM_MODEL_STATUS, {})
        const bimModelStatus = (bimModelStatusResp[0]?.bimModelStatuses[0]?.status === "ABORTED") ? 
            bimModelStatusResp[1]?.bimModelStatuses[0]?.status !== "ABORTED" && bimModelStatusResp[1] || null : bimModelStatusResp[0] || null;

        if(bimModelStatus && !bimModelStatus.isDeleted) {
            setIsDeleting(false);
            setActiveStep(1);
            uploadStartTime = moment.utc(bimModelStatus.createdAt)
            setFile((prevstate: any) => {
                return {
                    ...prevstate,
                    'fileName': bimModelStatus.title,
                    'type': bimModelStatus.title.split('.').pop(),
                    'fileLastModified': bimModelStatus.fileLastModified,
                    'size': (bimModelStatus.fileSize / (1024 * 1024)).toFixed(2) + ' MB',
                    'categoryCount': '-',
                    "elementCount": '-',
                    'uploadedTime': uploadStartTime.format('DD-MMM-YYYY [,] h:mm:ss A'),
                    'uploadedBy': bimModelStatus.tenantAssociationByCreatedby.user.firstName + ' '  +bimModelStatus.tenantAssociationByCreatedby.user.lastName
                }
            })
            stepsDetailsModel[0].values[0] = uploadStartTime.format('DD-MMM-YYYY');
            stepsDetailsModel[0].values[1] = uploadStartTime.format('h:mm:ss A');
            if(bimModelStatus.bimModelStatuses.length > 0) {
                updateStatus(bimModelStatus.bimModelStatuses[0]);
                setInProccessing(true);
                if(bimModelStatus.bimModelStatuses[0].status !== "COMPLETED" && bimModelStatus.bimModelStatuses[0].status !== "MODEL_PROCESSING_FAILED" && bimModelStatus.bimModelStatuses[0].status !== "DATA_PROCESSING_FAILED") {
                    startStatusCheck(bimModelStatus.id, uploadStartTime)
                }
            } else {
                setcurrentModelId(bimModelStatus.id)
                setActiveStep(1)
                setInProccessing(true);
                startStatusCheck(bimModelStatus.id, uploadStartTime)
                const currentTime = moment.utc();
                currentTime.diff(uploadStartTime, 'minutes') >= 30 ? setShwQueueWarn(true) : setShwQueueWarn(false);
            }
        } else if(bimModelStatus && bimModelStatus.isDeleted)  {
            const elementData = bimModelStatus.bimModelStatuses[0] && await fetchElementCount(bimModelStatus.bimModelStatuses[0].modelId);
            if(elementData && elementData.aggregate.elementCount > 0) {
                startDelStatusCheck(bimModelStatus.bimModelStatuses[0].modelId)
                setIsDeleting(true);
            } else {
                setIsDeleting(false);
                setInProccessing(false)
            }
        } else {
            setIsDeleting(false);
            setInProccessing(false)
        }
        dispatch(setIsLoading(false));
        setHideUpload(false)
    }

    const handleUpload = async (files: any) => {
        reset();
        setInProccessing(true);
        uploadStartTime = moment.utc();
        setFile((prevstate: any) => {
            return {
                ...prevstate,
                'fileName': files[0]?.name,
                'type': files[0]?.name.split('.').pop(),
                'categoryCount': '-',
                "elementCount": '-',
                'size': (files[0]?.size / (1024 * 1024)).toFixed(2) + ' MB',
                'uploadedTime': uploadStartTime.format('DD-MMM-YYYY [at] h:mm:ss A'),
                'fileLastModified': files[0].lastModified
            }
        })
        stepsDetailsModel[0].values[0] = uploadStartTime.format('DD-MMM-YYYY');
        stepsDetailsModel[0].values[1] = uploadStartTime.format('h:mm:ss A');
        setStepsDetails({...stepsDetailsModel})
        const payload: any = [{
            fileName: files[0]?.name,
            projectId: Number(pathMatch.params.id),
            featureId: featureId
        }];
        try {
            const projectTokenResponse = await postApiWithEchange('V1/S3/uploadFilesInfo', payload);
            if (projectTokenResponse?.success.length > 0) {
                const createBimResponse: any = await createBimModel(projectTokenResponse?.success[0].fields.key, files[0]?.name, files[0]?.size, files[0]?.lastModifiedDate );
                if(createBimResponse.data.insert_bimModel_one) {
                    const bimModel = await fetchBimModel(FETCH_BIM_MODEL, {
                        _eq: createBimResponse.data.insert_bimModel_one.id
                    });
                    setFile((prevstate: any) => {
                        return {
                            ...prevstate,
                            'uploadedBy': bimModel[0].tenantAssociationByCreatedby.user.firstName + ' '  +bimModel[0].tenantAssociationByCreatedby.user.lastName
                        }
                    })
                    const modelId = createBimResponse.data.insert_bimModel_one.id;
                    await uploadFileToS3(projectTokenResponse?.success[0], files[0], modelId)
                    startStatusCheck(modelId, uploadStartTime)
                    setcurrentModelId(modelId)
                }
            }
        } catch (error: any) {
            console.log(error.message);
            Notification.sendNotification('Some error occured on upload file, Please refresh', AlertTypes.error);
            setError(true)
            setInProccessing(false);
        }
    };

    const uploadFileToS3 = async (item: any, file: any, modelId: any) => {
        try {
            let timeStamp = Date.now();
            let prevloaded = 0;
            let average = 0;
            cancelTokenSource = axios.CancelToken.source();
            const config = {
                onUploadProgress: function (progressEvent: any) {
                    const time = Date.now() - timeStamp; 
                    const uploadedBytes = progressEvent.loaded - prevloaded;
                    const speed = ((uploadedBytes / 1024 / 1024) / (time / 1000));
                    (average === 0) ? average = speed : average = ( average + speed ) / 2;
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percentCompleted);
                    stepsDetailsModel[0].values[2] = percentCompleted + '%';
                    stepsDetailsModel[0].values[3] = average.toFixed(2) + ' Mbps';
                    setStepsDetails({...stepsDetailsModel})
                    timeStamp = Date.now();
                    prevloaded = progressEvent.loaded;
                },
                cancelToken: cancelTokenSource.token
            }
            const uploadResponse: any = await multiPartPost(item.url, item.fields, file, config);
            cancelTokenSource = null;
            setProgress(0)
            setActiveStep(1)
        } catch (error: any) {
            console.log(error.message);
            setProgress(0)
            setError(true)
            setInProccessing(true);
            await graphqlMutation(DELETE_BIM_MODEL, {
                _eq: modelId
            }, projectFeatureAllowedRoles.updateBimModel);
        }
    }

    const createBimModel = async (key: string, fileName: string, size: number, lastModifiedDate: string) => {
        try {
            const data = await client.mutate({
                mutation: CREATE_BIM_MODEL,
                variables: {
                    object: {
                        title: fileName,
                        sourceKey: key, 
                        modelFormat: fileName.split('.').pop(), 
                        description: "this is a test model",
                        fileSize: size,
                        fileLastModified: lastModifiedDate
                    }
                },
                context: { role: projectFeatureAllowedRoles.createBimModel, token: state.selectedProjectToken}
            })
            return data;
        } catch (error: any) {
            console.log(error.message);
            Notification.sendNotification('Some error occured on create Model', AlertTypes.error);
            setError(true)
        }
    }

    const fetchBimModelStatus= async (query: any, varable: any)=>{
        try{
            const responseData= await client.query({
                query: query ,
                variables: varable,
                fetchPolicy:'network-only',
                context:{role: projectFeatureAllowedRoles.viewBimModel, token: state.selectedProjectToken}
            });
            return responseData.data.bimModelStatus[0];
        }catch(error: any){
            Notification.sendNotification('Some error occured on getting model details', AlertTypes.error);
            console.log(error.message);
        }
    }

    const fetchBimModel= async (query: any, variable: any)=>{
        try{
            const responseData= await client.query({
                query: query,
                variables: variable,
                fetchPolicy:'network-only',
                context:{role: projectFeatureAllowedRoles.viewBimModel, token: state.selectedProjectToken}
            });
            return responseData.data.bimModel;
        }catch(error: any){
            Notification.sendNotification('Some error occured on getting model details', AlertTypes.error);
            console.log(error.message);
        }
    }

    const updateStatus = (data: any) => {
        setcurrentModelId(data.modelId)
        if(data.status === "MODEL_PROCESSING_STARTED" && !data.geometryStatus) {
            setActiveStep(1)
        }

        if(data.geometryStatus) {
            setActiveStep(2)
            const fileConvnCmpltdAt = moment.utc(data.modelCompletedAt)
            stepsDetailsModel[1].values[1] = fileConvnCmpltdAt.format('h:mm:ss A');
            stepsDetailsModel[2].values[0] = fileConvnCmpltdAt.format('h:mm:ss A');
            stepsDetailsModel[1].values[2] = getDurationString(data.createdAt, data.modelCompletedAt);
        }

        if(data.status === "MODEL_PROCESSING_FAILED" || data.status === "DATA_PROCESSING_FAILED") {
            setError(true)
            setSrvErrorMsg(errorDescription(data.statusMessage));
            clearInterval(statuCheckInterval)
        }

        if(data.status === "COMPLETED") {
            setsuccess(true)
            setActiveStep(5)
            clearInterval(statuCheckInterval)
            stepsDetailsModel[2].values[2] = getDurationString(data.modelCompletedAt, data.completedAt)
            stepsDetailsModel[2].values[1] = moment.utc(data.completedAt).format('h:mm:ss A');
            setFile((prevstate: any) => {
                return {
                    ...prevstate,
                    'categoryCount': '',
                    "elementCount": ''
                }
            })
            fetchElementCount(data.modelId);

        }

        if(data.status === "ABORTED" ) {
            Notification.sendNotification('File is already in processing state', AlertTypes.error);
            setHideUpload(true)
            dispatch(setIsLoading(true));
            checkBimStatus();
        }

        const uploadCompltedDate = moment.utc(data.createdAt);
        stepsDetailsModel[0].values[4] = uploadCompltedDate.format('h:mm:ss A');
        stepsDetailsModel[1].values[0] = uploadCompltedDate.format('h:mm:ss A');
        stepsDetailsModel[0].values[5] = getDurationString(uploadStartTime.format('YYYY-MM-DDTHH:mm:ssZ'), data.createdAt)
        setStepsDetails({...stepsDetailsModel})
        
        const currentTime = moment.utc();
        const durationLimitCheck = (data.geometryStatus) ? currentTime.diff(moment.utc(data.modelCompletedAt), 'hours') >= 1 
            : currentTime.diff(uploadCompltedDate, 'hours') >= 2;
        (durationLimitCheck && data.status !== "COMPLETED") ? setShwDurtWarn(true) : setShwDurtWarn(false); 
    }

    const uploadAgain = () => {
        reset();
        setInProccessing(false)
    }

    function reset() {
        clearInterval(statuCheckInterval);
        stepsDetailsModel[0].values = [];
        stepsDetailsModel[1].values = [];
        stepsDetailsModel[2].values = [];
        setStepsDetails({...stepsDetailsModel})
        setActiveStep(0)
        setError(false)
        setsuccess(false)
        setOpenCancelModel(false)
        setOpenDeleteModel(false)
        setShwDurtWarn(false);
        setShwQueueWarn(false);
        setSrvErrorMsg('');
    }

    function startStatusCheck(id: string, uploadStartTime: any) {
        statuCheckInterval = setInterval(async () => {
            const bimModelStatus = await fetchBimModelStatus(BIM_MODEL_STATUS, {
                _eq: id
            })
            if(bimModelStatus) {
                updateStatus(bimModelStatus)
                setShwQueueWarn(false);
            } else if(!stepsDetailsModel[1].values[0]) {
                const currentTime = moment.utc();
                currentTime.diff(uploadStartTime, 'minutes') >= 30 ? setShwQueueWarn(true) : setShwQueueWarn(false);
            }
        }, 10000);
    }

    function startDelStatusCheck(id: string) {
        delStatuCheckInterval = setInterval(async () => {
            const elementData = await fetchElementCount(id);
            if(elementData.aggregate.elementCount <= 0) {
                setIsDeleting(false);
                clearInterval(delStatuCheckInterval)
                setInProccessing(false)
            }
        }, 10000);
    }

    const deleteBimModel = async (cancel: boolean) => {
        try {
            dispatch(setIsLoading(true));
            setHideUpload(true);
            if(cancel){
                await graphqlMutation(CANCEL_BIM_MODEL, {
                    modelId: currentModelId
                }, projectFeatureAllowedRoles.updateBimModel);    
            }
            // Removing DELETE_BIM_MODEL Mutation call, because same operation is done from  DELETE_BIM_ELEMENT_PROP Mutation
            // We can  remove commented code after MVP
            // await graphqlMutation(DELETE_BIM_MODEL, {
            //     _eq: currentModelId
            // }, projectFeatureAllowedRoles.updateBimModel);
            await graphqlMutation(DELETE_BIM_ELEMENT_PROP, {
                _eq: currentModelId
            }, projectFeatureAllowedRoles.createBimModel)
            reset();
            startDelStatusCheck(currentModelId)
            setIsDeleting(true);
            setInProccessing(false)
            setHideUpload(false)
            dispatch(setIsLoading(false));
            
        } catch (error: any) {
            Notification.sendNotification('Some error occured on '+ cancel ? "cancel" : "delete" +' Model', AlertTypes.error);
            console.log(error.message);
        }
    }

    const graphqlMutation = async (query: any, variable: any, role: any) => {
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
            Notification.sendNotification('Some error occured on update Model', AlertTypes.error);
        } finally {
            return (responseData?.data) ? responseData.data : null;
        }
    }

    async function fetchElementCount(modelId: string) {
        try{
            const fetchData = async (query: any) => { 
                const responseData = await client.query({
                    query: query,
                    variables: {
                        "_eq": modelId
                    },
                    fetchPolicy:'network-only',
                    context:{role: projectFeatureAllowedRoles.viewBimModel, token: state.selectedProjectToken}
                });
                return responseData.data.bimElementProperties_aggregate; 
            }

            const elementData  = await fetchData(BIM_ELEMENT_PROP_COUNT);
            setFile((prevstate: any) => {
                return {
                    ...prevstate,
                    'elementCount': elementData.aggregate.elementCount,
                    'categoryCount': elementData.aggregate.categoryCount
                }
            })
            return elementData;            
        } catch(error: any){
            Notification.sendNotification('Some error occured on getting element details', AlertTypes.error);
            console.log(error.message);
        }
    } 

    function getDurationString(startTime: string, endTime: string) {
        const duration = moment.duration(moment(endTime).diff(moment(startTime)))
        const toTwoDigit = (number: number) => number.toLocaleString('en-US', {minimumIntegerDigits: 2})
        return toTwoDigit(duration.get("hours")) + ':' + toTwoDigit(duration.get("minutes")) + ':' + toTwoDigit(duration.get("seconds"));
    }

    return (
        <div className="bimFileUpload">
            { hideUpload ? null :
                <>
                    {!isDeleting ?
                        (inProccessing ?
                            <>
                                <BimTable file={file} />
                                <BimStepper 
                                    steps={steps} 
                                    stepSuccess={success} 
                                    stepError={error} 
                                    stepDetails={stepsDetails} 
                                    activeStep={activeStep} 
                                    activeProgress={progress}
                                    currentModelId={currentModelId} 
                                    showBimModel={props.showBimModel} 
                                    handleDeleteOpen={() =>setOpenDeleteModel(true)}/>
                                {(state.projectFeaturePermissons?.cancreateBimModel && state.projectFeaturePermissons?.canupdateBimModel) ?
                                    <>
                                        {(!success && !error && activeStep > 0 )? 
                                            <>
                                                {shwQueueWarn && <div className="warnText">{"Please cancel and try uploading after some time as our resources are busy"} </div>}
                                                {shwDurtWarn && <div className="warnText">{"File processing is taking more time than expected. You can cancel and upload again."} </div>}
                                                {(!shwDurtWarn && !shwQueueWarn) && <div>{"We are processing your file and will send an email notification once done"} </div>}
                                                <Button onClick={() => setOpenCancelModel(true)} disabled={(activeStep === 2 && !shwDurtWarn) && true} className="btn-primary cancel-btn">Cancel</Button>
                                            </>
                                        : null}
                                        <div className="warnText">{srvErrorMsg} </div>
                                        {(error)? <Button onClick={() => uploadAgain()} className="btn-primary cancel-btn">Upload Again</Button>: null}
                                        {(progress > 0 && progress < 100) ? <div>{"Please don't close browser until upload completes"} </div>: null}
                                    </>
                                : null}
                            </> :
                            (state.projectFeaturePermissons?.cancreateBimModel) ? 
                                <DragDrop handleUpload={handleUpload} /> :
                                <BimHeader name="Models" description={"You don't have permission to create the BIM model"} />

                        )
                        : <BimHeader name="Models" description={"Removing this Model from the Current Project. Please wait..."} />
                    }
                </>
            }
            {(state.projectFeaturePermissons && !state.projectFeaturePermissons?.canviewBimModel) ? <BimHeader name="Models" description={"You don't have permission to view the BIM model"} /> : null}
            <ConfirmDialog open={openDeleteModel} message={confirmDeleteMessage} close={() => setOpenDeleteModel(false)} proceed={() => deleteBimModel(false)} />
            <ConfirmDialog open={openCancelModel} message={confirmCancelMessage} close={() => setOpenCancelModel(false)} proceed={() => deleteBimModel(true)} />
        </div>
    )
}
