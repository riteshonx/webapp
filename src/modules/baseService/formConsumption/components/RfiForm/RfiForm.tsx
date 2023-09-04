import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import { MuiPickersUtilsProvider, TimePicker } from "@material-ui/pickers";
import React, { ReactElement, useContext, useState } from "react";
import { InputType } from "../../../../../utils/constants";
import CustomListValue from "../CustomListValue/CustomListValue";
import MultiValueCompany from "../MultiValueCompany/MultiValueCompany";
import MultiValueUser from "../MultiValueUser/MultiValueUser";
import ScheduleIcon from "@material-ui/icons/Schedule";
import InsertInvitationIcon from "@material-ui/icons/InsertInvitation";
import "./RfiForm.scss";
import FileAttachment from "../FileAttachment/FileAttachment";
import LocationTree from "../LocationTree/LocationTree";
import SingleFileAttachment from "../SingleFileAttachment/SingleFileAttachment";
import CustomTextInput from "../CustomTextInput/CustomTextInput";
import CustomNumberInput from "../CustomNumberInput/CustomNumberInput";
import { Controller } from "react-hook-form";
import { formStateContext } from "../../Context/projectContext";
import MomentUtils from "@date-io/moment";
import moment from "moment";
import "moment-timezone";
import CustomLinkTextArea from "../CustomLinkTextArea/CustomLinkTextArea";
import GlobalDatePicker from "../../../../shared/components/GlobalDatePicker/GlobalDatePicker";
import GlobalDateTimePicker from "../../../../shared/components/GlobalDatePicker/GlobalDateTimePicker";
import AssetData from '../AssetData/AssetData'

moment.tz.setDefault("Europe/London"); // dynamic time-zone will come in future
interface IProps {
  formData: any;
  type: string;
  isSpecification?: boolean;
  isEditDisabled: boolean;
  control: any;
}

function RfiForm({
  formData,
  type,
  isSpecification,
  control,
  isEditDisabled,
}: IProps): ReactElement {
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [dateTimeOpen, setDateTimeOpen] = useState(false);
  const { setIsDirty }: any = useContext(formStateContext);

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
                isEditAllowed={isEditDisabled}
              />
            );
          case InputType.LONGTEXT:
            return (
              <CustomLinkTextArea
                control={control}
                formData={formData}
                isEditAllowed={isEditDisabled}
              />
            );
          case InputType.INTEGER:
            return (
              <CustomNumberInput
                control={control}
                formData={formData}
                isEditAllowed={isEditDisabled}
                isSpecification={isSpecification ? true : false}
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
                        disabled={isEditDisabled}
                        onChange={(e) => {
                          field.onChange(e), setIsDirty(true);
                        }}
                        InputProps={{
                          onClick: () => {
                            if (!isEditDisabled) {
                              setTimeOpen(true);
                            }
                          },
                        }}
                        onClose={() => setTimeOpen(false)}
                      />
                      {!isEditDisabled && (
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
                name={`${formData.elementId}-fieldTypeId${formData.fieldTypeId}`}
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
                        disabled={isEditDisabled}
                        open={dateOpen}
                        onClose={() => setDateOpen(false)}
                        {...field.rest}
                        onChange={(e: any) => {
                          field.onChange(e), setIsDirty(true);
                        }}
                        InputProps={{
                          onClick: () => {
                            if (!isEditDisabled) {
                              setDateOpen(true);
                            }
                          },
                        }}
                      />
                      {!isEditDisabled && (
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
                name={`${formData.elementId}-fieldTypeId${formData.fieldTypeId}`}
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
                        disabled={isEditDisabled}
                        onChange={(e: any) => {
                          field.onChange(e), setIsDirty(true);
                        }}
                        open={dateTimeOpen}
                        InputProps={{
                          onClick: () => {
                            if (!isEditDisabled) {
                              setDateTimeOpen(true);
                            }
                          },
                        }}
                        onClose={() => setDateTimeOpen(false)}
                      />

                      {!isEditDisabled && (
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
                name={`${formData.elementId}-fieldTypeId${formData.fieldTypeId}`}
                control={control}
                rules={{
                  required: formData.required ? true : false,
                }}
              />
            );
            // TODO-LATER-WITH-PROPER-CHANGES
            case InputType.ASSETTYPES:
              return (
                <Controller
                render={({ field }: { field: any }) => (
                  <AssetData
                    field={field}
                    formData={formData}
                    isEditAllowed={isEditDisabled}
                  />
                )}
                name={`${formData.elementId}-fieldTypeId${formData.fieldTypeId}`}
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
                name={`${formData.elementId}-fieldTypeId${formData.fieldTypeId}`}
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
                    isEditAllowed={isEditDisabled}
                  />
                )}
                name={`${formData.elementId}-fieldTypeId${formData.fieldTypeId}`}
                control={control}
                rules={{
                  required: formData.required ? true : false,
                }}
              />
            );
          case InputType.LOCATIONTREE:
            return (
              <Controller
                render={({ field }: { field: any }) => (
                  <LocationTree
                    field={field}
                    formData={formData}
                    isEditAllowed={isEditDisabled}
                  />
                )}
                name={`${formData.elementId}-fieldTypeId${formData.fieldTypeId}`}
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
                name={`${formData.elementId}-fieldTypeId${formData.fieldTypeId}`}
                control={control}
                rules={{
                  required: formData.required ? true : false,
                }}
              />
            );
          case InputType.MULTIVALUEUSER:
          case InputType.SINGLEVALUEUSER:
            return (
              <MultiValueUser
                control={control}
                isEditAllowed={isEditDisabled}
                formData={formData}
              />
            );
          case InputType.MULTIVALUECOMPANY:
          case InputType.SINGLEVALUECOMPANY:
            return (
              <MultiValueCompany
                control={control}
                isEditAllowed={isEditDisabled}
                formData={formData}
              />
            );
          case InputType.ATTACHMENT:
            return (
              <Controller
                render={({ field }: { field: any }) =>
                  type === "TABLE" ? (
                    <SingleFileAttachment
                      field={field}
                      formData={formData}
                      isEditAllowed={isEditDisabled}
                    />
                  ) : (
                    <FileAttachment
                      field={field}
                      formData={formData}
                      isEditAllowed={isEditDisabled}
                    />
                  )
                }
                name={`${formData.elementId}-fieldTypeId${formData.fieldTypeId}`}
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

export default React.memo(RfiForm);
