import { ApolloQueryResult} from "@apollo/client";
import { client } from "src/services/graphql";
import { FETCH_SCHEDULE_INSIGHT_META_DATA ,ADD_INSIGHT_META_DATA,UPDATE_INSIGHT_META_DATA} from "../../graphql/models/scheduleInsightMetaData";
import { getProjectExchangeToken } from "src/services/authservice";




export const getScheduleInsightMetaData = async(token:string )=>{
    const response:ApolloQueryResult<any> = await client.query({
         query:FETCH_SCHEDULE_INSIGHT_META_DATA,
        context:{
            role:"viewMyProjects",
            token:token
        },
        fetchPolicy: 'network-only',
         variables:{
            // projectId:Number(projectId),
            // tenantId:Number(tenantId)
        },
      
    })
    return response.data;
}
export const AddScheduleInsightMetaData = async(token:any,LeadtimePhysicalConstraints:any,LeadtimeMgmntConstraints:any,RFIReviewResponse:any,ChangeOrderIssueReview:any )=>{
    const InsightsData={
        LeadtimePhysicalConstraints:LeadtimePhysicalConstraints,
        LeadtimeMgmntConstraints:LeadtimeMgmntConstraints,
        RFIReviewResponse:RFIReviewResponse,
        ChangeOrderIssueReview:ChangeOrderIssueReview
    }
    const response = await client.mutate({
        mutation:ADD_INSIGHT_META_DATA,
        context:{
            role:"updateMyProject",
            token:token
        },
        fetchPolicy: 'network-only',
        variables:{
        data:InsightsData
        }
    })
    return response.data;
}

export const UpdateInsights = async (token: string,  LeadtimePhysicalConstraints: any,LeadtimeMgmntConstraints: any, RFIReviewResponse: any, ChangeOrderIssueReview: any) => {
    const res = await client.mutate({
        mutation: UPDATE_INSIGHT_META_DATA,
        context: {
            role: "updateMyProject",
            token:token
        },
        variables: {
            LeadtimeMgmntConstraints,
            LeadtimePhysicalConstraints,
            RFIReviewResponse,
            ChangeOrderIssueReview
        }
    })
    return res.data;
}