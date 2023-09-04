import type { StatusSelectorProps } from "../Small/StatusSelector";
import Box from "@material-ui/core/Box";
import TextContent from "../Micro/TextContent";
import StatusSelector from "../Small/StatusSelector";
import TextWithCheckIcon from "../Micro/TextWithCheckIcon";

interface StatusWithUpdatedTimeProps {
  statusProps: StatusSelectorProps;
  updatedNeeded: boolean;
  updatedTime?: string;
  taskId: string;
  showUpdateNeededLabel: boolean;
  readOnly: boolean;
  updatedAt?: string
}

const StatusWithUpdatedTime: React.VFC<StatusWithUpdatedTimeProps> = ({
  statusProps,
  updatedNeeded,
  updatedTime,
  showUpdateNeededLabel,
  readOnly,
  updatedAt
}) => {
  return (
    <Box>
      <Box marginBottom="1rem" display="flex" alignItems="center">
        {/* {showUpdateNeededLabel && (
          <TextWithCheckIcon
            disabled={updatedNeeded}
            label={updatedNeeded ? "Update Needed" : "Updated"}
          />
        )} */}
        {!updatedNeeded && false && (
          <TextContent
            style={{ marginLeft: "2rem" }}
            content={updatedTime || ""}
            collapseMargin
          />
        )}
      </Box>
      <StatusSelector {...statusProps} updatedAt={updatedAt} disabled={readOnly} />
    </Box>
  );
};

export default StatusWithUpdatedTime;
