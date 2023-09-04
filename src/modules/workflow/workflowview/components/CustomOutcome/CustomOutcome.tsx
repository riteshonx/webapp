import React, { useEffect } from "react";
import {
  getSmoothStepPath,
  EdgeProps,
  getEdgeCenter,
} from "react-flow-renderer";
import "./CustomOutcome.scss";
import { deleteOutcome, updateOutcomeData } from "../../../contextAPI/action";
import { workflowContext } from "../../../contextAPI/workflowContext";
import OutcomePopup from "../../components/OutcomePopup/OutcomePopup";
import { setEdgeCenter } from "src/modules/root/context/authentication/action";
import { stateContext } from "src/modules/root/context/authentication/authContext";

export default function CustomOutcome({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  label,
}: EdgeProps) {
  const context: any = React.useContext(workflowContext);
  const { dispatch, state }: any = React.useContext(stateContext);
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
  const labelContainerHeight = 18;

  const edgePath = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const [showControl1, setShowControl1] = React.useState(false);
  const [showOutcomePopup, setShowOutcomePopup] = React.useState(false);
  const [outcomeName, setOutcomeName]: any = React.useState(label);
  const [edgeCenterChange, setEdgeCenterChange]: any = React.useState(false);

  useEffect(() => {
    const currentEdgeCenter: any = {
      id: id,
      value: Number(edgeCenter[0]),
    };

    const data = state.edgeCenter;

    const existingIds: any = context.state.outcomeData
      ?.filter(
        (outcome: any) => !outcome.isDeleted && typeof outcome?.id === "number"
      )
      ?.map((item: any) => item?.id);
    const newIds: any = context.state.outcomeData
      ?.filter(
        (outcome: any) => !outcome.isDeleted && typeof outcome?.id !== "number"
      )
      ?.map((item: any) => item?.id);
    if (existingIds?.includes(Number(id))) {
      data.push(currentEdgeCenter);
      dispatch(setEdgeCenter(data));
    } else if (newIds?.includes(id)) {
      const currentEdgeCenter: any = {
        id: id,
        value: Number(edgeCenter[0]),
      };
      data.push(currentEdgeCenter);
      dispatch(setEdgeCenter(data));
    }
  }, [
    context.state.outcomeData?.filter((outcome: any) => !outcome.isDeleted)
      ?.length,
  ]);

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
  }, [
    context.state.outcomeData?.filter((outcome: any) => !outcome.isDeleted)
      ?.length,
  ]);

  const styles = {
    outcomeLabelParent: {
      transform: `translate(${edgeCenter[0] - labelContainerWidth / 2}, ${
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
    },
    rectCover: {
      stroke: "#fff",
      fill: "#fff",
      width: `${labelContainerHeight}px`,
      height: `${labelContainerHeight}px`,
      x: labelContainerWidth + fontCharacterAvgWidth * 2,
      y: 0,
      rx: `${fontCharacterAvgWidth / 2}`,
      ry: `${fontCharacterAvgWidth / 2}`,
      cursor: "pointer",
    },
    controlsContainerEdit: {
      width: `${labelContainerHeight}px`,
      height: `${labelContainerHeight}px`,
      fill: "none",
      x: labelContainerWidth + fontCharacterAvgWidth * 2,
      y: 0,
      rx: `${fontCharacterAvgWidth / 2}`,
      ry: `${fontCharacterAvgWidth / 2}`,
      cursor: "pointer",
    },
    controlsContainerDelete: {
      width: `${labelContainerHeight}px`,
      height: `${labelContainerHeight}px`,
      fill: "#none",
      x: labelContainerWidth,
      y: 0,
      rx: `${fontCharacterAvgWidth / 2}`,
      ry: `${fontCharacterAvgWidth / 2}`,
      cursor: "pointer",
    },
    deleteIcon: {
      transform: `translate(${labelContainerWidth}px, 0px) scale(0.7)`,
      fill: showControl1 ? "#07676E" : "#111111",
      cursor: "pointer",
    },
    editIcon: {
      transform: `translate(${
        labelContainerWidth + fontCharacterAvgWidth * 2
      }px, 0px) scale(0.7)`,
      fill: showControl1 ? "#07676E" : "#111111",
      cursor: "pointer",
    },
  };
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
    setShowControl1(true);
  };

  const mouseExit1 = () => {
    unsetClearControlTimer1();
    setClearControlTimer1();
  };

  const clickEdit = (e: any) => {
    e.stopPropagation();
    setShowOutcomePopup(true);
  };

  const clickDelete = (e: any) => {
    e.stopPropagation();
    const outcomeData: any = [];

    context.state.outcomeData.forEach((outcome: any) => {
      if (
        (Number(outcome.id) === Number(id) || outcome.id === id) &&
        outcome.isDbValue
      ) {
        outcomeData.push({ ...outcome, isDeleted: true });
      } else if (Number(outcome.id) !== Number(id) && outcome.id != id) {
        outcomeData.push(outcome);
      }
    });
    context.dispatch(deleteOutcome({ outcomeData: outcomeData }));
    dispatch(setEdgeCenter([]));
  };

  const handleOutcomePopup = () => {
    setShowOutcomePopup(false);
    const outcomeData = context.state.outcomeData.map((outcome: any) => {
      if (Number(outcome.id) === Number(id) || outcome.id === id) {
        return {
          ...outcome,
          label: outcomeName.trim(),
        };
      } else {
        return outcome;
      }
    });
    context.dispatch(updateOutcomeData({ outcomeData: outcomeData }));
  };

  const handleChange = (e: any) => {
    const value = e.target.value;
    setOutcomeName(value.slice(0, 32));
    e.stopPropagation();
  };

  return label ? (
    <>
      <OutcomePopup
        open={showOutcomePopup}
        handleOutcomePopup={handleOutcomePopup}
        outcomeName={outcomeName}
        handleChange={handleChange}
        handleOutcomePopupClose={() => {
          setOutcomeName(label);
          setShowOutcomePopup(false);
        }}
        connectParams={context.state.outcomeData.find(
          (outcome: any) =>
            (Number(outcome.id) === Number(id) || outcome.id === id) &&
            outcome.label !== outcomeName
        )}
      />
      <defs>
        <marker
          id="triangle"
          viewBox="0 0 20 20"
          refX="18"
          refY="10"
          markerWidth="10"
          markerHeight="10"
          orient="auto"
        >
          <path d="M 0 0 L 20 10 L 0 20 z" fill="#000" />
        </marker>
      </defs>
      <path
        id={id}
        style={{
          strokeWidth: 2.2,
          strokeOpacity: showControl1 ? 1 : 0.3,
          stroke: showControl1 ? "#07676E" : "#b1b1b7",
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd="url(#triangle)"
        onMouseLeave={mouseExit1}
        onMouseOver={mouseEnter1}
        cursor="pointer"
      />

      {(!edgeCenterChange || showControl1) && (
        <g
          id={id}
          transform={styles.outcomeLabelParent.transform}
          onMouseLeave={mouseExit1}
          onMouseOver={mouseEnter1}
          cursor="pointer"
        >
          <rect style={styles.textContainer}></rect>
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
      {showControl1 ? (
        <g
          transform={styles.outcomeLabelParent.transform}
          onMouseLeave={mouseExit1}
          onMouseOver={mouseEnter1}
        >
          <foreignObject
            style={styles.controlsContainerDelete}
            requiredExtensions="http://www.w3.org/1999/xhtml"
          >
            <body>
              <button className="btndelete" onClick={clickDelete}></button>
            </body>
          </foreignObject>
          <foreignObject
            style={styles.controlsContainerEdit}
            requiredExtensions="http://www.w3.org/1999/xhtml"
          >
            <body>
              <button className="btnedit" onClick={clickEdit}></button>
            </body>
          </foreignObject>
        </g>
      ) : null}
    </>
  ) : (
    <></>
  );
}
