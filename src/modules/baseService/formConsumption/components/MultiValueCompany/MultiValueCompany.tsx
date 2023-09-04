import Checkbox from "@material-ui/core/Checkbox";
import ListItemText from "@material-ui/core/ListItemText";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import React, { ReactElement, useContext } from "react";
import { InputType } from "../../../../../utils/constants";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import TextField from "@material-ui/core/TextField";
import { FormControl } from "@material-ui/core";

// import Checkbox from '@material-ui/core/Checkbox';
import { CustomPopOver } from "../../../../shared/utils/CustomPopOver";
import { formStateContext } from "../../Context/projectContext";
import { Controller } from "react-hook-form";
export interface Params {
  id: string;
  featureId: string;
  formId: string;
}

export interface IMultiValueCompany {
  isEditAllowed: boolean;
  control: any;
  formData: any;
}

function MultiValueCompany({
  isEditAllowed,
  control,
  formData,
}: IMultiValueCompany): ReactElement {
  const popOverclasses = CustomPopOver();
  const { companiesList, initialValue, setIsDirty }: any =
    useContext(formStateContext);

  const initValue = initialValue?.find(
    (value: any) => formData.elementId == value.elementId
  );
  const getRenderValue = (value: Array<number>): string => {
    const returnValue: any = [];
    const selectedValues = companiesList.filter(
      (item: any) => value.indexOf(item.id) > -1
    );

    selectedValues.forEach((item: any) => {
      returnValue.push(`${item.name}`);
    });
    return returnValue.join(",");
  };

  return (
    <>
      {formData.fieldTypeId === InputType.MULTIVALUECOMPANY ? (
        // multiValue company
        <FormControl fullWidth>
          <Controller
            render={({ field }: { field: any }) => (
              <Select
                id={`multivalue-Company-${formData.sequence}`}
                {...field}
                fullWidth
                autoComplete="off"
                variant="outlined"
                multiple
                value={field?.value}
                disabled={isEditAllowed}
                displayEmpty
                onChange={(e) => {
                  control.onChange(e.target.value as string[]),
                    setIsDirty(true);
                }}
                input={<OutlinedInput placeholder="Select company" />}
                renderValue={(selected: Array<number>) =>
                  getRenderValue(selected)
                }
                MenuProps={{
                  classes: { paper: popOverclasses.root },
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
                {companiesList.map((company: any) => (
                  <MenuItem
                    className="mat-menu-item-sm"
                    key={company.id}
                    value={company.id}
                  >
                    <Checkbox
                      checked={field?.value?.indexOf(company.id) > -1}
                      color="default"
                    />
                    <ListItemText
                      className="mat-menu-item-sm"
                      primary={`${company.name}`}
                    />
                  </MenuItem>
                ))}
              </Select>
            )}
            name={`${formData.elementId}-fieldTypeId${formData.fieldTypeId}`}
            control={control}
            rules={{
              required: formData.required ? true : false,
            }}
          />
        </FormControl>
      ) : (
        // single value company select box
        <FormControl fullWidth>
          <Controller
            render={({ field }: { field: any }) => {
              const activeCompaniesList = companiesList.filter(
                (company: any) =>
                  company.active || company.id == initValue?.value
              );

              return (
                <Select
                  id={`singlevalue-Company-${formData.sequence}`}
                  {...field}
                  fullWidth
                  autoComplete="off"
                  variant="outlined"
                  displayEmpty
                  placeholder="Multi select"
                  disabled={isEditAllowed}
                  onChange={(e) => {
                    field.onChange(e), setIsDirty(true);
                  }}
                  renderInput={(params: any) => (
                    <TextField placeholder={"User select"} variant="outlined" />
                  )}
                  MenuProps={{
                    classes: { paper: popOverclasses.root },
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
                  <MenuItem value="" className="mat-menu-item-sm">
                    None
                  </MenuItem>
                  {activeCompaniesList.map((company: any) => (
                    <MenuItem
                      key={company.id}
                      value={company.id}
                      className="mat-menu-item-sm"
                      disabled={!company.active}
                    >
                      {company.name}
                    </MenuItem>
                  ))}
                </Select>
              );
            }}
            name={`${formData.elementId}-fieldTypeId${formData.fieldTypeId}`}
            control={control}
            rules={{
              required: formData.required ? true : false,
            }}
          />
        </FormControl>
      )}
    </>
  );
}

export default React.memo(MultiValueCompany);
