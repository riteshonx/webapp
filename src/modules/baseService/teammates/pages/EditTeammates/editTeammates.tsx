import React, { ReactElement, useEffect, useState, useContext } from "react";
import TeamEditLeft from "../../components/teamEditLeft";
import axios from "axios";
import {
  TeammateAddEditCompanies,
  TeammateAddEditCompaniesDropArea,
  TeammateAddEditProjects,
  TeammateAddProjects,
} from "../../components/addTeammateMiddle";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { extractAddressFromProject } from "../../../projects/utils/helper";
import TeammateAddEditRight from "../../components/addTeammateRight";
import { Select, MenuItem, Paper } from "@material-ui/core";
import {
  GET_USER_DETAILS,
  GET_PROJECT_ROLES,
  GET_SYSTEM_ROLE,
  GET_USER_TENANT_COMPANIES,
  UPDATE_TENANT_USER,
  UPDATE_PROJECT_ASSOCIATION_STATUS,
  UPDATE_PROJECT_ASSOCIATION_ROLE,
  UPDATE_COMPANY_ASSOCIATION_STATUS,
  ASSOCIATE_USER_WITH_PROJECT,
  ASSOCIATE_USER_WITH_COMPANY,
  UPDATE_USER_TENANT_ROLE,
  UPDATE_USER_TENANT_SECONDARY_EMAIL,
  UPDATE_COMPANY_TENANT_ASSOCIATION,
  UNLOCK_USER_ACCOUNT,
  GET_USER_ACCOUNT_STATUS
} from "../../queries";
import { FETCH_COMPABY_TYPE } from "../../../forms/grqphql/queries/customList";
import { client } from "../../../../../services/graphql";
import {
  decodeExchangeToken,
  getExchangeToken,
} from "../../../../../services/authservice";
import {
  tenantUserRole,
  myCompanyUserRole,
  tenantRoles,
  tenantProjectRole,
  myProjectRole,
  tenantCompanyRole,
  myCompanyRoles,
} from "../../../../../utils/role";
import { LOAD_USER_PROJECTS_BY_QUERY } from "../../../../../graphhql/queries/projects";
import { Button } from "@material-ui/core";
import "./editTeammates.scss";
import { useHistory, useLocation } from "react-router-dom";
import { useDebounce } from "../../../../../customhooks/useDebounce";
import { postApiWithEchange } from "../../../../../services/api";
import EditSuccess from "../../components/editSuccess";
import { setIsLoading } from "../../../../root/context/authentication/action";
import { stateContext } from "../../../../root/context/authentication/authContext";
import ActivationDialog from "../../components/activationPopup";
import { deleteRequestWithPayload } from "../../../../../services/api";
import { canUpdateUsers } from "src/services/permission";
import { useRouteMatch } from "react-router-dom";
import Notification, {
  AlertTypes,
} from "src/modules/shared/components/Toaster/Toaster";

function useForceUpdate() {
  const [value, setValue] = useState(0); // integer state
  return () => setValue((value) => value + 1); // update the state to force render
}

export interface userParams {
  firstName: string,
  lastName: string,
  jobTitle: string,
  email: string,
  phone: string,
  address:any
}

