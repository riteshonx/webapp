import { gql } from "@apollo/client";

export abstract class TenantAssociation {
  static modelName = "tenantAssociation";
  static selector = {
    userId: "userId",
    tenantId: "tenantId",
    role: "role",
    status: "status",
  };
  static relation = {
    user: "user",
    role: "tenantRole",
    companies: "companies",
    projects: "projects",
    projectAssociations: "projectAssociations",
    companyAssociations: "companyAssociations",
    userEmailAssociations: "userEmailAssociations",
  };
}

export abstract class Company {
  static modelName = "company";
  static selector = {
    id: "id",
    name: "name",
    address: "address",
    tenantId: "tenantId",
    tenant: "tenant",
    active: "active",
    companyId: "companyId",
    companyInfo: "companyInfo",
    trade: "trade",
    timezoneId: "timezoneId",
    location: "location",
    createdBy: "createdBy",
    userId: "userId",
    status: "status",
    contactInfo: "contactInfo",
    updatedBy: "updatedBy",
    affectedRows: "affected_rows",
  };
  static relation = {
    companyAssociation: "companyAssociation",
  };
}

export abstract class ProjectAssociation {
  static modelName = "projectAssociation";
  static insertInputType = "projectAssociation_insert_input";
  static updateType = "projectAssociation_set_input";
  static selector = {
    affectedRows: "affected_rows",
    projectId: "projectId",
    tenantId: "tenantId",
    userId: "userId",
    status: "status",
    updatedBy: "updatedBy",
    role: "role",
    projectRole: "projectRole",
  };
  static relation = {
    project: "project",
    user: "user",
    tenantAssociation: "tenantAssociation",
  };

  static orderBy = {
    tenantAssociation: "tenantAssociation",
  };
}

export abstract class User {
  static modelName = "user";
  static selector = {
    id: "id",
    lastName: "lastName",
    firstName: "firstName",
    email: "email",
    lastLoggedIn: "lastLoggedIn",
    status: "status",
    phone: "phone",
    jobTitle: "jobTitle",
    role: "role",
    affectedRows: "affected_rows",
  };
  static relation = {
    role: "tenantRole",
    userStatus: "userStatus",
    tenantAssociations: "tenantAssociations",
  };
}

export abstract class TenantRole {
  static modelName = "tenantRole";
  static selector = {
    id: "id",
    role: "role",
    tenantId: "tenantId",
    description: "description",
    deleted: "deleted",
    createdBy: "createdBy",
    updatedAt: "updatedAt",
  };
}

export abstract class Project {
  static modelName = "project";
  static insertInputType = "project_insert_input";
  static selector = {
    id: "id",
    name: "name",
    status: "status",
    location: "location",
    config: "config",
    address: "address",
    metrics: "metrics",
    userId: "userId",
    tenantId: "tenantId",
    affectedRows: "affected_rows",
  };
  static relation = {
    projectAssociation: "projectAssociation",
  };
}

export abstract class CompanyAssociation {
  static modelName = "companyAssociation";
  static insertInputType = "companyAssociation_insert_input";
  static updateType = "companyAssociation_set_input";
  static selector = {
    affectedRows: "affected_rows",
    companyId: "companyId",
    tenantId: "tenantId",
    userId: "userId",
    status: "status",
    updatedBy: "updatedBy",
  };
  static relation = {
    company: "company",
    tenantAssociation: "tenantAssociation",
  };
  static orderBy = {
    tenantAssociation: "tenantAssociation",
  };
}

export abstract class ProjectRole {
  static modelName = "projectRole";
  static insertInputType = "insert_duplicateRole_mutation";
  static selector = {
    id: "id",
    role: "role",
    tenantId: "tenantId",
    deleted: "deleted",
    description: "description",
    createdBy: "createdBy",
    updatedAt: "updatedAt",
  };
}

export abstract class TenantCompany {
  static modelName = "tenantCompanyAssociation";
  static selector = {
    id: "id",
    name: "name",
    address: "address",
    tenantId: "tenantId",
    tenant: "tenant",
    active: "active",
    companyId: "companyId",
    companyInfo: "companyInfo",
    trade: "trade",
    timezoneId: "timezoneId",
    location: "location",
    createdBy: "createdBy",
    userId: "userId",
    status: "status",
    contactInfo: "contactInfo",
    updatedBy: "updatedBy",
    affectedRows: "affected_rows",
  };
  static relation = {
    companyAssociation: "companyAssociation",
  };
}

export enum Status {
  deactive = 1,
  invite = 2,
  active = 3,
  null = -1,
}

export const TENANT_USERS = gql`
    query getAllTenantUsers($fName: String!, $limit: Int!, $offset : Int!){
      tenantAssociation(
        offset: $offset, 
        limit: $limit,
          where: {_and: {
          user: {_or:[{email: {_ilike: $fName}},
           {firstName: {_ilike: $fName}},
           {lastName: {_ilike: $fName}}]}}},
          order_by: {user: {firstName: asc}}
        ) {

          status
          user{
            id
            email
            firstName
            lastName
            jobTitle
            phone
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
            }
          }
          tenantRole {
            role
          }

          companyAssociations(where:{
            status: {_neq: ${Status.deactive}}
          }) {
              companyId
              userId
              status
              company {
                name
              }
            }

            projectAssociations(
            where:{status:{_neq:${Status.deactive}}}
          ){
              userId  
              status
              project {
                name
              }
            }
        }      
      }
`;

