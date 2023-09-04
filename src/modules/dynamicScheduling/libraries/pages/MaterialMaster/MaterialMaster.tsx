import React, { useEffect, createContext, ReactElement, useContext, useState } from 'react';
import { useDebounce } from '../../../../../customhooks/useDebounce';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { setIsLoading } from "../../../../root/context/authentication/action";
import NoDataMessage from '../../../../shared/components/NoDataMessage/NoDataMessage';
import MaterialMasterAction from '../../components/MaterialMasterAction/MaterialMasterAction';
import MaterialMasterTable from '../../components/MaterialMasterTable/MaterialMasterTable';


import './MaterialMaster.scss';
import {
  CREATE_MATERIAL_MASTER,
  SEARCH_MATERIAL_MASTER_ILIKE_NAME,
  UPDATE_MATERIAL_MASTER,
  DELETE_MATERIAL_MASTER,
  GET_MATERIAL_TYPE_QUERY,
} from '../../grqphql/queries/material';
import { client } from "../../../../../services/graphql";
import { MasterMaterialRoles } from "../../../../../utils/role";
import { MaterialListItem } from "../../grqphql/models/material";
import Notification, { AlertTypes } from "../../../../shared/components/Toaster/Toaster";

import CreateMasterMaterial from '../../components/CreateMasterMaterial/CreateMasterMaterial';
import { decodeExchangeToken } from 'src/services/authservice';
import MaterialMasterHeader from '../../components/MaterialMasterHeader/MaterialMasterHeader';
import ConfirmDialog from 'src/modules/shared/components/ConfirmDialog/ConfirmDialog';
import axios from "axios";
import {
  getExchangeToken,
} from "../../../../../services/authservice";
import { AnyMessageParams } from 'yup/lib/types';
import { FETCH_PROJECT_BY_ID } from 'src/graphhql/queries/projects';

interface librarayHeader {
  name: string;
}
interface iactionData {
  actionType: string,
  materialData: null
}

const noDataMessage = 'No materials were found';
const noPermissionMessage = "You don't have permission to view material master";

export const MaterialContext = createContext<Array<MaterialListItem>>([]);


