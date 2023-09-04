import React from "react";
import clsx from "clsx";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import FormControl from "@material-ui/core/FormControl";
import TextContent from "../Micro/TextContent";

interface InputWithLabelProps {
  label: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => void;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      flexWrap: "wrap",
    },
    textField: {
      width: "25ch",
    },
    input: {
      padding: "8px",
    },
    focused: {
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "black",
      },
    },
  })
);

const InputWithLabel: React.VFC<InputWithLabelProps> = ({
  label,
  value,
  onChange,
}) => {
  const classes = useStyles();
  return (
    <FormControl className={clsx(classes.textField)} variant="outlined">
      <TextContent content={label} />
      <OutlinedInput
        inputProps={{ type: "textarea" }}
        classes={{ input: classes.input, focused: classes.focused }}
        value={value}
        onChange={onChange}
        labelWidth={0}
      />
    </FormControl>
  );
};

export default InputWithLabel;
