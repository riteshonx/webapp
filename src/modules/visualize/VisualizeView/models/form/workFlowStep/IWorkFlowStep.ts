export interface IWorkFlowStep {
    formId: string;
    projectFeatureId: string;
    isActiveTask: boolean;
    stepDefinition: string;
    dueDate: string;
    closedOn: string;
    workflowTemplateId: number;
}