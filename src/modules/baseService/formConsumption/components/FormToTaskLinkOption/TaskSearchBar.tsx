import { Box, InputAdornment, OutlinedInput } from "@material-ui/core";
import { ChangeEvent, FC } from "react";
import { SearchOutlined } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  focused: {
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#000",
    },
  },
});

type TaskSearchBarProps = {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

const TaskSearchBar: FC<TaskSearchBarProps> = ({ value, onChange }) => {
  const classes = useStyles();
  return (
    <Box flex="1">
      <OutlinedInput
        classes={{ focused: classes.focused }}
        fullWidth
        value={value}
        onChange={onChange}
        placeholder="Search Work Packages or Tasks here"
        startAdornment={
          <InputAdornment position="start">
            <SearchOutlined />
          </InputAdornment>
        }
      />
    </Box>
  );
};

export default TaskSearchBar;
