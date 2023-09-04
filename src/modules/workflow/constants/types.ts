export type WorkflowTemplateDefinition = {
  dataType: string;
  fieldType: string;
  id: number;
};

export type WorkflowStepDefinition = {
  description: string;
  name: string;
  type: string;
  posx: number;
  posy: number;
  updatedBy: string;
  workflowTemplateId: number;
  editsAllowed: boolean;
  createdBy: string;
  isDeleted: boolean;
};

export type WorkflowOutcomeDefinition = {
  name: string;
  createdBy: string;
  workflowTemplateId: number;
  fromStepDefName: string;
  toStepDefName: string;
  updatedBy: string;
  startx: number;
  starty: number;
  endx: number;
  endy: number;
  isDeleted: boolean;
};

export type WorkflowConfigurationSnapshot = {
  outcomesToInsert: WorkflowOutcomeDefinition[];
  stepsToInsert: WorkflowStepDefinition[];
  outcomesToUpdate: any;
  stepsToUpdate: any;
};
