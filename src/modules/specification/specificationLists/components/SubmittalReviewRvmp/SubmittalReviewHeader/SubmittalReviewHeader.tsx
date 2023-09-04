import React, { ReactElement, useContext, useEffect } from "react";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import "./SubmittalReviewHeader.scss";
import { Button } from "@material-ui/core";
import { stateContext } from "../../../../../root/context/authentication/authContext";
import Notification, {
  AlertTypes,
} from "../../../../../shared/components/Toaster/Toaster";
import { setIsLoading } from "../../../../../root/context/authentication/action";
import { specificationRoles } from "../../../../../../utils/role";
import { client } from "../../../../../../services/graphql";
import { PUBLISH_SUBMITTAL_INFO_REVIEWED } from "../../../graphql/queries/specification";
import { match, useHistory, useRouteMatch } from "react-router-dom";
import { SpecificationLibDetailsContext } from "../../../context/SpecificationLibDetailsContext";
import { postApiWithProjectExchange } from "src/services/api";

export interface Params {
  projectId: string;
  submittalId: string;
}

export default function SubmittalReviewHeader(props: any): ReactElement {
  const { dispatch, state }: any = useContext(stateContext);
  const { SpecificationLibDetailsState, SpecificationLibDetailsDispatch }: any =
    useContext(SpecificationLibDetailsContext);
  const pathMatch: match<Params> = useRouteMatch();
  const history: any = useHistory();
  const [isPublishDisabled, setIsPublishDisabled] = React.useState(true);

  useEffect(() => {
    if (SpecificationLibDetailsState.submittalList.length !== 0) {
      setIsPublishDisabled(
        SpecificationLibDetailsState.isSubmittalPublishDisabled
      );
    }
  }, [
    SpecificationLibDetailsState.isSubmittalPublishDisabled,
    SpecificationLibDetailsState.submittalList,
  ]);

  const saveAsDraft = async () => {
    dispatch(setIsLoading(true));
    await mutateSubmittalInfoStatus("REVIEWING_SUBMITTALS");
    dispatch(setIsLoading(false));
  };

  const publish = async () => {
    try {
      dispatch(setIsLoading(true));
      const tempPublishData = SpecificationLibDetailsState.submittalList.reduce(
        (result: [any], submittal: any, index: number) => {
          if (
            submittal.notASubmittal !== true &&
            submittal.section_name !== ""
          ) {
            result.push({
              subject: `${submittal.section_number}-${submittal.section_name}`,
              divisionNo: submittal?.division_number,
              divisionName: submittal?.division_name,
              sectionNo: submittal?.section_number,
              sectionName: submittal?.section_name,
              description: submittal?.line_text,
              type:
                props.submittalTypes.find(
                  (type: any) => type.nodeName == submittal?.submittal_type
                )?.id || "",
              specId: submittal.specId,
            });
          }
          return result;
        },
        [] as any
      );

      dispatch(setIsLoading(true));
      const response = await postApiWithProjectExchange(
        `V1/submittals/create`,
        {
          input: {
            formsData: tempPublishData,
          },
          session_variables: { "x-hasura-role": "createForm" },
          action: {},
        },
        state?.selectedProjectToken
      );
      if (response) {
        Notification.sendNotification(
          "Successfully published submittals",
          AlertTypes.success
        );
        await mutateSubmittalInfoStatus("SUBMITTALS_PUBLISHED", true);
      }
    } catch (error: any) {
      dispatch(setIsLoading(false));
      console.log(error);
      Notification.sendNotification(error.message, AlertTypes.error);
    }
  };

  const mutateSubmittalInfoStatus = async (
    status: string,
    isPublish = false
  ) => {
    const submittalResponse: any = await graphqlMutation(
      PUBLISH_SUBMITTAL_INFO_REVIEWED,
      {
        id: pathMatch.params.submittalId,
        submittalInfoReviewed: {
          submittalTypes: props.submittalTypes,
          submittals: SpecificationLibDetailsState.submittalList,
        },
        status: status,
      },
      specificationRoles.updateSpecifications
    );
    if (submittalResponse) {
      const link = isPublish
        ? `/base/projects/${pathMatch.params.projectId}/form/8`
        : `/specifications/projects/${pathMatch.params.projectId}/library`;
      history.push(link);
    }
  };

  const graphqlMutation = async (query: any, variable: any, role: any) => {
    let responseData;
    try {
      responseData = await client.mutate({
        mutation: query,
        variables: variable,
        context: { role: role, token: state.selectedProjectToken },
      });
      return responseData.data;
    } catch (error: any) {
      console.log(error.message);
      Notification.sendNotification(
        "Some error occured on update Model",
        AlertTypes.error
      );
    } finally {
      return responseData?.data ? responseData.data : null;
    }
  };

  return (
    <div className="section-review-header">
      <div className="fileNameSection">
        <ArrowBackIosIcon
          onClick={props.handleBackNav}
          viewBox={"-4 0 24 24"}
          fontSize={"small"}
        />
        <span className="fileName">{props.fileDetails.name}</span>
      </div>
      <div>
        <Button onClick={saveAsDraft} className="btn-secondary">
          Save as Draft
        </Button>
        <Button
          disabled={isPublishDisabled}
          onClick={publish}
          className="btn-primary"
        >
          Publish{" "}
        </Button>
      </div>
    </div>
  );
}
