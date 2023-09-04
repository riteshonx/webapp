import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import React, { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import ConfirmDialog from '../../../../../shared/components/ConfirmDialog/ConfirmDialog';
import Notification, {
  AlertTypes,
} from '../../../../../shared/components/Toaster/Toaster';
import './FileImport.scss';

export default function FileImport(props: any) {
  const [files, setFiles] = useState<any[]>([]);
  const [confirmImport, setConfirmImport] = React.useState(false);
  const { getRootProps, getInputProps, open } = useDropzone({
    accept: props.fileType,
    noClick: true,
    noKeyboard: true,
    // maxSize: 5242880,
    onDrop: (acceptedFiles: any) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        setFiles(
          acceptedFiles.map((file: any) =>
            Object.assign(file, {
              preview: URL.createObjectURL(file),
            })
          )
        );
      } else {
        Notification.sendNotification(
          'Maximum file size allowed is 5MB',
          AlertTypes.warn
        );
        setFiles([]);
      }
    },
  });

  useEffect(
    () => () => {
      // Make sure to revoke the data uris to avoid memory leaks
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    },
    [files]
  );

  const handleClose = (operation: any) => {
    if (operation == 'discard') {
      setFiles([]);
      setConfirmImport(false);
      props.handleDiscard();
    } else {
      setConfirmImport(false);
      props.handleImportClose(files);
      setFiles([]);
    }
  };

  const handleWarningClose = () => {
    setConfirmImport(false);
  };

  // const uploadNewFile = () => {
  //   setFiles([]);
  // };

  const confirmMessage = {
    header: 'Warning!',
    text: 'You will lose all the existing plan data once you import this plan. Would you like to import?',
    cancel: 'Cancel',
    proceed: 'Import',
  };

  return (
    <React.Fragment>
      <div>
        <Dialog
          open={props.open}
          onClose={() => handleClose('discard')}
          PaperProps={{
            style: {
              minHeight: 'fit-content',
              minWidth: 'fit-content',
            },
          }}
          disableBackdropClick={true}
          aria-labelledby="form-dialog-title"
        >
          {files && files.length > 0 ? (
            <DialogContent>
              <div className="projectPlanImport">
                <div className="projectPlanImport__planUpload">
                  <div className="projectPlanImport__planUpload__dropZone">
                    <div className="projectPlanImport__planUpload__dropZone__content">
                      <div className="projectPlanImport__planUpload__dropZone__content__file">
                        <img src={props.fileImage} alt="xml-file" />
                        {files[0].name}{' '}
                        <DeleteOutlineIcon onClick={() => setFiles([])} />
                      </div>
                      <div className="projectPlanImport__planUpload__dropZone__content__uploadMessage">
                        <b>{files[0].name}</b> has been successfully uploaded
                      </div>
                      <div
                        style={{ paddingBottom: '2rem' }}
                        {...getRootProps({})}
                      >
                        <input {...getInputProps()} />
                        <button
                          className="btn-primary projectPlanImport__planUpload__dropZone__content__uploadButton"
                          onClick={open}
                        >
                          Upload a new file
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="projectPlanImport__planUpload__planWarning">
                    Please note that the existing plan will be overwritten once
                    you import a plan
                  </div>
                </div>
              </div>
            </DialogContent>
          ) : (
            <DialogContent>
              <div className="projectPlanImport">
                <div className="projectPlanImport__planUpload">
                  <div
                    {...getRootProps({
                      className: 'projectPlanImport__planUpload__dropZone',
                    })}
                  >
                    <input {...getInputProps()} />
                    <div className="projectPlanImport__planUpload__dropZone__content">
                      <div>
                        <CloudUploadIcon />
                      </div>
                      <div className="projectPlanImport__planUpload__dropZone__content__dragText">
                        Drag & drop your files here
                      </div>
                      <div
                        style={{ paddingTop: '4rem', paddingBottom: '4rem' }}
                      >
                        or
                      </div>
                      <div>
                        <button
                          className="btn-primary projectPlanImport__planUpload__dropZone__content__uploadButton"
                          onClick={open}
                        >
                          Upload from Computer
                        </button>
                      </div>
                      <div className="projectPlanImport__planUpload__dropZone__content__fileFormat">
                        File Formats: {props.supportedExt}
                      </div>
                    </div>
                  </div>
                  <div className="projectPlanImport__planUpload__planWarning">
                    Please note that the existing plan will be overwritten once
                    you import a plan
                  </div>
                </div>
              </div>
            </DialogContent>
          )}

          <DialogActions>
            <Button
              onClick={() => handleClose('discard')}
              className={'btn-secondary action-discard'}
            >
              Discard
            </Button>
            <Button
              onClick={() => setConfirmImport(true)}
              className={`btn-primary ${
                files.length == 0 ? 'action-import' : 'action-import-active'
              }`}
              disabled={files.length == 0 ? true : false}
            >
              Import File
            </Button>
          </DialogActions>
        </Dialog>

        {confirmImport ? (
          <ConfirmDialog
            open={confirmImport}
            message={confirmMessage}
            close={handleWarningClose}
            proceed={() => handleClose('import')}
          />
        ) : (
          ''
        )}
      </div>
    </React.Fragment>
  );
}
