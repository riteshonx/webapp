import { SmartNodeCollection, SmartProjectSite } from 'location-intelligence-viewer';
import { useEffect, useMemo, useRef } from 'react';
import { v4 as uuid } from 'uuid';

import { Form } from '../../models/form';
import { FormMeta } from './formMeta';
import { useFormData as useFormsData } from './useFormsData';
import { useWorkFlowSteps } from './useWorkFlowSteps';

export function useForms(projectSite: SmartProjectSite) {
    const {formsData, loading: formsDataLoading} = useFormsData();
    const {workFlowSteps, workFlowStepsLoading} = useWorkFlowSteps();

    const formsLoading = useMemo(() => formsDataLoading || workFlowStepsLoading, [formsDataLoading, workFlowStepsLoading]);
    
    const forms = useMemo(() => {
        if (Boolean(formsData) && Boolean(workFlowSteps) && Boolean(projectSite)) {
            const {forms} = formsData!;
            
            const fullForms = forms!.map((form) => {
                const workFlowStepsOnForm = workFlowSteps!.filter((workFlowStep) => Number(form.formId) === Number(workFlowStep.formId));

                const nodeCollection = buildSmartNodeCollection(form, projectSite);

                return new Form(form, workFlowStepsOnForm, nodeCollection);
            });

            return fullForms;
        }
    }, [formsData, workFlowSteps, projectSite]);

    function buildSmartNodeCollection(form: FormMeta, projectSite: SmartProjectSite): SmartNodeCollection {
        const locationIds = Boolean(form.locations) ? form.locations!.map((location) => location.locationReferenceId) : [];
        let nodeCollection: SmartNodeCollection = undefined!;
        
        if (locationIds.length > 1) {
            nodeCollection = projectSite.createNodeCollectionFromExternalReferenceIds(locationIds, 'Multiple Areas Selected', uuid());
        }
        
        return nodeCollection;
    }

    return {forms, formsLoading} as const;
}