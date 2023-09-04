import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { match, useHistory, useRouteMatch } from 'react-router-dom';
import { useDebounce } from '../../../../../customhooks/useDebounce';
import { decodeExchangeToken } from '../../../../../services/authservice';
import { client } from '../../../../../services/graphql';
import { CustomListRoles, myCompanyRoles, tenantCompanyRole } from '../../../../../utils/role';
import { setIsLoading } from '../../../../root/context/authentication/action';
import { stateContext } from '../../../../root/context/authentication/authContext';
import Header from '../../../../shared/components/Header/Header';
import NoDataMessage from '../../../../shared/components/NoDataMessage/NoDataMessage';
import CompanyAction from '../../components/CompanyAction/CompanyAction';
import CompanyCreate from '../../components/CompanyCreate/CompanyCreate';
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import CompanyLists from '../../components/CompanyLists/CompanyLists';
import CompanyTable from '../../components/CompanyTable/CompanyTable';
import UpdateCompany from '../UpdateCompany/UpdateCompany';
import { FETCH_TENANT_COMPANIES ,FETCH_COMPANY_COUNT} from '../../graphql/queries/companies';
import './CompaniesLanding.scss';
import { updateTenantCompany, viewTenantCompanies } from '../../../roles/utils/permission';
import { FETCH_COMPABY_TYPE } from '../../../forms/grqphql/queries/customList';
import CommonHeader from "../../../../shared/components/CommonHeader/CommonHeader"
import NoPermission from 'src/modules/shared/components/NoPermission/NoPermission';
import { Grid } from '@material-ui/core';
import RowSelectionPerPage from 'src/modules/baseService/formConsumption/components/FormToTaskLinkOption/RowSelectionPerPage';
import PaginationComponent from 'src/modules/baseService/formConsumption/components/FormToTaskLinkOption/PaginationComponent';

const header = {
    name: 'Companies',
    description: 'View all companies inside your account.'
}

const noPermissionMessage = "You don't have permission to view companies";

export interface Params {
    companyId: string;
}

let companiesId: any = []

