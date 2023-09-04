import { ChangeEvent, useEffect } from "react";
import {
  createStyles,
  makeStyles,
  Theme,
  createMuiTheme,
  ThemeProvider,
} from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableRow from "@material-ui/core/TableRow";
import { useForm, useFieldArray } from "react-hook-form";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/DeleteOutline";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import {
  InputTableCell,
  SelectTableCell,
  NestedTableCell,
} from "./components/TableCell";
import { Box, Button } from "@material-ui/core";
import { getUserDetails } from "./requests";
import {
  generateNEmptyRows,
  generateNOrderedEmptyArrayObject,
  generateNValuedArray,
  validationSchema,
} from "./utils";
import EnhancedTableHead from "./components/TableHead";

const INITIAL_ROW_COUNT = 1;
const MAX_ROW_COUNT = 10;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
    },

    table: {
      minWidth: 750,
    },
    visuallyHidden: {
      border: 0,
      clip: "rect(0 0 0 0)",
      height: 1,
      margin: -1,
      overflow: "hidden",
      padding: 0,
      position: "absolute",
      top: 20,
      width: 1,
    },
    tableHeading: {
      fontWeight: "bold",
    },
    customButton: {
      textTransform: "none",
    },
  })
);

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#000000",
    },
  },
  typography: {
    fontSize: 18,
    fontFamily: "Poppins,sans-serif",
  },
});

