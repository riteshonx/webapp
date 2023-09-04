import React, { ReactElement, useState } from 'react'
import CloudUploadIcon from "@material-ui/icons/CloudUpload"
import { useDropzone } from "react-dropzone"
import './DragDrop.scss'
import { Alert } from '@material-ui/lab';
import { Button } from '@material-ui/core';

export default function DragDrop(props: any): ReactElement {
    const [error, setError] = useState<string | null>(null);
   

    const { getRootProps, getInputProps, open } = useDropzone({
        accept: [".rvt", ".ifc"],
        noClick: true,
        noKeyboard: true,
        maxFiles: 1,
        multiple: false,
        //Max Size in Bytes
        maxSize: 400 * 1024 * 1024,
        onDrop: () => {
            setError(null);
        },
        onDropAccepted: (acceptedFiles: any) => {
            props.handleUpload(acceptedFiles);
        },
        onDropRejected: (fileRejections: any) => {
            // error code possible values :
            // "file-too-large" | "file-too-small" | "too-many-files" | "file-invalid-type" | string;
            const error = fileRejections?.[0]?.errors?.[0]?.code;
            if(error === "file-too-large"){
                setError("Please upload file with size less than 400MB.");
            }else{
                setError("Please upload file in .rvt or .ifc format.");
            }
        }
    });

    return (
        <div className="bimDragDrop">
            <div>
                <div className="title">Create Dataset</div>
                <div {...getRootProps({ className: "dropZone", })}>
                    <input {...getInputProps()} />
                    <div>
                        <div>
                            <CloudUploadIcon />
                        </div>
                        <div className="dragText" >
                            Drag & drop your file here
                        </div>
                        <div style={{ paddingTop: "16px", paddingBottom: "20px" }}>or</div>
                        <div>
                            <Button onClick={open} variant="outlined" className="btn-primary uploadButton">
                                Browse
                            </Button>
                        </div>
                        File Formats: .rvt or .ifc
                    </div>
                </div>
                {error ? (
                    <Alert severity="error" className="alert">{error}</Alert>
                ) : null}
            </div>
        </div>
    )
}
