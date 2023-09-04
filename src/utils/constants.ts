import { string } from "yup";
import { DecodedToken } from "../models/token";

export const routes = [
  {
    name: "Forms",
    path: "/base/forms",
  },
  //   {
  //     name:'Companies',
  //     path:'/base/companies'
  //  },
  {
    name: "Projects",
    path: "/base/projects",
  },
];

export const FeatureId = {
  RFI: 2,
  SUBMITTAL: 8,
};

export const features = {
  PROJECT: "PROJECT",
  USER: "USER",
  ROLE: "ROLE",
  COMPANY: "COMPANY",
  FORM: "FORM_TEMPLATE",
  FORMS: "FORMS",
  TASK: "SCHEDULE_RECIPE",
  RFI: "RFI",
  CUSTOMLIST: "CUSTOM_LIST",
  CALENDAR: "CALENDAR",
  MASTERPLAN: "MASTER_PLAN",
  PROJECTSETUP: "PROJECT_SETUP",
  BIM: "BIM",
  PLANCOMPONENT: "PLAN_COMPONENT",
  WORKFLOW: "WORKFLOW",
  DRAWINGS: "DRAWINGS",
  SPECIFICATIONS: "SPECIFICATIONS",
  MATERIAL_MASTER: "MATERIAL_MASTER",
  DMS: "DMS",
  DAILYLOG: "DAILYLOG",
  QUALITY_CONTROL: "QUALITY_CONTROL",
  DVA: "DVA",
};

// eslint-disable-next-line no-shadow
export enum InputType {
  TEXT = 1,
  LONGTEXT = 2,
  INTEGER = 3,
  TIMEPICKER = 4,
  DATEPICKER = 5,
  DATETIMEPICKER = 6,
  BOOLEAN = 7,
  LOCATION = 8,
  CUSTOMDROPDOWN = 9,
  CUSTOMNESTEDDROPDOWN = 10,
  COMMENTS = 11,
  MULTIVALUEUSER = 12,
  MULTIVALUECOMPANY = 13,
  ATTACHMENT = 14,
  SINGLEVALUEUSER = 15,
  SINGLEVALUECOMPANY = 16,
  LOCATIONTREE = 17,
  TABLE = 18,
  ASSETTYPES=23,
  SECTION=20,
  Object=22,
  LINKEDFORMS=21,
}

// eslint-disable-next-line no-shadow
export enum FieldType {
  DUE_DATE = "dueDate",
  STATUS = "status",
  CREATED_BY = "createdBy",
  CREATED_AT = "createdAt",
  UPDATED_BY = "updatedBy",
  UPDATED_AT = "updatedAt", //post MVP
  DELETED = "deleted", //post MVP
  COST_IMPACT = "costImpact",
  COST_IMPACT_COMMENTS = "costImpactComments", //post MVP
  SCHEDULE_IMPACT = "scheduleImpact",
  SCHEDULE_IMPACT_COMMENTS = "scheduleImpactComments", //post MVP
  COMPLETED_BY = "completedBy",
  COMPLETED_AT = "completedAt",
  PROJECT_AUTO_INCREMENT = "projectAutoIncrement", //post MVP
  COMMENT = "comment",
  VALUE_TIME = "valueTime",
  VALUE_INT = "valueInt",
  VALUE_STRING = "valueString",
  VALUE_DATE = "valueDate",
  VALUE_BOOL = "valueBool",
  FORMS_FOLLOWER = "formsFollower",
  SINGLE_VALUE_COMPANY = "Singlevalue Company",
  RESPONSIBLE_CONTRACTOR = "Responsible contractor",
  MULTI_VALUE_COMPANY = "Multivalue Company",
  COMPANY_LIST = "Company List",
  RFI_TYPE = "RFI Type",
  SINGLE_VALUE_USER = "Singlevalue User",
  MULTI_VALUE_USER = "Multivalue User",
  USER_LIST = "User List",
  ATTACHMENT = "Attachment",
  ASSIGNEE = "Assignee",
  CUSTOM_LIST = "Custom List",
  ATTACHMENT_COPY = "Attachment-copy(1)",
  BLOCKED_BY_COUNTER = "blockedByCounter",
}

export const nonpermittedFields = [
  InputType.COMMENTS,
  InputType.CUSTOMNESTEDDROPDOWN,
  InputType.LOCATION,
];

export const nonpermittedFieldsForFormTable = [
  InputType.COMMENTS,
  InputType.CUSTOMNESTEDDROPDOWN,
  InputType.LOCATION,
  InputType.TABLE,
];

