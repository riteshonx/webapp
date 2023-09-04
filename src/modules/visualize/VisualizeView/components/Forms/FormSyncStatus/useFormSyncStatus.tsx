import { gql, QueryHookOptions, useLazyQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { featureFormRoles } from 'src/utils/role';

import { useProjectQueryOptions } from '../../../hooks/useQueryOptions';
import { FormSyncStatus } from './formSyncStatus';
import { IFormSyncStatus } from './IFormSyncStatus';

const LIST_FORM_SYNC_STATUSES = gql `
    query GetFormSyncStatus {
        formSyncStatuses: checklistSyncLog(
            distinct_on: featureId
            order_by: [{featureId: asc}, {id: desc}]
        ) {
            createdAt
            updatedAt
            externalTotal
            featureId
            id
            inProgress
            syncedTotal
        }
    }
`;

export function useFormSyncStatus() {
    const [formSyncStatus, setFormSyncStatus] = useState<FormSyncStatus[]>();
    const [formSyncStatusLoading, setFormSyncStatusLoading] = useState<boolean>(true);

    const queryOptions = useProjectQueryOptions(featureFormRoles.viewForm);
    const [retrieveFormSyncStatuses] = useLazyQuery<{formSyncStatuses: IFormSyncStatus[]}>(LIST_FORM_SYNC_STATUSES);

    useEffect(() => {
        if (Boolean(queryOptions)) {
            buildFormSyncStatus(queryOptions!);
        }
    }, [queryOptions]);

    async function buildFormSyncStatus(queryOptions: QueryHookOptions) {
        const {data} = (await retrieveFormSyncStatuses(queryOptions));

        if (Boolean(data) && Boolean(data!.formSyncStatuses) && data!.formSyncStatuses.length > 0) {
            const {formSyncStatuses} = data!;
            setFormSyncStatus(formSyncStatuses.map((status) => new FormSyncStatus(status)));
        }
        
        setFormSyncStatusLoading(false);
    }

    return {formSyncStatus, formSyncStatusLoading};
}