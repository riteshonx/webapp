import { gql } from "@apollo/client";
import { Status } from "../../../../../utils/constants";
import { TenantCompany, CompanyAssociation, TenantAssociation, TenantRole, User, Company, CompanyMaster } from "../models/companyModel";

// to fetch lists of tenant companies
export const FETCH_TENANT_COMPANIES= gql`query fetchTenantCompanies($limit: Int!, $offset: Int!, $searchText: String!) {
    ${TenantCompany.modelName}(limit: $limit, offset: $offset, order_by: {${TenantCompany.selector.name}: asc},
        where: {${TenantCompany.selector.name}: {_ilike: $searchText}}) {
        ${TenantCompany.selector.id}
        ${TenantCompany.selector.name}
        ${TenantCompany.selector.active}
        ${TenantCompany.selector.address}
        ${TenantCompany.selector.companyId}
        ${TenantCompany.selector.trade}
        ${TenantCompany.selector.contactInfo}
        ${TenantCompany.selector.location}
        addresses {
          fullAddress
        }
        performanceParameters
        overallRating
    }  
}
`

export const FETCH_COMPANY_COUNT = gql`query fetchTenantCompanyCount($searchText: String!) {
  tenantCompanyAssociation_aggregate(where: {name: {_ilike: $searchText}}) {
  aggregate {
  count
  }
  }
  }`

// market company
export const FETCH_MASTER_COMPANY= gql`query fetchMasterCompany($searchText: String, $CompanyIds: [Int!]) {
  ${CompanyMaster.modelName}(where: { ${CompanyMaster.selector.name}: {_ilike: $searchText},
                                      ${CompanyMaster.selector.parentCompanyId}: {_is_null: true},
                                      ${CompanyMaster.selector.id}: {_nin: $CompanyIds}
                                    }) {
    ${CompanyMaster.selector.id}
    ${CompanyMaster.selector.name}
    ${CompanyMaster.selector.verified}
  } 
}
`
//fetch market company by name
export const FETCH_MASTER_COMPANY_BY_NAME= gql`query fetchMasterCompanyByName($searchText: String, $CompanyIds: [Int!]) {
  ${CompanyMaster.modelName}(where: {${CompanyMaster.selector.name}: {_ilike: $searchText},
                                     ${CompanyMaster.selector.parentCompanyId}: {_is_null: true},
                                     ${CompanyMaster.selector.id}: {_nin: $CompanyIds}
                                    }) {
    ${CompanyMaster.selector.id}
    ${CompanyMaster.selector.name}
    ${CompanyMaster.selector.verified}
  } 
}`

// fetch company details by ID
export const FETCH_COMPANY_BY_ID= gql`query fetchMyCompaniesById($id: Int!) {
  ${TenantCompany.modelName}(where: {${TenantCompany.selector.id}: {_eq: $id}}) {
    ${TenantCompany.selector.id}
    ${TenantCompany.selector.name}
    ${TenantCompany.selector.active}
    ${TenantCompany.selector.address}
    ${TenantCompany.selector.companyId}
    ${TenantCompany.selector.trade}
    ${TenantCompany.selector.contactInfo}
    ${TenantCompany.selector.location}
    ${TenantCompany.selector.type}
    ${TenantCompany.selector.services}
    companyMaster {
      id
      name
    }
    addresses {
      addressLine1
      addressLine2
      fullAddress
      city
      country
      id
      postalCode
      state
      streetNo
      id
    }
    tenant {
      primaryCompany
      tenantCompanyAssociation {
        name
      }
    }
    performanceParameters
    overallRating
  }
}
`

// fetch tenant company by name
export const FETCH_COMPANY_BY_NAME= gql`query fetchMyCompaniesByName($searchText: String!) {
  ${TenantCompany.modelName}(where: {${TenantCompany.selector.name}: {_ilike: $searchText}}) {
    ${TenantCompany.selector.id}
    ${TenantCompany.selector.name}
    ${TenantCompany.selector.active}
  }
}`

