export enum ResponseMessage {
  notRegistered = "Email not registered",
  signedUp = "Email already exists/signed up",
  bulkEmailRegisterSuccess = "Email-Id(s) registered successfully",
}

export enum ResponsStatusCode {
  UNIQUEEMAIL = "UNIQUE_EMAIL_VALIDATION",
  ALREADYEXIST = "ALREADY_ACTIVE_USER",
  UNREGISTERED = "UNREGISTERED",
  PASSWORDVALIDATION = "PASSWORD_VALIDATION",
  EMAILVALIDATION = "EMAILVALIDATION",
  SIGNUPINCOMPLETE = "SIGNUP_INCOMPLETE",
  INACTIVEUSER = "INACTIVE_USER",
  INVALIDCREDENTIAL = "INVALID_CREDENTIALS",
}

export const ResponseCode: any = {
  SUCCESS: {
    KEY: "SUCCESS",
    DESCRIPTION: "Success",
  },
  UNIQUE_EMAIL_VALIDATION: {
    KEY: "UNIQUE_EMAIL_VALIDATION",
    DESCRIPTION: "Email already exists/signed up",
  },
  SUCCESSFUL_EMAIL_REGISTRATION: {
    KEY: "SUCCESSFUL_EMAIL_REGISTRATION",
    DESCRIPTION: "Email-Id(s) registered successfully",
  },
  SUCCESSFUL_SIGNUP: {
    KEY: "SUCCESSFUL_SIGNUP",
    DESCRIPTION: "Signup complete",
  },
  UNREGISTERED: {
    KEY: "UNREGISTERED",
    DESCRIPTION: "Email-Id(s) not registered",
  },
  TENANT_NOT_REGISTERED: {
    KEY: "TENANT_NOT_REGISTERED",
    DESCRIPTION: "Tenant not registered",
  },
  INVALID_CREDENTIALS: {
    KEY: "INVALID_CREDENTIALS",
    DESCRIPTION: "Invalid Credentials",
  },
  TOKEN_NEEDED: {
    KEY: "TOKEN_NEEDED",
    DESCRIPTION: "Token missing or invalid",
  },
  INVALID_TOKEN: {
    KEY: "INVALID_TOKEN",
    DESCRIPTION: "Invalid Token",
  },
  SUCCESSFUL_FORGET_PASSWORD: {
    KEY: "SUCCESSFUL_FORGET_PASSWORD",
    DESCRIPTION:
      "Reset link has been sent successfully, please check your Inbox!",
  },
  SUCCESSFUL_RESET_PASSWORD: {
    KEY: "SUCCESSFUL_RESET_PASSWORD",
    DESCRIPTION: "Password has been updated successfully",
  },
  SUCCESSFUL_USER_UPDATE: {
    KEY: "SUCCESSFUL_USER_UPDATE",
    DESCRIPTION: "User details updated successfully",
  },
  SUCCESSFUL_EMAIL_TRIGGER: {
    KEY: "SUCCESSFUL_EMAIL_TRIGGER",
    DESCRIPTION: "Email has been sent successfully",
  },
  LIMIT_TENANT_CREATION: {
    KEY: "LIMIT_TENANT_CREATION",
    DESCRIPTION: "User already owns a tenant",
  },
  INVALID_EMAIL_IN_SES: {
    KEY: "INVALID_EMAIL_IN_SES",
    DESCRIPTION: "Email is not registered with SES",
  },
  PASSWORD_VALIDATION: {
    KEY: "PASSWORD_VALIDATION",
    DESCRIPTION:
      "Passwords must be 8 to 12 characters long and must include at least 1 number",
  },
  REQUIRED_EMAIL_VALIDATION: {
    KEY: "REQUIRED_EMAIL_VALIDATION",
    DESCRIPTION: "Email is required",
  },
  INVALID_TENANT_ID_VALIDATION: {
    KEY: "INVALID_TENANT_ID_VALIDATION",
    DESCRIPTION: "Tenant must be a number",
  },
  REQUIRED_PASSWORD_VALIDATION: {
    KEY: "REQUIRED_PASSWORD_VALIDATION",
    DESCRIPTION: "Password is required",
  },
  INVALID_EMAIL_VALIDATION: {
    KEY: "INVALID_EMAIL_VALIDATION",
    DESCRIPTION: "Invalid email id",
  },
  ALREADY_ACTIVE_USER: {
    KEY: "ALREADY_ACTIVE_USER",
    DESCRIPTION: "User is already activated",
  },
  COMPANY_REQUEST_VALIDATION: {
    KEY: "COMPANY_REQUEST_VALIDATION",
    DESCRIPTION: "Company is required",
  },
  TENANT_REQUEST_VALIDATION: {
    KEY: "TENANT_REQUEST_VALIDATION",
    DESCRIPTION: "Tenant is required",
  },
  SIGNUP_INCOMPLETE: {
    KEY: "SIGNUP_INCOMPLETE",
    DESCRIPTION: "Sign Up is Incomplete",
  },
  LOGIN_REQUEST_VALIDATION: {
    KEY: "LOGIN_REQUEST_VALIDATION",
    DESCRIPTION: "Cannot generate token without completing signup",
  },
  INVALID_USER: {
    KEY: "INVALID_USER",
    DESCRIPTION: "User(s) does not exist",
  },
  TOKEN_NOT_REGISTERED_TO_TENANT: {
    KEY: "TOKEN_NOT_REGISTERED_TO_TENANT",
    DESCRIPTION: "Token not authorized to take action on this tenant",
  },
  INVALID_ROLE: {
    KEY: "INVALID_ROLE",
    DESCRIPTION: "Role(s) does not exist",
  },
  SUCCESSFUL_ASSOCIATION_DELETION: {
    KEY: "SUCCESSFUL_ASSOCIATION_DELETION",
    DESCRIPTION: "Association(s) deleted successfully",
  },
  USER_DELETED_VALIDATION: {
    KEY: "USER_DELETED_VALIDATION",
    DESCRIPTION: "User is deleted/deactivated",
  },
  INVALID_TENANT_USER_ASSOCIATION: {
    KEY: "INVALID_TENANT_USER_ASSOCIATION",
    DESCRIPTION: "User does not belong to the tenant",
  },
  INVALID_FEATURE_PERMISSION: {
    KEY: "INVALID_FEATURE_PERMISSION",
    DESCRIPTION: "Invalid feature",
  },
  FAILED_TO_INSERT_ROLE: {
    KEY: "FAILED_TO_INSERT_ROLE",
    DESCRIPTION: "Failed to insert role",
  },
  INVALID_INPUT: {
    KEY: "INVALID_INPUT",
    DESCRIPTION: "One or more input parameters passed are incorrect",
  },
  INACTIVE_USER: {
    KEY: "INACTIVE_USER",
    DESCRIPTION: "User is not a active user",
  },
  TENANT_ROLE_EXISTS: {
    KEY: "TENANT_ROLE_EXISTS",
    DESCRIPTION: "Tenant role already exists",
  },
  PROJECT_ROLE_EXISTS: {
    KEY: "PROJECT_ROLE_EXISTS",
    DESCRIPTION: "Project role already exists",
  },
  EMPTY_EMAIL_VALIDATION: {
    KEY: "EMPTY_EMAIL_VALIDATION",
    DESCRIPTION: "Email is not allowed to be empty",
  },
  EMPTY_PASSWORD_VALIDATION: {
    KEY: "EMPTY_PASSWORD_VALIDATION",
    DESCRIPTION: "Password is not allowed to be empty",
  },
  REQUIRED_FIRST_NAME_VALIDATION: {
    KEY: "REQUIRED_FIRST_NAME_VALIDATION",
    DESCRIPTION: "FirstName is required",
  },
  INVALID_FIRST_NAME_VALIDATION: {
    KEY: "INVALID_FIRST_NAME_VALIDATION",
    DESCRIPTION: "First Name must be string",
  },
  EMPTY_FIRST_NAME_VALIDATION: {
    KEY: "EMPTY_FIRST_NAME_VALIDATION",
    DESCRIPTION: "First Name is not allowed to be empty",
  },
  REQUIRED_LAST_NAME_VALIDATION: {
    KEY: "REQUIRED_LAST_NAME_VALIDATION",
    DESCRIPTION: "Last Name is required",
  },
  INVALID_LAST_NAME_VALIDATION: {
    KEY: "INVALID_LAST_NAME_VALIDATION",
    DESCRIPTION: "Last Name must be string",
  },
  EMPTY_LAST_NAME_VALIDATION: {
    KEY: "EMPTY_LAST_NAME_VALIDATION",
    DESCRIPTION: "Last Name is not allowed to be empty",
  },
  INVALID_COMPANY_VALIDATION: {
    KEY: "INVALID_COMPANY_VALIDATION",
    DESCRIPTION: "Company must be string",
  },
  EMPTY_COMPANY_VALIDATION: {
    KEY: "EMPTY_COMPANY_VALIDATION",
    DESCRIPTION: "Company is not allowed to be empty",
  },
  INVALID_JOB_TITLE__VALIDATION: {
    KEY: "INVALID_JOB_TITLE__VALIDATION",
    DESCRIPTION: "Job title must be string",
  },
  EMPTY_JOB_TITLE_VALIDATION: {
    KEY: "EMPTY_JOB_TITLE_VALIDATION",
    DESCRIPTION: "Job title is not allowed to be empty",
  },
  INVALID_PHONE_VALIDATION: {
    KEY: "INVALID_PHONE_VALIDATION",
    DESCRIPTION: "Invalid phone",
  },
  EMPTY_PHONE_VALIDATION: {
    KEY: "EMPTY_PHONE_VALIDATION",
    DESCRIPTION: "Phone is not allowed to be empty",
  },
  INVALID_USER_ID_VALIDATION: {
    KEY: "INVALID_USER_ID_VALIDATION",
    DESCRIPTION: "User ID must be number",
  },
  INVALID_USER_EMAIL_TYPE_VALIDATION: {
    KEY: "INVALID_USER_EMAIL_TYPE_VALIDATION",
    DESCRIPTION: "Email type must be one of [INVITATION, VERIFICATION]",
  },
  INVALID_ROLE_VALIDATION: {
    KEY: "INVALID_ROLE_VALIDATION",
    DESCRIPTION: "Role must be a number",
  },
  INVALID_COMPANY_ARR_VALIDATION: {
    KEY: "INVALID_COMPANY_ARR_VALIDATION",
    DESCRIPTION: "Company must contain at least 1 item",
  },
  INVALID_COMPANY_ID_VALIDATION: {
    KEY: "INVALID_COMPANY_ID_VALIDATION",
    DESCRIPTION: "Company must be a number",
  },
  DUPLICATE_EMAIL_VALIDATION: {
    KEY: "DUPLICATE_EMAIL_VALIDATION",
    DESCRIPTION: "Duplicate email found",
  },
  INVALID_PROJECT_ID_VALIDATION: {
    KEY: "INVALID_PROJECT_ID_VALIDATION",
    DESCRIPTION: "Project must be number",
  },
  EMPTY_ARRAY_VALIDATION: {
    KEY: "EMPTY_ARRAY_VALIDATION",
    DESCRIPTION: "Array must contain at least 1 item",
  },
  INPUT_ARRAY_VALIDATION: {
    KEY: "INPUT_ARRAY_VALIDATION",
    DESCRIPTION: "Input must be an array",
  },
  REQUIRED_ROLE_VALIDATION: {
    KEY: "REQUIRED_ROLE_VALIDATION",
    DESCRIPTION: "Role is required",
  },
  REQUIRED_FILE_NAME_VALIDATION: {
    KEY: "REQUIRED_FILE_NAME_VALIDATION",
    DESCRIPTION: "File Name is required",
  },
  INVALID_FILE_NAME_VALIDATION: {
    KEY: "INVALID_FILE_NAME_VALIDATION",
    DESCRIPTION: "File Name must be string",
  },
  EMPTY_FILE_NAME_VALIDATION: {
    KEY: "EMPTY_FILE_NAME_VALIDATION",
    DESCRIPTION: "File Name is not allowed to be empty",
  },
  INVALID_KEY_VALIDATION: {
    KEY: "INVALID_KEY_VALIDATION",
    DESCRIPTION: "Key must be string",
  },
  REQUIRED_KEY_VALIDATION: {
    KEY: "REQUIRED_KEY_VALIDATION",
    DESCRIPTION: "Key is required",
  },
  EMPTY_KEY_VALIDATION: {
    KEY: "EMPTY_KEY_VALIDATION",
    DESCRIPTION: "Key is not allowed to be empty",
  },
  INVALID_EXPIRY_VALIDATION: {
    KEY: "INVALID_EXPIRY_VALIDATION",
    DESCRIPTION: "Expiry must be number",
  },
  REQUIRED_ROLE_NAME_VALIDATION: {
    KEY: "REQUIRED_ROLE_NAME_VALIDATION",
    DESCRIPTION: "Role name is required",
  },
  INVALID_ROLE_TYPE_VALIDATION: {
    KEY: "INVALID_ROLE_TYPE_VALIDATION",
    DESCRIPTION: "Role type must be one of [TENANT, PROJECT]",
  },
  REQUIRED_ROLE_TYPE_VALIDATION: {
    KEY: "REQUIRED_ROLE_TYPE_VALIDATION",
    DESCRIPTION: "Role Type is required",
  },
  EMPTY_ROLE_TYPE_VALIDATION: {
    KEY: "EMPTY_ROLE_TYPE_VALIDATION",
    DESCRIPTION: "Role Type is not allowed to be empty",
  },
  PERMISSION_INPUT_TYPE_VALIDATION: {
    KEY: "PERMISSION_INPUT_TYPE_VALIDATION",
    DESCRIPTION: "Permission must be of type object",
  },
  REQUIRED_FEATURE_VALIDATION: {
    KEY: "REQUIRED_FEATURE_VALIDATION",
    DESCRIPTION: "Feature is required",
  },
  INVALID_FEATURE_VALIDATION: {
    KEY: "INVALID_FEATURE_VALIDATION",
    DESCRIPTION: "Feature must be a string",
  },
  EMPTY_FEATURE_VALIDATION: {
    KEY: "EMPTY_FEATURE_VALIDATION",
    DESCRIPTION: "Feature is not allowed to be empty",
  },
  REQUIRED_PERMISSION_VALIDATION: {
    KEY: "REQUIRED_PERMISSION_VALIDATION",
    DESCRIPTION: "Permission is required",
  },
  INVALID_PERMISSION_VALIDATION: {
    KEY: "INVALID_PERMISSION_VALIDATION",
    DESCRIPTION: "Permission must be one of [ADMIN, EDITOR, VIEWER, NONE]",
  },
  EMPTY_CAPTION_VALIDATION: {
    KEY: "EMPTY_CAPTION_VALIDATION",
    DESCRIPTION: "Caption is not allowed to be empty",
  },
  REQUIRED_CAPTION_VALIDATION: {
    KEY: "REQUIRED_CAPTION_VALIDATION",
    DESCRIPTION: "Caption is required",
  },
  INVALID_CAPTION_VALIDATION: {
    KEY: "INVALID_CAPTION_VALIDATION",
    DESCRIPTION: "Caption must be a string",
  },
  REQUIRED_FEATURE_ID_VALIDATION: {
    KEY: "REQUIRED_FEATURE_ID_VALIDATION",
    DESCRIPTION: "Feature Id is required",
  },
  INVALID_FEATURE_ID_VALIDATION: {
    KEY: "INVALID_FEATURE_ID_VALIDATION",
    DESCRIPTION: "Feature Id must be number",
  },
  INVALID_TEMPLATE_NAME_VALIDATION: {
    KEY: "INVALID_TEMPLATE_NAME_VALIDATION",
    DESCRIPTION: "Template Name must be String",
  },
  INVALID_TEMPLATE_DATA_VALIDATION: {
    KEY: "INVALID_TEMPLATE_DATA_VALIDATION",
    DESCRIPTION: "Template Data must be an array",
  },
  TEMPLATE_DATA_INPUT_TYPE_VALIDATION: {
    KEY: "TEMPLATE_DATA_INPUT_TYPE_VALIDATION",
    DESCRIPTION: "Permission must be of type object",
  },
  REQUIRED_FIELD_TYPE_ID_VALIDATION: {
    KEY: "REQUIRED_FIELD_TYPE_ID_VALIDATION",
    DESCRIPTION: "Field Type Id is required",
  },
  INVALID_FIELD_TYPE_ID_VALIDATION: {
    KEY: "INVALID_FIELD_TYPE_ID_VALIDATION",
    DESCRIPTION: "Field Type Id must be a number",
  },
  INVALID_VALUE_FIELD_TYPE_ID_VALIDATION: {
    KEY: "INVALID_VALUE_FIELD_TYPE_ID_VALIDATION",
    DESCRIPTION: "Field Type Id contains an invalid value",
  },
  INVALID_REQUIRED_FIELD_VALIDATION: {
    KEY: "INVALID_REQUIRED_FIELD_VALIDATION",
    DESCRIPTION: "Required must be a boolean",
  },
  REQUIRED_TO_ADDRESS_VALIDATION: {
    KEY: "REQUIRED_TO_ADDRESS_VALIDATION",
    DESCRIPTION: "ToAddress is required",
  },
  INVALID_TO_ADDRESS_VALIDATION: {
    KEY: "INVALID_TO_ADDRESS_VALIDATION",
    DESCRIPTION: "ToAddress must be an array",
  },
  INVALID_BCC_ADDRESS_VALIDATION: {
    KEY: "INVALID_BCC_ADDRESS_VALIDATION",
    DESCRIPTION: "BccAddress must be an array",
  },
  INVALID_CC_ADDRESS_VALIDATION: {
    KEY: "INVALID_CC_ADDRESS_VALIDATION",
    DESCRIPTION: "CcAddress must be an array",
  },
  INVALID_INPUT_IN_TO_ADDRESS_VALIDATION: {
    KEY: "INVALID_INPUT_IN_TO_ADDRESS_VALIDATION",
    DESCRIPTION: "toAddress must contains string value",
  },
  INVALID_INPUT_IN_BCC_ADDRESS_VALIDATION: {
    KEY: "INVALID_INPUT_IN_BCC_ADDRESS_VALIDATION",
    DESCRIPTION: "BccAddress must contains string value",
  },
  INVALID_INPUT_IN_CC_ADDRESS_VALIDATION: {
    KEY: "INVALID_INPUT_IN_CC_ADDRESS_VALIDATION",
    DESCRIPTION: "CcAddress must contains string value",
  },
  REQUIRED_TEMPLATE_VALIDATION: {
    KEY: "REQUIRED_TEMPLATE_VALIDATION",
    DESCRIPTION: "Template is required",
  },
  INVALID_TEMPLATE_VALIDATION: {
    KEY: "INVALID_TEMPLATE_VALIDATION",
    DESCRIPTION: "Template must be a string",
  },
  EMPTY_TEMPLATE_VALIDATION: {
    KEY: "EMPTY_TEMPLATE_VALIDATION",
    DESCRIPTION: "Template is not allowed to be empty",
  },
  REQUIRED_SUBJECT_VALIDATION: {
    KEY: "REQUIRED_SUBJECT_VALIDATION",
    DESCRIPTION: "Subject is required",
  },
  INVALID_SUBJECT_VALIDATION: {
    KEY: "INVALID_SUBJECT_VALIDATION",
    DESCRIPTION: "Subject must be a string",
  },
  EMPTY_SUBJECT_VALIDATION: {
    KEY: "EMPTY_SUBJECT_VALIDATION",
    DESCRIPTION: "Subject is not allowed to be empty",
  },
  INVALID_TYPE_FEATURE_VALIDATION: {
    KEY: "INVALID_TYPE_FEATURE_VALIDATION",
    DESCRIPTION: "Feature must be an array",
  },
  INVALID_INPUT_FEATURE_VALIDATION: {
    KEY: "INVALID_INPUT_FEATURE_VALIDATION",
    DESCRIPTION: "Feature must be one of [PROJECT, USER, COMPANY, ROLE]",
  },
  USER_ASSOCIATIONS_ALREADY_EXISTS: {
    KEY: "USER_ASSOCIATIONS_ALREADY_EXISTS",
    DESCRIPTION: "User already part of the tenant",
  },
  ACCOUNT_OWNER_ALREADY: {
    KEY: "ACCOUNT_OWNER_ALREADY",
    DESCRIPTION:
      "This user is already present with tenant owner role for another tenant",
  },
  INVALID_TEMPLATE_ASSOCIATION_VALIDATION: {
    KEY: "INVALID_TEMPLATE_ASSOCIATION_VALIDATION",
    DESCRIPTION:
      "You cannot update the default form template for this project as there is active data using the old form template",
  },
};

export default ResponseCode;