export default function EditTeammate(props: any): ReactElement {
  const forceUpdate = useForceUpdate();
  const { dispatch, state }: any = useContext(stateContext);
  const [role, setRole]: any = useState({});
  const [userDetails, setUserDetails]: any = useState<Array<any>>([]);
  const [searchText, setSearchText] = useState("");
  const [projectRole, setProjectRole]: any = useState<Array<any>>([]);
  const [tenantRole, setTenantRole]: any = useState<Array<any>>([]);
  const [tenantCompanies, setTenantCompanies] = useState<Array<any>>([]);
  const [projects, setProjects] = useState<Array<any>>([]);
  const [companyError, setCompanyError] = useState(false);
  const history = useHistory();
  const [userAssociationCompany, setUserAssociationCompany] = useState<
    Array<any>
  >([]);
  const [userAssociationProject, setUserAssociationProject] = useState<
    Array<any>
  >([]);
  const [selectedTenantRole, setSelectedTenantRole]: any = useState(null);
  const [changedUser, setChangedUser] = useState<userParams>({
    firstName: "",
    lastName: "",
    jobTitle: "",
    email: "",
    phone: " ",
    address:""
  });
  const [userAssociationProjectRole, setUserAssociationProjectRole] = useState<
    Array<any>
  >([]);

  const [originalProjects, setOriginalProjects] = useState<Array<any>>([]);
  const [originalProjectsId, setOriginalProjectsId] = useState<Array<any>>([]);

  const [originalCompanies, setOriginalCompanies] = useState<Array<any>>([]);
  const [originalCompaniesId, setOriginalCompaniesId] = useState<Array<any>>(
    []
  );

  const [changedUserInfo, setChangedUserInfo] = useState(false);
  const [typeOfView, setTypeOfView] = useState("companies");
  const debounceName = useDebounce(searchText, 500);
  const [openSuccess, setOpenSuccess] = useState(false);

  const [openActivationDialog, setOpenActivationDialog] = useState(false);
  const [activationType, setActivationType] = useState("");
  const [deletedRoles, setDeletedRoles] = useState<Array<any>>([]);
  const [secondaryEmail, setSecondaryEmail] = useState("");
  const [originalTenantRole, setOriginalTenantRole]: any = useState(null);
  const [userAccountStatus, setUserAccountStatus] = useState<number>(-1)
  const pathMatch: any = useRouteMatch();
  

  useEffect(() => {
    if(decodeExchangeToken().allowedRoles.includes(tenantUserRole.viewTenantUsers)||
    decodeExchangeToken().allowedRoles.includes(myCompanyUserRole.viewMyCompanyUsers)){
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
    if(decodeExchangeToken().allowedRoles.includes(tenantUserRole.viewTenantUsers)||
    decodeExchangeToken().allowedRoles.includes(myCompanyUserRole.viewMyCompanyUsers)){
      getUserDetails();
      getProjectRoles();
      getSystemRoles();
      if (
        decodeExchangeToken().allowedRoles.includes(
          tenantProjectRole.createProjectAssociation
        )
      ) {
        fetchProjects();
      }
      getTenantCompanies();
    } else{
      history.push('/pagenotfound');
    }
   
  }, []);

  useEffect(() => {
    if (tenantRole.length > 0) {
      const allTenantRoles = tenantRole;
      const deletedTemp = [...deletedRoles];
      let roleTemp: any = {};
      for (let i = 0; i < allTenantRoles.length; i++) {
        Object.keys(allTenantRoles[i]).map((item: any, index: number) => {
          roleTemp = {
            ...roleTemp,
            [`${allTenantRoles[i].id}`]: allTenantRoles[i].role,
          };
        });
        if (allTenantRoles[i].deleted) {
          deletedTemp.push(allTenantRoles[i].id);
        }
      }
      setDeletedRoles(deletedTemp);
      setRole(roleTemp);
    }
  }, [tenantRole]);

  useEffect(() => {
    if (userAssociationProject.length > 0 && deletedRoles.length > 0) {
      const deletedTemp = [...deletedRoles];
      for (let i = 0; i < userAssociationProject.length; i++) {
        if (
          userAssociationProject[i]?.role &&
          deletedRoles.indexOf(userAssociationProject[i].role) > -1
        ) {
        } else if (
          userAssociationProject[i]?.role &&
          deletedRoles.indexOf(userAssociationProject[i].role) == -1
        ) {
          deletedTemp.splice(
            deletedRoles.indexOf(userAssociationProject[i].role),
            1
          );
        }
      }
      setDeletedRoles(deletedTemp);
    }
  }, [userAssociationProject.length > 0 && deletedRoles.length > 0]);

  const getTenantCompanies = async () => {
    try {
      const companiesRole = decodeExchangeToken().allowedRoles.includes(
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
        context: { role: companiesRole },
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
    const systemRole = decodeExchangeToken().allowedRoles.includes(
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
          role: systemRole,
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
      const viewProjectRole = decodeExchangeToken().allowedRoles.includes(
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
          userId: pathMatch?.params?.userId //props.history.location.state.detail,
        },
        fetchPolicy: "network-only",
        context: { role: viewProjectRole },
      });
      const projectsList: Array<any> = [];
      if (projectsResponse.data.project.length > 0) {
        projectsList.push(...projectsResponse.data.project);
      }
      setProjects(projectsList);

      // setProjectListData(projects);
    } catch (error) {
      console.log(error);
    }
  };

  const getProjectRoles = async () => {
    const viewProjectRole = decodeExchangeToken().allowedRoles.includes(
      tenantRoles.viewProjectRoles
    )
      ? tenantRoles.viewProjectRoles
      : decodeExchangeToken().allowedRoles.includes(
          tenantProjectRole.createProjectAssociation
        )
      ? tenantProjectRole.createProjectAssociation
      : myProjectRole.viewMyProjects;

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
          role: viewProjectRole,
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

  const getUserDetails = async () => {
    const role = decodeExchangeToken().allowedRoles.includes(
      tenantUserRole.viewTenantUsers
    )
      ? tenantUserRole.viewTenantUsers
      : myCompanyUserRole.viewMyCompanyUsers;
    try {
      const formsTemplateResponse = await client.query({
        query: GET_USER_DETAILS,
        variables: {
          userId: pathMatch?.params?.userId // props.history.location.state.detail,
        },
        fetchPolicy: "network-only",
        context: {
          role,
        },
      });

      if (
        formsTemplateResponse.data.tenantAssociation &&
        formsTemplateResponse.data.tenantAssociation.length !== 0
      ) {
        setUserDetails(formsTemplateResponse.data.tenantAssociation[0]);
        const address = formsTemplateResponse.data.tenantAssociation[0].user?.addresses?.length?extractAddressFromProject(formsTemplateResponse.data.tenantAssociation[0]?.user):"";
        const userData = {
          firstName:
            formsTemplateResponse.data.tenantAssociation[0].user.firstName,
          lastName:
            formsTemplateResponse.data.tenantAssociation[0].user.lastName,
          jobTitle:
            formsTemplateResponse.data.tenantAssociation[0].user.jobTitle,
          email: formsTemplateResponse.data.tenantAssociation[0].user.email,
          phone: formsTemplateResponse.data.tenantAssociation[0].user.phone,
          address:address ? formatAddress(address):""
        };

        setChangedUser(userData);

        const originalCompaniesId: any = [];
        const originalCompanies: any = [];
        const userCompanies: any = [];

        for (
          let i = 0;
          i <
          formsTemplateResponse.data.tenantAssociation[0].companyAssociations
            .length;
          i++
        ) {
          // originalCompaniesId.push(
          //   formsTemplateResponse.data.tenantAssociation[0].companyAssociations[
          //     i
          //   ].companyId
          // );
          // originalCompanies.push(
          //   formsTemplateResponse.data.tenantAssociation[0].companyAssociations[
          //     i
          //   ]
          // );

          if (
            formsTemplateResponse.data.tenantAssociation[0].companyAssociations[
              i
            ].status > 1
          ) {
            originalCompaniesId.push(
              formsTemplateResponse.data.tenantAssociation[0]
                .companyAssociations[i].companyId
            );
            originalCompanies.push(
              formsTemplateResponse.data.tenantAssociation[0]
                .companyAssociations[i]
            );
            userCompanies.push(
              formsTemplateResponse.data.tenantAssociation[0]
                .companyAssociations[i]
            );
          }
        }

        setOriginalCompanies(originalCompanies);
        setOriginalCompaniesId(originalCompaniesId);

        const userAssociationCompanies =
          formsTemplateResponse.data.tenantAssociation[0].companyAssociations;
        setUserAssociationCompany(userCompanies);

        const originalProjectsId: any = [];
        const originalProjects: any = [];
        const userProjects: any = [];

        for (
          let i = 0;
          i <
          formsTemplateResponse.data.tenantAssociation[0].projectAssociations
            .length;
          i++
        ) {
          originalProjectsId.push(
            formsTemplateResponse.data.tenantAssociation[0].projectAssociations[
              i
            ].projectId
          );
          originalProjects.push(
            formsTemplateResponse.data.tenantAssociation[0].projectAssociations[
              i
            ]
          );
          if (
            formsTemplateResponse.data.tenantAssociation[0].projectAssociations[
              i
            ].status > 1
          ) {
            userProjects.push(
              formsTemplateResponse.data.tenantAssociation[0]
                .projectAssociations[i]
            );
          }
        }
        setOriginalProjectsId(originalProjectsId);
        setOriginalProjects(originalProjects);
        setUserAssociationProject(userProjects);
        setSelectedTenantRole(
          formsTemplateResponse.data.tenantAssociation[0].role
        );
        setOriginalTenantRole(
          formsTemplateResponse.data.tenantAssociation[0].role
        );
      }
    } catch (err: any) {
      console.log(err);
    }
  };

  const formatAddress=(address:any)=>{
    let addStr = ""
    if(address && typeof address === 'object'){
      for (const property in address){
        if(address.hasOwnProperty(property) && address[property] && property !== "id"){
            addStr = addStr?addStr+" ,"+address[property]:address[property]
        }
      }
    }
    return addStr;
  }

  const handleSelectCompanies = (companies: any) => {
    const selectedCompaniesTemp = [...userAssociationCompany];

    // selectedCompanies length is 0 then push the company
    if (selectedCompaniesTemp.length == 0) {
      selectedCompaniesTemp.push(companies);
    }

    // if length is more than 0 then check if company exists and remove
    else {
      let flag = 0;
      for (let i = 0; i < userAssociationCompany.length; i++) {
        if (companies?.id) {
          if (userAssociationCompany[i]?.id === companies?.id) {
            selectedCompaniesTemp.splice(i, 1);
            flag = -1;
            break;
          } else if (userAssociationCompany[i]?.companyId === companies?.id) {
            selectedCompaniesTemp.splice(i, 1);
            flag = -1;
            break;
          }
        } else if (companies?.companyId) {
          if (userAssociationCompany[i]?.id === companies?.companyId) {
            selectedCompaniesTemp.splice(i, 1);
            flag = -1;
            break;
          } else if (
            userAssociationCompany[i]?.companyId === companies?.companyId
          ) {
            selectedCompaniesTemp.splice(i, 1);
            flag = -1;
            break;
          }
        }
      }

      // if the length > 0 and company still doesn't exist then push it in the selectedCompanies
      if (flag !== -1) {
        selectedCompaniesTemp.push(companies);
      }
    }

    setCompanyError(false);
    setUserAssociationCompany(selectedCompaniesTemp);
    forceUpdate();
  };

  const handleSelectProjects = (project: any) => {
    const selectedProjectsTemp = [...userAssociationProject];
    let flag = 0;

    // if selectedProjects length is 0 then push the project
    if (selectedProjectsTemp.length == 0) {
      selectedProjectsTemp.push(project);
    } else {
      // if selectedProjects length > 0 then search the project and remove it
      for (let i = 0; i < userAssociationProject.length; i++) {
        if (project?.id) {
          if (userAssociationProject[i]?.projectId === project?.id) {
            selectedProjectsTemp.splice(i, 1);
            flag = -1;
            break;
          } else if (userAssociationProject[i]?.id === project?.id) {
            selectedProjectsTemp.splice(i, 1);
            flag = -1;
            break;
          }
        } else if (project?.projectId) {
          if (userAssociationProject[i]?.projectId === project?.projectId) {
            selectedProjectsTemp.splice(i, 1);
            flag = -1;
            break;
          } else if (userAssociationProject[i]?.id === project?.projectId) {
            selectedProjectsTemp.splice(i, 1);
            flag = -1;
            break;
          }
        }
      }
      // flag !== -1 meaning the selectedProjects length > 0 and project does not exist so push the project
      if (flag !== -1) {
        selectedProjectsTemp.push(project);
      }
    }

    // change the role array
    const selectedProjectRoleTemp = [...userAssociationProjectRole];


    for(let i = 0; i< selectedProjectRoleTemp.length;i++){
      if(project?.id){
        if(selectedProjectRoleTemp[i]?.id == project?.id){
          selectedProjectRoleTemp.splice(i, 1);
        }else if(selectedProjectRoleTemp[i]?.projectId == project?.id){
          selectedProjectRoleTemp.splice(i, 1);
        }
      }
      else if(project?.projectId){
        if(selectedProjectRoleTemp[i]?.id == project?.projectId){
          selectedProjectRoleTemp.splice(i, 1);
        }else if(selectedProjectRoleTemp[i]?.projectId == project?.projectId){
          selectedProjectRoleTemp.splice(i, 1);
        }
      }
    }

    setUserAssociationProject(selectedProjectsTemp);
    setUserAssociationProjectRole(selectedProjectRoleTemp);
    forceUpdate();
  };

  const handleSelectedProjectRole = (role: any) => {
    const selectedProjectsTemp = [...userAssociationProject];

    if (selectedProjectsTemp.length == 0) {
      selectedProjectsTemp.push(role);
    } else {
      let flag = 0;
      for (let i = 0; i < selectedProjectsTemp.length; i++) {
        if(role?.id){
          if(selectedProjectsTemp[i].id === role?.id){
            selectedProjectsTemp.splice(i, 1, {
              ...selectedProjectsTemp[i],
              role: role.role,
              error:false
            });
            flag = -1;
          }else if(selectedProjectsTemp[i]?.projectId === role?.id){
            selectedProjectsTemp.splice(i, 1, {
              ...selectedProjectsTemp[i],
              role: role.role,
              error:false
            });
            flag = -1;
          }
        }
        if(role?.projectId){
          if(selectedProjectsTemp[i].id === role?.projectId){
            selectedProjectsTemp.splice(i, 1, {
              ...selectedProjectsTemp[i],
              role: role.role,
              error:false
            });
            flag = -1;
          }else if(selectedProjectsTemp[i]?.projectId === role?.projectId){
            selectedProjectsTemp.splice(i, 1, {
              ...selectedProjectsTemp[i],
              role: role.role,
              error:false
            });
            flag = -1;
          }
        }
      }
      if (flag !== -1) {
        selectedProjectsTemp.push(role);
      }
    }
    setUserAssociationProject(selectedProjectsTemp);
    setUserAssociationProjectRole(selectedProjectsTemp);
    // forceUpdate();
  };

  const handleChangeTenantRole = (item: any) => {
    setSelectedTenantRole(item.id);
    const deletedTemp = [...deletedRoles];
    if (deletedRoles.indexOf(item.id) > -1) {
      deletedTemp.splice(deletedRoles.indexOf(item.id), 1);
    }
    setDeletedRoles(deletedTemp);
  };

  const handleEditUpdateValidation = async () => {
    if (userAssociationCompany.length === 0) {
      setCompanyError(true);
      return false;
    } 
    let flag = 0
    if(userAssociationProject.length > 0){
      const tempUserAssociationProject = [...userAssociationProject]
      for(let i = 0; i<tempUserAssociationProject.length;i++){
        if(!tempUserAssociationProject[i]?.role || tempUserAssociationProject[i]?.role.length ==0){
          tempUserAssociationProject.splice(i,1,{
            ...tempUserAssociationProject[i],
            error:true
          })
          flag = -1
        }
      }
      if(flag==-1){
        setUserAssociationProject(tempUserAssociationProject)
      }
    }

    if(flag == 0 && !companyError) {
      setCompanyError(false)
      return true
    }
  };

  const handleUpdateTenant = async () => {
    const validate = await handleEditUpdateValidation();
    if (validate) {
      // originalProjects are the projects that are already associated with the user
      // originalProjectsId are the ids of the originalProjects
      // userAssociationProject is the key in state that keeps our projects
      const uniqueAddedProjects = userAssociationProject.filter((project) =>
        project?.id
          ? originalProjectsId.indexOf(project?.id) > -1
            ? false
            : project?.projectId
            ? originalProjectsId.indexOf(project?.projectId) > -1
              ? false
              : true
            : true
          : false
      );
      // structure for using in query for new projects added to user 
      const uniqueProjectsQuery : any = []
      uniqueAddedProjects.map((item: any, index : number) => {
        uniqueProjectsQuery.push({
          projectId : item?.id ? item.id : item.projectId,
          role : item.role,
          userId : pathMatch?.params?.userId// props.history.location.state.detail,
        })
      })

      let uniqueStatusArrayForProjects : any = []
      let uniqueRoleArrayForProjects : any = []
      // loop to take out the unique projects to change status and role
      for(let i =0; i< originalProjects.length;i++){
        for(let j =0; j<userAssociationProjectRole.length;j++){
          if(userAssociationProjectRole[j]?.id  ){
            
            // checking if the project is in userAssociationProjectRole and its role has changed

            if((userAssociationProjectRole[j].id == originalProjects[i].projectId) && (userAssociationProjectRole[j].role !== originalProjects[i].role)){
              uniqueRoleArrayForProjects.push(userAssociationProjectRole[j])
            }

            // checking if the project is in userAssociationProjectRole and its status has changed

            if((userAssociationProjectRole[j].id == originalProjects[i].projectId) && originalProjects[i].status == 1){
              uniqueStatusArrayForProjects.push(userAssociationProjectRole[j])
            }
          }
          else if(userAssociationProjectRole[j]?.projectId){
            if((userAssociationProjectRole[j].projectId == originalProjects[i].projectId) && (userAssociationProjectRole[j].role !== originalProjects[i].role)){
              uniqueRoleArrayForProjects.push(userAssociationProjectRole[j])
            }
            if((userAssociationProjectRole[j].projectId == originalProjects[i].projectId) && originalProjects[i].status == 1){
              uniqueStatusArrayForProjects.push(userAssociationProjectRole[j])
            }
          }
        }
      }

      // add original unassigned projects if any to the unique status and role change array
      uniqueRoleArrayForProjects=[...uniqueRoleArrayForProjects,...uniqueProjectsQuery]
      uniqueStatusArrayForProjects=[...uniqueStatusArrayForProjects,...uniqueProjectsQuery]

      // loop through originalProjectId and userAssociationProject
      // to find the projects to be deassociated from the original projects
      const projectsToBeDeassociated = originalProjects.filter((org) =>
        userAssociationProject.every((selected) =>
        selected?.id
          ? selected.id !== org.projectId
          : selected?.projectId
          ? selected.projectId !== org.projectId
          : true
      )
      );
      
      // data query for unique/new companies added
      const uniqueCompaniesData: any = [];
      // //changing this
      userAssociationCompany.map((item: any, index: number) => {
        item.status !== 3 &&
          item.status !== 2 &&
          uniqueCompaniesData.push({
            companyId: item.id ? item.id : item.companyId,
            userId: pathMatch?.params?.userId, // props.history.location.state.detail,
            status: 2,
          });
      });
      // companies to be deassociated by using originalCompaniesId & userAssociationCompany
      const companiesToBeDeassociated = originalCompaniesId.filter((org) =>
        userAssociationCompany.every((selected) =>
          selected?.id
            ? selected.id !== org
            : selected?.companyId
            ? selected.companyId !== org
            : true
        )
      );
      try {
      
        const promiseList: any = [];
        // update tenant role
        if (selectedTenantRole !== originalTenantRole) {
          const updateTenantRole = decodeExchangeToken().allowedRoles.includes(
            tenantUserRole.updateTenantUser
          )
            ? tenantUserRole.updateTenantUser
            : myCompanyRoles.updateMyCompanyAssociationRole;
          promiseList.push(
            client.mutate({
              mutation: UPDATE_USER_TENANT_ROLE,
              variables: {
                userId: pathMatch?.params?.userId, // props.history.location.state.detail,
                role: selectedTenantRole,
              },
              context: { role: updateTenantRole },
            })
          );
        }
        // associate user with project
        if (uniqueProjectsQuery.length > 0) {
          promiseList.push(
            client.mutate({
              mutation: ASSOCIATE_USER_WITH_PROJECT,
              variables: {
                objects: uniqueProjectsQuery,
              },
              context: { role: tenantProjectRole.createProjectAssociation },
            })
          );
        }
        // deassociateProjects
        if (projectsToBeDeassociated.length > 0) {
          projectsToBeDeassociated.map((item: any, index: number) => {
          item.status == 3 &&  promiseList.push(
              client.mutate({
                mutation: UPDATE_PROJECT_ASSOCIATION_STATUS,
                variables: {
                  projectId: item?.id ? item.id : item.projectId,
                  userId:pathMatch?.params?.userId, // props.history.location.state.detail,
                  status: 1,
                },
                context: {
                  role: "updateProjectAssociationStatus",
                },
              })
            );
          });
        }
        // // active projects

        uniqueStatusArrayForProjects.map((item: any, index: number) => {
            promiseList.push(
            client.mutate({
              mutation: UPDATE_PROJECT_ASSOCIATION_STATUS,
              variables: {
                projectId: item.id ? item.id : item.projectId,
                // role: item.role,
                status: 3,
                userId: pathMatch?.params?.userId // props.history.location.state.detail,
              },
              context: {
                role: "updateProjectAssociationStatus",
              },
            })
          );
        });

        // companies queries

        if (companiesToBeDeassociated.length > 0) {
          companiesToBeDeassociated.map((item: any, index: number) => {
            const companiesToBeDeassociatedRole =
              decodeExchangeToken().allowedRoles.includes(
                tenantUserRole.updateTenantUser
              )
                ? tenantUserRole.updateTenantUser
                : myCompanyUserRole.updateMyCompanyUser;
            promiseList.push(
              client.mutate({
                mutation: UPDATE_COMPANY_ASSOCIATION_STATUS,
                variables: {
                  companyId: item,
                  status: 1,
                  userId: pathMatch?.params?.userId // props.history.location.state.detail,
                },
                context: {
                  role: companiesToBeDeassociatedRole,
                },
              })
            );
          });
        }

        if (uniqueCompaniesData.length > 0) {
          const uniqueCompaniesDataRole = decodeExchangeToken().allowedRoles.includes(
            tenantUserRole.updateTenantUser
          )
            ? tenantUserRole.updateTenantUser
            : myCompanyUserRole.updateMyCompanyUser;
          promiseList.push(
            client.mutate({
              mutation: UPDATE_COMPANY_TENANT_ASSOCIATION,
              variables: {
                objects: uniqueCompaniesData,
              },
              context: {
                role: uniqueCompaniesDataRole,
              },
            })
          );
        }

        if (changedUserInfo) {
          promiseList.push(
            client.mutate({
              mutation: UPDATE_TENANT_USER,
              variables: {
                id: pathMatch?.params?.userId, // props.history.location.state.detail,
                firstName: changedUser.firstName.trim(),
                lastName: changedUser.lastName.trim(),
                jobTitle: changedUser.jobTitle ? changedUser.jobTitle : "",
                phone: changedUser.phone ? changedUser.phone : null,
              },
              context: {
                role: "updateTenantUser",
              },
            })
          );
        }
        if (secondaryEmail !== "") {
          promiseList.push({
            mutation: UPDATE_USER_TENANT_SECONDARY_EMAIL,
            variables: {
              userId:pathMatch?.params?.userId, // props.history.location.state.detail,
              email: secondaryEmail,
              primaryEmail: false,
            },
            context: {
              role: "updateTenantUser",
            },
          });
        }
        // added checks for role to change seperately after the status has updated.
        if (promiseList.length > 0 && uniqueRoleArrayForProjects.length == 0) {
          dispatch(setIsLoading(true));
          await Promise.all(promiseList);
          dispatch(setIsLoading(false));
          setOpenSuccess(true);
        }
        else if(promiseList.length > 0 && uniqueRoleArrayForProjects.length > 0){
          dispatch(setIsLoading(true));
          await Promise.all(promiseList);
          projectRoleAssociationQuery(uniqueRoleArrayForProjects)
        }else if(promiseList.length == 0 && uniqueRoleArrayForProjects.length > 0 ){
          dispatch(setIsLoading(true));
          await Promise.all(promiseList);
          projectRoleAssociationQuery(uniqueRoleArrayForProjects)
        }
      } catch (error: any) {
        dispatch(setIsLoading(false));
        console.log(error);
      }
    }
  };

 const projectRoleAssociationQuery = async (uniqueRoleArrayForProjects: any) => {

  // once the status is updated for the projects update the role
   try{
     const promiseList : any = []
     uniqueRoleArrayForProjects.map((item: any, index: number) => {
      promiseList.push(
        client.mutate({
          mutation: UPDATE_PROJECT_ASSOCIATION_ROLE,
          variables: {
            projectId: item.id ? item.id : item.projectId,
            role: item.role,
            userId: pathMatch?.params?.userId 
          },
          context: {
            role: "updateProjectAssociationRole",
          },
        })
      );
    });

    if(promiseList.length > 0){
        await Promise.all(promiseList);
        dispatch(setIsLoading(false));
        setOpenSuccess(true);
    }
   }
   catch{
    dispatch(setIsLoading(false));
   }
 }

  const setUserValues = (value: any, type: any) => {
    setChangedUser({
      ...changedUser,
      [type]: value,
    });
    setChangedUserInfo(true);
    if (type === "secondaryEmail") {
      setSecondaryEmail(value);
    }
    if(type === "location"){
      setChangedUser({
        ...changedUser,
        address: value,
      });
    }
  };

  const handleCancel = () => {
    history.push("/base/teammates/lists");
  };

  const handleSearch = (value: any) => {
    setSearchText(value);
  };

  const reactivateApi = async () => {
    const data: any = [];
    const tenantId = decodeExchangeToken().tenantId;

    data.push({
      email: userDetails.user.email,
      role: userDetails.role,
    });
    const company: any = [];

    for (let i = 0; i < userDetails.companyAssociations.length; i++) {
      company.push(userDetails.companyAssociations[i].companyId);
    }

    data[0].company = company;

    const url = `V1/tenant/${tenantId}/user`;
    try {
      dispatch(setIsLoading(true));
      const response = await postApiWithEchange(url, data);
      if (response) {
        dispatch(setIsLoading(false));
        history.push("/base/teammates/lists");
      }
    } catch (error: any) {
      dispatch(setIsLoading(false));
      console.log(error);
      return error?.response?.data?.message;
    }
  };

  const handleReactivate = async () => {
    setOpenActivationDialog(true);
    setActivationType("activate");
  };

  const deactivateApi = async () => {
    const tenantId = decodeExchangeToken().tenantId;
    const data: any = [];
    data.push(userDetails.user.id);
    const dataToSend: any = {
      userIds: data,
    };
    dispatch(setIsLoading(true));
    const url = `${process.env["REACT_APP_AUTHENTICATION_URL"]}V1/tenant/${tenantId}/association`;
    const response = await deleteRequestWithPayload(url, dataToSend);

    if (response) {
      dispatch(setIsLoading(false));
      history.push("/base/teammates/lists");
    }
  };

  const handleDeactivate = () => {
    setOpenActivationDialog(true);
    setActivationType("deactivate");
  };

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;
    if (!destination) {
      return;
    } else if (destination.droppableId === "dropArea") {
      const temp = [...userAssociationCompany];
      const selectedCompany = tenantCompanies[source.index];
      const filtered: any = temp.filter(
        (item: any) =>
          item.id === selectedCompany?.id ||
          item.companyId === selectedCompany.id
      );
      if (filtered.length > 0) {
        return;
      } else {
        temp.push(selectedCompany);
        setUserAssociationCompany(temp);
      }
    }
  };

  const handleSelectedTypeOfView = (type: any) => {
    setTypeOfView(type);
  };

  const handleCloseSuccess = () => {
    setOpenSuccess(false);
  };

  const handleCloseActivationDialog = () => {
    setOpenActivationDialog(false);
    setActivationType("");
  };


  useEffect(()=>{
    getUserAccountStatus()
  },[])

  const getUserAccountStatus = async()=>{
    const role = decodeExchangeToken().allowedRoles.includes(
      tenantUserRole.viewTenantUsers
    )
      ? tenantUserRole.viewTenantUsers:null
    try{
      dispatch(setIsLoading(true))
      const response = await client.query({
        query: GET_USER_ACCOUNT_STATUS,
        variables: {
          userId: pathMatch?.params?.userId // props.history.location.state.detail,
        },
        fetchPolicy: "network-only",
        context: {
          role:role,
        },
      })
      setUserAccountStatus(response?.data?.user[0]?.status)
      dispatch(setIsLoading(false))
   
    }catch(error:any){
      console.log("Error in geeting user account status",error)
      dispatch(setIsLoading(false))

    }
  }



  const handleUnLockUserProfile = async()=>{
    try{
      dispatch(setIsLoading(true))
      const response = await client.mutate({
        mutation:UNLOCK_USER_ACCOUNT,
        variables:{
          userId: pathMatch?.params?.userId,
          status: 3,
          lockedAt: null
        },
        context:{
          role:'updateTenantUser'
        }
      })
      if(response.data?.update_user.affected_rows==1){
        Notification.sendNotification(
          "User successfully unlocked",
          AlertTypes.success
        );
      }
      dispatch(setIsLoading(false))
    }catch(error:any){
      console.log("error in un-locking user ",error)
      Notification.sendNotification(
        "Something went wrong while un-locking user",
        AlertTypes.warn
      );
      dispatch(setIsLoading(false))
    }finally{
      getUserAccountStatus()
    }

  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="editTeammate__parentView">
        <div className="editTeammate__left">
          <TeamEditLeft
            secondaryEmail={secondaryEmail}
            reactivate={() => handleReactivate()}
            deactivate={() => handleDeactivate()}
            setUserValue={(value: any, type: any) => setUserValues(value, type)}
            userDetails={userDetails}
            userAccountStatus = {userAccountStatus}
            unLockUserProfile = {handleUnLockUserProfile}
          />

          <div className="editTeammate__buttons">
            <Button
              onClick={() => handleCancel()}
              className="editTeammate__buttonCancel"
            >
              Cancel
            </Button>
           {canUpdateUsers() && <Button
              disabled={
                (userDetails && userDetails?.status === 1) ||
                ((changedUser?.firstName?.trim().length === 0 ||
                  changedUser?.lastName?.trim().length == 0) &&
                  canUpdateUsers())
              }
              onClick={() => handleUpdateTenant()}
              className="btn-primary editTeammate__buttonUpdate"
            >
              Update
            </Button>}
          </div>
        </div>

        <Paper className="editTeammate__middleText">
          <div style={{ fontSize: 12 }}>
            Associate teammates with companies and assign them to projects by
            selecting & deselecting icons from the right hand panel. Or just
            drag & drop if that’s easier.
          </div>
          <div style={{ paddingTop: 20 }}>
            You can also adjust their permissions here at both the software and
            project levels.
          </div>
          <div className="editTeammate__onxRole">
            <div className="editTeammate__onxRoleText">Slate Role*</div>
            <div style={{ width: "100%" }}>
              <Select
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
                disabled={
                  (userDetails.role == 1 || userDetails.status == 1 || userDetails.role == 5) ? true : 
                  !canUpdateUsers() ? true : false
                }
                id="custom-dropdown"
                fullWidth
                autoComplete="off"
                value={selectedTenantRole && role[selectedTenantRole]}
              >
                {tenantRole &&
                  tenantRole.map((item: any, index: number) =>
                    userDetails.role !== 1 && userDetails.role !== 5 ? (
                      item.id !== 1 && item.id !== 5 && !item.deleted ? (
                        <MenuItem
                          className="mat-menu-item-sm"
                          key={item.id}
                          onClick={() => handleChangeTenantRole(item)}
                          value={role[item.id]}
                        >
                          {item.role}
                        </MenuItem>
                      ) : (
                        item.deleted &&
                        selectedTenantRole == item.id && (
                          <MenuItem
                            className="mat-menu-item-sm"
                            onClick={() => handleChangeTenantRole(item)}
                            value={role[item.id]}
                          >
                            {item.role}
                          </MenuItem>
                        )
                      )
                    ) : (
                      <MenuItem
                        className="mat-menu-item-sm"
                        onClick={() => handleChangeTenantRole(item)}
                        value={role[item.id]}
                      >
                        {item.role}
                      </MenuItem>
                    )
                  )}
              </Select>
            </div>
          </div>
          <div className="editTeammate__companiesText">
            Companies *{" "}
            {userAssociationCompany.length ? (
              <div className="editTeammate__count">
                {userAssociationCompany.length}
              </div>
            ) : (
              ""
            )}
          </div>
          <div style={{ overflowY: "auto" }}>
            <TeammateAddEditCompaniesDropArea
              handleSelectedTypeOfView={(type: any) =>
                handleSelectedTypeOfView(type)
              }
              edit={true}
              companyError={companyError}
              handleSelectedCompanies={(companies: any) =>
                handleSelectCompanies(companies)
              }
              // handleSelectedCompanies={(companies : any) => null}
              companies={userAssociationCompany}
            />
          </div>
          <div className="editTeammate__companiesText">
            Projects{" "}
            {userAssociationProject.length ? (
              <div className="editTeammate__count">
                {userAssociationProject.length}
              </div>
            ) : (
              ""
            )}
          </div>
          <TeammateAddEditProjects
            handleSelectedTypeOfView={(type: any) =>
              handleSelectedTypeOfView(type)
            }
            edit={true}
            projectsWithRole={userAssociationProject}
            projectRole={projectRole}
            handleSelectedProjectRole={(roles: any) =>
              handleSelectedProjectRole(roles)
            }
            handleSelectedProjects={(projects: any) =>
              handleSelectProjects(projects)
            }
          />
        </Paper>
        <Paper className="editTeammate__right">
          <TeammateAddEditRight
            typeView={typeOfView}
            handleSelectedTypeOfView={(type: any) =>
              handleSelectedTypeOfView(type)
            }
            selectedProjects={userAssociationProject}
            edit={true}
            selectedCompanies={userAssociationCompany}
            handleSearch={(value: any) => handleSearch(value)}
            companies={tenantCompanies}
            projects={projects}
            handleSelectedCompanies={(companies: any) =>
              handleSelectCompanies(companies)
            }
            handleSelectedProjects={(projects: any) =>
              handleSelectProjects(projects)
            }
          />
        </Paper>
      </div>

      {openSuccess && (
        <EditSuccess open={openSuccess} onClose={() => handleCloseSuccess()} />
      )}

      <ActivationDialog
        open={openActivationDialog}
        closeInvite={handleCloseActivationDialog}
        type={activationType}
        reactivate={() => reactivateApi()}
        deactivate={() => deactivateApi()}
      />
    </DragDropContext>
  );
}
