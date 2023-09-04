import React, { ReactElement, useContext, useEffect, useState } from 'react'
import { useDebounce } from '../../../../customhooks/useDebounce';
import { Avatar, Button, IconButton, TextField } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import SearchIcon from '@material-ui/icons/Search';
import CancelIcon from '@material-ui/icons/Cancel';
import './UserSelector.scss';
import { stateContext } from '../../../root/context/authentication/authContext';
import { client } from '../../../../services/graphql';
import { decodeExchangeToken } from '../../../../services/authservice';
import { myProjectRole, projectFeatureAllowedRoles } from '../../../../utils/role';
import { FETCH_PROJECT_ASSOCIATED_USERS, FETCH_PROJECT_ASSOCIATED_USERS_BY_FULL_NAME, FETCH__PROJECT_ROLE_ABOVE_VIEW } from '../../graphql/queries/projectUser';

interface Props {
    save: (argValue: Array<string>)=> void,
    closeUserSelect: ()=> void,
    userIds: Array<string>
}


function UserSelector({save, userIds, closeUserSelect}: Props): ReactElement {
    const [searchedUserList, setSearchedUserList] = useState<Array<any>>([]);
    const [selectedUserIds, setselectedUserIds] = useState<Array<string>>([]);
    const [selectedUserDetails, setSelectedUserDetails] = useState<Array<string>>([]);
    const [alreadySelected, setAlreadySelected] = useState<Array<string>>([]);
    const [searchName, setSearchName] = useState('');
    const debounceName = useDebounce(searchName,400);
    const [noData, setNoData] = useState(false);
    const { state }:any = useContext(stateContext);
    const [maxLimitexceded, setMaxLimitexceded] = useState(false);
    const [allowedRoles, setAllowedRoles] = useState<Array<any>>([]);

    useEffect(() => {
          setSelectedUserDetails([]);
          fetchProjectUsers();
      }, [debounceName]);
    
    useEffect(() => {
        setAlreadySelected([...userIds]);
        setselectedUserIds([...userIds]);
        if(userIds.length===39){
          setMaxLimitexceded(true);
        } else{
          setMaxLimitexceded(false);
        }
    }, [userIds])

    const close=()=>{
        setSearchedUserList([]);
    }
    
    /**
     * Common method to stop event propogation and prevent default
     * @param event :
     */
    const stopPropogation=(event: React.MouseEvent<HTMLDivElement | HTMLButtonElement| SVGSVGElement, MouseEvent>)=>{
        event.stopPropagation();
        event.preventDefault();
    }

    /**
     * add and remove event listner when user click outside the follower select area
     */
     useEffect(() => {
        window.addEventListener('click', close);
        fetchPermittedRoles();
        return () => {
            window.removeEventListener('click', close);
        }
    }, [])

    const fetchPermittedRoles=async ()=>{
      try{
        const permittedRolesResponse: any= await client.query({
            query: FETCH__PROJECT_ROLE_ABOVE_VIEW,
            variables:{
              featureId: [4, 7]
            },
            fetchPolicy: 'network-only',
            context:{role: myProjectRole.viewMyProjects}
        });
        if(permittedRolesResponse.data.projectPermission.length>0){
          const targetList=permittedRolesResponse.data.projectPermission.map((item:any)=>item.roleId);
          setAllowedRoles(targetList);
        }
      }catch(error: any){
        console.log(error.message)
      }
    }

    const fetchProjectUsers=async ()=>{
      if(debounceName){
        try {
          const name = debounceName.split(/\s+/);
          let fName = debounceName;
          let lName = '';
          if(name.length > 1) {
              fName = name[0].trim();
              lName = name[1].trim() ? name[1].trim() : fName;
          }
          const payLoad: any ={
            projectId: state.currentProject.projectId,
            fName: `${fName?"%"+fName+"%":fName}`
          }
          if(lName){
            payLoad.lName= `%${lName}%`;
          }
          const projectAssociationResponse = await client.query({
              query: lName ? FETCH_PROJECT_ASSOCIATED_USERS_BY_FULL_NAME : FETCH_PROJECT_ASSOCIATED_USERS,
              variables:payLoad,
              fetchPolicy: "network-only",
              context: { role: myProjectRole.viewMyProjects }
          });
          const targetUsers: Array<any> = [];
          if (projectAssociationResponse.data.projectAssociation.length > 0) {
            projectAssociationResponse.data.projectAssociation.forEach(
              (item: any) => {
                if (allowedRoles.indexOf(item.role) > -1) {
                  if(item.user.id !== decodeExchangeToken().userId) {
                    const name = item.user.firstName
                    ? `${item.user.firstName || ""} ${item.user.lastName || ""}`
                    : item.user.email.split("@")[0];
                    const user = {
                      name,
                      email: item.user.email,
                      id: item.user.id,
                      status: item.status,
                    };
                    targetUsers.push(user);
                  }
                }
              }
            );
          }

          if(targetUsers.length===0){
            setNoData(true);
          }
          setSearchedUserList(targetUsers);
          } catch (err) {}
      }
    }

    const clearSearchOption= (event: React.MouseEvent<HTMLButtonElement, MouseEvent>)=>{
        closeUserSelect();
        stopPropogation(event);
        setSearchName('');
        setSearchedUserList([]);
    }

    const addNewUsers=(argItem: any,event:any)=>{
        if(alreadySelected.indexOf(argItem.id)>-1) return; 
        event ? stopPropogation(event): null;
        const ids=[...selectedUserIds];
        const index= selectedUserIds.indexOf(argItem.id);
        const detailsITem: any=selectedUserDetails.find((item:any)=>item.id===argItem.id);
        const detailsIndex=selectedUserDetails.indexOf(detailsITem);
          if(detailsIndex!==-1){
            selectedUserDetails.splice(detailsIndex,1);
            setSelectedUserDetails(selectedUserDetails);
          } else{
            if(ids.length<39){
              setSelectedUserDetails([...selectedUserDetails,argItem]);
            }
          }
          if(index!==-1){
              ids.splice(index,1);
              setselectedUserIds(ids);
              if(ids.length<39){
                setMaxLimitexceded(false);
              }
          } else{
              if(ids.length===39){
                setMaxLimitexceded(true);
              } else{
                ids.push(argItem.id)
                setselectedUserIds(ids);
                setMaxLimitexceded(false);
              }
          }
    }
    const clearSelectedUsers= (event:React.MouseEvent<HTMLButtonElement, MouseEvent>)=>{
        stopPropogation(event);
        setSearchName('');
        setSearchedUserList([]);
        setselectedUserIds(alreadySelected);
    }

    const saveUsersSelected= (event:React.MouseEvent<HTMLButtonElement, MouseEvent>)=>{
        stopPropogation(event);
        save(selectedUserDetails);
    }


    return (
        <div className="userSelect">
                <div className="userSelect__search">
                  <SearchIcon className="userSelect__search__icon"/>
                  <TextField value={searchName}
                                id="user-usergroup-search"
                                data-testid="pullPlanAssignee-search"
                                type="text"
                                fullWidth
                                onFocus={fetchProjectUsers}
                                onClick={(e)=>stopPropogation(e)}
                                placeholder="Search teammate"
                                onChange={(e)=>setSearchName(e.target.value)}
                              />
                      <IconButton  onClick={(e)=>clearSearchOption(e)} data-testid="pullPlanAssignee-search-close"
                                    className="userSelect__search__close">
                            <CancelIcon  className="userSelect__search__close__icon"/>
                    </IconButton>
                </div>
                <div className="userSelect__option">
                   <div className="userSelect__option__list">
                      {searchedUserList.map((item: any, searchIndex: number) => (
                            <div key={item.id} className="userSelect__option__list__item"
                              style={{borderBottom:`${searchedUserList.length-1===searchIndex?"none":""}`}}
                              onClick={(e) => stopPropogation(e)}> 
                              <div className="userSelect__option__list__item__left" onClick={() => addNewUsers(item, null)} >
                              <Avatar src="/" className="userSelect__option__list__item__left__icon" alt={item.name} />
                                <div className="userSelect__option__list__item__left__label">
                                      <div className="userSelect__option__list__item__left__label__name">
                                          {item.name}
                                      </div>
                                      <div className="userSelect__option__list__item__left__label__email">
                                    {item.email}
                                  </div>
                                </div>
                              </div>
                              <div className="userSelect__option__list__item__right">
                                {selectedUserIds.indexOf(item.id)>-1?(
                                   <IconButton onClick={(event) => addNewUsers(item,event)}
                                   disabled={alreadySelected.indexOf(item.id)>-1}
                                   data-testid="pullPlanAssignee-checked"
                                   className="userSelect__option__list__item__right__remove">
                                     <CheckCircleIcon 
                                        className="userSelect__option__list__item__right__remove__icon"/>
                                   </IconButton>
                                  ):(
                                  <IconButton  onClick={(event) => addNewUsers(item,event)} 
                                    className="userSelect__option__list__item__right__add"
                                    data-testid="pullPlanAssignee-add">
                                  <AddIcon  className="userSelect__option__list__item__right__add__icon" />
                                  </IconButton>)}
                              </div>
                            </div>
                        ))}
                      </div>
                       {searchedUserList.length>0&&(<div className="userSelect__option__actions">
                            {maxLimitexceded&&(<div className="userSelect__option__actions__error">Maximum 40 teammates are allowed.</div>)}

                        <Button className="userSelect__option__actions__btn"
                          data-testid="clearall"  onClick={(e)=>clearSelectedUsers(e)}>Clear All</Button>    
                        <Button className="userSelect__option__actions__btn" disabled={selectedUserDetails.length===0}
                            onClick={(e)=>saveUsersSelected(e)} data-testid="add">Add </Button>    
                      </div>)}
                      {noData && searchedUserList.length===0?(<div className="userSelect__option__nodata">No teammate found</div>):("")}
                </div>
        </div>
    )
}

export default UserSelector