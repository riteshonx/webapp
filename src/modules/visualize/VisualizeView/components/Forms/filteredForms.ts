import { SmartBuilding } from 'location-intelligence-viewer';
import { Form } from '../../models/form';
import { FormStatuses } from '../../models/form/formStatuses';
import { FormType } from '../../models/formType';
import { ChildNode } from '../../models/locationTree';
import { ProjectTreeAndSmartObjectNodeMap } from '../../models/projectTreeAndSmartObjectNodeMap';
import { SmartNodes } from '../../models/SmartNodes';
import { DataModes } from '../../utils/DataMode';
import { LocationFormStatusFilters } from '../LocationTreeFormStatus/LocationFormStatusFilters';

export class FilteredForms {
    public value: Form[] = [];

    constructor(forms: Form[], selectedFormTemplate: FormType[], selectedFormTypes: FormType[], selectedAssigneToFormTypes: string[], selectedIssueTypes: string[], selectedMapNode: SmartNodes, projectTreeMap: ProjectTreeAndSmartObjectNodeMap, formStatusFilter: LocationFormStatusFilters[], formSearchKey: string, dataMode: DataModes) {
        if (Boolean(forms) && Boolean(selectedFormTemplate) && Boolean(projectTreeMap)) {
            this.value = this.filterForms(forms, selectedFormTemplate, selectedFormTypes, selectedAssigneToFormTypes, selectedIssueTypes, selectedMapNode, projectTreeMap, formStatusFilter, formSearchKey, dataMode);
        }
    }

