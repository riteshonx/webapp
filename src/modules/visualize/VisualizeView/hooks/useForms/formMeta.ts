import { Bim360Statuses, FormStatuses, formStatusesById } from '../../models/form/formStatuses';
import { ILocation } from '../../models/form/location';
import { IUser } from '../../models/form/user';
import { IFormMeta } from './formsQueries';


interface FormTemplate {
    formTemplate: {
        projectFeature: {
            featureName: string
        }
    }
}

export class FormMeta {
    public formId: number;
    public formTypeInstanceId: number;
    public featureId: number;
    public status: { value: FormStatuses; };
    public assignees: { user: IUser; }[] = [];
    public subject: { value: string; }[] = [];
    public dueDate: string;
    public completedAt: string;
    public completedByUser?: IUser;
    public createdAt: string;
    public createdByUser?: IUser;
    public locations: ILocation[] = [];
    public updatedAt: string;
    public updatedByUser?: IUser;
    public formTemplate?: FormTemplate;
    public sourceAssignees: string;
    public sourceAssigneType?: string;
    public sourceStatus?: string;
    public sourceDescription?: string;
    public sourceTemplateId?: number;
    public sourceTemplateName?: string;
    public sourceId?: number;
    public sourceCompletedon?: string;
    public sourceUrl?: string;
    public sourceType?: string;
    public sourceSubType?: string;

    // BIM SPECIFIC
    public bim_360_template_id?: number;
    public bim_360_template_name?: string;
    public bim360_checklist_id?: number;
    public bim360_id?: number;
    public bim360_source_url?: string;
    public last_bim360_sync_attempted?: Date;
    public last_bim360_sync_successful?: Date;
    public bim360_checklist_type?: string;
    public bim360_status?: Bim360Statuses;
    public bim360_description?: string;
    public bim_360_assigned_to_name?: string;
    public bim_360_assigned_to_company?: string;

    constructor(formMeta: IFormMeta) {
        this.formId = formMeta.formId;
        this.formTypeInstanceId = formMeta.formTypeInstanceId;
        this.featureId = formMeta.featureId;
        this.status = Boolean(formMeta.status) ? formMeta.status : {value: this.getFormStatusFromId(formMeta.statusId)};
        this.dueDate = formMeta.dueDate;
        this.createdAt = formMeta.createdAt;
        this.updatedAt = formMeta.updatedAt;
        this.completedAt = formMeta.completedAt;
        this.sourceAssignees = '';
    }

    private getFormStatusFromId(statusId: 1 | 2 | 3 | 4) {
        return formStatusesById[statusId];
    }

    public addAssignee(assignee: IUser) {
        this.assignees.push({user: assignee});
    }

    public addSourceAssignees(sourceAssignee: string) {
        this.sourceAssignees = sourceAssignee;
    }

    public addStatus(formStatus: FormStatuses) {
        this.status = {value: formStatus};
    }

    public addSourceStatus(formStatus: string) {
        this.sourceStatus = formStatus;
    }

    public addSubject(subject: string) {
        this.subject.push({value: subject});
    }

    public get hasBimData() {
        return Boolean(this.bim360_id);
    }
}