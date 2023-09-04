import React from "react";
import "./SwipeWrapper.scss";
import bg from "../../../../../../assets/images/bg-27-1.png";
import Draggable from "react-draggable";

interface SwipeWrapperProps {
  open: boolean;
  children: any;
  placement: any;
  width?: string;
  height?: string;
  backgroundImage?: string;
  animationType?: string;
  zIndexPriority?: boolean;
  transition?: string;
  isDraggable?: boolean;
}

const SwipeWrapper = ({
  open,
  placement,
  children,
  width,
  height,
  backgroundImage,
  animationType,
  zIndexPriority,
  transition,
  isDraggable,
}: SwipeWrapperProps): React.ReactElement => {
  return (
    <Draggable disabled={isDraggable ? !isDraggable : true}>
      <div
        className={
          open
            ? `swipeWrapper-container ${
                animationType === "bottomToTop"
                  ? "swipeWrapper-container__openFromBottom"
                  : animationType === "leftToRight"
                  ? "swipeWrapper-container__openFromLeft"
                  : "swipeWrapper-container__open"
              }`
            : `swipeWrapper-container ${
                animationType === "bottomToTop"
                  ? "swipeWrapper-container__hiddenBottom"
                  : animationType === "leftToRight"
                  ? "swipeWrapper-container__hiddenLeft"
                  : "swipeWrapper-container__hidden"
              }`
        }
        style={{
          width: width ? width : "50rem",
          transition: open ? "none" : "all 4s ease",
          zIndex: open ? (zIndexPriority ? 3 : 1) : -1,
          minHeight: height ? height : "calc(100% - 54px)",
          ...placement,
        }}
      >
        <div
          className={
            open
              ? `swipeWrapper-container__innerContainer ${
                  animationType === "bottomToTop"
                    ? "swipeWrapper-container__openFromBottom"
                    : animationType === "leftToRight"
                    ? "swipeWrapper-container__openFromLeft"
                    : "swipeWrapper-container__open"
                }`
              : `swipeWrapper-container__innerContainer ${
                  animationType === "bottomToTop"
                    ? "swipeWrapper-container__hiddenBottom"
                    : animationType === "leftToRight"
                    ? "swipeWrapper-container__hiddenLeft"
                    : "swipeWrapper-container__hidden"
                }`
          }
          style={{
            background: `url(${backgroundImage ? backgroundImage : bg})`,
            transition: transition ? transition : `all 2s ease`,
          }}
        >
          {children}
        </div>
      </div>
    </Draggable>
  );
};

export default SwipeWrapper;
