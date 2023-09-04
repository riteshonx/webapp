import { gql } from '@apollo/client';
import { SpecificationsTable } from '../models/specificationTableModel';

// to fetch uploaded files data
export const FETCH_PUBLISHED_DOCUMENTS = gql`query fetchPublishedSpecifications($searchText: String!, $offset: Int!, $limit: Int!) {
    ${SpecificationsTable.modelName} (limit: $limit, offset: $offset, 
                                order_by: {${SpecificationsTable.selector.createdAt}: desc}, 
                                where: {_or: [
                                    {sectionName: {_ilike: $searchText}},
                                    {divisionName: {_ilike: $searchText}},
                                     {divisionNumber: {_ilike: $searchText}},
                                      {sectionNumber: {_ilike: $searchText}},
                                       {fileName: {_ilike: $searchText}}
                                  ]_and: {isDeleted: {_eq: false}}}){
        ${SpecificationsTable.selector.id}
        ${SpecificationsTable.selector.fileName}
        ${SpecificationsTable.selector.divisionName}
        ${SpecificationsTable.selector.divisionNumber}
        ${SpecificationsTable.selector.sectionName}
        ${SpecificationsTable.selector.sectionNumber}
        ${SpecificationsTable.selector.title}
        ${SpecificationsTable.selector.versionDate}
        ${SpecificationsTable.selector.versionName}
        ${SpecificationsTable.selector.updatedBy}
        ${SpecificationsTable.selector.sourceKey}
        ${SpecificationsTable.selector.startPage}
        ${SpecificationsTable.selector.endPage}
        ${SpecificationsTable.selector.isDeleted}
      }
}`;

// to fetch filtered specification dataset
export const FETCH_FILTEREDED_DOCUMENTS = 
  gql`query fetchFilteredSpecification( 
    $versionName: [String!], 
    $versionDate: [date!],
    $offset: Int!, $limit: Int!,
    $searchText: String!
  ) {
  ${SpecificationsTable.modelName} (limit: $limit, offset: $offset, 
                              order_by: {${SpecificationsTable.selector.id}: asc}, 
                              where: {_and: 
                                  [ 
                                    {versionName: {_in: $versionName}}, 
                                    {versionDate: {_in: $versionDate}}
                                  ],
                                  _or: [
                                    {sectionNumber: {_ilike: $searchText}},
                                    {sectionName: {_ilike: $searchText}}
                                  ]},
                                  ){
      ${SpecificationsTable.selector.id}
        ${SpecificationsTable.selector.fileName}
        ${SpecificationsTable.selector.divisionName}
        ${SpecificationsTable.selector.divisionNumber}
        ${SpecificationsTable.selector.sectionName}
        ${SpecificationsTable.selector.sectionNumber}
        ${SpecificationsTable.selector.title}
        ${SpecificationsTable.selector.versionDate}
        ${SpecificationsTable.selector.versionName}
        ${SpecificationsTable.selector.updatedBy}
        ${SpecificationsTable.selector.sourceKey}
        ${SpecificationsTable.selector.startPage}
        ${SpecificationsTable.selector.endPage}
        ${SpecificationsTable.selector.isDeleted}
    }
}`;
// to fetch specification sheets based in id
export const FETCH_SPECIFICATION_DOCUMENT = gql`query fetchSpecificationSheet($id: uuid!) {
    ${SpecificationsTable.modelName}(where: {${SpecificationsTable.selector.id}: {_eq: $id}}) {
      ${SpecificationsTable.selector.id}
      ${SpecificationsTable.selector.fileName}
      ${SpecificationsTable.selector.createdAt}
      ${SpecificationsTable.selector.divisionName}
      ${SpecificationsTable.selector.divisionNumber}
      ${SpecificationsTable.selector.sectionName}
      ${SpecificationsTable.selector.sectionNumber}
      ${SpecificationsTable.selector.title}
      ${SpecificationsTable.selector.versionDate}
      ${SpecificationsTable.selector.versionName}
      ${SpecificationsTable.selector.updatedBy}
      ${SpecificationsTable.selector.sourceKey}
      ${SpecificationsTable.selector.startPage}
        ${SpecificationsTable.selector.endPage}
    }
}`;
// delete section
export const DELETE_SECTION = gql`
    mutation deleteSection ($id: [uuid!], $isDeleted: Boolean) {
      update_techspecSections(where: {id: {_in: $id}}, _set: {isDeleted: $isDeleted}) {
        affected_rows
      }
}`;

//fetch version date
// export const FETCH_VERSION_DATE = gql`query techspecUploadStatus {0
//     ${SpecificationsTable.modelName}(order_by: {createdAt: desc},
//       distinct_on: {${SpecificationsTable.selector.versionDate}},
//       where: {isDeleted: {_eq: false}}) {
//        ${SpecificationsTable.selector.versionDate} 
//     }
// }`;
