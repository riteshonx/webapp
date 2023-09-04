import { gql } from '@apollo/client';
import {projectModel} from '../models/projectModel'; 

export const LOAD_TENANT_PROJECTS = gql`query getTenantProjects($limit: Int!, $offset: Int!) {
  ${projectModel.modelName}(limit: $limit, offset: $offset, order_by: {name: asc})
    {
      ${projectModel.selector.id}
      ${projectModel.selector.name}
      ${projectModel.selector.status}
      ${projectModel.selector.address}
      ${projectModel.selector.config}
    }
  }
`;