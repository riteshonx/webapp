import { useContext, useReducer } from 'react';
import { decodeExchangeToken } from 'src/services/authservice';
import { MasterMaterialRoles, tenantCompanyRole } from 'src/utils/role';
import { client } from '../../../../services/graphql';
import { setIsLoading } from '../../../root/context/authentication/action';
import { stateContext } from '../../../root/context/authentication/authContext';
import Notification, {
  AlertTypes,
} from '../../../shared/components/Toaster/Toaster';
import {
  ADD_EQUIPMENT_MASTERS_QUERY,
  DELETE_EQUIPMENT_MASTERS_QUERY,
  GET_ALL_EQUIPMENTS_QUERY,
  UPDATE_EQUIPMENT_MASTERS_QUERY,
  GET_EQUIPMENT_TYPE_QUERY,
  SEARCH_EQUIPMENTS_BY_NAME,
} from '../../graphql/queries/EquipmentMaster';
import { FETCH_SUPPLIERS } from '../../libraries/grqphql/queries/material';
import EquipmentMasterContext from './equipmentMasterContext';
import equipmentMasterReducer from './equipmentMasterReducer';
import {
  GET_EQUIPMENT_CATEGORY,
  GET_EQUIPMENT_MASTER,
  GET_EQUIPMENT_SUPPLIER,
  GET_EQUIPMENT_TYPE,
} from './types';

