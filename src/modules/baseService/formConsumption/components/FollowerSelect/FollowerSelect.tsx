import React, { ReactElement, useContext, useEffect, useState } from "react";
import "./FollowerSelect.scss";
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
import ClearIcon from "@material-ui/icons/Clear";
import DeleteIcon from "@material-ui/icons/Delete";
import FollowruserGroupDetails from "../FollowersUserGroup/FollowersUserGroup";
import { match, useRouteMatch } from "react-router-dom";
import { client } from "../../../../../services/graphql";
import {
  ADD_TENANT_USERGROUP_FOLLOWERS,
  ADD_TENANT_USER_FOLLOWERS,
  DELETE_FORM_USER_GROUPS,
  DELETE_TENANT_USERS,
  LOAD_FORM_USERS,
  LOAD_FORM_USER_GROUPS,
  LOAD_PROJECT_USERS,
  LOAD_PROJECT_USERS_BY_FULLNAME,
  LOAD_PROJECT_USER_GROUPS,
} from "../../graphql/queries/followers";
import { useDebounce } from "../../../../../customhooks/useDebounce";
import AvatarGroup from "@material-ui/lab/AvatarGroup";
import PeopleIcon from "@material-ui/icons/People";
import { projectContext } from "../../Context/projectContext";
import { FollowerTye } from "../../../../../utils/constants";
import { decodeExchangeToken } from "../../../../../services/authservice";
import { featureFormRoles } from "../../../../../utils/role";
import { stateContext } from "src/modules/root/context/authentication/authContext";

export interface Params {
  id: string;
  featureId: string;
  formId: string;
}

interface IFollowerProps {
  type: FollowerTye;
  setValue: (argValue: Array<any>) => void;
  refresh: boolean;
  clear: () => void;
}

