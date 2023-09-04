
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import './CompanyMember.scss';
import SearchIcon from '@material-ui/icons/Search';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { match, useRouteMatch, useHistory } from 'react-router-dom';
import { useDebounce } from '../../../../../customhooks/useDebounce';
import CompanyAssociationTable from '../CompanyAssociationTable/CompanyAssociationTable';
import CompanyTenantAssociationTable from '../CompanyTenantAssociationTable/CompanyTenantAssociationTable';
import { setIsLoading } from '../../../../root/context/authentication/action';
import { myCompanyRoles, myCompanyUserRole, tenantCompanyRole, tenantUserRole } from '../../../../../utils/role';
import { client } from '../../../../../services/graphql';
import { ASSOCIATE_USER_COMPANY, FETCH_COMPANY_USERS, FETCH_COMPANY_USERS_BY_FULL_NAME, FETCH_TENANT_COMPANY_USERS,
    FETCH_TENANT_COMPANY_USERS_BY_FULL_NAME, UPDATE_COMPANY_ASSOCIATION } from '../../graphql/queries/companies';
import { decodeExchangeToken, decodeToken } from '../../../../../services/authservice';
import { Status } from '../../../../../utils/constants';
import { CompanyDetailsContext } from '../../Context/CompanyDetailsContext';
import { CompanyEmployeeList } from '../../models/company';
import { updateTenantCompany } from '../../../roles/utils/permission';
import { canInviteCompanyUsers } from '../../../../../services/permission';

export interface Params {
    companyId: string;
}
export class UserCompanyAssociation{
    constructor(
      public companyId: number,
      public userId: string
    ){}
  }

  export class UserCompanyDisAssociation{
    constructor(
      public companyId: number,
      public status: number,
      public userId: string
    ){}
  }
  
  export class CompanyAssociations{
    constructor(public objects: Array<UserCompanyAssociation>){}
  }

