import React, { useContext, useState, useEffect } from "react";
import "./BimUploadList.scss";
import { stateContext } from "../../../../root/context/authentication/authContext";
import { bimContext } from "../../../contextAPI/bimContext";
import BimTable from "../BimTable/BimTable";
import { projectFeatureAllowedRoles} from "../../../../../utils/role";
import { client } from "../../../../../services/graphql";
import {
  FETCH_ALL_BIM_MODEL_STATUS,
  CANCEL_BIM_MODEL,
  DELETE_BIM_ELEMENT_PROP,
  CHECK_IS_PART_OF_ASSEMBLY,
  CREATE_ASSEMBLY,
  FETCH_ASSEMBLY_COUNTS,
  FETCH_PROJECT_LOCATION_TREE
} from "../../../graphql/bimUpload";
import { match, useHistory, useRouteMatch } from "react-router-dom";
import { setActiveModel } from "../../../contextAPI/action";
import ConfirmDialog from "../../../../shared/components/ConfirmDialog/ConfirmDialog";
import Notification, {
  AlertTypes,
} from "../../../../shared/components/Toaster/Toaster";
import Button from "@material-ui/core/Button";
import CloudUploadOutlinedIcon from "@material-ui/icons/CloudUploadOutlined";
import { setIsLoading } from "../../../../root/context/authentication/action";
import DragDrop from "../DragDrop/DragDrop";
import BimHeader from "../BimHeader/BimHeader";
import TablePagination from "../../../../shared/components/TablePagination/TablePagination";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { Tooltip } from "@material-ui/core";
import { useQuery } from "src/modules/authentication/utils";

export interface Params {
  projectId: string;
}

interface message {
  header: string;
  text: string;
  cancel: string;
  proceed: string;
}

const confirmDeleteMessage: message = {
  header: "Alert​",
  text: `Are You Sure? This action will delete the BIM Dataset`,
  cancel: "No",
  proceed: "Yes",
};

const confirmCancelMessage: message = {
  header: "Alert​",
  text: `Are You Sure? This action will terminate the process of converting the uploaded file to a Slate BIM dataset`,
  cancel: "No",
  proceed: "Yes",
};
let isUploading = false;
let uploadModelId: any = null;
let statuCheckInterval: any = null;
let lstAssmbly = true;
let lstModls = true;
let pgn = 1;