function FollowerSelect({
  type,
  setValue,
  refresh,
  clear,
}: IFollowerProps): ReactElement {
  const [showFollwers, setShowFollwers] = useState(false);
  const [followersIdList, setFollowersIdList] = useState<Array<any>>([]);
  const [showAddFollowers, setShowAddFollowers] = useState(false);
  const [newFollowersAdded, setNewFollowersAdded] = useState<Array<any>>([]);
  const [followersAddedNewlyDetails, setFollowersAddedNewlyDetails] = useState<
    Array<any>
  >([]);
  const [searchName, setSearchName] = useState("");
  const pathMatch: match<Params> = useRouteMatch();
  const debounceName = useDebounce(searchName, 400);
  const [searchedUserList, setSearchedUserList] = useState<Array<any>>([]);
  const [followersDetailsList, setFollowersDetailsList] = useState<Array<any>>(
    []
  );
  const [showFollowersSelected, setshowFollowersSelected] = useState(false);
  const { projectState }: any = useContext(projectContext);
  const { state }: any = useContext(stateContext);

  useEffect(() => {
    if (state?.selectedProjectToken && type !== FollowerTye.CREATE) {
      fetchUsersAndGroups();
    }
  }, [state?.selectedProjectToken, type]);

  useEffect(() => {
    if (showAddFollowers) {
      if (debounceName) {
        fetchProjectUserAndUserGroups();
      } else {
        setSearchedUserList([]);
      }
    }
  }, [debounceName]);

  useEffect(() => {
    if (refresh) {
      fetchUsersAndGroups();
      clear();
    }
  }, [refresh]);

  useEffect(() => {
    setValue(followersIdList);
  }, [followersIdList]);

  /**
   * fetch followers of the form
   */
  const fetchUsersAndGroups = async () => {
    try {
      const promiseList = [];
      const role =
        type === FollowerTye.CREATE
          ? featureFormRoles.createForm
          : type === FollowerTye.UPDATE
          ? featureFormRoles.updateForm
          : featureFormRoles.viewForm;
      promiseList.push(
        client.query({
          query: LOAD_FORM_USERS,
          variables: { formId: Number(pathMatch.params.formId) },
          fetchPolicy: "network-only",
          context: { role, token: state?.selectedProjectToken },
        })
      );
      promiseList.push(
        client.query({
          query: LOAD_FORM_USER_GROUPS,
          variables: { formId: Number(pathMatch.params.formId) },
          fetchPolicy: "network-only",
          context: { role, token: state?.selectedProjectToken },
        })
      );
      const response: any = await Promise.all(promiseList);
      const usersList: any[] = [];
      const selectIds: any[] = [];
      if (response.length > 0) {
        response[0].data.formsFollower.forEach((item: any) => {
          selectIds.push(item.userId);
          let name = "";
          if (item?.user?.status === 2) {
            name = item?.user?.email.split("@")[0];
          } else {
            name = `${item?.user?.firstName || ""} ${
              item?.user?.lastName || ""
            } `;
          }
          if (item?.user?.status !== 1 && item?.user) {
            usersList.push({
              id: item.userId,
              name: name,
              email: item?.user?.email,
              type: 1,
            });
          }
        });
      }
      if (response.length > 1) {
        response[1].data.formsUserGroup.forEach((item: any) => {
          selectIds.push(item.userGroupId);
          const groupserList: Array<any> = [];
          item.userGroup.groupUsers.forEach((useritem: any) => {
            let name = "";
            if (useritem.users.status === 2) {
              name = useritem.users.email.split("@")[0];
            } else {
              name = `${useritem.users.firstName || ""} ${
                useritem.users.lastName || ""
              } `;
            }
            if (useritem.users.status !== 1) {
              const user = {
                id: useritem.users?.id,
                name,
                email: useritem.users?.email || "",
                status: useritem.users.status,
              };
              groupserList.push(user);
            }
          });
          usersList.push({
            id: item.userGroupId,
            name: item.userGroup?.name || "",
            email: "",
            type: 2,
            users: groupserList,
          });
        });
      }
      setFollowersIdList(selectIds);
      setFollowersDetailsList(usersList);
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * fetch the project users and user groups
   */
  const fetchProjectUserAndUserGroups = async () => {
    try {
      const role =
        type === FollowerTye.CREATE
          ? featureFormRoles.createForm
          : type === FollowerTye.UPDATE
          ? featureFormRoles.updateForm
          : featureFormRoles.viewForm;
      const promiseList = [];
      const name = debounceName.split(/\s+/);
      let fName = debounceName;
      let lName = "";
      if (name.length > 1) {
        fName = name[0].trim();
        lName = name[1].trim() ? name[1].trim() : "";
      }
      promiseList.push(
        client.query({
          query: lName ? LOAD_PROJECT_USERS_BY_FULLNAME : LOAD_PROJECT_USERS,
          variables: {
            fName: `${fName ? "%" + fName + "%" : fName}`,
            lName: `%${lName}%`,
          },
          fetchPolicy: "network-only",
          context: { role: role, token: state?.selectedProjectToken },
        })
      );
      promiseList.push(
        client.query({
          query: LOAD_PROJECT_USER_GROUPS,
          variables: {
            fName: `${fName ? "%" + fName + "%" : fName}`,
            lName: `%${lName}%`,
          },
          fetchPolicy: "network-only",
          context: { role: role, token: state?.selectedProjectToken },
        })
      );
      const response: any = await Promise.all(promiseList);
      const usersAndGroupsList: Array<any> = [];
      if (response.length > 0) {
        if (response[0].data.user.length > 0) {
          response[0].data.user.forEach((element: any) => {
            if (element.id !== decodeExchangeToken().userId) {
              let name = "";
              if (element.status === 2) {
                name = element.email.split("@")[0];
              } else {
                name = `${element.firstName || ""} ${element.lastName || ""} `;
              }
              const newItem = {
                id: element.id,
                name,
                email: element.email,
                type: 1,
                users: [],
              };
              usersAndGroupsList.push(newItem);
            }
          });
        }
      }
      if (response.length > 1) {
        if (response[1].data.userGroup.length > 0) {
          response[1].data.userGroup.forEach((element: any) => {
            const groupUserList: any[] = [];
            element.groupUsers.forEach((useritem: any) => {
              let name = "";
              if (useritem.users.status === 2) {
                name = useritem.users?.email.split("@")[0];
              } else {
                name = `${useritem.users.firstName || ""} ${
                  useritem.users.lastName || ""
                } `;
              }
              if (useritem.users.status !== 1) {
                const user = {
                  id: useritem.users?.id,
                  name,
                  email: useritem.users?.email || "",
                  status: useritem.users.status,
                };
                groupUserList.push(user);
              }
            });
            usersAndGroupsList.push({
              id: element?.id,
              name: element?.name || "",
              email: "",
              type: 2,
              users: groupUserList,
            });
          });
        }
      }
      setSearchedUserList(usersAndGroupsList);
    } catch (error: any) {
      console.log(error.message);
    }
  };

  /**
   * Handle the click outside the follower select
   */
  const close = () => {
    setShowFollwers(false);
    setShowAddFollowers(false);
    setSearchName("");
    setSearchedUserList([]);
    setNewFollowersAdded([]);
    setFollowersAddedNewlyDetails([]);
  };

  /**
   * Method totoggle followers dropdown when clicked on slect placeholder
   * @param event : React.MouseEvent<HTMLDivElement, MouseEvent>
   */
  const toggleList = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    event.preventDefault();
    if (type !== FollowerTye.VIEW) {
      if (followersIdList.length > 0 && !showAddFollowers) {
        setShowFollwers(!showFollwers);
      } else {
        setShowAddFollowers(!showAddFollowers);
      }
    } else {
      setShowFollwers(!showFollwers);
    }
    setSearchName("");
    setSearchedUserList([]);
    setNewFollowersAdded([]);
    setFollowersAddedNewlyDetails([]);
  };

  /**
   * add and remove event listner when user click outside the follower select area
   */
  useEffect(() => {
    window.addEventListener("click", close);
    return () => {
      window.removeEventListener("click", close);
    };
  }, []);

  /**
   * Method to remove the user/ user group from the followers list
   * @param argValue : any
   * @param event : React.MouseEvent<HTMLDivElement, MouseEvent>
   */
  const removeUserromFollowers = (
    argValue: any,
    event: React.MouseEvent<HTMLDivElement | HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    event.preventDefault();
    if (type === FollowerTye.UPDATE) {
      if (typeof argValue.id === "string") {
        removeUser(argValue);
      } else {
        removeUserGroup(argValue);
      }
    } else {
      const currentValue = followersIdList.find(
        (item: any) => item === argValue.id
      );
      const currentDetails = followersDetailsList.find(
        (item) => item.id === argValue.id
      );
      const index = followersIdList.indexOf(currentValue);
      const ValueIndex = followersDetailsList.indexOf(currentDetails);
      const idList = [...followersIdList];
      const detailsList = [...followersDetailsList];
      if (index > -1 && ValueIndex > -1) {
        idList.splice(index, 1);
        detailsList.splice(ValueIndex, 1);
        setFollowersDetailsList([...detailsList]);
        setFollowersIdList([...idList]);
      }
    }
  };

  /**
   * Remove userGroup from followers
   * @param argValue : any
   */
  const removeUserGroup = async (argValue: any) => {
    try {
      const reponse = await client.mutate({
        mutation: DELETE_FORM_USER_GROUPS,
        variables: {
          formInstanceId: Number(pathMatch.params.formId),
          userGroupId: argValue.id,
        },
        context: {
          role: featureFormRoles.updateForm,
          token: state?.selectedProjectToken,
        },
      });
      if (reponse.data.delete_formsUserGroup.affected_rows) {
        removeSelectedItem(argValue);
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  /**
   * Remove user from followers
   * @param argValue : any
   */
  const removeUser = async (argValue: any) => {
    try {
      const reponse = await client.mutate({
        mutation: DELETE_TENANT_USERS,
        variables: {
          formId: Number(pathMatch.params.formId),
          userId: argValue.id,
        },
        context: {
          role: featureFormRoles.updateForm,
          token: state?.selectedProjectToken,
        },
      });
      if (reponse.data.delete_formsFollower.affected_rows) {
        removeSelectedItem(argValue);
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  /**
   * Remove the item
   * @param argValue : any
   */
  const removeSelectedItem = (argValue: any) => {
    const index = followersIdList.indexOf(argValue.id);
    if (index > -1) {
      followersIdList.splice(index, 1);
      setFollowersIdList([...followersIdList]);
      followersDetailsList.splice(index, 1);
      setFollowersDetailsList([...followersDetailsList]);
    }
  };

  /**
   * Add new user to the add followers list
   * @param argValue : any
   * @param event : React.MouseEvent<HTMLDivElement, MouseEvent>
   */
  const addNewFollower = (
    argValue: any,
    event: React.MouseEvent<
      HTMLDivElement | SVGSVGElement | HTMLButtonElement,
      MouseEvent
    >
  ) => {
    stopPropogation(event);
    const followerIndex = followersIdList.indexOf(argValue.id);
    if (followerIndex === -1) {
      const index = newFollowersAdded.indexOf(argValue.id);
      const ids = [...newFollowersAdded];
      const urersList = [...followersAddedNewlyDetails];
      const currentValue = followersAddedNewlyDetails.filter(
        (follower: any) => follower.id === argValue.id
      );
      const currentIndex = followersAddedNewlyDetails.indexOf(currentValue[0]);
      if (currentIndex > -1) {
        urersList.splice(currentIndex, 1);
        setFollowersAddedNewlyDetails([...urersList]);
      } else {
        setFollowersAddedNewlyDetails([...urersList, argValue]);
      }
      if (index > -1) {
        ids.splice(index, 1);
        setNewFollowersAdded([...ids]);
      } else {
        setNewFollowersAdded([...ids, argValue.id]);
      }
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
   * Method to save the selected users and usergroups to the the form
   * @param event :React.MouseEvent<HTMLDivElement | HTMLButtonElement, MouseEvent>
   */
  const saveFollowers = async (
    event: React.MouseEvent<HTMLDivElement | HTMLButtonElement, MouseEvent>
  ) => {
    stopPropogation(event);
    if (type === FollowerTye.CREATE) {
      const idList = [...followersIdList];
      const newList = newFollowersAdded.filter(
        (item) => idList.indexOf(item) === -1
      );
      idList.push(...newList);
      setFollowersIdList(idList);
      const selectedValues = [...followersDetailsList];
      selectedValues.push(...followersAddedNewlyDetails);
      setFollowersDetailsList([...selectedValues]);
      setShowFollwers(true);
      setShowAddFollowers(false);
      setNewFollowersAdded([]);
      setFollowersAddedNewlyDetails([]);
      setSearchedUserList([]);
      setSearchName("");
    } else {
      try {
        const usersList: Array<string> = [];
        const userGroupList: Array<number> = [];
        newFollowersAdded.forEach((item: any) => {
          if (typeof item === "string" && followersIdList.indexOf(item) < 0) {
            usersList.push(item);
          } else if (
            typeof item === "number" &&
            followersIdList.indexOf(item) < 0
          ) {
            userGroupList.push(item);
          }
        });
        const promiseList = [];
        if (usersList.length > 0) {
          promiseList.push(
            client.mutate({
              mutation: ADD_TENANT_USER_FOLLOWERS,
              variables: {
                featureId: Number(pathMatch.params.featureId),
                formId: Number(pathMatch.params.formId),
                userIds: usersList,
              },
              context: {
                role: featureFormRoles.updateForm,
                token: state?.selectedProjectToken,
              },
            })
          );
        }
        if (userGroupList.length > 0) {
          promiseList.push(
            client.mutate({
              mutation: ADD_TENANT_USERGROUP_FOLLOWERS,
              variables: {
                featureId: Number(pathMatch.params.featureId),
                formId: Number(pathMatch.params.formId),
                userGroupIds: userGroupList,
              },
              context: {
                role: featureFormRoles.updateForm,
                token: state?.selectedProjectToken,
              },
            })
          );
        }
        if (promiseList.length > 0) {
          await Promise.all(promiseList);
          setShowFollwers(true);
          setShowAddFollowers(false);
          setNewFollowersAdded([]);
          setFollowersAddedNewlyDetails([]);
          setSearchedUserList([]);
          setSearchName("");
          fetchUsersAndGroups();
        } else {
          setShowFollwers(true);
          setSearchedUserList([]);
          setShowAddFollowers(false);
          setNewFollowersAdded([]);
          setFollowersAddedNewlyDetails([]);
          setSearchName("");
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  /**
   * Method to open the add new followers section
   */
  const openAddNewFollowers = () => {
    setShowFollwers(false);
    setShowAddFollowers(true);
    setNewFollowersAdded([...followersIdList]);
    setFollowersAddedNewlyDetails([]);
    if (followersIdList.length > 0) {
      setNewFollowersAdded([...followersIdList]);
      setFollowersAddedNewlyDetails([]);
    }
  };

  /**
   * Method to clear all selected users and usergroups to the forms
   * @param event :React.MouseEvent<HTMLDivElement | HTMLButtonElement, MouseEvent>
   */
  const clearSelectedFollowers = (
    event: React.MouseEvent<HTMLDivElement | HTMLButtonElement, MouseEvent>
  ) => {
    stopPropogation(event);
    setNewFollowersAdded([]);
    setFollowersAddedNewlyDetails([]);
    setSearchedUserList([]);
    setSearchName("");
    setShowFollwers(true);
    setShowAddFollowers(false);
  };

  /**
   * Method to render the followers avatar
   */
  const renderFollowers = () => {
    const renderUsers = followersDetailsList.filter(
      (item) => followersIdList.indexOf(item.id) > -1
    );
    return (
      <AvatarGroup max={3}>
        {renderUsers.map((item: any) => (
          <Tooltip title={item.name} key={`Icon-${item.id}`}>
            <Avatar alt={item.name} src="/" />
          </Tooltip>
        ))}
      </AvatarGroup>
    );
  };

  const clearSearchOption = (
    event: React.MouseEvent<SVGSVGElement, MouseEvent>
  ) => {
    stopPropogation(event);
    setSearchName("");
  };

  const startFollowingCurrentUser = async (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    try {
      stopPropogation(event);
      const userDetails = decodeExchangeToken();
      if (type === FollowerTye.CREATE) {
        const index = followersIdList.indexOf(userDetails.userId);
        if (index > -1) {
          followersIdList.splice(index, 1);
          setFollowersIdList([...followersIdList]);
          followersDetailsList.splice(index, 1);
          setFollowersDetailsList([...followersDetailsList]);
        } else {
          setFollowersIdList([...followersIdList, userDetails.userId]);
          const newItem = {
            id: userDetails.userId,
            name: userDetails.userName,
            email: userDetails.userEmail,
            type: 1,
            users: [],
          };
          setFollowersDetailsList([...followersDetailsList, newItem]);
        }
      } else {
        await client.mutate({
          mutation: ADD_TENANT_USER_FOLLOWERS,
          variables: {
            featureId: Number(pathMatch.params.featureId),
            formId: Number(pathMatch.params.formId),
            userIds: [userDetails.userId],
          },
          context: {
            role: featureFormRoles.viewForm,
            token: state?.selectedProjectToken,
          },
        });
        setShowFollwers(true);
        setShowAddFollowers(false);
        setNewFollowersAdded([]);
        setFollowersAddedNewlyDetails([]);
        setSearchedUserList([]);
        setSearchName("");
        fetchUsersAndGroups();
      }
    } catch (error: any) {}
  };

  const stopFollowingCurrentUser = async (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.stopPropagation();
    event.preventDefault();
    const userDetails = decodeExchangeToken();
    if (type !== FollowerTye.CREATE) {
      try {
        const reponse = await client.mutate({
          mutation: DELETE_TENANT_USERS,
          variables: {
            formId: Number(pathMatch.params.formId),
            userId: userDetails.userId,
          },
          context: {
            role: featureFormRoles.viewForm,
            token: state?.selectedProjectToken,
          },
        });
        if (reponse.data.delete_formsFollower.affected_rows) {
          removeSelectedItem({ id: userDetails.userId });
        }
      } catch (error: any) {
        console.log(error.message);
      }
    } else {
      const index = followersIdList.indexOf(userDetails.userId);
      const idList = [...followersIdList];
      idList.splice(index, 1);
      const details = followersDetailsList.find(
        (item) => item.id === userDetails.userId
      );
      const ValueIndex = followersDetailsList.indexOf(details);
      const detailsList = [...followersDetailsList];
      detailsList.splice(ValueIndex, 1);
      setFollowersDetailsList([...detailsList]);
      setFollowersIdList([...idList]);
    }
  };

  const removeUserFromSelected = (argItem: any) => {
    const index = newFollowersAdded.indexOf(argItem.id);
    const ids = [...newFollowersAdded];
    const urersList = [...followersAddedNewlyDetails];
    const currentValue = followersAddedNewlyDetails.filter(
      (follower: any) => follower.id === argItem.id
    );
    const currentIndex = followersAddedNewlyDetails.indexOf(currentValue[0]);
    if (currentIndex > -1) {
      urersList.splice(currentIndex, 1);
      setFollowersAddedNewlyDetails([...urersList]);
    }
    if (index > -1) {
      ids.splice(index, 1);
      setNewFollowersAdded([...ids]);
    }
  };

  return (
    <div className="follower">
      <div className="follower__container">
        <div className="follower__container__selected" onClick={toggleList}>
          <div className="follower__container__selected__values">
            {" "}
            {followersIdList.length > 0 ? (
              <div className="follower__container__selected__values__list">
                {renderFollowers()}
                <div className="follower__container__selected__values__list__label">
                  Followers
                </div>
              </div>
            ) : showAddFollowers || showFollwers ? (
              <label className="follower__container__selected__values__list__inactive">
                + Add Followers
              </label>
            ) : (
              <label className="follower__container__selected__values__list__inactive">
                + Add Followers
              </label>
            )}{" "}
          </div>
        </div>
        {showAddFollowers ? (
          <div
            className={`follower__container__addfollowers ${
              type === FollowerTye.VIEW ? " view" : " addupdate"
            }`}
          >
            <div className="follower__container__addfollowers__search">
              <SearchIcon className="follower__container__addfollowers__search__icon" />
              <TextField
                value={searchName}
                autoFocus
                id="user-usergroup-search"
                data-testid="usersearch"
                type="text"
                fullWidth
                onClick={(e) => stopPropogation(e)}
                placeholder="Add users or user groups"
                onChange={(e) => setSearchName(e.target.value)}
              />
              <ClearIcon
                onClick={(e) => clearSearchOption(e)}
                className="follower__container__addfollowers__search__close"
              />
            </div>
            <div className="follower__container__addfollowers__addheader">
              {followersIdList.indexOf(decodeExchangeToken().userId) > -1
                ? projectState?.featurePermissions?.canViewForm && (
                    <div onClick={(e) => stopFollowingCurrentUser(e)}>
                      Stop following
                    </div>
                  )
                : projectState?.featurePermissions?.canViewForm && (
                    <div onClick={(e) => startFollowingCurrentUser(e)}>
                      + Start following
                    </div>
                  )}
            </div>
            {followersAddedNewlyDetails.length > 0 && (
              <div
                onClick={(e) => stopPropogation(e)}
                className="follower__container__addfollowers__option"
              >
                <div
                  onClick={(e) => stopPropogation(e)}
                  className="follower__container__addfollowers__option__addheader"
                >
                  Selected{" "}
                  {`${
                    followersAddedNewlyDetails.length > 0
                      ? "(" + followersAddedNewlyDetails.length + ")"
                      : ""
                  }`}
                </div>
                <div className="follower__container__addfollowers__option__list">
                  {followersAddedNewlyDetails.map(
                    (item: any, searchIndex: number) => (
                      <div
                        key={`search-item-${item.id}`}
                        className="follower__container__addfollowers__option__list__item"
                        style={{
                          borderBottom: `${
                            searchedUserList.length - 1 === searchIndex
                              ? "none"
                              : ""
                          }`,
                        }}
                        onClick={(e) => stopPropogation(e)}
                      >
                        <div className="follower__container__addfollowers__option__list__item__left">
                          {item.type === 1 ? (
                            <Avatar
                              src="/"
                              className="follower__container__addfollowers__option__list__item__left__icon"
                              alt={item.name}
                            />
                          ) : (
                            <PeopleIcon className="follower__container__addfollowers__option__list__item__left__groupIcon" />
                          )}
                          <div className="follower__container__addfollowers__option__list__item__left__label">
                            <div className="follower__container__addfollowers__option__list__item__left__label__name">
                              {item.name}{" "}
                              {item.type === 2 ? (
                                <>({item.users.length})</>
                              ) : (
                                ""
                              )}
                            </div>
                            <div className="follower__container__addfollowers__option__list__item__left__label__email">
                              {item.email}
                            </div>
                          </div>
                          {item.type === 2 ? (
                            <FollowruserGroupDetails group={item} />
                          ) : (
                            ""
                          )}
                        </div>
                        <div className="follower__container__addfollowers__option__list__item__right">
                          <IconButton
                            onClick={() => removeUserFromSelected(item)}
                            className="follower__container__addfollowers__option__list__item__right__remove"
                          >
                            <DeleteIcon className="follower__container__addfollowers__option__list__item__right__remove__icon" />
                          </IconButton>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
            <div className="follower__container__addfollowers__option">
              {searchedUserList.length > 0 && (
                <div
                  onClick={(e) => stopPropogation(e)}
                  className="follower__container__addfollowers__option__header"
                >
                  Add followers
                </div>
              )}
              <div className="follower__container__addfollowers__option__list">
                {searchedUserList.map((item: any, searchIndex: number) => (
                  <div
                    key={`search-${item.id}`}
                    className="follower__container__addfollowers__option__list__item"
                    style={{
                      borderBottom: `${
                        searchedUserList.length - 1 === searchIndex
                          ? "none"
                          : ""
                      }`,
                    }}
                    onClick={(e) => stopPropogation(e)}
                  >
                    <div className="follower__container__addfollowers__option__list__item__left">
                      {item.type === 1 ? (
                        <Avatar
                          src="/"
                          className="follower__container__addfollowers__option__list__item__left__icon"
                          alt={item.name}
                        />
                      ) : (
                        <PeopleIcon className="follower__container__addfollowers__option__list__item__left__groupIcon" />
                      )}
                      <div className="follower__container__addfollowers__option__list__item__left__label">
                        <div className="follower__container__addfollowers__option__list__item__left__label__name">
                          {item.name}{" "}
                          {item.type === 2 ? <>({item.users.length})</> : ""}
                        </div>
                        <div className="follower__container__addfollowers__option__list__item__left__label__email">
                          {item.email}
                        </div>
                      </div>
                      {item.type === 2 ? (
                        <FollowruserGroupDetails group={item} />
                      ) : (
                        ""
                      )}
                    </div>
                    <div className="follower__container__addfollowers__option__list__item__right">
                      {projectState?.featurePermissions?.canCreateForm ? (
                        newFollowersAdded.indexOf(item.id) > -1 ||
                        followersIdList.indexOf(item.id) > -1 ? (
                          <IconButton
                            disabled={true}
                            className="follower__container__addfollowers__option__list__item__right__remove"
                          >
                            <CheckCircleIcon className="follower__container__addfollowers__option__list__item__right__remove__icon" />
                          </IconButton>
                        ) : (
                          <IconButton
                            onClick={(event) => addNewFollower(item, event)}
                            className="follower__container__addfollowers__option__list__item__right__add"
                          >
                            <AddIcon className="follower__container__addfollowers__option__list__item__right__add__icon" />
                          </IconButton>
                        )
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {followersAddedNewlyDetails.length > 0 && (
                <div className="follower__container__addfollowers__option__actions">
                  <Button
                    className="follower__container__addfollowers__option__actions__btn"
                    data-testid="clearall"
                    onClick={(e) => clearSelectedFollowers(e)}
                  >
                    Clear All
                  </Button>
                  <Button
                    className="follower__container__addfollowers__option__actions__btn"
                    onClick={(e) => saveFollowers(e)}
                    data-testid="clearall"
                    disabled={newFollowersAdded.length === 0}
                  >
                    Save
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          ""
        )}

        {showFollwers ? (
          <div
            className={`follower__container__option ${
              type === FollowerTye.VIEW ? " view" : " addupdate"
            }`}
          >
            <div
              className="follower__container__option__header"
              onClick={(e) => stopPropogation(e)}
            >
              <div className="follower__container__option__header__left">
                Followers (
                {`${followersIdList.length > 0 ? followersIdList.length : "0"}`}
                )
              </div>
              {type !== FollowerTye.VIEW ? (
                <div
                  className="follower__container__option__header__right"
                  onClick={openAddNewFollowers}
                >
                  <AddIcon className="follower__container__option__header__right__icon" />
                  <div className="follower__container__option__header__right__label">
                    Add followers
                  </div>
                </div>
              ) : (
                ""
              )}
            </div>
            {followersIdList.indexOf(decodeExchangeToken().userId) > -1
              ? projectState?.featurePermissions?.canViewForm && (
                  <div
                    onClick={(e) => stopFollowingCurrentUser(e)}
                    className="follower__container__option__addheader"
                  >
                    Stop following
                  </div>
                )
              : projectState?.featurePermissions?.canViewForm && (
                  <div
                    onClick={(e) => startFollowingCurrentUser(e)}
                    className="follower__container__option__addheader"
                  >
                    + Start following
                  </div>
                )}
            <div className="follower__container__option__values">
              {followersDetailsList.length > 0 ? (
                followersDetailsList.map((item: any, selectIndex: number) => (
                  <div
                    key={`existing-followers-${item.id}`}
                    className="follower__container__option__values__item"
                    style={{
                      borderBottom: `${
                        followersDetailsList.length - 1 === selectIndex
                          ? "none"
                          : ""
                      }`,
                    }}
                    onClick={(e) => stopPropogation(e)}
                  >
                    <div className="follower__container__option__values__item__left">
                      {item.type === 1 ? (
                        <Avatar
                          src="/"
                          className="follower__container__option__values__item__left__icon"
                          alt={item.name}
                        />
                      ) : (
                        <PeopleIcon className="follower__container__option__values__item__left__groupIcon" />
                      )}
                      <div className="follower__container__option__values__item__left__label">
                        <div className="follower__container__option__values__item__left__label__name">
                          {item.name}{" "}
                          {item.type === 2 ? <>({item.users.length})</> : ""}{" "}
                          {item.id === decodeExchangeToken().userId
                            ? "(You)"
                            : ""}
                        </div>
                        <div className="follower__container__option__values__item__left__label__email">
                          {item.email}
                        </div>
                      </div>
                      {item.type === 2 ? (
                        <FollowruserGroupDetails group={item} />
                      ) : (
                        ""
                      )}
                    </div>
                    {projectState?.featurePermissions?.canUpdateForm ? (
                      type !== FollowerTye.VIEW ? (
                        <IconButton
                          onClick={(e) => removeUserromFollowers(item, e)}
                          className="follower__container__option__values__item__right"
                        >
                          <DeleteIcon className="follower__container__option__values__item__right__icon" />
                        </IconButton>
                      ) : (
                        ""
                      )
                    ) : (
                      ""
                    )}
                  </div>
                ))
              ) : (
                <div className="follower__container__option__values__noitem">
                  No followers
                </div>
              )}
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}

export default FollowerSelect;
