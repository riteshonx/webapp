import { FormStatus } from '../../models/formStatus';
import { FormType } from '../../models/formType';
import { DataModes } from '../../utils/DataMode';
import { Form } from '../../models/form';

interface FormStatusWithFormTypeId extends FormStatus {
    formTypeId: string;
}

interface TemplateLocationStatus  {
    [index: string | number]:  Map<string, FormStatusWithFormTypeId[]>
}

export class FormStatusStore {
    
    private formAllStatusesByLocationId: TemplateLocationStatus = {};

    constructor(forms: Form[] | undefined) { 
        this.genarteLocationFormStatus(forms)
    }

    private async genarteLocationFormStatus (forms: Form[] | undefined) {
        if (!forms) return;
        forms.forEach((form) => {
            if (!this.formAllStatusesByLocationId[form.featureId]) {
                this.formAllStatusesByLocationId[form.featureId] = new Map([]);
            }

            const formTypeIds = (form.sourceTemplateId) ? [form.sourceTemplateId.toString()] : 
                ['assign ' + form.sourceAssignees.toString(), 'isstype ' + form.sourceSubType?.toString(), form.sourceAssignees.toString() + ' - ' + form.sourceSubType?.toString()]

            form.locationIds.map((locId) => {
                (!this.formAllStatusesByLocationId[form.featureId]?.has(locId))  && this.formAllStatusesByLocationId[form.featureId]?.set(locId, [])

                formTypeIds.map((formTypeId) => {
                    if(!formTypeId) return;

                    const existingformStatus = this.formAllStatusesByLocationId[form.featureId].get(locId)?.find((sts => sts.formTypeId === formTypeId))
                    
                    if (existingformStatus) {
                        const [openFormsCount, closedFormsCount, notStartedFormsCount, readyFormsCount] = this.formStatusCount(form)
                        existingformStatus.closedForms += closedFormsCount;
                        existingformStatus.openForms += openFormsCount;
                        existingformStatus.notStartedForms += notStartedFormsCount;
                        existingformStatus.readyFormsCount += readyFormsCount;
                    } else {
                        this.formAllStatusesByLocationId[form.featureId]?.get(locId)?.push(this.generateFormStatusWithFormTypeId(form, locId, formTypeId))
                    }
                })
            })
        })
    }

    private generateFormStatusWithFormTypeId(form: Form, locId: string, formTypeId: string) {
        const [openFormsCount, closedFormsCount, notStartedFormsCount, readyFormsCount] = this.formStatusCount(form)
        return {
            "closedForms": closedFormsCount,
            "openForms": openFormsCount,
            "locationId": locId,
            "openIssueCount": (!form.sourceTemplateId)? openFormsCount : 0,
            "notStartedForms": notStartedFormsCount,
            "readyFormsCount": readyFormsCount,
            "featureId": 0,
            "formTypeId": formTypeId
        } 
    }

    private formStatusCount(form: Form) {
        const formstatus = form.sourceStatus?.toLowerCase();
        const openFormsCount = formstatus === "in progress" || formstatus === "open"  || formstatus === "in_dispute" || formstatus === "not_approved" || formstatus === "answered" ? 1 : 0 
        const closedFormsCount = formstatus === "completed" || formstatus === "closed" || formstatus === "void" ? 1 : 0
        const notStartedFormsCount = formstatus === "not started" || formstatus === "draft" ? 1 : 0
        const readyFormsCount = formstatus === "ready_to_inspect" || formstatus === "work_completed" ? 1 : 0
        return [openFormsCount, closedFormsCount, notStartedFormsCount, readyFormsCount];
    }

