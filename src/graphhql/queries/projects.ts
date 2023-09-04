import { gql } from "@apollo/client";
import { CompanyAssociation } from "../models/companyAssociation";
import { Project, ProjectAssociation } from "../models/project";
import { TenantAssociation } from "../models/tenantUsers";
import { User } from "../models/users";

export const LOAD_USER_PROJECTS = gql`query fetchMyProjects {
    ${Project.modelName}(
        order_by: {${Project.selector.name}: asc}
      ) {
          ${Project.selector.id}
          ${Project.selector.name}
          ${Project.selector.status}
          ${Project.selector.address}
          ${Project.selector.config}
          projectPortfolioAssociations {
            portfolioId
            portfolio {
              name
              parentId
            }
          }
      }
    }
`;

// to fetch projects list by name
export const LOAD_USER_PROJECTS_BY_QUERY = gql`query fetchMyProjects($searchText: String!, $offset: Int!, $limit: Int!) {
    ${Project.modelName}
        (limit: $limit, offset: $offset, order_by: {${Project.selector.name}: asc},
            where: {${Project.selector.name}: {_ilike: $searchText}}) {
          ${Project.selector.id}
          ${Project.selector.name}
          ${Project.selector.status}
          ${Project.selector.address}
          ${Project.selector.config}
          ${Project.selector.location}
          ${Project.selector.metrics}
          projectPortfolioAssociations {
            portfolioId
            portfolio {
              name
              parentId
            }
          }
          addresses {
            addressLine1
            addressLine2
            city
            country
            id
            postalCode
            state
            streetNo
            fullAddress
          }
      }
}
`;

export const GET_USER_PROJECTS = gql`
  query fetchProjects {
    projectList_query {
      projectId
      ${Project.selector.name}
    }
  }
`;

// project unique name validation query
export const UNIQUE_PROJECT_NAME = gql`query fetchMyProjectsByName($searchText: String!) {
    ${Project.modelName}(where: {${Project.selector.name}: {_ilike: $searchText}}) {
        ${Project.selector.id}
        ${Project.selector.name}
    }
 }
`;

// fetch project by code
export const UNIQUE_PROJECT_CODE = gql`query getProjectByCode($config: jsonb!) {
    ${Project.modelName}(where: {${Project.selector.config}: {_contains: $config}}) {
        ${Project.selector.id}
        ${Project.selector.name}
        ${Project.selector.config}
    }
    
 }
`;

// to create a new project

export const CREATE_NEW_PROJECT = gql` mutation createNewProject($payload: [project_insert_input!]!) {
    insert_project(objects: $payload) {
        affected_rows
        returning {
            ${Project.selector.id}
            ${Project.selector.name}
            ${Project.selector.status}
        }
      }
  }
`;

export const ASSOCIATE_PROJECT_WITH_PORTFOLIO = gql`
mutation associateProjectwithPortfolio($objects:[projectPortfolioAssociation_insert_input!]!) {
  insert_projectPortfolioAssociation(objects:$objects) {
      ${Project.selector.affectedRows}
  }
}`;

// to create a new project with project template

export const CREATE_NEW_PROJECT_WITH_TEMPLATE = gql`
  mutation createNewProjectWithTemplate(
    $config: json
    $address: json
    $projectName: String!
    $projectId: Int!
    $members: Boolean
    $details: Boolean
    $startDate: String!
    $endDate: String!
    $location: geography
  ) {
    insert_duplicateProject_mutation(
      projectName: $projectName
      projectId: $projectId
      members: $members
      details: $details
      config: $config
      address: $address
      startDate: $startDate
      endDate: $endDate
      location: $location
    ) {
      id
    }
  }
`;

// to update project details

export const UPDATE_PROJECT_DETAILS = gql`
  mutation updateProjectDetails(
    $id: Int!
    $address: jsonb
    $config: jsonb!
    $metrics: jsonb!
    $name: String!
    $startDate: timestamptz
    $endDate: timestamptz
    $location: point
  ) {
    update_project(
      where: { id: { _eq: $id } }
      _set: {
        address: $address
        config: $config
        metrics: $metrics
        name: $name
        startDate: $startDate
        endDate: $endDate
        location: $location
      }
    ) {
      affected_rows
    }
  }
`;

//fetch project details by ID
export const FETCH_PROJECT_BY_ID = gql`query fetchMyProjectsById($id: Int!) {
    ${Project.modelName}(where: {id: {_eq: $id}}) {
        ${Project.selector.id}
        ${Project.selector.name}
        ${Project.selector.status}
        ${Project.selector.address}
        ${Project.selector.config}
        ${Project.selector.metrics}
        ${Project.selector.location}
        ${Project.selector.tenantId}
        ${Project.selector.startDate}
        ${Project.selector.endDate}
        ${Project.selector.location}
        projectPortfolioAssociations {
          portfolioId
          portfolio {
            name
            parentId
          }
        }
        addresses {
          addressLine1
          addressLine2
          city
          country
          id
          postalCode
          state
          streetNo
          id
          fullAddress
          countryShortCode
        }
    }
}
`;

