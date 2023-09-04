import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: 0,
    },
    select: {
      "& .MuiOutlinedInput-inputMarginDense": {
        padding: "5.5px",
        paddingRight: "28px",
        paddingLeft: "12px",
      },
    },
  })
);

const SelectRowsPerPage = ({ rowsPerPage, onChangeRowsPerPage }: any) => {
  const classes = useStyles();

  return (
    <div>
      <FormControl variant="outlined" size="small">
        <Select
          value={rowsPerPage}
          className={classes.select}
          onChange={onChangeRowsPerPage}
        >
          <MenuItem value={5}>5</MenuItem>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={20}>20</MenuItem>
        </Select>
      </FormControl>
    </div>
  );
};

export default SelectRowsPerPage;
