import { QueryHookOptions, QueryResult, useLazyQuery } from '@apollo/client';
import { useEffect, useRef, useState } from 'react';
import { featureFormRoles } from 'src/utils/role';

import { useProjectQueryOptions } from '../useQueryOptions';
import { FormMeta } from './formMeta';
import {
    FormAssignee,
    FormLocation,
    FormSubject,
    FormTemplate,
    FormUser,
    IFormMeta,
    FormSourceData,
    LIST_FORM_COMPLETED_BY_USER,
    LIST_FORM_CREATED_BY_USER,
    LIST_FORM_LOCATIONS,
    LIST_FORM_SUBJECTS,
    LIST_FORM_TEMPLATES,
    LIST_FORM_UPDATED_BY_USER,
    LIST_FORMS,
    LIST_FORMS_ASSIGNEES,
    LIST_FORM_SOURCE_DATA,
} from './formsQueries';
import { ILocation } from '../../models/form/location';
import { User } from '../../models/form/user';

export function useFormData() {
    const queryOptions = useProjectQueryOptions(featureFormRoles.viewForm);

    const [formsData, setFormsData] = useState<{forms: FormMeta[]}>();
    const [loading, setLoading] = useState<boolean>(false);

    const [listForms] = useLazyQuery<{forms: IFormMeta[]}>(LIST_FORMS);
    const [listAssignees] = useLazyQuery<{assignees: FormAssignee[]}>(LIST_FORMS_ASSIGNEES);
    const [listSubjects] = useLazyQuery<{subjects: FormSubject[]}>(LIST_FORM_SUBJECTS);
    const [listFormLocations] = useLazyQuery<{locations: FormLocation[]}>(LIST_FORM_LOCATIONS);
    const [listFormCreatedByUsers] = useLazyQuery<{createdByUsers: FormUser[]}>(LIST_FORM_CREATED_BY_USER);
    const [listFormUpdatedByUsers] = useLazyQuery<{updatedByUsers: FormUser[]}>(LIST_FORM_UPDATED_BY_USER);
    const [listFormCompletedByUsers] = useLazyQuery<{completedByUsers: FormUser[]}>(LIST_FORM_COMPLETED_BY_USER);
    const [listFormTemplates] = useLazyQuery<{formTemplates: FormTemplate[]}>(LIST_FORM_TEMPLATES);
    const [listSourceData] = useLazyQuery<{sourceData: FormSourceData[]}>(LIST_FORM_SOURCE_DATA);
    

    const formMap = useRef<Map<number, FormMeta>>(new Map([]));

    useEffect(() => {
        if (Boolean(queryOptions)) {
            setLoading(true);
            buildForms(queryOptions!);
        }
    }, [queryOptions]);

    async function buildForms(queryOptions: QueryHookOptions) {
        const formsPromise = listForms(queryOptions);

        const assigneesPromise = listAssignees(queryOptions);
        const subjectsPromise = listSubjects(queryOptions);
        const locationsPromise = listFormLocations(queryOptions);
        const createdByUsersPromise = listFormCreatedByUsers(queryOptions);
        const updatedByUsersPromise = listFormUpdatedByUsers(queryOptions);
        const completedByUsersPromise = listFormCompletedByUsers(queryOptions);
        const formTemplatesPromise = listFormTemplates(queryOptions);
        const sourceDataPromise = listSourceData(queryOptions)

        const {forms: formMetas} = (await formsPromise).data!;
        addFormMetas(formMetas);
        
        assigneesPromise.then(({data}) => addAssignees(data?.assignees));
        subjectsPromise.then(({data}) => addSubjects(data?.subjects));
        locationsPromise.then(({data}) => addLocations(data?.locations));
        createdByUsersPromise.then(({data}) => addCreatedByUsers(data?.createdByUsers));
        updatedByUsersPromise.then(({data}) => addUpdatedByUsers(data?.updatedByUsers));
        completedByUsersPromise.then(({data}) => addCompletedByUsers(data?.completedByUsers))
        formTemplatesPromise.then(({data}) => addFormTemplates(data?.formTemplates));
        sourceDataPromise.then(({data}) => addSourceData(data?.sourceData));

        const promises: Promise<QueryResult>[] = [assigneesPromise, subjectsPromise, locationsPromise, createdByUsersPromise, updatedByUsersPromise, completedByUsersPromise, formTemplatesPromise, sourceDataPromise];

        Promise.all(promises).then(() => {
            setFormsData({forms: Array.from(formMap.current.values())});
            setLoading(false);
        });
    }

    function addFormMetas(formMetas: IFormMeta[] = []) {
        formMetas.forEach((formMeta) => {
            formMap.current.set(formMeta.formId, new FormMeta(formMeta));
        });
    }

    function addAssignees(assignees: FormAssignee[] = []) {
        assignees.forEach((assignee) => {
            const formMeta = formMap.current.get(assignee.formId);
            formMeta?.addAssignee(assignee.user);
        });
    }

    function addSubjects(subjects: FormSubject[] = []) {
        subjects.forEach((subject) => {
            const formMeta = formMap.current.get(subject.formId);
            formMeta?.addSubject(subject.value);
        });
    }

    function addLocations(locations: FormLocation[] = []) {
        locations.forEach((location) => {
            const formMeta = formMap.current.get(location.form.id);
            if (Boolean(formMeta)) {
                const isLoctionExist = formMeta!.locations.find((formLocation: ILocation) => formLocation.locationReferenceId ===  location.locationReferenceId)
                !isLoctionExist && formMeta!.locations.push(location);
            }
        });
    }

    function addCreatedByUsers(createdByUsers: FormUser[] = []) {
        createdByUsers.forEach((createdByUser) => {
            const formMeta = formMap.current.get(createdByUser.formId);

            if (Boolean(formMeta)) {
                formMeta!.createdByUser = createdByUser.createdByUser;
            }
        });
    }

    function addUpdatedByUsers(updatedByUsers: FormUser[] = []) {
        updatedByUsers.forEach((updatedByUser) => {
            const formMeta = formMap.current.get(updatedByUser.formId);

            if (Boolean(formMeta)) {
                formMeta!.updatedByUser = updatedByUser.updatedByUser;
            }
        });
    }

    function addCompletedByUsers(completedByUsers: FormUser[] = []) {
        completedByUsers.forEach((completedByUser) => {
            const formMeta = formMap.current.get(completedByUser.formId);

            if (Boolean(formMeta)) {
                formMeta!.completedByUser = completedByUser.completedByUser;
            }
        });
    }

    function addFormTemplates(formTemplates: FormTemplate[] = []) {
        formTemplates.forEach((formTemplate) => {
            const formMeta = formMap.current.get(formTemplate.formId);
            if (Boolean(formMeta)) {
                formMeta!.formTemplate = formTemplate.formTemplate;
            }
        });
    }

    function addSourceData(formsSourceDatas: FormSourceData[] = []) {
        formsSourceDatas.forEach((formSourceData) => {
            const form = formMap.current.get(formSourceData.formId)!;

            if (Boolean(form)) {
                switch(formSourceData.caption) {
                    case "Source Status": form.sourceStatus = formSourceData.value;
                        break;
                    case "Assigned To": form.sourceAssignees = formSourceData.value;
                        break;
                    case "Assignee Type": form.sourceAssigneType = formSourceData.value;
                        break;
                    case "Description": form.sourceDescription = formSourceData.value;
                        break;
                    case "Template Id": form.sourceTemplateId = formSourceData?.valueNumber;
                        break;
                    case "Template Name": form.sourceTemplateName = formSourceData.value;
                        break;
                    case "Checklist No": form.sourceId = formSourceData.valueNumber;
                        break;
                    case "Completed on": form.sourceCompletedon = formSourceData.valueDate + ' ' + formSourceData.valueTime;
                        break;
                    case "Source Url": form.sourceUrl = formSourceData.value;
                        break;
                    case "Issue Number": form.sourceId = formSourceData.valueNumber;
                        break;
                    case "Issue Type": form.sourceType = formSourceData.value;
                        break;
                    case "Issue Sub Type": form.sourceSubType = formSourceData.value;
                        break;
                    case "Source CreatedBy": form.createdByUser = new User({firstName: formSourceData.value, lastName: ""});
                        break;
                    case "Source UpdatedBy": form.updatedByUser = new User({firstName: formSourceData.value, lastName: ""});
                        break;
                }
            }
        });
    }

    return {formsData, loading} as const;
}