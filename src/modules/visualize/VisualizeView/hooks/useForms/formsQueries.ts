import { gql } from '@apollo/client';

import { Bim360Statuses, FormStatuses } from '../../models/form/formStatuses';
import { IUser } from '../../models/form/user';

export interface IFormMeta {
    formId: number;
    formTypeInstanceId: number;
    featureId: number;
    status: {value: FormStatuses};
    statusId: 1 | 2 | 3 | 4;
    dueDate: string;
    createdAt: string;
    updatedAt: string;
    completedAt: string;
}
export const LIST_FORMS = gql `
    query ListForms {
        forms(order_by: {featureId: asc}) {
            formId: id,
            formTypeInstanceId: projectAutoIncrement,
            featureId,
            dueDate,
            status: formStatus {
                value: status
            },
            statusId: status,
            createdAt,
            updatedAt,
            completedAt,
        }
    }
`;

export interface FormAssignee {
    formId: number;
    user: IUser;
}
export const LIST_FORMS_ASSIGNEES = gql `
    query ListFormsAssignees {
        assignees: formsUserList(where: {formTemplateFieldData: {caption: {_eq: "Assignee"}}}) {
            formId: formInstanceId				
            user {
                firstName
                lastName
            }
        },
    }
`;

export interface FormSubject {
    formId: number;
    value: string;
}
export const LIST_FORM_SUBJECTS = gql `
    query ListFormSubject {
        subjects: formsData(where: {formTemplateFieldData: {caption: {_eq: "Subject"}}}) {
            formId: formInstanceId
            value: valueString
        }
    }
`;

export interface FormSourceData {
    formId: number;
    value: string;
    valueNumber: number;
    valueDate: string;
    valueTime: string;
    caption: string;
}

export const LIST_FORM_SOURCE_DATA = gql `
query ListFormSourceData {
    sourceData: formsData(
      where: {formTemplateFieldData: {caption: {_in: ["Assigned To", "Source Status", "Assignee Type", "Description","Template Name", "Template Id", "Checklist No" , "Completed on", "Source Url", "Issue Number", "Issue Type", "Issue Sub Type", "Source CreatedBy", "Source UpdatedBy"]}}}
    ) {
      formId: formInstanceId
      value: valueString
      valueNumber: valueInt
      valueDate
      valueTime
      caption
    }
  }    
`;

export interface FormLocation {
    locationValue: string[];
    locationReferenceId: string;
    formLocationValue: {
        nodeName: string;
        id: string;
    };
    form : {
        id: number
    };
}
export const LIST_FORM_LOCATIONS = gql `
    query ListFormLocations {
        locations: formsLocationList {
            locationReferenceId
            locationValue
            form {
              id
            }
            formLocationValue {
              nodeName
              id
            }
        }
    }
`;

export interface FormUser {
    formId: number;
    createdByUser?: IUser;
    updatedByUser?: IUser;
    completedByUser?: IUser;
}
export const LIST_FORM_CREATED_BY_USER = gql `
    query ListFormCreatedByUser {
        createdByUsers: forms {
            formId: id,
            createdByUser {
                firstName,
                lastName,
            },
        }
    }
`;

export const LIST_FORM_UPDATED_BY_USER = gql `
    query ListFormUpdatedByUser {
        updatedByUsers: forms {
            formId: id,
            updatedByUser {
                firstName,
                lastName,
            },
        }
    }
`;

export const LIST_FORM_COMPLETED_BY_USER = gql `
    query ListFormCompletedByUser {
        completedByUsers: forms {
            formId: id,
            completedByUser {
                firstName,
                lastName,
            },
        }
    }
`;

export interface FormTemplate {
    formId: number;
    formTemplate: {
        formTemplate: {
            projectFeature: {
                featureName: string
            }
        }
    }
}
export const LIST_FORM_TEMPLATES = gql `
    query ListFormFeatureName {
        formTemplates: forms {
            formId: id,
            formTemplate: formTemplateVersion {
                formTemplate {
                    projectFeature {
                        featureName: feature,
                    },
                },
            },
        }
    }
`;

// TODO - This is data specific to BIM360. Ideally in the end this data is converted to exist only in the existing form system and the following will
// not be needed.
export interface FormBim360Data {
    formId: number;
    fieldName: {
        caption: FormBim360DataNames;
    }
    valueString: string;
    valueTime: string;
    valueDate: string;
    valueBool: boolean;
    valueInt: number;
    valuePoint: number;
}

export enum FormBim360DataNames {
    Bim360TemplateId = 'bim_360_template_id',
    Bim360ChecklistId = 'bim360_checklist_id',
    Bim360TemplateName = 'bim360_template_name',
    Bim360Id = 'bim360_id',
    Bim360SourceUrl = 'bim360_source_url',
    LastBim360SyncAttempted = 'last_bim360_sync_attempted',
    LastBim360SyncSuccessful = 'last_bim360_sync_successful',
    Bim360ChecklistType = 'bim360_checklist_type',
    Bim360Description = 'bim360_description',
    Bim360AssignedToCompany = 'bim_360_assigned_to_company',
    Bim360AssignedToName = 'bim_360_assigned_to_name',
}

export const LIST_FORM_BIM_DATA = gql `
    query ListFormBimData {
        formsData {
            fieldName: formTemplateFieldData {
                caption
            }
            formId: formInstanceId
            valueString
            valueTime
            valueDate
            valueBool
            valueInt
            valuePoint
        }
    }
`;

export interface FormBimStatusData {
    formId: number;
    formStatusValue: {
        status: Bim360Statuses;
    }
}

export const LIST_FORM_BIM_STATUS = gql `
    query findFormList {
        formStatusList: formsConfigList {
            formId: formInstanceId
            formStatusValue: configurationValue {
                status: nodeName
            }
        }
    }
`;