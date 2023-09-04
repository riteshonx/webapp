import {
  Button,
  FormControl,
  Grid,
  MenuItem,
  Select,
  TextField,
} from '@material-ui/core';
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { useDebounce } from '../../../../../customhooks/useDebounce';
import { postApiWithEchange } from '../../../../../services/api';
import { client } from '../../../../../services/graphql';
import { tenantRoles } from '../../../../../utils/role';
import { setIsLoading } from '../../../../root/context/authentication/action';
import { stateContext } from '../../../../root/context/authentication/authContext';
import Notification, {
  AlertTypes,
} from '../../../../shared/components/Toaster/Toaster';
import { CustomPopOver } from '../../../../shared/utils/CustomPopOver';
import {
  LOAD_TENANT_ROLE_BY_NAME,
  LOAD_TENANT_ROLE_FEATURE,
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
import RoleRadioGroup from '../RoleRadioGroup/RoleRadioGroup';
import './CreateSystemRole.scss';

interface IProps {
  close: (argValue: boolean) => void;
  open: boolean;
}

function CreateSystemRole({ close, open }: IProps): ReactElement {
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
  const classes = CustomPopOver();

  useEffect(() => {
    const value = debounceName.trim();
    if (value) {
      getRoleByName();
    } else {
      setRoleNameDuplicate(false);
    }
  }, [debounceName]);

  useEffect(() => {
    getTenantRoleFeature();
  }, []);

  const getRoleByName = async () => {
    try {
      const responseData: any = await client.query({
        query: LOAD_TENANT_ROLE_BY_NAME,
        variables: { name: debounceName.trim() },
        fetchPolicy: 'network-only',
        context: { role: tenantRoles.viewTenantRoles },
      });
      if (responseData.data.tenantRole.length > 0) {
        setRoleNameDuplicate(true);
      } else {
        setRoleNameDuplicate(false);
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const getTenantRoleFeature = async () => {
    try {
      const responseData: any = await client.query({
        query: LOAD_TENANT_ROLE_FEATURE,
        variables: {},
        fetchPolicy: 'network-only',
        context: { role: tenantRoles.viewTenantRoles },
      });
      const roleList: Array<any> = [];
      if (responseData.data.tenantFeature.length > 0) {
        responseData.data.tenantFeature.forEach((element: any) => {
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
      setTenantRolePermission(roleList);
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

  const onRoleNameChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRoleName(event.target.value);
    if (event.target.value.trim()) {
      setRoleNameRequired(false);
    } else {
      setRoleNameRequired(true);
    }
  };

  const onRoleDescriptionChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRoleDescription(event.target.value);
  };

  const handleChangeInCompanyPermissionTo = (
    argValue: React.ChangeEvent<{ name?: string | undefined; value: unknown }>
  ) => {
    setCompanyRelationShip(argValue.target.value as PermissionType);
  };

  const handleChangeInUserRelationship = (
    argValue: React.ChangeEvent<{ name?: string | undefined; value: unknown }>
  ) => {
    setUserRelationship(argValue.target.value as PermissionType);
  };

  const createRole = async () => {
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
      await postApiWithEchange('V1/permission', rolePayload);
      Notification.sendNotification(
        'Successfully created system role',
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
  };

  const isCreateDisabled = (): boolean => {
    const nonNullPermission = tenantRolePermission.filter(
      (item: any) => item.value !== PermissionType.none
    );
    return !roleName || roleNameDuplicate || roleNameRequired;
  };

  return (
    <div className={`CreateSystemRole ${open ? 'open' : 'close'}`}>
      <div className="CreateSystemRole__left"></div>
      <div className="CreateSystemRole__right">
        <div className="CreateSystemRole__right__header">
          <div className="CreateSystemRole__right__header__name">
            <TextField
              data-testid="tenant-role-name"
              autoFocus
              variant="outlined"
              className="CreateSystemRole__right__header__name__input"
              onBlur={(e) => onBlur()}
              onChange={(e) => onRoleNameChange(e)}
              value={roleName}
              placeholder="Enter Role name"
            />
            {roleNameRequired ? (
              <div
                data-testid="roleNameerror"
                className="CreateSystemRole__right__header__name__error"
              >
                Role name is required
              </div>
            ) : roleNameDuplicate ? (
              <div
                data-testid="roleNameerror"
                className="CreateSystemRole__right__header__name__error"
              >
                Role name already exists
              </div>
            ) : (
              <div className="CreateSystemRole__right__header__name__error"></div>
            )}
          </div>
          {/* <div className="CreateSystemRole__right__header__description">
                        <TextField data-testid="tenant-role-description"
                            variant="outlined"
                            className="CreateSystemRole__right__header__description__input"
                            onChange={(e)=> onRoleDescriptionChange(e)} value={roleDescription} placeholder="Enter role description"/>
                    </div> */}
        </div>
        <div className="CreateSystemRole__right__body">
          <div className="CreateSystemRole__right__body__header">
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
          <div className="CreateSystemRole__right__body__content">
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
                                id="company-permission-apply-to"
                                value={companyRelationShip}
                                onChange={(e) =>
                                  handleChangeInCompanyPermissionTo(e)
                                }
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
                      isView={false}
                      value={item.value}
                      index={index}
                      setValue={changeInPermissionValue}
                    />
                  </Grid>
                </Grid>
              ))}
          </div>
        </div>
        <div className="CreateSystemRole__right__footer">
          <Button
            variant="outlined"
            data-testid="templateAssociate"
            onClick={() => close(false)}
            className="CreateSystemRole__right__footer__btn btn-secondary"
          >
            Cancel
          </Button>
          <Button
            variant="outlined"
            data-testid="templateAssociate"
            disabled={isCreateDisabled()}
            className={`CreateSystemRole__right__footer__btn ${
              isCreateDisabled() ? 'btn-disabled' : 'btn-primary'
            }`}
            onClick={createRole}
          >
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CreateSystemRole;
