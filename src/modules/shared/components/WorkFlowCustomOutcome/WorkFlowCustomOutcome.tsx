import React, { ReactElement, useEffect } from "react";
import {
  getEdgeCenter,
  getSmoothStepPath,
  useStoreState,
} from "react-flow-renderer";
import { setEdgeCenter } from "src/modules/root/context/authentication/action";
import { stateContext } from "src/modules/root/context/authentication/authContext";

export default function WorkflowCustomOutcome({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
}: any): ReactElement {
  const { dispatch, state }: any = React.useContext(stateContext);

  const edgePath = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const markerEnd = "url(#triangle)";
  const edgeCenter = getEdgeCenter({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });
  const radius = 4;
  const fontCharacterAvgWidth = 8.5;
  const labelContainerWidth =
    ((label + "").length + 1) * fontCharacterAvgWidth + 2 * radius;
  const labelContainerHeight = 20;

  const [edgeCenterChange, setEdgeCenterChange]: any = React.useState(false);
  const [showControl1, setShowControl1] = React.useState(false);

  const styles = {
    outcomeLabelParent: {
      transform: `translate(${edgeCenter[0] - labelContainerWidth / 2},${
        edgeCenter[1] - labelContainerHeight / 2
      })`,
    },
    textContainer: {
      width: `${labelContainerWidth}px`,
      height: `${labelContainerHeight}px`,
      fill: showControl1 ? "#07676E" : "#111111",
      rx: `${radius}`,
      ry: `${radius}`,
    },
    labelText: {
      fill: "#dddddd",
      transform: `translate(${fontCharacterAvgWidth}px, ${
        labelContainerHeight / 1.4
      }px)`,
      cursor: "pointer",
    },
  };
  useEffect(() => {
    const currentEdgeCenter: any = {
      id: Number(id),
      value: Number(edgeCenter[0]),
    };

    const data = state.edgeCenter;

    if (label !== undefined) {
      data.push(currentEdgeCenter);
      dispatch(setEdgeCenter(data));
    }
  }, []);

  useEffect(() => {
    const currentEdgeCenter: any = {
      id: id,
      value: Number(edgeCenter[0]),
    };

    const data = state.edgeCenter?.map((item: any) => Number(item["value"]));

    if (
      data?.filter(
        (val: any) => parseInt(val) === parseInt(currentEdgeCenter["value"])
      ).length >= 2
    ) {
      setEdgeCenterChange(true);
    } else {
      setEdgeCenterChange(false);
    }
  }, []);
  let clearControlTimerHandle: any = null;

  const setClearControlTimer1 = () => {
    unsetClearControlTimer1();
    clearControlTimerHandle = setTimeout(() => {
      setShowControl1(false);
    }, 1000);
  };
  const unsetClearControlTimer1 = () => {
    if (clearControlTimerHandle != null) {
      clearTimeout(clearControlTimerHandle);
      clearControlTimerHandle = null;
    }
  };

  const mouseEnter1 = () => {
    unsetClearControlTimer1();
    // setShowControl1(false);
    setShowControl1(true);
  };

  const mouseExit1 = () => {
    unsetClearControlTimer1();
    setClearControlTimer1();
  };

  return label ? (
    <>
      <defs>
        <marker
          id="triangle"
          viewBox="0 0 20 20"
          refX="18"
          refY="10"
          markerUnits="strokeWidth"
          markerWidth="18"
          markerHeight="18"
          orient="auto"
        >
          <path d="M 0 0 L 20 10 L 0 20 z" fill="#000" />
        </marker>
      </defs>
      <path
        id={id}
        style={{
          strokeWidth: 1.6,
          strokeOpacity: showControl1 ? 1 : 0.3,
          stroke: showControl1 ? "#07676E" : "#b1b1b7",
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        onMouseLeave={mouseExit1}
        onMouseOver={mouseEnter1}
        cursor="pointer"
      />
      {(!edgeCenterChange || showControl1) && (
        <g
          href={`#${id}`}
          transform={styles.outcomeLabelParent.transform}
          onMouseLeave={mouseExit1}
          onMouseOver={mouseEnter1}
          cursor="pointer"
        >
          <rect style={styles.textContainer} />
          <text
            style={styles.labelText}
            fontSize="14"
            fontWeight="700"
            textAnchor="start"
          >
            {label}
          </text>
        </g>
      )}
    </>
  ) : (
    <></>
  );
}