// eslint-disable-next-line no-shadow
export enum FIXED_FIELDS {
  COST_IMPACT = "4f265770-b412-11eb-8529-0242ac130003",
  SCHEDULE_IMPACT = "8c4e0fee-b412-11eb-8529-0242ac130003",
  CREATED_BY = "406f4e12-a8c3-11eb-bcbc-0242ac130002",
  CREATED_AT = "4e3fa60e-a8c3-11eb-bcbc-0242ac130002",
  STATUS = "6d8a36b4-a8c3-11eb-bcbc-0242ac130002",
  SUBJECT = "dcfab0a6-a8c2-11eb-bcbc-0242ac130002",
  DUE_DATE = "33795f18-a8c3-11eb-bcbc-0242ac130002",
  PROJECT_AUTO_INCREMENT = "c8ddff9e-aa24-4a3b-be40-33967a28a6f6",
  ASSIGNEE = "23708b6e-a8c3-11eb-bcbc-0242ac130002",
  RESPONSE = "0b81f5f7-7919-4518-bff9-12cd700dfc2a",
  ASSET_TYPES="97bfb488-ea6c-4f24-998e-0fe45b8919a8",
}

export enum WHITELISTED_SORTABLE_HEADERS {
  DUE_DATE = "33795f18-a8c3-11eb-bcbc-0242ac130002",
  CREATED_BY = "406f4e12-a8c3-11eb-bcbc-0242ac130002",
  CREATED_ON = "4e3fa60e-a8c3-11eb-bcbc-0242ac130002",
  STATUS = "6d8a36b4-a8c3-11eb-bcbc-0242ac130002",
  COMPLETED_ON = "d170d12e-a8c3-11eb-bcbc-0242ac130002",
  COMPLETED_BY = "db3dd760-a8c3-11eb-bcbc-0242ac130002",
  COST_IMPACT = "4f265770-b412-11eb-8529-0242ac130003",
  SCHEDULE_IMPACT = "8c4e0fee-b412-11eb-8529-0242ac130003",
  PROJECT_AUTO_INCREMENT = "c8ddff9e-aa24-4a3b-be40-33967a28a6f6",
  UPDATED_ON = "3c08abf8-dca2-11eb-ba80-0242ac130004",
  UPDATED_BY = "42b5f816-dca2-11eb-ba80-0242ac130004",
}

export const hiddenViewFields = [
  FIXED_FIELDS.ASSIGNEE,
  FIXED_FIELDS.CREATED_BY,
  FIXED_FIELDS.DUE_DATE,
  FIXED_FIELDS.STATUS,
  FIXED_FIELDS.CREATED_AT,
];

export interface FieldAs {
  label: string;
  value: number;
}

export const FieldAsList: Array<FieldAs> = [
  {
    label: "Required",
    value: 1,
  },
  {
    label: "Not Required",
    value: 0,
  },
];

// export const featureID: any = {
//   RFI: 2
// }

// eslint-disable-next-line no-shadow
export enum ViewTab {
  Comments = "COMMENTS",
  Activity = "ACTIVITY",
}

export const nonPermittedFilterFields = [
  InputType.ATTACHMENT,
  InputType.COMMENTS,
  InputType.INTEGER,
  InputType.LOCATION,
  InputType.CUSTOMDROPDOWN,
  InputType.CUSTOMNESTEDDROPDOWN,
];

export enum FollowerTye {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  VIEW = "VIEW",
}

export enum Status {
  deactive = 1,
  invite = 2,
  active = 3,
  null = -1,
}

export enum FormOptionType {
  NONE = "None",
  MYRFI = "MYRFI",
  ASSIGNEdTOME = "Assigned to me",
  CREATEDBYME = "Created by me",
}

export enum LinkRelationship {
  BLOCKS = "BLOCKS",
  BLOCKED_BY = "BLOCKED_BY",
  RELATES_TO = "RELATES_TO",
}

export const relationships = [
  {
    label: "Blocks",
    value: LinkRelationship.BLOCKS,
  },
  {
    label: "Is Blocked by",
    value: LinkRelationship.BLOCKED_BY,
  },
  {
    label: "Relates to",
    value: LinkRelationship.RELATES_TO,
  },
];

export enum LinkType {
  VIEW = "VIEW",
  CREATE = "CREATE",
  UPDATE = "UPDATE",
}

