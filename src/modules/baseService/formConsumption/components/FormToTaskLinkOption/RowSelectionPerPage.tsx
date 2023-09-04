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

const RowSelectionPerPage = ({ rowsPerPage, onChangeRowsPerPage }: any) => {
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
            >
              <MenuItem value={10}>10 Records Per Page</MenuItem>
              <MenuItem value={20}>20 Records Per Page</MenuItem>
              <MenuItem value={25}>25 Records Per Page</MenuItem>
              <MenuItem value={30}>30 Records Per Page</MenuItem>
              <MenuItem value={35}>35 Records Per Page</MenuItem>
              <MenuItem value={40}>40 Records Per Page</MenuItem>
              <MenuItem value={50}>50 Records Per Page</MenuItem>
              <MenuItem value={100}>100 Records Per Page</MenuItem>
            </Select>
          </Grid>
        </Grid>
      </FormControl>
    </div>
  );
};

export default RowSelectionPerPage;
