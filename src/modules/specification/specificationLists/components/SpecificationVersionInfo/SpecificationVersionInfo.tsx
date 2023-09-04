import React, { ReactElement, useContext, useEffect, useState } from "react";
import "./SpecificationVersionInfo.scss";
import InfoIcon from "@material-ui/icons/Info";
import WarningIcon from "@material-ui/icons/Warning";
import { Controller, useForm } from "react-hook-form";
import InputLabel from "@material-ui/core/InputLabel";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { DatePicker } from "@material-ui/pickers";
import IconButton from "@material-ui/core/IconButton";
import InsertInvitationIcon from "@material-ui/icons/InsertInvitation";
import { SpecificationLibDetailsContext } from "../../context/SpecificationLibDetailsContext";
import {
  setDivisionsTabStatus,
  setSpecificationVersionDetails,
  setSectionsTabStatus,
  setVersionDateValidate,
  setVersionNameValidate,
  setIsAutoUpdate,
  setIsPublishDisabled,
} from "../../context/SpecificationLibDetailsAction";
import moment from "moment";
import GlobalDatePicker from '../../../../shared/components/GlobalDatePicker/GlobalDatePicker';

const defaultValues: any = {
  VersionTitle: "",
  VersionName: "",
  VersionDate: "",
};

export default function SpecificationVersionInfo(): ReactElement {
  const [dateOpen, setDateOpen] = useState(false);
  const { SpecificationLibDetailsState, SpecificationLibDetailsDispatch }: any =
    useContext(SpecificationLibDetailsContext);
  const [versionTitleValue, setversionTitleValue] = useState("");
  const {
    handleSubmit,
    control,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<any>({
    defaultValues,
  });

  useEffect(() => {
    if (SpecificationLibDetailsState?.specificationVersionDetails) {
      setInitialValue();
    } else {
      setValue(
        "VersionDate",
        SpecificationLibDetailsState?.specificationVersionDetails
          ?.Version_Date || null,
        { shouldValidate: false }
      );
    }
  }, [SpecificationLibDetailsState?.specificationVersionDetails]);

  useEffect(() => {
    if (
      SpecificationLibDetailsState?.publishedSpecificationLists.length > 0 &&
      SpecificationLibDetailsState?.specificationLibDetails?.length > 0
    ) {
      validateVersionName(
        SpecificationLibDetailsState?.specificationLibDetails[0]
          ?.versionInfoReviewed?.versionInfo?.Set_Version_Name
      );
      validateVersionDate(
        SpecificationLibDetailsState?.specificationLibDetails[0]
          ?.versionInfoReviewed?.versionInfo?.Version_Date,
        SpecificationLibDetailsState?.specificationLibDetails[0]
          ?.versionInfoReviewed?.versionInfo?.Set_Title
      );
    }
  }, [
    SpecificationLibDetailsState?.publishedSpecificationLists,
    SpecificationLibDetailsState?.specificationLibDetails,
  ]);

  const onSubmit = () => {
    // console.log(getValues())
    // console.log('submit data')
  };
  useEffect(() => {
    if (
      SpecificationLibDetailsState?.specificationVersionDetails
        ?.Set_Version_Name
    ) {
      validateVersionName(
        SpecificationLibDetailsState?.specificationVersionDetails
          ?.Set_Version_Name
      );
    }
    if (
      SpecificationLibDetailsState?.specificationVersionDetails?.Version_Date
    ) {
      handleSpecificationVersionTime(
        SpecificationLibDetailsState?.specificationVersionDetails?.Version_Date
      );
    }
  }, []);

  const setInitialValue = () => {
    const momentDate = SpecificationLibDetailsState?.specificationVersionDetails
      ?.Version_Date
      ? moment(
          SpecificationLibDetailsState?.specificationVersionDetails
            ?.Version_Date
        ).format("DD-MMM-YYYY")
      : "";
    const resDate =
      momentDate && momentDate !== "Invalid date" ? momentDate : "";
    setversionTitleValue(
      SpecificationLibDetailsState?.specificationVersionDetails?.Set_Title || ""
    );
    setValue(
      "VersionTitle",
      SpecificationLibDetailsState?.specificationVersionDetails?.Set_Title ||
        "",
      { shouldValidate: false }
    );
    setValue(
      "VersionName",
      SpecificationLibDetailsState?.specificationVersionDetails
        ?.Set_Version_Name || "",
      { shouldValidate: false }
    );
    setValue("VersionDate", resDate || null, { shouldValidate: false });
    updateTabStatus();
  };

  const handleSpecificationVersionTitle = (e: any) => {
    setversionTitleValue(e.target.value ? e.target.value?.trim() : "");
    validateVersionDate(
      SpecificationLibDetailsState?.specificationVersionDetails?.Version_Date,
      e.target.value?.trim()
    );
  };
  const updateSpecificationVersionTitle = (e: any) => {
    const newValue = {
      ...SpecificationLibDetailsState?.specificationVersionDetails,
      Set_Title: e.target.value.trim(),
    };
    SpecificationLibDetailsDispatch(setSpecificationVersionDetails(newValue));
    SpecificationLibDetailsDispatch(setIsAutoUpdate(true));
  };
  const handleSpecificationVersionName = (e: any) => {
    //validate unique version name later
    const versionName = e.target.value?.toLowerCase();
    validateVersionName(versionName);
  };

  //validate unique version name
  const validateVersionName = (versionName: string) => {
    const publishedSpecificationArray =
      SpecificationLibDetailsState?.publishedSpecificationLists;
    const versionNameCount = publishedSpecificationArray.filter(
      (item: any) =>
        item.versionInfoReviewed.versionInfo.Set_Version_Name?.toLowerCase() ===
        versionName?.toLowerCase()
    );
    if (versionNameCount?.length > 0) {
      SpecificationLibDetailsDispatch(setVersionNameValidate(true));
      setError("VersionName", {
        type: "unique",
      });
    } else {
      SpecificationLibDetailsDispatch(setVersionNameValidate(false));
      clearErrors("VersionName");
    }
  };

  //validate unique version Date
  const validateVersionDate = (date: any, set_title: string) => {
    const momentDate = date ? moment(date).format("DD-MMM-YYYY") : "";

    if (momentDate && momentDate !== "Invalid date") {
      const publishedSpecificationArray =
        SpecificationLibDetailsState?.publishedSpecificationLists;

      const versionTitle = publishedSpecificationArray.filter(
        (item: any) =>
          item.versionInfoReviewed?.versionInfo?.Set_Title?.toLowerCase() ===
          set_title?.toLowerCase()
      );
      if (versionTitle?.length > 0) {
        const versionDateCount = publishedSpecificationArray.filter(
          (item: any) =>
            item.versionInfoReviewed?.versionInfo?.Version_Date === momentDate
        );
        if (versionDateCount?.length > 0) {
          SpecificationLibDetailsDispatch(setVersionDateValidate(true));
          setError("VersionDate", {
            type: "unique",
          });
        } else {
          SpecificationLibDetailsDispatch(setVersionDateValidate(false));
          clearErrors("VersionDate");
        }
      } else {
        SpecificationLibDetailsDispatch(setVersionDateValidate(false));
        clearErrors("VersionDate");
      }
    }
  };

  const updateSpecificationVersionName = (e: any) => {
    //validate unique version name later
    const newValue = {
      ...SpecificationLibDetailsState?.specificationVersionDetails,
      Set_Version_Name: e.target.value.trim(),
    };
    SpecificationLibDetailsDispatch(setSpecificationVersionDetails(newValue));
    SpecificationLibDetailsDispatch(setIsAutoUpdate(true));
  };

  const handleSpecificationVersionTime = (e: any) => {
    //validate unique version date later
    const momentDate = e ? moment(e).format("DD-MMM-YYYY") : "";
    // const momentUtc = momentDate ? moment(momentDate).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'): ''
    // const resDate = momentUtc && momentUtc !== 'Invalid date' ? momentUtc : '';
    const newValue = {
      ...SpecificationLibDetailsState?.specificationVersionDetails,
      Version_Date: momentDate,
    };
    SpecificationLibDetailsDispatch(setSpecificationVersionDetails(newValue));
    SpecificationLibDetailsDispatch(setIsAutoUpdate(true));
    validateVersionDate(
      e,
      SpecificationLibDetailsState?.specificationVersionDetails?.Set_Title
    );
  };

  const updateTabStatus = () => {
    if (
      !SpecificationLibDetailsState?.specificationVersionDetails
        ?.Set_Version_Name ||
      !SpecificationLibDetailsState?.specificationVersionDetails?.Set_Title ||
      !SpecificationLibDetailsState?.specificationVersionDetails?.Version_Date
    ) {
      SpecificationLibDetailsDispatch(setDivisionsTabStatus(true));
      SpecificationLibDetailsDispatch(setSectionsTabStatus(true));
      SpecificationLibDetailsDispatch(setIsPublishDisabled(true));
    } else {
      SpecificationLibDetailsDispatch(setDivisionsTabStatus(false));
      SpecificationLibDetailsDispatch(setIsPublishDisabled(false));
    }
  };

  return (
    <div className="specification-versionInfo">
      <div className="specification-versionInfo__note">
        <div className="specification-versionInfo__note__logo">
          <InfoIcon />
        </div>
        <div className="specification-versionInfo__note__text">
          <span>Note:</span> This information is used to identify the uploaded
          document set as a unique version.
        </div>
      </div>
      {(SpecificationLibDetailsState?.isInvalidVersionName ||
        SpecificationLibDetailsState?.isInvalidVersionDate) && (
        <div className="specification-versionInfo__warning">
          <div className="specification-versionInfo__warning__logo">
            <WarningIcon />
          </div>
          <div className="specification-versionInfo__warning__text">
            <span>Warning:</span> A specification set has already been uploaded
            with this same Version Info. We recommend that every specification
            set has a unique Version Name and Version Date
          </div>
        </div>
      )}
      <div className="specification-versionInfo__details">
        <form
          className="specification-versionInfo__details__form"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="specification-versionInfo__details__form__field">
            <InputLabel required={true}>Specification title </InputLabel>
            <div className="specification-versionInfo__details__form__field__input-field">
              <Controller
                render={({ field }: { field: any }) => (
                  <TextField
                    type="text"
                    {...field}
                    fullWidth
                    autoComplete="search"
                    placeholder="Enter Specification name"
                    variant="outlined"
                    onChange={(e) => {
                      field.onChange(e), handleSpecificationVersionTitle(e);
                    }}
                    onBlur={(e) => {
                      field.onChange(e), updateSpecificationVersionTitle(e);
                    }}
                  />
                )}
                name="VersionTitle"
                control={control}
                rules={{
                  required: true,
                  // validate: isUniqueProjectName
                }}
              />
              <div className="specification-versionInfo__details__form__field__error-wrap">
                <p className="specification-versionInfo__details__form__field__error-wrap__message">
                  {errors.VersionTitle?.type === "required" ? (
                    <span>Specification title required</span>
                  ) : (
                    errors.VersionTitle?.type === "unique" && (
                      <span>*Specification title already exists</span>
                    )
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="specification-versionInfo__details__form__field">
            <InputLabel required={true}>Version name </InputLabel>
            <div className="specification-versionInfo__details__form__field__input-field">
              <Controller
                render={({ field }: { field: any }) => (
                  <TextField
                    type="text"
                    {...field}
                    fullWidth
                    autoComplete="search"
                    placeholder="Enter Version Name"
                    variant="outlined"
                    onChange={(e) => {
                      field.onChange(e), handleSpecificationVersionName(e);
                    }}
                    onBlur={(e) => {
                      field.onChange(e), updateSpecificationVersionName(e);
                    }}
                  />
                )}
                name="VersionName"
                control={control}
                rules={{
                  required: true,
                  // validate: isUniqueProjectName
                }}
              />
              <div className="specification-versionInfo__details__form__field__error-wrap">
                <p className="specification-versionInfo__details__form__field__error-wrap__message">
                  {errors.VersionName?.type === "required" ? (
                    <span>Version name required</span>
                  ) : (
                    errors.VersionName?.type === "unique" && (
                      <span>* Version name already exists</span>
                    )
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="specification-versionInfo__details__form__field">
            <InputLabel required={true}>Version date </InputLabel>
            <div className="specification-versionInfo__details__form__field__input-field">
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Controller
                  render={({ field }: { field: any }) => (
                    <div className="date-picker">
                      <GlobalDatePicker
                        id="version-date"
                        {...field}
                        clearable={true}
                        inputVariant={"outlined"}
                        fullWidth
                        emptyLabel="DD-MMM-YYYY"
                        format="dd-MMM-yyyy"
                        keyboardbuttonprops={{
                          "aria-label": "change date",
                        }}
                        open={dateOpen}
                        onClose={() => setDateOpen(false)}
                        {...field.rest}
                        onChange={(e:any) => {
                          field.onChange(e), handleSpecificationVersionTime(e);
                        }}
                      />
                      <IconButton
                        aria-label="delete"
                        className="calendar-icon"
                        onClick={() => setDateOpen(true)}
                      >
                        <InsertInvitationIcon />
                      </IconButton>
                    </div>
                  )}
                  name="VersionDate"
                  control={control}
                  rules={{
                    required: true,
                    // validate: isUniqueProjectName
                  }}
                />
              </MuiPickersUtilsProvider>
              <div className="specification-versionInfo__details__form__field__error-wrap">
                <p className="specification-versionInfo__details__form__field__error-wrap__message">
                  {errors.VersionDate?.type === "required" ? (
                    <span>Version date required</span>
                  ) : (
                    errors.VersionDate?.type === "unique" && (
                      <span>*Version date already exists</span>
                    )
                  )}
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
