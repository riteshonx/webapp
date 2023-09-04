import React, { useContext, useState } from "react";
import "./TaskAndNewsCard.scss";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import {
  setProductivityInsights,
  setZIndexPriority,
} from "src/modules/root/context/authentication/action";
import classNames from "classnames";
import TwitterCard from "../TwitterCard/TwitterCard";
import TaskCard from "../TaskCard/TaskCard";
import { IconButton } from "@material-ui/core";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const TaskAndNewsCard = ({ handleClose }: any): React.ReactElement => {
  const { dispatch, state }: any = useContext(stateContext);
  const [flipBack, setFlipBack]: any = useState(false);

  return (
    <div
      style={{ zIndex: state?.zIndexPriority === "taskAndNewsCard" ? 3 : 1 }}
      onClick={(e: any) => {
        e.stopPropagation();
        dispatch(setZIndexPriority("taskAndNewsCard"));
      }}
    >
      <IconButton
        className="taskAndNewsCardSlate2-container__closeIconButton"
        onClick={() => {
          handleClose();
        }}
      >
        <KeyboardArrowDownIcon className="taskAndNewsCardSlate2-container__closeIconButton__icon" />
      </IconButton>
      <div className="taskAndNewsCardSlate2-container__taskAndTweetsContainer">
        <div
          className={classNames({
            "taskAndNewsCardSlate2-container__taskAndTweetsContainer__flip-card-inner":
              true,
            "taskAndNewsCardSlate2-container__taskAndTweetsContainer__flip-card-on-hover":
              flipBack,
          })}
        >
          <div
            style={{ zIndex: !flipBack ? 1 : 0 }}
            className="taskAndNewsCardSlate2-container__taskAndTweetsContainer__flip-card-front"
          >
            <div>
              <TaskCard
                setFlipBack={setFlipBack}
                flipBack={flipBack}
                height={0.7}
                className={"taskCard"}
              />
            </div>
          </div>
          <div
            style={{ zIndex: flipBack ? 1 : 0 }}
            className="taskAndNewsCardSlate2-container__taskAndTweetsContainer__flip-card-back"
          >
            <div>
              <TwitterCard
                setFlipBack={setFlipBack}
                flipBack={flipBack}
                height={0.7}
                className={"twitter-feeds2"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskAndNewsCard;
