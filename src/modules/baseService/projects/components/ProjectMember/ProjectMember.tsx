import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import React, { ReactElement, useContext, useEffect, useState } from "react";
import "./ProjectMember.scss";
import SearchIcon from "@material-ui/icons/Search";
import TenantAssociationTable from "../TenantAssociationTable/TenantAssociationTable";
import ProjectAssociationTable from "../ProjectAssociationTable/ProjectAssociationTable";
import {
  myProjectRole,
  ProjectSetupRoles,
  tenantProjectRole,
  tenantUserRole,
} from "../../../../../utils/role";
import { client } from "../../../../../services/graphql";
import {
  ADD_NEW_PROJECT_USER,
  FETCH_PROJECT_ASSOCIATION,
  FETCH_PROJECT_ASSOCIATION_BY_FULLNAME,
  FETCH_TENANT__PROJECT_ASSOCIATION,
  FETCH_TENANT__PROJECT_ASSOCIATION_BY_FULLNAME,
  UPDATE_PROJECT_USER_STATUS,
  UPDATE_USER_PROJECT_ROLE,
} from "../../../../../graphhql/queries/projects";
import {
  decodeExchangeToken,
  decodeProjectExchangeToken,
} from "../../../../../services/authservice";
import { stateContext } from "../../../../root/context/authentication/authContext";
import {
  setIsLoading,
  setRefreshProjects,
  updateProjectList,
} from "../../../../root/context/authentication/action";
import { useDebounce } from "../../../../../customhooks/useDebounce";
import { LOAD_PROJECT_ROLES__PROJECT__ASSOCIATION } from "../../../roles/graphql/queries/role";
import { Role } from "../../../roles/models/role";
import Notification, {
  AlertTypes,
} from "../../../../shared/components/Toaster/Toaster";
import { features, Status } from "../../../../../utils/constants";
import { match, useRouteMatch, useHistory } from "react-router-dom";
import {
  ProjectAssociationPayload,
  ProjectAssociationRoleUpdate,
  ProjectAssociationUpdate,
  UserProjectAssociation,
} from "../../../../../graphhql/models/project";
import { canUpdateProject } from "../../../roles/utils/permission";
import { canInviteProjectUsers } from "../../../../../services/permission";
import { projectDetailsContext } from "../../Context/ProjectDetailsContext";
import { ProjectRole } from "src/modules/baseService/roles/graphql/models/role";
import { postApi } from "src/services/api";
import { setProjectPermission, setProjectSettingToken } from "../../Context/ProjectDetailsActions";
import { Roles } from "../../utils/helper";

export interface Params {
  projectId: string;
}

