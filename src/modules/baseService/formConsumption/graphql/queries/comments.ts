import { gql } from '@apollo/client';
import {commentsModel} from '../models/comments';

export const LOAD_FORM_COMMENTS =gql`query getFormComments($formId: Int!) {
    ${commentsModel.modelName}(where: {parentId: {_is_null: true}, formId: {_eq: $formId}, deleted: {_eq: false}}) {
      ${commentsModel.selector.id}
      ${commentsModel.selector.parentId}
      ${commentsModel.selector.comment}
      ${commentsModel.selector.createdAt}
      ${commentsModel.selector.formId}
      ${commentsModel.relation.childComments}(where: {deleted: {_eq: false}}) {
        ${commentsModel.selector.id}
        ${commentsModel.selector.parentId}
        ${commentsModel.selector.comment}
        ${commentsModel.selector.createdAt}
        ${commentsModel.relation.createdByUser} {
          ${commentsModel.selector.id}
          ${commentsModel.selector.firstName}
          ${commentsModel.selector.lastName}
        }
      }
      ${commentsModel.relation.createdByUser} {
        ${commentsModel.selector.id}
        ${commentsModel.selector.firstName}
        ${commentsModel.selector.lastName}
      }
    }
  }`;

  export const LOAD_FORM_COMMENT_DETAILS =gql`query getFormComments($formId: Int!, $id: Int!) {
    ${commentsModel.modelName}(where: {formId: {_eq: $formId}, id: {_eq: $id}, deleted: {_eq: false}}) {
      ${commentsModel.selector.id}
      ${commentsModel.selector.parentId}
      ${commentsModel.selector.comment}
      ${commentsModel.selector.createdAt}
      ${commentsModel.selector.formId}
      ${commentsModel.relation.childComments}(where: {deleted: {_eq: false}}) {
        ${commentsModel.selector.id}
        ${commentsModel.selector.parentId}
        ${commentsModel.selector.comment}
        ${commentsModel.selector.createdAt}
        ${commentsModel.relation.createdByUser} {
          ${commentsModel.selector.id}
          ${commentsModel.selector.firstName}
          ${commentsModel.selector.lastName}
        }
        ${commentsModel.relation.childComments}(where: {deleted: {_eq: false}}) {
          ${commentsModel.selector.id}
          ${commentsModel.selector.parentId}
          ${commentsModel.selector.comment}
          ${commentsModel.selector.createdAt}
          ${commentsModel.relation.createdByUser} {
            ${commentsModel.selector.id}
            ${commentsModel.selector.firstName}
            ${commentsModel.selector.lastName}
          }
        }
      }
      ${commentsModel.relation.createdByUser} {
        ${commentsModel.selector.id}
        ${commentsModel.selector.firstName}
        ${commentsModel.selector.lastName}
      }
    }
  }`;

  export const INSERT_ROOT_COMMENT =gql`mutation InsertRootComment($formId: Int!, $comment: String!) {
    insert_comments(objects: {comment: $comment, formId: $formId}) {
          affected_rows
        }
      }`;
  

  export const INSERT_CHILD_COMMENT =gql`mutation InsertChildComment($formId: Int!, $comment: String!, $parentId: Int!) {
    insert_comments(objects: {comment: $comment, formId: $formId, parentId: $parentId}) {
      affected_rows
    }
  }`;

  export const UPDATE_COMMENT_AS_DELETED= gql`mutation updateComment($id: Int!) {
    update_comments(where: {id: {_eq: $id}}, _set: {deleted: true}) {
      affected_rows
    }
  }`;

  export const UPDATE_COMMENT= gql`mutation updateComment($id: Int!, $comment: String!) {
    update_comments(where: {id: {_eq: $id}}, _set: {comment: $comment}) {
      affected_rows
    }
  }`;

  export const DELETE_COMMENT= gql`mutation DeleteComment($id: Int!) {
    update_comments(where: {id: {_eq: $id}}) {
      affected_rows
    }
  }`;