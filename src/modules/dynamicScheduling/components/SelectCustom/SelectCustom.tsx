import PropTypes from 'prop-types';
import './SelectCustom.scss';

const SelectListGroup = (props: any) => {
  const {
    name,
    value,
    error,
    info,
    onChange,
    options,
    label,
    className,
    disabled,
    required,
  } = props;
  const selectOptions = options.map((option: any) => (
    <option key={option.value} value={option.value}>
      {option.label}
    </option>
  ));
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label className="form-label" htmlFor={name}>
          {label}
          {required && <span style={{color: "red"}}> * </span>}
        </label>
      )}
      
      <select
        className={`form-control form custom-select' ${
          error ? 'is-invalid' : ''
        }
          `}
        value={value}
        onChange={onChange}
        name={name}
        disabled={disabled}
      >
        {selectOptions}
        </select>
      {info && <small className="form-text text-muted">{info}</small>}
      {error && <div className="invalid-feedback"> {error} </div>}
    </div>
  );
};

SelectListGroup.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  info: PropTypes.string,
  error: PropTypes.string,
  label: PropTypes.string,
  className: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
};

export default SelectListGroup;