export default function MasterMaterials(): ReactElement {

  type nameBtn = {
    name: string,
    submit: string
  }

  const btnName: nameBtn = {
    name: '',
    submit: 'Update Material'
  }

  const headerInfo: librarayHeader = {
    name: 'Material Master ',
  };

  const globalContext: any = useContext(stateContext);
  const [viewType, setViewType] = useState('gallery');
  const [materialData, setMaterialData] = useState<Array<MaterialListItem>>([]);
  const [materialsFound, setMaterialsFound] = useState(true);
  const [searchText, setsearchText] = useState('');
  const [idToDelete, setIdToDelete] = useState(0);
  const debounceName = useDebounce(searchText, 1000);

  const [dialogEditMaterialOpen, setdialogEditMaterialOpen] = useState(false);
  const [loadingMaterial, setLoadingMaterial] = useState(true);
  const [deleteMaterialMasterID, setdeleteMaterialMasterID] = useState<any>('');
  const [editedColumn, setEditedColumn] = useState<any>([]);
  const [materialTypeCategory,setMaterialTypeCategory] = useState<any>([]);
  const [actionData, setActionData] = useState<iactionData>({
    actionType: 'create',
    materialData: null
  });

  const [confirmErrorMessage, setConfirmErrorMessage] = useState<any>({
    open: false,
    text: '',
    cancel: 'Cancel',
    proceed: 'Proceed',
  }); 

  const [confirmDeleteMessage, setConfirmDeleteMessage] = useState(false);
  const [warningUpdateMessage, setWarningUpdateMessage] = useState<any>({
    open: false,
    text: '',
    cancel: 'Cancel',
    proceed: 'Okay',
  });

  useEffect(() => {
    if(decodeExchangeToken().allowedRoles.includes("viewTenantMaterialMaster")) {
      getMasterMaterialList();
      getMaterialType(); 
    }
  }, []);

  useEffect(() => {
    if(decodeExchangeToken().allowedRoles.includes("viewTenantMaterialMaster")) {
      refreshList();
    }
  }, [debounceName])


  const editMasterMaterialDAO = async (idParam: any,
    materialId: any,
    materialName: any,
    materialGroup: any,
    category: any,
    materialType: any,
    supplier: any,
    unit: any,
    materialCategory: number) => {
    try {
      globalContext.dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: UPDATE_MATERIAL_MASTER,
        variables: {
          idParam,
          materialId,
          materialName,
          materialGroup,
          category,
          materialType,
          supplier,
          unit,
          carbonCategoryId: materialCategory
        },
        context: { role: MasterMaterialRoles.update },
      });
      globalContext.dispatch(setIsLoading(false));
      refreshList(true);
     // Notification.sendNotification('Master Material updated successfully', AlertTypes.success);

    } catch (error: any) {
      globalContext.dispatch(setIsLoading(false));
      if(error?.message.indexOf("duplicate") > -1) { 
        Notification.sendNotification('Material ID should be unique', AlertTypes.warn);
        refreshList();
      } else {
        Notification.sendNotification('Please provide the mandatory fields', AlertTypes.warn);
      }
      
    }
  }

  const createMasterMaterial = async (
    materialId: string,
    materialName: string,
    materialType: string,
    unit: string,
    materialCategory: number,
    suppliers: string,
    category: string
  ) => {
    try {
      globalContext.dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: CREATE_MATERIAL_MASTER,
        variables: {
          materialId: materialId.trim(),
          materialName: materialName.trim(),
          materialType: materialType.trim(),
          materialUnit: unit.trim(),
          materialCategory: materialCategory,
          supplier: suppliers.trim(),
          category: category,
        },
        context: { role: MasterMaterialRoles.create },
      });
      refreshList();
      globalContext.dispatch(setIsLoading(false));
      Notification.sendNotification('Master Material created successfully', AlertTypes.success);

    } catch (error) {
      globalContext.dispatch(setIsLoading(false));
      Notification.sendNotification('Could not create new material', AlertTypes.warn);
    }
  }

  const deleteMasterMaterial = async () => {
    try {
      setConfirmDeleteMessage(false);
      globalContext.dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: DELETE_MATERIAL_MASTER,
        variables: {
          idParam: deleteMaterialMasterID
        },
        context: { role: MasterMaterialRoles.delete },
      });
      globalContext.dispatch(setIsLoading(false));
      Notification.sendNotification('Master Material deleted successfully', AlertTypes.success);

      refreshList();

    } catch (error) {
      globalContext.dispatch(setIsLoading(false));
      //   Notification.sendNotification('Could not  material', AlertTypes.warn);
      // setConfirmDeleteMessage(true);
    }
  }
  // this is a common callback function used by both the list view and grid view components.
  // the method accepts filterPayload as input which is a json containing user preference.
  // The methos returnd a list of recipes satisfying users filter criteria.
  const getMasterMaterialList = async (updated?: boolean) => {
    // console.log('search start');
    try {
      setMaterialsFound(false);
      globalContext.dispatch(setIsLoading(true));
      setLoadingMaterial(true);

      const response = await client.query({
        query: SEARCH_MATERIAL_MASTER_ILIKE_NAME,
        variables: {
          materialSearchName: `%${debounceName}%`,
        },
        fetchPolicy: 'network-only', context: { role: MasterMaterialRoles.read }
      });

      const materialList: Array<MaterialListItem> = [];
      // console.log('search start1');

      response.data.materialMaster.forEach((item: any) => {
        setMaterialsFound(true);
        const suppliersSelectedArray = (item.supplier ? item.supplier : '').split(',');
        const newMasterMaterial: MaterialListItem = {
          category: item.category,
          customColumns: null,
          id: item.id,
          materialGroup: item.materialGroup,
          materialId: item.externalMaterialId,
          materialName: item.materialName,
          materialType: item.materialType,
          supplier: suppliersSelectedArray.filter((a: any) => a != ""),
          unit: item.unit,
          quantityRequired: 0,
          quantityAvailable: 0,
          quantityAllocated: 0,
          quantityConsumed: 0,
          color: 'white',
          carbonCategory: item.carbonCategory
        }
        materialList.push(newMasterMaterial);
      });
     
      const token = getExchangeToken();
      let materialQuantities: any;

      await axios.get(
        `${process.env["REACT_APP_SCHEDULER_URL"]}V1/materialQuantity/tenant`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      ).then((response: any) => {
        materialQuantities = response.data.materials
      }).catch(err => {
        globalContext.dispatch(setIsLoading(false));
        console.log(err);
      });

      for (let i = 0; i < materialList.length; i++) {
        const quantityData = materialQuantities.findIndex((ele: any) => ele.materialId == materialList[i].materialId);
        if (quantityData > -1) {
          materialList[i].quantityRequired = materialQuantities[quantityData].quantityRequired;
          materialList[i].quantityAvailable = materialQuantities[quantityData].quantityAvailable;
          materialList[i].quantityAllocated = materialQuantities[quantityData].quantityAllocated;
          materialList[i].quantityConsumed = materialQuantities[quantityData].quantityConsumed;
          //check if the number is even
          if (i % 2 == 0) {
            materialList[i].color = 'white'
          }
          // if the number is odd
          else {
            materialList[i].color = 'grey'
          }
        }
      }

      setMaterialData(materialList);
      setLoadingMaterial(false);
      if(updated) {
        Notification.sendNotification('Master Material updated successfully', AlertTypes.success);
      }
      
      globalContext.dispatch(setIsLoading(false));
    } catch (error: any) {
      globalContext.dispatch(setIsLoading(false));
      setLoadingMaterial(false);
    }
  }
  const getMaterialType = async () => {
    try {
      globalContext.dispatch(setIsLoading(true));
      const response: any = await client.query({
        query: GET_MATERIAL_TYPE_QUERY,
        variables: {
          "name": "Material Type"
        },
        fetchPolicy: 'network-only',
        context: {role: MasterMaterialRoles.read },
      });
      const materialTypeList: Array<any> = [];
      response.data.configurationLists[0].configurationValues.forEach((materialType: any) => {
        const materialTypeValue =
          { 'label': materialType.nodeName, 'value': materialType.nodeName }
        materialTypeList.push(materialTypeValue);
      });
      
      setMaterialTypeCategory(materialTypeList)
       
      globalContext.dispatch(setIsLoading(false));

    } catch (error: any) {
      console.log('error:', error)
      globalContext.dispatch(setIsLoading(false));
    }
  };
  const searchMasterMaterialByName = (value: string) => {
    setsearchText(value)
  }

  const refreshList = (updated?: boolean) => {
    getMasterMaterialList(updated);
  }

  const callDeleteMasterMaterial = (id: number) => {
    if (id) {
      try {
        const found = materialData.find(el => el.id === id);
        if (found) {
          if (found.quantityRequired < 1) {
            setdeleteMaterialMasterID(id);
            setConfirmErrorMessage({
              open: true,
              header: 'Are you sure?',
              text: "You are about to delete this material from the library. Are you sure you want to delete ?",
              cancel: "Cancel",
              proceed: 'Proceed',
            });
          } else {
            setConfirmDeleteMessage(true);
          }
        }
      } catch (error) {
        console.log('error deleting material:', idToDelete);
      }
    }
  };

  const deleteMaterialMaster = (id: number) => {
    try {
      setConfirmErrorMessage({
        open: false,
        text: '',
        header: '',
        cancel: "Cancel",
        proceed: 'Proceed',
      });

      deleteMasterMaterial();

    } catch (error) {
      console.log('error deleting material:', idToDelete);
    }

  }

  const showEditMaterialMasterTableRow = (rowParam: any) => {
    setdialogEditMaterialOpen(true);
    setActionData({
      actionType: 'edit',
      materialData: rowParam
    });
  };

  const closeEditMaterialDialog = () => {
    setdialogEditMaterialOpen(false);
    setActionData({
      actionType: 'edit',
      materialData: null
    });
  };

  const editMasterMaterial = (
    idParam: number,
    materialId: string,
    materialName: string,
    materialGroup: string,
    category: string,
    materialType: string,
    supplier: string,
    unit: string,
    materialCategory: number
  ) => {
    let isChangedMaterialMaster = true;
    materialData.forEach((item) => {
      if (item.id == idParam) {
        const sameSupplier = item.supplier?.join(",") == supplier;
        if (item.carbonCategory?.id === materialCategory && item.materialId == materialId && item.unit == unit && item.materialType == materialType && item.materialName == materialName && item.category == category && sameSupplier) {
          isChangedMaterialMaster = false;
        } else {
          isChangedMaterialMaster = true;
        }

        if(materialName.length > 100) {
          isChangedMaterialMaster = false;
          getMasterMaterialList(false);
          Notification.sendNotification('Maximum 100 characters are allowed for material name.', AlertTypes.warn);
        } else if(materialId.length > 20) {
          isChangedMaterialMaster = false;
          getMasterMaterialList(false);
          Notification.sendNotification('Maximum 20 characters are allowed for material id.', AlertTypes.warn);
        }
      }
    });
    

    try {
      if (isChangedMaterialMaster) {
        editMasterMaterialDAO(
          idParam,
          materialId,
          materialName,
          materialGroup,
          category,
          materialType,
          supplier,
          unit,
          materialCategory);
      }
    } catch (error) {
      console.log('error updating material:', idParam);
    }

  };

  const editMasterMaterialTableRow = (eventParam: any, rowParam: any) => {
    showEditMaterialMasterTableRow(rowParam);
  };

  const toggleView = (type: string) => {
    setViewType(type);
  };

  return (
    <>

      <div className="material-lib">
        <div style={{ display: "flex" }}>
          <MaterialMasterHeader header={headerInfo}  search={searchMasterMaterialByName} searchText={searchText}  />
          {decodeExchangeToken().allowedRoles.includes("viewTenantMaterialMaster") &&
            <MaterialMasterAction toggleView={toggleView} refresh={refreshList} create={createMasterMaterial} edit={editMasterMaterial} view={viewType} />
          }
        </div>
        { decodeExchangeToken().allowedRoles.includes("viewTenantMaterialMaster") ?
        <div > 
            <MaterialContext.Provider value={materialData}>
            <div className="material-lib__main">
              {materialData && materialData.length > 0 ? (
                <MaterialMasterTable edit={editMasterMaterial} 
                editRow={editMasterMaterialTableRow}
                getMaterialType={getMaterialType}
                materialTypeCategory={materialTypeCategory} />
                ) : !loadingMaterial? (
                  <div className="no-data-wrapper">
                    {materialsFound ? (<NoDataMessage message={''} />) : (<NoDataMessage message={noDataMessage} />)}
                  </div>
                ) : (
                  <div className="no-data-wrapper">
                    <NoDataMessage message={"Loading Material..."} />
                  </div>
                )}
              </div>
            </MaterialContext.Provider>
          </div>
          :
          (
            <div className="no-data-wrapper">
              <NoDataMessage message={noPermissionMessage} />
            </div>
          )}
      </div>

      {confirmErrorMessage.open && (
            <ConfirmDialog
              data-testid="confirmErrorMessage"
              open={confirmErrorMessage.open}
              message={{
                header: confirmErrorMessage.header,
                text: confirmErrorMessage.text,
                proceed: confirmErrorMessage.proceed,
                cancel: confirmErrorMessage?.cancel,

              }}
              close={() => {
                setConfirmErrorMessage({
                  open: false,
                  text: '',
                  header: '',
                  cancel: "Cancel",
                  proceed: 'Proceed',
                });
              }}
              proceed={deleteMaterialMaster}
            />
          )}
            {confirmDeleteMessage && (
            <ConfirmDialog
              data-testid="confirmDeleteMessage"
              open={confirmDeleteMessage}
              message={{
                header: "Warning",
                text: "This material is being used in a project, therefore you cannot delete this item.",
                proceed: "Okay",
              }}
              proceed={() => {
                setConfirmDeleteMessage(false);
              }}
            />
          )}

      {warningUpdateMessage.open && 
      (
        <ConfirmDialog
          data-testid="warningUpdateMessage"
          open={warningUpdateMessage.open}
          message={{
            header: warningUpdateMessage.header,
            text: warningUpdateMessage.text,
            proceed: warningUpdateMessage.proceed,
          }}
          proceed={() => {
            setWarningUpdateMessage({
              open: false,
              header: '',
              text: "",
              proceed: 'Okay',
            });
          }}
        />
      )}



      {dialogEditMaterialOpen ? (
        <CreateMasterMaterial open={dialogEditMaterialOpen}
          action={actionData} btnName={btnName} isCreatingNew={true}
          refresh={refreshList} close={closeEditMaterialDialog}
          create={createMasterMaterial} edit={editMasterMaterial}
          delete={callDeleteMasterMaterial}
           />
      ) : ('')}
    </>
  );
}