export const emptyToken: DecodedToken = {
  "user-name": "",
  "user-id": "",
  "user-email": "",
  "tenant-id": "",
  "tenant-name": "",
  "tenant-company": "",
  "x-hasura-user-id": "",
  "x-hasura-tenant-id": "",
  "x-hasura-project-id": "",
  "x-hasura-allowed-company-ids": "",
  "x-hasura-project-role-id": "",
  "x-hasura-allowed-roles": [],
  "x-hasura-default-role": "",
  "x-hasura-allowed-create-ids": "",
  "x-hasura-allowed-update-ids": "",
  "x-hasura-allowed-view-ids": "",
  "x-hasura-allowed-delete-ids": "",
  type: "",
  exp: -1,
  iat: -1,
  tenants: [],
  "admin-user": false,
};

export const submitalsFields = [
  "112952aa-9a52-4a24-bc7a-9e92e7f20713",
  "b2f90a55-a1bd-4f9a-a4a9-173b38df3fc4",
  "a282eb95-745c-4170-b9b7-d44b131d43f9",
  "df5554c2-45f8-4970-be54-1a2eaa00a65f",
];

export const allowedFileFormats: string[] = [
  ".doc",
  ".docx",
  ".pdf",
  ".odt",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".txt",
  ".csv",
  ".jpg",
  ".jpeg",
  ".png",
  ".tiff",
  ".dwg",
  ".rec",
  ".mp4",
  ".mpeg",
  ".mov",
  ".flv",
  ".avi",
  ".mkv",
  ".rvt",
  ".ifc",
  ".vsf",
];