    private getAllFormStatusesFromStore(formTypes: FormType[], activeFormTemplate: FormType[], activeAssigneeToFormTypes: string[], activeIssueTypes: string[], dataMode: DataModes) {
        const templateFilteredIssuesStatus: FormStatusWithFormTypeId[] = [];
        const templateFilteredChecklistStatus: FormStatusWithFormTypeId[] = [];

        const issueTemplate = activeFormTemplate.find((formType) => formType.formType === 'Issues');
        const checklistTemplate = activeFormTemplate.find((formType) => formType.formType === 'Checklist');

        if (issueTemplate) {
            if(this.formAllStatusesByLocationId[issueTemplate.formTypeId]) {
                this.formAllStatusesByLocationId[issueTemplate.formTypeId].forEach((val) => templateFilteredIssuesStatus.push(...val))
            }
        }

        if (checklistTemplate) {
            if(this.formAllStatusesByLocationId[checklistTemplate.formTypeId]) {
                this.formAllStatusesByLocationId[checklistTemplate.formTypeId].forEach((val) => templateFilteredChecklistStatus.push(...val))
            }
        }

        return [
            ...templateFilteredIssuesStatus.filter((formStatus) => {
                formStatus.openIssueCount = formStatus.openForms;
                return Boolean(activeAssigneeToFormTypes.find((assignee) => assignee === formStatus.formTypeId))
            }),
            ...templateFilteredChecklistStatus.filter((formStatus) => {
                return Boolean(formTypes.find((formType) => formType.formTypeId === +formStatus.formTypeId))
            })
        ]
    }

    private getFormStatusesFromStore(formTypes: FormType[], activeFormTemplate: FormType[], activeAssigneeToFormTypes: string[], activeIssueTypes: string[], dataMode: DataModes) {
        const templateFilteredStatus: FormStatusWithFormTypeId[] = [];
        activeFormTemplate?.map((tempalate) => {
            if(this.formAllStatusesByLocationId[tempalate.formTypeId]) {
                this.formAllStatusesByLocationId[tempalate.formTypeId].forEach((val) => templateFilteredStatus.push(...val))
            }
        })

        if(dataMode === 'Issues') {
            return templateFilteredStatus.filter((formStatus) => {
                const activeFormTypes = [];
                if(activeAssigneeToFormTypes.length > 0 && activeIssueTypes.length > 0) {
                    activeAssigneeToFormTypes.map((assignee => {
                        activeIssueTypes.map(isssueType => activeFormTypes.push(assignee + ' - ' + isssueType))
                    }))
                } else  if(activeAssigneeToFormTypes.length > 0) {
                    activeFormTypes.push(...(activeAssigneeToFormTypes.map((assgn) => 'assign ' + assgn)))
                } else  if(activeIssueTypes.length > 0) {
                    activeFormTypes.push(...(activeIssueTypes.map((type) => 'isstype ' + type)))
                } 
                formStatus.openIssueCount = formStatus.openForms;
                return Boolean(activeFormTypes.find((formType) => formType === formStatus.formTypeId))
            });
        } else {
            return templateFilteredStatus.filter((formStatus) => Boolean(formTypes?.find((formType) => formType.formTypeId === +formStatus.formTypeId)));
        }
    }

    public async listFormStatusesByLocation(formTypes: FormType[], activeFormTemplate: FormType[], activeAssigneeToFormTypes: string[], activeIssueTypes: string[], dataMode: DataModes) {
        const formStatuses = (dataMode === 'All') ? this.getAllFormStatusesFromStore(formTypes, activeFormTemplate, activeAssigneeToFormTypes, activeIssueTypes, dataMode)
            : this.getFormStatusesFromStore(formTypes, activeFormTemplate, activeAssigneeToFormTypes, activeIssueTypes, dataMode);

        const formStatusesMappedByLocation = new Map<string, FormStatus[]>([]);

        formStatuses.forEach((formStatus) => {
            if (!formStatusesMappedByLocation.has(formStatus.locationId)) {
                formStatusesMappedByLocation.set(formStatus.locationId, [formStatus]);
            } else {
                formStatusesMappedByLocation.get(formStatus.locationId)?.push(formStatus);
            }
        });

        return formStatusesMappedByLocation;
    }
}