import { Tooltip } from '@material-ui/core';
import React, { ReactElement, useEffect } from 'react';
import CommonFormLinkTable from '../CommonFormLinkTable/CommonFormLinkTable';
import './CommonFormLinks.scss';
const CommonFormLinks = (props: any): ReactElement => {
  const {
    formFeatures,
    selectedFeature,
    selectFeature,
    fetchFormData,
    fetchFormFeatures,
    projectTokens,
    currentTask,
    selectedFeatureFormsList,
    draftSelectedFormLinks,
    setDraftSelectedFormLinks,
    setSelectedFeatureFormList,
  } = props;

  useEffect(() => {
    if (projectTokens[currentTask.projectId]) {
      fetchFormFeatures(currentTask);
    }
  }, [projectTokens]);

  useEffect(() => {
    if (selectedFeature?.featureId && projectTokens[currentTask.projectId]) {
      fetchFormData();
    }
  }, [projectTokens, selectedFeature]);

  return (
    <div className="CommonFormLinkOption">
      <div className="CommonFormLinkOption__features">
        <div className="CommonFormLinkOption__features__list">
          {formFeatures.map((item: any) => (
            <div
              className={`CommonFormLinkOption__features__list__item
                        ${
                          selectedFeature?.featureId === item.featureId
                            ? 'active'
                            : ''
                        }`}
              onClick={() => selectFeature(item)}
              key={`Feature-${item.featureId}`}
            >
              <Tooltip title={item.feature}>
                <div className="CommonFormLinkOption__features__list__item__labels">
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
      <div className="CommonFormLinkOption__forms">
        <CommonFormLinkTable
          selectedFeatureFormsList={selectedFeatureFormsList}
          draftSelectedFormLinks={draftSelectedFormLinks}
          setDraftSelectedFormLinks={setDraftSelectedFormLinks}
          setSelectedFeatureFormList={setSelectedFeatureFormList}
          selectedFeature={selectedFeature}
        />
      </div>
    </div>
  );
};

export default CommonFormLinks;
