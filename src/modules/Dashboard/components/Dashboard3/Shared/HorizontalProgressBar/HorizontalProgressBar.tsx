import React, { ReactElement } from "react";
import "./HorizontalProgressBar.scss";

interface HorizontalProgressBar {
  value: number;
  total: number;
  color: string;
  height?: any;
}

const HorizontalProgressBar = ({
  value,
  total,
  color,
  height,
}: any): ReactElement => {
  const progressVal = Math.floor((value / total) * 100);
  return (
    <div className={"horizontalProgressBar-main"}>
      <div
        style={{
          height: height ? height : "6px",
          width: `${progressVal}%`,
          background: color,
        }}
      ></div>
    </div>
  );
};

export default HorizontalProgressBar;
