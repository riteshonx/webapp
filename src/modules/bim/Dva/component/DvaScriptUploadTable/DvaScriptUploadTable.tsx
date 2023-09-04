import React, { useState, useEffect, useContext } from 'react';
import { stateContext } from '../../../../root/context/authentication/authContext';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import './DvaScriptUploadTable.scss'
import RevetImg from '../../../../../assets/images/rvt-file.svg';
import IfcImg from '../../../../../assets/images/ifc-file.svg';
import moment from 'moment';
import LaunchIcon from '@material-ui/icons/Launch';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import DeleteIcon from '@material-ui/icons/Delete';
import BimStepper from 'src/modules/bim/modelList/component/Stepper/Stepper'
import { stepsDetailsModelDetails, bimstatusColorNameMapping } from '../../../constants/query'
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import { getExchangeToken } from "../../../../../services/authservice";
import { setIsLoading } from 'src/modules/root/context/authentication/action';
import { object } from 'yup';
import popupEditMaterialIcon from '../../../../../assets/images/editmaterialpopup.svg';
import TablePagination from "../../../../shared/components/TablePagination/TablePagination";
import { useDebounce } from 'src/customhooks/useDebounce';
import { projectDetailsContext } from 'src/modules/baseService/projects/Context/ProjectDetailsContext';
import Notification, { AlertTypes } from '../../../../shared/components/Toaster/Toaster';
import { Button, Dialog, DialogContent, DialogTitle, Grid, InputLabel, TextField } from '@material-ui/core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import axios from 'axios';

const defaultValues: any = {
    ScriptName: '',
    GHUserInput: '',
    GHUserOutput: '',
    GHFile: '',
  };