export default function CompanyMember(props: any): ReactElement {

    const {dispatch }:any = useContext(stateContext);
    const pathMatch:match<Params>= useRouteMatch();
    const [tableType, setTableType] = useState('LIST_VIEW');
    const [searchViewTable, setSearchViewTable] = useState('');
    const debounceView = useDebounce(searchViewTable, 1000);
    const [searchEditTable, setSearchEditTable] = useState('');
    const debounceEdit = useDebounce(searchEditTable, 1000);
    const [companyMembers, setCompanyMembers] = useState<Array<any>>([]);
    const [tenantMembers, setTenantMembers] = useState<Array<any>>([]);
    const {companyDetailsState, companyDetailsDispatch}: any = useContext(CompanyDetailsContext);
    const [isCompanyActive, setIsCompanyActive] = useState(true)
    const [selectedRolesList, setSelectedRolesList] = useState<Array<any>>([]);
    const [deSelectedRolesList, setDeSelectedRolesList] = useState<Array<any>>([]);
    const history = useHistory()
    
    useEffect(() => {
        fetchCompanyAssociation();
    }, [debounceView]);


    useEffect(() => {
        fetchTenantAssociation();
    }, [debounceEdit])

    useEffect(() => {
        setSelectedRolesList([])
        setDeSelectedRolesList([])
      }, [tableType]);

    useEffect(() => {
        if(companyDetailsState.companyInfo){
            setIsCompanyActive(companyDetailsState?.companyInfo.active && 
                (decodeExchangeToken().allowedRoles.includes(tenantCompanyRole.createCompanyAssociation) ||
            decodeExchangeToken().allowedRoles.includes(myCompanyUserRole.createMyCompanyAssociation) ))
        }
    }, [companyDetailsState?.companyInfo])

    const tableViewToggle = (type: string) => {
        if(type === 'EDIT_VIEW'){
            fetchTenantAssociation()
        }else{
            fetchCompanyAssociation();
        }
        setSearchViewTable('');
        setSearchEditTable('');
        setTableType(type);
    };

    //fetch tenant projects
    const fetchTenantAssociation= async()=>{
        try{
            setTenantMembers([]);
            dispatch(setIsLoading(true));
            // const role= decodeExchangeToken().allowedRoles.includes(tenantUserRole.viewTenantUsers)?tenantUserRole.viewTenantUsers:
            // myCompanyUserRole.viewMyCompanyUsers;
            const role = decodeExchangeToken().allowedRoles.includes(tenantCompanyRole.viewTenantCompanies) ? 
            tenantCompanyRole.viewTenantCompanies : 
             myCompanyRoles.viewMyCompanies;
            const name = debounceEdit.split(/\s+/);
            let fName = debounceEdit;
            let lName = '';
            if(name.length > 1) {
                fName = name[0].trim();
                lName = name[1].trim() ? name[1].trim() : '';
            }
            const tenantAssociationResponse= await client.query({
                query: lName ? FETCH_TENANT_COMPANY_USERS_BY_FULL_NAME : FETCH_TENANT_COMPANY_USERS,
                variables:{
                    limit: 1000,
                    offset: 0,
                    fName:`%${fName}%`,
                    lName: `%${lName}%`,
                    status: 1,  
                    userId: decodeExchangeToken().userId,
                },
                fetchPolicy: 'network-only',
                context:{role}
            });
            const tenantAssociation: Array<any>=[];
            if(tenantAssociationResponse.data.tenantAssociation.length>0){
                tenantAssociationResponse.data.tenantAssociation.forEach((item: any) => {
                  const associatedCompanies: Array<any>=[];
                   item?.companyAssociations.forEach((item: any)=>{
                       const conpanyItem={
                           status:item.status,
                           id: item?.company?.id,
                           name: item?.company?.name,
                           isNew: false
                       }
                       associatedCompanies.push(conpanyItem);
                   })
                  const associatedCompany = item?.companyAssociations.filter((compItem: any)=> compItem?.company?.id ===
                   Number(pathMatch.params.companyId));
                  const isPartOf= associatedCompany.length>0?associatedCompany[0].status !== Status.deactive? true: false: false;
                  const companyStatus= associatedCompany.length>0?associatedCompany[0].status: Status.null;
                  if(associatedCompanies.length) {
                    const user = new CompanyEmployeeList(item?.user?.id,
                      item?.user?.firstName,
                      item?.user?.jobTitle,
                      item?.user?.email,
                      item?.user?.lastName,
                      item?.user?.phone,
                      item?.status,
                      item?.tenantRole?.role,
                      isPartOf,
                      companyStatus,
                      associatedCompanies
                    );
                    tenantAssociation.push(user);
                  }
                });
                const partOfList =  tenantAssociation.filter((item) => item.isPartOf);
                const notPartOfList = tenantAssociation.filter((item) => !item.isPartOf);
                partOfList.sort((a,b) =>
                  (a.firstName?.toLocaleLowerCase() > b.firstName?.toLocaleLowerCase()) ? 1
                    : ((b.firstName?.toLocaleLowerCase() > a.firstName?.toLocaleLowerCase()) ? -1 : 0));
                notPartOfList.sort((a,b) =>
                  (a.firstName?.toLocaleLowerCase() > b.firstName?.toLocaleLowerCase()) ? 1
                    : ((b.firstName?.toLocaleLowerCase() > a.firstName?.toLocaleLowerCase()) ? -1 : 0));
                const userLists = [...partOfList, ...notPartOfList];
                if(selectedRolesList.length){
                    selectedRolesList.forEach((item:any)=>{
                        userLists.forEach((item1:any)=>{
                        if(item.id == item1.id && item.isPartOf){
                          item1.isPartOf = true
                          item1.associatedCompanies=[...item.associatedCompanies]
                        }
                      })
                    })
                  }
                  if(deSelectedRolesList.length){
                    deSelectedRolesList.forEach((item:any)=>{
                        userLists.forEach((item1:any)=>{
                        if(item.id == item1.id && !item.isPartOf){
                          item1.isPartOf = false
                          item1.associatedCompanies=[...item.associatedCompanies]
                        }
                      })
                    })
                  }
                setTenantMembers(userLists);
            }
            dispatch(setIsLoading(false));
        }catch(error){
            console.log(error);
            dispatch(setIsLoading(false));
        }
    }

    // fetch project associations
    const fetchCompanyAssociation= async()=>{
        try{
            if(Number(pathMatch.params.companyId)){
                dispatch(setIsLoading(true));
                const role= decodeExchangeToken().allowedRoles.includes(tenantUserRole.viewTenantUsers)?tenantUserRole.viewTenantUsers:
                decodeExchangeToken().allowedRoles.includes(myCompanyUserRole.viewMyCompanyUsers)?myCompanyUserRole.viewMyCompanyUsers:
                decodeExchangeToken().allowedRoles.includes(tenantCompanyRole.viewTenantCompanies)?tenantCompanyRole.viewTenantCompanies:
                myCompanyUserRole.viewMyCompanyUsers;
                const name = debounceView.split(/\s+/);
                let fName = debounceView;
                let lName = '';
                if(name.length > 1) {
                    fName = name[0].trim();
                    lName = name[1].trim() ? name[1].trim() : '';
                }
                const companyAssociationResponse= await client.query({
                    query: lName ? FETCH_COMPANY_USERS_BY_FULL_NAME : FETCH_COMPANY_USERS,
                    variables:{
                        limit: 1000,
                        offset: 0,
                        CompanyId: Number(pathMatch.params.companyId) ,
                        status: null,
                        fName:`%${fName}%`,
                        lName: `%${lName}%`,
                        userId: decodeExchangeToken().userId,
                    },
                    fetchPolicy: 'network-only',
                    context:{role}
                });
                const companyAssociation: Array<any>=[];
                if(companyAssociationResponse.data.companyAssociation.length>0){
                    companyAssociationResponse.data.companyAssociation.forEach((row: any) => {
                        // const compan,mm,y : Array<any>= [] ;  
                        // row?.tenantAssociation?.companyAssociations.forEach((item: any) =>{
                        //     company.push(`${item?.company.name}`);
                        // })
                        // company.join(',');
                        const newItem={
                            firstName: row?.tenantAssociation?.user?.firstName ? 
                                        row?.tenantAssociation?.user?.firstName : '',
                            lastName: row?.tenantAssociation?.user?.lastName ?
                                        row?.tenantAssociation?.user?.lastName : '',
                            // company: company?.join(','),
                            email: row?.tenantAssociation?.user?.email,
                            mobile: row?.tenantAssociation?.user?.phone ?
                                    row?.tenantAssociation?.user?.phone : '',
                            role: row?.tenantAssociation?.tenantRole?.role,
                            userId: row?.tenantAssociation?.user?.id,
                            status: row?.tenantAssociation?.status || Status.null
                        };
                        companyAssociation.push(newItem)
                    });
                    // companyAssociation.push(...companyAssociationResponse.data.companyAssociation);
                }
                setCompanyMembers(companyAssociation);
                dispatch(setIsLoading(false));    
            }
        }catch(error){
            console.log(error);
            dispatch(setIsLoading(false));
        }
    }

    const handleSearchChange = (value:string, type: string) => {
        type === 'view' ? setSearchViewTable(value) : setSearchEditTable(value);
    }

    const toggleUserSelection=(row: any)=>{
        try{
            const currentRow=tenantMembers.find((item:any)=>item.id === row.id);
            const selectedRoleArr = [...selectedRolesList]
            const nonSelectedRoleArr = [...deSelectedRolesList]
            const selectedItem = []
            const nonSelectedItem = []
            if(currentRow){
                currentRow.isPartOf = !currentRow.isPartOf;
                if(currentRow.isPartOf){
                  currentRow.associatedCompanies.push({status: Status.active,id: Number(pathMatch.params.companyId),name: '', isNew: true});
                   selectedItem.push(currentRow)
                   const rolesList = [...selectedRoleArr,...selectedItem]
                   setSelectedRolesList(rolesList)
                   const isNonselectedExist = nonSelectedRoleArr.findIndex((item: any) => item.id=== currentRow.id);
                   if(isNonselectedExist>-1){
                    nonSelectedRoleArr.splice(isNonselectedExist,1)
                    setDeSelectedRolesList(nonSelectedRoleArr)
                   }
                } else{
                  const currentItem= currentRow.associatedCompanies.find((item: any)=>item.id === Number(pathMatch.params.companyId));
                  const index= currentRow.associatedCompanies.indexOf(currentItem);
                  currentRow.associatedCompanies.splice(index,1);
                  const isExist = selectedRoleArr.findIndex((item: any) => item.id=== currentRow.id);
                    if(isExist>-1){
                     selectedRoleArr.splice(isExist,1)
                     setSelectedRolesList(selectedRoleArr)
                    }
                    nonSelectedItem.push(currentRow)
                    const rolesList1 = [...nonSelectedRoleArr,...nonSelectedItem]
                    setDeSelectedRolesList(rolesList1)
                }
            }
            setTenantMembers([...tenantMembers])
        } catch(error: any){
            console.log(error.message);
        }
    }

    const isAllSelected = () => {
        if(tenantMembers){
            const numSelected = tenantMembers?.filter((item) => item.isPartOf && item.status !== Status.deactive);
            const numRows = tenantMembers?.filter((item) => item.status !== Status.deactive);
            return numSelected.length === numRows.length;
          }
          return false;
      }
    

    const selectAll=()=>{
        try{
            const list = JSON.parse(JSON.stringify(tenantMembers));
            if(isAllSelected()){
                list.forEach((row: any) =>{
                  if(!isSelectDisabled(row)){
                    row.isPartOf = false;
                    const currentItem= row.associatedCompanies.find((item: any)=>item.id === Number(pathMatch.params.companyId));
                    const index= row.associatedCompanies.indexOf(currentItem);
                    row.associatedCompanies.splice(index,1);
                  }
                });
              } else{
                list.forEach((row: any) =>{
                  if(!row.isPartOf){
                    row.associatedCompanies.push({status: Status.active,id: Number(pathMatch.params.companyId),name: '', isNew: false});
                  }
                  if(!isSelectDisabled(row)){
                    row.isPartOf = true;
                  }
                });
              }
              setTenantMembers(list);
        } catch(error: any){
            console.log(error.message);
        }
    
    }

    const teamsLooksGood = () => { 
        updateEmployees();
    }

    const updateEmployees = async () => {
        setSearchViewTable('');
        let isCurrentUserDisAssociated=false;
        try{
            const memberList = [...tenantMembers]
            const selectedRoleArr = [...selectedRolesList]
            const deSelectedRoleArr = [...deSelectedRolesList]
            if(selectedRoleArr.length){
                selectedRoleArr.forEach((item:any)=>{
                    let isItemExist = false
                    memberList.forEach((item1:any)=>{
                    if(item.id == item1.id){
                        isItemExist = true
                    }
                  })
                  if(!isItemExist)
                  memberList.push(item)
                })
              }
              if(deSelectedRoleArr.length){
                deSelectedRoleArr.forEach((item:any)=>{
                    let isItemExist = false
                    memberList.forEach((item1:any)=>{
                    if(item.id == item1.id){
                        isItemExist = true
                    }
                  })
                  if(!isItemExist)
                  memberList.push(item)
                })
              }
            const insertAssociation = memberList.filter((item: any)=> item.isPartOf && Status.null ===item.companyStatus &&
               !isSelectDisabled(item));
            const associateList = memberList.filter(item=> item.isPartOf && Status.deactive === item.companyStatus &&
              !isSelectDisabled(item));
            const disAssociateList = memberList.filter(item=> !item.isPartOf && !isSelectDisabled(item) &&
              (Status.invite === item.companyStatus || item.companyStatus === Status.active));
            
            const insertAccountOwner= memberList.filter((item: any)=> item.isPartOf && Status.null ===item.companyStatus &&
                item.role === 'Account Owner' && item.id !== decodeToken().userId);
            if(insertAccountOwner.length>0){
                insertAssociation.push(...insertAccountOwner);
            }
            
            const associateAccountOwner = memberList.filter(item=> item.isPartOf && Status.deactive === item.companyStatus &&
                item.role === 'Account Owner' && item.id !== decodeToken().userId);
            if(associateAccountOwner.length>0){
                associateList.push(...associateAccountOwner);
            }

            // Frame the request payload for the new company association to the user
            const insertCompanyAssociation: CompanyAssociations= new CompanyAssociations([]);
            insertAssociation.forEach(item=>{
              const userCompany= new UserCompanyAssociation(Number(pathMatch.params.companyId), item.id);
              insertCompanyAssociation.objects.push(userCompany);
            });
            const promiseList= [];
            const aasociateRole= decodeExchangeToken().allowedRoles.includes(tenantCompanyRole.createCompanyAssociation)?
            tenantCompanyRole.createCompanyAssociation:myCompanyUserRole.createMyCompanyAssociation;
            if(insertCompanyAssociation.objects.length>0){
              promiseList.push(client.mutate({
                 mutation: ASSOCIATE_USER_COMPANY,
                    variables:{
                        objects: insertCompanyAssociation.objects, 
                    },
                    context:{role: aasociateRole}
              }));
            }
            if(disAssociateList.filter((item: any)=> item.id === decodeExchangeToken().userId).length>0){
                isCurrentUserDisAssociated= true;
            }
            disAssociateList.forEach(item=>{
                const role= decodeExchangeToken().allowedRoles.includes(myCompanyRoles.updateMyCompanyAssociationStatus)?
                myCompanyRoles.updateMyCompanyAssociationStatus:tenantCompanyRole.updateCompanyAssociationStatus;
              
              const diassociationPayload= new UserCompanyDisAssociation(Number(pathMatch?.params?.companyId), Status.deactive, item.id);
              promiseList.push(
                client.mutate({
                    mutation: UPDATE_COMPANY_ASSOCIATION,
                       variables:{
                        companyId: diassociationPayload.companyId, 
                        status: diassociationPayload.status,
                        userId: diassociationPayload.userId
                       },
                       context:{role}
                 })
              );
            });
        
            associateList.forEach(item=>{
                const role= decodeExchangeToken().allowedRoles.includes(myCompanyRoles.updateMyCompanyAssociationStatus)?
                myCompanyRoles.updateMyCompanyAssociationStatus:tenantCompanyRole.updateCompanyAssociationStatus;
              const currentStatus= item.status=== Status.invite? Status.invite: Status.active ;
              const activatePayload= new UserCompanyDisAssociation(Number(pathMatch?.params?.companyId),currentStatus, item.id);
              promiseList.push(
                client.mutate({
                    mutation: UPDATE_COMPANY_ASSOCIATION,
                       variables:{
                        companyId: activatePayload.companyId, 
                        status: activatePayload.status,
                        userId: activatePayload.userId
                       },
                       context:{role}
                 })
              );
            });
            if(promiseList.length>0){
                dispatch(setIsLoading(true));
                await Promise.all(promiseList);
                dispatch(setIsLoading(false));
                fetchCompanyAssociation();
                setTableType('LIST_VIEW');
            } else{
                setTableType('LIST_VIEW');
            }
        }catch(err: any){
            console.log(err.message)
            dispatch(setIsLoading(false));
        }
    }

    
  const isSelectDisabled = (argEmployee: any): boolean => { 
    // check if the user part of the company
    if(argEmployee.status === Status.deactive){
        return true;
    }
    if(argEmployee.isPartOf){
        // condition for normal user linke account manager, Project User
        if(argEmployee.role !== 'Account Owner'){
        return argEmployee.associatedCompanies.filter((item:any)=>item.status !== Status.deactive).length===1;
        } else{
            // if the employee is account manager , same as logedin user
            if( argEmployee.id === decodeToken().userId){
                return argEmployee.associatedCompanies.filter((item:any)=>item.status !== Status.deactive).length===1;
            }
            return true;
        }
    }
    return false;
  }

  const handleInviteOthers = () => {
    const companyId = Number(pathMatch.params.companyId)
    history.push(`/base/teammates/invite/companies/${companyId}`, { companyId: companyId, source : "companies" });
  }


    return (
        <div className="companyMember">
        <div className="companyMember__description">

            {`Below you’ll find your company team. To edit this list, toggle the add & remove button 
              below and simply check or uncheck individuals from your
              account until your team is set. You can also invite new teammates to join your company if needed.`}

        </div>
        <div className="companyMember__container">
            <div className="companyMember__container__actions">
                <div className="companyMember__container__action-btns">
                    {  updateTenantCompany && companyDetailsState?.companyInfo?.active &&(
                        tableType === 'LIST_VIEW' ? (
                            <>
                                <Button
                                    data-testid={'edit-team'}
                                    disabled={!isCompanyActive}
                                    variant="outlined"
                                    className="team-btn btn-primary"
                                    size='small'
                                    onClick={() => tableViewToggle('EDIT_VIEW')}
                                >
                                    Edit team
                                </Button>
                                {canInviteCompanyUsers() && <Button
                                    // disabled={!canInviteCompanyUsers()}
                                    data-testid={'invite-team'}
                                    variant="outlined"
                                    className="team-btn"
                                    size='small'
                                    onClick={() => handleInviteOthers()}
                                >
                                    Invite others
                                </Button>}
                                <Button
                                    data-testid={'export-team-list'}
                                    variant="outlined"
                                    className="team-btn"
                                    size='small'
                                    disabled={true}
                                    // onClick={() => toggleView('list')}
                                >
                                    Export list
                                </Button>
                            </>
                        ): (
                            <>
                                <Button
                                    data-testid={'save-edit-team'}
                                    variant="outlined"
                                    className="team-btn  btn-primary"
                                    size='small'
                                    onClick={teamsLooksGood}
                                >
                                    Save Changes
                                </Button>
                                <Button
                                    data-testid={'cancel-edit-team'}
                                    variant="outlined"
                                    className="team-btn"
                                    size='small'
                                    onClick={() => tableViewToggle('LIST_VIEW')}
                                >
                                    Cancel Edit
                                </Button>
                            </>
                        )
                     )
                    }
                </div>
                <div className="companyMember__container__right">

                    {
                        tableType === 'LIST_VIEW' ? (
                            <>
                                <div className="companyMember__container__right__search">
                                    <TextField
                                        value={searchViewTable}
                                        id="team-list-search-text"
                                        type="text"
                                        fullWidth
                                        placeholder="Search"
                                        autoComplete='off'
                                        variant="outlined"
                                        onChange={(e) => handleSearchChange(e.target.value, 'view')}
                                    />
                                    <SearchIcon className="companyMember__container__right__search__icon"/>
                                </div>
                                <span className="companyMember__container__users-count">
                                    Showing { companyMembers?.length > 1 ? `${companyMembers?.length} entries` : 
                                    `${companyMembers?.length} entry`}
                                </span>
                            </>    
                        ): (
                            <>
                                <div className="companyMember__container__right__search">
                                    <TextField
                                        value={searchEditTable}
                                        id="edit-team"
                                        type="text"
                                        fullWidth
                                        placeholder="Search"
                                        autoComplete='off'
                                        variant="outlined"
                                        onChange={(e) => handleSearchChange(e.target.value, 'edit')}
                                    />
                                    <SearchIcon className="companyMember__container__right__search__icon"/>
                                </div>
                                <span className="companyMember__container__users-count">
                                    Showing { tenantMembers?.length > 1 ? `${tenantMembers?.length} entries` : 
                                    `${tenantMembers?.length} entry`}
                                </span>
                            </>    
                        )
                    }

                </div>
            </div>

            <div className="companyMember__container__lists">
                    {
                        tableType === 'LIST_VIEW' ? (
                            <CompanyAssociationTable companyMembersData={companyMembers}/>
                        ): (
                            <CompanyTenantAssociationTable tenantMembersData={tenantMembers} 
                                toggleUserSelection={toggleUserSelection} 
                                selectAll={selectAll}/>
                        )
                    }
            </div>
        </div>
    </div>
    )
}
