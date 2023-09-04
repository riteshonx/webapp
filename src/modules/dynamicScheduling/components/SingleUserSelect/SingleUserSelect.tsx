import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import CancelIcon from '@material-ui/icons/Cancel';
import SearchIcon from '@material-ui/icons/Search';
import { ClickAwayListener } from '@mui/base';
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import ShowComponent from 'src/modules/shared/utils/ShowComponent';
import { useDebounce } from '../../../../customhooks/useDebounce';
import { client } from '../../../../services/graphql';
import { myProjectRole } from '../../../../utils/role';
import { stateContext } from '../../../root/context/authentication/authContext';
import {
  FETCH_PROJECT_ASSOCIATED_USERS,
  FETCH_PROJECT_ASSOCIATED_USERS_BY_FULL_NAME,
  FETCH__PROJECT_ROLE_ABOVE_VIEW,
} from '../../graphql/queries/projectUser';
import './SingleUserSelect.scss';

interface Props {
  selectAssignee: any;
  closeSelectAssignee: any;
  selectedAssignee?: any;
  classes?: { [key: string]: string };
  showCancelButton: boolean;
  setUpdateButtonDisabled?: any;
}

function SingleUserSelect(props: Props): ReactElement {
  const [searchedUserList, setSearchedUserList] = useState<Array<any>>([]);
  const [searchName, setSearchName] = useState('');
  const { selectedAssignee, selectAssignee } = props;
  const debounceName = useDebounce(searchName, 400);
  const [noData, setNoData] = useState(false);

  const { state }: any = useContext(stateContext);
  const [allowedRoles, setAllowedRoles] = useState<Array<any>>([]);

  const [open, setOpen] = React.useState(false);
  const classes = props.classes as { [key: string]: any };

  useEffect(() => {
    fetchPermittedRoles();
  }, []);

  useEffect(() => {
    if (selectedAssignee == '') {
      clearSearchOption();
      selectAssignee(null);
    }
  }, [selectedAssignee]);

  useEffect(() => {
    if (debounceName.trim()) {
      fetchUsers();
    } else {
      props.selectAssignee(null);
      setSearchedUserList([]);
    }
  }, [debounceName]);

  const fetchPermittedRoles = async () => {
    try {
      const permittedRolesResponse: any = await client.query({
        query: FETCH__PROJECT_ROLE_ABOVE_VIEW,
        variables: {
          featureId: [4, 7],
        },
        fetchPolicy: 'network-only',
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

  const fetchUsers = async () => {
    if (debounceName) {
      try {
        const name = debounceName.split(/\s+/);
        let fName = debounceName;
        let lName = '';
        if (name.length > 1) {
          fName = name[0].trim();
          lName = name[1].trim() ? name[1].trim() : fName;
        }
        const projectAssociationResponse = await client.query({
          query: lName
            ? FETCH_PROJECT_ASSOCIATED_USERS_BY_FULL_NAME
            : FETCH_PROJECT_ASSOCIATED_USERS,
          variables: {
            projectId: state.currentProject.projectId,
            fName: `${fName ? '%' + fName + '%' : fName}`,
            lName: `%${lName}%`,
          },
          fetchPolicy: 'network-only',
          context: { role: myProjectRole.viewMyProjects },
        });
        const targetUsers: Array<any> = [];
        if (projectAssociationResponse.data.projectAssociation.length > 0) {
          projectAssociationResponse.data.projectAssociation.forEach(
            (item: any) => {
              if (allowedRoles.indexOf(item.role) > -1) {
                const name = item.user.firstName
                  ? `${item.user.firstName || ''} ${item.user.lastName || ''}`
                  : item.user.email.split('@')[0];
                const user = {
                  name,
                  email: item.user.email,
                  id: item.user.id,
                  status: item.status,
                };
                targetUsers.push(user);
              }
            }
          );
        }
        if (targetUsers.length === 0) {
          setNoData(true);
          props?.setUpdateButtonDisabled && props.setUpdateButtonDisabled(true);
        } else {
          props?.setUpdateButtonDisabled &&
            props.setUpdateButtonDisabled(false);
        }
        setSearchedUserList(targetUsers);
      } catch (err) {}
    } else {
      props?.setUpdateButtonDisabled && props.setUpdateButtonDisabled(true);
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

  const clearSearchOption = () => {
    props.closeSelectAssignee();
    setSearchName('');
    setNoData(false);
    setOpen(false);
    props?.setUpdateButtonDisabled && props?.setUpdateButtonDisabled(true);
  };

  const addAssignee = (argUser: any) => {
    if (argUser?.name) setSearchName(argUser?.name);
    props.selectAssignee(argUser);
    setOpen(false);
  };

  useEffect(() => {
    if (noData && searchedUserList.length == 0) {
      props?.setUpdateButtonDisabled && props.setUpdateButtonDisabled(true);
    }
  }, [noData, searchedUserList]);

  const handleUserOnChange = (e: any) => {
    setSearchName(e.target.value);
    if (!e.target.value) {
      props?.setUpdateButtonDisabled && props?.setUpdateButtonDisabled(true);
    }
  };

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <div className="singleUserSelect">
        <div className="singleUserSelect__search">
          <SearchIcon className="singleUserSelect__search__icon" />
          <TextField
            value={searchName}
            autoFocus
            id="user-usergroup-search"
            data-testid="pullPlanAssignee-search"
            type="text"
            fullWidth
            onFocus={() => setOpen(true)}
            onClick={(e) => stopPropogation(e)}
            placeholder="Search assignee"
            onChange={handleUserOnChange}
          />
          <ShowComponent
            showState={props.showCancelButton ? true : !!searchName.length}
          >
            <IconButton
              onClick={(e) => clearSearchOption()}
              data-testid="taskAssignee-search-close"
              className="singleUserSelect__search__close"
            >
              <CancelIcon className="singleUserSelect__search__close__icon" />
            </IconButton>
          </ShowComponent>
        </div>

        <div className="singleUserSelect__option">
          <ShowComponent showState={open}>
            <div
              className={`singleUserSelect__option__list ${classes['list-width']}`}
            >
              {searchedUserList.map((item: any, searchIndex: number) => (
                <div
                  key={item.id}
                  className="singleUserSelect__option__list__item"
                  style={{
                    borderBottom: `${
                      searchedUserList.length - 1 === searchIndex ? 'none' : ''
                    }`,
                  }}
                  onClick={() => addAssignee(item)}
                >
                  <div className="singleUserSelect__option__list__item__left">
                    <Avatar
                      src="/"
                      className="singleUserSelect__option__list__item__left__icon"
                      alt={item.name}
                    />
                    <div className="singleUserSelect__option__list__item__left__label">
                      <div className="singleUserSelect__option__list__item__left__label__name">
                        {item.name}
                      </div>
                      <div className="singleUserSelect__option__list__item__left__label__email">
                        {item.email}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ShowComponent>
          {noData && searchedUserList.length === 0 ? (
            <div
              className={`singleUserSelect__option__nodata ${classes['no-data-width']}`}
            >
              No assignee found
            </div>
          ) : (
            ''
          )}
        </div>
      </div>
    </ClickAwayListener>
  );
}

SingleUserSelect.defaultProps = {
  classes: {
    'list-width': 'singleUserSelect__option__list__width',
    'no-data-width': 'singleUserSelect__option__nodata__width',
  },
  showCancelButton: true,
};

export default SingleUserSelect;
