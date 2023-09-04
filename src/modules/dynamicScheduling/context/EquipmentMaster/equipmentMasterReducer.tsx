import {
  GET_EQUIPMENT_CATEGORY,
  GET_EQUIPMENT_MASTER,
  GET_EQUIPMENT_SUPPLIER,
  GET_EQUIPMENT_TYPE,
} from './types';

export default (state: any, action: any) => {
  switch (action.type) {
    case GET_EQUIPMENT_MASTER: {
      return { ...state, equipmentMasterList: action.payload };
    }
    case GET_EQUIPMENT_CATEGORY: {
      return { ...state, equipmentCategory: action.payload };
    }
    case GET_EQUIPMENT_TYPE: {
      return { ...state, equipmentType: action.payload };
    }
    case GET_EQUIPMENT_SUPPLIER: {
      return { ...state, supplier: action.payload };
    }
    default: {
      return state;
    }
  }
};
