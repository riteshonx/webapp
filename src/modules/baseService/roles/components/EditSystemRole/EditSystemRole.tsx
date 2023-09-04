import { Button, FormControl, Grid, MenuItem, Select } from '@material-ui/core';
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { useDebounce } from '../../../../../customhooks/useDebounce';
import { client } from '../../../../../services/graphql';
import { tenantRoles } from '../../../../../utils/role';
import { setIsLoading } from '../../../../root/context/authentication/action';
import { stateContext } from '../../../../root/context/authentication/authContext';
import Notification, {
  AlertTypes,
} from '../../../../shared/components/Toaster/Toaster';
import { CustomPopOver } from '../../../../shared/utils/CustomPopOver';
import {
  FETCH_SYSTEM_ROLE_BY_ID,
  FETCH_SYSTEM_ROLE_PERMISSION,
  LOAD_TENANT_ROLE_BY_NAME,
  LOAD_TENANT_ROLE_FEATURE,
  UPDATE_ROLE,
} from '../../graphql/queries/role';
import {
  Permission,
  PermissionsType,
  PermissionType,
  RoleFeature,
  RolePayload,
  RoleTye,
  userPermissionList,
} from '../../models/role';
import { getAuthValue } from '../../utils/helper';
import RoleRadioGroup from '../RoleRadioGroup/RoleRadioGroup';
import './EditSystemRole.scss';

interface IProps {
  roleId: number;
  close: (argValue: boolean) => void;
  open: boolean;
  isView: boolean;
}

