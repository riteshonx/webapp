import Checkbox from "@material-ui/core/Checkbox";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import ListItemText from "@material-ui/core/ListItemText";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import React, { ReactElement, useContext, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { match, useRouteMatch } from "react-router-dom";
import { useDebounce } from "../../../../../customhooks/useDebounce";
import { decodeExchangeToken } from "../../../../../services/authservice";
import { client } from "../../../../../services/graphql";
import { tenantCompanyRole } from "../../../../../utils/role";
import { CustomPopOver } from "../../../../shared/utils/CustomPopOver";
import { updateTenantCompany } from "../../../roles/utils/permission";
import {
  setCompanyDetailsDirty,
  setCompanyIDValidation,
  setCompanyMetricsDetails,
  setCompanyValidation,
} from "../../Context/CompanyDetailsAction";
import { CompanyDetailsContext } from "../../Context/CompanyDetailsContext";
import { FETCH_COMPANY_BY_COMPANY_ID } from "../../graphql/queries/companies";
import { postApiWithEchange } from "src/services/api";
import { getExchangeToken } from "../../../../../services/authservice";
import "./CompanyDetails.scss";

const defaultValues: any = {
  CompanyId: "",
  CompanyPhone: "",
  CompanyEmail: "",
  CompanyWebsite: "",
  CompanyAddress: "",
  CompanyTrades: [],
  CompanyService: "",
  CompanyServiceLocation: "",
};

export interface Params {
  companyId: string;
}

export default function CompanyDetails(props: any): ReactElement {
  const classes = CustomPopOver();
  const pathMatch: match<Params> = useRouteMatch();
  const { companyDetailsState, companyDetailsDispatch }: any = useContext(
    CompanyDetailsContext
  );
  const [companyTradesData, setCompanyTradesData] = useState<Array<any>>([]);
  const [companyID, setCompanyID] = useState("");
  const debounceCompanyID = useDebounce(companyID, 700);
  const [uniqueCompanyId, setUniqueCompanyId] = useState(false);

  const {
    handleSubmit,
    control,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm<any>({
    defaultValues,
  });

  useEffect(() => {
    if (companyDetailsState?.companyMetricsDetails) {
      setFormValue(companyDetailsState.companyMetricsDetails);
    }
  }, [companyDetailsState?.companyMetricsDetails]);

  useEffect(() => {
    if (props?.customListsData?.length > 0) {
      setCompanyTradesData(props?.customListsData);
    }
  }, [props?.customListsData]);

  useEffect(() => {
    if (companyID) {
      uniqueCompanyIDValidation(companyID);
    } else {
      setCompanyID("");
      setUniqueCompanyId(false);
      companyDetailsDispatch(setCompanyIDValidation(false));
    }
  }, [debounceCompanyID]);

  const setFormValue = (value: any) => {
    setValue("CompanyId", value?.CompanyId || "", { shouldValidate: true });
    setValue("CompanyPhone", value?.CompanyPhone || "", {
      shouldValidate: true,
    });
    setValue("CompanyEmail", value?.CompanyEmail || "", {
      shouldValidate: true,
    });
    setValue("CompanyWebsite", value?.CompanyWebsite || "", {
      shouldValidate: true,
    });
    setValue(
      "CompanyAddress",
      value?.CompanyAddress ? value?.CompanyAddress : "",
      { shouldValidate: true }
    );
    setValue(
      "CompanyTrades",
      value?.CompanyTrades ? value?.CompanyTrades : [],
      { shouldValidate: true }
    );
    setValue("CompanyService", value?.CompanyService || "", {
      shouldValidate: true,
    });
    setValue("CompanyServiceLocation", value?.CompanyServiceLocation || "", {
      shouldValidate: true,
    });
  };

  const getCompanyDetails = () => {
    companyDetailsDispatch(setCompanyDetailsDirty(true));
    companyDetailsDispatch(setCompanyMetricsDetails(getValues()));
  };

  const getRenderValue = (argValue: Array<number>): any => {
    const returnValue: Array<string> = [];
    const selectedValues = companyTradesData.filter(
      (item: any) => argValue.indexOf(item.nodeName) > -1
    );

    selectedValues.forEach((item: any) => {
      returnValue.push(`${item?.nodeName}`);
    });
    if (argValue.length === 0 || !selectedValues) {
      return <div className={"companyDetails__metrics__input-field__text"}>Select Trade</div>
    }
    return returnValue.join(",");
  };

  const handleEmailValidation = (e: any) => {
    setTimeout(() => {
      if (e.target.value && errors.CompanyEmail?.type === "pattern") {
        companyDetailsDispatch(setCompanyValidation(true));
      } else {
        companyDetailsDispatch(setCompanyValidation(false));
      }
    }, 100);
  };

  const handleCompanyId = (e: any) => {
    setCompanyID(e.target.value.trim());
  };

  const uniqueCompanyIDValidation = async (name: string) => {
    try {
      const url = `V1/company/list`;

      const data = {
        id: Number(pathMatch?.params?.companyId),
        companyId: name,
      };

      const response = await postApiWithEchange(url, data);
      if (response?.success == true) {
        companyDetailsDispatch(setCompanyIDValidation(true));
        setUniqueCompanyId(true);
      } else {
        companyDetailsDispatch(setCompanyIDValidation(false));
        setUniqueCompanyId(false);
      }

      // const role= tenantCompanyRole.viewTenantCompanies;
      // const companiessResponse= await client.query({
      //     query: FETCH_COMPANY_BY_COMPANY_ID,
      //     variables:{
      //         searchText: name,
      //         userId: decodeExchangeToken().userId,
      //     },
      //     fetchPolicy: 'network-only',
      //     context:{role}
      // });
      // const companies: Array<any>=[];
      // if(companiessResponse.data.tenantCompanyAssociation.length>0){
      //     companies.push(...companiessResponse.data.tenantCompanyAssociation);
      // }

      // if(companies.length > 0 && companies[0].id !==  Number(pathMatch?.params?.companyId)){
      //     companyDetailsDispatch(setCompanyIDValidation(true))
      //     setUniqueCompanyId(true)
      // }else{
      //     companyDetailsDispatch(setCompanyIDValidation(false))
      //     setUniqueCompanyId(false)
      // }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="companyDetails">
      <div className="companyDetails__description">
        Make further adjustments to this company by adding more information
        below.
      </div>
      <div className="companyDetails__metrics">
        <div className="companyDetails__metrics__container">
          <div className="companyDetails__metrics__label">
            <InputLabel required={false}>Company ID</InputLabel>
          </div>
          <div className="companyDetails__metrics__input-field">
            <Controller
              render={({ field }: { field: any }) => (
                <TextField
                  type="text"
                  {...field}
                  fullWidth
                  autoComplete="off"
                  placeholder="Enter company id"
                  disabled={
                    !updateTenantCompany ||
                    !companyDetailsState?.companyInfo?.active
                  }
                  onChange={(e) => {
                    field.onChange(e);
                    getCompanyDetails();
                    handleCompanyId(e);
                  }}
                />
              )}
              name="CompanyId"
              control={control}
              rules={{
                required: false,
              }}
            />
            <div className="companyDetails__metrics__error-wrap">
              <p className="companyDetails__metrics__error-wrap__message">
                {uniqueCompanyId && (
                  <span>Company ID already exists in the tenant</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="companyDetails__metrics">
        <div className="companyDetails__metrics__container">
          <div className="companyDetails__metrics__label">
            <InputLabel required={false}>Phone</InputLabel>
          </div>
          <div className="companyDetails__metrics__input-field">
            <Controller
              render={({ field }: { field: any }) => (
                <TextField
                  type="text"
                  {...field}
                  fullWidth
                  autoComplete="off"
                  disabled={
                    !updateTenantCompany ||
                    !companyDetailsState?.companyInfo?.active
                  }
                  placeholder="Enter company phone no"
                  onChange={(e) => {
                    field.onChange(e);
                    getCompanyDetails();
                  }}
                />
              )}
              name="CompanyPhone"
              control={control}
              rules={{
                required: false,
              }}
            />
          </div>
        </div>
      </div>

      <div className="companyDetails__metrics">
        <div className="companyDetails__metrics__container">
          <div className="companyDetails__metrics__label">
            <InputLabel required={false}>Email</InputLabel>
          </div>
          <div className="companyDetails__metrics__input-field">
            <Controller
              render={({ field }: { field: any }) => (
                <TextField
                  type="email"
                  {...field}
                  fullWidth
                  autoComplete="off"
                  disabled={
                    !updateTenantCompany ||
                    !companyDetailsState?.companyInfo?.active
                  }
                  placeholder="Enter company email"
                  onChange={(e) => {
                    field.onChange(e);
                    getCompanyDetails();
                    handleEmailValidation(e);
                  }}
                />
              )}
              name="CompanyEmail"
              control={control}
              rules={{
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "invalid email address",
                },
              }}
            />
            <div className="companyDetails__metrics__error-wrap">
              <p className="companyDetails__metrics__error-wrap__message">
                {errors.CompanyEmail?.type === "pattern" && (
                  <span>Invalid email address</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="companyDetails__metrics">
        <div className="companyDetails__metrics__container">
          <div className="companyDetails__metrics__label">
            <InputLabel required={false}>Website URL</InputLabel>
          </div>
          <div className="companyDetails__metrics__input-field">
            <Controller
              render={({ field }: { field: any }) => (
                <TextField
                  type="text"
                  {...field}
                  fullWidth
                  autoComplete="off"
                  disabled={
                    !updateTenantCompany ||
                    !companyDetailsState?.companyInfo?.active
                  }
                  placeholder="Enter company website"
                  onChange={(e) => {
                    field.onChange(e);
                    getCompanyDetails();
                  }}
                />
              )}
              name="CompanyWebsite"
              control={control}
              rules={{
                required: false,
              }}
            />
          </div>
        </div>
      </div>

      <div className="companyDetails__metrics">
        <div className="companyDetails__metrics__container">
          <div className="companyDetails__metrics__label">
            <InputLabel required={false}>Trades</InputLabel>
          </div>
          {updateTenantCompany ? (
            <div className="companyDetails__metrics__input-field">
              <Controller
                render={({ field }: { field: any }) => (
                  <Select
                    id="company-trades"
                    {...field}
                    fullWidth
                    autoComplete="off"
                    variant="outlined"
                    multiple
                    value={field?.value}
                    placeholder="select a value"
                    displayEmpty
                    disabled={
                      !updateTenantCompany ||
                      !companyDetailsState?.companyInfo?.active
                    }
                    onChange={(e) => {
                      field.onChange(e.target.value as string[]);
                      getCompanyDetails();
                    }}
                    input={<Input />}
                    renderValue={(selected: Array<number>) =>
                      getRenderValue(selected)
                    }
                    MenuProps={{
                      classes: { paper: classes.root },
                      anchorOrigin: {
                        vertical: "bottom",
                        horizontal: "left",
                      },
                      transformOrigin: {
                        vertical: "top",
                        horizontal: "left",
                      },
                      getContentAnchorEl: null,
                    }}
                  >
                    {companyTradesData?.map((type: any) => (
                      <MenuItem key={type.id} value={type.nodeName}>
                        <Checkbox
                          checked={field?.value?.indexOf(type.nodeName) > -1}
                          color="primary"
                        />
                        <ListItemText
                          className="mat-menu-item-sm"
                          primary={`${type?.nodeName}`}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                )}
                name="CompanyTrades"
                control={control}
                rules={{
                  required: false,
                }}
              />
            </div>
          ) : (
            <div className="companyDetails__metrics__input-field">
              <div className="companyDetails__metrics__input-field__view">
                {companyDetailsState?.companyMetricsDetails?.CompanyTrades
                  ?.length > 0
                  ? companyDetailsState?.companyMetricsDetails?.CompanyTrades.join(
                      ","
                    )
                  : "Select company trade"}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="companyDetails__metrics">
        <div className="companyDetails__metrics__container">
          <div className="companyDetails__metrics__label">
            <InputLabel required={false}>Services</InputLabel>
          </div>
          <div className="companyDetails__metrics__input-field">
            <Controller
              render={({ field }: { field: any }) => (
                <TextField
                  type="text"
                  {...field}
                  fullWidth
                  autoComplete="off"
                  placeholder="Enter service"
                  disabled={
                    !updateTenantCompany ||
                    !companyDetailsState?.companyInfo?.active
                  }
                  onChange={(e) => {
                    field.onChange(e);
                    getCompanyDetails();
                  }}
                />
              )}
              name="CompanyService"
              control={control}
              rules={{
                required: false,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