export default function CompaniesLanding(): ReactElement {

    const {dispatch , state}:any = useContext(stateContext)
    const history = useHistory();
    const pathMatch:match<Params>= useRouteMatch();
    const [isGridView, setIsGridView] = useState(true);
    const [searchText, setsearchText] = useState('');
    const debounceName = useDebounce(searchText, 1000);
    const [companyCount, setCompanyCount] = useState<any>(0);
    const [isCreate, setIsCreate] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);
    const [companyListData, setCompanyListData] = useState<Array<any>>([]);
    const [companyIds, setCompanyIds] = useState<Array<any>>([]);
    const [companyTypes, setCompanyTypes] = useState<Array<any>>([]);
    const [page, setPage] = useState(1);
    const [recordCount, setRecordCount] = useState(10);
    const [totalRecords,setTotalRecords] = useState<any>(0);
    const [limit,setLimit] = useState<any>(10);
    const [offsetVal,setOffsetVal] = useState<any>(0);
    const [offsetValForSearch,setOffsetValForSearch] = useState<any>(0);

    useEffect(() => {
        if(viewTenantCompanies){
            fetchCompanies();
            fectchCompanyCount()
        }
        if(updateTenantCompany){
            fetchCustomLists();
        }
        if(Number(pathMatch?.params?.companyId)){
            setIsUpdate(true);
        }
        return () => {
            companiesId = [];
            setCompanyIds(companiesId);
        }
    }, []);

    useEffect(() => {
        refreshList();
    }, [debounceName])

    const refreshList = () => {
        if(viewTenantCompanies){
            if(!isGridView){
                setRecordCount(10)
                setLimit(10)
                setPage(1)
                setOffsetValForSearch(0)
            }
            fetchCompanies();
            fectchCompanyCount()
        }
    }

    const navigateBack = () => {
        history.push(`/`)
    }

    const handleToggle = (view: string) => {
        view === 'grid' ? setIsGridView(true) : setIsGridView(false);
    }

    const searchTaskByName = (value: string) => {
        setsearchText(value)
    }

    const handleSideBar = (value: boolean) => {
        setIsCreate(value);
    }

    const handleCloseUpdateSideBar = () => {
        history.push(`/base/companies`);
        setIsUpdate(false)
    }

    useEffect(() => {
        if(isGridView)
        setPage(1)
        if(debounceName && debounceName !="" ){
            const offVal = recordCount*(page-1)
            fetchCompanies(offVal);
        }else
        if(decodeExchangeToken().allowedRoles.includes(tenantCompanyRole.viewTenantCompanies)||
        decodeExchangeToken().allowedRoles.includes(myCompanyRoles.viewMyCompanies)){
            fetchCompanies();
        }
    }, [page,isGridView])

    useEffect(() => {
        if(debounceName && debounceName !="" ){
            const offVal=0
            fetchCompanies(offVal);
        }else
        if(decodeExchangeToken().allowedRoles.includes(tenantCompanyRole.viewTenantCompanies)||
        decodeExchangeToken().allowedRoles.includes(myCompanyRoles.viewMyCompanies)){
            fetchCompanies();
        }
        if(isGridView)
        setPage(1)
    }, [recordCount]);


    const fetchCompanies = async(offVal?:any)=>{
        try{
            const role= decodeExchangeToken().allowedRoles.includes(tenantCompanyRole.viewTenantCompanies)?tenantCompanyRole.viewTenantCompanies:
            myCompanyRoles.viewMyCompanies;
            dispatch(setIsLoading(true));
            const limit = isGridView?1000:recordCount;
            const offset = isGridView?0:(debounceName && debounceName !=""?(offVal?offVal:offsetValForSearch):recordCount*(page-1));
            setOffsetVal(offset);
            const compananyResponse= await client.query({
                query:FETCH_TENANT_COMPANIES,
                variables:{
                    limit: limit,
                    offset: offset,
                    searchText: `%${debounceName}%`,
                    userId: decodeExchangeToken().userId,
                },
                fetchPolicy: 'network-only',
                context:{role}
            });
            const companies: Array<any>=[];
            if(compananyResponse.data.tenantCompanyAssociation.length>0){
                companies.push(...compananyResponse.data.tenantCompanyAssociation);
            }
            companiesId = [];
            if(companies.length > 0 ){
                companies.forEach((company: any) => {
                    companiesId.push(company.id)
                })
            }
            setCompanyIds(companiesId);

            setCompanyListData(companies);
            setCompanyCount(companies.length)
            dispatch(setIsLoading(false));
        }catch(error){
            dispatch(setIsLoading(false));
        }
    }

    const fectchCompanyCount = async ()=>{
        try{
            const role= decodeExchangeToken().allowedRoles.includes(tenantCompanyRole.viewTenantCompanies)?tenantCompanyRole.viewTenantCompanies:
            myCompanyRoles.viewMyCompanies;
            dispatch(setIsLoading(true));
            const compananyResponse= await client.query({
                query:FETCH_COMPANY_COUNT,
                variables:{
                    searchText: `%${debounceName}%`,
                    userId: decodeExchangeToken().userId,
                },
                fetchPolicy: 'network-only',
                context:{role}
            });
            if(compananyResponse.data && compananyResponse.data?.tenantCompanyAssociation_aggregate && compananyResponse.data.tenantCompanyAssociation_aggregate?.aggregate)
            setTotalRecords(compananyResponse.data.tenantCompanyAssociation_aggregate.aggregate.count)
        }catch(error){
            console.log(error);
            dispatch(setIsLoading(false));
        }
    }

    const fetchCustomLists = async()=>{
        try{
            dispatch(setIsLoading(true));
            const role= decodeExchangeToken().allowedRoles.includes(tenantCompanyRole.updateTenantCompany)?tenantCompanyRole.updateTenantCompany:
            myCompanyRoles.updateMyCompany;
            const customListsResponse= await client.query({
                query: FETCH_COMPABY_TYPE,
                variables:{
                    listType: 'Company Type',
                    userId: decodeExchangeToken().userId,
                },
                fetchPolicy: 'network-only',
                context:{role}
            });
            const companyTypesLists: Array<any>=[];
            if(customListsResponse.data.configurationLists.length>0){
                const tradeLists = customListsResponse.data.configurationLists.filter((item: any) => item.name === 'Company Type')
                companyTypesLists.push(...tradeLists[0]?.configurationValues);
                setCompanyTypes(companyTypesLists);
            }

            dispatch(setIsLoading(false));
              
        }catch(error){
            console.log(error);
            dispatch(setIsLoading(false));
        }
    }


    return (
        <div className="companyLanding">
            {
                viewTenantCompanies ? (
                    <>
                        <CommonHeader headerInfo={header}/> 

                            <CompanyAction viewType={isGridView} toggle={handleToggle} searchText={searchText} searchTask={searchTaskByName}
                                createCompany={handleSideBar} companyCount={companyCount}/>
                            {
                                isGridView ? (
                                        <CompanyLists companyLists={companyListData} UpdateCompany={() => setIsUpdate(true)}/>
                                ) : (
                                    <>
                                        <CompanyTable companyLists={companyListData} UpdateCompany={() => setIsUpdate(true)}/>
                                        <Grid container >
                                            <Grid item xs={6}><span className="companyLanding_label">Showing</span> {offsetVal+1}-{page*recordCount<totalRecords ? page*recordCount:totalRecords} of {totalRecords}</Grid>
                                            <Grid item xs={3}>
                                                <RowSelectionPerPage
                                                rowsPerPage={limit}
                                                onChangeRowsPerPage={(e: any) => {setLimit(e.target.value);
                                                    setRecordCount(e.target.value);
                                                    setPage(1)
                                                }
                                                }
                                                />
                                            </Grid>
                                            <Grid item xs={3}>
                                            <PaginationComponent 
                                                count={totalRecords>0?Math.ceil(totalRecords/recordCount):0} 
                                                page={page} 
                                                onChange={(e: any, value: number) => {
                                                    setPage(value);
                                                }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </>
                                )
                            }

                            {/* create side bar */}
                            {
                                isCreate && (
                                    <CompanyCreate closeSideBar={handleSideBar} companyTypes={companyTypes} 
                                    companyIds={companyIds} refresh={() => refreshList()}/>
                                )
                            }

                            {/* update side bar */}
                            {
                                isUpdate && (
                                    <UpdateCompany closeUpdateSideBar={handleCloseUpdateSideBar} refresh={() => refreshList()} />
                                )
                            }
                    </>        
                ) : 
                !state.isLoading ? (
                    <NoPermission header={"Companies"} navigateBack={navigateBack} noPermissionMessage={noPermissionMessage}/>
              ) : ('')
            }

        </div>
    )
}