export const TENANT_USERS_BY_FULLNAME = gql`
    query getAllTenantUsers($fName: String!, $lName: String!, $limit: Int!, $offset : Int!){
      tenantAssociation(
        offset: $offset, 
        limit: $limit,
          where: {_and: {
          user: {
            _and: {
              lastName: {_ilike: $lName},
               _or:[
                 {firstName: {_ilike: $fName}},
                 {email: {_ilike: $fName}}
                ]}
          }}},
          order_by: {user: {firstName: asc}}
        ) {

          status
          user{
            id
            email
            firstName
            lastName
            jobTitle
            phone
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
            }
          }
          tenantRole {
            role
          }

          companyAssociations(where:{
            status: {_neq: ${Status.deactive}}
          }) {
              companyId
              userId
              status
              company {
                name
              }
            }

            projectAssociations(
            where:{status:{_neq:${Status.deactive}}}
          ){
              userId  
              status
              project {
                name
              }
            }
        }      
      }
`;

export const GET_USER_DETAILS = gql`
query getUserDetails($userId: uuid!){
  ${TenantAssociation.modelName}(
    where: 
      {
            ${TenantAssociation.selector.userId}: {_eq: $userId}   
      }
    ) {
      ${TenantAssociation.selector.status}
      ${TenantAssociation.selector.role}
      ${TenantAssociation.relation.user} {
        ${User.selector.id}
        ${User.selector.email}
        ${User.selector.firstName}
        ${User.selector.lastName}
        ${User.selector.jobTitle}
        ${User.selector.phone}
        addresses {
          fullAddress
          city
          country
          id
          postalCode
          state
          streetNo
          addressLine2
        }
        userEmailAssociations(where: {primaryEmail: {_eq: false}}) {
          email
        }
      }

      ${TenantAssociation.relation.companyAssociations}{
          ${CompanyAssociation.selector.companyId}
          ${CompanyAssociation.selector.userId}
          ${CompanyAssociation.selector.status}
          ${CompanyAssociation.relation.company} {
            ${Company.selector.name}
          }
        }

        ${TenantAssociation.relation.projectAssociations}{
            ${ProjectAssociation.selector.projectId}
            ${ProjectAssociation.selector.status}
            ${ProjectAssociation.selector.userId}
            ${ProjectAssociation.selector.role}
            ${ProjectAssociation.relation.project} {
              ${Project.selector.name}
            }
          }     
          

    }
  }
`;

export const GET_PROJECT_ROLES = gql`
query getProjectRoles($searchText : String!, $limit : Int!, $offset : Int! ) { 
  ${ProjectRole.modelName}(offset: $offset, 
    limit: $limit,
    where:{
        ${TenantRole.selector.role}: {_ilike: $searchText}
    }){
    ${ProjectRole.selector.id}
    ${ProjectRole.selector.role}
    ${ProjectRole.selector.deleted}
 }
}
`;

export const GET_SYSTEM_ROLE = gql`
query getSystemRoles($searchText : String!, $offset : Int!, $limit : Int!) { 
  ${TenantRole.modelName}(offset: $offset, 
    limit: $limit,
    where:{
          ${TenantRole.selector.role}: {_ilike: $searchText},
          
    }) {
    ${TenantRole.selector.id}
    ${TenantRole.selector.role}
    ${TenantRole.selector.deleted}
 }
}
`;
// ${TenantRole.selector.id}:{_neq:5}

export const GET_USER_TENANT_COMPANIES = gql`
query getTenantCompanies($searchText : String!, $offset : Int!, $limit : Int!){
  ${TenantCompany.modelName}(
    offset: $offset, 
    limit: $limit,
    where: 
      {
        ${TenantCompany.selector.name}: {_ilike: $searchText}, 
        _and: {active: {_eq: true}}
      },
    order_by: {${TenantCompany.selector.name}: asc}
    )
    {
      ${TenantCompany.selector.id}
      ${TenantCompany.selector.name}
    }
  }
`;

export const GET_USER_BY_EMAIL_ID = gql`
query getUserByEmailId($argEmail : String!, $tenantId : Int!) {
  ${TenantAssociation.modelName}(where: {${TenantAssociation.selector.tenantId}: {_eq: $tenantId},
     _and: {user: {${User.selector.email}: {_ilike: $argEmail}}}}) {
    ${User.modelName} {
      ${User.selector.id}
      ${User.selector.email}
    }
    ${TenantAssociation.selector.tenantId}
  }
}    
`;

export const ASSOCIATE_USER_WITH_PROJECT = gql`
mutation associateUserwithProjects($objects:[ProjectAssociationInput!]!) {
  insert_projectAssociation_mutation(objects:$objects) {
      ${ProjectAssociation.selector.affectedRows}
  }
}`;

