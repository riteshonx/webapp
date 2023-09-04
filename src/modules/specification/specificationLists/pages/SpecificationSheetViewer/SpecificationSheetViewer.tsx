import { ReactElement, useContext, useEffect, useState } from "react";
import { match, useHistory, useRouteMatch } from "react-router-dom";
import { client } from "../../../../../services/graphql";
import { specificationRoles } from "../../../../../utils/role";
import { setIsLoading } from "../../../../root/context/authentication/action";
import { stateContext } from "../../../../root/context/authentication/authContext";
import SpeecificationViewerHeaders from "../../components/SpecificationViewerHeader/SpecificationViewerHeader";
import SpecificationViewerLeftBar from "../../components/SpecificationViewerLeftBar/SpecificationViewerLeftBar";
import PdfViewer from "../../components/PDFViewer/PDFViewer";
import {
  FETCH_SPECIFICATION_DOCUMENT,
  FETCH_PUBLISHED_DOCUMENTS,
} from "../../graphql/queries/specificationTable";
import "./SpecificationSheetViewer.scss";
import Notification, {
  AlertTypes,
} from "../../../../shared/components/Toaster/Toaster";
import { postApi } from "../../../../../services/api";
import { SpecificationLibDetailsContext } from "../../context/SpecificationLibDetailsContext";
import {
  setSectionPageNum,
  setSpecificationSheetList,
  setSpecificationViewerUrl,
} from "../../context/SpecificationLibDetailsAction";
import NoDataMessage from "../../../../shared/components/NoDataMessage/NoDataMessage";

export interface Params {
  projectId: string;
  documentId: string;
}

const noPermissionMessage = `You don't have permission to view specification viewer`;

export default function SpecificationSheetViewer(): ReactElement {
  const history = useHistory();
  const pathMatch: match<Params> = useRouteMatch();
  const { dispatch, state }: any = useContext(stateContext);
  const [specificationSheetsDetails, setSpecificationSheetsDetails] =
    useState<any>({});
  const { SpecificationLibDetailsDispatch }: any = useContext(
    SpecificationLibDetailsContext
  );
  useEffect(() => {
    if (
      pathMatch.path.includes("/specifications/projects/") &&
      pathMatch.path.includes("/pdf-viewer") &&
      state.selectedProjectToken &&
      state?.projectFeaturePermissons?.canviewSpecifications
    ) {
      fetchSpecificationSheet();
    }
  }, [state.selectedProjectToken, pathMatch.params.projectId]);

  useEffect(() => {
    if (
      pathMatch.path.includes("/specifications/projects/") &&
      pathMatch.path.includes("/pdf-viewer") &&
      state.selectedProjectToken &&
      state?.projectFeaturePermissons?.canviewSpecifications
    ) {
      fetchSpecificationSheet();
    }
  }, [pathMatch.params.documentId]);

  useEffect(() => {
    return () => {
      SpecificationLibDetailsDispatch(setSpecificationSheetList([]));
      SpecificationLibDetailsDispatch(setSpecificationViewerUrl(null));
    };
  }, []);

  const navigateBack = () => {
    history.push(
      `/specifications/projects/${pathMatch.params.projectId}/lists`
    );
  };

  //fetch published specifiction
  // const fetchPublishedSpecifications = async () => {
  //   try {
  //     dispatch(setIsLoading(true));
  //     const specificationLibraryResponse = await client.query({
  //       query: FETCH_PUBLISHED_DOCUMENTS,
  //       variables: {
  //         searchText: `%${debounceName}%`,
  //         offset: 0,
  //         limit: 1000,
  //       },
  //       fetchPolicy: "network-only",
  //       context: {
  //         role: specificationRoles.viewSpecifications,
  //         token: state.selectedProjectToken,
  //       },
  //     });
  //     const specificationLibraries: any = [];
  //     if (specificationLibraryResponse?.data?.techspecSections.length > 0) {
  //       specificationLibraryResponse?.data?.techspecSections.forEach(
  //         (item: any) => {
  //           specificationLibraries.push(item);
  //         }
  //       );
  //     }
  //     dispatch(setIsLoading(false));
  //   } catch (error) {
  //     console.log(error);
  //     Notification.sendNotification(error, AlertTypes.warn);
  //     dispatch(setIsLoading(false));
  //   }
  // };

  const fetchSpecificationSheet = async () => {
    try {
      dispatch(setIsLoading(true));
      const specificationLibraryResponse = await client.query({
        query: FETCH_SPECIFICATION_DOCUMENT,
        variables: {
          id: `${pathMatch.params.documentId}`,
        },
        fetchPolicy: "network-only",
        context: {
          role: specificationRoles.viewSpecifications,
          token: state.selectedProjectToken,
        },
      });
      const specificationLibraries: any = [];
      if (specificationLibraryResponse?.data?.techspecSections.length > 0) {
        specificationLibraryResponse?.data?.techspecSections.forEach(
          (item: any) => {
            specificationLibraries.push(item);
          }
        );
      }
      if (specificationLibraries.length > 0) {
        setSpecificationSheetsDetails(specificationLibraries[0]);
        SpecificationLibDetailsDispatch(
          setSpecificationSheetList(specificationLibraries)
        );
        SpecificationLibDetailsDispatch(
          setSectionPageNum(specificationLibraries[0].startPage)
        );
      }
      dispatch(setIsLoading(false));
    } catch (error) {
      console.log(error);
      Notification.sendNotification(
        "Please check back in a few minutes, this section file is still being generated.",
        AlertTypes.warn
      );
      dispatch(setIsLoading(false));
    }
  };

  return (
    <div className="spec-PDFviewer">
      <SpeecificationViewerHeaders
        navigateBack={navigateBack}
        specificationSheetsDetails={specificationSheetsDetails}
      />
      {state.projectFeaturePermissons ? (
        state?.projectFeaturePermissons?.canviewSpecifications ? (
          <div className="spec-PDFviewer__main">
            <SpecificationViewerLeftBar />
            <PdfViewer
              specificationSheetsDetails={specificationSheetsDetails}
            />
          </div>
        ) : !state.isLoading ? (
          <div className="spec-noViewPermOrPleaseWait">
            <NoDataMessage message={noPermissionMessage} />
          </div>
        ) : (
          ""
        )
      ) : (
        <div className="spec-noViewPermOrPleaseWait">Please wait...</div>
      )}
    </div>
  );
}
