import Button from '@material-ui/core/Button'
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { match, useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import './ProjectSettingsSideBar.scss';
import projectIcon from '../../../../../assets/images/project.png';
import { navSettings } from '../../../../../utils/projectMetrics';
import { projectDetailsContext } from '../../Context/ProjectDetailsContext';
import { setProjecDetailsView } from '../../Context/ProjectDetailsActions';
import { FETCH_PROJECT_BY_ID } from '../../../../../graphhql/queries/projects';
import { myProjectRole, tenantProjectRole } from '../../../../../utils/role';
import { decodeExchangeToken, decodeProjectExchangeToken, getExchangeToken } from '../../../../../services/authservice';
import { client } from '../../../../../services/graphql';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { setIsLoading } from '../../../../root/context/authentication/action';
import BackNavigation from 'src/modules/shared/components/BackNavigation/BackNavigation';
import CommonHeader from "../../../../shared/components/CommonHeader/CommonHeader"
import Tooltip from '@material-ui/core/Tooltip';


export interface Params {
    projectId: string;
}

export default function ProjectSettingsSideBar(): ReactElement {

    const {dispatch }:any = useContext(stateContext)
    const pathMatch:match<Params>= useRouteMatch();
    const history: any= useHistory();
    const [settingsNavList, setSettingsNavList] = useState<Array<any>>([]);
    const {projectDetailsState, projectDetailsDispatch}: any = useContext(projectDetailsContext);
    const location = useLocation();
    const [projectDetails, setProjectDetails] = useState<any>();

    useEffect(() => {
        setSettingsNavList(navSettings);
    }, []);

    useEffect(() => {
       if(Number(pathMatch?.params?.projectId) && projectDetailsState.projectToken ){
            fetchProjectDetail();
       }
    }, [projectDetailsState.projectToken])

    const toggleView = (view: string) => {
        view === 'DETAILS' ? projectDetailsDispatch(setProjecDetailsView('DETAILS')) : projectDetailsDispatch(setProjecDetailsView('TEAMS'));
        history.push(`/base/project-lists/${Number(pathMatch?.params?.projectId)}/details`);
    }

    const handleNavigate = (navItem: any) => {
        history.push(`/base/project-lists/${Number(pathMatch?.params?.projectId)}/${navItem.route}`);
    }

    const fetchProjectDetail= async()=>{
        try{
            dispatch(setIsLoading(true));
            const role= decodeExchangeToken().allowedRoles.includes(tenantProjectRole.viewTenantProjects)?
            tenantProjectRole.viewTenantProjects:myProjectRole.viewMyProjects;   
            const token= decodeExchangeToken().allowedRoles.includes(tenantProjectRole.viewTenantProjects)?getExchangeToken():
            projectDetailsState.projectToken!=='EMPTY' &&
            decodeProjectExchangeToken(projectDetailsState.projectToken).allowedRoles.includes(tenantProjectRole.viewTenantProjects)?
            projectDetailsState.projectToken:getExchangeToken();
            const projectsResponse= await client.query({
                query: FETCH_PROJECT_BY_ID,
                variables:{
                    id: Number(pathMatch?.params?.projectId),
                    userId: decodeExchangeToken().userId,
                },
                fetchPolicy: 'network-only',
                context:{role,token}
            });
            if(projectsResponse.data.project.length>0){
               
                projectsResponse.data.project?.forEach((project: any) => {
                    let address='';
                    if(project?.addresses.length>0){
                        address=`${project?.addresses[0]?.fullAddress}`;
                    } 
                    const newItem = {
                        name: project?.name,
                        status: project?.status,
                        id: project?.id,
                        address,
                        type: project?.config?.type,
                        stage: project?.config?.stage,
                        projectCode: project?.config?.projectCode
                    }
                    setProjectDetails(newItem);
                })
            }
            dispatch(setIsLoading(false));
           
        }catch(error){
            console.log(error);
            dispatch(setIsLoading(false));
        }
    }
    const navigateback = ()=>{
        history.goBack()
    }
    return (
        <div className="left-navBar">
            {/* <div className="left-navBar__toggle">
                    <div className="left-navBar__toggle__header">
                        <div className="left-navBar__toggle__toggle-btn">
                            <div className="left-navBar__toggle__g-view" onClick={() => toggleView('DETAILS')}>Details</div>
                        </div>
                        <div className="left-navBar__toggle__toggle-btn">
                            <div className="left-navBar__toggle__g-view" onClick={() => toggleView('TEAMS')}>Teams</div>
                        </div>
                        <div className="left-navBar__toggle__toggle-btn">
                            <Button
                                data-testid={'teams-view'}
                                variant="outlined"
                                className="toggle-primary"
                                // onClick={() => toggleView('SETTINGS')}
                            >
                                Settings  
                            </Button>
                       
                        </div>
                    </div>
                </div> */}
                <div className="left-navBar__project">
                    <div className="left-navBar__project__wrapper">
                       <div className="left-navBar__project_navBack">
                       {history?.location?.state?.from &&<CommonHeader navigate={navigateback}/>}
                       </div>
                        <div className="left-navBar__project__avatar">
                            <img className="avatar-icon" src={projectIcon} alt='user-avatar' />
                        </div>
                    </div>
                    <div  className="left-navBar__project__details">
                        <div className="left-navBar__project__details__name">
                            <Tooltip title={projectDetails?.name} aria-label="first name">
                                <label>
                                { (projectDetails?.name && projectDetails?.name.length > 18) ? 
                                `${projectDetails?.name.slice(0, 18)} . . .`: projectDetails?.name }
                                </label>
                            </Tooltip>
                        </div>
                        <div className="left-navBar__project__details__address">
                            <Tooltip title={projectDetails?.address} aria-label="first name">
                                <label>
                                { (projectDetails?.address && projectDetails?.address.length > 80) ? 
                                `${projectDetails?.address.slice(0,75)} . . .`: projectDetails?.address }
                                </label>
                            </Tooltip>
                        </div>
                    </div>
                </div>

                <div className="left-navBar__wrapper">
                    {
                        settingsNavList.map((item: any) => {
                            return (
                                <div className="left-navBar__item" key={item.route} onClick={() => handleNavigate(item) }>
                                    {
                                        location?.pathname.includes(item.route)  && <div className="left-navBar__item__active"></div>
                                    }
                                    <div className="left-navBar__item__content">
                                        <div className="left-navBar__item__content__text">{item.name}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }

                </div> 

        </div>
    )
}
