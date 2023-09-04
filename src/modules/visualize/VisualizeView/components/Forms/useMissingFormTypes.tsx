import { useMemo } from 'react';
import { useIsPCL } from 'src/modules/visualize/VisualizeRouting/PCL';

import { Form } from '../../models/form';
import { FormType } from '../../models/formType';
import { SmartNodes } from '../../models/SmartNodes';

export function useMissingFormTypes(formTypes: FormType[], selectedMapNode: SmartNodes, forms: Form[]) {
    const {isPCLRef} = useIsPCL();

    const showMissingFormTypes = useMemo(() => isPCLRef.current && Boolean(selectedMapNode) && selectedMapNode.nodeType === 'Room', [selectedMapNode]);
    
    const missingFormTypes = useMemo(() => {
        if (showMissingFormTypes && Boolean(formTypes) && formTypes.length > 1 && Boolean(forms) && forms.length > 0) {
            return formTypes.filter((formType) => !Boolean(forms.find((form) => form.featureId === formType.formTypeId)));
        } else {
            return [];
        }
    }, [showMissingFormTypes, formTypes, forms, selectedMapNode]);

    return missingFormTypes;
}