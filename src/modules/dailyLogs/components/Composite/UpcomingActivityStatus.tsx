import React, { useContext } from "react";
import Box from "@material-ui/core/Box";
import AddConstraint, { AddConstraintProps } from "../Micro/AddConstraint";
import TextContent from "../Micro/TextContent";
import { AddDailyLogContext } from "../../pages/AddDailyLog/AddDailyLog";

type EnrichedStatus = {
  displayValue: string;
  color: string;
};

function getStatusProps(status: StatusValue): EnrichedStatus {
  switch (status) {
    case "readyToGo":
      return { displayValue: "Ready to Go", color: "#000" };
    case "constrained":
      return { displayValue: "Constrained", color: "#cc4444" };
    default:
      return { displayValue: "Unknown", color: "#000" };
  }
}

export type StatusValue = "readyToGo" | "constrained" | null;

interface UpcomingActivityStatusProps {
  constraintButtonProps?: any;
  status: StatusValue;
  taskId: string;
  readOnly: boolean;
}

const UpcomingActivityStatus: React.FC<UpcomingActivityStatusProps> = ({
  status,
  constraintButtonProps,
  taskId,
  readOnly,
}) => {
  const { displayValue, color } = getStatusProps(status);

  return (
    <Box>
      <TextContent content={displayValue} style={{ color }} />
      {!readOnly && (
        <AddConstraint
          constraintButtonProps={constraintButtonProps}
          taskId={taskId}
        />
      )}
    </Box>
  );
};

export default UpcomingActivityStatus;
