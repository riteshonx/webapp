import React, { ReactElement, useState, useEffect, useContext } from "react";
import { TextField, Select, MenuItem, Button, Paper } from "@material-ui/core";
import {
  TeammateAddEditCompaniesDropArea,
  TeammateAddEditProjects,
} from "../../components/addTeammateMiddle";
import {
  decodeExchangeToken,
  getExchangeToken,
} from "../../../../../services/authservice";
import { client } from "../../../../../services/graphql";
import { DragDropContext } from "react-beautiful-dnd";
import axios from "axios";
import TeammateAddEditRight from "../../components/addTeammateRight";
import {
  GET_USER_BY_EMAIL_ID,
  GET_PROJECT_ROLES,
  GET_SYSTEM_ROLE,
  ASSOCIATE_USER_WITH_PROJECT,
  GET_USER_TENANT_COMPANIES,
} from "../../queries";
import {
  myCompanyUserRole,
  tenantUserRole,
  tenantRoles,
  tenantProjectRole,
  myProjectRole,
  tenantCompanyRole,
  myCompanyRoles,
} from "../../../../../utils/role";
import { LOAD_USER_PROJECTS_BY_QUERY } from "../../../../../graphhql/queries/projects";
import { postApiWithEchange } from "../../../../../services/api";
import SimpleDialog from "../../components/successDialog";
import { useHistory, useLocation } from "react-router-dom";
import { useDebounce } from "../../../../../customhooks/useDebounce";
import "./addNewTeammate.scss";
import { setIsLoading } from "../../../../root/context/authentication/action";
import { stateContext } from "../../../../root/context/authentication/authContext";
import { canInviteUsers } from "src/services/permission";

function useForceUpdate() {
  const [value, setValue] = useState(0); // integer state
  return () => setValue((value) => value + 1); // update the state to force render
}

