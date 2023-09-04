import { IWorkFlowStep } from './IWorkFlowStep';

export class WorkFlowStep {
    public formId: string;
    public projectFeatureId: string;
    public isActiveTask: boolean;
    public stepDefinition: string;
    public stepName: string;

    public dueDate?: Date;
    public closedOn?: Date;

    public daysOverdue = 0;

    constructor(workFlowStep: IWorkFlowStep, stepName: string) {
        this.formId = workFlowStep.formId;
        this.projectFeatureId = workFlowStep.projectFeatureId;
        this.isActiveTask = workFlowStep.isActiveTask;
        this.stepDefinition = workFlowStep.stepDefinition;
        this.stepName = stepName;

        this.dueDate = Boolean(workFlowStep.dueDate) ? new Date(workFlowStep.dueDate) : undefined;
        this.closedOn = Boolean(workFlowStep.closedOn) ? new Date(workFlowStep.closedOn) : undefined;

        this.calculateDaysOverdue();
    }

    private calculateDaysOverdue() {
        const today = new Date();

        if (Boolean(this.dueDate) && !Boolean(this.closedOn) && today > this.dueDate!) {
            const difference = today.getTime() - this.dueDate!.getTime();
            this.daysOverdue = Math.ceil(difference / (1000 * 3600 * 24));
        }
    }
}