import { ReactElement, useContext, useState } from "react";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import { FormControlLabel, Radio, RadioGroup } from "@material-ui/core";

import {
  DatePicker,
  DateTimePicker,
  MuiPickersUtilsProvider,
  TimePicker,
} from "@material-ui/pickers";
import InsertInvitationIcon from "@material-ui/icons/InsertInvitation";
import ScheduleIcon from "@material-ui/icons/Schedule";
import { InputType } from "src/utils/constants";
import { Controller } from "react-hook-form";
import MomentUtils from "@date-io/moment";
import moment from "moment";
import "moment-timezone";
import {
  CustomListValue,
  CustomTextInput,
  CustomTextArea,
} from "../formComponents";
import "./DynamicTemplateForm.scss";
import { makeStyles } from "@material-ui/styles";
import { formStateContext } from "../../context/context";
import GlobalDatePicker from '../../../../shared/components/GlobalDatePicker/GlobalDatePicker';
import GlobalDateTimePicker from "src/modules/shared/components/GlobalDatePicker/GlobalDateTimePicker";

moment.tz.setDefault("Europe/London");
interface IProps {
  formData: any;
  type: string;
  isSpecification?: boolean;
  isEditAllowed: boolean;
}

const useStyles = makeStyles({
  radioGroup: {
    flexDirection: "row",
  },
});

