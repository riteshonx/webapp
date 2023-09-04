import { DatePicker } from '@material-ui/pickers';
import moment from 'moment';
import React, { useState } from 'react';


const GlobalDatePicker = (props: any) => {
  const [selectedDate, handleDateChange] = useState(
    moment(new Date()).toDate()
  );

  const {
    onChange,
    value,
    views,
    className,
    name,
    placeholder,
    KeyboardButtonProps,
    format,
    data_testid,
    TextFieldComponent,
    ...otherProps
  } = props;

  return (
      <DatePicker
        autoOk
        data-testid={data_testid}
        className={className}
        views = {['year', 'month','date']}
        value={value}
        onChange={onChange}
        format={format}
        name={name}
        placeholder={placeholder}
        KeyboardButtonProps={KeyboardButtonProps}
        TextFieldComponent={TextFieldComponent}
        {...otherProps}
      />
  );
};

export default GlobalDatePicker;