// fetch project associations
export const FETCH_PROJECT_ASSOCIATION = gql`
  query fetchProjectAssociation(
    $fName: String
    $limit: Int
    $offset: Int
    $projectId: Int
  ) {
    projectAssociation(
      offset: $offset
      limit: $limit
      where: {
        _and: {
          projectId: { _eq: $projectId }
          status: { _neq: 1 }
          user: {
            _or: [
              { email: { _ilike: $fName } }
              { firstName: { _ilike: $fName } }
              { lastName: { _ilike: $fName } }
            ]
          }
        }
      }
    ) {
      user {
        id
        firstName
        lastName
        email
        status
        phone
      }
      role
    }
  }
`;

export const FETCH_PROJECT_ASSOCIATION_BY_FULLNAME = gql`
  query fetchProjectAssociation(
    $fName: String
    $lName: String
    $limit: Int
    $offset: Int
    $projectId: Int
  ) {
    projectAssociation(
      offset: $offset
      limit: $limit
      where: {
        _and: {
          projectId: { _eq: $projectId }
          status: { _neq: 1 }
          user: {
            _and: {
              lastName: { _ilike: $lName }
              _or: [
                { firstName: { _ilike: $fName } }
                { email: { _ilike: $fName } }
              ]
            }
          }
        }
      }
    ) {
      user {
        id
        firstName
        lastName
        email
        status
        phone
      }
      role
    }
  }
`;

// fetch tenant project users

export const FETCH_TENANT__PROJECT_ASSOCIATION = gql`
  query fetchTenantProjectAssociation(
    $limit: Int!
    $offset: Int!
    $projectId: Int!
    $status: Int
    $fName: String!
  ) {
    tenantAssociation(
      offset: $offset
      limit: $limit
      where: {
        _and: {
          user: {
            _or: [
              { email: { _ilike: $fName } }
              { firstName: { _ilike: $fName } }
              { lastName: { _ilike: $fName } }
            ]
          }
          status: { _neq: 1 }
        }
      }
      order_by: { status: desc, user: { firstName: asc } }
    ) {
      status
      user {
        id
        email
        firstName
        lastName
        jobTitle
        phone
      }

      projectAssociations(where: { projectId: { _eq: $projectId } }) {
        role
        status
      }

      companyAssociations(where: { status: { _neq: $status } }) {
        company {
          name
          id
        }
      }
    }
  }
`;

export const FETCH_TENANT__PROJECT_ASSOCIATION_BY_FULLNAME = gql`
  query fetchTenantProjectAssociation(
    $limit: Int!
    $offset: Int!
    $projectId: Int!
    $status: Int
    $fName: String!
    $lName: String!
  ) {
    tenantAssociation(
      offset: $offset
      limit: $limit
      where: {
        _and: {
          user: {
            _and: {
              lastName: { _ilike: $lName }
              _or: [
                { firstName: { _ilike: $fName } }
                { email: { _ilike: $fName } }
              ]
            }
          }
          status: { _neq: 1 }
        }
      }
      order_by: { status: desc, user: { firstName: asc } }
    ) {
      status
      user {
        id
        email
        firstName
        lastName
        jobTitle
        phone
      }

      projectAssociations(where: { projectId: { _eq: $projectId } }) {
        role
        status
      }

      companyAssociations(where: { status: { _neq: $status } }) {
        company {
          name
          id
        }
      }
    }
  }
`;

export const ADD_NEW_PROJECT_USER = gql`
  mutation associateUserwithProjects(
    $projectId: Int!
    $role: Int!
    $userId: uuid!
  ) {
    insert_projectAssociation_mutation(
      objects: { projectId: $projectId, role: $role, userId: $userId }
    ) {
      affected_rows
    }
  }
`;

export const UPDATE_PROJECT_USER_STATUS = gql` mutation updateProjectUserStatus($projectId:Int!, $userId: uuid!, $status:Int!) {
  update_projectAssociation(
    where: {
      _and: {
        ${ProjectAssociation.selector.projectId}: {_eq: $projectId},
        ${ProjectAssociation.selector.userId}: {_eq: $userId}
      }
    },
    _set: {
        ${ProjectAssociation.selector.status}: $status
      }) {
        affected_rows
    }
}`;

