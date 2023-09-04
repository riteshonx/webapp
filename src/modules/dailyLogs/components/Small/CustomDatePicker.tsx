import React, { useState } from "react";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import { TextField } from "@material-ui/core";
import TextContent from "../Micro/TextContent";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import GlobalDatePicker from "src/modules/shared/components/GlobalDatePicker/GlobalDatePicker";

const useStyles = makeStyles(() =>
  createStyles({
    textField: {
      width: "25ch",
    },
    input: {
      padding: "8px",
    },
    root: {
      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "black",
      },
      "& .MuiOutlinedInput-root input": {
        padding: "8px",
      },
    },
  })
);

const CustomTextField = ({ value, onClick }: any) => {
  const classes = useStyles();
  return (
    <TextField
      variant="outlined"
      value={value}
      disabled
      classes={{ root: classes.root }}
      onClick={onClick}
    />
  );
};

interface CustomDatePickerProps {
  label: string;
  value: string | null;
  onChange: (e: any) => void;
}

const CustomDatePicker: React.VFC<CustomDatePickerProps> = ({
  label,
  value,
  onChange,
}) => {
  const classes = useStyles();

  return (
    <>
      <TextContent content={label} />
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <GlobalDatePicker
          className={classes.root}
          format="DD-MMM-yyyy"
          clearable
          value={value}
          onChange={(data: MaterialUiPickersDate) => {
            onChange({ target: { value: data } });
          }}
          minDate={new Date()}
          inputVariant="outlined"
        />
      </MuiPickersUtilsProvider>
    </>
  );
};

export default CustomDatePicker;
