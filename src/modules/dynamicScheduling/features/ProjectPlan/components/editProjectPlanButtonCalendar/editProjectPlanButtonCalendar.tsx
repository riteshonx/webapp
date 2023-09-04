import { createMuiTheme } from '@material-ui/core';
import { Overrides } from '@material-ui/core/styles/overrides';
import { DatePicker } from '@material-ui/pickers';
import { MuiPickersOverrides } from '@material-ui/pickers/typings/overrides';
import { ThemeProvider } from '@material-ui/styles';
import moment from 'moment';
import React, { useState } from 'react';

type overridesNameToClassKey = {
  [P in keyof MuiPickersOverrides]: keyof MuiPickersOverrides[P];
};

declare module '@material-ui/core/styles/overrides' {
  // tslint:disable-next-line:no-empty-interface to only disable the no-empty-interface
  //   added xyz work around for no-empty-interface error
  export interface ComponentNameToClassKey extends overridesNameToClassKey {
    xyz?: any;
  }
}

const materialTheme = createMuiTheme({
  palette: {
    primary: {
      main: '#0D444B',
      light: '#fff',
      dark: '#ba000d',
      contrastText: '#fff',
    },
  },
  typography: {
    // Tell Material-UI what the font-size on the html element is.
    htmlFontSize: 12,
    fontFamily: "'Poppins', sans-serif",
  },
  overrides: {
    MuiPickersToolbar: {
      toolbar: {
        //backgroundColor: '#0D444B;',
      },
    },

    MuiInput: {
      underline: {
        '&:after': {
          borderBottom: 'none',
        },
        '&&:hover::before': {
          borderBottom: 'none',
        },

        '&:before': {
          borderBottom: 'none',
        },
      },
      disabled: {
        '&:before': {
          borderBottom: 'none',
        },
      },
    },
    MuiInputBase: {
      root: {
        '&$disabled': {
          color: '#000',
          '&:before': {
            borderBottomStyle: 'none !important',
          },
        },
      },
    },
  },
});
const EditProjectPlanButtonCalendar = (props: any) => {
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
    <ThemeProvider theme={materialTheme}>
      <DatePicker
        autoOk
        data-testid={data_testid}
        className={className}
        views={views}
        value={value}
        onChange={onChange}
        format={format}
        name={name}
        placeholder={placeholder}
        KeyboardButtonProps={KeyboardButtonProps}
        TextFieldComponent={TextFieldComponent}
        {...otherProps}
      />
    </ThemeProvider>
  );
};

export default EditProjectPlanButtonCalendar;
