import { gql } from "@apollo/client";
import { ProjectFeature } from "../models/projectFeature";
import { FormTemplates } from "../models/formTemplates";

export const LOAD_PRODUCT_FEATURES = gql`
            query getProjectFeature($feature: String!,$offset: Int!,$limit: Int!) {
            ${ProjectFeature.modelName}(
                offset: $offset, 
                limit: $limit,
                where: 
                {
                    ${ProjectFeature.selector.feature}: {_ilike: $feature}
                }
                )
                {
                    ${ProjectFeature.selector.id}
                    ${ProjectFeature.selector.feature}
                    ${ProjectFeature.selector.tenantId}
                    caption
                    ${ProjectFeature.relation.formTemplates}{
                        ${FormTemplates.selector.id}
                    }   
                }
            }
        `;

export const LOAD_PRODUCT_FEATURES_DETAILS = gql`
    query getProjectFeatureDetails($featureId: Int!) {
    ${ProjectFeature.modelName}(where: {${ProjectFeature.selector.id}: {_eq: $featureId}})
        {
            ${ProjectFeature.selector.id}
            ${ProjectFeature.selector.feature} 
            ${ProjectFeature.selector.tenantId} 
        }
    }
`;

export const SET_DEFAULT_TEMPLATE = gql`
  mutation setDefaultTemplate($featureId: Int!, $templateId: Int!) {
    update_defaultField_mutation(
      featureId: $featureId
      templateId: $templateId
    ) {
      message
      templateId
    }
  }
`;

export const LOAD_PRODUCT_FEATURES_BY_NAME = gql`
    query getProjectFeatureByName($feature: String!) {
    ${ProjectFeature.modelName}(where: {_or: [{caption: {_ilike: $feature}}, {feature: {_ilike: $feature}}]})
        {
            ${ProjectFeature.selector.id}
            ${ProjectFeature.selector.feature} 
        }
    }
`;

export const INSERT_FORM = gql`
  mutation insertOpenFormFeatureTemplate(
    $featureName: String!
    $templateData: [openFormTemplateDataArray!]!
    $templateName: String!
  ) {
    insertOpenFormFeatureTemplate_mutation(
      featureName: $featureName
      templateData: $templateData
      templateName: $templateName
    ) {
      message
      templateId
      formFeatureId
    }
  }
`;

export const UNIQUE_FORM_FEATURE_NAME = gql`
    query getProjectFeatureByName($caption: String!) {
        projectFeature(
        where: 
        {
            caption: {_ilike: $caption}
        }
        )
        {
            ${ProjectFeature.selector.id}
            ${ProjectFeature.selector.feature}
            ${ProjectFeature.selector.tenantId}
            caption
        }
    }
`;

export const UPDATE_PRODUCT_FEATURE = gql`
  mutation updateOpenFormName($caption: String!, $id: Int!) {
    update_projectFeature(
      where: { id: { _eq: $id } }
      _set: { caption: $caption, feature: $caption }
    ) {
      returning {
        id
        caption
      }
    }
  }
`;
