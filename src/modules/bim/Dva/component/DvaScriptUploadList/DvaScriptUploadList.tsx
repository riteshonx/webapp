import React, { ReactElement, useReducer, useContext, useState, useEffect } from 'react';
import { bimContext } from 'src/modules/bim/contextAPI/bimContext';
import { bimReducer, initialState } from 'src/modules/bim/contextAPI/bimReducer';
import BimUploadLanding from "src/modules/bim/modelList/component/BimUploadLanding/BimUploadLanding";
import './DvaScriptUploadList.scss'
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import { projectFeatureAllowedRoles } from 'src/utils/role';
import { client } from 'src/services/graphql';
import { FETCH_ALL_BIM_MODEL_STATUS, CANCEL_BIM_MODEL, DELETE_BIM_ELEMENT_PROP, CHECK_BIM_DUPLICATE_FILENAME, CREATE_BIM_MODEL, UPDATE_BIM_SOURCE_KEY, DELETE_BIM_MODEL } from 'src/modules/bim/graphql/bimUpload';
import { match, useHistory, useRouteMatch } from "react-router-dom";
import { setActiveModel } from 'src/modules/bim/contextAPI/action';
import ConfirmDialog from 'src/modules/shared/components/ConfirmDialog/ConfirmDialog';
import Notification, { AlertTypes } from 'src/modules/shared/components/Toaster/Toaster';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { setIsLoading } from 'src/modules/root/context/authentication/action';
import { Box, DialogActions, Select, Table, TableBody, TableCell, TableContainer, TableHead, TextField } from '@material-ui/core';
import DragDrop from 'src/modules/bim/modelList/component/DragDrop/DragDrop';
import DvaScriptUploadHeader from 'src/modules/bim/Dva/component/DvaScriptUploadHeader/DvaScriptUploadHeader';
import DvaScriptUploadTable from 'src/modules/bim/Dva/component/DvaScriptUploadTable/DvaScriptUploadTable';
import { multiPartPost, postApiWithEchange } from 'src/services/api';
import axios from 'axios';
import { getExchangeToken } from "../../../../../services/authservice";
import { setEdgeCenter } from "src/modules/root/context/authentication/action";
import Modal from "@mui/material/Modal";
import { TextArea } from 'src/modules/baseService/forms/components/Text/Text';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { string } from 'yup';
import { withStyles } from '@material-ui/core/styles';
import TextFieldCustom from 'src/modules/dynamicScheduling/components/TextFieldCustom/TextFieldCustom';
import { TableRow, Theme } from '@mui/material';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import TablePagination from "../../../../shared/components/TablePagination/TablePagination";

export interface Params {
  projectId: string;
}

interface message {
  header: string,
  text: string,
  cancel: string,
  proceed: string,
}

let isUploading = false;

const defaultValues: any = {
  ScriptName: '',
  ScriptCategory: '',
  ScriptDescription: '',
};

type FormValues = {
  ScriptName: string,
  ScriptCategory: string,
  ScriptDescription: string
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    placeholder: {
      color: "#aaa"
    },
    inputLabel: {
      fontWeight: 600,
    }
  })
);

let pgn = 1;