export default function DvaScriptUploadTable(props: any) {
    const { dispatch, state }: any = useContext(stateContext);
    const [dvaScriptList, setDVAScriptList] = useState<any>([]);
    const [ScriptNameKey, setScriptNameKey] = useState('');
    const [ScriptNameValue, setScriptNameValue] = useState('');
    const [isUploadDisabled, setIsUploadDisabled] = useState(false);
    const [openGHUploadBox, setOpenGHUploadBox] = useState(false);
    const [scriptId, setScriptId] = useState('');
    const [userInput, setUserInput] = useState('');
    const [manufacturerInput, setManufacturerInput] = useState('');
    const [returnOutput, setReturnOutput] = useState('');
    const [file, setFile] = useState('')
    const [fileName, setFileName] = useState(null)
    const {
        reset,
        control,
        setError,
        clearErrors,
        formState: { errors }
      } = useForm<any>({
        defaultValues
      });

    let uploadStartTime: any;
    
    useEffect(() => {
        (async () => {
          const scripts = await getAllScriptInfo();
          setDVAScriptList(scripts);
        })();
    
        return () => {
          // this now gets called when the component unmounts
        };
      }, []);
      
      const handleChangeScriptId = (e: any) => {
        if (e.target.value != '' || e.target.value != "NA") {
          clearErrors("GHScriptId");
        }
        setScriptId(e.target.value);
      };  

    const handleChangeUserInput = (e: any) => {
        if (e.target.value != '') {
          clearErrors("GHUserInput");
        }
        setUserInput(e.target.value);
      };
      const handleManufacturerInput = (e: any) => {
        setManufacturerInput(e.target.value);
      };
      const handleReturnOutput = (e: any) => {
        if (e.target.value != '') {
          clearErrors("GHReturnOutput");
        }
        setReturnOutput(e.target.value);
      };

      const onUploadFileChange = (e: any) => {
        if (e.target.files < 1 || !e.target.validity.valid) {
          return
        }
        clearErrors("GHFile")
        fileToBase64(e.target.files[0], (err: any, result: any) => {
          if (result) {
            setFile(result)
            setFileName(e.target.files[0])
          }
        })
      }      
    
    const filteredNotifications = Object.entries(dvaScriptList);
    
    const getScriptListDVA = (dpscriptname:any) => {
        getAllScriptsDVA(dpscriptname);
      };

    async function getAllScriptsDVA(selectscriptname:any) {
        const dataVal = await getAllScriptInfo();
        setScriptNameKey(selectscriptname);
        const itemsList: any = Object.keys(dataVal).map((key) => {
            if(key == selectscriptname)
            {
                setScriptNameValue(dataVal[key]);
                setScriptId(dataVal[key]);
            }
          });
          if (dataVal !== null) {
          setOpenGHUploadBox(true);
        }
      }

      async function getAllScriptInfo() {
        const token = getExchangeToken();
        try {
          dispatch(setIsLoading(true))
          const response = await axios.get(
            `${process.env["REACT_APP_DVASCRIPT_URL"]}script/get-script-list`,
            {
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          dispatch(setIsLoading(false))
          const data = response.data.result;
          setDVAScriptList(data);
          return data;
        } catch (error: any) {
          dispatch(setIsLoading(false))
          throw new Error(error);
        }
      }

      async function discarduploadGHAPI() {
        handleDialogClose();
        setOpenGHUploadBox(false);
      }

      const handleDialogClose = () => {
        
        setScriptId('');
        setUserInput('');
        setReturnOutput('');
        setManufacturerInput('');
        setFile('');
        clearErrors("scriptName")
        clearErrors("GHScriptId")
        clearErrors("GHUserInput")
        clearErrors("GHReturnOutput")
        clearErrors("GHFile")
      };

      const uploadGHFile = () => {
        UploadNewGhFile();
      };

      async function UploadNewGhFile() {
        console.log(file);
        const arr = (file as string).split(",");
        const data = {
          "scriptId": ScriptNameValue,
          "userInput": userInput,
          "manufacturerInput": manufacturerInput,
          "output": returnOutput,
          "ghFile": arr[1]
        }
        console.log(arr[1]);
        console.log(data);
    
        if (userInput == "" || returnOutput == "" || !arr[1] || scriptId == "" || scriptId == "NA") {
          if (scriptId == "" || scriptId == "NA") {
            setError("GHScriptId", {
              type: "required",
            })
          }
          else {
            clearErrors("GHScriptId")
          }
          if (userInput == "") {
            setError("GHUserInput", {
              type: "required",
            })
          }
          else {
            clearErrors("GHUserInput")
          }    
          if (returnOutput == "") {
            setError("GHReturnOutput", {
              type: "required",
            })
          }
          else {
            clearErrors("GHReturnOutput")
          }    
          if (!arr[1]) {
            setError("GHFile", {
              type: "required",
            })
          }
          else {
            clearErrors("GHFile")
          }    
        }
        else {
          const dataVal = await uploadGHAPI(data);
          console.log(dataVal);
          scriptId == "";
          if (dataVal !== null) {
            Notification.sendNotification('Gh data uploaded successfully', AlertTypes.success);
            handleDialogClose();
            setOpenGHUploadBox(false);
          }
          else {
            Notification.sendNotification('Some error occured while calling the api', AlertTypes.error);
            handleDialogClose();
            setOpenGHUploadBox(false);
          }
        }
      }

      const fileToBase64 = (file: any, cb: any) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = function () {
          cb(null, reader.result)
        }
        reader.onerror = function (error) {
          cb(error, null)
        }
      }

      async function uploadGHAPI(
        argBody: any,
      ) {
        const token = getExchangeToken();
        console.log(token);
        try {
          dispatch(setIsLoading(true))
          const response = await axios.post(
            `${process.env["REACT_APP_DVASCRIPT_URL"]}script/add-scriptIO-data`,
            argBody,
            {
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          dispatch(setIsLoading(false))
          const data = response.data;
    
          return data;
        } catch (error: any) {
          dispatch(setIsLoading(false))
          Notification.sendNotification(error, AlertTypes.error);
          setOpenGHUploadBox(false);
          throw new Error(error);
        }
      }
    
      return (
        <TableContainer className="dvaTableContainer" component={Paper}>          
          <Table className="dvaTable" aria-label="simple table">
                <TableHead className="dvaTableHead">
                    <TableRow>
                        <TableCell>SL No</TableCell>
                        <TableCell align="left">Script Names</TableCell>
                        <TableCell align="left">Script Categories</TableCell>
                        <TableCell align="left">Script Description</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                         Object.keys(props.scriptList).map((key, index) => {
                            return <React.Fragment >
                                <TableRow className={`dvaTableRow ${index % 2 && 'geybg'}`} >
                                <TableCell className="fileNameCell" component="th" scope="row">
                                        <span>
                                            <div>
                                              {props.pageNumber == 1 ? index+1 : props.pageNumber * 8-8+index + 1}
                                            </div>
                                        </span>
                                    </TableCell>
                                    <TableCell align="left">
                                        <span>
                                            <div>
                                                {props.scriptList[key].scriptName}
                                            </div>
                                        </span>
                                    </TableCell>
                                    <TableCell align="left">{props.scriptList[key].scriptCategory}</TableCell>
                                    <TableCell align="left">{props.scriptList[key].scriptDescription}
                                    {
                                    <Button disabled={isUploadDisabled}   startIcon={<CloudUploadIcon />} onClick={() => getScriptListDVA(props.scriptList[key].scriptName)} style={{float:"right",border:"none"}} >
                                        
                                    </Button>
                                }
                                    </TableCell>
                                </TableRow>
                            </React.Fragment>
                        })

                    }
                </TableBody>
                </Table>
    <div className="dva-dialog">
        <Dialog
          open={openGHUploadBox}
          disableBackdropClick={true}
          onClose={() => setOpenGHUploadBox(false)}
          aria-labelledby="form-dialog-title"
          maxWidth={"md"}
          >
          <DialogTitle id="dva-form-dialog-title">Upload script model</DialogTitle>
          <DialogContent>
            <div className="dva-dialog__content">
              <div className="dva-dialog__content__fields">
                <Grid container>
                <Grid item xs={12} className="dva-dialog_content_upload_scriptname">
                    <Grid xs={4} className='dva-grid-input-label'>
                      <InputLabel shrink style={{height:"21px",width:"300px"}}>
                        ScriptName
                        <span className='dva-manditory'>*</span>
                      </InputLabel>
                    </Grid>
                    <Grid xs={8}>
                      <Controller
                        render={({ field }: { field: any }) => (
                          <TextField
                          className="dva-add-script-text-field"
                            {...field}
                            InputProps={{ disableUnderline: true }}
                            value={ScriptNameKey}
                            onChange={handleChangeScriptId}
                            InputLabelProps={{
                              shrink: true,
                            }}
                            disabled
                            style={{caretColor : "transparent"}}
                          />
                        )}
                        name="CustomType"
                        control={control}
                      />
                      <div className="error-wrap">
                        <p className="error-wrap__message">
                          {errors?.GHScriptId?.type === 'required' && <span style={{position:"absolute",top:"6px"}}>* Please select the script name.</span>}
                        </p>
                      </div>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} className="dva-dialog_content_upload_user-input">
                    <Grid xs={4} className='dva-grid-input-label'>
                      <InputLabel shrink style={{height:"21px",width:"300px",position:"absolute",top:"5px"}}>
                        User Input
                        <span className='dva-manditory'>*</span>
                      </InputLabel>
                    </Grid>
                    <Grid xs={8}>
                      <Controller
                        render={({ field }: { field: any, }) => (                          
                          <TextField
                          className="dva-add-script-text-field"
                            {...field}
                            placeholder="User Input"
                            InputProps={{ disableUnderline: true }}
                            value={userInput}
                            onChange={handleChangeUserInput}
                            InputLabelProps={{
                              shrink: true,
                            }}
                          />
                        )}
                        name="Name"
                        control={control}
                      />
                      <div className="error-wrap">
                        <p className="error-wrap__message">
                          {errors.GHUserInput?.type === "required" && (<span style={{position:"absolute",top:"40px"}}>* User Input is required!!</span>)}
                        </p>
                      </div>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} className="dva-dialog_content_upload_manufacturer">
                    <Grid xs={4} className='dva-grid-input-label'>
                      <InputLabel shrink style={{height:"21px",width:"300px"}}>
                        Manufacturer Input
                      </InputLabel>
                    </Grid>
                    <Grid xs={8}>
                      <Controller
                        render={({ field }: { field: any, }) => (
                          <TextField
                          className="dva-add-script-text-field"
                            {...field}
                            placeholder="Manufacturer Input"
                            InputProps={{ disableUnderline: true }}
                            value={manufacturerInput}
                            onChange={handleManufacturerInput}
                            InputLabelProps={{
                              shrink: true,
                            }}
                            style={{position:"absolute",top:"16px"}}
                          />
                        )}
                        name="Name"
                        control={control}
                      />
                    </Grid>
                  </Grid>
                  <Grid item xs={12} className="dva-dialog_content_upload_return-output">
                    <Grid xs={4} className='dva-grid-input-label'>
                      <InputLabel shrink style={{height:"21px",width:"300px",position:"absolute",bottom:"25px"}}>
                        Return Output
                        <span className='dva-manditory'>*</span>
                      </InputLabel>
                    </Grid>
                    <Grid xs={8}>
                      <Controller
                        render={({ field }: { field: any, }) => (
                          <TextField
                          className="dva-add-script-text-field"
                            {...field}
                            placeholder="Return Output"
                            InputProps={{ disableUnderline: true }}
                            value={returnOutput}
                            onChange={handleReturnOutput}
                            InputLabelProps={{
                              shrink: true,
                            }}
                            style={{position:"absolute",top:"8px"}}
                          />
                        )}
                        name="Name"
                        control={control}
                      />
                      <div className="error-wrap">
                        <p className="error-wrap__message">
                          {errors.GHReturnOutput?.type === "required" && (<span style={{position:"absolute",top:"27px"}}>* Return Output is required!!</span>)}
                        </p>
                      </div>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} className="dva-dialog_content_upload_gh-file">
                    <Grid xs={4} className='dva-grid-input-label'>
                      <InputLabel shrink style={{height:"21px",width:"300px",position:"absolute",bottom:"38px"}}>
                        GH File
                        <span className='dva-manditory'>*</span>
                      </InputLabel>
                    </Grid>
                    <Grid xs={8}>
                      <input type="file" onChange={onUploadFileChange} accept="application/gh" className='dva-dialog-upload-file' style={{position:"absolute",top:"1px"}} />
                      <div className="error-wrap">
                        <p className="error-wrap__message" style={{ marginTop: "6px" }}>
                          {errors.GHFile?.type === "required" && (<span style={{position:"absolute",top:"27px"}}>* GH file is required!!</span>)}
                        </p>
                      </div>
                    </Grid>
                  </Grid>
                </Grid>
              </div>
            </div>
            <div className="upload-horizontal-line" ></div>
            <div className="dva-dialog__footer">
              <Button
                data-testid={'create-material-clse'}
                variant="outlined"
                className="dva-upload-btn-secondary"
                onClick={() => discarduploadGHAPI()}
              >
                Close
              </Button>
              <Button
                data-testid={'create-material-save'}
                variant="outlined"
                type="submit"
                disabled={false}
                className="dva-upload-btn-primary"
                onClick={() => uploadGHFile()}
              >
                Upload
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
        </TableContainer>        
    );
}