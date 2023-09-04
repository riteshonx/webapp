import React, { ReactElement, useContext, useEffect, useState } from "react";
import { useDebounce } from "../../../../customhooks/useDebounce";
import {
  Avatar,
  Button,
  IconButton,
  TextField,
  Tooltip,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import SearchIcon from "@material-ui/icons/Search";
import "./UserSelect.scss";
import { stateContext } from "../../../root/context/authentication/authContext";
import { client } from "../../../../services/graphql";
import { myProjectRole } from "../../../../utils/role";
import {
  FETCH_PROJECT_ASSOCIATED_USERS,
  FETCH_PROJECT_ASSOCIATED_USERS_BY_FULL_NAME,
  FETCH__PROJECT_ROLE_ABOVE_VIEW,
} from "../../../baseService/graphql/queries/users";
import { AvatarGroup } from "@material-ui/lab";
import DeleteIcon from "@material-ui/icons/Delete";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import { projectContext } from "src/modules/baseService/formConsumption/Context/projectContext";

interface Props {
  save: (argValue: Array<string>) => void;
  featureId: number;
  users: Array<any>;
}

function AssigneeSelect({ save, users, featureId }: Props): ReactElement {
  const [searchedUserList, setSearchedUserList] = useState<Array<any>>([]);
  const [selectedUserIds, setselectedUserIds] = useState<Array<string>>([]);
  const [selectedUserDetails, setSelectedUserDetails] = useState<Array<string>>(
    []
  );
  const [searchName, setSearchName] = useState("");
  const debounceName = useDebounce(searchName, 300);
  const { state }: any = useContext(stateContext);
  const [allowedRoles, setAllowedRoles] = useState<Array<any>>([]);
  const [isEdit, setIsEdit] = useState(false);
  const { projectState }: any = useContext(projectContext);

  useEffect(() => {
    fetchProjectUsers();
  }, [debounceName]);

  useEffect(() => {
    const ids = users.map((item: any) => item.assignee);
    setselectedUserIds([...ids]);
    setSelectedUserDetails(JSON.parse(JSON.stringify(users)));
  }, [users]);

  const close = () => {
    setSearchName("");
    setSearchedUserList([]);
    setIsEdit(false);
    if (
      JSON.stringify(users) !== JSON.stringify(selectedUserDetails) &&
      selectedUserDetails.length > 0
    ) {
      save(selectedUserDetails);
    }
  };

  /**
   * Common method to stop event propogation and prevent default
   * @param event :
   */
  const stopPropogation = (
    event: React.MouseEvent<
      HTMLDivElement | HTMLButtonElement | SVGSVGElement,
      MouseEvent
    >
  ) => {
    event.stopPropagation();
    event.preventDefault();
  };

  /**
   * add and remove event listner when user click outside the follower select area
   */
  useEffect(() => {
    window.addEventListener("click", close);
    fetchPermittedRoles();
    return () => {
      window.removeEventListener("click", close);
    };
  }, []);

  const fetchPermittedRoles = async () => {
    try {
      const permittedRolesResponse: any = await client.query({
        query: FETCH__PROJECT_ROLE_ABOVE_VIEW,
        variables: {
          featureId: [featureId],
        },
        fetchPolicy: "network-only",
        context: { role: myProjectRole.viewMyProjects },
      });
      if (permittedRolesResponse.data.projectPermission.length > 0) {
        const targetList = permittedRolesResponse.data.projectPermission.map(
          (item: any) => item.roleId
        );
        setAllowedRoles(targetList);
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const fetchProjectUsers = async () => {
    if (debounceName.trim()) {
      try {
        const name = debounceName.split(/\s+/);
        let fName = debounceName;
        let lName = "";
        if (name.length > 1) {
          fName = name[0].trim();
          lName = name[1].trim() ? name[1].trim() : "";
        }
        const projectAssociationResponse = await client.query({
          query: lName
            ? FETCH_PROJECT_ASSOCIATED_USERS_BY_FULL_NAME
            : FETCH_PROJECT_ASSOCIATED_USERS,
          variables: {
            projectId: state.currentProject.projectId,
            fName: `${fName ? "%" + fName + "%" : fName}`,
            lName: `%${lName}%`,
          },
          fetchPolicy: "network-only",
          context: { role: myProjectRole.viewMyProjects },
        });
        const targetUsers: Array<any> = [];
        if (projectAssociationResponse.data.projectAssociation.length > 0) {
          projectAssociationResponse.data.projectAssociation.forEach(
            (item: any) => {
              if (allowedRoles.indexOf(item.role) > -1) {
                const user = {
                  assignee: item.user.id,
                  user: {
                    firstName: item.user.firstName,
                    lastName: item.user.lastName,
                    email: item.user.email,
                    status: item.status,
                  },
                };
                targetUsers.push(user);
              }
            }
          );
        }
        setSearchedUserList(targetUsers);
      } catch (err) {}
    }
  };

  const addNewFollower = (
    argItem: any,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    try {
      stopPropogation(event);
      const ids = [...selectedUserIds];
      const index = selectedUserIds.indexOf(argItem.assignee);
      const detailsITem: any = selectedUserDetails.find(
        (item: any) => item.assignee === argItem.assignee
      );
      const detailsIndex = selectedUserDetails.indexOf(detailsITem);
      if (detailsIndex !== -1 && selectedUserDetails.length > 0) {
        selectedUserDetails.splice(detailsIndex, 1);
        setSelectedUserDetails(selectedUserDetails);
      } else {
        if (ids.length < 39) {
          setSelectedUserDetails([...selectedUserDetails, argItem]);
        }
      }
      if (index !== -1 && ids.length > 0) {
        ids.splice(index, 1);
        setselectedUserIds(ids);
      } else {
        ids.push(argItem.assignee);
        setselectedUserIds(ids);
      }
    } catch (error: any) {
      console.log(error);
    }
  };
  const clearSelectedFollowers = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    stopPropogation(event);
    setSearchName("");
    setSearchedUserList([]);
    setIsEdit(false);
  };

  const saveUsersSelected = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    stopPropogation(event);
    setSearchName("");
    save(selectedUserDetails);
    setSearchedUserList([]);
    setIsEdit(false);
  };

  const addNewUserAssignee = (
    event: React.MouseEvent<HTMLDivElement | HTMLButtonElement, MouseEvent>
  ) => {
    stopPropogation(event);
    if (projectState?.featurePermissions?.canDeleteForm) {
      setIsEdit(true);
    }
  };

  const removeUser = (argItem: any, event: any) => {
    stopPropogation(event);
    const ids = [...selectedUserIds];
    const index = selectedUserIds.indexOf(argItem.assignee);
    const detailsITem: any = selectedUserDetails.find(
      (item: any) => item.assignee === argItem.assignee
    );
    const detailsIndex = selectedUserDetails.indexOf(detailsITem);
    if (index !== -1 && ids.length > 0) {
      ids.splice(index, 1);
      setselectedUserIds([...ids]);
    }
    if (detailsIndex !== -1 && selectedUserDetails.length > 0) {
      selectedUserDetails.splice(detailsIndex, 1);
      setSelectedUserDetails([...selectedUserDetails]);
    }
  };

  return (
    <div className="AssigneeSelect">
      {!isEdit ? (
        users.length > 0 ? (
          <AvatarGroup
            max={5}
            className="AssigneeSelect__search__avatargroup"
            onClick={(e) => addNewUserAssignee(e)}
          >
            {users.map((user: any, userIndex: number) => (
              <Tooltip
                key={`Icon-${userIndex}-${user.assignee}`}
                title={
                  user?.user.firstName
                    ? `${user?.user?.firstName} ${user?.user?.lastName}`
                    : `${user?.user?.email}`
                }
              >
                <Avatar
                  alt={
                    user?.user?.firstName
                      ? `${user?.user?.firstName} ${user?.user?.lastName}`
                      : `${user?.user?.email}`
                  }
                  src="/"
                />
              </Tooltip>
            ))}
          </AvatarGroup>
        ) : (
          <Tooltip title={"Click to add Assignee"}>
            <IconButton onClick={(e) => addNewUserAssignee(e)}>
              <AddCircleIcon />
            </IconButton>
          </Tooltip>
        )
      ) : (
        <>
          <div className="AssigneeSelect__search">
            <SearchIcon className="AssigneeSelect__search__icon" />
            <TextField
              value={searchName}
              id="user-usergroup-search"
              data-testid="currentstep-search"
              type="text"
              fullWidth
              autoFocus={true}
              onClick={(e) => stopPropogation(e)}
              placeholder="Search assignee"
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>

          <div className="AssigneeSelect__option">
            {selectedUserDetails.length > 0 && (
              <div className="AssigneeSelect__option__label">
                Selected ({selectedUserDetails.length})
              </div>
            )}
            <div className="AssigneeSelect__option__list">
              {selectedUserDetails.map((item: any, searchIndex: number) => (
                <div
                  key={item.assignee}
                  className="AssigneeSelect__option__list__item"
                  style={{
                    borderBottom: `${
                      selectedUserDetails.length - 1 === searchIndex
                        ? "none"
                        : ""
                    }`,
                  }}
                  onClick={(e) => stopPropogation(e)}
                >
                  <div className="AssigneeSelect__option__list__item__left">
                    <Avatar
                      src="/"
                      className="AssigneeSelect__option__list__item__left__icon"
                      alt={item.name}
                    />
                    <div className="AssigneeSelect__option__list__item__left__label">
                      <Tooltip
                        title={
                          item.user.firstName || item.user.lastName
                            ? `${item.user?.firstName} ${item?.user.lastName}`
                            : item.user.email.split("@")[0]
                        }
                      >
                        <div className="AssigneeSelect__option__list__item__left__label__name">
                          {item.user.firstName || item.user.lastName
                            ? `${item?.user?.firstName} ${item?.user?.lastName}`
                            : item.user.email.split("@")[0]}
                        </div>
                      </Tooltip>
                      <Tooltip title={item.user.email}>
                        <div className="AssigneeSelect__option__list__item__left__label__email">
                          {item.user.email}
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="AssigneeSelect__option__list__item__right">
                    {selectedUserDetails.length > 1 && (
                      <IconButton
                        onClick={(event) => removeUser(item, event)}
                        data-testid="currentstep-checked"
                        className="AssigneeSelect__option__list__item__right__remove"
                      >
                        <DeleteIcon className="AssigneeSelect__option__list__item__right__remove__icon" />
                      </IconButton>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {searchedUserList.length > 0 && (
              <div className="AssigneeSelect__option__label">Add Assignee</div>
            )}
            <div className="AssigneeSelect__option__list">
              {searchedUserList.map((item: any, searchIndex: number) => (
                <div
                  key={item.assignee}
                  className="AssigneeSelect__option__list__item"
                  style={{
                    borderBottom: `${
                      searchedUserList.length - 1 === searchIndex ? "none" : ""
                    }`,
                  }}
                  onClick={(e) => stopPropogation(e)}
                >
                  <div className="AssigneeSelect__option__list__item__left">
                    <Avatar
                      src="/"
                      className="AssigneeSelect__option__list__item__left__icon"
                      alt={item.name}
                    />
                    <div className="AssigneeSelect__option__list__item__left__label">
                      <Tooltip
                        title={
                          item.user.firstName || item.user.lastName
                            ? `${item.user?.firstName} ${item?.user.lastName}`
                            : item.user.email.split("@")[0]
                        }
                      >
                        <div className="AssigneeSelect__option__list__item__left__label__name">
                          {item.user.firstName || item.user.lastName
                            ? `${item?.user?.firstName} ${item?.user?.lastName}`
                            : item.user.email.split("@")[0]}
                        </div>
                      </Tooltip>
                      <Tooltip title={item.user.email}>
                        <div className="AssigneeSelect__option__list__item__left__label__email">
                          {item.user.email}
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="AssigneeSelect__option__list__item__right">
                    {selectedUserIds.indexOf(item.assignee) > -1 ? (
                      <IconButton
                        disabled={selectedUserIds.indexOf(item.assignee) > -1}
                        data-testid="currentstep-checked"
                        className="AssigneeSelect__option__list__item__right__remove"
                      >
                        <CheckCircleIcon className="AssigneeSelect__option__list__item__right__remove__icon" />
                      </IconButton>
                    ) : (
                      <IconButton
                        onClick={(event) => addNewFollower(item, event)}
                        className="AssigneeSelect__option__list__item__right__add"
                        data-testid="currentstep-add"
                      >
                        <AddIcon className="AssigneeSelect__option__list__item__right__add__icon" />
                      </IconButton>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {JSON.stringify(users) !== JSON.stringify(selectedUserDetails) && (
              <div className="AssigneeSelect__option__actions">
                <Button
                  className="AssigneeSelect__option__actions__btn"
                  data-testid="clearall"
                  onClick={(e) => clearSelectedFollowers(e)}
                >
                  Cancel
                </Button>
                <Button
                  className="AssigneeSelect__option__actions__btn"
                  disabled={selectedUserDetails.length === 0}
                  onClick={(e) => saveUsersSelected(e)}
                  data-testid="save-changes"
                >
                  Save{" "}
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default AssigneeSelect;
