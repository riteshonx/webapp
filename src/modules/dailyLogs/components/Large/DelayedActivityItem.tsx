import Box from "@material-ui/core/Box";
import BoldText from "../Micro/BoldText";
import Badge from "../Micro/Badge";
import LabelWithValue from "../Small/LabelWithValue";

interface DelayedActivityItemProps {
  activityName: string;
  startDate: string;
  actualEndDate: string;
  updatedEndDate: string;
  assignee: string;
  isNew?: boolean;
}

const DelayedActivityItem: React.VFC<DelayedActivityItemProps> = ({
  activityName,
  startDate,
  actualEndDate,
  updatedEndDate,
  assignee,
  isNew = false,
}) => {
  return (
    <Box>
      <Box display="flex" alignItems="center">
        <BoldText size="1.5rem" collapseMargin>
          {activityName}
        </BoldText>{" "}
        {isNew && (
          <Badge style={{ marginLeft: "1.5rem" }} value="new" size="s" />
        )}
      </Box>
      <LabelWithValue label="Start" value={startDate} />
      <LabelWithValue
        label="End"
        value={actualEndDate}
        strikeValue={updatedEndDate}
      />
      <LabelWithValue label="Assignee" value={assignee} />
    </Box>
  );
};

export default DelayedActivityItem;
