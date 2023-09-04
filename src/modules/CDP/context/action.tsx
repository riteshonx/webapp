import { Action } from 'src/models/context';

export const SETTEST = "SETTEST"
export const SETSELECTEDGENERATOR = "SETSELECTEDGENERATOR"
export const SETGENERATORFORM = "SETGENERATORFORM"
export const SETCDPINSTENCESLIST = "SETCDPINSTENCESLIST"
export const SETCDPFORMANSWERELIST = "SETCDPFORMANSWERELIST"
export const SETFORMANSWEREVALUE = "SETFORMANSWEREVALUE"
export const SETSELECTEDINSTANCE = "SETSELECTEDINSTANCE"

export const setSelectedgenerator = (payload: string): Action => {
  return {
      type: SETSELECTEDGENERATOR,
      payload
  }
}

export const setGeneratorForm = (payload: any): Action => {
  return {
    type: SETSELECTEDGENERATOR,
    payload
  }
}

export const setCdpInstencesList = (payload: any): Action => {
  return {
    type: SETCDPINSTENCESLIST,
    payload
  }
}

export const setSelectedInstance = (payload: any): Action => {
  return {
    type: SETSELECTEDINSTANCE,
    payload
  }
}

export const setCdpFormAnswereList = (payload: Array<any>): Action => {
  return {
    type: SETCDPFORMANSWERELIST,
    payload
  }
}

export const setFormAnswereValue = (payload: any): Action => {
  return {
    type: SETFORMANSWEREVALUE,
    payload: payload
  }
}