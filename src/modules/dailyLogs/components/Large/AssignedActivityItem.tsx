import { useContext, useReducer, useState, useEffect } from "react";
import Box from "@material-ui/core/Box";
import { AddDailyLogContext } from "../../pages/AddDailyLog/AddDailyLog";
import BoldText from "../Micro/BoldText";
import TextWithCheckIcon from "../Micro/TextWithCheckIcon";
import TextAreaWithLabel from "../Small/TextAreaWithLabel";
import {
  updateActivityComments,
  updateActivityCommentsWithTimeSheetId,
} from "../../pages/AddDailyLog/requests";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import { setIsLoading } from "src/modules/root/context/authentication/action";
import { setRefreshAssignedActivities } from "../../actions";
import Notification, {
  AlertTypes,
} from "src/modules/shared/components/Toaster/Toaster";
import TextContent from "../Micro/TextContent";

interface AssignedActivityItemProps {
  status: string;
  activityName: string;
  startDate: string;
  endDate: string;
  disableStart: boolean;
  disableEnd: boolean;
  timeSheetId: number | string;
  taskId: string;
  comment: string;
  readOnly: boolean;
  variance: string;
  category: string;
}

const AssignedActivityItem: React.VFC<AssignedActivityItemProps> = ({
  status,
  activityName,
  startDate,
  endDate,
  disableStart,
  disableEnd,
  timeSheetId,
  taskId,
  comment,
  readOnly,
  variance,
  category,
}) => {
  const { dispatchAddDailyLog } = useContext(AddDailyLogContext);
  const { dispatch }: any = useContext(stateContext);
  const [commentState, setCommentState] = useState(comment);

  const handleComment = async () => {
    if (commentState !== comment) {
      dispatch(setIsLoading(true));
      try {
        let updatedComment;
        if (timeSheetId)
          updatedComment = await updateActivityCommentsWithTimeSheetId(
            commentState,
            timeSheetId
          );
        else
          updatedComment = await updateActivityComments(commentState, taskId);
        Notification.sendNotification(
          `Task comment ${
            comment ? (commentState ? "updated" : "deleted") : "added"
          }  successfully`,
          AlertTypes.success
        );
        dispatchAddDailyLog(setRefreshAssignedActivities(true));
        dispatch(setIsLoading(false));
      } catch (error) {
        console.log(error);
        dispatch(setIsLoading(false));
      }
    }
  };

  return (
    <Box>
      <BoldText size="1.3rem" collapseMargin>
        {activityName}
      </BoldText>
      <Box marginTop="1rem" display="flex">
        <TextWithCheckIcon
          disabled={disableStart}
          label={"Start"}
          content={startDate}
        />
        <TextWithCheckIcon
          style={{ marginLeft: "1.5rem" }}
          disabled={disableEnd}
          label={"End"}
          content={endDate}
        />
      </Box>
      {status === "IN_PROGRESS_DELAYED" && variance && category && (
        <>
          <TextContent
            style={{ color: "#9b9b9b", marginTop: "2rem" }}
            content={"Variance Category"}
          />
          <TextContent content={category} />
          <TextAreaWithLabel
            readOnly={true}
            label="Variance Description"
            size="s"
            value={variance}
            style={{ marginTop: "1rem" }}
          />
        </>
      )}
      <TextAreaWithLabel
        readOnly={readOnly}
        label="Comments"
        size="s"
        value={commentState}
        onChange={(e: any) => {
          setCommentState(e.target.value);
        }}
        onBlur={handleComment}
        style={{ marginTop: "1rem" }}
      />
    </Box>
  );
};

export default AssignedActivityItem;
