
import { gql } from "@apollo/client";

export const FETCH_SCHEDULE_INSIGHT_META_DATA = gql`
query MyQuery {
projectInsightsMetadata(
 order_by: {updatedAt: desc}, limit: 1) {
  LeadtimeMgmntConstraints
  LeadtimePhysicalConstraints
  ChangeOrderIssueReview
  RFIReviewResponse
}
}
`

export const ADD_SCHEDULE_INSIGHT_META_DATA = gql
`
mutation {
    insert_projectInsightsMetadata(objects:
      [{
         LeadtimeMgmntConstraints: {
            max: 4,
            min: 6
          },
          LeadtimePhysicalConstraints: {
            max: 4,
            min: 6
    },
    ChangeOrderIssueReview:{
      max: 4,
      min: 6
    },
    RFIReviewResponse:{
      max: 4,
      min: 6
    }
  }]) {
      returning {
        id
        createdAt
      }
    }
  }
`

export const ADD_INSIGHT_META_DATA = gql`
mutation projectInsightsMetadata ($data : [projectInsightsMetadata_insert_input!]!) {
    insert_projectInsightsMetadata(objects: $data) {
      returning {
        id
        createdAt
      }
    }
  }
`

export const UPDATE_INSIGHT_META_DATA = gql`
mutation updateProjectInsightsMetadata( $LeadtimeMgmntConstraints: jsonb, $LeadtimePhysicalConstraints: jsonb, $RFIReviewResponse: jsonb, $ChangeOrderIssueReview: jsonb){
  update_projectInsightsMetadata(where: {},
                        _set: {LeadtimeMgmntConstraints: $LeadtimeMgmntConstraints,
              LeadtimePhysicalConstraints: $LeadtimePhysicalConstraints,
              RFIReviewResponse: $RFIReviewResponse,
              ChangeOrderIssueReview: $ChangeOrderIssueReview})
  {
    affected_rows     __typename
  }
}
`