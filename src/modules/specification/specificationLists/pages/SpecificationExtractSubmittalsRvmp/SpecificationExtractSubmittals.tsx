
import React, { ReactElement, useContext, useState, useEffect } from "react";
import { match, useHistory, useRouteMatch } from "react-router-dom";
import { stateContext } from '../../../../root/context/authentication/authContext';
import Notification, { AlertTypes } from '../../../../shared/components/Toaster/Toaster';
import { setIsLoading } from '../../../../root/context/authentication/action';
import { specificationRoles } from "../../../../../utils/role";
import { client } from '../../../../../services/graphql'
import { GET_CONFIGURATION_LISTS, GET_SUBMITTAL_DETAIL } from "../../graphql/queries/specification";
import SpecificationHeaders from "../../components/SubmittalReviewRvmp/SubmittalReviewHeader/SubmittalReviewHeader";
import SubmittalReviewTabs from "../../components/SubmittalReviewRvmp/SubmittalReviewTabs/SubmittalReviewTabs";
import { SpecificationLibDetailsContext } from '../../context/SpecificationLibDetailsContext';
import "./SpecificationExtractSubmittals.scss";
import PdfTron from "../../components/PdfTronSubmittals/PdfTron";
import {setSpecificationSectionsDetails, setSubmittalList} from "../../context/SpecificationLibDetailsAction";

export interface Params {
    projectId: string;
    submittalId: string;
}

export default function SpecificationExtractSubmittals(): ReactElement {

    const pathMatch: match<Params> = useRouteMatch();
    const { dispatch, state }: any = useContext(stateContext);
    const [fileName, setFileName] = useState<any>({ name: "", description: "" });
    const [specSectionDetails, setSpecSectionDetails] = useState<any>([]);
    const { SpecificationLibDetailsState, SpecificationLibDetailsDispatch }: any = useContext(SpecificationLibDetailsContext);
    const [submittalTypes, setSubmittalTypes] = useState<any>([]);
    const history = useHistory();

    useEffect(() => {
        if (state.selectedProjectToken && state?.projectFeaturePermissons?.canviewSpecifications) {
            fetchSubmittals();
            fetchConfigurationList();
        }
    }, [state.selectedProjectToken, pathMatch.params.submittalId]);

    const fetchSubmittals = async () => {
        dispatch(setIsLoading(true));
        const data = await fetchData(GET_SUBMITTAL_DETAIL,{
            id: pathMatch.params.submittalId,
        })
        if(data?.techspecUploadStatus && data?.techspecUploadStatus[0]) {
            const headerInfo = { ...fileName, name: data.techspecUploadStatus[0].fileName };
            setFileName(headerInfo);
            setSpecSectionDetails(data.techspecUploadStatus[0]);
            SpecificationLibDetailsDispatch(setSubmittalList(data.techspecUploadStatus[0].submittalInfoReviewed?.submittals || []))
        }
        dispatch(setIsLoading(false));
    };

    const fetchConfigurationList = async () => {
        dispatch(setIsLoading(true));
        const data = await fetchData(GET_CONFIGURATION_LISTS,{
            id: pathMatch.params.submittalId,
        })
        if(data?.configurationLists && data.configurationLists[0].configurationValues) {
            setSubmittalTypes(data.configurationLists[0].configurationValues);
        }
        dispatch(setIsLoading(false));
    };

    const fetchData = async (query: any, variables: any) => {
        let responseData;
        try {
            responseData = await client.query({
                query: query,
                variables: variables,
                fetchPolicy: 'network-only',
                context: { role: specificationRoles.viewSpecifications, token: state.selectedProjectToken }
            });

        } catch (error: any) {
            console.log(error)
            Notification.sendNotification('Some error occured on fecth documents', AlertTypes.error);
        } finally {
            return (responseData?.data) ? responseData.data : null;
        }
    }

    const graphqlMutation = async (query: any, variable: any, role: any) => {
        let responseData;
        try {
            responseData = await client.mutate({
                mutation: query,
                variables: variable,
                context: { role: role, token: state.selectedProjectToken }
            })
            return responseData.data;
        } catch (error: any) {
            console.log(error.message);
            Notification.sendNotification('Some error occured on update Model', AlertTypes.error);
        } finally {
            return (responseData?.data) ? responseData.data : null;
        }
    }

    const navigateBack = () => {
        history.push(
            `/specifications/projects/${pathMatch.params.projectId}/library`
        );
    };

    return (
        <div className="section-review">
            <SpecificationHeaders handleBackNav={navigateBack} fileDetails={fileName} submittalTypes={submittalTypes}  />
            <div className="sectionDetails">
                <div className="sectionFile">
                    <PdfTron specSectionDetails={specSectionDetails} />
                </div>
                <div className="sectionReview">
                    <SubmittalReviewTabs submittalTypes={submittalTypes} />
                </div>
            </div>
        </div>
    );
}

