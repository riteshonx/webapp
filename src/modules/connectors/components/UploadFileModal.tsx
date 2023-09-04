import {
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Stack,
  IconButton,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloseIcon from '@mui/icons-material/Close';
import { DeleteOutlineSharp } from '@mui/icons-material';
import React, { useContext } from 'react';
import { setIsLoading } from 'src/modules/root/context/authentication/action';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import { handleFileImport, uploadFile } from '../actions/actions';
import { ConnRowData, FileObjType, ProjectDataInterface } from '../utils/types';
import ShowComponent from 'src/modules/shared/utils/ShowComponent';
import { SelSourceProjectContext } from './ThirdPartyProjects';

interface Props {
  row: ConnRowData;
  updateLocationTree:any
}
export default function UploadFileModal({ row,updateLocationTree }: Props): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const [fileObj, setFileObj] = React.useState<FileObjType>({});
  const {
    dispatch,
    state: { sourceSystem },
  } = React.useContext(stateContext);
  const {
    selSourceProjectState: [selSourceProject],
  } = useContext(SelSourceProjectContext);
  const { projectId, id, } = row;
  let sourceProject = selSourceProject[id]?.value;
  if (!sourceProject) {
    sourceProject = row as unknown as ProjectDataInterface;
  }
  const handleLoaderUpload = async (
    cb: (...rest: any[]) => Promise<FileObjType | undefined>,
    cb2: React.Dispatch<React.SetStateAction<FileObjType>> | undefined,
    ...rest: any[]
  ) => {
    try {
      dispatch(setIsLoading(true));
      const data = await cb(...rest);
      if (cb2) cb2(data || {});
    } finally {
      dispatch(setIsLoading(false));
    }
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    let file: File | null = null;
    const items = e.dataTransfer.items;
    if (items.length) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type === 'text/csv') {
          file = items[i].getAsFile();
          i = items.length;
        }
      }
    }
    removeDragData(e);
    handleLoaderUpload(uploadFile, setFileObj, file, projectId);
  };
  const removeDragData = (ev: React.DragEvent) => {
    if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to remove the drag data
      ev.dataTransfer.items.clear();
    } else {
      // Use DataTransfer interface to remove the drag data
      ev.dataTransfer.clearData();
    }
  };
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleParentFunction=()=>{
    const data={
      sourceSystem: sourceSystem?.name,
      linkedProject: {
        agaveProjectId: sourceProject?.agaveProjectId,
        sourceProjectId: sourceProject?.metadata?.id,
      },
      projectId,
      initiator: 'client',
    }
    updateLocationTree(data)
  }
  return (
    <Grid item>
      <Button
        className="btn-primary button-size"
        onClick={() => setOpen(true)}
        data-testid="connectors-uploadfilemodal-btn"
      >
        Import RFI from file
      </Button>
      <Button
        className="btn-primary button-size"
        onClick={() => handleParentFunction()}
        data-testid="connectors-uploadfilemodal-btn"
        disabled={!sourceProject?.agaveProjectId}
      >
        Sync Location Tree
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        classes={{ paper: 'upload-file-modal__dialog' }}
        data-testid="connectors-uploadfilemodal-dialog"
      >
        <DialogTitle sx={{ padding: '8px 16px', fontSize: '1.75rem' }}>
          <Stack direction={'row'} justifyContent="space-between">
            <Box>Import file</Box>
            <Box>
              <IconButton
                onClick={() => setOpen(false)}
                data-testid="connectors-uploadfilemodal-dialog-close"
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent className="upload-file-modal__dialog__content" dividers>
          <ShowComponent showState={!fileObj?.fileKey}>
            <Stack
              direction="column"
              justifyContent={'center'}
              className="upload-file-modal__dialog__content__file-upload"
              onDrop={handleDrop}
              onDragOver={handleDrag}
              component="label"
              data-testid="connectors-uploadfilemodal-dialog-upload-area"
              sx={{
                cursor: 'pointer',
                border: '2px dashed var(--onx-A1)',
                borderRadius: '5px',
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <UploadFileIcon sx={{ fontSize: '3rem' }} />
              </Box>
              Drag and drop or click to upload the file here
              <input
                hidden
                accept=".csv"
                type="file"
                onChange={(e) =>
                  handleLoaderUpload(
                    uploadFile,
                    setFileObj,
                    e.target.files?.[0] || null,
                    projectId
                  )
                }
              />
            </Stack>
          </ShowComponent>
          <ShowComponent showState={!!fileObj?.fileKey}>
            <Stack
              direction="column"
              alignItems={'center'}
              justifyContent={'center'}
              className="upload-file-modal__dialog__content__file-upload"
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                width={'80%'}
                sx={{
                  border: '1.5px dashed var(--onx-A1)',
                  borderRadius: '5px',
                  backgroundColor: 'var(--onx-text-light)',
                  marginBottom: '2.5px',
                }}
              >
                <Stack direction="row" alignItems={'center'}>
                  <UploadFileIcon sx={{ fontSize: '3rem' }} />
                  <Typography variant="caption">
                    {fileObj?.file?.name}
                  </Typography>
                </Stack>
                <IconButton
                  onClick={() => {
                    setFileObj((prev) => ({ ...prev, fileKey: '' }));
                  }}
                  data-testid="connectors-uploadfilemodal-dialog-removefile"
                >
                  <DeleteOutlineSharp
                    sx={{
                      fontSize: '3rem',
                      color: 'var(--onx-error-dark)',
                      cursor: 'pointer',
                    }}
                  />
                </IconButton>
              </Stack>
              <Typography variant="h6">
                <Typography
                  variant="caption"
                  sx={{ color: 'var(--onx-success-dark)', fontSize: '1.35rem' }}
                >{`${fileObj?.file?.name} `}</Typography>
                is ready for import.
              </Typography>
            </Stack>
          </ShowComponent>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            classes={{
              root: 'button-size upload-file-modal__dialog__actions__cancel',
            }}
            onClick={() => setOpen(false)}
            data-testid="connectors-uploadfilemodal-dialog-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={() =>
              handleLoaderUpload(
                handleFileImport,
                setFileObj,
                2,
                fileObj?.fileKey
              )
            }
            variant="outlined"
            className="btn-primary"
            disabled={!fileObj?.fileKey}
            classes={{
              root: 'button-size',
            }}
            data-testid="connectors-uploadfilemodal-dialog-import"
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