export default function BimUploadLanding(props: any) {
  const { dispatch, state }: any = useContext(stateContext);
  const context: any = useContext(bimContext);
  const isOpenUpload: any = useQuery().get("upload");
  const pathMatch: match<Params> = useRouteMatch();
  const history = useHistory();
  const limit = 8;
  const [allModelsList, setAllModelsList] = useState<any>([]);
  const [openDeleteModel, setOpenDeleteModel] = useState(false);
  const [openCancelModel, setOpenCancelModel] = useState(false);
  const [openUploadBox, setOpenUploadBox] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");
  const [isUploadDisabled, setIsUploadDisabled] = useState(false);
  const [isIntialized, setIsIntialized] = useState(false);
  const [progress, setProgress] = useState(0);
  const [asmblyModelsList, setAsmblyModelsList] = useState<any>([]);
  const [isAssemblyExist, setIsAssemblyExist] = useState(false);
  const [assemblyInfo, setAssemblyInfo] = useState<any>({});
  const [selectedAll, setSelectedAll] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [totalRecords, setTotalRecords] = useState(-1);
  const [listModels, setListModels] = useState(true);
  const [listAssembly, setListAssembly] = useState(true);
  const [isLocationTreeNotSynced, setLocationTreeNotSynced] = useState(false)
  useEffect(() => {
    isOpenUpload && openUploadScreen();
  }, []);

  useEffect(()=>{
     fetchProjectLocationTree()
  },[])


  const fetchProjectLocationTree = async()=>{
   const {projectLocationTree} = await fetchData(FETCH_PROJECT_LOCATION_TREE,{},)
   if(projectLocationTree && projectLocationTree.length==1){
    projectLocationTree.length==1 && setLocationTreeNotSynced(true)
   }
   
  }


  useEffect(() => {
    if (
      state.selectedProjectToken &&
      state?.projectFeaturePermissons?.canviewBimModel
    ) {
      fetchAllBimModels();
      statuCheckInterval = setInterval(fetchAllBimModels, 10000);
    }
    return () => {
      clearInterval(statuCheckInterval);
      isUploading = false;
      lstAssmbly = true;
      lstModls = true;
      pgn = 1;
    };
  }, [state.selectedProjectToken, pathMatch.params.projectId]);

  useEffect(() => {
    pgn = pageNo;
    state.selectedProjectToken &&
      state?.projectFeaturePermissons?.canviewBimModel &&
      onPageChange();
  }, [pageNo]);

  useEffect(() => {
    pageNo > 1
      ? setPageNo(1)
      : state.selectedProjectToken &&
        state?.projectFeaturePermissons?.canviewBimModel &&
        onPageChange();
  }, [listAssembly, listModels]);

  const fetchAllBimModels = async () => {
    const allModels = await fetchData(FETCH_ALL_BIM_MODEL_STATUS, {});
    let isDisabled = false;
    let isAsblyExist = false;
    let totalModels = 0;
    const filteredModel = allModels.bimModel.filter((model: any) => {
      if (uploadModelId == model.id && model.bimModelStatuses[0]) {
        isUploading = false;
        uploadModelId = null;
      }

      if (isUploading || (!model.isDeleted && !model.bimModelStatuses[0])) {
        isDisabled = true;
      }

      if (!model.isDeleted && model.bimModelStatuses[0]?.isAssembly) {
        isAsblyExist = true;
        fetchAssemblyInfo(model.bimModelStatuses[0]?.sourceModelIds);
      }

      //inprogress
      if (
        model.bimModelStatuses[0] &&
        ![
          "DATA_PROCESSING_FAILED",
          "MODEL_PROCESSING_FAILED",
          "COMPLETED",
          "DELETED",
          "ABORTED",
        ].includes(model.bimModelStatuses[0]?.status)
      ) {
        isDisabled = true;
      }

      //deleteing
      if (
        model.isDeleted &&
        (model.bimElementProperties_aggregate?.aggregate?.categoryCount > 0 ||
          model.bimElementProperties_aggregate?.aggregate?.elementCount > 0)
      ) {
        isDisabled = true;
        totalModels++;
        return model;
      }

      if (
        !model.isDeleted &&
        ((lstModls && !model.bimModelStatuses[0]?.isAssembly) ||
          (lstAssmbly && model.bimModelStatuses[0]?.isAssembly))
      ) {
        totalModels++;
        return model;
      }
    });
    setIsIntialized(true);
    setTotalRecords(totalModels);
    isDisabled ? setIsUploadDisabled(true) : setIsUploadDisabled(false);
    isAsblyExist ? setIsAssemblyExist(true) : setIsAssemblyExist(false);
    setAllModelsList(filteredModel.slice((pgn - 1) * limit, pgn * limit));
  };

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

  const graphqlMutation = async (query: any, variable: any, role: any) => {
    let responseData;
    try {
      responseData = await client.mutate({
        mutation: query,
        variables: variable,
        context: { role: role, token: state.selectedProjectToken },
      });
      return responseData.data;
    } catch (error: any) {
      console.log(error.message);
      Notification.sendNotification(
        "Some error occured on update Model",
        AlertTypes.error
      );
    } finally {
      return responseData?.data ? responseData.data : null;
    }
  };

  const closeUploadScreen = async () => {
    dispatch(setIsLoading(true));
    await fetchAllBimModels();
    statuCheckInterval = setInterval(fetchAllBimModels, 10000);
    dispatch(setIsLoading(false));
    setOpenUploadBox(false);
  };

  const openUploadScreen = () => {
    clearInterval(statuCheckInterval);
    setOpenUploadBox(true);
  };

  const openModel = (modelId: string, edges: boolean) => {
    context.dispatch(setActiveModel(modelId));
    history.push(
      `/bim/${pathMatch.params.projectId}/view/${modelId}?edges=${
        edges ? "true" : "false"
      }`
    );
  };

  const showDeleteModelPopup = (modelId: string) => {
    setOpenDeleteModel(true);
    setSelectedModel(modelId);
  };

  const showCancelModelPopup = (modelId: string) => {
    setOpenCancelModel(true);
    setSelectedModel(modelId);
  };

  const deleteBimModel = async (cancel = false) => {
    dispatch(setIsLoading(true));
    setOpenDeleteModel(false);
    setOpenCancelModel(false);

    const isModelPartOfAssembly = await fetchData(CHECK_IS_PART_OF_ASSEMBLY, {
      _modelId: selectedModel,
    });
    if (
      !isModelPartOfAssembly.bimModelStatus ||
      isModelPartOfAssembly.bimModelStatus.length > 0
    ) {
      Notification.sendNotification(
        "Unable to delete this model. Some assemblies are created from this model.",
        AlertTypes.error
      );
      dispatch(setIsLoading(false));
      return false;
    }

    if (cancel) {
      if (uploadModelId == selectedModel) {
        isUploading = false;
      }
      await graphqlMutation(
        CANCEL_BIM_MODEL,
        {
          modelId: selectedModel,
        },
        projectFeatureAllowedRoles.updateBimModel
      );
    }
    await graphqlMutation(
      DELETE_BIM_ELEMENT_PROP,
      {
        _eq: selectedModel,
      },
      projectFeatureAllowedRoles.createBimModel
    );
    await fetchAllBimModels();
    dispatch(setIsLoading(false));
  };

  const changeAssemblyModels = (isIncluded: boolean, modelId: string) => {
    if (isIncluded) {
      const newList = [...asmblyModelsList, modelId];
      setAsmblyModelsList(newList);
      if (!selectedAll) {
        const count = allModelsList.filter(
          (file: any) =>
            !file.isDeleted &&
            !file.bimModelStatuses[0]?.isAssembly &&
            file.bimModelStatuses[0]?.status === "COMPLETED"
        ).length;
        count === newList.length && setSelectedAll(true);
      }
    } else {
      setAsmblyModelsList(
        asmblyModelsList.filter((item: string) => item !== modelId)
      );
      selectedAll && setSelectedAll(false);
    }
  };

  const selectAllModel = (isIncluded: boolean) => {
    if (isIncluded) {
      const selectedModels = allModelsList.reduce(
        (sltdMdls: any, file: any) => {
          if (
            !file.isDeleted &&
            !file.bimModelStatuses[0]?.isAssembly &&
            file.bimModelStatuses[0]?.status === "COMPLETED"
          )
            sltdMdls.push(file.id);
          return sltdMdls;
        },
        []
      );
      setAsmblyModelsList(selectedModels);
    } else {
      setAsmblyModelsList([]);
    }
    setSelectedAll(isIncluded);
  };

  const onAssemblyCreate = async () => {
    try {
      dispatch(setIsLoading(true));
      await graphqlMutation(
        CREATE_ASSEMBLY,
        {
          modelIds: asmblyModelsList,
          assemblyName: state?.currentProject?.projectName + ".asm",
        },
        projectFeatureAllowedRoles.createBimModel
      );
      setAsmblyModelsList([]);
      await fetchAllBimModels();
      dispatch(setIsLoading(false));
    } catch (error: any) {
      Notification.sendNotification(
        "Some error occured on create assembly",
        AlertTypes.error
      );
      dispatch(setIsLoading(false));
    }
  };

  const fetchAssemblyInfo = async (modelIds: any) => {
    try {
      const assemblyInfo = await fetchData(FETCH_ASSEMBLY_COUNTS, {
        modelIds: modelIds,
      });
      setAssemblyInfo({
        ...assemblyInfo.bimElementProperties_aggregate.aggregate,
        sourceModelIds: modelIds,
      });
    } catch (error: any) {
      Notification.sendNotification(
        "Unable to fetch assembly info",
        AlertTypes.error
      );
    }
  };

  const onPageChange = async () => {
    try {
      dispatch(setIsLoading(true));
      await fetchAllBimModels();
      dispatch(setIsLoading(false));
    } catch (error: any) {
      dispatch(setIsLoading(false));
      Notification.sendNotification(
        "Unable to fetch Model info",
        AlertTypes.error
      );
    }
  };

  const goBack = () => {
    history.goBack();
  };

  return (
    <div className={"bimUploadList"}>
      {!isIntialized ? (
        <div className="full-Width-info">
          <BimHeader name="Models" description={"Please wait..."} />
        </div>
      ) : state.projectFeaturePermissons &&
        !state.projectFeaturePermissons?.canviewBimModel ? (
        <BimHeader
          name="Models"
          description={"You don't have permission to view the BIM model"}
        />
      ) : (
        <>
          <div className="header-section">
            <div className={`titleIcon`}>
              <ArrowBackIosIcon
                onClick={goBack}
                viewBox={"-4 0 24 24"}
                fontSize={"default"}
                className="menuButton"
              />
              <div className={`modelTitle`}>Models</div>
            </div>
            <div className={`buttons-section`}>
              {state.projectFeaturePermissons?.cancreateBimModel && (
                <>
                  <Button
                    disabled={isUploadDisabled || asmblyModelsList.length > 0}
                    variant="outlined"
                    className="btn-secondary upload-button "
                    startIcon={<CloudUploadOutlinedIcon />}
                    onClick={openUploadScreen}
                  >
                    Upload
                  </Button>
                  {!isAssemblyExist && (
                    <Tooltip title="Assembly creation used to combine multiple model's and render it in single view to perform downstream operation.">
                      <span>
                        <Button
                          disabled={
                            isUploadDisabled || asmblyModelsList.length < 2
                          }
                          variant="outlined"
                          className="btn-primary createAssmbly"
                          onClick={() => onAssemblyCreate()}
                        >
                          Create Assembly
                        </Button>
                      </span>
                    </Tooltip>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="filterSection">
            <FormControlLabel
              className={"checkbox-label"}
              control={
                <Checkbox
                  className={"checkbox"}
                  checked={listAssembly}
                  onChange={() => {
                    lstAssmbly = !listAssembly;
                    setListAssembly(!listAssembly);
                  }}
                  size={"small"}
                  name="assembly"
                />
              }
              label="Assembly"
            />
            <FormControlLabel
              className={"checkbox-label"}
              control={
                <Checkbox
                  className={"checkbox"}
                  checked={listModels}
                  onChange={() => {
                    lstModls = !listModels;
                    setListModels(!listModels);
                  }}
                  size={"small"}
                  name="models"
                />
              }
              label="Models"
            />
          </div>
          <BimTable
            modelList={allModelsList}
            uploadModelId={uploadModelId}
            newUpload={isUploading}
            openModel={openModel}
            onDeleteModel={showDeleteModelPopup}
            onCancelModel={showCancelModelPopup}
            isDisableOpr={isUploadDisabled}
            uploadProgress={progress}
            changeAssemblyModels={changeAssemblyModels}
            selectedAll={selectedAll}
            selectAllModel={selectAllModel}
            assemblyModelsList={asmblyModelsList}
            isAssemblyExist={isAssemblyExist}
            assemblyInfo={assemblyInfo}
          />
          {!state.projectFeaturePermissons?.cancreateBimModel &&
            allModelsList.length === 0 && (
              <div className="info">
                You don't have permission to create the BIM model
              </div>
            )}
          {allModelsList.length > 0 && (
            <TablePagination
              count={totalRecords > 0 ? Math.ceil(totalRecords / limit) : 0}
              page={pageNo}
              onChange={(e: any, page: number) => setPageNo(page)}
            />
          )}
        </>
      )}
      {openUploadBox && (
        <DragDrop isFirstModel={false} onClose={closeUploadScreen} isLocationTreeNotSynced={isLocationTreeNotSynced} />
      )}
      <ConfirmDialog
        open={openDeleteModel}
        message={confirmDeleteMessage}
        close={() => setOpenDeleteModel(false)}
        proceed={deleteBimModel}
        styleName={"bimUploadDialog"}
      />
      <ConfirmDialog
        open={openCancelModel}
        message={confirmCancelMessage}
        close={() => setOpenCancelModel(false)}
        proceed={() => deleteBimModel(true)}
        styleName={"bimUploadDialog"}
      />
    </div>
  );
}
