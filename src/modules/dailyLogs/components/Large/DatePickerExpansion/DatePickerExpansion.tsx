import { ReactElement } from "react";
import "./DatePickerExpansion.scss";
import { DatePicker } from "@material-ui/pickers";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import moment from "moment";
import GlobalDatePicker from '../../../../shared/components/GlobalDatePicker/GlobalDatePicker';

function DatePickerExpansion(props: any): ReactElement {
  return (
    <MuiPickersUtilsProvider libInstance={moment} utils={MomentUtils}>
      <GlobalDatePicker
        id={`dailyLog-startDate`}
        clearable={true}
        fullWidth
        value={props.filterDate}
        emptyLabel="Select date"
        format="DD MMM yyyy"
        onChange={(e: any) => props.handleFilterDate(e)}
        InputLabelProps={{ variant: "outlined" }}
        disableFuture
      />
    </MuiPickersUtilsProvider>
  );
}

export default DatePickerExpansion;