function DynamicTemplateForm({
  formData,
  isSpecification,
  isEditAllowed,
}: IProps): ReactElement {
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [dateTimeOpen, setDateTimeOpen] = useState(false);
  const classes = useStyles();
  const { setIsDirty, control }: any = useContext(formStateContext);

  return (
    <div>
      {(() => {
        switch (formData.fieldTypeId) {
          case InputType.TEXT:
            return (
              <CustomTextInput
                control={control}
                formData={formData}
                isSpecification={isSpecification ? true : false}
                isEditAllowed={isEditAllowed}
              />
            );
          case InputType.LONGTEXT:
            return (
              <CustomTextArea
                control={control}
                formData={formData}
                isSpecification={isSpecification ? true : false}
                isEditAllowed={isEditAllowed}
              />
            );
          case InputType.BOOLEAN:
            return (
              <Controller
                render={({ field }: { field: any }) => (
                  <RadioGroup
                    name="booleanGroup"
                    {...field}
                    value={field.value ?? ""}
                    classes={{ root: classes.radioGroup }}
                  >
                    <FormControlLabel
                      className="form-radio"
                      value="true"
                      control={<Radio color="default" />}
                      label="Yes"
                    />
                    <FormControlLabel
                      className="form-radio"
                      value="false"
                      control={<Radio color="default" />}
                      label="No"
                    />
                  </RadioGroup>
                )}
                name={formData.elementId}
                control={control}
                rules={{
                  required: formData.required ? true : false,
                }}
              />
            );

          case InputType.TIMEPICKER:
            return (
              <Controller
                render={({ field }: { field: any }) => (
                  <MuiPickersUtilsProvider
                    libInstance={moment}
                    utils={MomentUtils}
                  >
                    <div className="date-picker">
                      <TimePicker
                        id={`date-time-${formData.elementId}`}
                        fullWidth
                        clearable={true}
                        {...field}
                        inputVariant={"outlined"}
                        ampm={true}
                        emptyLabel="HH:mm"
                        format="HH:mm"
                        value={field.value}
                        open={timeOpen}
                        disabled={isEditAllowed}
                        onChange={(e) => {
                          field.onChange(e), setIsDirty(true);
                        }}
                        InputProps={{
                          onClick: () => {
                            if (!isEditAllowed) {
                              setTimeOpen(true);
                            }
                          },
                        }}
                        onClose={() => setTimeOpen(false)}
                      />
                      {!isEditAllowed && (
                        <IconButton
                          aria-label="delete"
                          className="calendar-icon"
                          onClick={() => setTimeOpen(true)}
                        >
                          <InsertInvitationIcon />
                        </IconButton>
                      )}
                    </div>
                  </MuiPickersUtilsProvider>
                )}
                name={formData.elementId}
                control={control}
                rules={{
                  required: formData.required ? true : false,
                }}
              />
            );
          case InputType.DATEPICKER:
            return (
              <Controller
                render={({ field }: { field: any }) => (
                  <MuiPickersUtilsProvider
                    libInstance={moment}
                    utils={MomentUtils}
                  >
                    <div className="date-picker">
                      <GlobalDatePicker
                        id={`date-picker-${formData.elementId}`}
                        {...field}
                        clearable={true}
                        inputVariant={"outlined"}
                        fullWidth
                        emptyLabel="DD-MMM-YYYY"
                        format="DD-MMM-yyyy"
                        keyboardbuttonprops={{
                          "aria-label": "change date",
                        }}
                        disabled={isEditAllowed}
                        open={dateOpen}
                        onClose={() => setDateOpen(false)}
                        {...field.rest}
                        onChange={(e:any) => {
                          field.onChange(e), setIsDirty(true);
                        }}
                        InputProps={{
                          onClick: () => {
                            if (!isEditAllowed) {
                              setDateOpen(true);
                            }
                          },
                        }}
                      />
                      {!isEditAllowed && (
                        <IconButton
                          aria-label="delete"
                          className="calendar-icon"
                          onClick={() => setDateOpen(true)}
                        >
                          <InsertInvitationIcon />
                        </IconButton>
                      )}
                    </div>
                  </MuiPickersUtilsProvider>
                )}
                name={formData.elementId}
                control={control}
                rules={{
                  required: formData.required ? true : false,
                }}
              />
            );
          case InputType.DATETIMEPICKER:
            return (
              <Controller
                render={({ field }: { field: any }) => (
                  <MuiPickersUtilsProvider
                    libInstance={moment}
                    utils={MomentUtils}
                  >
                    <div className="time-picker">
                      <GlobalDateTimePicker
                        className="date-time-picker"
                        id={`date-time-${formData.elementId}`}
                        fullWidth
                        clearable={true}
                        {...field}
                        inputVariant={"outlined"}
                        ampm={true}
                        emptyLabel="DD-MMM-YYYY HH:mm"
                        format="DD-MMM-yyyy HH:mm"
                        value={field.value}
                        disabled={isEditAllowed}
                        onChange={(e:any) => {
                          field.onChange(e), setIsDirty(true);
                        }}
                        open={dateTimeOpen}
                        InputProps={{
                          onClick: () => {
                            if (!isEditAllowed) {
                              setDateTimeOpen(true);
                            }
                          },
                        }}
                        onClose={() => setDateTimeOpen(false)}
                      />

                      {!isEditAllowed && (
                        <IconButton
                          aria-label="delete"
                          className="clock-icon"
                          onClick={() => setDateTimeOpen(true)}
                        >
                          <ScheduleIcon />
                        </IconButton>
                      )}
                    </div>
                  </MuiPickersUtilsProvider>
                )}
                name={formData.elementId}
                control={control}
                rules={{
                  required: formData.required ? true : false,
                }}
              />
            );
          case InputType.LOCATION:
            return (
              <Controller
                render={({ field }: { field: any }) => (
                  <TextField
                    id={`location-${formData.elementId}`}
                    type="text"
                    {...field}
                    fullWidth
                    autoComplete="off"
                    variant="outlined"
                    placeholder="Location"
                    onChange={(e) => {
                      field.onChange(e), setIsDirty(true);
                    }}
                  />
                )}
                name={formData.elementId}
                control={control}
                rules={{
                  required: formData.required ? true : false,
                }}
              />
            );
          case InputType.CUSTOMDROPDOWN:
            return (
              <Controller
                render={({ field }: { field: any }) => (
                  <CustomListValue
                    field={field}
                    formData={formData}
                    isEditAllowed={isEditAllowed}
                  />
                )}
                name={formData.elementId}
                control={control}
                rules={{
                  required: formData.required ? true : false,
                }}
              />
            );

          case InputType.COMMENTS:
            return (
              <Controller
                render={({ field }: { field: any }) => (
                  <TextField
                    id={`comments-${formData.elementId}`}
                    type="text"
                    {...field}
                    fullWidth
                    autoComplete="off"
                    variant="outlined"
                    multiline
                    rows={2}
                    rowsMax={2}
                    placeholder="Text area"
                    onChange={(e) => {
                      field.onChange(e), setIsDirty(true);
                    }}
                  />
                )}
                name={formData.elementId}
                control={control}
                rules={{
                  required: formData.required ? true : false,
                }}
              />
            );
          default:
            null;
        }
      })()}
    </div>
  );
}

export default DynamicTemplateForm;
