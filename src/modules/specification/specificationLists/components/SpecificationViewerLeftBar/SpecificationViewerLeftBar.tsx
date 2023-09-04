import { ReactElement, useState } from "react";
import "./SpecificationViewerLeftBar.scss";
import DescriptionIcon from "@material-ui/icons/Description";
import SpecificationLayerMain from "../SpecificationLayerMain/SpecificationLayerMain";
import SpecificationViewerItem from "../SpecificationViewerItem/SpecificationViewerItem";

export default function SpecificationViewerLeftBar(props: any): ReactElement {
  const [tabValue, setTabValue] = useState("SHEETS");

  return (
    <div className="spec-list-wrapper">
      <div className="spec-list-wrapper__tab">
        <div
          className={`spec-list-wrapper__tab__sheets ${
            tabValue === "LAYERS" ? "spec-list-wrapper__tab__active" : ""
          }`}
          onClick={() => setTabValue("SHEETS")}
        >
          <div className="spec-list-wrapper__tab__sheets__icon">
            <DescriptionIcon />
          </div>
          <div>Section</div>
        </div>
        {/* <div className={`spec-list-wrapper__tab__layers ${tabValue === 'SHEETS' ? 'spec-list-wrapper__tab__active' : ''}`}
                onClick={() => setTabValue('LAYERS')}>
                    <div className="spec-list-wrapper__tab__layers__icon">
                        <LayersIcon />
                    </div>
                    <div>Layers</div>
                </div> */}
      </div>
      {tabValue === "SHEETS" ? (
        <SpecificationViewerItem />
      ) : (
        <SpecificationLayerMain />
      )}
    </div>
  );
}
