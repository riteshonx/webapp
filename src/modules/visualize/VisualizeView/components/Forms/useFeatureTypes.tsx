import { gql, useLazyQuery } from '@apollo/client';
import { useEffect, useMemo } from 'react';
import { features } from 'src/utils/constants';
import { featureFormRoles } from 'src/utils/role';

import { useProjectQueryOptions } from '../../hooks/useQueryOptions';
import { FormType } from '../../models/formType';
import { IFormType } from '../../models/formType/IFormType';

// TODO - I do not understand why specifically Quality Control needs to be filtered out here.
// An explanation should be added and if it turns out that other form types could be filtered out
// this should be made more dynamic to accomodate that.
const LIST_FORM_TEMPLATE_TYPES = gql `
    query ListFormTemplateTypes {
        formTemplates: projectFeature(where: {projectTemplateAssociations: {featureId: {_is_null: false}}, feature: {_neq: "${features.QUALITY_CONTROL}"}}, order_by: {id: asc}) {
            formTypeId: id
            formType: caption
        }
    }
`;

export function useFeatureTypes() {
    const queryOptions = useProjectQueryOptions(featureFormRoles.viewForm);

    const [listFormTypes, {loading: formTypesLoading, data: formTypesData}] = useLazyQuery<{formTemplates: IFormType[]}>(LIST_FORM_TEMPLATE_TYPES);

    useEffect(() => {
        if (Boolean(queryOptions)) {
            listFormTypes(queryOptions);
        }
    }, [queryOptions]);

    const featureTypes = useMemo(() => {
        if (Boolean(formTypesData)) {
            const {formTemplates} = formTypesData!;
            const formTypes = formTemplates?.map((formType) => new FormType(formType));
    
            return formTypes;
        }

        return [];
    }, [formTypesData]);

    return featureTypes;
}