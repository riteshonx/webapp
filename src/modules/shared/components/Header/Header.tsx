import React, { ReactElement } from "react";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";

import "./Header.scss";
import { Tooltip } from "@material-ui/core";

export default function Header(props: any): ReactElement {
  return (
    <div className="header-wrapper">
      <div className="header-wrapper__navBack">
        <ArrowBackIosIcon onClick={props.navigate} />
      </div>
      <Tooltip title={props.header}>
        <div className="header-wrapper__text">
          {props.header.length > 30
            ? `${props.header.slice(0, 27)}...`
            : props.header}
        </div>
      </Tooltip>
    </div>
  );
}
