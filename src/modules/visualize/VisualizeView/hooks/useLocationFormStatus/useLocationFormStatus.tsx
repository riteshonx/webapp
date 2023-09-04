import { useEffect, useState } from 'react';

import { FormTypeTask } from '../../components/Forms/groupingWhiteList/FormTypeTask';
import { LocationFormStatusFilters } from '../../components/LocationTreeFormStatus/LocationFormStatusFilters';
import { FormStatus } from '../../models/formStatus';
import { FormType } from '../../models/formType';
import { useDataMode } from '../../utils/DataMode';
import { FormStatusStore } from './formStatus.store';
import { Form } from '../../models/form';

export type SameAndUniqueFormStatusTaskCollectionMappedByLocation = {sameTask: Map<string, FormStatus[]>[], uniqueTask: Map<string, FormStatus[]>}

export const useLocationFormStatus = function (forms: Form[] | undefined, activeFormTypes: FormType[], featureTypeTasks: FormTypeTask[], statusFilter: LocationFormStatusFilters[], activeFormTemplate: FormType[], activeAssigneeToFormTypes: string[], activeIssueTypes: string[]) {
    const [taskFormStatuses, setTaskFormStatuses] = useState<SameAndUniqueFormStatusTaskCollectionMappedByLocation>();
    const [formStatuses, setFormStatuses] = useState<Map<string, FormStatus>>(new Map([]));

    const [formStatusStore, setFormStatusStore] = useState<FormStatusStore>();

    const {dataMode} = useDataMode();

    useEffect(() => {
        const formStatusStore = new FormStatusStore(forms);
        setFormStatusStore(formStatusStore);
    }, [forms]);

    useEffect(() => {
        if (Boolean(formStatusStore)) {
            retrieveFormStatuses(activeFormTypes, featureTypeTasks, formStatusStore!, activeFormTemplate, activeAssigneeToFormTypes, activeIssueTypes);
        }
    }, [activeFormTypes, activeFormTemplate, featureTypeTasks, activeAssigneeToFormTypes, activeIssueTypes]);

    useEffect(() => {
        if (Boolean(taskFormStatuses) && Boolean(statusFilter)) {
            buildFormStatuses(taskFormStatuses);
        }
    }, [taskFormStatuses, statusFilter]);

    async function retrieveFormStatuses(activeFormTypes: FormType[], featureTypeTasks: FormTypeTask[], formStatusStore: FormStatusStore, activeFormTemplate: FormType[], activeAssigneeToFormTypes: string[], activeIssueTypes: string[]) {
        let formStatusesData: SameAndUniqueFormStatusTaskCollectionMappedByLocation | undefined;

        if (dataMode === 'BIM360') {
            formStatusesData = await retrieveBimStatuses(activeFormTypes, featureTypeTasks, activeFormTemplate, formStatusStore);
        } else {
            formStatusesData = await retrieveNormalFormStatuses(activeFormTypes, activeFormTemplate, activeAssigneeToFormTypes, activeIssueTypes, formStatusStore);
        }

        setTaskFormStatuses(formStatusesData);
    }

    async function retrieveBimStatuses(activeFormTypes: FormType[], featureTypeTasks: FormTypeTask[], activeFormTemplate: FormType[], formStatusStore: FormStatusStore): Promise<SameAndUniqueFormStatusTaskCollectionMappedByLocation | undefined> {       
        const groupsOfActiveFeatureTypesUnderSameTasks: FormType[][] = [];
        const groupsOfActiveFeatureTypesUnderDifferentTasks: FormType[][] = [];
        
        const formTypesGroupedByTasks = featureTypeTasks.map((task) => task.getGroupFromFeatureTypes(activeFormTypes));

        formTypesGroupedByTasks.forEach((formTypesGroupedByTask) => {
            if (formTypesGroupedByTask.length > 1) {
                groupsOfActiveFeatureTypesUnderSameTasks.push(formTypesGroupedByTask);
            } 

            if (formTypesGroupedByTask.length === 1) {
                groupsOfActiveFeatureTypesUnderDifferentTasks.push(formTypesGroupedByTask);
            }
        });

        const sameJobFormStatusPromises = groupsOfActiveFeatureTypesUnderSameTasks.map((formTypes) => formStatusStore!.listFormStatusesByLocation(formTypes, activeFormTemplate, [], [], dataMode));
        const uniqueJobsActiveTypes = groupsOfActiveFeatureTypesUnderDifferentTasks.flat();

        const uniqueFormStatuses = await formStatusStore!.listFormStatusesByLocation(uniqueJobsActiveTypes, activeFormTemplate, [], [], dataMode);
        const sameJobFormStatuses = await Promise.all(sameJobFormStatusPromises);

        return {sameTask: sameJobFormStatuses, uniqueTask: uniqueFormStatuses};
    }

    async function retrieveNormalFormStatuses(activeFormTypes: FormType[], activeFormTemplate: FormType[], activeAssigneeToFormTypes: string[], activeIssueTypes: string[], formStatusStore: FormStatusStore) {
        // const formStatuses = await formStatusStore?.listFormStatusesByLocation(activeFormTypes, activeFormTemplate, activeAssigneeToFormTypes, dataMode);

        // if (Boolean(formStatuses)) {
        //     return {sameTask: [], uniqueTask: formStatuses!};
        // }

        if (!activeFormTypes) return undefined; 

        const groupsOfActiveFeatureTypesUnderSameTasks: FormType[][] = [];
        const groupsOfActiveFeatureTypesUnderDifferentTasks: FormType[][] = [];

        const formTypesGroupedByTasks = featureTypeTasks.map((task) => task.getGroupFromFeatureTypes(activeFormTypes));

        formTypesGroupedByTasks.forEach((formTypesGroupedByTask) => {
            if (formTypesGroupedByTask.length > 1) {
                groupsOfActiveFeatureTypesUnderSameTasks.push(formTypesGroupedByTask);
            } 

            if (formTypesGroupedByTask.length === 1) {
                groupsOfActiveFeatureTypesUnderDifferentTasks.push(formTypesGroupedByTask);
            }
        });

        const sameJobFormStatusPromises = groupsOfActiveFeatureTypesUnderSameTasks.map((formTypes) => formStatusStore!.listFormStatusesByLocation(formTypes, activeFormTemplate, [], [], dataMode));
        const uniqueJobsActiveTypes = groupsOfActiveFeatureTypesUnderDifferentTasks.flat();

        const uniqueFormStatuses = await formStatusStore!.listFormStatusesByLocation(uniqueJobsActiveTypes, activeFormTemplate, activeAssigneeToFormTypes, activeIssueTypes, dataMode);
        const sameJobFormStatuses = await Promise.all(sameJobFormStatusPromises);

        return {sameTask: sameJobFormStatuses, uniqueTask: uniqueFormStatuses};
    }

    function buildFormStatuses(formStatusDataMappedByLocation?: SameAndUniqueFormStatusTaskCollectionMappedByLocation) {
        // Sum Results By Location Only Counting Same Jobs As One
        const summedFormStatusByLocation = new Map<string, FormStatus>([]);

        // Add The Unique Jobs Up
        formStatusDataMappedByLocation?.uniqueTask.forEach((formStatusesByLocation, locationId) => {
            if (!summedFormStatusByLocation.has(locationId)) {
                summedFormStatusByLocation.set(locationId, {locationId, openForms: 0, closedForms: 0, openIssueCount: 0, notStartedForms: 0, readyFormsCount: 0});
            }

            formStatusesByLocation.forEach((formStatus) => {
                if (dataMode === "Checklist") {
                    if (formStatus.closedForms > 0) {
                        summedFormStatusByLocation.get(locationId)!.closedForms += 1;
                    } 
                    
                    if (formStatus.closedForms === 0 && formStatus.openForms > 0) {
                        summedFormStatusByLocation.get(locationId)!.openForms += 1;
                    }
                } else {
                    summedFormStatusByLocation.get(locationId)!.closedForms += formStatus.closedForms;
                    summedFormStatusByLocation.get(locationId)!.openForms += formStatus.openForms;
                }

                summedFormStatusByLocation.get(locationId)!.readyFormsCount += formStatus.readyFormsCount;
                summedFormStatusByLocation.get(locationId)!.notStartedForms += formStatus.notStartedForms;
                summedFormStatusByLocation.get(locationId)!.openIssueCount += formStatus.openIssueCount || 0;
            });
        });

        // Add The Same Jobs Up
        formStatusDataMappedByLocation?.sameTask.forEach((formStatusesByLocationMap) => {
            formStatusesByLocationMap.forEach((formStatusesByLocation, locationId) => {
                if (!summedFormStatusByLocation.has(locationId)) {
                    summedFormStatusByLocation.set(locationId, {locationId, openForms: 0, closedForms: 0, openIssueCount: 0, notStartedForms: 0, readyFormsCount: 0});
                }
    
                // No Matter How Many Are Actually On This Location, If They Are In This List They All Count As One Because They Are The Same Task.

                const hasOpen = formStatusesByLocation.some((formStatus) => formStatus.openForms > 0);
                const hasClosed = formStatusesByLocation.some((formStatus) => formStatus.closedForms > 0);
                const hasNotstarted = formStatusesByLocation.some((formStatus) => formStatus.notStartedForms > 0);

                if (hasNotstarted) {
                    summedFormStatusByLocation.get(locationId)!.notStartedForms += 1;
                }

                if (hasClosed) {
                    summedFormStatusByLocation.get(locationId)!.closedForms += 1;
                    return;
                }

                if (hasOpen) {
                    summedFormStatusByLocation.get(locationId)!.openForms += 1;
                }
            })
        });

        setFormStatuses(summedFormStatusByLocation);
    }

    return formStatuses;
}