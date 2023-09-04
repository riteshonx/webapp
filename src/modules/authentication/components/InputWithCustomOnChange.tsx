import "./InputWithLabel.scss";
import {
  Visibility as EyeIcon,
  VisibilityOff as HiddenEyeIcon,
  ErrorOutline,
} from "@material-ui/icons";

const InputWithOnChange = ({
  registeredField,
  label,
  defaultValue = "",
  type = "text",
  error,
  showPassword = false,
  handleShowPasswordClick,
  handleChange,
  placeholder,
}: any) => {
  return (
    <div className="ftInputContainer">
      <>
        <label className="ftInputContainer_label">{label}</label>
        <input
          placeholder={placeholder}
          className={`ftInputContainer_input ${
            error?.message && "with_error_border"
          }`}
          type={showPassword ? "text" : type}
          defaultValue={defaultValue}
          {...registeredField}
          onChange={(e) => {
            registeredField.onChange(e); // method from hook form register
            handleChange(e); // your method
          }}
          onBlur={registeredField.onBlur}
          ref={registeredField.ref}
        />
        {type === "password" ? (
          <i
            onClick={handleShowPasswordClick}
            className="ftInputContainer_passwordIcon"
          >
            {showPassword ? <HiddenEyeIcon /> : <EyeIcon />}
          </i>
        ) : (
          error?.message && (
            <i className="ftInputContainer_errorIcon">
              <ErrorOutline fontSize="small" style={{ fill: "#D02F2F" }} />
            </i>
          )
        )}

        {error?.message && (
          <span className="ftInputContainer_input_error">{error.message}</span>
        )}
      </>
    </div>
  );
};

export default InputWithOnChange;