export const themes = [
  {
    label: "Theme-1",
    values: {
      "onx-A1": "#0D444B",
      "onx-A2": "#212121",
      "onx-A3": "#424242",
      "onx-A4": "#757575",
      "onx-A5": "#9E9E9E",
      "onx-A6": "#BDBDBD",
      "onx-A7": "#E0E0E0",
      "onx-A8": "#EEEEEE",
      "onx-A9": "#F5F5F5",
      "onx-A10": "#FAFAFA",
      "onx-success-light": "#B7E5C7",
      "onx-success-main": "#6DBC8D",
      "onx-success-dark": "#10554B",
      "onx-error-light": "#FFD7D7",
      "onx-error-main": "#b96464",
      "onx-error-dark": "#F85757",
      "onx-info-light": "#F7F8F8",
      "onx-info-main": "#4B4B4B",
      "onx-info-dark": "#101010",
      "onx-text-light": "#fff",
      "onx-text-main": "#BDBDBD",
      "onx-text-dark": "#212121",
      "onx-text-black": "#0D444B",
      "onx-text-error": "#ff0000",
      "onx-card-bs-base":
        "0px 2px 1px -1px rgba(180, 179, 189, 0.25), 2px 0px 1px rgba(180, 179, 189, 0.04), 0px 2px 8px rgba(180, 179, 189, 0.25)",
      "onx-card-bs-metallic":
        "0px 2px 1px -1px rgba(180, 179, 189, 0.25), 2px 0px 1px rgba(180, 179, 189, 0.04), 0px 2px 8px rgba(180, 179, 189, 0.25), inset 1px 2px 0px #FFFFFF",
      "onx-card-bs-hover":
        "0px 4px 4px rgba(180, 179, 189, 0.23), 2px 0px 1px rgba(180, 179, 189, 0.04), 0px 16px 26px rgba(180, 179, 189, 0.44)",
      "onx-btn-primary": "#0D444B",
      "onx-btn-secondary": "#F0F0F0",
      "onx-btn-disabled": "#F5F5F5",
      "onx-btn-primary-color": "rgba(255, 255, 255, 0.8)",
      "onx-btn-secondary-color": "#1F1F1F",
      "onx-btn-disabled-color": "#BDBDBD",
      "onx-linear-grad":
        "linear-gradient(to bottom, #2361a5, #1d5596, #174987, #113d78, #093269, #082b5d, #062451, #041d46, #06183b, #071230, #060a26, #00001c)",
    },
  },
  {
    label: "theme2",
    values: {
      "onx-A1": "#546E7A",
      "onx-A2": "#546E7A",
      "onx-A3": "#0dcf06",
      "onx-A4": "#546E7A",
      "onx-A5": "#4d79ff",
      "onx-A6": "#546E7A",
      "onx-A7": "#99b3ff",
      "onx-A8": "#b3c6ff",
      "onx-A9": "#ccd9ff",
      "onx-A10": "#FAFAFA",
      "onx-success-light": "#B7E5C7",
      "onx-success-main": "#6DBC8D",
      "onx-success-dark": "#10554B",
      "onx-error-light": "#FFD7D7",
      "onx-error-main": "#b96464",
      "onx-error-dark": "#F85757",
      "onx-info-light": "#F7F8F8",
      "onx-info-main": "#4B4B4B",
      "onx-info-dark": "#101010",
      "onx-text-light": "#fff",
      "onx-text-main": "#BDBDBD",
      "onx-text-dark": "#212121",
      "onx-text-black": "#000000",
      "onx-text-error": "#ff0000",
      "onx-card-bs-base":
        "0px 2px 1px -1px rgba(180, 179, 189, 0.25), 2px 0px 1px rgba(180, 179, 189, 0.04), 0px 2px 8px rgba(180, 179, 189, 0.25)",
      "onx-card-bs-metallic":
        "0px 2px 1px -1px rgba(180, 179, 189, 0.25), 2px 0px 1px rgba(180, 179, 189, 0.04), 0px 2px 8px rgba(180, 179, 189, 0.25), inset 1px 2px 0px #FFFFFF",
      "onx-card-bs-hover":
        "0px 4px 4px rgba(180, 179, 189, 0.23), 2px 0px 1px rgba(180, 179, 189, 0.04), 0px 16px 26px rgba(180, 179, 189, 0.44)",
      "onx-btn-primary": "#546E7A",
      "onx-btn-secondary": "#F0F0F0",
      "onx-btn-disabled": "#F5F5F5",
      "onx-btn-primary-color": "rgba(255, 255, 255, 0.8)",
      "onx-btn-secondary-color": "#1F1F1F",
      "onx-btn-disabled-color": "#BDBDBD",
      "onx-linear-grad":
        "linear-gradient(to top, #263238, #2e3d44, #374750, #3f535c, #485e69, #516873, #5a717d, #637b87, #6e8591, #798f9a, #859aa4, #90a4ae)",
    },
  },
  {
    label: "theme3",
    values: {
      "onx-A1": "#00897B",
      "onx-A2": "#0033cc",
      "onx-A3": "#009688",
      "onx-A4": "#26A69A",
      "onx-A5": "#4d79ff",
      "onx-A6": "#809fff",
      "onx-A7": "#99b3ff",
      "onx-A8": "#b3c6ff",
      "onx-A9": "#ccd9ff",
      "onx-A10": "#FAFAFA",
      "onx-success-light": "#B7E5C7",
      "onx-success-main": "#6DBC8D",
      "onx-success-dark": "#10554B",
      "onx-error-light": "#FFD7D7",
      "onx-error-main": "#b96464",
      "onx-error-dark": "#F85757",
      "onx-info-light": "#F7F8F8",
      "onx-info-main": "#4B4B4B",
      "onx-info-dark": "#101010",
      "onx-text-light": "#fff",
      "onx-text-main": "#BDBDBD",
      "onx-text-dark": "#212121",
      "onx-text-black": "#000000",
      "onx-text-error": "#ff0000",
      "onx-card-bs-base":
        "0px 2px 1px -1px rgba(180, 179, 189, 0.25), 2px 0px 1px rgba(180, 179, 189, 0.04), 0px 2px 8px rgba(180, 179, 189, 0.25)",
      "onx-card-bs-metallic":
        "0px 2px 1px -1px rgba(180, 179, 189, 0.25), 2px 0px 1px rgba(180, 179, 189, 0.04), 0px 2px 8px rgba(180, 179, 189, 0.25), inset 1px 2px 0px #FFFFFF",
      "onx-card-bs-hover":
        "0px 4px 4px rgba(180, 179, 189, 0.23), 2px 0px 1px rgba(180, 179, 189, 0.04), 0px 16px 26px rgba(180, 179, 189, 0.44)",
      "onx-btn-primary": "#00897B",
      "onx-btn-secondary": "#F0F0F0",
      "onx-btn-disabled": "#F5F5F5",
      "onx-btn-primary-color": "rgba(255, 255, 255, 0.8)",
      "onx-btn-secondary-color": "#1F1F1F",
      "onx-btn-disabled-color": "#BDBDBD",
      "onx-linear-grad":
        "linear-gradient(to top, #004d40, #01584a, #016355, #016e60, #01796b, #0c8274, #168b7e, #1e9487, #2c9c90, #38a599, #43ada3, #4db6ac)",
    },
  },
];
