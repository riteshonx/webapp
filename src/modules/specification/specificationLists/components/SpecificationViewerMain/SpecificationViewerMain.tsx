import React, { ReactElement, useState } from "react";
import "./SpecificationViewerMain.scss";
import ViewListIcon from "@material-ui/icons/ViewList";
import AppsIcon from "@material-ui/icons/Apps";

export default function SpecificationViewerMain(props: any): ReactElement {
  const [viewType, setViewType] = useState("LIST");

  return (
    <>
      <div className="sections-main">
        <div className="sections-main__icon"></div>
      </div>
      <div></div>
    </>
  );
}
