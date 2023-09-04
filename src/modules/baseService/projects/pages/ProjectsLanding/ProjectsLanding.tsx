import React, { ReactElement, useContext, useEffect, useState } from 'react';
import CommonHeader from "../../../../shared/components/CommonHeader/CommonHeader"
import ProjectAction from '../../components/ProjectAction/ProjectAction';
import ProjectLists from '../../components/ProjectLists/ProjectLists';
import ProjectTable from '../../components/ProjectTable/ProjectTable';
import './ProjectsLanding.scss';
import { match, useHistory, useRouteMatch } from 'react-router-dom';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { setIsLoading } from '../../../../root/context/authentication/action';
import { client } from '../../../../../services/graphql';
import { LOAD_USER_PROJECTS_BY_QUERY } from '../../../../../graphhql/queries/projects';
import { decodeExchangeToken } from '../../../../../services/authservice';
import { myProjectRole, tenantProjectRole } from '../../../../../utils/role';
import { useDebounce } from '../../../../../customhooks/useDebounce';
import ProjectCreate from '../../components/ProjectCreate/ProjectCreate';
import UpdateProject from '../UpdateProject/UpdateProject';
import { canViewProjects } from '../../../roles/utils/permission';
import NoPermission from 'src/modules/shared/components/NoPermission/NoPermission';
import { resetProjectDetails, setProjecDetailsView } from '../../Context/ProjectDetailsActions';
import { projectDetailsContext } from '../../Context/ProjectDetailsContext';

const header = {
    name: 'Projects',
    description: 'View all projects inside your account.'
}

export interface Params {
    projectId: string;
}

const noPermissionMessage = "You don't have permission to view projects";

export default function Projects(): ReactElement {
    const {dispatch , state}:any = useContext(stateContext);
    const {projectDetailsDispatch}: any = useContext(projectDetailsContext);
    const [isGridView, setIsGridView] = useState(true);
    const history = useHistory();
    const pathMatch:match<Params>= useRouteMatch();
    const [projectListData, setProjectListData] = useState<Array<any>>([]);
    const [searchText, setsearchText] = useState('');
    const debounceName = useDebounce(searchText, 1000);
    const [isCreate, setIsCreate] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);
    const [projectCount, setProjectCount] = useState<any>(0);

    useEffect(() => {
        fetchProjects();
        if(Number(pathMatch?.params?.projectId)){
            setIsUpdate(true);
        }
        projectDetailsDispatch(resetProjectDetails({
            projectDetails: [],
            projectInfo: null,
            projectMetricsDetails: null,
            projectDetailsDirty: false,
            projectDetailsView: null,
            projectToken: null,
            projectPermission: {}
        }));
        projectDetailsDispatch(setProjecDetailsView(null))
    }, []);

    useEffect(() => {
        refreshList();
    }, [debounceName])

    const refreshList = () => {
        fetchProjects();
    }

    const fetchProjects= async()=>{
        try{
            const role= decodeExchangeToken().allowedRoles.includes(tenantProjectRole.viewTenantProjects)?tenantProjectRole.viewTenantProjects:
                myProjectRole.viewMyProjects;
            dispatch(setIsLoading(true));
            const projectsResponse= await client.query({
                query:LOAD_USER_PROJECTS_BY_QUERY,
                variables:{
                    searchText: `%${debounceName}%`,
                    offset: 0,
                    limit: 1000,
                    userId: decodeExchangeToken().userId,
                },
                fetchPolicy: 'network-only',
                context:{role}
            });
            const projects: Array<any>=[];
            if(projectsResponse.data.project.length>0){
                projectsResponse.data.project.forEach((item: any) => {
                    let portfolioVal:any = [];
                    if(item?.projectPortfolioAssociations && item?.projectPortfolioAssociations.length){
                        item.projectPortfolioAssociations.forEach((data:any)=>{
                            portfolioVal.push(data?.portfolio?.name || "")
                        })
                        portfolioVal = portfolioVal.length>0?portfolioVal.join(","):"";
                        }
                        let adress='';
                        if(item?.addresses.length>0){
                            adress=`${item?.addresses[0]?.fullAddress}`;
                        } else{
                            adress=item?.address?`${item?.address?.city}, 
                                ${item?.address?.state}, ${item?.address?.country}, ${item?.address?.pin}`:'';
                        }
                        const newItem = {
                            address: adress,
                            config: item?.config,
                            id: item?.id,
                            location: item?.location,
                            metrics: item?.metrics,
                            name: item?.name,
                            status:item?.status,
                            portfolio:portfolioVal.length?portfolioVal:""
                        }
                        projects.push(newItem)
                    })
            }

            setProjectListData(projects);
            setProjectCount(projects.length)
            dispatch(setIsLoading(false));
        }catch(error){
            console.log(error);
            dispatch(setIsLoading(false));
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
        history.push(`/base/project-lists`);
        setIsUpdate(false)
    }

    return (
        <div className="projectLanding">
            {
                canViewProjects ? (
                    <>
                        <CommonHeader headerInfo={header}/> 

                            <ProjectAction viewType={isGridView} toggle={handleToggle} searchText={searchText} searchTask={searchTaskByName}
                                createProject={handleSideBar} projectCount={projectCount}/>
                            {
                                isGridView ? (
                                    <ProjectLists projectList={projectListData} updateProject={() => setIsUpdate(true)}/>
                                ) : (
                                    <ProjectTable projectList={projectListData} updateProject={() => setIsUpdate(true)}/>
                                )
                            }

                            {/* create side bar */}
                            {
                                isCreate && (
                                    <ProjectCreate closeSideBar={handleSideBar} refresh={() => refreshList()}/>
                                )
                            }

                            {/* update side bar */}
                            {
                                isUpdate && (
                                    <UpdateProject closeUpdateSideBar={handleCloseUpdateSideBar} refresh={() => refreshList()} />
                                )
                            }
                    </>        
                ) : 
                !state.isLoading ? (
                    <NoPermission header={"Projects"} navigateBack={navigateBack} noPermissionMessage={noPermissionMessage}/>
              ) : ('')
            }

        </div>
    )
}