export const UPDATE_USER_PROJECT_ROLE = gql`mutation updateProjectUserRoleStatus(
  $projectId:Int!,$userId:uuid!,$role: Int!) {
      update_projectAssociation(
        where: {
          _and: {
            ${ProjectAssociation.selector.projectId}: {_eq: $projectId},
            ${ProjectAssociation.selector.userId}: {_eq: $userId}
          }
        },
        _set: {
            ${ProjectAssociation.selector.role}: $role
          }) {
            affected_rows
        }
}`;

export const GET_PROJECT_ASSOCIATION_DETAILS = gql`query getProjectAssociationDetails($projectId:Int!,$userId:uuid!){
  projectAssociation (
    where: { 
      ${ProjectAssociation.selector.projectId}: {_eq: $projectId},
      ${ProjectAssociation.selector.userId}: {_eq: $userId}
    }
  ){
    projectId
    userId
    status
  }
}`;

export const LOAD_USER_PORTFOLIOS = gql`
  query fetchMyPortfolios {
    portfolio {
      id
      name
      parentId
    }
  }
`;

export const UPDATE_PROJECT_WITH_PORTFOLIO = gql` mutation updateProjectwithPortfolio($objects:[projectPortfolioAssociation_insert_input!]!) {
    insert_projectPortfolioAssociation(objects: $objects, on_conflict: {constraint: projectPortfolioAssociation_pkey, update_columns: deleted}) {
        ${Project.selector.affectedRows}
      }
}`;

export const CREATE_PROJECT_LOCATIOn = gql`
  mutation createProjectAddress($object: address_insert_input!) {
    insert_address_one(object: $object) {
      id
    }
  }
`;

export const UPDATE_PROJECT_LOCATION = gql`
  mutation updateAddress(
    $id: Int!
    $streetNo: String
    $state: String
    $postalCode: String
    $country: String
    $city: String
    $addressLine2: String
    $addressLine1: String
    $fullAddress: String
    $countryShortCode: String
  ) {
    update_address_by_pk(
      pk_columns: { id: $id }
      _set: {
        streetNo: $streetNo
        state: $state
        postalCode: $postalCode
        country: $country
        city: $city
        addressLine2: $addressLine2
        addressLine1: $addressLine1
        fullAddress: $fullAddress
        countryShortCode: $countryShortCode
      }
    ) {
      id
    }
  }
`;

export const FETCH_PROJECT_ASSOCIATED_USERS = gql`
  query fetchProjectAssociatedUsers($projectId: Int!, $fName: String!) {
    projectAssociation(
      where: {
        projectId: { _eq: $projectId }
        user: {
          _or: [
            { lastName: { _ilike: $fName } }
            { firstName: { _ilike: $fName } }
            { email: { _ilike: $fName } }
          ]
        }
        status: { _neq: 1 }
      }
    ) {
      user {
        email
        firstName
        id
        lastName
      }
      status
      role
    }
  }
`;

export const FETCH_PROJECT_ASSOCIATED_USERS_BY_FULLNAME = gql`
  query fetchProjectAssociatedUsers(
    $projectId: Int!
    $fName: String!
    $lName: String!
  ) {
    projectAssociation(
      where: {
        projectId: { _eq: $projectId }
        user: {
          _and: {
            lastName: { _ilike: $lName }
            _or: [
              { firstName: { _ilike: $fName } }
              { email: { _ilike: $fName } }
            ]
          }
        }
        status: { _neq: 1 }
      }
    ) {
      user {
        email
        firstName
        id
        lastName
      }
      status
      role
    }
  }
`;

export const FETCH__PROJECT_ROLE_ABOVE_VIEW = gql`
  query permittedRoles($featureId: [Int!]) {
    projectPermission(
      where: { featureId: { _in: $featureId }, authValue: { _gte: 2 } }
      distinct_on: roleId
    ) {
      roleId
    }
  }
`;

export const FETCH_PROJECT_NAMES = gql`
  query fetchProjectNames($projectId: [Int!]) {
    project(where: { id: { _in: $projectId } }) {
      id
      name
      tenantId
    }
  }
`;

export const FETCH_PORTFOLIOS = gql`
  query fetchPortfolio {
    portfolio {
      name
      id
      projectPortfolioAssociations {
        projectId
      }
    }
  }
`;

export const FETCH_MYPORJECT_PORTFOLIO = gql`
  query fetchMyProjectPorfolio($portfolioId: Int!) {
    project(
      order_by: { name: asc }
      where: {
        projectPortfolioAssociations: { portfolioId: { _eq: $portfolioId } }
      }
    ) {
      name
      id
      location
      projectPortfolioAssociations {
        portfolioId
      }
    }
  }
`;
