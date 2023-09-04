import { useMemo } from 'react';

import { Form } from '../../models/form';
import { FormType } from '../../models/formType';
import { useDataMode } from '../../utils/DataMode';

export function useBimFeatureTypes(forms: Form[], templateType: FormType[]) {
    // TODO - The following loop over the forms can be done in the useForms hook, saves a loop but is a bit dirtier,
    //  if this extra loop takes too long on the full data move this back into the useForms hook.
    const { dataMode } = useDataMode();

    const bimFeatureTypes = useMemo(() => {
        if (Boolean(forms) && Boolean(templateType)) {
            const featureTypeMap = new Map<number, FormType>([]);
            const templateTypeKey = dataMode === 'BIM360' ?  'BIM360 Checklist' : 'Checklist';
            const checklistTemplate = templateType.find((formType) => formType.formType === templateTypeKey);
            forms.forEach((form) => {
                if (checklistTemplate?.formTypeId !== form.featureId)
                    return;
                const formType = new FormType({formTypeId: form.sourceTemplateId || form.bimTemplateId || form.featureId, formType: form.featureName});
                featureTypeMap.set(formType.formTypeId, formType);
            });

            return Array.from(featureTypeMap.values());
        }

        return [];
    }, [forms, templateType]);
    return bimFeatureTypes;
}