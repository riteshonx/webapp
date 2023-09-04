import React, { ReactElement, useEffect, useRef } from 'react';
import Dropzone from 'react-dropzone';
import './SpecificationFileUpload.scss';
import Notification,{ AlertTypes } from "../../../../shared/components/Toaster/Toaster";
import GetAppIcon from '@material-ui/icons/GetApp';

export default function SpecificationFileUpload(props: any): ReactElement {

    const dropZoneRef = useRef<any>(null);

    useEffect(() => {
        window.addEventListener('click', handler)
        return () => window.removeEventListener('click', handler)
    }, []);

    
    const handler = (event: any) => {
        if(!dropZoneRef.current?.contains(event.target) && event.target.innerText !== 'Upload') {
            props.closeFileZone();
        }
    }

    const acceptedFiles = (acceptedfilesData: any, rejectedFiles: any) => {
        if(rejectedFiles && rejectedFiles.length > 0){
            if(rejectedFiles.length > 1){
                Notification.sendNotification("Maximum 1 file can be uploaded at a time", AlertTypes.warn);
            }else{
                if(rejectedFiles[0]?.errors[0].code === 'file-too-large'){
                    Notification.sendNotification('File is larger than 400 MB', AlertTypes.warn);
                }else{
                    Notification.sendNotification(rejectedFiles[0]?.errors[0]?.message, AlertTypes.warn);
                }
                
            }
        }else{
            props.fileUpload(acceptedfilesData)
            props.closeFileZone();
        }
    }

    return (
        <div className="specification-fileUpload">

            <section className="specification-attachment">
                <Dropzone onDrop={(files: any, rejectedFiles: any) => {acceptedFiles(files, rejectedFiles)} } 
                          disabled={false } 
                          accept={'.pdf'}
                          maxFiles={1}
                          maxSize={400 * 1024 * 1024}// 450MB
                >
                    {({getRootProps, getInputProps}) => (
                        <>
                            <div className="container">
                                <div className="">
                                    <div
                                        {...getRootProps({
                                            className: props?.attachment?.bgColor ? 
                                            'dropzone, specification-attachment__dropZone--white' : 'dropzone, specification-attachment__dropZone',
                                        })}
                                    >
                                        <div className="specification-attachment__wrapper" ref={dropZoneRef}>
                                            <input {...getInputProps()} />
                                            <div className="specification-attachment__text">
                                                {
                                                props?.attachment?.placeholder ? props?.attachment?.placeholder : (
                                                        <>  
                                                            <div className="specification-attachment__text__icon">
                                                                <GetAppIcon />
                                                            </div>
                                                            <div className="specification-attachment__text__message">
                                                                Drag and drop a PDF file here, or
                                                                    <span className="specification-attachment__text__message__click">
                                                                         click 
                                                                    </span> 
                                                                to select a PDF file
                                                            </div>
                                                            <div className="specification-attachment__text__note">
                                                                (Maximum 1 PDF file can be uploaded at a time)
                                                            </div>
                                                            <div className="specification-attachment__text__note2">
                                                                Note: If a specification book has multiple files, please combine all files into one file before uploading
                                                                </div>
                                                        </>                      
                                                    )
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                            </div>
                        </>
                    )}
                </Dropzone>
            </section>

        </div>
    )
}
