import React, { ReactElement, useContext, useEffect, useState } from "react";
import { match, useHistory, useRouteMatch } from "react-router-dom";
import { stateContext } from "../../../../root/context/authentication/authContext";
import { setIsLoading } from "../../../../root/context/authentication/action";
import {
  decodeExchangeToken,
  decodeProjectExchangeToken,
  decodeProjectFormExchangeToken,
} from "../../../../../services/authservice";
import { postApiWithProjectExchange } from "../../../../../services/api";
import { projectContext } from "../../Context/projectContext";
import {
  refreshFeaturesList,
  setAllowedFeaturePermissions,
  setCurrentFeature,
  setFeaturePermissions,
  setFeatureRoles,
  setFormFeaturesList,
  setReset,
} from "../../Context/projectActions";
import { features } from "src/utils/constants";

export interface Params {
  id: string;
  featureId: string;
}

export default function FormHoc(props: any): ReactElement {
  const { dispatch, state }: any = useContext(stateContext);
  const currentMatch: match<Params> = useRouteMatch();
  const { projectState, projectDispatch }: any = useContext(projectContext);
  const [isFetchingToken, setIsFetchingToken] = useState(false);
  const history = useHistory();
  const pathMatch: match<Params> = useRouteMatch();

  useEffect(() => {
    let projectId = -1;
    if (state.currentProject && state?.selectedProjectToken) {
      projectId = Number(
        decodeProjectExchangeToken(state?.selectedProjectToken).projectId
      );
      if (projectId !== state.currentProject.projectId) {
        projectDispatch(setReset());
      }
      setPermission();
    }
  }, [state.currentProject, state?.selectedProjectToken]);

  useEffect(() => {
    if (projectState.formFeaturesList.length > 0) {
      const activeFeature = projectState.formFeaturesList.find(
        (item: any) => item.featureId === Number(pathMatch.params.featureId)
      );
      if (!activeFeature) {
        history.push(
          `/base/projects/${Number(pathMatch.params.id)}/form/${
            projectState.formFeaturesList[0].featureId
          }`
        );
      }
    }
  }, [pathMatch.params.featureId]);

  useEffect(() => {
    if (projectState.allowedFeaturePermissions && state?.selectedProjectToken) {
      const targetPermission = {
        canCreateForm:
          projectState.allowedFeaturePermissions.createForm.indexOf(
            Number(currentMatch.params.featureId)
          ) > -1,
        canViewForm:
          projectState.allowedFeaturePermissions.viewForm.indexOf(
            Number(currentMatch.params.featureId)
          ) > -1,
        canUpdateForm:
          projectState.allowedFeaturePermissions.updateForm.indexOf(
            Number(currentMatch.params.featureId)
          ) > -1,
        canDeleteForm:
          projectState.allowedFeaturePermissions.deleteForm.indexOf(
            Number(currentMatch.params.featureId)
          ) > -1,
      };
      projectDispatch(setFeaturePermissions(targetPermission));
    }
  }, [
    currentMatch.params.featureId,
    projectState.allowedFeaturePermissions,
    state?.selectedProjectToken,
  ]);

  useEffect(() => {
    if (state?.selectedProjectToken && projectState.refreshList) {
      fetchFormFeatures();
    }
  }, [state?.selectedProjectToken, projectState.refreshList]);

  const fetchFormFeatures = async () => {
    try {
      dispatch(setIsLoading(true));
      const payload = {
        input: {
          source: "FORM",
        },
      };
      const responseData = await postApiWithProjectExchange(
        "V1/form/navigationData",
        payload,
        state?.selectedProjectToken
      );
      const targetList: Array<any> = [];
      const viewFormsList = JSON.parse(
        decodeProjectFormExchangeToken(state?.selectedProjectToken)
          .viewFormIds.replace("{", "[")
          .replace("}", "]")
      );
      const withoutQualityControlFeature = responseData.navigationData.filter(
        (item: any) => item.feature !== features.QUALITY_CONTROL
      );
      withoutQualityControlFeature.forEach((item: any) => {
        if (viewFormsList.indexOf(item.featureId) > -1) {
          let featureCount = 0;
          if (item.templates.length > 0) {
            featureCount = item.templates[0].featureCount;
          }
          const newItem = {
            feature: item.caption,
            featureId: item.featureId,
            featureCount,
          };
          targetList.push(newItem);
        }
      });
      const currentFeature = targetList.find(
        (item: any) => item.featureId === Number(currentMatch.params.featureId)
      );
      if (currentFeature) {
        projectDispatch(setFormFeaturesList(targetList));
        if (
          projectState.currentFeature?.id !== currentFeature.featureId ||
          projectState.currentFeature?.count !== currentFeature.featureCount
        ) {
          projectDispatch(
            setCurrentFeature({
              id: currentFeature.featureId,
              feature: currentFeature.feature,
              tenantId: decodeExchangeToken().tenantId,
              count: currentFeature.featureCount,
            })
          );
        }
      } else {
        if (targetList.length > 0) {
          history.push(
            `/base/projects/${Number(currentMatch.params.id)}/form/${
              targetList[0].featureId
            }`
          );
          projectDispatch(setFormFeaturesList(targetList));
          projectDispatch(
            setCurrentFeature({
              id: targetList[0].featureId,
              feature: targetList[0].feature,
              tenantId: decodeExchangeToken().tenantId,
              count: targetList[0].featureCount,
            })
          );
        }
      }
      dispatch(setIsLoading(false));
      projectDispatch(refreshFeaturesList(false));
    } catch (error: any) {
      dispatch(setIsLoading(false));
    }
  };

  //permission
  const setPermission = () => {
    const decodedToken = decodeProjectFormExchangeToken(
      state.selectedProjectToken
    );
    const createFormIds = decodeFormIds(decodedToken.createFormIds);
    const updateFormIds = decodeFormIds(decodedToken.updateFormIds);
    const deleteFormIds = decodeFormIds(decodedToken.deleteFormIds);
    const viewFormIds = decodeFormIds(decodedToken.viewFormIds);
    projectDispatch(setFeatureRoles(decodedToken.allowedRoles));
    const targetPermission: any = {
      canCreateForm:
        createFormIds.indexOf(Number(currentMatch.params.featureId)) > -1,
      canViewForm:
        viewFormIds.indexOf(Number(currentMatch.params.featureId)) > -1,
      canUpdateForm:
        updateFormIds.indexOf(Number(currentMatch.params.featureId)) > -1,
      canDeleteForm:
        deleteFormIds.indexOf(Number(currentMatch.params.featureId)) > -1,
    };
    const allowedFeaturePermissions = {
      createForm: createFormIds,
      viewForm: viewFormIds,
      updateForm: updateFormIds,
      deleteForm: deleteFormIds,
    };
    projectDispatch(setFeaturePermissions(targetPermission));
    projectDispatch(setAllowedFeaturePermissions(allowedFeaturePermissions));
    dispatch(setIsLoading(false));
    setIsFetchingToken(true);
  };

  return (
    <React.Fragment>{isFetchingToken ? props.children : ""}</React.Fragment>
  );
}

export const Roles = {
  canCreateForm: "createForm",
  canViewForm: "viewForm",
  canUpdateForm: "updateForm",
  canDeleteForm: "deleteForm",
};

const decodeFormIds = (argIds: string): Array<number> => {
  return JSON.parse(argIds.replace("{", "[").replace("}", "]"));
};
