
import { gql } from '@apollo/client';
import { Annotations } from '../models/drawingAnnotations';

//create annotation
export const CREATE_ANNOTATION =gql`
mutation createAnnotation($drawingId: uuid, $xfdf: String) {
    insert_annotations_one(object: {drawingId: $drawingId, xfdf: $xfdf}) {
        id
        drawingId
    }
}
`;

//update annotation
export const UPDATE_ANNOTATION =gql`
    mutation updateAnnotation($id: uuid!, $xfdf: String) {
        update_annotations_by_pk(pk_columns: {id: $id}, _set: {xfdf: $xfdf}) {
            id
            xfdf
            updatedAt
        }
    }
`;

//update annotation
export const DELETE_ANNOTATION =gql`
    mutation deleteAnnotation($id: uuid!) {
        delete_annotations_by_pk(id: $id) {
            id
            xfdf
            updatedAt
        }
    }
`;
  

// fetch drawing's annotation
export const FETCH_ANNOTATION = gql`query fetchAnnotation($drawingId: uuid) {
    ${Annotations.modelName}(where: {${Annotations.selector.drawingId}: {_eq: $drawingId}}) {
        ${Annotations.selector.id}
        ${Annotations.selector.createdAt}
        ${Annotations.selector.createdBy}
        ${Annotations.selector.drawingId}
        ${Annotations.selector.updatedAt}
        ${Annotations.selector.updatedBy}
        ${Annotations.selector.xfdf}
    }
}`;

export const ANNOTATION_SUBSCRIBE= gql`subscription annotationSubscription($drawingId: uuid!) {
    annotations(where: {drawingId: {_eq: $drawingId}}) {
      createdAt
      id
      layer_id
      drawingId
      createdBy
      xfdf
      tenantId
      updatedAt
      updatedBy
    }
  }`;

export const ACTIVE_USER_SUBSCRIPTION= gql`subscription annotationSubscription($drawingId: uuid!) {
dwgSession(where: {drawingId: {_eq: $drawingId}, status: {_eq: 3}}) {
    dwgUserSessionAssociations{
      userId
      status
    }
  }
}`;

