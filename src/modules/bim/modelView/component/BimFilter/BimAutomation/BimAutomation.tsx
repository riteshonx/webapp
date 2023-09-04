import React, { useContext, useState, useEffect } from "react";
import "./BimAutomation.scss";
import { stateContext } from "../../../../../root/context/authentication/authContext";
import { bimContext } from "../../../../contextAPI/bimContext";
import DraggableComponent from "../../../component/DraggableComponent/DraggableComponent";
import { FETCH_ELEMENT_PROPS_BY_ID } from "../../../../graphql/bimQuery";
import { projectFeatureAllowedRoles } from "../../../../../../utils/role";
import { client } from "../../../../../../services/graphql";
import { Button, Checkbox, FormControlLabel, Radio, RadioGroup, Tooltip } from "@material-ui/core";
import { Close, Label } from "@material-ui/icons";
// import Tooltip from "@material-ui/core/Tooltip";
import { CircularProgress } from "@material-ui/core";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import ListIcon from "@material-ui/icons/List";
import InputLabel from '@material-ui/core/InputLabel';
import ActiveIndianRupeeIcon from '../../../../../../assets/images/active-indian-rupee.svg';
import ActiveMonetizationIcon from '../../../../../../assets/images/active-monetization_on.svg';
import ActivePoundIcon from '../../../../../../assets/images/active-pound.svg';
import MonetizationIcon from '../../../../../../assets/images/monetization_on.svg';
import NonActiveIndianRupeeIcon from '../../../../../../assets/images/NonActiveIndianRupee.svg';
import NonActivePoundIcon from '../../../../../../assets/images/NonActivePound.svg';

import {
  FETCH_SPATIAL_PROPS_ELEMENT_PROPS_BY_ID_LIST_MODEL_ID,
  FETCH_ELEMENT_PROPS_BY_ID_LIST,
} from "../../../../graphql/bimQuery";
import { setselectedFeature } from "src/modules/baseService/formConsumption/Context/link/linkAction";
import { json } from "d3";
import fs from "fs";
import axios from "axios";
import { decodeExchangeToken, getExchangeToken } from "src/services/authservice";
import { getProjectExchangeToken } from "src/services/authservice";
import csvdownload from "src/assets/images/csvdownload.jpg";
import { boolean } from "yup";
import { setegid, title } from "process";
import { setIsLoading } from "src/modules/root/context/authentication/action";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import TableContainer from "@material-ui/core/TableContainer";
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { FETCH_PROJECT_BY_ID } from "src/graphhql/queries/projects";
import { match, useRouteMatch } from "react-router-dom";
import pdfdownload from "src/assets/images/pdfdownload.jpg";
import ifcdownload from "src/assets/images/ifcdownload.svg";
import Notification, { AlertTypes } from 'src/modules/shared/components/Toaster/Toaster';

export interface Params {
  id: string;
}
const draggableStyle = {
  position: "fixed",
  //   right: "15%",
  //   top: "50px",
  top: "45%",
  left: "60%",
  transform: "translate(-50%, -50%)",
  background: "#F9F9F9",
  border: "1px solid #EDEDED",
  boxSizing: "border-box",
  boxShadow: "0px 0px 8px rgba(0, 0, 0, 0.25)",
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
      "& .MuiPaper-elevation1": {
        boxShadow: "none",
      },
    },
    container: {
      height: "calc(100vh - 235px)",
      width: "100%",
      flexGrow: 1,
      padding: "0px 1px",
      overflow: "auto",
      margin: "10px 0px",
    },
    paper: {
      width: "100%",
      marginBottom: theme.spacing(0),
    },
    table: {
      minWidth: 672,
    },
    visuallyHidden: {
      border: 0,
      clip: "rect(0 0 0 0)",
      height: 1,
      margin: 0,
      overflow: "hidden",
      padding: 0,
      position: "absolute",
      top: 20,
      width: 1,
    },
    sticky: {
      position: "sticky",
      right: "2%",
      background: "#F5F5F5",
    },
    stickyHeader: {
      position: "sticky",
      zIndex: 10,
      right: "2%",
      background: "#EEEEEE",
      fontSize: "12px",
      color: "##F5F5F5",
      fontWeight: 600,
    },
    cell: {
      fontSize: "12px",
      color: "#333333",
    },

    disable: {
      fontSize: "12px",
      color: "#33333380",
    },
    headecell: {
      fontSize: "12px",
      color: "#333333",
      fontWeight: 600,
    },
    cellicon: {
      fontSize: "16px",
      cursor: "pointer",
      color: "#B0B0B0",
    },
  })
);