const EquipmentMasterState = (props: any) => {
  const intialState = {
    equipmentMasterList: [],
    equipmentCategory: [],
    equipmentType: [],
    supplier: [],
  };

  const [state, dispatch] = useReducer(equipmentMasterReducer, intialState);
  const authContext: any = useContext(stateContext);

  const getEquipmentMaster = async () => {
    try {
      authContext.dispatch(setIsLoading(true));
      const res = await client.query({
        query: GET_ALL_EQUIPMENTS_QUERY,
        fetchPolicy: 'network-only',
        variables: {},
        context: {
          role: MasterMaterialRoles.read,
        },
      });

      authContext.dispatch(setIsLoading(false));
      dispatch({
        type: GET_EQUIPMENT_MASTER,
        payload: res.data.equipmentMaster,
      });
    } catch (error: any) {
      console.log('error: ', error);
      authContext.dispatch(setIsLoading(false));
    }
  };

  const getEquipmentCategory = () => {
    dispatch({
      type: GET_EQUIPMENT_CATEGORY,
      payload: [
        { value: 'owned', label: 'Owned' },
        { value: 'rented', label: 'Rented' },
      ],
    });
  };

  const getEquipmentNameSearch = async (SearchText?: any) => {

    try {
      authContext.dispatch(setIsLoading(true));
      const responseData: any = await client.query({
        query: SEARCH_EQUIPMENTS_BY_NAME,
        variables: {
         
          "oemName": SearchText ? `%${SearchText}%` : `%%`
        },
        fetchPolicy: 'network-only',
        context: { role: MasterMaterialRoles.read },
      });
      
      const filteredResult = responseData.data.equipmentMaster?.filter((item: any) => item.oemName.toLowerCase().includes(SearchText?.toLowerCase()))
      const responseDataList = SearchText ? filteredResult : responseData.data.equipmentMaster
  
      dispatch({
        type: GET_EQUIPMENT_MASTER,
        payload: responseDataList,
      });
      authContext.dispatch(setIsLoading(false));
    } catch (error: any) {
      console.log('err:', error)

    }
  }



  const getEquipmentType = async () => {
    try {
      authContext.dispatch(setIsLoading(true));
      const response: any = await client.query({
        query: GET_EQUIPMENT_TYPE_QUERY,
        variables: {
          "name": "Equipment Type"
        },
        fetchPolicy: 'network-only',
        context: { role: MasterMaterialRoles.read },
      });
      const equipmentTypeList: Array<any> = [];
      response.data.configurationLists[0].configurationValues.forEach((equipmentType: any) => {
        const equipmentTypeValue =
          { 'label': equipmentType.nodeName, 'value': equipmentType.nodeName }
        equipmentTypeList.push(equipmentTypeValue);
      });

      dispatch({
        type: GET_EQUIPMENT_TYPE,
        payload: equipmentTypeList,
      });
      authContext.dispatch(setIsLoading(false));
    } catch (error: any) {
      authContext.dispatch(setIsLoading(false));
    }
  };

  const addEquipmentMaster = async (equipment: any) => {
    try {
      authContext.dispatch(setIsLoading(true));
      if (!equipment.baselineHours) {
        delete equipment.baselineHours;
      }
      const responst: any = await client.mutate({
        mutation: ADD_EQUIPMENT_MASTERS_QUERY,
        variables: {
          objects: {
            ...equipment,

            updatedBy: decodeExchangeToken().userId,
          },
        },
        context: { role: MasterMaterialRoles.create },
      });
      getEquipmentMaster();
      Notification.sendNotification(
        'Equipment Master created successfully',
        AlertTypes.success
      );
      authContext.dispatch(setIsLoading(false));
    } catch (error: any) {
      authContext.dispatch(setIsLoading(false));
      console.log('error: ', error);
    }
  };
  const getEquipmentSupplierList = async () => {
    try {
      authContext.dispatch(setIsLoading(true));
      const response: any = await client.query({
        query: FETCH_SUPPLIERS,
        variables: {},
        fetchPolicy: 'network-only',
        context: { role: tenantCompanyRole.viewTenantCompanies },
      });
      const supplierNameList: Array<any> = [];
      response.data.tenantCompanyAssociation.forEach((supplier: any) => {
        supplierNameList.push(supplier.name);
      });

      dispatch({
        type: GET_EQUIPMENT_SUPPLIER,
        payload: supplierNameList,
      });
      authContext.dispatch(setIsLoading(false));
    } catch (error: any) {
      authContext.dispatch(setIsLoading(false));
    }
  };

  const deleteEquipmentMaster = async (id: any) => {
    try {
      authContext.dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: DELETE_EQUIPMENT_MASTERS_QUERY,
        variables: {
          id,
        },
        context: { role: MasterMaterialRoles.delete },
      });
      authContext.dispatch(setIsLoading(false));
      getEquipmentMaster();

      Notification.sendNotification(
        'Equipment Master deleted successfully',
        AlertTypes.success
      );
    } catch (err: any) {
      authContext.dispatch(setIsLoading(false));
      console.log('err: ', err);
    }
  };
  const updateEquipmentMaster = async (object: any) => {
    try {
      const tempEquipment = {
        
        equipmentType: object.equipmentType,
        equipmentCategory: object.equipmentCategory,
        model: object.model,
        oemName: object.oemName,
        supplier: object.supplier,
        baselineHours: object.baselineHours,
        equipmentId:object.equipmentId
      };

      authContext.dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: UPDATE_EQUIPMENT_MASTERS_QUERY,
        variables: {
          id: object.id,
          objects: tempEquipment,
        },
        context: { role: MasterMaterialRoles.update },
      });
      const equipmentList = state.equipmentMasterList.map((equipment: any) => {
        if (equipment.id === object.id) {
          return object;
        } else {
          return equipment;
        }
      });
      dispatch({ type: GET_EQUIPMENT_MASTER, payload: equipmentList });
      Notification.sendNotification(
        'Equipment Master updated successfully',
        AlertTypes.success
      );
      authContext.dispatch(setIsLoading(false));
    } catch (err: any) {
      console.log('err: ', err);
      authContext.dispatch(setIsLoading(false));
    }
  };
  return (
    <EquipmentMasterContext.Provider
      value={{
        equipmentMasterList: state.equipmentMasterList,
        equipmentCategory: state.equipmentCategory,
        equipmentType: state.equipmentType,
        supplier: state.supplier,
        getEquipmentMaster,
        getEquipmentCategory,
        getEquipmentType,
        getEquipmentSupplierList,
        addEquipmentMaster,
        deleteEquipmentMaster,
        updateEquipmentMaster,
        getEquipmentNameSearch,
      }}
    >
      {props.children}
    </EquipmentMasterContext.Provider>
  );
};

export default EquipmentMasterState;
