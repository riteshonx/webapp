import { Tooltip } from "@material-ui/core";
import React, { ReactElement, useContext, useEffect } from "react";
import { postApiWithProjectExchange } from "../../../../../services/api";
import { decodeProjectFormExchangeToken } from "../../../../../services/authservice";
import { client } from "../../../../../services/graphql";
import { LinkRelationship } from "../../../../../utils/constants";
import { featureFormRoles } from "../../../../../utils/role";
import { setIsLoading } from "../../../../root/context/authentication/action";
import { stateContext } from "../../../../root/context/authentication/authContext";
import {
  setFormFeature,
  setselectedFeature,
  setSelectedFeatureFormList,
} from "../../Context/link/linkAction";
import { LinkContext } from "../../Context/link/linkContext";
import { projectContext } from "../../Context/projectContext";
import { FETCH_LIST_FORMS } from "../../graphql/queries/rfi";
import FormLinkTable from "../FormsLinkTable/FormsLinkTable";
import "./FormToFormLinkTabOption.scss";

function FormLinkOption(): ReactElement {
  const { linkState, linkDispatch }: any = useContext(LinkContext);
  const { projectState }: any = useContext(projectContext);
  const { state, dispatch }: any = useContext(stateContext);

  const { formToFormLinks } = linkState;

  useEffect(() => {
    fetchFormFeatures();
  }, []);

  useEffect(() => {
    if (formToFormLinks?.selectedFeature?.featureId) {
      fetchFormData();
    }
  }, [formToFormLinks.selectedFeature]);

  useEffect(() => {
    if (
      formToFormLinks.currentFormId > -1 &&
      formToFormLinks.formFeatures.length > 0
    ) {
      formToFormLinks.formFeatures.forEach((formFeatureItem: any) => {
        if (
          formFeatureItem.featureId === projectState.currentFeature.id &&
          (linkState.formStatus === "OPEN" ||
            linkState.formStatus === "OVERDUE")
        ) {
          formFeatureItem.displayCount = formFeatureItem.featureCount - 1;
        }
      });
      linkDispatch(
        setFormFeature(JSON.parse(JSON.stringify(formToFormLinks.formFeatures)))
      );
    }
  }, [formToFormLinks.selectedFeature]);

  const fetchFormData = async () => {
    try {
      dispatch(setIsLoading(true));
      const responseData: any = await client.query({
        query: FETCH_LIST_FORMS,
        variables: {
          featureId: formToFormLinks.selectedFeature.featureId,
          limit: 1000,
          offset: 0,
        },
        fetchPolicy: "network-only",
        context: {
          role: featureFormRoles.viewForm,
          token: state?.selectedProjectToken,
        },
      });
      const listOfForms: Array<any> = [];
      if (responseData.data.listForms_query.data.length > 0) {
        let currentAutoGeneratedId = "";
        const currentForm = responseData.data.listForms_query.data.find(
          (item: any) => formToFormLinks.currentFormId === item?.id
        );
        let featureAutoId = "";
  
        if (formToFormLinks.selectedFeature.featureId === 2) {
          featureAutoId = `RFI ID`;
        } else if (formToFormLinks.selectedFeature.featureId === 8) {
          featureAutoId = `Submittal ID`;
        } else {
          featureAutoId = "ID";
        }
        if (currentForm) {
          const autoValue = currentForm.formsData.find(
            (field: any) => field.caption === featureAutoId
          );
          currentAutoGeneratedId = autoValue ? autoValue.value : "";
        }
        const openForms = responseData.data.listForms_query.data.filter(
          (form: any) =>
            form.formState !== "DRAFT" && form.formState !== "CLOSED"
        );
        openForms.forEach((item: any) => {
          const newitem: any = {
            id: item?.id,
            label: "",
            sourceAutoIncremenId: currentAutoGeneratedId,
            targetId: item?.id,
            sourceType: projectState.currentFeature.id,
            sorceFeature: projectState.currentFeature.feature,
            targetType: formToFormLinks?.selectedFeature?.featureId,
            targetFeature: formToFormLinks?.selectedFeature?.feature,
            isSelected: false,
            relation: LinkRelationship.RELATES_TO,
            originalRelationShip: LinkRelationship.RELATES_TO,
            deleted: false,
            reverse: true,
            new: true,
            relationShipModifield: false,
            constraintName: "FORM_TO_FORM",
            constraint: false,
          };
          const subjectfield = item.formsData.find(
            (field: any) => {
              const changeOrderfeatureId = formToFormLinks.selectedFeature.featureId;
              if (changeOrderfeatureId === 140) {
                return field.caption === "Title";
              }
              else {
                return field.caption === "Subject";
              }
            }
          );
          const autoIncrementId = item.formsData.find(
            (field: any) => field.caption === featureAutoId
          );
          if (autoIncrementId) {
            newitem.targetAutoIncremenId = autoIncrementId.value;
          }
          if (subjectfield) {
            newitem.label = subjectfield.value;
          }
          if (formToFormLinks.currentFormId !== item?.id) {
            listOfForms.push(newitem);
          }
        });
      }
      formToFormLinks.draftSelectedFormLinks.forEach((element: any) => {
        listOfForms.forEach((formitem: any) => {
          if (formitem.targetId === element.targetId) {
            formitem.isSelected = true;
            formitem.new = element.new;
            formitem.relation = element.relation;
          }
        });
      });
      linkDispatch(setSelectedFeatureFormList(listOfForms));
      dispatch(setIsLoading(false));
    } catch (error: any) {
      console.log(error);
      dispatch(setIsLoading(false));
    }
  };

  const fetchFormFeatures = async () => {
    try {
      dispatch(setIsLoading(true));
      linkDispatch(setFormFeature([]));
      const payload = {
        input: {
          source: "LINK",
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
      linkDispatch(setFormFeature(targetList));
      if (targetList.length > 0) {
        linkDispatch(setselectedFeature(targetList[0]));
      }
      dispatch(setIsLoading(false));
    } catch (error: any) {
      dispatch(setIsLoading(false));
    }
  };

  const selectFeature = (argItem: any) => {
    linkDispatch(setselectedFeature(argItem));
  };

  return (
    <div className="FormLinkOption">
      <div className="FormLinkOption__features">
        <div className="FormLinkOption__features__list">
          {formToFormLinks.formFeatures.map((item: any) => (
            <div
              className={`FormLinkOption__features__list__item 
                        ${formToFormLinks?.selectedFeature?.featureId ===
                  item.featureId
                  ? "active"
                  : ""
                }`}
              onClick={() => selectFeature(item)}
              key={`Feature-${item.featureId}`}
            >
              <Tooltip title={item.feature}>
                <div className="FormLinkOption__features__list__item__labels">
                  <div>
                    {item?.feature?.length > 20
                      ? `${item?.feature.slice(0, 18)}..`
                      : item?.feature}
                  </div>
                  <div>({item.displayCount})</div>
                </div>
              </Tooltip>
            </div>
          ))}
        </div>
      </div>
      <div className="FormLinkOption__forms">
        <FormLinkTable />
      </div>
    </div>
  );
}

export default FormLinkOption;
