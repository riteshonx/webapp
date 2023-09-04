import { useMemo } from 'react';

import { Form } from '../../models/form';
import { FormType } from '../../models/formType';

export function useAssigneeTypes(forms: Form[], allFormTemplate: FormType[]) {

    const assigneeTypes = useMemo(() => {
        const featureTypeMap = new Map<string, string[]>([]);
        const issueTemplate = allFormTemplate.find((formType) => formType.formType === 'Issues');
        forms?.map(form => {
            if (Boolean(forms) && Boolean(allFormTemplate) && Boolean(form.sourceAssigneType) && Boolean(form.sourceAssignees) && form.sourceAssignees !== '') {
                forms.forEach((form) => {
                    if (issueTemplate?.formTypeId !== form.featureId)
                        return;

                    if (Boolean(form?.sourceAssigneType) && form?.sourceAssigneType!.toLowerCase() !== 'user' ) {
                        const sourceAssigneType = form.sourceAssigneType!.toLowerCase();
                        if (!featureTypeMap.has(sourceAssigneType)) {
                            featureTypeMap.set(sourceAssigneType, [form.sourceAssignees])
                        } else if (!(featureTypeMap.get(sourceAssigneType)?.find((value) => value === form.sourceAssignees))) {
                            featureTypeMap.get(sourceAssigneType)?.push(form?.sourceAssignees);
                        }
                    }
                })
            }
            
        })
        return featureTypeMap;
    }, [forms, allFormTemplate]);
    return assigneeTypes;
}