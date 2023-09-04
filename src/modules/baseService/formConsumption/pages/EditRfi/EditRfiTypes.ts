export interface IStatusListOptions {
  status: string;
  openStatus: boolean;
  projectFormStatusAssociations: Array<any>;
  formStatusId: number;
  id: number;
  disabled?: boolean;
}

export interface IWorkflowDisabledFields {
  status: string;
  dueDate: string | null;
  assignees: Array<any>;
}
