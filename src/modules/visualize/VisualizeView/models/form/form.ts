import { SmartNodeCollection } from 'location-intelligence-viewer';

import { FormMeta } from '../../hooks/useForms/formMeta';
import { Bim360Statuses, FormStatuses } from './formStatuses';
import { Location } from './location';
import { User } from './user';
import { WorkFlowStep } from './workFlowStep';
import { SmartNodes } from '../SmartNodes';

const numberRegEx = /[^0-9]/g;

export class Form {
    public formId: number;
    public slateFormId: number;
    public formTypeInstanceId: number;
    public featureId: number;
    public subject: string;
    public featureName: string;
    public assignees: User[];
    public locations: Location[];
    public dueDate?: Date;
    public daysOverdue = 0;
    public createdAt?: Date;
    public createdBy?: User;
    public updatedAt?: Date;
    public updatedBy?: User;
    public completedOn?: Date;
    public completedBy?: User;
    public sourceAssignees: string;
    public sourceAssigneType?: string;
    public sourceStatus?: string;
    public sourceDescription?: string;
    public sourceTemplateId?: number;
    public sourceTemplateName?: string;
    public sourceId?: number;
    public sourceUrl?: string;
    public sourceType?: string;
    public sourceSubType?: string;

    public open: boolean;
    public status: FormStatuses; 

    private workFlowSteps: WorkFlowStep[];

    public nodeCollection?: SmartNodeCollection;

    // BIM 360 DATA
    public bimTemplateId?: number; // Feature Id
    private bimTemplateName?: string; // Feature Name
    private bimChecklistId?: number; // Form Type Instance Id
    public bimId?: number;
    public bimSourceUrl?: string;
    private bimLastAttemptedSync?: Date;
    public bimLastSuccessfulSync?: Date;
    public bimChecklistType?: string;
    public bimStatus?: Bim360Statuses; // Status
    public bimDescription?: string;
    private bimAssignedToName?: string;
    public bimAssignedToCompany?: string;

    constructor(form: FormMeta, workFlowSteps: WorkFlowStep[], nodeCollection?: SmartNodeCollection) {
        this.formId = form.formId;
        this.slateFormId = form.formId;
        this.formTypeInstanceId = form.formTypeInstanceId;
        this.subject = Boolean(form.subject[0]) ? form.subject[0].value : '-';

        this.featureId = form.featureId;
        this.featureName = Boolean(form.formTemplate) ? form.formTemplate!.formTemplate?.projectFeature?.featureName : '';
        
        this.assignees = form.assignees.map((assignee) => new User(assignee.user));
        this.sourceAssignees = form.sourceAssignees;
        this.locations = form.locations.map((location) => new Location(location));

        this.dueDate = Boolean(form.dueDate) ? new Date(form.dueDate) : undefined;

        this.createdAt = Boolean(form.createdAt) ? new Date(form.createdAt) : undefined;
        this.createdBy = Boolean(form.createdByUser) ? new User(form.createdByUser!) : undefined;

        this.updatedAt = Boolean(form.updatedAt) ? new Date(form.updatedAt) : undefined;
        this.updatedBy = Boolean(form.updatedByUser) ? new User(form.updatedByUser!) : undefined;

        this.completedOn = Boolean(form.completedAt) ? new Date(form.completedAt) : undefined;
        this.completedBy = Boolean(form.completedByUser) ? new User(form.completedByUser!) : undefined;

        this.workFlowSteps = Boolean(workFlowSteps) ? workFlowSteps : [];

        this.open = !Boolean(this.completedOn);
        this.status = form.status.value;

        this.nodeCollection = nodeCollection;
        
        this.calculateDaysOverdue();

        if (form.sourceStatus && form.sourceStatus !== '') {
            this.sourceStatus = form.sourceStatus;
            this.status = this.convertSourceStatusToSlateStatus(form.sourceStatus);
        }

        if (form.sourceAssigneType) {
            this.sourceAssigneType = form.sourceAssigneType
        }

        if (form.sourceDescription) {
            this.sourceDescription = form.sourceDescription
        }

        if (form.sourceTemplateId) {
            this.sourceTemplateId = form.sourceTemplateId
        }

        if (form.sourceTemplateName) {
            this.sourceTemplateName = form.sourceTemplateName;
            this.featureName = form.sourceTemplateName;
        }

        if (form.sourceId) {
            this.sourceId = form.sourceId
        }

        if (form.sourceCompletedon) {
            this.completedOn = new Date(form.sourceCompletedon)
        }

        if (form.sourceUrl) {
            this.sourceUrl = form.sourceUrl
        }

        if (form.sourceDescription) {
            this.bimDescription = form.sourceDescription
        }
        
        if (form.sourceType) {
            this.sourceType = form.sourceType
        }

        if (form.sourceSubType) {
            this.sourceSubType = form.sourceSubType
        }

        if (form.hasBimData) {
            this.bimTemplateId = form.bim_360_template_id!;
            this.featureName = form.bim_360_template_name!;
            this.formTypeInstanceId = form.bim360_checklist_id!;
            this.formId = form.bim360_id!;
            this.bimId = form.bim360_id;
            this.bimSourceUrl = form.bim360_source_url;
            this.bimLastAttemptedSync = form.last_bim360_sync_attempted;
            this.bimLastSuccessfulSync = form.last_bim360_sync_successful;
            this.bimChecklistType = form.bim360_checklist_type;
            this.status = this.convertBim360StatusToSlateStatus(form.bim360_status!);
            this.open = this.status === FormStatuses.Open;
            this.bimStatus = form.bim360_status;
            this.bimDescription = form.bim360_description;
            this.bimAssignedToCompany = form.bim_360_assigned_to_company;
            this.bimAssignedToName = form.bim_360_assigned_to_name;
            this.sourceAssignees = this.featureName;
        }
    }