export default function addNewTeammate(props: any): ReactElement {
  const { dispatch, state }: any = useContext(stateContext);
  const forceUpdate = useForceUpdate();
  const [emails, setEmails] = useState<Array<any>>([
    {
      email: "",
      exists: false,
      duplicateError: false,
      valid: true,
    },
  ]);
  const [searchText, setSearchText] = useState("");
  const [projectRole, setProjectRole]: any = useState<Array<any>>([]);
  const [tenantRole, setTenantRole]: any = useState<Array<any>>([]);
  const [tenantCompanies, setTenantCompanies] = useState<Array<any>>([]);
  const [projects, setProjects] = useState<Array<any>>([]);
  const [selectedRole, setSelectedRole]: any = useState(null);
  const [selectedCompanies, setSelectedCompanies] = useState<Array<any>>([]);
  const [selectedProjects, setSelectedProjects] = useState<Array<any>>([]);
  const [selectedProjectRole, setSelectedProjectRole] = useState<Array<any>>(
    []
  );
  const [emailError, setEmailError] = useState(false);
  const [companyError, setCompanyError] = useState(false);
  const [roleError, setRoleError] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [typeOfView, setTypeOfView] = useState("companies");
  const history = useHistory();
  const location = useLocation();
  // const
  const debounceName = useDebounce(searchText, 500);
  const [disableInvite, setDisableInvite] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [disableFirstName, setDisableFirstName] = useState(false);
  const [disableLastName, setDisableLastName] = useState(false);
  const [disableJobTitle, setDisableJobTitle] = useState(false);
  const [firstNameError, setFirstNameError] = useState(false);
  const [lastNameError, setLastNameError] = useState(false);
  const [jobTitleError, setJobTitleError] = useState(false);

  useEffect(() => {
    if (canInviteUsers()) {
      if (
        decodeExchangeToken().allowedRoles.includes(
          tenantProjectRole.createProjectAssociation
        )
      ) {
        fetchProjects();
      }
      getTenantCompanies();
    }
  }, [debounceName]);

  useEffect(() => {
    if (canInviteUsers()) {
      if (
        decodeExchangeToken().allowedRoles.includes(
          tenantProjectRole.createProjectAssociation
        )
      ) {
        getProjectRoles();
        fetchProjects();
      }
      getSystemRoles();
      getTenantCompanies();
    } else {
      history.push("/pagenotfound");
    }
  }, []);

  useEffect(() => {
    if (
      props.history?.location?.state?.projectId &&
      selectedProjects.length == 0
    ) {
      const selectedProjectsTemp = [...selectedProjects];
      for (let i = 0; i < projects.length; i++) {
        if (projects[i].id === props.history.location.state.projectId) {
          selectedProjectsTemp.push(projects[i]);
        }
      }
      setSelectedProjects(selectedProjectsTemp);
    }
  }, [projects.length && props.history?.location?.state?.projectId]);

  useEffect(() => {
    if (
      props.history?.location?.state?.companyId &&
      selectedCompanies.length == 0
    ) {
      const selectedCompaniesTemp = [...selectedCompanies];
      for (let i = 0; i < tenantCompanies.length; i++) {
        if (tenantCompanies[i].id === props.history.location.state.companyId) {
          selectedCompaniesTemp.push(tenantCompanies[i]);
        }
      }
      setSelectedCompanies(selectedCompaniesTemp);
    }
  }, [tenantCompanies.length && props.history?.location?.state?.companyId]);

  const getTenantCompanies = async () => {
    try {
      const role = decodeExchangeToken().allowedRoles.includes(
        myCompanyUserRole.viewMyCompanyUsers
      )
        ? myCompanyUserRole.viewMyCompanyUsers
        : decodeExchangeToken().allowedRoles.includes(
            tenantCompanyRole.viewTenantCompanies
          )
        ? tenantCompanyRole.viewTenantCompanies
        : tenantUserRole.viewTenantUsers;
      const projectsResponse = await client.query({
        query: GET_USER_TENANT_COMPANIES,
        variables: {
          searchText: `%${debounceName}%`,
          offset: 0,
          limit: 1000,
        },
        fetchPolicy: "network-only",
        context: { role },
      });
      const companies: Array<any> = [];
      if (projectsResponse.data.tenantCompanyAssociation.length > 0) {
        companies.push(...projectsResponse.data.tenantCompanyAssociation);
      }

      setTenantCompanies(companies);
    } catch (error) {
      console.log(error);
    }
  };

  const getSystemRoles = async () => {
    const role = decodeExchangeToken().allowedRoles.includes(
      tenantUserRole.viewTenantUsers
    )
      ? tenantUserRole.viewTenantUsers
      : myCompanyUserRole.viewMyCompanyUsers;
    try {
      const formsTemplateResponse = await client.query({
        query: GET_SYSTEM_ROLE,
        variables: {
          limit: 1000,
          offset: 0,
          searchText: `%${searchText}%`,
        },
        fetchPolicy: "network-only",
        context: {
          role,
        },
      });

      if (
        formsTemplateResponse.data.tenantRole &&
        formsTemplateResponse.data.tenantRole.length !== 0
      ) {
        setTenantRole(formsTemplateResponse.data.tenantRole);
      }
    } catch (err: any) {
      console.log(err);
    }
  };

  const fetchProjects = async () => {
    try {
      const role = decodeExchangeToken().allowedRoles.includes(
        tenantProjectRole.viewTenantProjects
      )
        ? tenantProjectRole.viewTenantProjects
        : myProjectRole.viewMyProjects;
      const projectsResponse = await client.query({
        query: LOAD_USER_PROJECTS_BY_QUERY,
        variables: {
          searchText: `%${debounceName}%`,
          offset: 0,
          limit: 1000,
          userId: decodeExchangeToken().userId,
        },
        fetchPolicy: "network-only",
        context: { role },
      });
      const projects: Array<any> = [];
      if (projectsResponse.data.project.length > 0) {
        projects.push(...projectsResponse.data.project);
      }
      setProjects(projects);

      // setProjectListData(projects);
    } catch (error) {
      console.log(error);
    }
  };

  const getProjectRoles = async () => {
    const role = decodeExchangeToken().allowedRoles.includes(
      tenantRoles.viewProjectRoles
    )
      ? tenantRoles.viewProjectRoles
      : decodeExchangeToken().allowedRoles.includes(
          tenantProjectRole.createProjectAssociation
        )
      ? tenantProjectRole.createProjectAssociation
      : myProjectRole.createMyProjectAssociation;

    try {
      const formsTemplateResponse = await client.query({
        query: GET_PROJECT_ROLES,
        variables: {
          limit: 1000,
          offset: 0,
          searchText: `%${searchText}%`,
        },
        fetchPolicy: "network-only",
        context: {
          role,
        },
      });

      if (
        formsTemplateResponse.data.projectRole &&
        formsTemplateResponse.data.projectRole.length !== 0
      ) {
        setProjectRole(formsTemplateResponse.data.projectRole);
      }
    } catch (err: any) {
      console.log(err);
    }
  };

  const handleEmailInput = (event: any) => {
    const text = event.target.value;

    const emailsTemp = emails;
    emailsTemp.splice(0, 1, {
      ...emailsTemp[0],
      email: text,
      duplicateError: false,
      exists: false,
    });

    setEmailError(false);
    setEmails(emailsTemp);

    if (emailsTemp[0].email.length === 0) {
      setDisableInvite(true);
    }
    setDisableFirstName(false);
    setDisableLastName(false);
    setDisableJobTitle(false);
    setFirstName("");
    setLastName("");
    setJobTitle("");
  };

  const handleGetUserByEmailId = async () => {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (emails[0].email.length == 0 || !emailRegex.exec(emails[0].email)) {
      setEmailError(true);
    } else {
      const role = decodeExchangeToken().allowedRoles.includes(
        myCompanyUserRole.viewMyCompanyUsers
      )
        ? myCompanyUserRole.viewMyCompanyUsers
        : tenantUserRole.viewTenantUsers;

      const promiseList: any = [];
      emails.map((item: any, index: number) => {
        promiseList.push(
          client.query({
            query: GET_USER_BY_EMAIL_ID,
            variables: {
              argEmail: item.email,
              tenantId: decodeExchangeToken().tenantId,
            },
            fetchPolicy: "network-only",
            context: {
              role,
            },
          })
        );
      });

      try {
        const response: any = await Promise.all(promiseList);
        const emailsTemp = [...emails];
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (response) {
          if (response[0].data?.tenantAssociation?.length > 0) {
            if (
              emailsTemp[0].email ===
              response[0].data?.tenantAssociation[0]?.user?.email
            ) {
              emailsTemp[0] = {
                ...emailsTemp[0],
                exists: true,
              };
              setEmails(emailsTemp);
            }
          } else {
            setDisableInvite(false);
            handleGetUser();
          }
        }
      } catch (err: any) {
        console.log(err);
      }
    }
  };

  const handleGetUser = async () => {
    try {
      const token = getExchangeToken();
      await axios
        .get(
          `${process.env["REACT_APP_AUTHENTICATION_URL"]}V1/user/details?email=${emails[0].email}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response: any) => {
          if (response?.data?.success) {
            if (Object.keys(response?.data?.success).length === 0) {
              setDisableFirstName(false);
              setDisableLastName(false);
              setDisableJobTitle(false);
              setFirstName("");
              setLastName("");
              setJobTitle("");
            }
            if (response.data.success?.firstName) {
              setFirstName(response.data.success?.firstName);
              setDisableFirstName(true);
              setFirstNameError(false);
            }
            if (response.data.success?.lastName) {
              setLastName(response.data.success?.lastName);
              setDisableLastName(true);
              setLastNameError(false);
            }
            if (response.data.success?.jobTitle) {
              setJobTitle(response.data.success?.jobTitle);
              setDisableJobTitle(true);
              setJobTitleError(false);
            }
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {}
  };

  const handleFirstName = (event: any) => {
    if (!event?.target?.value.trim()) {
      setFirstNameError(true);
    } else {
      setFirstNameError(false);
    }
    setFirstName(event?.target?.value);
    setFirstNameError(false);
  };

  const handleLastName = (event: any) => {
    if (!event?.target?.value.trim()) {
      setLastNameError(true);
    } else {
      setLastNameError(false);
    }
    setLastName(event?.target?.value);
    setLastNameError(false);
  };
  const handleJobTitle = (event: any) => {
    if (!event?.target?.value.trim()) {
      setJobTitleError(true);
    } else {
      setJobTitleError(false);
    }
    setJobTitle(event?.target?.value);
  };

  // const handleValidationDuplicate = (response: any) => {

  //   const emailsTemp = emails;
  //   for (let i = 0; i < emailsTemp.length; i++) {
  //     for (let j = 0; j < response.length; j++) {
  //       if (response[i].data?.tenantAssociation?.length > 0) {
  //         if (
  //           emailsTemp[i].email ===
  //             response[j].data?.tenantAssociation[0]?.user?.email &&
  //           emailsTemp[i].email.length !== 0
  //         ) {
  //           emailsTemp[i] = {
  //             ...emailsTemp[i],
  //             duplicateError: true,
  //           };
  //         }
  //       }
  //     }
  //   }
  //   setEmails(emailsTemp);
  //   forceUpdate();
  // };

  const handleDuplicate = () => {
    const emailsTemp = [...emails];

    emailsTemp
      .map(function (obj) {
        return obj.email;
      })
      .forEach(function (element, index, arr) {
        if (arr.indexOf(element) !== index) {
          emailsTemp[index].email.length !== 0
            ? (emailsTemp[index] = {
                ...emailsTemp[index],
                duplicateError: true,
              })
            : null;
          setEmails(emailsTemp);
        }
      });

    setEmails(emailsTemp);
  };

  useEffect(() => {
    handleDuplicate();
  }, [emails.length]);

  const handleSecondaryEmail = async (event: any, index: number) => {
    const text = event.target.value;
    const emailsTemp = [...emails];
    emailsTemp.splice(index, 1, {
      ...emailsTemp[index],
      email: text,
      duplicateError: false,
      exists: false,
    });
    setEmails(emailsTemp);
  };

  // const handleOnBlurSecondaryEmail = (index : number) => {
  //   const emailsTemp = [...emails]
  //   const lastIndex = emailsTemp.length - 1
  //   if(index === 1){
  //     if(emailsTemp[1].email.length > 0 && emailsTemp[lastIndex].email.length !==0){
  //       emailsTemp.push({
  //           email: "",
  //           duplicateError: false,
  //           exists: false,
  //       })
  //   }
  //   else if(emailsTemp[1].email.length == 0){
  //     for(let i = 0 ; i < emailsTemp.length; i++){
  //       if(emailsTemp[i].email.length === 0){
  //         emailsTemp.splice(i,1)
  //       }
  //     }
  //   }
  // }
  //   else if(index !== 1 && lastIndex !== 1){
  //     for(let i = 0 ; i < emailsTemp.length; i++){
  //       if(i !== 0 && i !== 1 && emailsTemp[i].email.length === 0 && i!==lastIndex){
  //         emailsTemp.splice(i,1)
  //       }
  //     }
  //     if(emailsTemp[lastIndex]?.email?.length > 0){
  //       emailsTemp.push({
  //         email: "",
  //         duplicateError: false,
  //         exists: false,
  //       })
  //     }
  //   }
  //   else if(index === lastIndex && emailsTemp.length == 2){
  //     if(emailsTemp[1].email.length > 0){
  //       emailsTemp.push({
  //         email: "",
  //         duplicateError: false,
  //         exists: false,
  //       })
  //     }
  //   }
  //   setEmails(emailsTemp)
  //   handleGetUserByEmailId()
  // }

  const handleSelectTenantRole = (item: any) => {
    setSelectedRole(item);
    setRoleError(false);
  };

  const handleSelectCompanies = (companies: any) => {
    setCompanyError(false);
    const selectedCompaniesTemp = selectedCompanies;

    if (selectedCompaniesTemp.length == 0) {
      selectedCompaniesTemp.push(companies);
    } else {
      let flag = 0;
      for (let i = 0; i < selectedCompaniesTemp.length; i++) {
        if (selectedCompaniesTemp[i]?.id === companies?.id) {
          selectedCompaniesTemp.splice(i, 1);
          flag = -1;
        }
      }
      if (flag !== -1) {
        selectedCompaniesTemp.push(companies);
      }
    }
    setSelectedCompanies(selectedCompanies);
    forceUpdate();
  };

  const handleSelectProjects = (project: any) => {
    const selectedProjectsTemp = selectedProjects;

    if (selectedProjectsTemp.length == 0) {
      selectedProjectsTemp.push(project);
    } else {
      let flag = 0;
      for (let i = 0; i < selectedProjectsTemp.length; i++) {
        if (selectedProjectsTemp[i]?.id === project?.id) {
          selectedProjectsTemp.splice(i, 1);
          flag = -1;
        }
      }
      if (flag !== -1) {
        selectedProjectsTemp.push(project);
      }
    }
    setSelectedProjects(selectedProjectsTemp);
    forceUpdate();
  };

  const handleAssociation = async (userProjectAssociation: any) => {
    try {
      await client.mutate({
        mutation: ASSOCIATE_USER_WITH_PROJECT,
        variables: {
          objects: userProjectAssociation,
        },
        context: { role: tenantProjectRole.createProjectAssociation },
      });
      dispatch(setIsLoading(false));
      setShowDialog(true);
    } catch (error: any) {
      console.log(error);
      dispatch(setIsLoading(false));
    }
  };

  const handleSelectedProjectRole = (role: any) => {
    const selectedProjectsTemp = [...selectedProjects];

    if (selectedProjectsTemp.length == 0) {
      selectedProjectsTemp.push(role);
    } else {
      let flag = 0;
      for (let i = 0; i < selectedProjectsTemp.length; i++) {
        if (selectedProjectsTemp[i]?.projectId === role?.projectId) {
          selectedProjectsTemp.splice(i, 1, {
            ...selectedProjectsTemp[i],
            role: role.role,
            error: false,
          });
          flag = -1;
        } else if (selectedProjectsTemp[i]?.id === role?.projectId) {
          selectedProjectsTemp.splice(i, 1, {
            ...selectedProjectsTemp[i],
            role: role.role,
            error: false,
          });
          flag = -1;
        }
      }
      if (flag !== -1) {
        selectedProjectsTemp.push(role);
      }
    }
    setSelectedProjects(selectedProjectsTemp);
    setSelectedProjectRole(selectedProjectsTemp);
    forceUpdate();
  };

  const handleAddValidation = async () => {
    let errorEmail = false;
    let errorCompany = false;
    let errorRole = false;
    if (!firstName.trim()) {
      setFirstNameError(true);
    }
    if (!lastName.trim()) {
      setLastNameError(true);
    }
    if (!jobTitle.trim()) {
      setJobTitleError(true);
    }
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (emails[0].email.length == 0 || !emailRegex.exec(emails[0].email)) {
      setEmailError(true);
      errorEmail = true;
    }
    if (!firstName.trim() || !lastName.trim() || !jobTitle.trim()) {
      return false;
    }
    if (selectedRole == null) {
      setRoleError(true);
      errorRole = true;
    }
    if (selectedCompanies.length == 0) {
      setCompanyError(true);
      errorCompany = true;
    }

    let flag = 0;
    if (selectedProjects.length !== 0) {
      const selectedProjectRoleTemp = [...selectedProjects];
      for (let i = 0; i < selectedProjectRoleTemp.length; i++) {
        if (
          !selectedProjectRoleTemp[i]?.role ||
          selectedProjectRoleTemp[i]?.role.length == 0
        ) {
          selectedProjectRoleTemp.splice(i, 1, {
            ...selectedProjectRoleTemp[i],
            error: true,
          });
          flag = -1;
        }
      }
      if (flag == -1) {
        setSelectedProjects(selectedProjectRoleTemp);
      }
    }
    if (!errorEmail && !errorRole && !errorCompany && flag == 0) {
      setEmailError(false);
      setCompanyError(false);
      setFirstNameError(false);
      setLastNameError(false);
      return true;
    } else {
      return false;
    }
  };

  const handleBulkUserInvite = async () => {
    const validate = await handleAddValidation();

    if (validate) {
      const data: any = [];
      emails.forEach((emailItem: any) => {
        if (emailItem.email.length !== 0) {
          data.push({
            company: selectedCompanies.map((compItem: any) => compItem.id),
            email: emailItem.email,
            role: selectedRole,
            firstName: firstName,
            lastName: lastName,
            jobTitle: jobTitle !== "" ? jobTitle : undefined,
          });
        }
      });
      const tenantId = decodeExchangeToken().tenantId;
      const url = `V1/tenant/${tenantId}/user`;
      try {
        dispatch(setIsLoading(true));
        const response = await postApiWithEchange(url, data);
        if (response.success) {
          const invitedUsers = response.success.invitedUsers;
          const associatedUsers = response?.success.associatedUsers;
          const totalUsers = [...invitedUsers, ...associatedUsers];
          if (totalUsers.length > 0 && selectedProjectRole.length > 0) {
            handleAssociation(totalUsers);
          } else {
            dispatch(setIsLoading(false));
            setShowDialog(true);
          }
        }
      } catch (error: any) {
        console.log(error);
        dispatch(setIsLoading(false));
        return error?.response?.data?.message;
      }
    }
  };

  const handleCancel = () => {
    history.push("/base/teammates/lists");
  };

  const handleSearch = (value: any) => {
    setSearchText(value);
  };

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;
    if (
      !destination ||
      decodeExchangeToken().allowedRoles.includes(
        tenantProjectRole.createProjectAssociation
      )
    ) {
      return;
    } else if (destination.droppableId === "dropArea") {
      const temp = [...selectedCompanies];

      const selectedCompany = tenantCompanies[source.index];

      const filtered: any = temp.filter(
        (item: any) => item.id === selectedCompany?.id
      );
      if (filtered.length > 0) {
        return;
      } else {
        temp.push(selectedCompany);
        setSelectedCompanies(temp);
      }
    }
  };

  const handleSelectedTypeOfView = (type: any) => {
    setTypeOfView(type);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="addNewTeammate__parentView">
        <SimpleDialog open={showDialog} emails={emails} />
        <Paper className="addNewTeammate__leftPaper">
          <div className="addNewTeammate__gray"></div>
          <div className="addNewTeammate__addButton">Add Teammate</div>
          <div className="addNewTeammate__details">
            <div className="addNewTeammate__leftTextFieldView">
              <div className="addNewTeammate__emailText">Email * </div>
              <div className="addNewTeammate__emailField">
                <TextField
                  onChange={() => handleEmailInput(event)}
                  onBlur={handleGetUserByEmailId}
                />
                {emails[0].exists && (
                  <div className="addNewTeammate__error">
                    * A teammate already exists with the same email
                  </div>
                )}
                {emailError && (
                  <div className="addNewTeammate__error">
                    * Please enter an email address
                  </div>
                )}
              </div>
            </div>
            <div className="addNewTeammate__leftTextFieldView">
              <div className="addNewTeammate__emailText">First Name * </div>
              <div className="addNewTeammate__emailField">
                <TextField
                  value={firstName}
                  disabled={disableFirstName}
                  onChange={() => handleFirstName(event)}
                />
                {firstNameError && (
                  <div className="addNewTeammate__error">
                    * First Name is required
                  </div>
                )}
              </div>
            </div>
            <div className="addNewTeammate__leftTextFieldView">
              <div className="addNewTeammate__emailText">Last Name * </div>
              <div className="addNewTeammate__emailField">
                <TextField
                  value={lastName}
                  disabled={disableLastName}
                  onChange={() => handleLastName(event)}
                />
                {lastNameError && (
                  <div className="addNewTeammate__error">
                    * Last Name is required
                  </div>
                )}
              </div>
            </div>
            <div className="addNewTeammate__leftTextFieldView">
              <div className="addNewTeammate__emailText">Job Title * </div>
              <div className="addNewTeammate__emailField">
                <TextField
                  value={jobTitle}
                  disabled={disableJobTitle}
                  onChange={() => handleJobTitle(event)}
                />
                {jobTitleError && (
                  <div className="addNewTeammate__error">
                    * Job Title is required
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* <div className="addNewTeammate__more">
          If you would like to add more than 1 teammate with the same criteria selected on the panels to the right,
          enter their email addresses below and we’ll invite them.
          </div>
          <div className="addNewTeammate__emailScroll">
          {emails.map(
            (email: any, index: number) =>
              index !== 0 && (
                <div key={index} className="addNewTeammate__emailView">
                  <div className={email.email.length > 0 ?"addNewTeammate__emailTextBold" : "addNewTeammate__emailText"}>Email</div>
                  <div  className="addNewTeammate__emailField">
                    <TextField
                      disabled={emails[0].email.length === 0 ? true : false}
                      key={index}
                      onChange={() => handleSecondaryEmail(event, index)}
                      // onBlur={handleGetUserByEmailId}
                      // onBlur={() => handleOnBlurSecondaryEmail(index)} 
                    />
                    {email?.exists ? (
                      <div className="addNewTeammate__error">
                        * A teammate already exists with the same email
                      </div>
                    ) : email?.duplicateError ? (
                      <div className="addNewTeammate__error">
                        * Duplicate email address
                      </div>
                    ) : (
                      <div></div>
                    )}
                  </div>
                </div>
              )
          )}
          </div> */}

          <div className="addNewTeammate__buttonView">
            <Button
              onClick={() => handleCancel()}
              className="addNewTeammate__button"
            >
              Cancel
            </Button>
            <Button
              disabled={disableInvite}
              className="btn-primary addNewTeammate__button"
              onClick={() => handleBulkUserInvite()}
            >
              Invite
            </Button>
          </div>
        </Paper>
        <Paper className="addNewTeammate__middlePaper">
          <div className="addNewTeammate__middleText">
            Associate teammates with companies and assign them to projects by
            selecting & deselecting icons from the right hand panel. Or just
            drag & drop if that’s easier.
          </div>
          <div className="addNewTeammate__middleTextBottom">
            You can also adjust their permissions here at both the software and
            project levels.
          </div>
          <div className="addNewTeammate__onxRole">
            <div className="addNewTeammate__onxRoleText">Slate Role*</div>
            <div className="addNewTeammate__select">
              <Select
                id="custom-dropdown"
                fullWidth
                autoComplete="off"
                defaultValue=""
                MenuProps={{
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
                {tenantRole &&
                  tenantRole.map(
                    (item: any, index: number) =>
                      item.id !== 1 &&
                      item.id !== 5 && (
                        <MenuItem
                          className="mat-menu-item-sm"
                          key={index}
                          value={item.role}
                          onClick={() => handleSelectTenantRole(item.id)}
                        >
                          {item.role}
                        </MenuItem>
                      )
                  )}
              </Select>
              {roleError && (
                <div className="addNewTeammate__error">
                  Please select a tenant role.
                </div>
              )}
            </div>
          </div>

          <div className="addNewTeammate__companiesText">
            Companies *{" "}
            {selectedCompanies.length ? (
              <div className="addNewTeammate__count">
                {selectedCompanies.length}
              </div>
            ) : (
              ""
            )}
          </div>
          <div>
            <TeammateAddEditCompaniesDropArea
              handleSelectedTypeOfView={(type: any) =>
                handleSelectedTypeOfView(type)
              }
              edit={true}
              companyError={companyError}
              companies={selectedCompanies}
              handleSelectedCompanies={(companies: any) =>
                handleSelectCompanies(companies)
              }
            />
          </div>
          <div className="addNewTeammate__companiesText">
            Projects{" "}
            {selectedProjects.length ? (
              <div className="addNewTeammate__count">
                {selectedProjects.length}
              </div>
            ) : (
              ""
            )}
          </div>
          {/* <div style={{ width: "100%" }}> */}
          <TeammateAddEditProjects
            handleSelectedTypeOfView={(type: any) =>
              handleSelectedTypeOfView(type)
            }
            edit={true}
            projectsWithRole={selectedProjects}
            projectRole={projectRole}
            handleSelectedProjectRole={(roles: any) =>
              handleSelectedProjectRole(roles)
            }
            handleSelectedProjects={(project: any) =>
              handleSelectProjects(project)
            }
            //  projects={userDetails?.projectAssociations}
          />
          {/* </div> */}
        </Paper>

        <Paper className="addNewTeammate__right">
          <TeammateAddEditRight
            typeView={typeOfView}
            handleSearch={(value: any) => handleSearch(value)}
            handleSelectedCompanies={(companies: any) =>
              handleSelectCompanies(companies)
            }
            handleSelectedProjects={(project: any) =>
              handleSelectProjects(project)
            }
            companies={tenantCompanies}
            projects={projects}
            selectedCompanies={selectedCompanies}
            selectedProjects={selectedProjects}
            handleSelectedTypeOfView={(type: any) =>
              handleSelectedTypeOfView(type)
            }
          />
        </Paper>
      </div>
    </DragDropContext>
  );
}
