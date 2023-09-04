import React, { useContext, useState } from "react";
import Box from "@material-ui/core/Box";
import TextContent from "../Micro/TextContent";
import Checkbox from "@material-ui/core/Checkbox";
import { updateConstraint } from "../../common/requests";
import { AddDailyLogContext } from "../../pages/AddDailyLog/AddDailyLog";
import { setRefreshUpcomingActivities } from "../../actions";
import { setIsLoading } from "src/modules/root/context/authentication/action";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import ErrorIcon from "@material-ui/icons/Error";
import BookMarkIcon from "@material-ui/icons/Bookmark";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import Notification, {
  AlertTypes,
} from "src/modules/shared/components/Toaster/Toaster";
import Tooltip from "@material-ui/core/Tooltip";

const useStyles = makeStyles({
  checked: {
    "&.Mui-checked": {
      color: "black",
    },
  },
  button: {
    textTransform: "none",
    color: "#c0c8cd",
  },
});

interface Constraint {
  id: string;
  constraintName: string;
  category: string;
  status: string;
  linkId: string | null;
  taskId: string;
}

interface ConstraintsProps {
  constraints: Array<Constraint>;
  readOnly?: boolean;
}

interface ConstraintItemProps {
  constraint: Constraint;
  readOnly?: boolean;
  handleChange: (constraint: Constraint) => void;
}

const ConstraintItem = ({
  constraint,
  readOnly,
  handleChange,
}: ConstraintItemProps) => {
  const classes = useStyles();
  return (
    <Box display="flex" alignItems="center">
      {!readOnly && (
        <Checkbox
          classes={{ checked: classes.checked }}
          size="small"
          onChange={() => handleChange(constraint)}
          checked={constraint.status === "closed"}
        />
      )}
      {constraint.status === "open" ? (
        <Tooltip title="Open Constraint">
          <ErrorIcon style={{ fontSize: "1.5rem", color: "#ffb52f" }} />
        </Tooltip>
      ) : (
        <Tooltip title="Closed Constraint">
          <BookMarkIcon style={{ fontSize: "1.5rem", color: "#171d25" }} />
        </Tooltip>
      )}

      <Box alignSelf="end" paddingTop={"1.7rem"}>
        <TextContent
          content={constraint.constraintName}
          collapseMargin
          style={{ color: "#0d444b", marginLeft: "0.5rem" }}
        />
        <TextContent
          content={constraint.category}
          collapseMargin
          style={{ color: "#898989", marginLeft: "0.5rem" }}
        />
      </Box>
    </Box>
  );
};

const SHOW_INITIAL_CONSTRAINTS_COUNT = 3;

const Constraints: React.FC<ConstraintsProps> = ({ constraints, readOnly }) => {
  const { dispatchAddDailyLog } = useContext(AddDailyLogContext);
  const { dispatch }: any = useContext(stateContext);
  const [showMore, setShowMore] = useState(false);
  const classes = useStyles();

  const firstThreeConstraints = constraints.slice(
    0,
    SHOW_INITIAL_CONSTRAINTS_COUNT
  );
  const remainingConstraints = constraints.slice(
    SHOW_INITIAL_CONSTRAINTS_COUNT
  );

  const handleConstraintChange = async (constraint: Constraint) => {
    let status = constraint.status;
    if (status === "closed") {
      status = "open";
    } else {
      status = "closed";
    }
    try {
      dispatch(setIsLoading(true));
      await updateConstraint(constraint.id, status);
      dispatchAddDailyLog(setRefreshUpcomingActivities(true));
    } catch (e) {
      console.error("Something went wrong!", e);
      Notification.sendNotification(
        "Could not update constraint",
        AlertTypes.error
      );
    }
  };

  return (
    <Box>
      <TextContent
        style={{ color: "#0d444b", fontWeight: "bold", fontSize: "1.2rem" }}
        content={`Constraints (${constraints.length})`}
      />
      {firstThreeConstraints.map((constraint) => (
        <ConstraintItem
          key={constraint.id}
          constraint={constraint}
          readOnly={readOnly}
          handleChange={handleConstraintChange}
        />
      ))}
      {constraints.length > SHOW_INITIAL_CONSTRAINTS_COUNT && !showMore && (
        <Button
          classes={{ root: classes.button }}
          onClick={() => setShowMore(true)}
        >
          Show more
        </Button>
      )}
      {showMore &&
        remainingConstraints.map((constraint) => (
          <ConstraintItem
            key={constraint.id}
            constraint={constraint}
            readOnly={readOnly}
            handleChange={handleConstraintChange}
          />
        ))}
    </Box>
  );
};

export default Constraints;
