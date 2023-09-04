import { gql } from "@apollo/client";

export const SUBSCRIBE_EQUIPMENT_TRACKING_INSIGHTS = gql`
  subscription equipmentTrackingInsights($equipmentId: String) {
    equipmentTrackingInsights(
      where: { equipmentId: { _eq: $equipmentId } }
      order_by: { trackingDate: desc }
    ) {
      lastUsed
      carbonUsage
      idlePercentage
      trackingDate
    }
  }
`;

export const SUBSCRIBE_EQUIPMENT_TRACKING_INSIGHTS_TRACKINGDATE = gql`
  subscription equipmentTrackingInsights(
    $equipmentId: String
    $trackingDate: date
  ) {
    equipmentTrackingInsights(
      where: {
        equipmentId: { _eq: $equipmentId }
        trackingDate: { _eq: $trackingDate }
      }
      order_by: { trackingDate: desc }
    ) {
      equipmentId
      lastUsed
      carbonUsage
      idlePercentage
      trackingDate
    }
  }
`;
