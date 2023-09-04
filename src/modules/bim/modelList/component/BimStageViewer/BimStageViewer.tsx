import React, { ReactElement, useEffect, useState } from 'react'
import './BimStageViewer.scss';
import CircularProgress, { CircularProgressProps } from '@material-ui/core/CircularProgress';
import Box from '@material-ui/core/Box';
import moment from 'moment';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import CheckIcon from '@material-ui/icons/Check';

export default function BimStageViewer(props: any): ReactElement {
    const [infoMsg, setInfoMsg] = useState('');
    let uploadStartTime: any;

    useEffect(() => {
        uploadStartTime = moment.utc(props.createdAt);
        props.statusData && updateStageData(props.statusData, props.statusData?.id)
    }, [props.statusData])

    useEffect(() => {
        props.uploadModelId && props.uploadProgress < 100 ? setInfoMsg("Please don't close browser until upload completes") : setInfoMsg('');
    }, [props.uploadProgress])

    function updateStageData(data: any, modelId: any) {
        const currentTime = moment.utc();
        let error = false;
        setInfoMsg('')

        if (props.uploadModelId == modelId) {
            props.uploadProgress < 100 && setInfoMsg("Please don't close browser until upload completes");
        }

        if (!data) {
            (props.uploadModelId !== modelId) && setInfoMsg('');
            currentTime.diff(uploadStartTime, 'minutes') >= 30 && setInfoMsg("Please cancel and try uploading after some time as our resources are busy");
            return;
        }

        if (data.status === "MODEL_PROCESSING_STARTED" && !data.geometryStatus)
            setInfoMsg("We are processing your file and will send an email notification once complete");

        if (data.geometryStatus) {
            setInfoMsg("We are processing your file and will send an email notification once complete");
        }

        if (data.status === "MODEL_PROCESSING_FAILED" || data.status === "DATA_PROCESSING_FAILED" || data.status === "ABORTED") {
            setInfoMsg('')
            error = true;
        }

        if (data.status === "COMPLETED") {
            setInfoMsg('Total Duration: ' +  getDurationString(props.createdAt, data.completedAt))
        }

        const uploadCompltedDate = moment.utc(data.createdAt);

        const durationLimitCheck = (data.geometryStatus) ? currentTime.diff(moment.utc(data.modelCompletedAt), 'hours') >= 1
            : currentTime.diff(uploadCompltedDate, 'hours') >= 2;
        (durationLimitCheck && data.status !== "COMPLETED" && !error) &&
            setInfoMsg("File processing is taking more time than expected. You can cancel and upload again.");

        props.isDeleted && currentTime.diff(moment.utc(props.updatedAt), 'hours') >= 3 
            && setInfoMsg('Delete process is taking more time than expected. You can delete it again.');
    }

    function CircularProgressWithLabel(props: CircularProgressProps & { value: any, valuetext: any }) {
        return (
            <Box position="relative" display="inline-flex">
                <CircularProgress {...props} />
                <Box
                    top={0}
                    left={0}
                    bottom={0}
                    right={0}
                    position="absolute"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    className="progressValue"
                >
                    {props.valuetext}
                </Box>
            </Box>
        );
    }

    function getDurationString(startTime: string, endTime: string) {
        const duration = moment.duration(moment(endTime).diff(moment(startTime)))
        if (duration.asSeconds() < 60) {
            return Math.round(duration.asSeconds() * 10) / 10 + ' Sec'
        } else if (duration.asMinutes() < 60) {
            return Math.round(duration.asMinutes() * 10) / 10 + ' Min'
        } else {
            return Math.round(duration.asHours() * 10) / 10 + ' Hrs'
        }
    }

    function getFileConvDutnValue(data: any) {
        if (data?.status === "MODEL_PROCESSING_FAILED" || data?.status === "ABORTED")
            return <ErrorOutlineIcon className='error-icon' />

        if (data?.geometryStatus) {
            return getDurationString(data.createdAt, data.modelCompletedAt);
        }

        return '';
    }

    function getMdlProssDutnValue(data: any) {
        if (data?.status === "DATA_PROCESSING_FAILED")
            return <ErrorOutlineIcon className='error-icon' />

        if (data?.status === "COMPLETED")
            return getDurationString(data.modelCompletedAt, data.completedAt);

        return '';
    }

    return (
        !props.isDeleted ? <div className="bim-stage-viewer">
            <div className={`stage stg-cmpltd`}>
                <div className='title'>
                    <span>Uploading</span> your file
                    {!props.statusData && props.uploadProgress < 100 && <div className='uploadFilename'>File: {props.uploadFilename}</div>}
                </div>
                <CircularProgressWithLabel
                    className='popUpProgress'
                    value={props.statusData || !props.uploadModelId ? 100 : props.uploadProgress}
                    valuetext={props.statusData || !props.uploadModelId ? '100%' : props.uploadProgress + '%'}
                    size={45}
                    variant={'determinate'}
                />
            </div>
            <div className={`stage  ${(props.statusData?.geometryStatus || props.statusData?.status === "UPLOADED" || props.statusData?.status === "MODEL_PROCESSING_STARTED" || props.statusData?.status === "MODEL_PROCESSING_FAILED" || props.statusData?.status === "ABORTED") && `stg-cmpltd`}`}>
                <div className='title'>
                    <span>Converting</span> your file
                </div>
                <CircularProgressWithLabel
                    className={`popUpProgress  ${(props.statusData?.status === "ABORTED" || props.statusData?.status === "MODEL_PROCESSING_FAILED") && `stg-err`}`}
                    value={props.statusData?.geometryStatus && props.statusData ? 100 : 0}
                    valuetext={getFileConvDutnValue(props.statusData)}
                    size={45}
                    variant={props.statusData?.geometryStatus || !props.statusData ? 'determinate' : 'indeterminate'}
                />
            </div>
            <div className={`stage ${(props.statusData?.status === "COMPLETED" || props.statusData?.status === "DATA_PROCESSING_COMPLETED" || props.statusData?.status === "MODEL_PROCESSING_COMPLETED" || props.statusData?.status === "DATA_PROCESSING_FAILED") && `stg-cmpltd`}`}>
                <div className='title'>
                    <span>Building</span> your data
                </div>
                <CircularProgressWithLabel
                    className={`popUpProgress  ${(props.statusData?.status === "DATA_PROCESSING_FAILED") && `stg-err`}`}
                    value={props.statusData?.geometryStatus || props.statusData?.status === "DATA_PROCESSING_FAILED" ? 100 : 0}
                    valuetext={getMdlProssDutnValue(props.statusData)}
                    size={45}
                    variant={(props.statusData?.geometryStatus && props.statusData?.status !== "COMPLETED") || props.statusData?.status === "DATA_PROCESSING_FAILED" ? 'indeterminate' : 'determinate'}
                />
            </div>
            <div className={`stage ${props.statusData?.status === "COMPLETED" && `stg-cmpltd`}`}>
                <div className='title'>
                    <span>Sending </span> notification
                </div>
                <CircularProgressWithLabel
                    className='popUpProgress'
                    value={props.statusData?.status === "COMPLETED" ? 100 : 0}
                    valuetext={props.statusData?.status === "COMPLETED" ? <CheckIcon /> : ''}
                    size={45}
                    variant={'determinate'}
                />
            </div>
            <div className='info-msg'>{infoMsg}</div>
        </div> :
        <div className="bim-stage-viewer">
            <div className={`stage stg-cmpltd deleting`}>
                <div className='title'>
                    <span>Deleting...</span>
                </div>
                <CircularProgressWithLabel
                    className='popUpProgress'
                    value={100}
                    valuetext={''}
                    size={45}
                    variant={'indeterminate'}
                />
            </div>
            <div className='info-msg'>{infoMsg}</div>
        </div>
    )
}
