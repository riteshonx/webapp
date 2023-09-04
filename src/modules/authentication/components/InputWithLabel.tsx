import "./InputWithLabel.scss";
import {
  Visibility as EyeIcon,
  VisibilityOff as HiddenEyeIcon,
  ErrorOutline,
} from "@material-ui/icons";

const InputWithLabel = ({
  register,
  label,
  field,
  defaultValue = "",
  type = "text",
  error,
  readOnly,
  showPassword = false,
  handleShowPasswordClick,
  smallLabel = false,
  customStyle = {},
  placeholder = "",
  dashboardType
}: any) => {
  return (
    <div className={dashboardType? "ftInputContainer__slateDashboard ftInputContainer":"ftInputContainer"} style={{ ...customStyle }}>
      <>
        <label
          className={dashboardType?`ftInputContainer_label ${
            smallLabel && " ftInputContainer__slateDashboard smallFontSizeForLabel"
          }`  :`ftInputContainer_label ${
            smallLabel && "smallFontSizeForLabel"
          }`}
        >
          {label}
        </label>
        <input
          placeholder={placeholder}
          className={`ftInputContainer_input ${
            error?.message && "with_error_border"
          } ${readOnly ? `with_disabled` : ``}
          
          ${type === "password" && `mb_xl`}`}
          type={
            showPassword
              ? "text"
              : type.includes("password")
              ? "password"
              : type
          }
          defaultValue={defaultValue}
          {...register(field)}
          readOnly={readOnly}
          // disabled={readOnly?true:false}
        />
        {type.includes("password") ? (
          <i
            onClick={handleShowPasswordClick}
            className={`${
              smallLabel
                ? "ftInputContainer_small_passwordIcon"
                : "ftInputContainer_passwordIcon"
            }`}
          >
            {showPassword ? <HiddenEyeIcon /> : <EyeIcon />}
          </i>
        ) : (
          error?.message && (
            <i
              className={`${
                smallLabel
                  ? "ftInputContainer_small_errorIcon"
                  : "ftInputContainer_errorIcon"
              }`}
            >
              <ErrorOutline fontSize="small" style={{ fill: "#D02F2F" }} />
            </i>
          )
        )}
        {error?.message && (
          <span
            className={
              type === "password"
                ? `ftInputContainer_input_error_createPassword`
                : `ftInputContainer_input_error`
            }
          >
            {error.message}
          </span>
        )}
      </>
    </div>
  );
};

export default InputWithLabel;