// fetch tenant company by company ID
export const FETCH_COMPANY_BY_COMPANY_ID= gql`query fetchMyCompaniesByCompanyID($searchText: String!) {
  ${TenantCompany.modelName}(where: {${TenantCompany.selector.companyId}: {_ilike: $searchText}}) {
    ${TenantCompany.selector.id}
    ${TenantCompany.selector.name}
    ${TenantCompany.selector.active}
    ${TenantCompany.selector.companyId}
  }
}`


// add new company
export const INSERT_NEW_COMPANY = gql`mutation addTenantCompany($name: String!, $companyAliasName: String, 
  $type: String!, $companyId: String, $location: geography) {
  insert_company_mutation(name: $name, companyAliasName: $companyAliasName, type: $type,
       companyId: $companyId, location:$location) {
      id
      message
  }
}`;

// add new company with parent ID
export const INSERT_NEW_COMPANY_WITH_PARENTT_ID = gql`mutation addTenantCompany($name: String!, $companyAliasName: String,
   $type: String!, $masterCompanyId: Int!, $companyId: String, $location: geography) {
  insert_company_mutation(name: $name, companyAliasName: $companyAliasName, type: $type, masterCompanyId: $masterCompanyId,
    companyId: $companyId, location:$location) {
    id
    message
  }
}`;


// update company
export const UPDATE_COMPANY_DETAILS = gql`mutation updateTenantCompany($id:Int!, $tenantId: Int!, $companyName:String!,$companyId:String!,
  $contactInfo:jsonb, $services: String, $type: String, $address:jsonb, $trade: _varchar, $location: point) {
  update_tenantCompanyAssociation(
    where: {
      id: {_eq: $id}, 
      tenantId: {_eq: $tenantId}
    },
    _set: {
        name: $companyName
        companyId: $companyId
        contactInfo: $contactInfo
        services: $services
        type: $type
        address: $address
        trade: $trade
        location: $location
      }) {
        affected_rows
    }
}`;

// update company status
export const UPDATE_COMPANY_STATUS = gql`mutation updateCompanyStatus($id: Int!, $tenantId: Int!, $active: Boolean!) {
  update_tenantCompanyAssociation(where: {id: {_eq: $id}, tenantId: {_eq: $tenantId}}, _set: {active: $active}) {
    affected_rows
  }
}`;


// fetch compnay tenants
export const FETCH_TENANT_COMPANY_USERS= gql`query fetchTenantCompanyUsers($limit: Int!, $offset: Int!, 
    $fName: String!, $status: Int) {
      tenantAssociation(
        offset: $offset, 
        limit: $limit,
          where: {
            _and: {
              user: {
                _or:[
                  {email: {_ilike: $fName}},
                  {firstName: {_ilike: $fName}},
                  {lastName: {_ilike: $fName}}
                ]
              }
            }
          },
          order_by: {
            status: desc,
            user: {
              firstName: asc
            }
          }
        ) {
          status
          tenantRole{
            role
          }
          user{
            id
            email
            firstName
            lastName
            jobTitle
            phone
          }
          companyAssociations{
            status
            company {
              name
              id
            }
          }
    }
}
`

export const FETCH_TENANT_COMPANY_USERS_BY_FULL_NAME = gql`query fetchTenantCompanyUsers($limit: Int!, $offset: Int!, 
  $fName: String!, $lName: String!, $status: Int) {
    tenantAssociation(
      offset: $offset, 
      limit: $limit,
        where: {
          _and: {
            user: {
              _and: {
                lastName: {_ilike: $lName},
                 _or:[
                   {firstName: {_ilike: $fName}},
                   {email: {_ilike: $fName}}
                  ]
              }
            }
          }
        },
        order_by: {
          status: desc,
          user: {
            firstName: asc
          }
        }
      ) {
        status
        tenantRole{
          role
        }
        user{
          id
          email
          firstName
          lastName
          jobTitle
          phone
        }
        companyAssociations{
          status
          company {
            name
            id
          }
        }
  }
}
`

