import React, { ReactElement, useState } from "react";

import {} from "../../../roles/utils/permission";
import { useHistory } from "react-router-dom";
import { useEffect } from "react";
import { client } from "../../../../../services/graphql";

import { TENANT_USERS, TENANT_USERS_BY_FULLNAME } from "../../queries";
import { decodeExchangeToken } from "../../../../../services/authservice";
import { tenantUserRole, myCompanyUserRole } from "../../../../../utils/role";
import {
  Paper,
  TextField,
  Button,
  Tooltip,
  IconButton,
} from "@material-ui/core";
import CrossIcon from "@material-ui/icons/HighlightOff";
import TeammatesTable from "../../components/teammatesTable";
import SearchIcon from "@material-ui/icons/Search";
import "./teammateslanding.scss";
import { useDebounce } from "../../../../../customhooks/useDebounce";
import projectIcon from "../../../../../assets/images/project.png";
import EditIcon from "@material-ui/icons/Edit";
import EmailIcon from "@material-ui/icons/Email";
import { truncateLongString } from "../../../../../utils/helper";
import ResendInvite from "../../components/resendInvite";
import { canInviteUsers } from "../../../../../services/permission";
 import CommonHeader from "../../../../shared/components/CommonHeader/CommonHeader";
import AppsIcon from "@material-ui/icons/Apps";
import ViewListIcon from "@material-ui/icons/ViewList";
import USER_AVATAR from "../../../../../assets/images/Imageuser.svg";
import NoPermission from "src/modules/shared/components/NoPermission/NoPermission";

const header = {
  name: "Teammates",
  description:
    "Add & invite new teammates who can be assigned to different projects.",
};

const noPermissionMessage = "You don't have permission to view Teammates";

const status: any = {
  1: "Deactivated",
  2: "Invited",
  3: "Active",
};

function useForceUpdate() {
  const [value, setValue] = useState(0); // integer state
  return () => setValue((value) => value + 1); // update the state to force render
}

