import React, { ReactElement, useContext, useEffect, useState } from "react";
import "./FeatureFormsLanding.scss";
import BackNavigation from "../../../../shared/components/BackNavigation/BackNavigation";
import { match, useHistory, useRouteMatch } from "react-router-dom";
import FeatureForms from "../Rfis/Rfis";
import FormHoc from "../../components/FormHoc/FormHoc";
import { projectContext } from "../../Context/projectContext";
import {
  refreshFeaturesList,
  setCurrentFeature,
  setFilter,
  setFilterData,
  setFilterOptions,
} from "../../Context/projectActions";
import { decodeExchangeToken } from "../../../../../services/authservice";
import CommonHeader from "../../../../shared/components/CommonHeader/CommonHeader"
import { Grid, Tooltip } from "@material-ui/core";

export interface Params {
  id: string;
  featureId: string;
}

export default function FeatureFormsLanding(): ReactElement {
  const history = useHistory();
  const pathMatch: match<Params> = useRouteMatch();
  const { projectState, projectDispatch }: any = useContext(projectContext);

  const selectForm = (argForm: any): void => {
    if (Number(pathMatch.params.featureId) !== argForm.featureId) {
      projectDispatch(refreshFeaturesList(true));
      history.push(
        `/base/projects/${Number(pathMatch.params.id)}/form/${
          argForm.featureId
        }`
      );
      projectDispatch(setFilter(false));
      projectDispatch(setFilterData([]));
      projectDispatch(setFilterOptions([]));
      projectDispatch(
        setCurrentFeature({
          id: argForm.featureId,
          feature: argForm.feature,
          tenantId: decodeExchangeToken().tenantId,
          count: argForm.featureCount,
        })
      );
    }
  };
  const headerInfo={
    name:"Forms"
  }

  return (
    <FormHoc>
      <Grid container className="FeatureFormsLanding">
        <Grid item xs={10} className="FeatureFormsLanding__left">
          <div className="FeatureFormsLanding__left__header">
            <CommonHeader headerInfo={headerInfo}/>
          </div>
          <div className="FeatureFormsLanding__left__form">
            <div className="FeatureFormsLanding__left__form__item">
              <div className="FeatureFormsLanding__left__form__item__body">
                {projectState.formFeaturesList.map((standardItem: any) => (
                  <div
                    key={`standard-form-${standardItem.featureId}`}
                    data-testid={`FeatureFormsLanding__lefts-system-forms-${standardItem.featureId}`}
                    onClick={() => selectForm(standardItem)}
                    className={`FeatureFormsLanding__left__form__item__body__item 
                                    ${
                                      standardItem?.featureId ===
                                      Number(pathMatch.params.featureId)
                                        ? "FeatureFormsLanding__left__active"
                                        : ""
                                    }`}
                  >
                    <Tooltip title={standardItem.feature}>
                      <div className="FeatureFormsLanding__left__form__item__body__item__count">
                        <div>
                          {standardItem.feature.length > 20
                            ? `${standardItem.feature.slice(0, 18)}..`
                            : standardItem.feature}
                        </div>
                        <div>({standardItem.featureCount})</div>
                      </div>
                    </Tooltip>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Grid>
        <Grid item xs={10} className="FeatureFormsLanding__right">
          <FeatureForms />
        </Grid>
      </Grid>
    </FormHoc>
  );
}
