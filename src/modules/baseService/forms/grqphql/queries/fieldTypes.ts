import { gql } from '@apollo/client';
import {FieldTypes} from '../models/fieldTypes'; 

export const LOAD_FIELD_TYPES=gql`query getFieldTypes {
    ${FieldTypes.modelName} {
      ${FieldTypes.selector.id}
      ${FieldTypes.selector.fieldType}
      ${FieldTypes.selector.caption}
      ${FieldTypes.selector.enabled}
      ${FieldTypes.selector.dataType}
    }
  }
`;
