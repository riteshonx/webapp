import React, { useContext, useReducer } from "react";
import Notification, {
  AlertTypes,
} from "../../../../modules/shared/components/Toaster/Toaster";
import { postApiWithProjectExchange } from "../../../../services/api";
import { decodeProjectFormExchangeToken } from "../../../../services/authservice";
import { client } from "../../../../services/graphql";
import { featureFormRoles } from "../../../../utils/role";
import { setIsLoading } from "../../../root/context/authentication/action";
import { stateContext } from "../../../root/context/authentication/authContext";
import {
  DELETE_TASK_FORM_LINK,
  FETCH_LIST_FORMS,
  GET_TASK_LINKED_FORM,
  INSERT_TASK_FORM_LINK,
  UPDATE_LINK_FORM,
} from "../../graphql/queries/dataLinks";
import { priorityPermissions } from "../../permission/scheduling";
import EditProjectPlanContext from "../editProjectPlan/editProjectPlanContext";
import EditProjectPlanLinksContext from "./editProjectPlanLinksContext";
import editProjectPlanLinksReducer from "./editProjectPlanLinksReducer";
import {
  DRAFT_SELECTED_FORM_LINKS,
  FORM_FEATURES,
  GET_LINKED_FORM,
  SELECT_FEATURE,
  SELECT_FEATURE_FORM_LIST,
} from "./types";