export default function DvaScriptUploadList(props: any) {
  const { dispatch, state }: any = useContext(stateContext);
  const context: any = useContext(bimContext);
  const pathMatch: match<Params> = useRouteMatch();
  const history = useHistory();
  const [allModelsList, setAllModelsList] = useState<any>([]);
  const [allScriptMgtList, setAllScriptMgtList] = useState<any>([]);
  const [openUploadBox, setOpenUploadBox] = useState(false);
  const [isUploadDisabled, setIsUploadDisabled] = useState(false);
  const [isIntialized, setIsIntialized] = useState(false);
  const [dvaScriptList, setDVAScriptList] = useState<any>([]);
  const [dvaScriptTableList, setDVAScriptTableList] = useState<any>([]);
  const [allDvaScriptTableList, setAllDVAScriptTableList] = useState<any>([]);
  const [scriptName, setScriptName] = useState('');
  const [scriptCategory, setScriptCategory] = useState('');
  const [scriptDescription, setScriptDescription] = useState('');
  const {
    reset,
    control,
    setError,
    clearErrors,
    formState: { errors }
  } = useForm<any>({
    defaultValues
  });
  const [selectedMaterial, setSelectedMaterial] = React.useState<any>([]);
  const [materials, setMaterials] = useState<any>([]);
  const [searchText, setSearchText] = useState<any>('');
  const classes = useStyles();
  const [totalRecords, setTotalRecords] = useState(-1);
  const limit = 8;
  const [pageNo, setPageNo] = useState(1);

  let statuCheckInterval: any = null;


  const handleChangeScriptName = (e: any) => {
    if (e.target.value != '') {
      clearErrors("scriptName");
    }    
    setScriptName(e.target.value);
  };
  const handleChangeScriptCategory = (e: any) => {
    if (e.target.value != '') {
      clearErrors("scriptCategory");
    }
    setScriptCategory(e.target.value);
  };
  const handleScriptDescription = (e: any) => {
    setScriptDescription(e.target.value);
  };

 useEffect(() => {
    // action on get scripts
  }, [dvaScriptList]);

  useEffect(() => {
    fetchDvaScriptData();
    console.log(dvaScriptList)
}, []);

useEffect(() => {
  if (state.selectedProjectToken && state?.projectFeaturePermissons?.canviewBimModel) {
    fetchAllDVAModels();
      statuCheckInterval = setInterval(fetchAllDVAModels, 10000);
  }
  return () => {
      clearInterval(statuCheckInterval);
      isUploading = false;
      pgn = 1;
  }
}, [state.selectedProjectToken, pathMatch.params.projectId])
useEffect(() => {
  pgn = pageNo;
  state.selectedProjectToken &&  onPageChange();
}, [pageNo])

useEffect(() => {
  (pageNo > 1) ? setPageNo(1) :
      state.selectedProjectToken &&  onPageChange();
}, [])





  

  async function addScript(
    argBody: any,
  ) {
    const token = getExchangeToken();
    try {
      dispatch(setIsLoading(true))
      const response = await axios.post(
        `${process.env["REACT_APP_DVASCRIPT_URL"]}script/add-script-data`,
        argBody,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )
      .then((response: { data: any }) => {
        dispatch(setIsLoading(false))
        const data = response.data;        
        fetchDvaScriptData();
        Notification.sendNotification('script added successfully', AlertTypes.success);
        return data;
      })
      .catch((error: string | undefined) => {
        Notification.sendNotification('Some error occured while calling the api', AlertTypes.error);
        throw new Error(error);
      });
    } catch (error: any) {
      Notification.sendNotification('Some error occured while calling the api', AlertTypes.error);
      dispatch(setIsLoading(false))
      throw new Error(error);
    }
  }



  async function AddNewScript() {
    const data = {
      "scriptName": scriptName,
      "scriptCategory": scriptCategory,
      "scriptDescription": scriptDescription
    }
    if (scriptName == "" || scriptCategory == "") {
      if (scriptName == "") {
        setError("scriptName", {
          type: "required",
          message: "Please provide Script Name",
        })
      }
      else {
        clearErrors("scriptName")
      }

      if (scriptCategory == "") {
        setError("scriptCategory", {
          type: "required",
          message: "Please provide Script Category",
        })
      }
      else {
        clearErrors("scriptCategory")
      }      
    }
    else {
      const scriptnameExist = dvaScriptList.hasOwnProperty(scriptName);
      if (scriptName != "" && scriptnameExist ) {
        setError("scriptName", {
          type: "unique",
          message: "Script Name already exist",
        })
      }
      else {
        clearErrors("scriptName")
        const dataVal = await addScript(data);
        handleDialogClose();
        setOpenUploadBox(false);
      }      
    }
  }

  async function discardAddNewScript() {
    handleDialogClose();
    setOpenUploadBox(false);
  }



  const handleDialogClose = () => {
    setScriptName('');
    setScriptCategory('');
    setScriptDescription('');
    clearErrors("scriptName")
    clearErrors("scriptCategory")
  };

  useEffect(() => {
    (async () => {
      const scripts = await getAllScriptInfo();
      setDVAScriptList(scripts);
    })();

    return () => {
      // this now gets called when the component unmounts
    };
  }, []);
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

  async function getAllScriptsDVA() {
    const dataVal = await getAllScriptInfo();
    console.log(dvaScriptList);
    if (dataVal !== null) {
      setOpenUploadBox(true);
    }
  }

  const addNewScript = () => {
    AddNewScript();
    fetchDvaScriptData();
  };
  
  const getScriptListDVA = () => {
    getAllScriptsDVA();
  };

  const fetchDvaScriptData = async() => {
    const token = getExchangeToken();
    try {
          dispatch(setIsLoading(true))
          const response = await axios.get(
            `${process.env["REACT_APP_DVASCRIPT_URL"]}script/get-script-list?scriptParam=all`,
            {
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          dispatch(setIsLoading(false))
          const data = await response.data.result;
          setAllDVAScriptTableList(data);
          return data;
        } catch (error: any) {
          dispatch(setIsLoading(false))
          throw new Error(error);
        }
      };

      const onPageChange = async () => {
        try {
            isUploading = false;
            dispatch(setIsLoading(true));
            await fetchAllDVAModels();
            dispatch(setIsLoading(false));
            isUploading = true;
        } catch (error: any) {
            dispatch(setIsLoading(false));
            Notification.sendNotification('Unable to get script Management data', AlertTypes.error);
        }
      }

      const fetchAllDVAModels = async () => {
        const allModels = allDvaScriptTableList;
        let isDisabled = false;
        let totalModels = 0;
        console.log(allModels);

        const filtermodels = Object.keys(allModels).map((key: any) => {
          if (allModels[key].scriptName) {
            isDisabled = true;
            totalModels++;
            return allModels[key];
        }

        if (!allModels[key].scriptName) {
            totalModels++;
            return allModels[key];
        }
        });
        
        setTotalRecords(totalModels);
        console.log(totalModels);
        setDVAScriptTableList(filtermodels.slice((pgn - 1) * limit, pgn * limit))
        setIsIntialized(true);
        console.log(filtermodels.slice((pgn - 1) * limit, pgn * limit))
      }
      
  return (

    <div className={"dvaUploadList"}>
      {!isIntialized ? <div className='dva-upload-list-header'><DvaScriptUploadHeader name="Models" description={"Please wait..."} /></div> :      
        <Button disabled={isUploadDisabled} variant="outlined" className="btn-primary add-new-button" onClick={() => setOpenUploadBox(true)} style={{position:"absolute",top:"66px",right:"40px"}} > Add New Script</Button>}      
      <div className="dva-horizontal-line" ></div>
      <DvaScriptUploadTable scriptList={dvaScriptTableList} modelList={allModelsList} pageNumber={pageNo} />      
      <div className='dva-script-pagination' style={{position:"absolute",bottom:"20px",right:"19px"}}>
      {<TablePagination      
                            className = "dva-script-pagination"
                            count={totalRecords > 0 ? Math.ceil(totalRecords / limit) : 0}
                            page={pageNo}
                            onChange={(e: any, page: number) => setPageNo(page)}
                            
                        />}
                        </div>
      <div className="dva-dialog">
        <Dialog
          open={openUploadBox}
          disableBackdropClick={true}
          disableEnforceFocus
          onClose={() => setOpenUploadBox(false)}
          aria-labelledby="form-dialog-title"
          maxWidth={"md"}
          >
          <DialogTitle id="dva-form-dialog-title">
            <Box className="dva-dialog__content__fields__header">
              {' '}
              Add New Script{' '}
            </Box>
          </DialogTitle>
          <DialogContent>
            <div className="dva-dialog__content" style={{padding:"0px" ,height:"332px"}}>
              <div className="dva-dialog__content__fields">
                <Grid container>
                  <Grid item xs={12} className="dva-dialog_content_new_scriptname" >
                    <Grid xs={4} className='dva-grid-input-label'>
                      <InputLabel shrink className={classes.inputLabel}  style={{height:"21px",width:"300px"}}>
                        Script Name
                        <span className='dva-manditory'>*</span>  
                      </InputLabel>
                    </Grid>
                    <Grid xs={8}>
                      <Controller
                        render={({ field }: { field: any, }) => (
                          <TextField
                          className="dva-add-script-text-field"
                            {...field}
                            placeholder="Script Name"
                            variant="standard"
                            value={scriptName}
                            InputProps={{ disableUnderline: true }}
                            onChange={handleChangeScriptName}
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
                          {errors.scriptName?.type === "required" ? (<span style={{position:"absolute",top:"44px"}}>* Script Name is required!!</span>
                          ):(
                            errors.scriptName?.type === "unique" && (
                              <span style={{position:"absolute",top:"44px"}}>* Script Name already exist!!</span> 
                              )
                            ) 
                          }
                        </p>
                      </div>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} className="dva-dialog_content_new_scriptcategory">
                    <Grid xs={4} className='dva-grid-input-label'>
                      <InputLabel shrink className={classes.inputLabel} style={{height:"21px",width:"300px"}} >
                        Script Category
                        <span className='dva-manditory'>*</span>
                      </InputLabel>
                    </Grid>
                    <Grid xs={8}>
                      <Controller
                        render={({ field }: { field: any, }) => (
                          <TextField
                          className="dva-add-script-text-field"
                            {...field}
                            placeholder="Script Category"
                            fullWidth
                            InputProps={{ disableUnderline: true }}
                            value={scriptCategory}

                            onChange={handleChangeScriptCategory}
                            InputLabelProps={{
                              shrink: true,
                            }}
                          />
                        )}
                        name="Name"
                        control={control} />
                      <div className="error-wrap">
                        <p className="error-wrap__message">
                          {errors.scriptCategory?.type === "required" && (<span style={{position:"absolute",top:"44px"}}>* Script Category is required!!</span>)}
                        </p>
                      </div>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} className="dva-dialog_content_new_scriptdescription">
                    <Grid xs={4} className='dva-grid-input-label'>
                      <InputLabel shrink className={classes.inputLabel} style={{height:"21px",width:"300px"}}>
                        Script Description
                      </InputLabel>
                    </Grid>
                    <Grid xs={8}>
                      <Controller
                        render={({ field }: { field: any, }) => (
                          <TextField
                          className="dva-add-script-text-field"
                            {...field}
                            placeholder="Script Description"
                            InputProps={{ disableUnderline: true }}
                            value={scriptDescription}
                            onChange={handleScriptDescription}
                            InputLabelProps={{
                              shrink: true,
                            }}
                          />
                        )}
                        name="Name"
                        control={control}
                      />
                    </Grid>
                  </Grid>
                </Grid>

              </div>
            </div>
            <div className="horizontal-line" ></div>
            <div className="dva-dialog__footer">
              <Button
                data-testid={'create-material-clse'}
                variant="outlined"
                className="dva-new-btn-secondary"
                onClick={() => discardAddNewScript()}
              >
                Close
              </Button>
              <Button
                data-testid={'create-material-save'}
                variant="outlined"
                type="submit"
                disabled={false}
                className="dva-new-btn-primary"
                onClick={() => addNewScript()}
              >
                Upload
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

     
    </div>
  );
}
