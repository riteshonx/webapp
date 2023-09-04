import "./SubmitButton.scss";
import { CircularProgress } from "@material-ui/core";

const SubmitButton = ({
  disabled,
  value,
  isSubmitting,
  halfWidth = true,
}: any) => (
  <button
    className={`submitButton ${disabled ? "submitButton_withDisabled" : ""} ${
      halfWidth && "submitButton_halfWidth"
    }`}
    type="submit"
    disabled={disabled}
  >
    <div className="submitButton_center">
      {isSubmitting && (
        <CircularProgress
          size="1.5rem"
          style={{ color: "white", marginRight: "1.5rem" }}
        />
      )}
      {value}
    </div>
  </button>
);

export default SubmitButton;
