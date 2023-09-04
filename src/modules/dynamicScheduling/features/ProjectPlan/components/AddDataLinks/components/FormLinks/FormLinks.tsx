import { Tooltip } from '@material-ui/core';
import React, { ReactElement, useContext, useEffect } from 'react';
import { stateContext } from '../../../../../../../root/context/authentication/authContext';
import EditProjectPlanLinksContext from '../../../../../../context/editProjectPlanLinks/editProjectPlanLinksContext';
import FormLinkTable from '../FormLinkTable/FormLinkTable';
import './FormLinks.scss';
const FormLinks = (props: any): ReactElement => {
  const editProjectPlanLinksContext: any = useContext(
    EditProjectPlanLinksContext
  );

  const {
    formFeatures,
    selectedFeature,
    selectFeature,
    fetchFormData,
    fetchFormFeatures,
  } = editProjectPlanLinksContext;

  const authContext: any = useContext(stateContext);

  useEffect(() => {
    if (authContext?.state?.selectedProjectToken) {
      fetchFormFeatures();
    }
  }, [authContext?.state?.selectedProjectToken]);

  useEffect(() => {
    if (
      selectedFeature?.featureId &&
      authContext?.state?.selectedProjectToken
    ) {
      fetchFormData();
    }
  }, [authContext?.state?.selectedProjectToken, selectedFeature]);

  return (
    <div className="FormLinkOption">
      <div className="FormLinkOption__features">
        <div className="FormLinkOption__features__list">
          {formFeatures.map((item: any) => (
            <div
              className={`FormLinkOption__features__list__item
                        ${
                          selectedFeature?.featureId === item.featureId
                            ? 'active'
                            : ''
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
};

export default FormLinks;