type SortKeys = 'Id' | 'Number of panels' | 'Unique panels' | 'Cost' | 'pdf'

export default function BimAutomation(props: any) {
  // const { dispatch, state }: any = useContext(stateContext);
  const context: any = useContext(bimContext);
  const [designData, setDesignData] = useState<any>([]);
  const [sorteddesignData, setSortedDesignData] = useState<any>([]);
  // const [showLoading, setShowLoading] = useState<any>(false);
  const headerKeys = [
    "Id",
    "Number of panels",
    "Unique panels",
    "Material reduction",
    "Cost",
    "pdf",
    "csv",
  ];
  const headerkeysarray = [{title: 'ID', key: 'Id'},
  {title: 'Panel', key: 'Number of panels'},
  {title: 'Unique Panel', key: 'Unique panels'},
  {title: 'Reduction', key: 'Material reduction'},
  {title: 'Cost', key: 'Cost'},
  {title: 'Download', key: 'pdf'}]
  
  const { dispatch, state }: any = useContext(stateContext);
  const [selectedFilterData, setSelectedFilterData] = useState<any>([]);
  const componentJsonPath = "./docs/components.json";
  const [automationType, setAutomationType] = useState("1");
  const [frameOffSet, setframeOffSet] = useState("2");
  const [mullionThickness, setmullionThickness] = useState("0.75");
  const [allowTransforms, setAllowTransforms] = useState("true");
  const [checkAutomationType, setCheckAutomationType] = useState("");
  const [checkFrameOffSet, setCheckFrameOffSet] = useState("");
  const [checkMullionThickness, setcheckMullionThickness] = useState("");
  const [checkAllowTransforms, setCheckAllowTransforms] = useState("");
  const [checkSelectedValue, setCheckSelectedValue] = useState();
  const [totalCount, setTotalCount] = useState(0);
  const [elementList, setElementList] = useState<any>({});
  const classes = useStyles();
  const [dvaScriptList, setDVAScriptList] = useState<any>([]);
  const authContext: any = useContext(stateContext);
  const [projectDetails, setProjectDetails] = useState<any>();
  const pathMatch: match<Params> = useRouteMatch();
  const [activeTab, setActiveTab] = useState('material');
  const [convertUSDToGBP, setConvertUSDToGBP] = useState<number>(0.89);
  const [convertUSDToINR, setConvertUSDToINR] = useState<number>(82.60);
  const [materialReductionPercentage, setMaterialReductionPercentage] = useState<number>(100);
  const [radioValue, setRadioValue] = useState(false);
  const [disableGenerate, setDisableGenerate] = useState(false);
  const [disableExport, setDisableExport] = useState(false);
  const [sortKey, setSortKey] = useState<SortKeys>('Id'); 
  const [order, setOrder] = useState("ASC");
  const [filteredData, setFilteredData] = useState<any>([]);
  const [geoData, setGeoData] = useState<any>([]);
  const [selectedValue, setSelectedValue] = useState<number>(1);
  const defaultValues: any ={

    automationType:'',

    frameOffSet: '',
  
    mullionThickness: '',
  
  };
  const {

    control,

    setError,

    clearErrors,

    formState: { errors }

  } = useForm<any>({

    defaultValues

});


  const handleChangeAutomationtype = (e: any) => {    
    setAutomationType(e.target.value);
      if(automationType != checkAutomationType && checkAutomationType != "")
      {
        setDisableGenerate(true);
      }
      else
      {
        setDisableGenerate(false);
      }
    
  };

  const handleChangeFrameOffSet = (e: any) => {    
      setframeOffSet(e.target.value);
      if(frameOffSet != checkFrameOffSet.toString() && checkFrameOffSet.toString() != "")
      {
        setDisableGenerate(true);
      }
      else
      {
        setDisableGenerate(false);
      }
      
    };
  const handleChangeMullionThickness = (e: any) => {    
      setmullionThickness(e.target.value);
      if(mullionThickness != checkMullionThickness.toString() && checkMullionThickness.toString() != "")
      {
        setDisableGenerate(true);
      }
      else
      {
        setDisableGenerate(false);
      }
    };
  const handleAllowTransforms = (e: any) => {
    setAllowTransforms(e.target.value);
    if(allowTransforms != checkAllowTransforms.toString() && checkAllowTransforms.toString() != "")
    {
      setDisableGenerate(true);
    }
    else
    {
      setDisableGenerate(false);
    }
  };

  const handleChangeExportData = (e: any) => {
    setSelectedValue(e.target.value);
    if( (e.target.value != checkSelectedValue && checkSelectedValue != 0))
      {
        setDisableExport(false);
      }
      else
      {
        setDisableExport(true);
      }
  }

  const handleRadio = (value: boolean) => {
    setRadioValue(value);
  };

  useEffect(() => {
    (async () => {

      const selectedData = context.state.activeFilterList.find(
        (filter: any) => filter.id === props.selectedFilter
      );

      setSelectedFilterData(selectedData);

      const elementProperties = await fetchData(
        FETCH_SPATIAL_PROPS_ELEMENT_PROPS_BY_ID_LIST_MODEL_ID,
        { _in: selectedData.handleIds, modelId: context.state.activeModel }
      );

      const allowedCategories = ["Curtain Wall Mullions", "Curtain Panels", "OST_CurtainWallMullions", "OST_CurtainWallPanels"];

      const filteredElements = elementProperties.bimElementProperties
        .filter((item: any) => allowedCategories.includes(item.sourceProperties.Category));

      setFilteredData(filteredElements);

      const groupIds = filteredElements
        .map((element: any) => element.sourceProperties.Decomposes)
        .filter((item: string, i: number, ar: any) => ar.indexOf(item) === i);

      const min_x = filteredElements
        .map((element: any) => { 
          return element.bimSpatialProperties[0].minBoundingBox.coordinates[0]
        }).sort((a: number, b: number) => a - b)[0]
      const min_y = filteredElements
        .map((element: any) => { 
          return element.bimSpatialProperties[0].minBoundingBox.coordinates[1]
        }).sort((a: number, b: number) => a - b)[0]
  
      const bbs = groupIds.map((groupId: string) => {
        const groupedElements = filteredElements
          .filter(
            (element: any) => {
              return element.sourceProperties.Decomposes === groupId && element.bimSpatialProperties.length > 0;
            }
          )

        return groupedElements.map((element: any) => { 

          const min = [...element.bimSpatialProperties[0].minBoundingBox.coordinates]
          const max = [...element.bimSpatialProperties[0].maxBoundingBox.coordinates]

          min[0] -= min_x
          min[1] -= min_y
          max[0] -= min_x
          max[1] -= min_y

          return { 
            category: element.sourceProperties.Category, 
            min,
            max
          } 
        })
      });

      setGeoData({
        geo_data: bbs,
        scale: 12,
        min_x,
        min_y
      });
  
    })();

    return () => {
      // this now gets called when the component unmounts
    };
  }, []);

  const fetchData = async (query: any, variables: any) => {
    let responseData;
    try {
      responseData = await client.query({
        query: query,
        variables: variables,
        fetchPolicy: "network-only",
        context: {
          role: projectFeatureAllowedRoles.viewBimModel,
          token: state.selectedProjectToken,
        },
      });
    } catch (error: any) {
      console.log(error);
    } finally {
      return responseData?.data ? responseData.data : null;
    }
  };
  
  const sorting = (col:any) => {
    setSortKey(col);
    if(col == "Id")
    {
      if(order === 'ASC')
      {
        const sorted = [...designData].sort((a,b)=>
       parseInt(a[col]) > parseInt(b[col]) ? 1:-1
        );
        setDesignData(sorted);
        setOrder('DSC');
      }
      if(order === 'DSC')
      {
        const sorted = [...designData].sort((a,b)=>
        parseInt(a[col]) < parseInt(b[col]) ? 1:-1
        );
        setDesignData(sorted);
        setOrder('ASC');
      }
    }
    else
    {
      if(order === 'ASC')
      {
        const sorted = [...designData].sort((a,b)=>
        a[col] > b[col] ? 1:-1
        );
        setDesignData(sorted);
        setOrder('DSC');
      }
      if(order === 'DSC')
      {
        const sorted = [...designData].sort((a,b)=>
        a[col] < b[col] ? 1:-1
        );
        setDesignData(sorted);
        setOrder('ASC');
      }
    }
    
   
  }

  function checkPreviousSelected(data:any){
    //Need to change the Automation Type here below later after getting api
    setCheckAutomationType(automationType);
    setCheckFrameOffSet(data.frame_offset);
    setcheckMullionThickness(data.mullion_thickness);
    setCheckAllowTransforms(data.allow_transforms);
  }

  function checkPreviousExportSelected(data:any){
    setCheckSelectedValue(data)
  }

  async function run() {
    if (frameOffSet == ""||mullionThickness == "" || automationType == "")
    {
      if(automationType == ""){
        setError("automationType", {
        type: "required",
        message: "Please provide Automation Type",
      })
    }
      if(frameOffSet == ""){
           setError("frameOffSet", {
           type: "required",
           message: "Please provide frame OffSet",
        })
    }
      if(mullionThickness == ""){
        setError("mullionThickness", {
        type: "required",
        message: "Please provide Mullion Thickness",
      })
    }   
   }
  else{
    clearErrors("frameOffSet");
    clearErrors("mullionThickness");
    setDisableGenerate(true);    
    
   const scriptList = await getAllScriptInfo();
      const data = {
        automationType: parseInt(automationType),
        frame_offset: parseFloat(frameOffSet),
        mullion_thickness: parseFloat(mullionThickness),
        allow_transforms: allowTransforms === "true",
        file: geoData,
        file_format: ".json",
        script_id: scriptList["Curtain Wall"],
      };


      checkPreviousSelected(data);
      const dataVal = await GetKovaComputeAPI(data);
      
      const specVal: any = dataVal.reqData.output;
      
      if ( ["RH_OUT:metaData", "RH_OUT:pdf", "RH_OUT:csv"].every( key => key in specVal ) ) {
        const metaData = specVal["RH_OUT:metaData"].outputType;
        const pdfData = specVal["RH_OUT:pdf"].outputType;
        const csvData = specVal["RH_OUT:csv"].outputType;

        const indexes = Object.keys(metaData);
        const tempData = Object.keys(metaData).reduce(function (
          result: any,
          key: any,
          index
        ) {
          result.push({
            Id: indexes[index],
            'Number of panels': metaData[key]["num_panels"]["value"],
            'Unique panels': metaData[key]["num_panels_unique"]["value"],
            'Material reduction': metaData[key]["reduction"]["value"],
            'Cost': metaData[key]["total_cost"]["value"],
            pdf: pdfData[key],
            csv: csvData[key],
          });

          return result;
        },
        []);
      
        setDesignData(tempData);
      }
   }
  }

  async function exportRun() {
    setDisableExport(true);
     const scriptList = await getAllScriptInfo();
      const data = {
        automationType: parseInt(automationType),
        frame_offset: parseFloat(frameOffSet),
        mullion_thickness: parseFloat(mullionThickness),
        allow_transforms: allowTransforms === "true",
        file: geoData,
        file_format: ".json",
        script_id: scriptList["Curtain Wall"],
      };

     const dataVal = await GetKovaComputeAPI(data);     
     const specVal: any = dataVal.reqData.output;
     const exportKey = selectedValue;
     checkPreviousExportSelected(exportKey);

     const exportData = {
      projectId: state.currentProject.projectId,
      modelId: context.state.activeModel,
      materials: specVal["RH_OUT:metaData"].outputType[selectedValue].materials, 
      userInputId: specVal.userInputId,
      scriptId: scriptList["Curtain Wall"],
     }
     console.log(exportData)
     const token = getExchangeToken();
     
    try {
      dispatch(setIsLoading(true));
      const response = await axios.post(
        `${process.env["REACT_APP_DVASCRIPT_URL"]}material/addMaterialElement`,
        exportData,        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      dispatch(setIsLoading(false));
      const data = response.data;
      Notification.sendNotification('Data Added Successfully', AlertTypes.success);
      return data;
    } catch (error: any) {
      Notification.sendNotification('Some error occured while calling the api', AlertTypes.error);
      dispatch(setIsLoading(false));
      throw new Error(error);
    }
     return exportData;
     
  }

  async function getAllScriptInfo(){
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
      return data;
    } catch (error: any) {
      dispatch(setIsLoading(false))
      throw new Error(error);
    }
  }

  async function GetKovaComputeAPI(argBody: any) {
    const token = getExchangeToken();
    try {
      dispatch(setIsLoading(true));
      const response = await axios.post(
        `${process.env["REACT_APP_DVASCRIPT_URL"]}script/compute-api`,
        argBody,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      dispatch(setIsLoading(false));
      const data = response.data;
      return data;
    } catch (error: any) {
      dispatch(setIsLoading(false));
      throw new Error(error);
    }
  }
  
  useEffect(() => {
      fetchProjectDetail();
  }, [authContext?.state?.selectedProjectToken]);

  const fetchProjectDetail = async () => {
    try {
      authContext.dispatch(setIsLoading(true));
      const role = 'viewMyProjects';
      const projectsResponse = await client.query({
        query: FETCH_PROJECT_BY_ID,
        variables: {
          id: Number(pathMatch?.params?.id),
          userId: decodeExchangeToken().userId,
        },
        fetchPolicy: 'network-only',
        context: { role },
      });

      if (projectsResponse.data.project.length > 0) {
        projectsResponse.data.project?.forEach((project: any) => {
          if(project.name == state.currentProject.projectName)
          {
          let address = '';
          let countryCode = '';
          if (project?.addresses.length > 0) {
            address = `${project?.addresses[0]?.fullAddress}`;
            countryCode = project.addresses[0]?.countryShortCode;
          }

          const newItem = {
            name: project.name,
            status: project.status,
            id: project.id,
            address,
            type: project.config.type,
            stage: project.config.stage,
            projectCode: project.config.projectCode,
            currency:
              project.metrics.currency == '' ? 'GBP' : project.metrics.currency,
            countryCode: countryCode,
          };
          setProjectDetails(newItem);
        }
        });
      }
      authContext.dispatch(setIsLoading(false));
    } catch (error) {
      console.log(error);
      authContext.dispatch(setIsLoading(false));
    }
  };

  return (
    <DraggableComponent styles={draggableStyle}>
      <div className="bimAutomation">
        <div className="title">
          <div className="title-name">Generate Design Data</div>
          <Tooltip title={"Close"} aria-label={"Close to Properties"}>          
            <Close
              onClick={() => props.onClose()}
              fontSize="small"
              className="bimCloseButton-gdd"
            />
          </Tooltip>
          </div>
        <div className="content" id="bimAutomation">
          <div className="left-panel">
          <div className="left-panel-items">
            <label className="label-automation-type">
              Automation type
              <select className="dropdown-automation-type" onChange={handleChangeAutomationtype}>                  
                  <option key={"Grasshopper"} value={"1"}>
                      Grasshopper
                  </option>
                  <option key={"Python"} value={"2"}>
                      Python
                  </option>
                </select>
                </label>
            </div>
            <div className="left-panel-items">
            <label className="label-frame-offset">
              Frame offset
              <select className="dropdown-frame-offset-type" onChange={handleChangeFrameOffSet}>                  
                  <option key={"2"} value={2}>
                      2
                  </option>
                  <option key={"3"} value={3}>
                      3
                  </option>
                </select>
                </label>
            </div>
            <div className="left-panel-items">
            <label className="label-mullion-thickness">
              Mullion thickness
              <select className="dropdown-mullion-thickness" onChange={handleChangeMullionThickness}>                  
                  <option key={"0.75"} value={0.75}>
                      0.75
                  </option>
                  <option key={"2.5"} value={2.5}>
                      2.5
                  </option>
                </select>
                </label>
            </div>
            <div className="left-panel-items" >
              <div className="left-panel-items-allow-transform" >
                <label className="label-allow-transform" >
                  Allow transoms

                  <div className="radio-allowtransforms">
                  <RadioGroup  row value={allowTransforms} onChange={handleAllowTransforms} >
                            <FormControlLabel className="radioLabel" value="true" control={<Radio  size={"small"} color="default"    className="radiobutton"/>} label="True" />
                            <FormControlLabel className="radioLabel" value="false" control={<Radio size={"small"} color="default"  className="radiobutton"/>} label="False" />
                  </RadioGroup>
                  </div>
                  </label> 
              </div>           
            </div>
            <div className="horizontal-line" ></div>
            <div className="left-panel-items" >
            <label className="label-selectquery">{"Selected query: "}</label>
            <span className="span-selectquery">{selectedFilterData.title}</span>            
            </div>            
            <div className="left-panel-items" >
              <label className="label-totalelementslist" >{"Filtered elements: "}</label>
            <span className="span-totalelementslist" >{filteredData.length}</span>
            </div>
            <div className="left-panel-items" >
            <Button
              className="project-primary-button"
              size={"small"}
              onClick={() => run()}
              disabled={disableGenerate}
            >
              Generate
            </Button>
            </div>
          </div>
          <div className="vertical-line" ></div>
          <div className="right-panel">
            <div className="right-panel-table">
            {designData.length > 0 ? (
              <div>
                <div>
              <Table 
                style={{tableLayout:"fixed", width:"100%"}}
                stickyHeader
              >
                <TableBody>
                  <TableRow className="designdata-table-header-row" >
                    {Object.keys(headerkeysarray).map((key:any, index) => {
                      return (
                        <TableCell className="Designdata-table-header-cell"  key={key} >
                          {headerkeysarray[key].title} 
                          {headerkeysarray[key].title !== "Download" && <button onClick={()=> sorting(headerkeysarray[key].key)} className={`${headerkeysarray[key].key === sortKey && order === 'DSC'? 'sort-button sort-reverse':'sort-button'}`}>▼</button>}                         
                        </TableCell>
                      );
                    })}
                  
                  </TableRow>
                  {designData.map((design: any, index: number) => {
                    return (
                      <TableRow key={index} className="designdata-table-body-row">
                        {headerKeys
                          .slice(0, headerKeys.length - 2)
                          .map((key) => {
                            return (
                              <TableCell className="designdata-table-body-cell" key={key} >
                                <span>
                                  {key == "Id" && <div>
                                  <Radio
                                    checked={selectedValue == design[key]}
                                    onChange={handleChangeExportData}
                                    value={design[key]}
                                    style={{color:"#105C6B"}}
                                    name="radio-button-demo"
                                    inputProps={{ 'aria-label': 'ExportingData' }}
                                  />
                                  {design[key]}
                                  </div>

                                  }
                                  {key == 'Material reduction'&& <div>
                                    {(parseFloat(design[key]) * materialReductionPercentage).toFixed(2)}{"%"}
                                    </div>
                                    }
                                  {key == 'Cost'&& (projectDetails.name == state.currentProject.projectName && projectDetails && projectDetails?.currency == 'USD' ? (
                                    <div>
                                    {(parseFloat(design[key].toString().replace(',','')).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }))}
                                    {/* {<CurrencyConverter from={'INR'} to={'USD'} value={design[key]}/>} */}
                                    </div>
                                    )
                                   : projectDetails?.currency == 'GBP' ? (
                                    <div>
                                    {(parseFloat(design[key].toString().replace(',',''))*convertUSDToGBP).toLocaleString('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })}
                                    </div>
                                  ) : projectDetails?.currency == 'INR' ? (
                                    <div>
                                    {(parseFloat(design[key].toString().replace(',',''))*convertUSDToINR).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                                    </div>
                                  ) : (
                                    ''
                                  ))}
                                </span>
                                {key != 'Id' && key != 'Cost' && key != 'Material reduction' && design[key]}
                              </TableCell>
                            );
                          })}
                          <TableCell className="designdata-table-body-cell-download" >
                            {
                              checkAutomationType == "2"? 
                              <a href={design.pdf} target="_blank">
                            <img className="ifc-download-img"
                            src={ifcdownload}
                              />
                          </a>
                              :
                              <a href={design.pdf} target="_blank">
                            <img className="pdf-download-img"
                            src={pdfdownload}
                              />
                          </a>
                            }
                          <a href={design.csv} target="_blank">
                            <img className="csv-download-img"
                            src={csvdownload}
                            />
                          </a>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              </div>
              <div className="footer-export">
              <Button 
              className="export-primary-button"
              size={"small"}
              onClick={() => exportRun()}
              disabled={disableExport}
              >
                Export
              </Button>
              </div>
              </div>
            ) : (
              <div className="design-data-msg" >
              Click on Generate to populate Design Data
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </DraggableComponent>
  );
}