    private filterForms(forms: Form[], selectedFormTemplate: FormType[], selectedFormTypes: FormType[], selectedAssigneToFormTypes: string[], selectedIssueTypes: string[], selectedMapNode: SmartNodes, projectTreeMap: ProjectTreeAndSmartObjectNodeMap, formStatusFilter: LocationFormStatusFilters[], formSearchKey: string,  dataMode: DataModes) {
        const formsFilteredByTemplate = forms.filter((form) => {
            const hasSelectedFormType = Boolean(selectedFormTemplate.find((tempalate) => tempalate.formTypeId === form.featureId))
            return hasSelectedFormType;
        });

        const showClosedForms = formStatusFilter.find((status) => status === 'closed')
        const formsFilteredByFormStatusFilter = formsFilteredByTemplate.filter((form) => {

            if (dataMode === 'Issues') {
                if (formStatusFilter.length === 4) {
                    return true;
                }

                if (!showClosedForms && form.status === FormStatuses.Closed) {
                    return false;
                }
                return true;
            }

            if (formStatusFilter[0] === LocationFormStatusFilters.Mixed) {
                return true;
            }

            if (formStatusFilter[0] === LocationFormStatusFilters.Open && form.status === FormStatuses.Open) {
                return true;
            }

            if (formStatusFilter[0] === LocationFormStatusFilters.Closed && form.status === FormStatuses.Closed) {
                return true;
            }
            return false;
        });
        

        let formsFilteredByActiveTypes;
        
        if(dataMode === 'Issues') {
            formsFilteredByActiveTypes = this.filterIssues(formsFilteredByFormStatusFilter, selectedAssigneToFormTypes, selectedIssueTypes)
        } else if(dataMode === 'All') {
            const issueTemplate = selectedFormTemplate.find((formType) => formType.formType === 'Issues');
            const checklistTemplate = selectedFormTemplate.find((formType) => formType.formType === 'Checklist');

            formsFilteredByActiveTypes = [...this.filterIssues(formsFilteredByFormStatusFilter, selectedAssigneToFormTypes, selectedIssueTypes, issueTemplate?.formTypeId),
                ...formsFilteredByActiveTypes = formsFilteredByFormStatusFilter.filter((form) => {
                    const hasSelectedFormType = checklistTemplate?.formTypeId === form.featureId && Boolean(selectedFormTypes.find((selectedFormType) => selectedFormType.formTypeId === (form.sourceTemplateId || form.bimTemplateId || form.featureId)))
                    return hasSelectedFormType;
                })
            ]

        } else {
            formsFilteredByActiveTypes = formsFilteredByFormStatusFilter.filter((form) => {
                const hasSelectedFormType = Boolean(selectedFormTypes.find((selectedFormType) => selectedFormType.formTypeId === (form.sourceTemplateId || form.bimTemplateId || form.featureId)))
                return hasSelectedFormType;
            });
        }

        let selectedNodeFilteredForms;

        if (Boolean(selectedMapNode)) {
            selectedNodeFilteredForms = formsFilteredByActiveTypes.filter((form) => {
                if (!form.isLinkedToLocation) {
                    return true;
                }

                let formIsTiedToChildOfSelectedNode = false;
                
                let projectNode: ChildNode[];
                if (selectedMapNode.nodeType === 'NodeCollection') {
                    projectNode = [projectTreeMap.get(selectedMapNode.highestNode.externalReferenceId)!.projectNode];
                } else {
                    const prjetNode = projectTreeMap.get(selectedMapNode.externalReferenceId)!.projectNode;
                    if (!prjetNode.parentId && selectedMapNode.isBuilding) {
                        projectNode = prjetNode.childNodes.filter((child) => (selectedMapNode as SmartBuilding).levels.find((level) => level.externalReferenceId === child.childNodeId));
                    } else {
                        projectNode = [prjetNode];
                    }
                }

                projectNode.map((node) => node.traverse((child) => {
                    const locationOnFormThatIsAChildOfThisNode = form.locations.find((location) => location.locationId === child.childNodeId);
                    
                    if (Boolean(locationOnFormThatIsAChildOfThisNode)) {
                        formIsTiedToChildOfSelectedNode = true;
                    }
                }))
        
                return formIsTiedToChildOfSelectedNode;
            });
        } else {
            selectedNodeFilteredForms = formsFilteredByActiveTypes;
        }

        let filteredForms = selectedNodeFilteredForms;

        if (formSearchKey !== '') {
            filteredForms = selectedNodeFilteredForms.filter((form) => {
                if (form.bimAssignedToCompany?.match(new RegExp(`${formSearchKey}`, "i"))
                    || form.bimChecklistType?.match(new RegExp(`${formSearchKey}`, "i"))
                    || form.status?.match(new RegExp(`${formSearchKey}`, "i"))) {
                    return true;
                }
                return false;
            })
        }

        return filteredForms;
    }

    private filterIssues (forms: Form[], selectedAssigneToFormTypes: string[], selectedIssueTypes: string[], issueTemplateId?: number) {
        if(selectedAssigneToFormTypes.length > 0 && selectedIssueTypes.length > 0) {
            return forms.filter((form) => {
                const isIssue = issueTemplateId ? issueTemplateId === form.featureId : true
                const hasSelectedAssignType = selectedAssigneToFormTypes.includes(form.sourceAssignees)
                const hasSelectedFormType = selectedIssueTypes.includes(form.sourceSubType!)
                return isIssue && hasSelectedAssignType && hasSelectedFormType;
            });
        } else  if(selectedAssigneToFormTypes.length > 0) {
            return forms.filter((form) => {
                const isIssue = issueTemplateId ? issueTemplateId === form.featureId : true
                const hasSelectedAssignType = selectedAssigneToFormTypes.includes(form.sourceAssignees)
                return isIssue && hasSelectedAssignType;
            });
        } else  if(selectedIssueTypes.length > 0) {
            return forms.filter((form) => {
                const isIssue = issueTemplateId ? issueTemplateId === form.featureId : true
                const hasSelectedFormType = selectedIssueTypes.includes(form.sourceSubType!)
                return isIssue &&  hasSelectedFormType;
            });
        } else {
            return []
        }
    }
}