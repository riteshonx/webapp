import { useState, useEffect } from "react";
import TableCell from "@material-ui/core/TableCell";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Checkbox from "@material-ui/core/Checkbox";
import CheckCircleFilled from "@material-ui/icons/CheckCircle";
import CheckBoxIcon from "@material-ui/icons/RadioButtonUnchecked";
import { Controller, useWatch } from "react-hook-form";
import ApplyToAll from "../ApplyToAll";
import Box from "@material-ui/core/Box";
import Tooltip from "@material-ui/core/Tooltip";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    customLabel: {
      color: "black",
      fontSize: "1.1rem",
    },
    formControl: {
      margin: theme.spacing(1),
      height: 60,
    },
    formControlNested: {
      height: 60,
      marginLeft: 10,
      flex: 1,
    },
    greyOut: {
      color: "#bcbcbc",
      cursor: "not-allowed",
      "&:focus": {
        backgroundColor: "transparent",
      },
    },
    projectNameOption: {
      minWidth: "80px",
      maxWidth: "120px",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
      overflow: "hidden",
    },
    nestedMenuTag: {
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    noLabel: {
      marginTop: theme.spacing(3),
    },
  })
);

const ITEM_HEIGHT = 38;
const ITEM_PADDING_TOP = 20;
const MenuProps = {
  getContentAnchorEl: null,
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 300,
    },
  },
};

export default ({
  nestIndex,
  control,
  label,
  readOnly,
  fullReadOnly,
  options,
  nestedOptions,
  setValue,
  getValues,
  noDataFoundMessage,
  handleApplyToAll,
  showApplyToAll,
  error
}: any) => {
  const classes = useStyles();

  const [displayOptions, setDisplayOptions] = useState<Array<any>>(options);
  useWatch({ name: `inviteUsers.${nestIndex}.projects`, control: control });

  useEffect(() => {
    if (!options?.length) {
      setDisplayOptions([
        { projectName: noDataFoundMessage, projectId: -1, disabled: true },
      ]);
    } else {
      setDisplayOptions(options);
    }
  }, [options]);

  const findProjectAndIndexOf = (index: any, projectId: any) => {
    const currentProjects = getValues(`inviteUsers.${index}.projects`);
    const valueIndex = currentProjects?.findIndex(
      (p: any) => p.projectId === projectId
    );
    const current = getValues(`inviteUsers.${index}.projects[${valueIndex}]`);
    return [current, valueIndex, currentProjects];
  };

  return (
    <TableCell>
      <Box display={"flex"} alignItems="center">
        <Controller
          name={`inviteUsers.${nestIndex}.projects`}
          control={control}
          render={({ field }) => {
            return (
              <FormControl fullWidth className={classes.formControl}>
                <InputLabel
                  classes={{
                    root: fullReadOnly ? classes.greyOut : classes.customLabel,
                  }}
                  shrink={false}
                >
                  {!field.value?.length && label}
                </InputLabel>
        {error && <span style={{color:"red"}}>{error}</span>}
                <Select
                  {...field}
                  readOnly={fullReadOnly}
                  classes={{ root: fullReadOnly && classes.greyOut }}
                  disableUnderline={fullReadOnly}
                  onChange={(e) => {
                    if (!readOnly) {
                      field.onChange(e);
                    }
                  }}
                  value={field.value || []}
                  multiple
                  input={<Input />}
                  renderValue={(selected: any) => {
                    return (
                      <Tooltip
                        title={selected
                          .map(
                            (item: any) =>
                              `${item.projectName} (${item.roleName})`
                          )
                          .join(", ")}
                      >
                        <Box
                          maxWidth="180px"
                          whiteSpace="noWrap"
                          overflow="hidden"
                          textOverflow="ellipsis"
                        >
                          {selected.length > 0 &&
                            `${selected[0]?.projectName ?? "Please wait"} (${
                              selected[0]?.roleName ?? "..."
                            })`}
                          {selected.length > 1 && (
                            <p style={{ fontSize: "1rem" }}>
                              (+ {selected.length - 1} more)
                            </p>
                          )}
                        </Box>
                      </Tooltip>
                    );
                  }}
                  MenuProps={MenuProps}
                >
                  {/* <OutlinedInput
                  onKeyDown={(e) => e.stopPropagation()}
                  value={"sudi"}
                  onChange={(e) => setSearchText(e.target.value)}
                  endAdornment={
                    <InputAdornment position="end">KK</InputAdornment>
                  }
                  labelWidth={0}
                /> */}

                  {displayOptions?.map((optionValue: any, index: any) => {
                    return (
                      <MenuItem
                        style={{ height: "38px" }}
                        key={`${optionValue.projectId} - ${nestIndex}`}
                        value={optionValue}
                        disabled={optionValue.disabled}
                      >
                        {displayOptions.length &&
                          displayOptions[0].projectId !== -1 && (
                            <Checkbox
                              icon={<CheckBoxIcon />}
                              checkedIcon={<CheckCircleFilled />}
                              color="primary"
                              checked={
                                field?.value?.find(
                                  (p: any) =>
                                    p.projectId === optionValue.projectId
                                ) !== undefined
                              }
                            />
                          )}
                        <p className={classes.projectNameOption}>
                          {optionValue.projectName}
                        </p>
                        {displayOptions.length &&
                          displayOptions[0].projectId !== -1 && (
                            <FormControl
                              disabled={
                                field.value?.find(
                                  (p: any) =>
                                    p.projectId === optionValue.projectId
                                ) === undefined
                              }
                              className={classes.formControlNested}
                            >
                              <InputLabel
                                classes={{ root: classes.customLabel }}
                                shrink={false}
                              ></InputLabel>
                              <Select
                                name={`inviteUser.${nestIndex}.nested.${index}`}
                                onChange={(e) => {
                                  const [current, valueIndex, currentProjects] =
                                    findProjectAndIndexOf(
                                      nestIndex,
                                      optionValue.projectId
                                    );
                                  if (current) {
                                    current.roleId = e.target.value;
                                    const nestedRole = nestedOptions.find(
                                      (n: any) => n.id === e.target.value
                                    );
                                    if (nestedRole)
                                      current.roleName = nestedRole.role;
                                    setValue(
                                      `inviteUsers.${nestIndex}.projects[${valueIndex}]`,
                                      current
                                    );
                                  }
                                  e.stopPropagation();
                                }}
                                value={(() => {
                                  const [current] = findProjectAndIndexOf(
                                    nestIndex,
                                    optionValue.projectId
                                  );
                                  if (current && current.roleId !== -1)
                                    return current.roleId;
                                  else return "r";
                                })()}
                                input={<Input />}
                                renderValue={(selected: any) => {
                                  return (
                                    <div className={classes.nestedMenuTag}>
                                      {nestedOptions.find(
                                        (option: any) => option.id === selected
                                      )?.role || "Select Role"}
                                    </div>
                                  );
                                }}
                                MenuProps={MenuProps}
                              >
                                {nestedOptions.map((nestedValue: any) => {
                                  return (
                                    <MenuItem
                                      style={{ height: "38px" }}
                                      key={`${nestedValue.id}-nested-${nestIndex}`}
                                      value={nestedValue.id}
                                    >
                                      <p>{nestedValue.role}</p>
                                    </MenuItem>
                                  );
                                })}
                              </Select>
                            </FormControl>
                          )}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            );
          }}
        />
        {!fullReadOnly && showApplyToAll && (
          <ApplyToAll onClickApplyAll={() => handleApplyToAll(nestIndex)} />
        )}
      </Box>
    </TableCell>
  );
};