export default function teammatesLanding(): ReactElement {
  const history = useHistory();
  const [teammates, setTeammatesList] = useState<Array<any>>([]);
  const [viewStyle, setViewStyle] = useState("list");
  const [selectedUser, setSelectedUser]: any = useState(null);
  const [searchText, setSearchText]: any = useState("");
  const [showAddTeammateDialog, setShowAddTeammateDialog]: any =
    useState(false);
  const debounceName = useDebounce(searchText, 500);
  const [openInvite, setOpenInvite] = useState(false);
  const navigateBack = () => {
    history.push(`/`);
  };
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    if (
      decodeExchangeToken().allowedRoles.includes(
        tenantUserRole.viewTenantUsers
      ) ||
      decodeExchangeToken().allowedRoles.includes(
        myCompanyUserRole.viewMyCompanyUsers
      )
    ) {
      getTenants();
    }
  }, []);

  useEffect(() => {
    if (
      decodeExchangeToken().allowedRoles.includes(
        tenantUserRole.viewTenantUsers
      ) ||
      decodeExchangeToken().allowedRoles.includes(
        myCompanyUserRole.viewMyCompanyUsers
      )
    ) {
      getTenants();
    }
  }, [debounceName]);

  const getTenants = async () => {
    const role = decodeExchangeToken().allowedRoles.includes(
      tenantUserRole.viewTenantUsers
    )
      ? tenantUserRole.viewTenantUsers
      : myCompanyUserRole.viewMyCompanyUsers;
    try {
      const name = debounceName.split(/\s+/);
      let fName = debounceName;
      let lName = "";
      if (name.length > 1) {
        fName = name[0].trim();
        lName = name[1].trim() ? name[1].trim() : "";
      }
      const formsTemplateResponse = await client.query({
        query: lName ? TENANT_USERS_BY_FULLNAME : TENANT_USERS,
        variables: {
          fName: `%${fName}%`,
          lName: `%${lName}%`,
          limit: 10000,
          offset: 0,
        },
        fetchPolicy: "network-only",
        context: {
          role,
        },
      });

      if (formsTemplateResponse.data?.tenantAssociation) {
        const response = formsTemplateResponse.data?.tenantAssociation;
        const structure: any = [];
        for (let i = 0; i < response.length; i++) {
          if (response[i].status == 1) {
            structure.push({
              ...response[i],
              user: {
                ...response[i].user,
                status: "deactive",
              },
            });
          } else if (response[i].status == 2) {
            structure.push({
              ...response[i],
              user: {
                ...response[i].user,
                status: "invited",
              },
            });
          } else {
            structure.push({
              ...response[i],
              user: {
                ...response[i].user,
                status: "active",
              },
            });
          }
        }
        setTeammatesList(structure);
      }
    } catch (err: any) {
      console.log(err);
    }
  };

  const handleViewStyle = (type: string) => {
    setViewStyle(type);
  };

  const handleSelectedUser = (user: any) => {
    setSelectedUser(user);
  };

  const closeSelected = () => {
    setSelectedUser(null);
  };

  const handleAddTeammateDialog = () => {
    history.push("/base/teammates/invite");
  };

  const handleEditPage = () => {
    history.push(`edit/${selectedUser.user.id}`);
  };

  const handleOpenInvite = () => {
    setOpenInvite(true);
  };

  const closeInvite = () => {
    setOpenInvite(false);
  };

  return (
    <div className="teammates__parentView">
      <ResendInvite
        open={openInvite}
        closeInvite={() => closeInvite()}
        emails={selectedUser?.user?.email}
      />
      {selectedUser && (
        <div className="teammates__selectedParentView">
          <div className="teammates__selectedImage">
            <img
              className="teammates__selectedImage"
              src={USER_AVATAR}
              alt="user-avatar"
            />
            <div
              className="teammates__closeIcon"
              onClick={() => closeSelected()}
            >
              {" "}
              <CrossIcon />
            </div>
          </div>
          <div className="teammates__userDetailEdit">
            <div>
              {selectedUser && selectedUser?.user.firstName ? (
                <div>
                  {selectedUser.user.firstName + " "}
                  {selectedUser.user.lastName && selectedUser.user.lastName}
                </div>
              ) : (
                selectedUser.user.email.split("@")[0]
              )}
            </div>
            <div className="teammates__editIcon">
              <Tooltip title="Edit" placement="bottom">
                <IconButton onClick={() => handleEditPage()}>
                  <EditIcon className="teammates__editIconSize" />
                </IconButton>
              </Tooltip>
            </div>
            {selectedUser.status == 2 && (
              <div className="teammates__editIcon">
                <Tooltip title="Invite" placement="bottom">
                  <IconButton onClick={() => handleOpenInvite()}>
                    <EmailIcon className="teammates__editIconSize" />
                  </IconButton>
                </Tooltip>
              </div>
            )}
          </div>
          <div className="teammates__selectedCompanyName">
            {selectedUser &&
              selectedUser?.companyAssociations &&
              selectedUser?.companyAssociations.length !== 0 &&
              selectedUser?.companyAssociations.map(
                (company: any, index: number) => (
                  <div
                    key={`${company.company.name}-${index}`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {company?.company?.name}
                  </div>
                )
              )}
          </div>
          <div className="teammates__selectedEmail">
            {selectedUser && selectedUser?.user.email}
          </div>
          <div className="teammates__selectedCompanyName">
            Slate role |{" "}
            {selectedUser && selectedUser?.tenantRole
              ? selectedUser?.tenantRole?.role
              : "--"}
          </div>
          <div className="teammates__selectedStatus">
            Status | {status[selectedUser?.status]}
          </div>
          <div className="teammates__editBoxProjects">
            <div>Projects</div>
            <div className="teammates__selectedProjectView">
              {selectedUser && selectedUser?.projectAssociations.length > 0 ? (
                selectedUser.projectAssociations
                  .slice(0, 2)
                  .map((project: any, index: number) => (
                    <Tooltip
                      title={project.project.name}
                      placement="bottom"
                      key={`${project.project.id}-${index}`}
                    >
                      <img
                        className="teammates__selectedProjectAvatar"
                        src={projectIcon}
                        alt="user-avatar"
                      />
                    </Tooltip>
                  ))
              ) : (
                <div>No projects found</div>
              )}
              {selectedUser && selectedUser?.projectAssociations.length > 2 && (
                <div className="teammates__plus_small">
                  {`+` +
                    selectedUser.projectAssociations.slice(
                      2,
                      selectedUser.projectAssociations.length
                    ).length}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {decodeExchangeToken().allowedRoles.includes(
        tenantUserRole.viewTenantUsers
      ) ||
      decodeExchangeToken().allowedRoles.includes(
        myCompanyUserRole.viewMyCompanyUsers
      ) ? (
        <>
          <CommonHeader headerInfo={header} />
          <div className="teammates__teammatesViewStyle">
            <div className="teammates__view-btn">
              {viewStyle === "grid" ? (
                <>
                  <Button
                    data-testid={"grid-view"}
                    variant="outlined"
                    className="toggle-primary"
                    onClick={() => handleViewStyle("grid")}
                    startIcon={<AppsIcon />}
                  >
                    Gallery view
                  </Button>
                  <div
                    className="l-view"
                    onClick={() => handleViewStyle("list")}
                  >
                    <ViewListIcon /> List view
                  </div>
                </>
              ) : (
                <>
                  <div
                    className="g-view"
                    onClick={() => handleViewStyle("grid")}
                  >
                    <AppsIcon />
                    Gallery view
                  </div>
                  <Button
                    data-testid={"list-view"}
                    variant="outlined"
                    className="toggle-primary"
                    onClick={() => handleViewStyle("list")}
                    startIcon={<ViewListIcon />}
                  >
                    List view
                  </Button>
                </>
              )}
            </div>

            <div className="teammates__right">
              <div className="teammates__right__search">
                <TextField
                  id="project-list-search-text"
                  type="text"
                  fullWidth
                  placeholder="Search"
                  autoComplete="off"
                  variant="outlined"
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <SearchIcon className="teammates__right__search__icon" />
                <div className="teammates__right__count">
                  Showing {teammates.length} entries
                </div>
              </div>
              {canInviteUsers() && (
                <div className="teammates__right__add-btn">
                  {
                    <Button
                      onClick={() => handleAddTeammateDialog()}
                      variant="outlined"
                      className="btn-primary"
                    >
                      Add new teammate
                    </Button>
                  }
                </div>
              )}
            </div>
          </div>

          {viewStyle == "grid" ? (
            <div className="teammates__gridView">
              <div className="teammates__gridView__grid">
                {teammates.length !== 0 &&
                  teammates.map((user: any, index: number) => (
                    <div
                      key={user.user.id}
                      onClick={() => handleSelectedUser(user)}
                      className="teammates__imageParent"
                    >
                      <img
                        className={
                          selectedUser?.user?.id === user.user.id
                            ? "teammates__avatar-icon__selected"
                            : "teammates__avatar-icon"
                        }
                        src={USER_AVATAR}
                        alt="user-avatar"
                      />

                      <div
                        className={
                          selectedUser?.user?.id === user.user.id
                            ? "teammates__userName__selected"
                            : "teammates__userName"
                        }
                      >
                        {user.user.firstName ? (
                          <Tooltip
                            title={
                              user.user.firstName + " " + user.user.lastName
                            }
                            placement="bottom"
                          >
                            <div>
                              {user.user.firstName} <br></br>
                              {user.user.lastName && user.user.lastName}
                              {user.user.id == decodeExchangeToken().userId
                                ? "(You)"
                                : ""}
                            </div>
                          </Tooltip>
                        ) : (
                          <Tooltip title={user.user.email} placement="bottom">
                            <div>
                              {truncateLongString(
                                user.user.email.split("@")[0]
                              )}
                            </div>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <TeammatesTable teammates={teammates} />
          )}
        </>
      ) : (
        <NoPermission
          header={"Teammates"}
          navigateBack={navigateBack}
          noPermissionMessage={noPermissionMessage}
        />
      )}
    </div>
  );
}
