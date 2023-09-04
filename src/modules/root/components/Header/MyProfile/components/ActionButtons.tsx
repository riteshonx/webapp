import "./ActionButtons.scss";
import { CircularProgress } from "@material-ui/core";

const ActionButtons = ({
  progressText = "Ok",
  cancelText = "Cancel",
  isProgressing,
  onProgressHandler,
  onCancelHandler,
  slateDashboard,
}: any) => (
  <div className={slateDashboard?"actionButtonHero slateDashboard__actionButtonHero":"actionButtonHero"}  >
    <div className= {slateDashboard?"actionButtonContainer slateDashboard__actionButtonContainer":"actionButtonContainer"}>
      <button
        onClick={onProgressHandler}
        className={`btn-primary actionButtonContainer_button actionButtonContainer_button_progress ${
          isProgressing && "with_action_button_disabled"
        }`}
      >
        {isProgressing ? (
          <CircularProgress
            className="actionButtonContainer_submittingAnimation"
            size="1.3rem"
            style={{ color: "white" }}
          />
        ) : (
          progressText
        )}
      </button>
      <button
        onClick={onCancelHandler}
        className="btn-secondary actionButtonContainer_button actionButtonContainer_button_cancel"
      >
        {cancelText}
      </button>
    </div>
  </div>
);

export default ActionButtons;
