import InfoIcon from '@material-ui/icons/Info';
import PropTypes from 'prop-types';
import React from 'react';
import SearchIcon from '../../../../../assets/images/search.svg';
import './TextFieldCustom.scss';
const TextFieldCustom = (props: any) => {
  const {
    name,
    placeholder,
    value,
    label,
    error,
    info,
    type,
    onChange,
    disabled,
    className,
    min,
    onKeyDown,
    required,
    maxLength,
    searchIcon,
    tooltip,
    autoFocus,
    ...otherProps
  } = props;

  const formatDate = (value: any) => {
    let dd = new Date(value).getDay().toString();
    let mm = new Date(value).getMonth().toString(); //

    if (parseInt(dd) < 10) {
      dd = '0' + dd;
    }
    if (parseInt(mm) < 10) {
      mm = '0' + mm;
    }
    return new Date(value).getFullYear() + '-' + mm + '-' + dd;
  };
  return (
    <div className="form">
      <div className={`form-group ${className}`}>
        {label && (
          <label className="form-label" htmlFor={name}>
            {label}
            {required ? (
              <span className={required ? 'required' : ''}> * </span>
            ) : null}
          </label>
        )}

        {/* {error && <InfoIcon className="text_field_custom-info-icon"></InfoIcon>} */}
        {searchIcon && <img src={SearchIcon} className="search-icon" />}
        <input
          type={type}
          className={`form-control   ${error ? 'is-invalid' : ''} ${
            searchIcon ? 'pl-40' : ''
          }
          `}
          placeholder={placeholder}
          value={type === 'date' ? formatDate(value) : value}
          onChange={onChange}
          name={name}
          min={min}
          disabled={disabled}
          onKeyPress={onKeyDown}
          maxLength={maxLength}
          title={tooltip}
          autoFocus= {autoFocus}
          onKeyDown={onKeyDown}
          {...otherProps}
        />

        {info && <small className="form-text text-muted">{info}</small>}
        {error && <div className="error"> {error} </div>}
      </div>
    </div>
  );
};

TextFieldCustom.propTypes = {
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string.isRequired,
  info: PropTypes.string,
  error: PropTypes.string,
  type: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func,
  disabled: PropTypes.bool,
  label: PropTypes.string,
  min: PropTypes.number,
  className: PropTypes.string,
  required: PropTypes.bool,
  maxLength: PropTypes.number,
  onBlur: PropTypes.func,
  onmouseup: PropTypes.func,
  searchIcon: PropTypes.bool,
  tooltip: PropTypes.string,
  autoFocus: PropTypes.any,
};

TextFieldCustom.defaultsProps = {
  type: 'text',
};
export default TextFieldCustom;
