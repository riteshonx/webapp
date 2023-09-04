import React, { useEffect, useContext, useState } from 'react';
import './ImportMasterMaterial.scss';
import {Dialog,DialogContent, Button} from '@material-ui/core';
import Notify, { AlertTypes } from "../../../../shared/components/Toaster/Toaster";
import GetAppIcon from '@material-ui/icons/GetApp';
import axios from "axios";
import { stateContext } from '../../../../root/context/authentication/authContext';
import { setIsLoading } from "../../../../root/context/authentication/action";

import {
    getExchangeToken,
} from "../../../../../services/authservice";

import DialogActions from "@material-ui/core/DialogActions";
import { useDropzone } from "react-dropzone";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import ExcelImage from '../../../../../assets/images/excel_icon.png';

export default function ImportMasterMaterial(props: any) {

    const [files, setFiles] = useState<any[]>([]);
    const { dispatch }: any = useContext(stateContext);
    const { getRootProps, getInputProps, open } = useDropzone({
      accept: ".xlsx",
      noClick: true,
      noKeyboard: true,
      onDrop: (acceptedFiles: any) => {
        setFiles(
          acceptedFiles.map((file: any) =>
            Object.assign(file, {
              preview: URL.createObjectURL(file),
            })
          )
        );
      },
    });
  
    useEffect(
      () => () => {
        // Make sure to revoke the data uris to avoid memory leaks
        files.forEach((file) => URL.revokeObjectURL(file.preview));
      },
      [files]
    );
  
    const handleDiscard = (operation: any) => {
        setFiles([]);
        props.close();
    };

    const fileUpload = async (excelFile: any) => {

            dispatch(setIsLoading(true));
            const token = getExchangeToken();
                const formData = new FormData();
                formData.append('key', 'material_template');
                formData.append('material_template', excelFile);
                axios.post(
                    `${process.env["REACT_APP_SCHEDULER_URL"]}V1/materialMaster/excelUpload`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                ).then((response: any) => {
                  if (response && response.status === 201) {
                    Notify.sendNotification(
                        response.data.message,
                        AlertTypes.success
                    );
                  }
                  dispatch(setIsLoading(false));
                  props.close();
                  props.refresh();
                }).catch(err => {
                  dispatch(setIsLoading(false));
                  if(err?.response?.data?.error){
                  const message = err.response.data.error
                  Notify.sendNotification(`${message}`, 
                  AlertTypes.warn);
                  } else {
                  Notify.sendNotification("The file format used is incorrect. Please use the template available.", 
                  AlertTypes.warn);
                  }
                  props.close();
                });
    }
  
    return (
      <React.Fragment>
        <div>
          <Dialog
            open={props.open}
            PaperProps={{
              style: {
                minHeight: "fit-content",
                minWidth: "fit-content",
              },
            }}
            disableBackdropClick={true}
            aria-labelledby="form-dialog-title"
          >
            {files && files.length > 0 ? ( 
              <DialogContent>
                <div className="materialMasterImport">
                  <div className="materialMasterImport__materialUpload">
                    <div className="materialMasterImport__materialUpload__dropZone">
                      <div className="materialMasterImport__materialUpload__dropZone__content">
                        <div className="materialMasterImport__materialUpload__dropZone__content__file">
                          <img src={ExcelImage} alt="excel-file"/>
                          {files[0].name}{" "}
                          <DeleteOutlineIcon onClick={() => setFiles([])} />
                        </div>
                        <div className="materialMasterImport__materialUpload__dropZone__content__uploadMessage">
                          <b>{files[0].name}</b> is ready for import
                        </div>
                      </div>
                    </div>
                    <div className="materialMasterImport__materialUpload__planWarning">
                        Use the template below to upload your existing material library into the system
                    </div>
                    <Button
                    variant="outlined"
                    data-testid={`export data`}
                    size="small"
                    className="materialMasterImport__download-template-button"
                    startIcon={<GetAppIcon />}
                    aria-controls="simple-menu"
                    aria-haspopup="true"
                    onClick={(e) => {
                    props.exportTemplate();
                    }}
                    >
                    Download Template
                    </Button>              
                  </div>
                </div>
              </DialogContent>
                  
            ) : (
              <DialogContent>
                <div className="materialMasterImport">
                  <div className="materialMasterImport__materialUpload">
                    <div
                      {...getRootProps({
                        className: "materialMasterImport__materialUpload__dropZone",
                      })}
                    >
                      <input {...getInputProps()} />
                      <div className="materialMasterImport__materialUpload__dropZone__content">
                        <div>
                          <CloudUploadIcon />
                        </div>
                        <div className="materialMasterImport__materialUpload__dropZone__content__dragText">
                          Drag & drop your files here
                        </div>
                        <div
                          style={{ paddingTop: "4rem", paddingBottom: "4rem" }}
                        >
                          or
                        </div>
                        <div>
                          <button
                            className="materialMasterImport__materialUpload__dropZone__content__uploadButton"
                            onClick={open}
                          >
                            Upload from Computer
                          </button>
                        </div>
                        <div className="materialMasterImport__materialUpload__dropZone__content__fileFormat">
                          File Formats: .xls
                        </div>
                      </div>
                    </div>
                    <div className="materialMasterImport__materialUpload__planWarning">
                        Use the template below to upload your existing material library into the system
                    </div>
                    <Button
                    variant="outlined"
                    data-testid={`export data`}
                    size="small"
                    className="materialMasterImport__download-template-button"
                    startIcon={<GetAppIcon />}
                    aria-controls="simple-menu"
                    aria-haspopup="true"
                    onClick={(e) => {
                    props.exportTemplate();
                    }}
                    >
                    Download Template
                    </Button>
                  </div>
                </div>
              </DialogContent>
            )}
            
            <hr className="horizontal-line"></hr>

            <div className="warning-import-message">
                Please note that any existing material will be updated based on the data in the file uploaded
            </div>
  
            <DialogActions>
              <Button
                onClick={() => handleDiscard("discard")}
                className={"action-discard"}
              >
                Discard
              </Button>
              <Button
                onClick={() => fileUpload(files[0])}
                className={
                  `btn-primary ${files.length == 0 ? "action-import" : "action-import-active"}`
                }
                disabled={files.length == 0 ? true : false}
              >
                Import File
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </React.Fragment>
    );
}