function EditSystemRole({ close, open, roleId, isView }: IProps): ReactElement {
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [roleNameDuplicate, setRoleNameDuplicate] = useState(false);
  const [roleNameRequired, setRoleNameRequired] = useState(false);
  const [companyRelationShip, setCompanyRelationShip] =
    useState<PermissionType>(PermissionType.entireAccount);
  const [userRelationship, setUserRelationship] = useState<PermissionType>(
    PermissionType.entireAccount
  );
  const { dispatch }: any = useContext(stateContext);
  const debounceName = useDebounce(roleName, 300);
  const [tenantRolePermission, setTenantRolePermission] = useState<Array<any>>(
    []
  );
  const [isEdited, setIsEdited] = useState(false);
  const classes = CustomPopOver();

  useEffect(() => {
    const value = debounceName.trim();
    if (value && !isView) {
      getRoleByName();
    } else {
      setRoleNameDuplicate(false);
    }
  }, [debounceName]);

  useEffect(() => {
    if (roleId) {
      fetchRoleDetails();
    }
  }, [roleId]);

  const fetchRoleDetails = async () => {
    try {
      dispatch(setIsLoading(true));
      const promiseList = [];
      promiseList.push(
        client.query({
          query: FETCH_SYSTEM_ROLE_BY_ID,
          variables: { id: roleId },
          fetchPolicy: 'network-only',
          context: { role: tenantRoles.viewTenantRoles },
        })
      );
      promiseList.push(
        await client.query({
          query: LOAD_TENANT_ROLE_FEATURE,
          variables: {},
          fetchPolicy: 'network-only',
          context: { role: tenantRoles.viewTenantRoles },
        })
      );
      promiseList.push(
        client.query({
          query: FETCH_SYSTEM_ROLE_PERMISSION,
          variables: { id: roleId },
          fetchPolicy: 'network-only',
          context: { role: tenantRoles.viewTenantRoles },
        })
      );
      const responseData: any = await Promise.all(promiseList);
      if (responseData.length === 3) {
        if (responseData[0].data.tenantRole.length > 0) {
          setRoleNameAndDescription(responseData[0].data.tenantRole[0]);
        }
        const roleList: Array<any> = [];
        if (responseData[1].data.tenantFeature.length > 0) {
          responseData[1].data.tenantFeature.forEach((element: any) => {
            if (
              element.feature !== 'COMPANY_RELATIONSHIP' &&
              element.feature !== 'USER_RELATIONSHIP'
            ) {
              const roleItem = {
                caption: element.caption,
                description: element.description,
                feature: element.feature,
                value: PermissionType.none,
              };
              roleList.push(roleItem);
            }
          });
        }
        if (responseData[2].data.tenantPermission.length > 0) {
          responseData[2].data.tenantPermission.forEach((element: any) => {
            if (
              element.feature !== 'COMPANY_RELATIONSHIP' &&
              element.feature !== 'USER_RELATIONSHIP'
            ) {
              roleList.forEach((item: any) => {
                if (item.feature === element.feature) {
                  item.value = getAuthValue(element.authValue);
                }
              });
            }
            if (element.feature === 'COMPANY_RELATIONSHIP') {
              setCompanyRelationShip(PermissionType.onlyCompany);
              const companyPermission = roleList.find(
                (item: any) => item.feature === RoleFeature.company
              );
              const companyIndex = roleList.indexOf(companyPermission);
              if (companyIndex > -1) {
                roleList[companyIndex].value = getAuthValue(element.authValue);
              }
            }
            if (element.feature === 'USER_RELATIONSHIP') {
              setUserRelationship(PermissionType.onlyCompany);
              const userPermission = roleList.find(
                (item: any) => item.feature === RoleFeature.user
              );
              const userIndex = roleList.indexOf(userPermission);
              if (userIndex > -1) {
                roleList[userIndex].value = getAuthValue(element.authValue);
              }
            }
          });
        }
        setTenantRolePermission(roleList);
      }
      dispatch(setIsLoading(false));
    } catch (error: any) {
      console.log(error);
      dispatch(setIsLoading(false));
    }
  };

  const setRoleNameAndDescription = (argRoleDetail: any) => {
    setRoleName(argRoleDetail.role || '');
    setRoleNameRequired(false);
    setRoleDescription(argRoleDetail.description || '');
  };

  const getRoleByName = async () => {
    try {
      const responseData: any = await client.query({
        query: LOAD_TENANT_ROLE_BY_NAME,
        variables: { name: debounceName.trim() },
        fetchPolicy: 'network-only',
        context: { role: tenantRoles.viewTenantRoles },
      });
      if (responseData.data.tenantRole.length > 0) {
        if (responseData.data.tenantRole[0].id !== roleId) {
          setRoleNameDuplicate(true);
          setRoleNameRequired(false);
        } else {
          setRoleNameDuplicate(false);
        }
      } else {
        setRoleNameDuplicate(false);
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const onBlur = () => {
    if (roleName.trim()) {
      setRoleNameRequired(false);
    } else {
      setRoleNameRequired(true);
    }
  };

  const onRoleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoleName(event.target.value);
    if (event.target.value.trim()) {
      setRoleNameRequired(false);
    } else {
      setRoleNameRequired(true);
    }
    setIsEdited(true);
  };

  const onRoleDescriptionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRoleDescription(event.target.value);
    setIsEdited(true);
  };

  const handleChangeInCompanyPermissionTo = (
    argValue: React.ChangeEvent<{ name?: string | undefined; value: unknown }>
  ) => {
    setCompanyRelationShip(argValue.target.value as PermissionType);
    setIsEdited(true);
  };

  const handleChangeInUserRelationship = (
    argValue: React.ChangeEvent<{ name?: string | undefined; value: unknown }>
  ) => {
    setUserRelationship(argValue.target.value as PermissionType);
    setIsEdited(true);
  };

  const updateRole = async () => {
    try {
      const rolePayload = new RolePayload(
        roleName.trim(),
        roleDescription.trim(),
        RoleTye.tenant,
        []
      );
      tenantRolePermission.forEach((item: any) => {
        if (item.value !== PermissionType.none) {
          const permission: Permission = {
            feature: item.feature,
            permission: item.value,
          };
          if (item.feature === RoleFeature.user) {
            permission.feature =
              userRelationship === PermissionType.onlyCompany
                ? RoleFeature.userRealtionship
                : RoleFeature.user;
          }
          if (item.feature === RoleFeature.company) {
            permission.feature =
              companyRelationShip === PermissionType.onlyCompany
                ? RoleFeature.companyRelationship
                : RoleFeature.company;
          }
          rolePayload.permissions.push(permission);
        } else {
          const permission: Permission = {
            feature: item.feature,
            permission: 'NONE',
          };
          rolePayload.permissions.push(permission);
        }
      });
      dispatch(setIsLoading(true));
      await client.mutate({
        mutation: UPDATE_ROLE,
        variables: {
          roleId,
          roleName: rolePayload.roleName,
          description: rolePayload.description,
          roleType: rolePayload.roleType,
          permissions: rolePayload.permissions,
        },
        context: { role: tenantRoles.updateTenantRole },
      });
      Notification.sendNotification(
        'Successfully updated system role',
        AlertTypes.success
      );
      close(true);
    } catch (error: any) {
      console.log(error.msg);
      dispatch(setIsLoading(false));
      Notification.sendNotification(error.message, AlertTypes.error);
    }
  };

  const changeInPermissionValue = (
    argValue: PermissionType,
    argIndex: number
  ) => {
    const list = [...tenantRolePermission];
    list[argIndex].value = argValue;
    setTenantRolePermission(list);
    setIsEdited(true);
  };

  const isUpdateEnabled = (): boolean => {
    return !roleName || roleNameDuplicate || roleNameRequired || !isEdited;
  };

  return (
    <div className={`EditSystemRole ${open ? 'open' : 'close'}`}>
      <div className="EditSystemRole__left"></div>
      <div className="EditSystemRole__right">
        <div className="EditSystemRole__right__header">
          <div className="EditSystemRole__right__header__name">
            <input
              data-testid="tenant-role-name"
              autoFocus
              disabled={isView}
              className="EditSystemRole__right__header__name__input"
              onBlur={(e) => onBlur()}
              onChange={(e) => onRoleNameChange(e)}
              value={roleName}
              placeholder="Enter Role name"
            />
            {roleNameRequired ? (
              <div
                data-testid="roleNameerror"
                className="EditSystemRole__right__header__name__error"
              >
                Role name is required
              </div>
            ) : roleNameDuplicate ? (
              <div
                data-testid="roleNameerror"
                className="EditSystemRole__right__header__name__error"
              >
                Role name already exists
              </div>
            ) : (
              <div className="EditSystemRole__right__header__name__error"></div>
            )}
          </div>
          {/* <div className="EditSystemRole__right__header__description">
                        <input data-testid="tenant-role-description"
                        disabled={isView}
                            className="EditSystemRole__right__header__description__input"
                            onChange={(e)=> onRoleDescriptionChange(e)} value={roleDescription} placeholder="Enter role description"/>
                    </div> */}
        </div>
        <div className="EditSystemRole__right__body">
          <div className="EditSystemRole__right__body__header">
            <Grid container className="permission">
              <Grid item xs={5} className="permission__left">
                <div className="permission__left__label">
                  System role permissions
                </div>
              </Grid>
              <Grid item xs={7} className="permission__right">
                <Grid container spacing={4}>
                  <Grid item xs={3} className="permission__right__label">
                    Admin
                  </Grid>
                  <Grid item xs={3} className="permission__right__label">
                    Editor
                  </Grid>
                  <Grid item xs={3} className="permission__right__label">
                    Viewer
                  </Grid>
                  <Grid item xs={3} className="permission__right__label">
                    None
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </div>
          <div className="EditSystemRole__right__body__content">
            {tenantRolePermission.length > 0 &&
              tenantRolePermission.map((item: any, index: number) => (
                <Grid container className="permission" key={item.feature}>
                  <Grid item xs={5} className="permission__left">
                    <div className="permission__left__label">
                      {item.caption === 'Material Master'
                        ? 'Master Data Management'
                        : item.caption}
                    </div>
                    {/* <div className="permission__left__description">
                                    {item.description}
                                </div> */}
                    {item.feature === RoleFeature.user
                      ? item.value !== PermissionType.none && (
                          <div className="permission__left__option">
                            <div className="permission__left__option__label">
                              Apply to:
                            </div>
                            <FormControl
                              variant="outlined"
                              className="permission__left__option__select"
                            >
                              <Select
                                labelId="user-permission-apply-to"
                                disabled={isView}
                                id="user-permission-apply-to"
                                value={userRelationship}
                                onChange={(e) =>
                                  handleChangeInUserRelationship(e)
                                }
                                MenuProps={{
                                  classes: { paper: classes.root },
                                  anchorOrigin: {
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                  },
                                  transformOrigin: {
                                    vertical: 'top',
                                    horizontal: 'left',
                                  },
                                  getContentAnchorEl: null,
                                }}
                              >
                                {userPermissionList.map(
                                  (item: PermissionsType) => (
                                    <MenuItem
                                      key={item.value}
                                      className="mat-menu-item-sm"
                                      value={item.value}
                                    >
                                      {item.name}
                                    </MenuItem>
                                  )
                                )}
                              </Select>
                            </FormControl>
                          </div>
                        )
                      : ''}
                    {item.feature === RoleFeature.company
                      ? item.value !== PermissionType.none && (
                          <div className="permission__left__option">
                            <div className="permission__left__option__label">
                              Apply to:
                            </div>
                            <FormControl
                              variant="outlined"
                              className="permission__left__option__select"
                            >
                              <Select
                                labelId="company-permission-apply-to"
                                disabled={isView}
                                id="company-permission-apply-to"
                                value={companyRelationShip}
                                onChange={(e) =>
                                  handleChangeInCompanyPermissionTo(e)
                                }
                                MenuProps={{
                                  classes: { paper: classes.root },
                                  anchorOrigin: {
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                  },
                                  transformOrigin: {
                                    vertical: 'top',
                                    horizontal: 'left',
                                  },
                                  getContentAnchorEl: null,
                                }}
                              >
                                {userPermissionList.map(
                                  (item: PermissionsType) => (
                                    <MenuItem
                                      key={item.value}
                                      className="mat-menu-item-sm"
                                      value={item.value}
                                    >
                                      {item.name}
                                    </MenuItem>
                                  )
                                )}
                              </Select>
                            </FormControl>
                          </div>
                        )
                      : ''}
                  </Grid>
                  <Grid item xs={7} className="permission__right">
                    <RoleRadioGroup
                      isView={isView}
                      value={item.value}
                      index={index}
                      setValue={changeInPermissionValue}
                    />
                  </Grid>
                </Grid>
              ))}
          </div>
        </div>
        <div className="EditSystemRole__right__footer">
          <Button
            variant="outlined"
            data-testid="templateAssociate"
            onClick={() => close(false)}
            className={`EditSystemRole__right__footer__btn ${
              isView ? 'btn-primary' : 'btn-secondary'
            }`}
          >
            {isView ? `Close` : `Cancel`}
          </Button>

          {!isView && (
            <Button
              variant="outlined"
              data-testid="templateAssociate"
              onClick={updateRole}
              disabled={isUpdateEnabled()}
              className={`EditSystemRole__right__footer__btn ${
                isUpdateEnabled() ? 'btn-disabled' : 'btn-primary'
              }`}
            >
              Update
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default EditSystemRole;