const editProjectPlanLinksState = (props: any) => {
  const initialState = {
    currentTaskLinkedForm: [],
    formFeatures: [],
    selectedFeature: null,
    selectedFormLinks: [],
    selectedFeatureFormsList: [],
    draftSelectedFormLinks: [],
    formStatus: "",
  };

  const [state, dispatch] = useReducer(
    editProjectPlanLinksReducer,
    initialState
  );
  const authContext: any = useContext(stateContext);
  const editProjectPlanContext = useContext(EditProjectPlanContext);

  const { currentTaskConstraint, getConstraintsByTaskId } =
    editProjectPlanContext;

  const selectFeature = (payload: any) => {
    dispatch({
      type: SELECT_FEATURE,
      payload,
    });
  };

  const setSelectedFeatureFormList = (payload: any) => {
    dispatch({
      type: SELECT_FEATURE_FORM_LIST,
      payload,
    });
  };

  const setFormFeature = (payload: any) => {
    dispatch({
      type: FORM_FEATURES,
      payload,
    });
  };

  const setDraftSelectedFormLinks = (payload: any) => {
    dispatch({
      type: DRAFT_SELECTED_FORM_LINKS,
      payload,
    });
  };

  const fetchFormData = async () => {
    try {
      authContext.dispatch(setIsLoading(true));
      const responseData: any = await client.query({
        query: FETCH_LIST_FORMS,
        variables: {
          featureId: state.selectedFeature.featureId,
        },
        fetchPolicy: "network-only",
        context: {
          role: featureFormRoles.viewForm,
          token: authContext?.state?.selectedProjectToken,
        },
      });
      const listOfForms: Array<any> = [];
      if (responseData.data.listForms_query.data.length > 0) {
        const featureAutoId = "c8ddff9e-aa24-4a3b-be40-33967a28a6f6";
        // if (state.selectedFeature.featureId === 2) {
        //   featureAutoId = `RFI ID`;
        // } else if (state.selectedFeature.featureId === 8) {
        //   featureAutoId = `Submittal ID`;
        // } else {
        //   featureAutoId = "ID";
        // }

        responseData.data.listForms_query.data.forEach((item: any) => {
          const openForm = item.formsData.filter(
            (field: any) =>
              field.caption === "Status" 
              // && field.value !== "CLOSED"
          );
          if (openForm.length > 0) {
            const newitem: any = {
              id: item?.id,
              label: "",
              feature: state.selectedFeature?.feature,
              featureId: state.selectedFeature.featureId,
            };
            //Determine the correct caption for the subject field based on the featureId(CO)
            const subjectFieldCaption = 
            state.selectedFeature.featureId === 140 ? "Title" : "Subject";
            const subjectfield = item.formsData.find(
              (field: any) => field?.caption.toLowerCase() === subjectFieldCaption.toLowerCase()
            );
            const autoIncrementId = item.formsData.find(
              (field: any) => field.elementId === featureAutoId
            );
            if (autoIncrementId) {
              newitem.targetAutoIncremenId = autoIncrementId.value;
            }
            if (subjectfield) {
              newitem.label = subjectfield.value;
            }
            listOfForms.push(newitem);
          }
        });
      }
      state.currentTaskLinkedForm.forEach((element: any) => {
        listOfForms.forEach((formitem: any) => {
          if (formitem.id === element.formId) {
            formitem.isSelected = true;
            formitem.isDisabled = true;
            formitem.relation = element.relation;
          }
        });
      });
      setSelectedFeatureFormList(listOfForms);
      authContext.dispatch(setIsLoading(false));
    } catch (error: any) {
      console.log(error);
      authContext.dispatch(setIsLoading(false));
    }
  };

  const fetchFormFeatures = async () => {
    try {
      authContext.dispatch(setIsLoading(true));
      setFormFeature([]);
      const payload = {};

      const responseData = await postApiWithProjectExchange(
        "V1/form/navigationData?source=DEFAULT",
        payload,
        authContext?.state?.selectedProjectToken
      );
      const targetList: Array<any> = [];
      const viewFormsList = JSON.parse(
        decodeProjectFormExchangeToken(authContext?.state?.selectedProjectToken)
          .viewFormIds.replace("{", "[")
          .replace("}", "]")
      );
      responseData.navigationData.forEach((item: any) => {
        if (viewFormsList.indexOf(item.featureId) > -1) {
          const newItem = {
            feature: item.caption,
            featureId: item.featureId,
            featureCount: item.templates[0].featureCount,
            displayCount: item.templates[0].featureCount,
          };
          targetList.push(newItem);
        }
      });
      setFormFeature(targetList);
      if (targetList.length > 0) {
        selectFeature(targetList[0]);
      }
      authContext.dispatch(setIsLoading(false));
    } catch (error: any) {
      authContext.dispatch(setIsLoading(false));
    }
  };

  const linkFormToTask = async (taskId: any, linkData: any) => {
    try {
      authContext.dispatch(setIsLoading(true));

      const response = await client.mutate({
        mutation: INSERT_TASK_FORM_LINK,
        variables: { taskId: taskId, linkData: linkData },
        context: {
          role: priorityPermissions("create"),
          token: authContext.state.selectedProjectToken,
        },
      });

      if (linkData.length === 1) {
        Notification.sendNotification(
          "Link added successfully",
          AlertTypes.success
        );
      } else if (linkData.length > 1) {
        Notification.sendNotification(
          "Link(s) added successfully",
          AlertTypes.success
        );
      }

      getLinkedForm(taskId);
      authContext.dispatch(setIsLoading(false));
    } catch (error: any) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(error.message, AlertTypes.error);
    }
  };

  const getLinkedForm = async (taskId: any) => {
    try {
      authContext.dispatch(setIsLoading(true));

      const response = await client.query({
        query: GET_TASK_LINKED_FORM,
        variables: { taskId: taskId },
        fetchPolicy: "network-only",
        context: {
          role: priorityPermissions("view"),
          token: authContext.state.selectedProjectToken,
        },
      });

      const constraintMap = new Map();
      currentTaskConstraint.forEach((constraint: any) => {
        if (constraint.linkId) {
          constraintMap.set(constraint.linkId, constraint);
        }
      });

      const data = response.data.linkFormTask.map((link: any) => ({
        id: link.id,
        linkType: link.linkType.name,
        subject:
          link.form.formsData &&
          link.form.formsData.length &&
          link.form.formsData[0].valueString
            ? link.form.formsData[0].valueString
            : "-",
        formId: link.form.id,
        feature: link.form.projectFeature.feature,
        featureId: link.form.projectFeature.id,
        constraint: constraintMap.get(link.id) ? true : false,
      }));

      dispatch({ type: GET_LINKED_FORM, payload: data });
      authContext.dispatch(setIsLoading(false));
    } catch (error: any) {
      console.log("error: ", error);
      authContext.dispatch(setIsLoading(false));
    }
  };

  const deleteLinkedForm = async (linkIds: any, taskId: any) => {
    try {
      authContext.dispatch(setIsLoading(true));
      const response = await client.mutate({
        mutation: DELETE_TASK_FORM_LINK,
        variables: {
          linkIds: linkIds,
          taskId: taskId,
        },
        context: {
          role: priorityPermissions("delete"),
          token: authContext.state.selectedProjectToken,
        },
      });

      Notification.sendNotification(
        "Link removed successfully",
        AlertTypes.success
      );
      getLinkedForm(taskId);
      getConstraintsByTaskId(taskId);

      authContext.dispatch(setIsLoading(false));
    } catch (error: any) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(error.message, AlertTypes.error);
    }
  };

  const updateLinkedForm = async (linkId: any, linkTypeId: any) => {
    try {
      authContext.dispatch(setIsLoading(true));

      const response = await client.mutate({
        mutation: UPDATE_LINK_FORM,
        variables: {
          id: linkId,
          linkTypeId: linkTypeId,
        },
        context: {
          role: priorityPermissions("update"),
          token: authContext.state.selectedProjectToken,
        },
      });
      authContext.dispatch(setIsLoading(false));
    } catch (error: any) {
      authContext.dispatch(setIsLoading(false));
    }
    // dispatch({ type: UPDATE_LINKED_FORM, payload: link });
  };
  return (
    <EditProjectPlanLinksContext.Provider
      value={{
        formFeatures: state.formFeatures,
        selectedFeature: state.selectedFeature,
        selectedFormLinks: state.selectedFormLinks,
        selectedFeatureFormsList: state.selectedFeatureFormsList,
        draftSelectedFormLinks: state.draftSelectedFormLinks,
        formStatus: state.formStatus,
        currentTaskLinkedForm: state.currentTaskLinkedForm,
        selectFeature: selectFeature,
        setSelectedFeatureFormList: setSelectedFeatureFormList,
        setFormFeature: setFormFeature,
        setDraftSelectedFormLinks: setDraftSelectedFormLinks,
        fetchFormFeatures: fetchFormFeatures,
        fetchFormData: fetchFormData,
        linkFormToTask: linkFormToTask,
        getLinkedForm: getLinkedForm,
        deleteLinkedForm: deleteLinkedForm,
        updateLinkedForm: updateLinkedForm,
      }}
    >
      {props.children}
    </EditProjectPlanLinksContext.Provider>
  );
};

export default editProjectPlanLinksState;
