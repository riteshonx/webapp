import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { Grid, InputLabel } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      marginLeft: "5rem",
    },
    select: {
      "& .MuiOutlinedInput-inputMarginDense": {
        padding: "5.5px",
        paddingRight: "28px",
        paddingLeft: "12px",
      },
    },
    label:{
        marginTop:"3px",
        fontWeight: 600
    }
  })
);

const TableRowsSelectionPerPage = ({ rowsPerPage, onChangeRowsPerPage, values}: any) => {
  const classes = useStyles();

  return (
    <div className={classes.formControl}>
      <FormControl variant="outlined" size="small" >
        <Grid container >
          <Grid item xs={3}>
            <div className={classes.label}>Show </div>
          </Grid>
          <Grid item xs={9}>
            <Select
              value={rowsPerPage}
              className={classes.select}
              onChange={onChangeRowsPerPage}
            >{values.map((item: number)=>(
                <MenuItem key={`Item-${item}`} value={item}>{item} Records Per Page</MenuItem>
            ))}
            </Select>
          </Grid>
        </Grid>
      </FormControl>
    </div>
  );
};

export default TableRowsSelectionPerPage;