    public get isBimForm() {
        return Boolean(this.bimId);
    }

    public get IsBimFormSynced() {
        if (this.isBimForm && Boolean(this.bimLastAttemptedSync) && Boolean(this.bimLastSuccessfulSync)) {
            return this.bimLastSuccessfulSync!.getTime() >= this.bimLastAttemptedSync!.getTime();
        }
    }

    public get isLinkedToLocation() {
        return this.locations.length > 0;
    }

    public get locationCount() {
        return this.locations.length;
    }

    public get locationId() {
        if (this.isLinkedToLocation) {
            if (this.locationCount > 1 && Boolean(this.nodeCollection)) {
                return this.nodeCollection?.externalReferenceId;
            } else {
                return this.locations[0].locationId;
            }
        }
    }

    public get locationIds() {
        return this.locations.map((location) => location.locationId);
    }

    public get assigneeNames() {
        if (this.isBimForm) {
            const hasAssigneeName = Boolean(this.bimAssignedToName) && this.bimAssignedToName !== 'N/A';
            const hasAssigneeCompany = Boolean(this.bimAssignedToCompany) && this.bimAssignedToCompany !== 'N/A';

            return `${hasAssigneeName ? this.bimAssignedToName : ''}${hasAssigneeName && hasAssigneeCompany ? ', ' : ''}${hasAssigneeCompany ? this.bimAssignedToCompany : ''}`;
        }

        if (this.sourceAssignees !== '') {
            return [this.sourceAssignees];
        }

        return this.assignees.map((assignee) => assignee.fullName).join(', ');
    }

    public get locationNames() {
        return this.locations.map((location) => location.name).join(', ');
    }

    public get activeWorkFlowStep() {
        return this.workFlowSteps.find((workFlowStep) => workFlowStep.isActiveTask);
    }

    public get activeWorkFlowStepDueDate() {
        return this.activeWorkFlowStep?.dueDate;
    }

    public get activeWorkFlowStepName() {
        return this.isBimForm ? this.bimStatus : this.activeWorkFlowStep?.stepName;
    }

    public get isOverdue() {
        return this.status === FormStatuses.Overdue;
    }

    public get activeStepDaysOverdue() {
        return this.activeWorkFlowStep?.daysOverdue;
    }

    public preferedLocationId(preferedNode: SmartNodes | undefined) {
        if (this.isLinkedToLocation) {
            if (this.locationCount > 1 && Boolean(preferedNode) && preferedNode?.nodeType === 'Room') {
                const preferedlocationId = this.locationIds.find((id) => id === preferedNode?.externalReferenceId)
                return preferedlocationId || this.locations[0].locationId;
            } else if (this.locationCount > 1 && Boolean(this.nodeCollection)) {
                return this.nodeCollection?.externalReferenceId;
            } else {
                return this.locations[0].locationId;
            }
        }
    }

    private calculateDaysOverdue() {
        const today = new Date();

        if (Boolean(this.dueDate) && !Boolean(this.completedOn) && today > this.dueDate!) {
            const difference = today.getTime() - this.dueDate!.getTime();
            this.daysOverdue = Math.ceil(difference / (1000 * 3600 * 24));
        }
    }

    private convertBim360StatusToSlateStatus(bimStatus: Bim360Statuses) {
        switch(bimStatus) {
            case Bim360Statuses.NotStarted: return FormStatuses.Draft;
            case Bim360Statuses.InProgress: return FormStatuses.Open;
            case Bim360Statuses.Completed: return FormStatuses.Closed;
            default: return FormStatuses.Open;
        }
    }

    private convertSourceStatusToSlateStatus(bimStatus: string) {
        switch(bimStatus) {
            case 'Not Started': return FormStatuses.Draft;
            case 'draft': return FormStatuses.Draft;
            case 'open': return FormStatuses.Open;
            case 'In Progress': return FormStatuses.Open;
            case 'in_dispute': return FormStatuses.Open;
            case 'not_approved': return FormStatuses.Open;
            case 'answered': return FormStatuses.Open;
            case 'Completed': return FormStatuses.Closed;
            case 'closed': return FormStatuses.Closed;
            case 'void': return FormStatuses.Closed;
            case 'ready_to_inspect': return FormStatuses.Ready;
            case 'work_completed': return FormStatuses.Ready;
            default: return FormStatuses.Open;
        }
    }
}