export default function ProjectMember(): ReactElement {
  const { state, dispatch }: any = useContext(stateContext);
  const pathMatch: match<Params> = useRouteMatch();
  const [tableType, setTableType] = useState("LIST_VIEW");
  const [searchViewTable, setSearchViewTable] = useState("");
  const debounceView = useDebounce(searchViewTable, 1000);
  const [searchEditTable, setSearchEditTable] = useState("");
  const debounceEdit = useDebounce(searchEditTable, 1000);
  const [projectMembers, setProjectMembers] = useState<Array<any>>([]);
  const [tenantMembers, setTenantMembers] = useState<Array<any>>([]);
  const [rolesList, setRolesList] = useState<Array<any>>([]);
  const [selectedRolesList, setSelectedRolesList] = useState<Array<any>>([]);
  const [deSelectedRolesList, setDeSelectedRolesList] = useState<Array<any>>([]);
  const [isSearchModified,setIsSearchModified] = useState<any>(false)
  const history = useHistory();
  const { projectDetailsState, projectDetailsDispatch }: any = useContext(projectDetailsContext);

  useEffect(() => {
    if (tableType === "LIST_VIEW" && rolesList.length > 0) {
      fetchProjectAssociation();
    }
  }, [debounceView]);

  useEffect(() => {
    loadProjectRoles();
  }, []);

  useEffect(() => {
    setSelectedRolesList([])
    setDeSelectedRolesList([])
  }, [tableType]);

  useEffect(() => {
    if (tableType === "EDIT_VIEW") {
      const list = [...tenantMembers];
      const unassignedRole = list.filter(
        (item) => item.isPartOf && item.role === -1
      );
      if (unassignedRole.length > 0) {
        Notification.sendNotification(
          "Please assign project role to user",
          AlertTypes.warn
        );
        setIsSearchModified(true)
        return;
      }
      fetchTenantAssociation();
    }
  }, [debounceEdit]);

  /**
   * Method to toggle between edit and view mode
   * @param type : string
   */
  const tableViewToggle = (type: string) => {
    if (type === "EDIT_VIEW") {
      fetchTenantAssociation();
    } else {
      fetchProjectAssociation();
    }
    setSearchViewTable("");
    setSearchEditTable("");
    setTableType(type);
  };

  const handleSearchChange = (value: string, type: string) => {
    type === "view" ? setSearchViewTable(value) : setSearchEditTable(value);
  };

  /**
   * Method to fetch all the users allready associated users
   * @param argRoles : Array<any>
   */
  const fetchProjectAssociation = async (argRoles: Array<any> = []) => {
    try {
      argRoles = argRoles.length > 0 ? argRoles : rolesList;
      dispatch(setIsLoading(true));
      const role = decodeExchangeToken().allowedRoles.includes(
        tenantUserRole.viewTenantUsers
      )
        ? tenantUserRole.viewTenantUsers
        : myProjectRole.viewMyProjects;
      const name = debounceView.split(/\s+/);
      let fName = debounceView;
      let lName = '';
      if(name.length > 1) {
          fName = name[0].trim();
          lName = name[1].trim() ? name[1].trim() : '';
      }
      const projectAssociationResponse = await client.query({
        query: lName ? FETCH_PROJECT_ASSOCIATION_BY_FULLNAME : FETCH_PROJECT_ASSOCIATION,
        variables: {
          limit: 1000,
          offset: 0,
          projectId: Number(pathMatch.params.projectId),
          fName:`%${fName}%`,
          lName: `%${lName}%`
        },
        fetchPolicy: "network-only",
        context: { role },
      });
      const projectAssociation: Array<any> = [];
      if (projectAssociationResponse.data.projectAssociation.length > 0) {
        projectAssociationResponse.data.projectAssociation.forEach(
          (row: any) => {
            const company: Array<any> = [];
            const currentRole = argRoles.find(
              (roleItem: any) => roleItem.id === row.role
            );
            const newItem = {
              firstName: row?.user?.firstName ? row?.user?.firstName : "",
              lastName: row?.user?.lastName ? row?.user?.lastName : "",
              company: company?.join(","),
              email: row?.user?.email,
              role: currentRole?.role || "",
              projectId: row.projectId,
              userId: row.userId,
              phone: row?.user?.phone ? row?.user?.phone : "",
              status:row?.user?.status
            };
            projectAssociation.push(newItem);
          }
        );
        // projectAssociation.push(...projectAssociationResponse.data.projectAssociation);
      }
      setProjectMembers(projectAssociation);

      dispatch(setIsLoading(false));
    } catch (error) {
      console.log(error);
      dispatch(setIsLoading(false));
    }
  };

  /**
   * Method to fetch all projects including the deleted one
   */
  const loadProjectRoles = async () => {
    try {
      dispatch(setIsLoading(true));
      const role = myProjectRole.viewMyProjects;
      const resoponseData: any = await client.query({
        query: LOAD_PROJECT_ROLES__PROJECT__ASSOCIATION,
        variables: {},
        fetchPolicy: "network-only",
        context: { role },
      });
      const targetList: Array<Role> = [];
      resoponseData.data.projectRole.forEach((item: Role) => {
        targetList.push(item);
      });
      if (tableType === "LIST_VIEW") {
        fetchProjectAssociation(targetList);
      }
      setRolesList(targetList);
      dispatch(setIsLoading(false));
    } catch (error: any) {
      console.log(error.message);
      dispatch(setIsLoading(false));
    }
  };

  /**
   * Method to fetch all tenant users based on the user tenant/project role
   */
  const fetchTenantAssociation = async () => {
    try {
      setTenantMembers([]);
      dispatch(setIsLoading(true));
      const role = projectDetailsState?.projectUpdatePermission?.canUpdateMyProject?ProjectSetupRoles.updateMyProject:
        decodeExchangeToken().allowedRoles.includes(tenantUserRole.viewTenantUsers)?tenantUserRole.viewTenantUsers:
        tenantProjectRole.updateTenantProject;
      const token = projectDetailsState?.projectUpdatePermission?.canUpdateMyProject? projectDetailsState.projectToken: undefined;
      const name = debounceEdit.split(/\s+/);
      let fName = debounceEdit;
      let lName = '';
      if(name.length > 1) {
          fName = name[0].trim();
          lName = name[1].trim() ? name[1].trim() : '';
      }
      const tenantAssociationResponse = await client.query({
        query: lName ? FETCH_TENANT__PROJECT_ASSOCIATION_BY_FULLNAME : FETCH_TENANT__PROJECT_ASSOCIATION,
        variables: {
          limit: 1000,
          offset: 0,
          projectId: Number(pathMatch.params.projectId),
          status: 1,
          fName: `%${fName}%`,
          lName: `%${lName}%`,
          userId: decodeExchangeToken().userId,
        },
        fetchPolicy: "network-only",
        context: { role, token },
      });
      const tenantAssociation: Array<any> = [];
      if (tenantAssociationResponse.data.tenantAssociation.length > 0) {
        tenantAssociationResponse.data.tenantAssociation.forEach((row: any) => {
          const isPartOf =
            row?.projectAssociations.length > 0 &&
            row?.projectAssociations[0]?.status !== 1;
          const company: Array<any> = [];
          row?.companyAssociations.forEach((item: any) => {
            company.push(`${item?.company?.name}`);
          });
          // company.join(',');
          const newItem = {
            firstName: row?.user?.firstName ? row?.user?.firstName : "",
            lastName: row?.user?.lastName ? row?.user?.lastName : "",
            company: company?.join(","),
            email: row?.user?.email ? row?.user?.email : "",
            mobile: row?.user?.phone ? row?.user?.phone : "",
            role: row?.projectAssociations[0]?.role || -1,
            projectId: row?.projectId,
            userId: row?.user?.id,
            roleId: row?.role,
            originalRole: row?.projectAssociations[0]?.role || -1,
            status: row?.projectAssociations[0]?.status || -1,
            isPartOf,
            userStatus: row?.status || Status.null,
          };
          tenantAssociation.push(newItem);
        });
      }
      if(selectedRolesList.length){
        selectedRolesList.forEach((item:any)=>{
          tenantAssociation.forEach((item1:any)=>{
            if(item.userId == item1.userId && item.isPartOf){
              item1.isPartOf = true
              item1.role = item.role
            }
          })
        })
      }
      if(deSelectedRolesList.length){
        deSelectedRolesList.forEach((item:any)=>{
          tenantAssociation.forEach((item1:any)=>{
            if(item.userId == item1.userId && !item.isPartOf){
              item1.isPartOf = false
              item1.role = item.role
            }
          })
        })
      }
      setTenantMembers(tenantAssociation);
      dispatch(setIsLoading(false));
    } catch (error) {
      console.log(error);
      dispatch(setIsLoading(false));
    }
  };

  /**
   * Method to change the role of user
   * @param argValue : number
   * @param argId : string
   */
  const changeInRole = (argValue: number, argId: string) => {
    try {
      const list = [...tenantMembers];
      const selectedRoles = [...selectedRolesList]
      const deSelectedRoles = [...deSelectedRolesList]
      const currentItem = list.find((item: any) => item.userId === argId);
      if (currentItem) {
        const currentIndex = list.indexOf(currentItem);
        list[currentIndex].role = argValue;
        setTenantMembers(list);
      }
      const roleItem = selectedRoles.findIndex((item: any) => item.userId === argId);
      if(roleItem>-1){
        selectedRoles[roleItem].role = argValue;
        setSelectedRolesList(selectedRoles)
      }
      const roleItemIndex = deSelectedRoles.findIndex((item: any) => item.userId === argId);
      if(roleItemIndex>-1){
        deSelectedRoles[roleItem].role = argValue;
        setDeSelectedRolesList(deSelectedRoles)
      }
      if(isSearchModified){
        setIsSearchModified(false)
        fetchTenantAssociation()
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  /**
   * Method to check/uncheck a user from the teams
   * @param argValue : boolean
   * @param argId : string
   */
  const toggleUserSelection = (argValue: boolean, argId: string) => {
    try {
      const list = [...tenantMembers];
      const selectedRoleArr = [...selectedRolesList]
      const deSelectedRoleArr = [...deSelectedRolesList]
      const selectedItem = []
      const nonSelectedItem = []
      const currentItem = list.find((item: any) => item.userId === argId);
      if (currentItem) {
        const currentIndex = list.indexOf(currentItem);
        list[currentIndex].isPartOf = false;
        if (argValue) {
          list[currentIndex].isPartOf = argValue;
          selectedItem.push(list[currentIndex])
          const rolesList = [...selectedRoleArr,...selectedItem]
          setSelectedRolesList(rolesList)
          const isNonselectedExist = deSelectedRoleArr.findIndex((item: any) => item.userId === argId);
          if(isNonselectedExist>-1){
            deSelectedRoleArr.splice(isNonselectedExist,1)
            setDeSelectedRolesList(deSelectedRoleArr)
          }
        }else{
          const isExist = selectedRoleArr.findIndex((item: any) => item.userId === argId);
          if(isExist>-1){
            selectedRoleArr.splice(isExist,1)
            setSelectedRolesList(selectedRoleArr)
          }
          nonSelectedItem.push(list[currentIndex])
          const nonSelectedrolesList = [...deSelectedRoleArr,...nonSelectedItem]
          setDeSelectedRolesList(nonSelectedrolesList)
        }
        setTenantMembers(list);
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  /**
   * Method to select/deselect all user from the teammsates
   * @param argValue : boolean
   */
  const selectAll = (argValue: boolean) => {
    try {
      const list = [...tenantMembers];
      list.forEach((item: any) => {
        item.isPartOf = argValue;
      });
      setTenantMembers(list);
    } catch (error: any) {
      console.log(error.message);
    }
  };

  /**
   * Bulk association/disassociation of users to the project
   */
  const teamsLooksGood = async () => {
    try {
      let needUpdate= false;
      const selectedProjectId = Number(pathMatch.params.projectId);
      const list = [...tenantMembers];
      const selectedRoleArr = [...selectedRolesList]
      const deSelectedRoleArr = [...deSelectedRolesList]
      if(selectedRoleArr.length){
          selectedRoleArr.forEach((item:any)=>{
              let isItemExist = false
              list.forEach((item1:any)=>{
              if(item.userId == item1.userId){
                  isItemExist = true
              }
            })
            if(!isItemExist)
            list.push(item)
          })
        }
        if(deSelectedRoleArr.length){
          deSelectedRoleArr.forEach((item:any)=>{
              let isItemExist = false
              list.forEach((item1:any)=>{
              if(item.userId == item1.userId){
                  isItemExist = true
              }
            })
            if(!isItemExist)
            list.push(item)
          })
        }
      const unassignedRole = list.filter(
        (item) => item.isPartOf && item.role === -1
      );
      const token = projectDetailsState?.projectUpdatePermission
        ?.canUpdateMyProject
        ? projectDetailsState.projectToken
        : undefined;
      if (unassignedRole.length > 0) {
        Notification.sendNotification(
          "Please assign project role to user",
          AlertTypes.warn
        );
        return;
      }
      dispatch(setIsLoading(true));
      // List of user to associate fresh users to the project
      const insertAssociation = list.filter(
        (item) => item.isPartOf && Status.null === item.status
      );
      insertAssociation.forEach((item: any)=>{
        if(item.userId === decodeExchangeToken().userId){
          needUpdate=true;
        }
      });
      // List of user to Re-associate fresh users to the project
      const associateList = list.filter(
        (item) => item.isPartOf && Status.deactive === item.status
      );
      // List of user to disassociate fresh users from the project
      const disAssociateList = list.filter(
        (item) =>
          !item.isPartOf &&
          (Status.invite === item.status || item.status === Status.active)
      );
      associateList.forEach((item: any)=>{
        if(item.userId === decodeExchangeToken().userId){
          needUpdate=true;
        }
      });
      disAssociateList.forEach((item: any)=>{
        if(item.userId === decodeExchangeToken().userId){
          needUpdate=true;
        }
      });

      const insertProjectAssociation: ProjectAssociationPayload =
        new ProjectAssociationPayload([]);
      insertAssociation.forEach((user) => {
        const userProject = new UserProjectAssociation(
          selectedProjectId,
          user.role,
          Status.active,
          user.userId
        );
        insertProjectAssociation.objects.push(userProject);
      });

      const promiseList: Array<any> = [];
      /**
       * Associating a new user to the project  based on role Tenant/project
       * If user has permission at the tenant level updateProjectAssociationStatus
       * If user has permission at the project level then updateMyProjectAssociationStatus
       */
      const createRole = projectDetailsState?.projectUpdatePermission
        ?.canUpdateMyProject
        ? myProjectRole.createMyProjectAssociation
        : tenantProjectRole.createProjectAssociation;
      insertProjectAssociation.objects.forEach(
        (item: UserProjectAssociation) => {
          promiseList.push(
            client.mutate({
              mutation: ADD_NEW_PROJECT_USER,
              variables: {
                projectId: item.projectId,
                role: item.role,
                userId: item.userId,
              },
              context: { role: createRole, token },
            })
          );
        }
      );
      /**
       * disassociating a existing user to the project based on role Tenant/project
       * If user has permission at the tenant level updateProjectAssociationStatus
       * If user has permission at the project level then updateMyProjectAssociationStatus
       */
      const role = projectDetailsState?.projectUpdatePermission
        ?.canUpdateMyProject
        ? myProjectRole.updateMyProjectAssociationStatus
        : tenantProjectRole.updateProjectAssociationStatus;
      disAssociateList.forEach((item) => {
        const disAssociateProject = new ProjectAssociationUpdate(
          selectedProjectId,
          item.userId,
          Status.deactive
        );
        promiseList.push(
          client.mutate({
            mutation: UPDATE_PROJECT_USER_STATUS,
            variables: {
              ...disAssociateProject,
            },
            context: { role, token },
          })
        );
      });

      /**
       * Re-associating a existing user to the project based on role Tenant/project
       * If user has permission at the tenant level updateProjectAssociationStatus
       * If user has permission at the project level then updateMyProjectAssociationStatus
       */
      associateList.forEach((user) => {
        const reAssociateProject = new ProjectAssociationUpdate(
          selectedProjectId,
          user.userId,
          Status.active
        );
        promiseList.push(
          client.mutate({
            mutation: UPDATE_PROJECT_USER_STATUS,
            variables: {
              ...reAssociateProject,
            },
            context: { role, token },
          })
        );
      });
      const listOfChangeInRole = list.filter(
        (item) => item.isPartOf && item.role !== item.originalRole
      );
      listOfChangeInRole.forEach((item: any)=>{
        if(item.userId === decodeExchangeToken().userId){
          needUpdate = true;
        }
      });

      if (promiseList.length > 0 && listOfChangeInRole.length === 0) {
        await Promise.all(promiseList);
        updateTeammatesSuccess();
      } else if (promiseList.length > 0 && listOfChangeInRole.length > 0) {
        await Promise.all(promiseList);
        updateUserProjectRoles(listOfChangeInRole, selectedProjectId, token);
      } else if (listOfChangeInRole.length > 0) {
        updateUserProjectRoles(listOfChangeInRole, selectedProjectId, token);
      } else {
        updateTeammatesSuccess();
      }
      dispatch(updateProjectList(!state.getProjectList));
      if(needUpdate){
        fetchProjectExchangeToken();
      }
    } catch (error: any) {
      console.log(error.message);
      dispatch(setIsLoading(false));
    }
  };

  /**
   * Method to update associated user roles
   * @param listOfChangeInRole : Array<any>
   * @param selectedProjectId : number
   * @param token : string
   */
  const updateUserProjectRoles = async (
    listOfChangeInRole: Array<any>,
    selectedProjectId: number,
    token: string
  ) => {
    try {
      const roleChangePromiseList: Array<any> = [];
      // list of users who's project roles needs to be modified
      const updateRole = projectDetailsState?.projectUpdatePermission
        ?.canUpdateMyProject
        ? tenantProjectRole.updateProjectAssociationRole
        : myProjectRole.updateProjectAssociationRole;
      /**
       * Updating a user project role of user based on the role Tenant/Project
       * If user has permission at the tenant level updateProjectAssociationStatus
       * If user has permission at the project level then updateMyProjectAssociationStatus
       */
      listOfChangeInRole.forEach((item: any) => {
        const disAssociateProject = new ProjectAssociationRoleUpdate(
          selectedProjectId,
          item.userId,
          item.role
        );
        roleChangePromiseList.push(
          client.mutate({
            mutation: UPDATE_USER_PROJECT_ROLE,
            variables: {
              ...disAssociateProject,
            },
            context: { role: updateRole, token },
          })
        );
      });
      await Promise.all(roleChangePromiseList);
      updateTeammatesSuccess();
    } catch (error: any) {
      dispatch(setIsLoading(false));
      console.log(error?.message);
    }
  };

  const fetchProjectExchangeToken= async ()=>{
    try {
        dispatch(setIsLoading(true));
        const ProjectToken: any = {
            tenantId: Number(decodeExchangeToken().tenantId),
            projectId: Number(pathMatch.params.projectId),
            features: [features.PROJECTSETUP]
        };
        const projectTokenResponse = await postApi('V1/user/login/exchange', ProjectToken);
        projectDetailsDispatch(setProjectSettingToken(projectTokenResponse.success));
        setPermission(projectTokenResponse.success);
        dispatch(setIsLoading(false));
    } catch (error) {
        setPermission('');
        dispatch(setIsLoading(false));
    }
}

const setPermission = (argProjectToken: string) => {
    const allowedRoles = decodeProjectExchangeToken(argProjectToken).allowedRoles;
    const targetPermission: any = {}

    for (const [key, value] of Object.entries(Roles)) {
        const permission = allowedRoles.indexOf(value)>-1;
        targetPermission[`can${key[0].toLocaleUpperCase()}${key.slice(1,key.length)}`] = permission;
    }

    projectDetailsDispatch(setProjectPermission(targetPermission));
}

  /**
   * Method to handle the success scenario of update teammates
   */
  const updateTeammatesSuccess = () => {
    setTableType("LIST_VIEW");
    fetchProjectAssociation();
    Notification.sendNotification("Successfully updated", AlertTypes.success);
    dispatch(setIsLoading(false));
    dispatch(setRefreshProjects(!state.refreshProjects));
  };

  /**
   * Method to route user to invite user to invite a user to the project
   */
  const handleInviteOthersTeammate = () => {
    const projectId = Number(pathMatch.params.projectId);
    history.push(`/base/teammates/invite/projects/${projectId}`, {
      projectId: projectId,
      source: "projects",
    });
  };

  return (
    <div className="projectMember">
      <div className="projectMember__description">
        {`You can edit your Project team by selecting or deselecting members of your existing team, or inviting new members.`}
      </div>
      <div className="projectMember__container">
        <div className="projectMember__container__actions">
          <div className="projectMember__container__action-btns">
            {tableType === "LIST_VIEW" ? (
              <>
               <Button
                  disabled={
                    projectDetailsState.disableUpdatePermission
                  }
                  data-testid={"edit-team"}
                  variant="outlined"
                  className="team-btn btn-primary"
                  size="small"
                  onClick={() => tableViewToggle("EDIT_VIEW")}
                >
                  Edit project team
                </Button>
                {canInviteProjectUsers() && (
                  <Button
                    data-testid={"invite-team"}
                    variant="outlined"
                    className="team-btn btn-secondary"
                    size="small"
                    onClick={() => handleInviteOthersTeammate()}
                    // disabled={!canInviteProjectUsers()}
                  >
                    Invite others
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  data-testid={"save-edit-team"}
                  variant="outlined"
                  className="team-btn btn-primary"
                  size="small"
                  onClick={teamsLooksGood}
                >
                  Save Changes
                </Button>
                <Button
                  data-testid={"cancel-edit-team"}
                  variant="outlined"
                  className="team-btn"
                  size="small"
                  onClick={() => tableViewToggle("LIST_VIEW")}
                >
                  Cancel Edit
                </Button>
              </>
            )}
          </div>
          <div className="projectMember__container__right">
            {tableType === "LIST_VIEW" ? (
              <>
                <div className="projectMember__container__right__search">
                  <TextField
                    value={searchViewTable}
                    id="team-list-search-text"
                    type="text"
                    fullWidth
                    placeholder="Search"
                    autoComplete="off"
                    variant="outlined"
                    onChange={(e) => handleSearchChange(e.target.value, "view")}
                  />
                  <SearchIcon className="projectMember__container__right__search__icon" />
                </div>
                <span className="projectMember__container__users-count">
                  Showing{" "}
                  {projectMembers?.length > 1
                    ? `${projectMembers?.length} entries`
                    : `${projectMembers?.length} entry`}
                </span>
              </>
            ) : (
              <>
                <div className="projectMember__container__right__search">
                  <TextField
                    value={searchEditTable}
                    id="edit-team"
                    type="text"
                    fullWidth
                    placeholder="Search"
                    autoComplete="off"
                    variant="outlined"
                    onChange={(e) => handleSearchChange(e.target.value, "edit")}
                  />
                  <SearchIcon className="projectMember__container__right__search__icon" />
                </div>
                <span className="projectMember__container__users-count">
                  Showing{" "}
                  {tenantMembers?.length > 1
                    ? `${tenantMembers?.length} entries`
                    : `${tenantMembers?.length} entry`}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="projectMember__container__lists">
          {tableType === "LIST_VIEW" ? (
            <ProjectAssociationTable projectMembersData={projectMembers} />
          ) : (
            <TenantAssociationTable
              rolesList={rolesList}
              tenantMembersData={tenantMembers}
              changeInRole={changeInRole}
              toggleUserSelection={toggleUserSelection}
              selectAll={selectAll}
            />
          )}
        </div>
      </div>
    </div>
  );
}
