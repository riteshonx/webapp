import { ReactElement, useContext, useEffect, useState } from "react";
import { SpecificationLibDetailsContext } from "../../context/SpecificationLibDetailsContext";
import "./SpecificationViewerItem.scss";

export interface Params {
  projectId: string;
  specificationId: string;
}

export default function SpecificationViewerItem(): ReactElement {
  const { SpecificationLibDetailsState }: any = useContext(
    SpecificationLibDetailsContext
  );
  const [specification, setSpecification] = useState<any>({
    sectionName: "",
    version: "",
  });

  useEffect(() => {
    if (SpecificationLibDetailsState?.specificationSheetLists?.length)
      setSpecification(
        SpecificationLibDetailsState?.specificationSheetLists[0]
      );
  }, [SpecificationLibDetailsState?.specificationSheetLists]);

  return (
    <div className="specificationLists">
      <div
        className={`specificationLists__item specificationLists__item-active`}
      >
        <label>
          {specification.sectionName} - {specification.sectionNumber}
        </label>
      </div>
      <div className={`specificationLists__item`}>
        Division: {specification.divisionName}
      </div>
      <div className={`specificationLists__item`}>
        Version Title: {specification.title}
      </div>
      <div className={`specificationLists__item`}>
        Version Date: {specification.versionDate}
      </div>
      <div className={`specificationLists__item`}>
        Version Name: {specification.versionName}
      </div>
    </div>
  );
}
