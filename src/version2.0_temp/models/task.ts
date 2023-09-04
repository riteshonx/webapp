export interface ICommonFieldDetail {
  label: string;
  value: string | number | boolean | any;
}
export interface ICommonPopoverDetail {
  title: string;
  id?:number;
  state?:string;
  data: Array<ICommonFieldDetail>;
  attachment?:[];
  taskLink?:[]
}
