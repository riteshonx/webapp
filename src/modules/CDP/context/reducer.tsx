import { Action } from 'src/models/context';
import { ICdpState } from '../models';

import {
  SETTEST,
  SETCDPINSTENCESLIST,
  SETGENERATORFORM,
  SETSELECTEDGENERATOR,
  SETCDPFORMANSWERELIST,
  SETFORMANSWEREVALUE,
  SETSELECTEDINSTANCE
} from './action';

export const cdpInitialState: ICdpState = {
  test: '',
  selectedGenerator: '',
  generatorForm: {},
  cdpInstncesList: [],
  selectedInstance: {},
  cdpFormAnswereList: []
};

export const cdpReducer = (
  state: ICdpState = cdpInitialState,
  action: Action
): ICdpState => {
  switch (action.type) {
    case SETTEST: {
      return {
        ...state,
        test: action.payload,
      };
    }
    case SETSELECTEDGENERATOR: {
      return {
        ...state,
        selectedGenerator: action.payload
      }
    }
    case SETGENERATORFORM: {
      return {
        ...state,
        generatorForm: action.payload
      }
    }
    case SETCDPINSTENCESLIST: {
      return {
        ...state,
        cdpInstncesList: action.payload
      }
    }
    case SETSELECTEDINSTANCE: {
      return {
        ...state,
        selectedInstance: action.payload
      }
    }
    case SETCDPFORMANSWERELIST: {
      return {
        ...state,
        cdpFormAnswereList: action.payload
      }
    }
    case SETFORMANSWEREVALUE: {
      const payload = action.payload
      const {uniqueId, value} = payload
      const newList = state.cdpFormAnswereList.map((ans: any) => {
        if (uniqueId === ans.uniqueId) {
          return {
            name: ans.name,
            label: ans.label,
            value: value,
            uniqueId: ans.uniqueId
          }
        }
        else return {...ans}
      })
      return {
        ...state,
        cdpFormAnswereList: newList
      }
    }
    default: return state
  }
};
