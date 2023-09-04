import { gql } from '@apollo/client';

// @todo should setup type of metadata
const EquipmentDataSubscriptionGQL = gql`
  subscription EquipmentDataSubscription {
    equipmentData {
      model
      oemName
      equipmentId
      equipmentTrackings(
        where: { trackingParameter: { _eq: "Location" } }
        order_by: { trackingTimestamp: desc }
        limit: 10
      ) {
        metadata
        trackingParameter
        trackingTimestamp
      }
      equipmentId
    }
  }
`;

export default EquipmentDataSubscriptionGQL;
