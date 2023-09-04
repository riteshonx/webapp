import { ReactElement } from "react";
import "./InputField.scss";

function InputField({
  placeholder,
  value,
  handleChange,
  displayError,
  onFocus,
  workflowName,
  onClick,
  onKeyPress,
  className,
}: any): ReactElement {
  return (
    <input
      autoFocus={true}
      onFocus={onFocus}
      className={className ? className : "input"}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      onClick={onClick}
      style={{
        border: displayError || workflowName ? "1px solid #E12323" : "",
      }}
      onKeyPress={onKeyPress}
    />
  );
}

export default InputField;
