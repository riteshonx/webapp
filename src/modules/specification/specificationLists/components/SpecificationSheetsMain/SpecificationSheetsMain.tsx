import { ReactElement, useContext, useEffect, useState } from "react";
import {
  setDivisionsTabStatus,
  setSpecificationDivisionsDetails,
  setSpecificationLibDetails,
  setSpecificationSectionsDetails,
  setSpecificationVersionDetails,
  setSectionsTabStatus,
  setPublishedSpecificationLists,
  setUploadDialog,
  setVersionDateValidate,
  setVersionNameValidate,
  setParsedFileUrl,
  setIsAutoUpdate,
  setSectionPageNum,
  setSectionPanelArray,
  setThumbnailUrl,
  setSpecificationList,
  setSpecificationSheetList,
  setSpecificationView,
  setSpecificationViewerUrl,
  setSubmittalTriggerResponse,
  setSubmittalLibDetails,
  setSectionView,
} from "../../context/SpecificationLibDetailsAction";
import { SpecificationLibDetailsContext } from "../../context/SpecificationLibDetailsContext";
import SpecificationSections from "../SpecificationSection/SpecificationSection";
import SepcificationDivision from "../SpecificationDivision/SpecificationDivision";
import SpecificationVersionInfo from "../SpecificationVersionInfo/SpecificationVersionInfo";
import "./SpecificationSheetsMain.scss";
import ArrowRightAltIcon from "@material-ui/icons/ArrowRightAlt";
import Button from "@material-ui/core/Button";
import { stateContext } from "../../../../root/context/authentication/authContext";

export default function SpecificationSheetsMain(props: any): ReactElement {
  const [sectionsView, setSectionsView] = useState("VERSION_INFO");
  const { SpecificationLibDetailsState, SpecificationLibDetailsDispatch }: any =
    useContext(SpecificationLibDetailsContext);
  const { state }: any = useContext(stateContext);
  //clean the context
  useEffect(() => {
    return () => {
      SpecificationLibDetailsDispatch(setSpecificationLibDetails([]));
      SpecificationLibDetailsDispatch(setSpecificationVersionDetails(null));
      SpecificationLibDetailsDispatch(setSpecificationDivisionsDetails([]));
      SpecificationLibDetailsDispatch(setDivisionsTabStatus(true));
      SpecificationLibDetailsDispatch(setSectionsTabStatus(true));
      SpecificationLibDetailsDispatch(setIsAutoUpdate(false));
      SpecificationLibDetailsDispatch(setParsedFileUrl(null));
      SpecificationLibDetailsDispatch(setUploadDialog(false));
      SpecificationLibDetailsDispatch(setPublishedSpecificationLists([]));
      SpecificationLibDetailsDispatch(setVersionNameValidate(false));
      SpecificationLibDetailsDispatch(setVersionDateValidate(false));
      SpecificationLibDetailsDispatch(setSectionPageNum(0));
      SpecificationLibDetailsDispatch(setSectionPanelArray([]));
      SpecificationLibDetailsDispatch(setThumbnailUrl(null));
      SpecificationLibDetailsDispatch(setSpecificationList([]));
      SpecificationLibDetailsDispatch(setSpecificationSheetList([]));
      SpecificationLibDetailsDispatch(setSpecificationView("list"));
      SpecificationLibDetailsDispatch(setSpecificationViewerUrl(null));
      SpecificationLibDetailsDispatch(setSubmittalTriggerResponse(null));
      SpecificationLibDetailsDispatch(setSubmittalLibDetails([]));
      SpecificationLibDetailsDispatch(setSectionView(null));
    };
  }, []);

  useEffect(() => {
    if (SpecificationLibDetailsState?.specificationLibDetails.length > 0) {
      SpecificationLibDetailsDispatch(
        setSpecificationVersionDetails(
          SpecificationLibDetailsState?.specificationLibDetails[0]
            ?.versionInfoReviewed?.versionInfo
        )
      );
      SpecificationLibDetailsDispatch(
        setSpecificationDivisionsDetails(
          SpecificationLibDetailsState?.specificationLibDetails[0]
            ?.divisionsReviewed?.divisions
        )
      );
      SpecificationLibDetailsDispatch(
        setSpecificationSectionsDetails(
          SpecificationLibDetailsState?.specificationLibDetails[0]
            ?.sectionInfoReviewed?.sections
        )
      );
      // SpecificationLibDetailsDispatch(setParsedFileUrl(SpecificationLibDetailsState?.specificationLibDetails[0]?.sectionInfoReviewed?.s3key));
    }
  }, [SpecificationLibDetailsState?.specificationLibDetails]);

  const toggleView = (viewtype: string) => {
    setSectionsView(viewtype);
    SpecificationLibDetailsDispatch(setSectionView(viewtype));
    if (SpecificationLibDetailsState?.specificationDivisionDetails.length > 0) {
      SpecificationLibDetailsDispatch(
        setSectionPageNum(
          SpecificationLibDetailsState?.specificationDivisionDetails[0]
            ?.start_pages
        )
      );
    }
  };

  const handleTabs = () => {
    sectionsView === "VERSION_INFO"
      ? toggleView("DIVISION")
      : toggleView("SECTIONS");
  };
  const handlePublishSpecifications = () => {
    props.publish();
  };
  const renderTab = () => {
    switch (sectionsView) {
      case "VERSION_INFO":
        return <SpecificationVersionInfo />;
      case "DIVISION":
        return <SepcificationDivision />;
      case "SECTIONS":
        return <SpecificationSections />;
      default:
        return <SpecificationVersionInfo />;
    }
  };

  return (
    <div className="specificationSheets">
      <div className="specificationSheets__header">Specification Section</div>
      <div className="specificationSheets__toggleBtns">
        <div
          className={`btns ${sectionsView === "VERSION_INFO" ? "active" : ""}`}
          onClick={() => toggleView("VERSION_INFO")}
        >
          Version Info
        </div>
        <>
          {false ? (
            <div className="btns disabled">Division</div>
          ) : (
            <div
              className={`btns ${sectionsView === "DIVISION" ? "active" : ""}`}
              onClick={() => toggleView("DIVISION")}
            >
              Division
            </div>
          )}
        </>
        <>
          {false ? (
            <div className="btns disabled">Sections</div>
          ) : (
            <div
              className={`btns ${sectionsView === "SECTIONS" ? "active" : ""}`}
              onClick={() => toggleView("SECTIONS")}
            >
              Sections
            </div>
          )}
        </>
      </div>
      <div className="specificationSheets__contents">{renderTab()}</div>
      <div className="specificationSheets__actions">
        {sectionsView !== "SECTIONS" ? (
          <>
            <Button
              data-testid={"specification-publish"}
              variant="outlined"
              className="btn btn-secondary"
              onClick={handleTabs}
              endIcon={<ArrowRightAltIcon />}
            >
              Next
            </Button>
          </>
        ) : (
          <>
            {state?.projectFeaturePermissons?.cancreateSpecifications && (
              <Button
                data-testid={"specification-publish"}
                variant="outlined"
                className="btn btn-primary"
                onClick={handlePublishSpecifications}
                disabled={
                  SpecificationLibDetailsState?.isPublishDisabled ||
                  SpecificationLibDetailsState?.divisionsTabStatus
                }
              >
                Publish
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
