import { useReducer, useContext, useCallback, useState } from "react";
import useEffectWithToken from "../../hooks/useEffectWithToken";
import {
  fetchQualityControlTemplate,
  fetchCustomListValues,
  fetchAllParentForms,
  fetchFormData,
} from "./requests";
import fetchDataReducer, {
  fetchInitState,
} from "src/modules/shared/reducer/fetchDataReducer";
import withIndicators from "../../hoc/withIndicators";
import QualityControlLandingView from "./QualityControlLandingView";
import { useParams, useHistory } from "react-router-dom";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import {
  extractConfigListIds,
  composeTemplateData,
  enrichFormTemplateWithCustomListValue,
} from "../../transformations";

const getPath = (projectId: number, buildingId: number) => {
  return `/base/qualityControl/projects/${projectId}/building/${buildingId}`;
};

const defaultValues: any = {
  "6d05ee62-0168-408d-8439-ebc6483de457": "true",
  "a8e594c2-6b08-49d5-946d-37b59b023c79": "clear",
};

const QualityControlLanding = () => {
  const { state } = useContext(stateContext);
  const history = useHistory();
  const { projectId, buildingId }: any = useParams();
  const [selectedBuildingId, setSelectedBuildingId] = useState(() => {
    console.log("@@@ Initializing state @@@");
    return buildingId;
  });
  const [qualityControlTemplate, dispatchQualityControlTemplate] = useReducer(
    fetchDataReducer,
    fetchInitState
  );
  const [parentForms, dispatchParentForms] = useReducer(
    fetchDataReducer,
    fetchInitState
  );

  if (!Number(projectId)) {
    return <div>Invalid project Id</div>;
  }

  const handleSelectedBuilding = (item: any) => {
    setSelectedBuildingId(item.id);
    history.push(getPath(state.currentProject?.projectId, item.id));
  };

  const fetchParentForms = useCallback(async () => {
    // fetch all the form related data
    try {
      dispatchParentForms({ type: "INIT_FETCH" });
      const parentForms = await fetchAllParentForms(103);
      dispatchParentForms({
        type: "FETCH_COMPLETED",
        payload: parentForms,
      });
    } catch (e) {
      const errMsg = "Something went wrong while fetching parent forms";
      console.error(errMsg, e);
      dispatchParentForms({ type: "FETCH_ERROR" });
    }
  }, []);

  useEffectWithToken(() => {
    fetchParentForms();
  }, [fetchParentForms]);

  useEffectWithToken(() => {
    async function fetchQualityControlTemplateAndEnrich() {
      try {
        dispatchQualityControlTemplate({ type: "INIT_FETCH" });
        let data = [];
        const templateResponse = await fetchQualityControlTemplate(103);
        if (templateResponse?.length) {
          const [firstTemplateVersion] = templateResponse;
          const { formTemplateFieldData } = firstTemplateVersion;
          data = composeTemplateData(formTemplateFieldData);
          const configListIds = extractConfigListIds(data);
          const customListValues = await fetchCustomListValues(
            configListIds,
            projectId
          );
          data = enrichFormTemplateWithCustomListValue(data, customListValues);
        }
        dispatchQualityControlTemplate({
          type: "FETCH_COMPLETED",
          payload: data,
        });
      } catch (e) {
        const errMsg =
          "Something went wrong while fetching quality control form template";
        console.error(errMsg, e);
        dispatchQualityControlTemplate({ type: "FETCH_ERROR" });
      }
    }
    fetchQualityControlTemplateAndEnrich();
  }, []);

  /*1. Although not necessary to use useEffectWithToken since the data only comes after the project has been selected
    2. This useEffect is used to validate if the buildingId( aka.parent form id is valid or not )*/

  useEffectWithToken(() => {
    if (parentForms.data.length) {
      const [firstItem]: any = parentForms.data;
      const foundInParentForms: any = parentForms.data.find(
        (item: any) => item.id == selectedBuildingId
      );
      if (foundInParentForms) {
        setSelectedBuildingId(foundInParentForms.id);
        history.push(
          getPath(state.currentProject?.projectId, foundInParentForms.id)
        );
      } else {
        console.error(
          `Building id: '${selectedBuildingId}' not present in forms data. Falling back to first item`
        );
        setSelectedBuildingId(firstItem.id);
        history.push(getPath(state.currentProject?.projectId, firstItem.id));
      }
    }
  }, [parentForms.data]);

  /*1. Fetch data of a building only if the id is valid. 
    2. Because of fallback mechanisms applied above, the building Id is always going to be valid. 
    3. Hence, it's safe to only check for the presence of an id */

  const fetchParentFormData = useCallback(() => {
    async function fetchParentFormData() {
      const formData = await fetchFormData(selectedBuildingId);
    }
    if (selectedBuildingId) fetchParentFormData();
  }, [selectedBuildingId]);

  useEffectWithToken(() => {
    fetchParentFormData();
  }, [fetchParentFormData]);

  return (
    <QualityControlLandingView
      buildingIds={parentForms.data}
      templateWithDataIfAny={qualityControlTemplate}
      handleSelectedBuilding={handleSelectedBuilding}
      selectedBuildingId={selectedBuildingId}
      sideContentIndicators={{
        isLoading: parentForms.isLoading,
        isError: parentForms.isError,
        hasDataAfterFetch: parentForms.hasDataAfterFetch,
      }}
      mainContentIndicators={{
        isLoading: qualityControlTemplate.isLoading,
        isError: qualityControlTemplate.isError,
        hasDataAfterFetch: qualityControlTemplate.hasDataAfterFetch,
      }}
    />
  );
};

const QualityControlLandingWithIndicators = withIndicators(
  QualityControlLandingView
);

export default QualityControlLanding;
