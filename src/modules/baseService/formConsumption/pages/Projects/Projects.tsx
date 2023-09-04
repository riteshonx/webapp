import React, { ReactElement, useContext, useEffect, useState } from 'react';
import Header from '../../../../shared/components/Header/Header';
import projectIcon from '../../../../../assets/images/project.png'
import './Projects.scss';
import { tenantUserRole } from '../../../../../utils/role';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { setIsLoading } from '../../../../root/context/authentication/action';
// import Notification,{ AlertTypes } from "../../../../shared/components/Toaster/Toaster";
import { ProjectLists } from '../../graphql/models/dataModels';
import { useHistory } from 'react-router-dom';
import { client } from '../../../../../services/graphql';
import { LOAD_USER_PROJECTS } from '../../../../../graphhql/queries/projects';
import { decodeToken } from '../../../../../services/authservice';

export default function Projects(): ReactElement {
    const {dispatch }:any = useContext(stateContext);
    const [projectList, setProjectList] = useState<Array<ProjectLists>>([]);
    const history= useHistory();

    useEffect(() => {
        getProjectLists()
    }, []);


    const getProjectLists= async()=>{
        try{
        dispatch(setIsLoading(true));
        const projectsResponse= await client.query({
            query:LOAD_USER_PROJECTS,
            // variables:{
            //   userId: decodeToken().userId,
            // },
            fetchPolicy: 'network-only',
            context:{role: tenantUserRole.viewTenantUsers}
          });
          const projects: Array<any>=[];
          if(projectsResponse.data.tenantAssociation.length>0){
            if(projectsResponse.data.tenantAssociation[0].projectAssociations.length>0){
              projectsResponse.data.tenantAssociation[0].projectAssociations.forEach((element: any) => {
                element.status!==1? projects.push(element.project):null;
              });
            }
          }
          setProjectList(projects);
          dispatch(setIsLoading(false));
        }catch(err){
            console.log(err);
            dispatch(setIsLoading(false));
        }
    }
    const selectedProject = (project:ProjectLists ) => {
        history.push(`/base/projects/${Number(project.id)}/form/${'2'}`)
    }

    return (
        <div className="project-wrapper">
            <Header header={"Projects"} />
            <div className="projects">
                {
                   projectList.map((project) => {
                      return (
                        <div key={project.id} className="projects__users" onClick={() => selectedProject(project)}>
                            <div className="projects__user-avatar">
                                <img className="avatar-icon" src={projectIcon} alt='user-avatar' />
                            </div>
                            <div className="projects__user-name">
                                <div>{project?.name}</div>
                            </div>
                        </div>
                       )
                   })
                }
            </div>
        </div>
    )
}
