import { gql, QueryHookOptions, useLazyQuery } from '@apollo/client';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { stateContext as authContext } from 'src/modules/root/context/authentication/authContext';
import { featureFormRoles } from 'src/utils/role';

import { IWorkFlowStep, WorkFlowStep } from '../../models/form/workFlowStep';
import { useProjectQueryOptions } from '../useQueryOptions';

const LIST_FORM_WORKFLOW_STEPS = gql`
    query getWorkFlowSteps {
        workFlowSteps: workflowRuntimeInfo {
            stepId: id
            isActiveTask
            stepDefinition: stepDefName
            formId: featureName
            projectFeatureId: featureType,
            dueDate
            closedOn
            workflowTemplateId
        }
    }
`;

interface WorkFlowStepNameDef {
    workflowTemplateId: number;
    name: string;
    stepDefinition: string;
}
const LIST_FORM_WORKFLOW_STEP_NAME_DEFS = gql `
    query getWorkFlowStepNameDefs {
        stepNameDefs: workflowTemplateStepDef(order_by: {workflowTemplateId: asc}) {
            workflowTemplateId
            name: description
            stepDefinition: name
        }
    }
`

export function useWorkFlowSteps() {
    const { state }: any = useContext(authContext);
    const [workFlowStepsLoading, setWorkFlowStepsLoading] = useState<boolean>(false);
    const [workFlowSteps, setWorkFlowSteps] = useState<WorkFlowStep[]>();

    const queryOptions = useProjectQueryOptions(featureFormRoles.viewForm);
    
    const [listWorkFlowSteps] = useLazyQuery<{workFlowSteps: IWorkFlowStep[]}>(LIST_FORM_WORKFLOW_STEPS);
    const [listWorkFlowStepNameDefs] = useLazyQuery<{stepNameDefs: WorkFlowStepNameDef[]}>(LIST_FORM_WORKFLOW_STEP_NAME_DEFS);

    useEffect(() => {
        if (Boolean(queryOptions)) {
            retrieveWorkFlowSteps(queryOptions!);
        }
    }, [queryOptions]);

    async function retrieveWorkFlowSteps(queryOptions: QueryHookOptions) {
        setWorkFlowStepsLoading(true);
        const workFlowStepPromise = getWorkFlowSteps(queryOptions);
        const workFlowStepNameDefsPromise = getWorkFlowStepNameDefs(queryOptions);

        Promise.all([workFlowStepPromise, workFlowStepNameDefsPromise]).then(([partialWorkFlowSteps, workFlowStepNameDefs]) => {
            if (Boolean(partialWorkFlowSteps) && Boolean(workFlowStepNameDefs)) {
                const workFlowSteps = buildWorkFlowSteps(partialWorkFlowSteps!, workFlowStepNameDefs!);

                setWorkFlowSteps(workFlowSteps);
                setWorkFlowStepsLoading(false);
            }
        });
    }

    async function getWorkFlowSteps(queryOptions: QueryHookOptions) { 
        const {data} = await listWorkFlowSteps(queryOptions);
        return data?.workFlowSteps;
    }

    async function getWorkFlowStepNameDefs(queryOptions: QueryHookOptions) {
        const {data} = await listWorkFlowStepNameDefs(queryOptions);
        return data?.stepNameDefs;
    }

    function buildWorkFlowSteps(partialWorkFlowSteps: IWorkFlowStep[], workFlowStepNameDefs: WorkFlowStepNameDef[]) {
        return partialWorkFlowSteps!.map((workFlowStep) => {
            const workFlowStepNameDef = workFlowStepNameDefs.find((stepNameDef) =>
                stepNameDef.stepDefinition === workFlowStep.stepDefinition && stepNameDef.workflowTemplateId === workFlowStep.workflowTemplateId);
            
            return new WorkFlowStep(workFlowStep, workFlowStepNameDef!.name);
        });
    }

    return {workFlowSteps, workFlowStepsLoading} as const;
}