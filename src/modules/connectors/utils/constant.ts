export const AGAVE_AUTH = `${process.env.REACT_APP_CONNECTOR_URL}/3rdparty/token?type=link`;
export const AGAVE_ACCOUNT_TOKEN = `${process.env.REACT_APP_CONNECTOR_URL}/3rdparty/token?type=account`;
export const AGAVE_PROJECTS = `${process.env.REACT_APP_CONNECTOR_URL}/3rdparty/project`;
export const AGAVE_COMPANIES = `${process.env.REACT_APP_CONNECTOR_URL}/3rdparty/companies`;
export const AGAVE_USERS = `${process.env.REACT_APP_CONNECTOR_URL}/3rdparty/users`;
export const CONNECT_PROJECT = `${process.env.REACT_APP_CONNECTOR_URL}/connect`;

export const CONNECTOR_TOKEN = `${process.env.REACT_APP_CONNECTOR_URL}/token`;
export const RFI_CSV_IMPORT = `${process.env.REACT_APP_CONNECTOR_URL}/csv`;
export const EXCHANGE_URL = `${process.env.REACT_APP_AUTHENTICATION_URL}V1/user/login/exchange`;
export const FILE_UPLOAD_INFO = `${process.env.REACT_APP_AUTHENTICATION_URL}V1/S3/uploadFilesInfo`;
export const Auth_URL = process.env.REACT_APP_AUTHENTICATION_URL;
export const REACT_APP_GRAPHQL_URL = process.env.REACT_APP_GRAPHQL_URL;
export const SERVICE_ORCHESTRATION = `${process.env.REACT_APP_CONNECTOR_URL}/3rdparty/serviceOrchestration`
export const PROJECT_FEATURE = [
  'MASTER_PLAN',
  'BIM',
  'PLAN_COMPONENT',
  'DRAWINGS',
  'SPECIFICATIONS',
  'FORMS',
  'DMS',
];

export const CONNECTOR_FEATURE = ['PROJECT', 'USER'];

export const CONNECTOR_ROLE = {
  ADMIN: 'connectorsAdmin',
};

export const CONNECTOR_API_KEY = `3b4827f1-1045-4d9e-ac96-f30ab41b1cbc`;

export const formRoles = {
  viewFormTemplate: 'viewFormTemplate',
};
