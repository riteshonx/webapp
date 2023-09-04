export interface ICdpState {
  test: string;
  selectedGenerator: string;
  generatorForm: any;
  cdpInstncesList: any;
  selectedInstance: any;
  cdpFormAnswereList: Array<any>
}

export interface ICdpContext {
  cdpState: ICdpState;
  cdpDispatch: any;
}

export interface ICDP {
  cdpDescription: string;
  cdpTypeName: string
  id: string
  image: string
}