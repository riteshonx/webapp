export interface ICommonFieldDetail {
  label: string;
  value: string | number | boolean;
}
export interface ICommonPopoverDetail {
  title: string;
  id?:number |string;
  state?:string;
  data: Array<ICommonFieldDetail>;
  attachment?:[];
  taskLink?:[]
}

export const POPOVER_TYPES = {
  RFI: 'RFI',
  
  ISSUE: 'Issue',
  
  TASK: 'Task',
  
  CO: 'Change Order',
  
  DAILY_LOG:'Daily Log',
  
  CHECKLIST: 'Checklist',

  MILESTONE:'Milestone'
  
  }
