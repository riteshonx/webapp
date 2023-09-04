import { gql } from '@apollo/client';
import { CustomTemplateDetails, CustomTemplateLists, DrawingTemplateFields } from '../models/customFormatTemplateModel';


// to fetch drawing template fields data
export const FETCH_DRAWING_TEMPLATE_FIELDS = gql`query fetchDrawingTemplateFields {
    ${DrawingTemplateFields.modelName}{
        ${DrawingTemplateFields.selector.id}
        ${DrawingTemplateFields.selector.label}
        ${DrawingTemplateFields.selector.name}
        ${DrawingTemplateFields.selector.type}
        ${DrawingTemplateFields.selector.groupType}
        ${DrawingTemplateFields.selector.isDefault}
        ${DrawingTemplateFields.selector.isMandatory}
    }
}`;


// to fetch custon template lists
export const FETCH_CUSTOM_TEMPLATE_LISTS = gql`query fetchCustomTemplateLists($offset: Int!, $limit: Int!, $searchText: String!) {
    ${CustomTemplateLists.modelName}(offset: $offset, limit: $limit, where: {${CustomTemplateLists.selector.name}: {_ilike: $searchText}}){
        ${CustomTemplateLists.selector.id}
        ${CustomTemplateLists.selector.name}
        ${CustomTemplateLists.selector.createdAt}
        ${CustomTemplateLists.selector.createdBy}
        ${CustomTemplateLists.selector.tenantAssociation} {
            ${CustomTemplateLists.selector.user} {
                ${CustomTemplateLists.selector.email}
                ${CustomTemplateLists.selector.firstName}
                ${CustomTemplateLists.selector.lastName}
            }
        }
        drawingUploadStatuses(limit: 10, where: {status: {_neq: "PUBLISHED"}}) {
            id
        }
        drawingSheets(limit: 10, where: {status: {_eq: "PUBLISHED"}}) {
            id
        }
    }
}`;


// to fetch custon template details based on ID
export const FETCH_CUSTOM_TEMPLATE_DETAILS = gql`query fetchCustomTemplateDetails($formatId: uuid!) {
    ${CustomTemplateDetails.modelName}(order_by: {${CustomTemplateDetails.selector.sequenceNumber}: asc}, 
                                       where: {${CustomTemplateDetails.selector.drawingFormatId}: {_eq: $formatId}}) {
        ${CustomTemplateDetails.selector.sequenceNumber},
        drawingTemplateFormat {
            name
        }
        ${DrawingTemplateFields.modelName} {
            ${DrawingTemplateFields.selector.id}
            ${DrawingTemplateFields.selector.name}
            ${DrawingTemplateFields.selector.label}
            ${DrawingTemplateFields.selector.type}
            ${DrawingTemplateFields.selector.groupType}
            ${DrawingTemplateFields.selector.isMandatory}
            ${DrawingTemplateFields.selector.isDefault}
        }
      }
}`;

// to fetch custon template based on name
export const FETCH_CUSTOM_TEMPLATE_NAME = gql`query fetchCustomTemplateName($templateName: String!) {
    ${CustomTemplateLists.modelName}(where: {${CustomTemplateLists.selector.name}: {_ilike: $templateName}}) {
        ${CustomTemplateLists.selector.id}
        ${CustomTemplateLists.selector.name}
      }
}`;

// delete custom template
export const DELETE_CUSTOM_TEMPLATE = gql`mutation deleteCustomTemplate($id: uuid!) {
    update_drawingTemplateFormat(where: {id: {_eq: $id}}, _set: {isDeleted: true}) {
        affected_rows
    }
}
`;

//create custom template
export const CREATE_CUSTOM_TEMPLATE = gql`mutation createCustomTemplate($formatName: String!, $templateFieldIds: [Int!]!) {
    createDrawingTemplateFormat_mutation(formatName: $formatName, templateFieldIds: $templateFieldIds) {
        formatId
      }
}
`;

//Update custom template
export const UPDATE_CUSTOM_TEMPLATE = gql`mutation updateCustomTemplate($formatName: String!, $templateFieldIds: [Int!]!, $templateId: uuid!) {
    createDrawingTemplateFormat_mutation(formatName: $formatName, templateFieldIds: $templateFieldIds, templateId: $templateId) {
        formatId
      }
}
`;

export const GET_MYPROJECT_DETAILS = gql`
    query myProjectDetailsQuery($projectId: Int!) {
        project(where: {id: {_eq: $projectId}}) {
        createdAt
        userByCreatedby {
            firstName
            lastName
            email
        }
        }
    }
`;

