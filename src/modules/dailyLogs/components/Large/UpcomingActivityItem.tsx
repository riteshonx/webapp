import Box from "@material-ui/core/Box";
import BoldText from "../Micro/BoldText";
import Constraints from "../Small/Constraints";
import LabelWithValue from "../Small/LabelWithValue";

interface UpcomingActivityItemProps {
  activityName: string;
  startDate: string;
  endDate: string;
  constraints: Array<any>;
  readOnly?: boolean;
}

const UpcomingActivityItem: React.VFC<UpcomingActivityItemProps> = ({
  readOnly = false,
  activityName,
  startDate,
  endDate,
  constraints,
}) => {
  const hasConstraints = constraints.length > 0;

  return (
    <Box>
      <BoldText size="1.5rem" collapseMargin>
        {activityName}
      </BoldText>
      <Box display="inline-block">
        <LabelWithValue label="Start" value={startDate} />
      </Box>
      <Box marginLeft={"2rem"} display="inline-block">
        <LabelWithValue label="End" value={endDate} />
      </Box>
      {hasConstraints && (
        <Constraints constraints={constraints} readOnly={readOnly} />
      )}
    </Box>
  );
};

export default UpcomingActivityItem;