export const UPDATE_TENANT_USER = gql`
mutation updateTenantUser($id:uuid!,$firstName:String!,$lastName:String!,$jobTitle:String!,$phone:String) {
  update_user(where: {id: {_eq: $id}}, _set: {firstName: $firstName,lastName:$lastName,jobTitle:$jobTitle,phone:$phone}) {
    ${User.selector.affectedRows}
  }
}
`;

export const UPDATE_TENANT_USER_PHONE_NUMBER = gql`
mutation updateTenantUser($id:uuid!,$phone:String) {
  update_user(where: {id: {_eq: $id}}, _set: {phone:$phone}) {
    ${User.selector.affectedRows}
  }
}
`;

export const INSERT_TENANT_USER_ADDRESS = gql`
  mutation createCompanyAddress($object: [address_insert_input!]!) {
    insert_address(objects: $object) {
      affected_rows
    }
  }
`;

export const UPDATE_TENANT_USER_ADDRESS = gql`
  mutation updateAddress(
    $id: Int!
    $streetNo: String
    $state: String
    $postalCode: String
    $country: String
    $city: String
    $fullAddress: String
    $addressLine2: String
  ) {
    update_address_by_pk(
      pk_columns: { id: $id }
      _set: {
        streetNo: $streetNo
        state: $state
        postalCode: $postalCode
        country: $country
        city: $city
        fullAddress: $fullAddress
        addressLine2: $addressLine2
      }
    ) {
      id
    }
  }
`;

export const UPDATE_TENANT_USER_SECONDARY_EMAIL = gql`
  mutation deleteSecondaryEmail(
    $id: uuid!
    $secondaryEmail: String
    $active: Boolean
  ) {
    insert_userEmailAssociation(
      objects: { email: $secondaryEmail, userId: $id, active: $active }
      on_conflict: {
        constraint: userEmailAssociation_userId_primaryEmail_key
        update_columns: [email, active]
      }
    ) {
      ${User.selector.affectedRows}
    }
  }
`;

export const UPDATE_PROJECT_ASSOCIATION_STATUS = gql`
mutation updateProjectAssociationStatus(
  $projectId:Int!, $userId: uuid!, $status:Int!) {
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
      ${ProjectAssociation.selector.affectedRows}
    }
}`;

export const UPDATE_PROJECT_ASSOCIATION_ROLE = gql`
mutation updateProjectAssociationRole(
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
      ${ProjectAssociation.selector.affectedRows}
    }
}`;

export const UPDATE_COMPANY_ASSOCIATION_STATUS = gql`
mutation updateCompanyAssociationStatus($companyId:Int!,$status:Int!,$userId:uuid!) {
  update_companyAssociation(
    where: {
      _and: {
        ${CompanyAssociation.selector.companyId}: {_eq: $companyId},
        ${CompanyAssociation.selector.userId}: {_eq: $userId}
      }
    },
    _set: {
        ${CompanyAssociation.selector.status}: $status
      }) {
      ${CompanyAssociation.selector.affectedRows}
    }
}`;

export const ASSOCIATE_USER_WITH_COMPANY = gql`

mutation associateUserwithCompany($objects:[${CompanyAssociation.insertInputType}!]!) {
  insert_companyAssociation(objects:$objects) {
      ${CompanyAssociation.selector.affectedRows}

}
}
`;

export const UPDATE_COMPANY_TENANT_ASSOCIATION = gql`
mutation updateTenantCompanyAssociation($objects :[${CompanyAssociation.insertInputType}!]! ) {
  insert_companyAssociation(objects: $objects, on_conflict: {constraint: companyAssociation_userId_companyId_tenantId_key, update_columns: status}) {
  affected_rows
  }
  }
`;

export const UPDATE_USER_TENANT_ROLE = gql`
mutation updateUserTenantRole($userId: uuid!,$role: Int!) {
  update_tenantAssociation(where: {
    ${TenantAssociation.selector.userId}: {_eq: $userId}},
    _set: {${TenantAssociation.selector.role}: $role}) {
    affected_rows
  }
}
`;

export const UPDATE_USER_TENANT_SECONDARY_EMAIL = gql`
  mutation updateSecondaryEmail($email: String!, $userId: uuid!) {
    insert_userEmailAssociation(
      objects: { email: $email, primaryEmail: false, userId: $userId }
      on_conflict: {
        constraint: userEmailAssociation_pkey
        update_columns: primaryEmail
        where: { userId: { _eq: $userId } }
      }
    ) {
      affected_rows
    }
  }
`;

export const UNLOCK_USER_ACCOUNT = gql`
mutation updateUserStatus($userId: uuid!, $status: Int!, $lockedAt: timestamptz!) {
  update_user(where: {id: {_eq: $userId}}, _set: {status: $status, lockedAt: $lockedAt}) {
    affected_rows
  }
}
`;

export const GET_USER_ACCOUNT_STATUS=gql`
query getUserAccountStatus($userId: uuid){user(where: {id: {_eq: $userId}}) { status,id,email }}`;