// fetch company associations
export const FETCH_COMPANY_USERS= gql`query fetchCompanyUsers($limit: Int!, $offset: Int!, $CompanyId: Int!,
    $status: Int, $fName: String!) {
      companyAssociation(
        offset: $offset, 
        limit: $limit,
        where: {
            _and: { 
              companyId: {_eq: $CompanyId}, 
              status: {_neq: ${Status.deactive}}
            tenantAssociation: {
              user: {
                            _or: [
                            {email: {_ilike: $fName}},
                            {firstName: {_ilike: $fName}},
                            {lastName: {_ilike: $fName}}
                        ]
                    }
            }
        }
      }, 
      order_by: {
        tenantAssociation: {
          status: desc,
            user: {
              firstName: asc
            }
        }
      }
    ) {
      tenantAssociation {
        status
        user {
          id
          email
          firstName
          lastName
          jobTitle
          phone
          }
          tenantRole{
            role
          }
        }
    }
}
`;

export const FETCH_COMPANY_USERS_BY_FULL_NAME= gql`query fetchCompanyUsers($limit: Int!, $offset: Int!, $CompanyId: Int!,
  $status: Int, $fName: String!, $lName: String!) {
    companyAssociation(
      offset: $offset, 
      limit: $limit,
      where: {
          _and: { 
            companyId: {_eq: $CompanyId}, 
            status: {_neq: ${Status.deactive}}
          tenantAssociation: {
            user: {
                  _and: {
                    lastName: {_ilike: $lName},
                    _or:[
                      {firstName: {_ilike: $fName}},
                      {email: {_ilike: $fName}}
                      ]
                  }
                }
          }
      }
    }, 
    order_by: {
      tenantAssociation: {
        status: desc,
          user: {
            firstName: asc
          }
      }
    }
  ) {
    tenantAssociation {
      status
      user {
        id
        email
        firstName
        lastName
        jobTitle
        phone
        }
        tenantRole{
          role
        }
      }
  }
}
`;

// associate user with company
export const ASSOCIATE_USER_COMPANY = gql`mutation addUSerToCompany($objects:[${CompanyAssociation.insertInputType}!]!) {
  insert_companyAssociation(objects:$objects) {
    ${CompanyAssociation.selector.affectedRows}
  }
}`;


// update company association
export const UPDATE_COMPANY_ASSOCIATION = gql`mutation updateCompanyAssociation($companyId:Int!, $status:Int!, $userId:uuid!) {
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

export const CREATE_COMPANY_LOCATION=gql`
  mutation createCompanyAddress($object:  [address_insert_input!]!) {
    insert_address(objects: $object) {
      affected_rows
    }
}`;

export const UPDATE_COMPANY_LOCATION=gql`mutation updateAddress($id: Int!,$streetNo: String,$state: String,$postalCode: String,
    $country: String, $city: String, $addressLine2: String, $addressLine1:  String,$fullAddress: String) {
    update_address_by_pk(pk_columns: {id: $id}, _set: {streetNo: ,$streetNo,
    state:$state,
    postalCode:$postalCode,
    country:$country,
    city:$city,
    addressLine2:$addressLine2,
    addressLine1:$addressLine1,
    fullAddress: $fullAddress
  }) {
      id
    }
}`;

// update company ratings
export const UPDATE_COMPANY_RATINGS = gql`mutation updateCompanyRatings($id: Int!, $tenantId: Int!, $performanceParameters: jsonb!) {
  update_tenantCompanyAssociation(where: {id: {_eq: $id}, tenantId: {_eq: $tenantId}}, _set: {performanceParameters: $performanceParameters}) {
    affected_rows
  }
}`;