export default function InviteUserTable({
  roles,
  projects,
  companies,
  projectId,
  companyId,
  handleUserInvitation,
  handleFieldChange
}: any) {
  const classes = useStyles();
  const [readOnly, setReadOnly] = useState<any>({});
  const [adornment, setAdornment] = useState<any>({});
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [disableInvite, setDisableInvite] = useState(false);
  const [email, setEmail] = useState<any>({ value: "", index: 0 });
  const [fieldArr, setFieldArr] = useState<any>(() =>
    generateNOrderedEmptyArrayObject(MAX_ROW_COUNT * 10)
  );
  const [fieldsIndexArr, setFieldsIndexArr] = useState<any>(() =>
    generateNValuedArray(INITIAL_ROW_COUNT)
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    getValues,
    setValue,
    setError,
    clearErrors,
    trigger,
    reset,
    watch,
  } = useForm<any>({
    mode: "onChange",
    resolver: yupResolver(validationSchema),
    defaultValues: {
      inviteUsers: generateNEmptyRows(INITIAL_ROW_COUNT, companyId, projectId),
    },
  });

 const watchFields:any =  watch();

 useEffect(()=>{
   const formValue = getValues()
   if(formValue?.inviteUsers?.length){
    const formValArr = [...formValue.inviteUsers]
    let hasEmptyValue = true;
    for (const item in formValArr[0]){
      if(formValArr[0].hasOwnProperty (item)  ){
        if(formValArr[0][item] && !(formValArr[0][item] instanceof Array)  && formValArr[0][item] != ''){
          hasEmptyValue = false;
          break
        }
      }
    }
 
    handleFieldChange(hasEmptyValue)
  }
 },[watchFields])

  const { fields, append, remove } = useFieldArray({
    control,
    name: "inviteUsers",
  });

  const generateNewProjectObject = (fromProjects: any = []) => {
    let newProjects = [];
    if (roles?.projectRoles?.length) {
      if (fromProjects.length) {
        newProjects = fromProjects.map((p: any) => {
          return {
            projectId: p.projectId,
            projectName: p.name,
            roleId: roles.projectRoles[0].id,
            roleName: roles.projectRoles[0].role,
          };
        });
      } else {
        newProjects = projects.map((p: any) => {
          return {
            projectId: p.projectId,
            projectName: p.name,
            roleId: roles.projectRoles[0].id,
            roleName: roles.projectRoles[0].role,
          };
        });
      }
    }
    return newProjects;
  };

  useEffect(() => {
    if (projectId) {
      const foundSelectedProject = projects.find(
        (p: any) => p.projectId === projectId
      );
      setSelectedProject(foundSelectedProject);
    }
  }, [projects, projectId]);

  useEffect(() => {
    setFieldArr((prev: any) => {
      const newFieldArrObj: any = {};
      for (const field in fields) {
        if (!prev[fieldsIndexArr[field]]?.length) {
          if (selectedProject) {
            const newProjectObject = generateNewProjectObject([
              selectedProject,
            ]);
            newFieldArrObj[fieldsIndexArr[field]] = newProjectObject;
            setValue(`inviteUsers.${field}.projects`, newProjectObject);
          } else
            newFieldArrObj[fieldsIndexArr[field]] = generateNewProjectObject();
        }
      }
      return {
        ...prev,
        ...newFieldArrObj,
      };
    });
  }, [projects, roles, fields, selectedProject, fieldsIndexArr]);

  const handleRemoveRow = (index: any) => {
    const fieldIndexArr = [...fieldsIndexArr];
    fieldIndexArr.splice(index, 1);
    setFieldsIndexArr(fieldIndexArr);
    removeAdornments(index);
    removeReadOnlyFields(index, false, true);
    remove(index);
  };

  useEffect(() => {
    let hasErrors = false;
    for (const fieldIndex in fields) {
      if (errors.inviteUsers?.[fieldIndex]?.email?.type === "manual") {
        hasErrors = true;
      }
      if (companyId)
        setValue(`inviteUsers.${fieldIndex}.companies`, [companyId]);
      else {
        if (!getValues(`inviteUsers.${fieldIndex}.companies`)) {
          setValue(`inviteUsers.${fieldIndex}.companies`, []);
        }
      }
    }
    setDisableInvite(hasErrors);
  }, [fields]);

  useEffect(() => {
    (async () => {
      const details = {
        firstName: "",
        lastName: "",
        jobTitle: "",
      };
      const index = email.index;
      try {
        const [hasTenantAssc, userDetails]: any = await getUserDetails(
          email.value
        );
        const { firstName, lastName, jobTitle }: any = userDetails;
        if (userDetails.email) {
          setAdornment((prev: any) => {
            return {
              ...prev,
              [fieldsIndexArr[index]]: {
                has: true,
                activate: true,
                message:
                  "This user already has an account with Slate. Their name and title cannot be edited",
              },
            };
          });
          details.firstName = firstName;
          details.lastName = lastName;
          details.jobTitle = jobTitle || "-";
          initFields(index, details);
          setReadOnly((prev: any) => {
            return {
              ...prev,
              [fieldsIndexArr[index]]: ["firstName", "lastName", "jobTitle"],
            };
          });
        } else {
          removeReadOnlyFields(index);
          removeAdornments(index);
          // clearErrors(`inviteUsers.${index}.email`);
        }
        if (hasTenantAssc) {
          setError(`inviteUsers.${index}.email`, {
            type: "manual",
            message: "This user already has an account with your company",
          });
          setDisableInvite(true);
          setReadOnly((prev: any) => {
            return {
              ...prev,
              [fieldsIndexArr[index]]: [
                "firstName",
                "lastName",
                "jobTitle",
                "systemRole",
                "companies",
                "projects",
              ],
            };
          });
        }
      } catch {
        setDisableInvite(false);
        removeAdornments(index);
        removeReadOnlyFields(index);
        //clearErrors(`inviteUsers.${index}.email`);
      }
      if (details.firstName || details.lastName)
        trigger([
          `inviteUsers.${index}.firstName`,
          `inviteUsers.${index}.lastName`,
        ]);
    })();
  }, [email]);

  const handleEmailBlur = (index: any) => {
    const email = getValues(`inviteUsers.${index}.email`);
    const triggerArray = [];
    const currentErrors = errors.inviteUsers;
    for (let i = 0; i < fields.length; i++) {
      // ignore all manually set errors
      if (currentErrors?.[i]?.email?.type === "manual") {
        setDisableInvite(true);
        continue;
      }
      if (index !== i) {
        triggerArray.push(`inviteUsers.${i}.email`);
      }
    }
    // this is done to invalidate errors if duplicate emails are handled on other fields on which error is not shown
    trigger(triggerArray);
    setEmail({ value: email, index });
  };

  const onSubmit = async (values: any) => {
    try {
      await handleUserInvitation(values);
      reset();
      setAdornment({});
    } catch (e) {
      console.error("Something went wrong while submitting invitee list", e);
    }
  };

  const removeReadOnlyFields = (
    index: any,
    forceClear = false,
    whileDeleting = false
  ) => {
    setReadOnly((prev: any) => {
      return {
        ...prev,
        [fieldsIndexArr[index]]: [],
      };
    });

    if (whileDeleting) return;

    let firstName = getValues(`inviteUsers.${index}.firstName`);
    let lastName = getValues(`inviteUsers.${index}.lastName`);
    let jobTitle = getValues(`inviteUsers.${index}.jobTitle`);
    let systemRole = getValues(`inviteUsers.${index}.systemRole`);
    let companies = getValues(`inviteUsers.${index}.companies`);
    let projects = getValues(`inviteUsers.${index}.projects`);

    if (forceClear) {
      firstName = "";
      lastName = "";
      jobTitle = "";
      systemRole = "";
      companies = [];
      projects = [];
    }
    setValue(`inviteUsers.${index}.firstName`, firstName ?? "");
    setValue(`inviteUsers.${index}.lastName`, lastName ?? "");
    setValue(`inviteUsers.${index}.jobTitle`, jobTitle ?? "");
    setValue(`inviteUsers.${index}.systemRole`, systemRole ?? "");
    if (!companyId) setValue(`inviteUsers.${index}.companies`, companies ?? []);
    if (!projectId) setValue(`inviteUsers.${index}.projects`, projects ?? []);
  };

  const removeAdornments = (index: any) => {
    setAdornment((prev: any) => {
      return {
        ...prev,
        [fieldsIndexArr[index]]: {
          has: false,
          activate: false,
          message: "",
        },
      };
    });
  };

  const initFields = (index: any, details: any) => {
    setValue(`inviteUsers.${index}.firstName`, details.firstName ?? "");
    setValue(`inviteUsers.${index}.lastName`, details.lastName ?? "");
    setValue(`inviteUsers.${index}.jobTitle`, details.jobTitle ?? "");
    setValue(`inviteUsers.${index}.systemRole`, "");
    if (!companyId) setValue(`inviteUsers.${index}.companies`, []);
    if (!projectId) setValue(`inviteUsers.${index}.projects`, []);
    /* errors only for companies is manually cleared for this case:
     user selects a company and deslects it. Now the error for company is shown.
     The user now enters an email id which is already registered. Now although the company field gets disabled, the error is still shown.
     Hence we clear it manually */
    clearErrors(`inviteUsers.${index}.companies`);
  };

  const handleEmailChange = async (
    index: number,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    if (disableInvite) setDisableInvite(false);
    if (adornment[fieldsIndexArr[index]]?.has) removeAdornments(index);
    if (readOnly[fieldsIndexArr[index]]?.length) {
      // there was some data fetched from api, we will need to clear that, hence force clear is set to true
      removeReadOnlyFields(index, true);
    }
    if (event.target.value === "") {
      clearErrors(`inviteUsers.${index}.email`);
    }
  };

  const handleApplyToAllCompanies = (index: any) => {
    const value = getValues(`inviteUsers.${index}.companies`);
    const triggerArray = [];
    for (const field in fields) {
      //ignore if the field is locked as read only
      if (!readOnly?.[fieldsIndexArr[field]]?.includes("companies")) {
        setValue(`inviteUsers.${field}.companies`, value);
        triggerArray.push(`inviteUsers.${field}.companies`);
      }
    }
    trigger(triggerArray);
  };

  const handleApplyToAllProjects = (index: any) => {
    let copyFromProjects = getValues(`inviteUsers.${index}.projects`);
    if (!copyFromProjects) copyFromProjects = [];
    const obj: any = {};
    for (const fieldIndex in fields) {
      //do not use triple inequality check here
      if (fieldIndex != index) {
        const currentOptions = fieldArr[fieldsIndexArr[fieldIndex]];
        currentOptions.forEach((project: any) => {
          copyFromProjects.forEach((copyFrom: any) => {
            if (project.projectId === copyFrom.projectId) {
              project.projectId = copyFrom.projectId;
              project.projectName = copyFrom.projectName;
              project.roleName = copyFrom.roleName;
              project.roleId = copyFrom.roleId;
            }
          });
        });
        const selectedOptions = currentOptions.filter((projectOption: any) => {
          return !!copyFromProjects.find(
            (project: any) => project.projectId === projectOption.projectId
          );
        });

        //ignore if the field is locked as read only
        if (!readOnly?.[fieldsIndexArr[fieldIndex]]?.includes("projects")) {
          obj[fieldsIndexArr[fieldIndex]] = currentOptions;
          setValue(`inviteUsers.${fieldIndex}.projects`, selectedOptions);
        }
      }
      setFieldArr((prev: any) => {
        return {
          ...prev,
          ...obj,
        };
      });
    }
     trigger(`inviteUsers.${index}.projects`);
  };

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.root}>
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size="medium"
            aria-label="enhanced table"
          >
            <EnhancedTableHead classes={classes} />
            <TableBody>
              {fields.map((item: any, index) => {
                const readOnlyItems = {
                  firstName:
                    readOnly?.[fieldsIndexArr[index]]?.includes("firstName"),
                  lastName:
                    readOnly?.[fieldsIndexArr[index]]?.includes("lastName"),
                  jobTitle:
                    readOnly?.[fieldsIndexArr[index]]?.includes("jobTitle"),
                  systemRole:
                    readOnly?.[fieldsIndexArr[index]]?.includes("systemRole"),
                  companies:
                    readOnly?.[fieldsIndexArr[index]]?.includes("companies"),
                  projects:
                    readOnly?.[fieldsIndexArr[index]]?.includes("projects"),
                };

                return (
                  <TableRow key={item.id}>
                    <InputTableCell
                      name={`inviteUsers.${index}.email`}
                      control={control}
                      handleBlur={() => {
                        handleEmailBlur(index);
                      }}
                      handleChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleEmailChange(index, e)
                      }
                      error={errors.inviteUsers?.[index]?.email?.message}
                      adornment={adornment?.[fieldsIndexArr[index]]}
                    />
                    <InputTableCell
                      name={`inviteUsers.${index}.firstName`}
                      control={control}
                      readOnly={readOnlyItems.firstName}
                      error={errors.inviteUsers?.[index]?.firstName?.message}
                    />
                    <InputTableCell
                      name={`inviteUsers.${index}.lastName`}
                      control={control}
                      readOnly={readOnlyItems.lastName}
                      error={errors.inviteUsers?.[index]?.lastName?.message}
                    />
                    <InputTableCell
                      name={`inviteUsers.${index}.jobTitle`}
                      control={control}
                      readOnly={readOnlyItems.jobTitle}
                    />
                    <SelectTableCell
                      options={roles.systemRoles}
                      control={control}
                      name={`inviteUsers.${index}.systemRole`}
                      label="Select Slate Role"
                      error={errors.inviteUsers?.[index]?.systemRole?.message}
                      noDataFoundMessage="No roles found"
                      readOnly={readOnlyItems.systemRole}
                    />
                    <SelectTableCell
                      control={control}
                      name={`inviteUsers.${index}.companies`}
                      options={companies}
                      label="Select Company"
                      multiple={true}
                      error={errors.inviteUsers?.[index]?.companies?.message}
                      readOnly={!!companyId || readOnlyItems.companies}
                      handleApplyToAll={handleApplyToAllCompanies}
                      index={index}
                      showApplyToAll={fields.length > 1}
                      noDataFoundMessage="No companies found"
                    />

                    <NestedTableCell
                      nestIndex={index}
                      control={control}
                      options={fieldArr[fieldsIndexArr[index]]}
                      nestedOptions={roles.projectRoles}
                      label="Select Project"
                      setValue={setValue}
                      getValues={getValues}
                      readOnly={!!projectId}
                      fullReadOnly={readOnlyItems.projects}
                      handleApplyToAll={handleApplyToAllProjects}
                      showApplyToAll={fields.length > 1}
                      noDataFoundMessage="No projects found"
                      error={errors.inviteUsers?.[index]?.projects?.message}
                    />
                    <TableCell>
                      <IconButton
                        onClick={() => {
                          if (fields.length > 1) handleRemoveRow(index);
                        }}
                        disabled={fields.length === 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <Box display="flex" justifyContent="space-between" mt="2rem">
          <Button
            disabled={
              !isValid || disableInvite || fields.length >= MAX_ROW_COUNT
            }
            classes={{ root: classes.customButton }}
            onClick={() => {
              const newFieldsIndex = [...fieldsIndexArr];
              let count = 0;
              for (const field of Object.values(fieldArr) as any) {
                if (field.length) {
                  count++;
                }
              }
              newFieldsIndex.push(count);
              setFieldsIndexArr(newFieldsIndex);
              append(generateNEmptyRows(1, companyId, projectId)[0]);
            }}
          >
            + Add additional email address
          </Button>
          <Button
            disabled={!isValid || disableInvite}
            classes={{ root: classes.customButton }}
            color="primary"
            variant="contained"
            onClick={() => {
              handleSubmit(onSubmit)();
            }}
          >
            Send Invite{fields.length > 1 && `s`}
          </Button>
        </Box>
      </div>
    </ThemeProvider>
  );
}
