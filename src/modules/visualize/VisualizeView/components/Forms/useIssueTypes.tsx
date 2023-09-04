import { useMemo } from 'react';

import { Form } from '../../models/form';
import { FormType } from '../../models/formType';

export interface IssueTypes{
    value: string , 
    subType: string[]
}

export function useIssueTypes(forms: Form[], allFormTemplate: FormType[]) {

    const IssueTypes = useMemo(() => {
        const issueTemplate = allFormTemplate.find((formType) => formType.formType === 'Issues');
        const issueSubTypes: IssueTypes[] = []
        forms?.map(form => {
            if (Boolean(forms) && Boolean(allFormTemplate) && Boolean(form.sourceAssigneType) && Boolean(form.sourceAssignees) && form.sourceAssignees !== '') {
                forms.forEach((form) => {
                    if (issueTemplate?.formTypeId !== form.featureId)
                        return;

                    if (form.sourceType) {
                        const issueType = issueSubTypes.find((type) => type.value === form.sourceType)
                        if (!issueType) {
                            const newIssueType: IssueTypes  = {'value': form?.sourceType, subType: []};
                            form.sourceSubType && form.sourceSubType !== form.sourceType && newIssueType.subType.push(form.sourceSubType)
                            issueSubTypes.push(newIssueType);
                        } else {
                            if (form.sourceSubType && !issueType.subType.find(value => value === form.sourceSubType) ) {
                                form.sourceSubType !== form.sourceType && issueType.subType.push(form.sourceSubType)
                            }
                        }
                    }
                })
            }
            
        })
        return issueSubTypes;
    }, [forms, allFormTemplate]);
    return IssueTypes;
}