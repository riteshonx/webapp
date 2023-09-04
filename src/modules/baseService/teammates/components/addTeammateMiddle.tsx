import React, { ReactElement, useState } from "react";
import { useEffect } from "react";
import { Select, MenuItem, Tooltip, TextField, IconButton } from "@material-ui/core";
import { Droppable, DragDropContext, Draggable } from "react-beautiful-dnd";
import "./addTeamMiddle.scss";
import CrossIcon from "@material-ui/icons/HighlightOff";
import { truncate } from "../../../../utils/helper";
import {
  canCreateCompany,
  canCreateTenantProject,
} from "../../../../services/permission";
import { useRouteMatch } from "react-router-dom";
import projectIcon from "../../../../assets/images/project.png";
import { canViewProjectsRole ,canUpdateUsers, canUpdateProjects} from "src/services/permission";


/// companies add and edit components

export function TeammateAddEditCompanies(props: any): ReactElement {
  const [companies, setCompanies] = useState<Array<any>>([]);
  const [companyError, setCompanyError] = useState(false);
  const [selectedCompaniesHighlight, setSelectedCompaniesHighlight] = useState<
    Array<any>
  >([]);
  const [selectedId, setSelectedId]: any = useState(null);
  const pathMatch: any = useRouteMatch();

  useEffect(() => {
    if (props.companies) {
      setCompanies(props.companies);
    }
  }, [props?.companies?.length]);

  useEffect(() => {
    if (props?.selectedCompanies) {
      if (props?.selectedCompanies.length > 0) {
        const temp: any = [];

        for (let i = 0; i < props.selectedCompanies.length; i++) {
          if (props.selectedCompanies[i].companyId) {
            temp.push(props.selectedCompanies[i].companyId);
          } else if (props.selectedCompanies[i].id) {
            temp.push(props.selectedCompanies[i].id);
          }
        }
        setSelectedCompaniesHighlight(temp);
      } else if (props.selectedCompanies.length === 0) {
        setSelectedCompaniesHighlight([]);
      }
    }
  }, [props?.selectedCompanies.length]);

  const handleUnique = (value: any, index: any, self: any) => {
    return self.indexOf(value) === index;
  };

  const handleSelectedCompanies = (company: any) => {

    const urlPathName  = window.location.pathname
    if(!urlPathName.includes("companies")){
       props?.handleSelectedCompanies && props?.handleSelectedCompanies(company);
    }
  };

  useEffect(() => {
    if (props.companyError) {
      setCompanyError(true);
    }
  }, [props?.companyError]);

  const onDragEnd = () => {
    null;
  };

  const handleMouseEnterCompanies = (id: any) => {
    setSelectedId(id);
  };
  const handleMouseLeave = () => {
    setSelectedId(null);
  };

  const handleAddNewCompany = () => {
    props.handleAddNewCompany && props.handleAddNewCompany();
  };

  return (
    <>
        {companies.length>0?(
           <Droppable droppableId="lists">
           {(provided: any) => (
             <div
               {...provided.droppableProps}
               ref={provided.innerRef}
               className="addTeamMiddle__parentView"
             >
               {companies &&
                 companies.length !== 0 &&
                 companies.map((company: any, index: number) => (
                   <Draggable
                     key={`${company.id}-`}
                     draggableId={`${index}1`}
                     index={company.id}>
                     {(provided: any) => (
                       <>
                         <div onMouseLeave={() => handleMouseLeave()}
                           onMouseEnter={() => handleMouseEnterCompanies(company.id)}
                           {...provided.draggableProps}
                           ref={provided.innerRef}
                           {...provided.dragHandleProps}>
                         <div className="addTeamMiddle__companiesImageView">
                             <Tooltip title={company.name} placement="bottom">
                             <img
                               onClick={() => handleSelectedCompanies(company)}
                               className={
                                 // !props?.edit &&
                                 selectedCompaniesHighlight.indexOf(company.id) > -1
                                   ? "addTeamMiddle__avatar_selected"
                                   : "addTeamMiddle__avatar"
                               }
                               src={
                                projectIcon
                               }
                               alt="user-avatar"
                             />
                             </Tooltip>
                             <div className="addTeamMiddle__companyNameText">
                               {/* {truncate(company.name)} */}
                               {company.name ? (
                                <div title={company.name} className="addTeamMiddle__companyNameText_overflow">
                                {company.name}
                              </div>
                               ) : (
                                 ""
                               )}
                             </div>
                         </div>
                         </div>
     
                         {/* {provided.placeHolder} */}
                       </>
                     )}
                   </Draggable>
                 ))}
     
               {props?.companyError && companyError && (
                 <div className="addTeamMiddle__error">
                   * Every teammate must be associated with atleast 1 company
                 </div>
               )}
             </div>
           )}
         </Droppable>
        ):(
          <div className="noItemsFound">No Companies found</div>
        )}
    </>
  );
}

export function TeammateAddEditCompaniesDropArea(props: any): ReactElement {
  const [companies, setCompanies] = useState<Array<any>>([]);
  const [companyError, setCompanyError] = useState(false);
  const [selectedCompaniesHighlight, setSelectedCompaniesHighlight] = useState<
    Array<any>
  >([]);
  const [selectedId, setSelectedId]: any = useState(null);

  useEffect(() => {
    if (props.companies) {
      setCompanies(props.companies);
    }
  }, [props?.companies?.length]);

  const handleSelectedCompanies = (company: any) => {
    const urlPathName  = window.location.pathname
    if(!urlPathName.includes("companies")){
    props?.handleSelectedCompanies && props?.handleSelectedCompanies(company);
    }
  };

  useEffect(() => {
    if (props.companyError) {
      setCompanyError(true);
    }
  }, [props?.companyError]);

  const handleMouseEnterCompanies = (company: any) => {
    if(company?.id){
      setSelectedId(company.id);
    }else {
      setSelectedId(company.companyId);
    }
    
  };
  const handleMouseLeave = () => {
    setSelectedId(null);
  };

  const handleSelectedTypeOfView = () => {
    props?.handleSelectedTypeOfView &&
      props?.handleSelectedTypeOfView("companies");
  };


  return (
    <Droppable droppableId="dropArea">
      {(provided: any) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className="addTeamMiddle__parentView"
        >
          {companies &&
            companies.length !== 0 &&
            companies.map((company: any, index: number) => (
              <div
                key={index}
                onMouseLeave={() => handleMouseLeave()}
                onMouseEnter={() => handleMouseEnterCompanies(company)}
              >
                <div
                className="addTeamMiddle__companiesImageView"
                >
                  {
               (selectedId === company.id || selectedId === company.companyId) &&   props?.edit && (
                    <div
                    className="addTeamMiddle__companiesImageCross"
                    
                    >
                      <div>
                        {" "}
                        <CrossIcon
                          onClick={() => handleSelectedCompanies(company)}
                          className="addTeamMiddle__crossSize"
                        />
                      </div>
                      <div>
                        {company?.company?.name
                          ? truncate(company?.company?.name)
                          : truncate(company.name)}
                      </div>
                    </div>
                  )
                  }
                  <img
                    // onClick={() => handleSelectedCompanies(company)}
                    className={
                      !props?.edit &&
                      selectedCompaniesHighlight.indexOf(company.id) > -1
                        ? "addTeamMiddle__avatar_companies"
                        : "addTeamMiddle__avatar_companies_selected"
                    }
                    src={
                      projectIcon
                    }
                    alt="user-avatar"
                  />
                   <div className="addTeamMiddle__companyNameText">
                          {/* {truncate(company.name)} */}
                          {company.name ? (
                        <div title={company.name} className="addTeamMiddle__companyNameText_overflow">
                          {company.name}
                        </div>
                          ) : company.company.name ? (
                            <div>
                            {company.company.name.split(" ")[0]} <br></br>
                            {company.company.name.split(" ")[1] &&
                              company.company.name.split(" ")[1]}{" "}
                            <br></br>
                            {company.company.name.split(" ")[2] &&
                              truncate(company.company.name.split(" ")[2])}
                          </div>
                          )
                        : ""}
                        </div>
                </div>
              </div>
            ))}
          <div className="addTeamMiddle__plusDiv" >
            <IconButton
              onClick={() => handleSelectedTypeOfView()}
              className="addTeamMiddle__plus_small"
            >
              +
            </IconButton>
            <div className="addTeamMiddle__companyNameText">
              Add new<br></br>company
            </div>
          </div>
          {props?.companyError && companyError && (
            <div className="addTeamMiddle__error">
              * Every teammate must be associated with atleast 1 company
            </div>
          )}
        </div>
      )}
    </Droppable>
    // </DragDropContext>
  );
}

/// projects add and edit components

export function TeammateAddProjects(props: any): ReactElement {
  const [projects, setProjects] = useState<Array<any>>([]);
  const [selectedProjectsHighlight, setSelectedProjectsHighlight] = useState<
    Array<any>
  >([]);
  const pathMatch: any = useRouteMatch();

  useEffect(() => {
    if (props?.selectedProjects) {
      if (props?.selectedProjects.length > 0) {
        const temp: any = [];

        for (let i = 0; i < props.selectedProjects.length; i++) {
          if (props.selectedProjects[i].projectId) {
            temp.push(props.selectedProjects[i].projectId);
          } else if (props.selectedProjects[i].id) {
            temp.push(props.selectedProjects[i].id);
          }
        }
        setSelectedProjectsHighlight(temp);
      } else if (props.selectedProjects.length === 0) {
        setSelectedProjectsHighlight([]);
      }
    }
  }, [props?.selectedProjects.length]);

  useEffect(() => {
    if (props.projects) {
      setProjects(props.projects);
    }
  }, [props.projects.length]);

  const handleSelectedProjects = (project: any) => {
    const urlPathName  = window.location.pathname
    if(!urlPathName.includes("projects") && canUpdateProjects()){
    const temp = selectedProjectsHighlight;
    if (temp.length == 0) {
      temp.push(project.id);
    } else {
      if (temp.indexOf(project.id) > -1) {
        temp.splice(temp.indexOf(project.id), 1);
      } else {
        temp.push(project.id);
      }
    }
    setSelectedProjectsHighlight(temp);

    props?.handleSelectedProjects(project);
  }
  };

  const handleAddNewProject = () => {
    props.handleAddNewProject && props.handleAddNewProject();
  };

  return (
    <>
    {projects.length>0?(
      <Droppable droppableId="listsProjects">
      {(provided: any) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className="addTeamMiddle__projectArea"
        >
          
          {
          projects &&
            projects.length !== 0 &&
            projects.map((project: any, index: number) => (
              <Draggable
                key={`${index}3`}
                draggableId={`${index}3`}
                index={index}
              >
                {(provided: any) => (
                  <div
                    {...provided.draggableProps}
                    ref={provided.innerRef}
                    {...provided.dragHandleProps}
                    className="addTeamMiddle__projectAreaImage"
                    onClick={() => handleSelectedProjects(project)}
                  >
                    <Tooltip title={project.name} placement="bottom">
                    <img
                      className={
                        selectedProjectsHighlight.indexOf(project.id) > -1
                          ? "addTeamMiddle__avatar_selected"
                          : "addTeamMiddle__avatar"
                      }
                      src={
                        projectIcon
                      }
                      alt="user-avatar"
                    />
                    </Tooltip>
                    <div className="addTeamMiddle__companyNameText">
                      {project.name ? (
                        
                        <div title={project.name} className="addTeamMiddle__companyNameText_overflow">
                          {project.name}
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
        </div>
      )}
      </Droppable>
    ):(
      <div className="noItemsFound">No Projects found</div>
    )}
    </>
  );
}

function useForceUpdate() {
  const [value, setValue] = useState(0); // integer state
  return () => setValue((value) => value + 1); // update the state to force render
}

export function TeammateAddEditProjects(props: any): ReactElement {
  const forceUpdate = useForceUpdate();
  const [projectsWithRole, setProjects] = useState<Array<any>>([]);
  const [selectedId, setSelectedId]: any = useState(null);
  const [role, setRole]: any = useState({});
  const [testing, setTesting] = useState<Array<any>>([])
  const [deletedRoles, setDeletedRoles] = useState<Array<any>>([])

  useEffect(() => {
    if (props.projectRole) {
      const allProjectRoles = props.projectRole;
      const deletedTemp : any = []
      let roleTemp: any = {};
      for (let i = 0; i < allProjectRoles.length; i++) {
          Object.keys(allProjectRoles[i]).map((item: any, index: number) => {
            roleTemp = {
              ...roleTemp,
              [`${allProjectRoles[i].id}`]: allProjectRoles[i].role,
            };
          });
        
        if(allProjectRoles[i].deleted) {
          deletedTemp.push(allProjectRoles[i].id)
        }
        
      }
      setDeletedRoles(deletedTemp)
      setRole(roleTemp);
    }
  }, [props.projectRole]);




  useEffect(() => {
    if (props.projectsWithRole) {
      setProjects(props.projectsWithRole);
    }
  }, [props?.projectsWithRole]);

  useEffect(() => {
    if(projectsWithRole.length > 0 && deletedRoles.length > 0){ 
      const deletedTemp = [...deletedRoles]
    for(let i =0; i< projectsWithRole.length; i++){
      if(projectsWithRole[i]?.role && deletedRoles.indexOf(projectsWithRole[i].role) > -1){

      }
      else if(projectsWithRole[i]?.role && deletedRoles.indexOf(projectsWithRole[i].role) == -1) {
        deletedTemp.splice(deletedRoles.indexOf(projectsWithRole[i].role), 1)
      }
    }
    setDeletedRoles(deletedTemp)
  }
  },[projectsWithRole.length > 0 && deletedRoles.length > 0])

  const handleSelectedProjectRole = (item: any, project: any) => {
    const data: any = {
      projectId: project.id ? project.id : project.projectId,
      role: item.id,
      status: 3,
    };
    const deletedTemp = [...deletedRoles]
    if(deletedRoles.indexOf(item.id) > -1){
      deletedTemp.splice(deletedRoles.indexOf(item.id),1)
    }
    setDeletedRoles(deletedTemp)
    props.handleSelectedProjectRole(data);
    forceUpdate();
  };

  const handleSelectedProjects = (project: any) => {
    const urlPathName  = window.location.pathname
    if(!urlPathName.includes("projects") &&  canUpdateProjects()){
    props?.handleSelectedProjects(project);
    }
  };


  const handleMouseEnterProjects = (project: any) => {
    if (project.projectId) {
      setSelectedId(project.projectId);
    } else {
      setSelectedId(project.id);
    }
  };
  const handleMouseLeaveProject = () => {
    setSelectedId(null);
  };

  const handleSelectedTypeOfView = () => {
    props?.handleSelectedTypeOfView &&
      props?.handleSelectedTypeOfView("projects");
  };

  return (
    <div
    className="addTeamMiddle__projectSelect"
    >
      {projectsWithRole &&
        projectsWithRole.length !== 0 &&
        projectsWithRole.map(
          (project: any, index: number) =>
            project.status > 1 && (
              <div
              key={ project && project.id ? project.id : project.projectId}
              className="addTeamMiddle__projectSelectImage"
              >
                <div
                  onMouseLeave={() => handleMouseLeaveProject()}
                  onMouseEnter={() => handleMouseEnterProjects(project)}
                  style={{ position: "relative" }}
                >
                  <img
                    className="avatar-icon addTeamMiddle__projectSelectImageView"
                    src={
                      projectIcon
                    }
                    alt="user-avatar"
                  />
                  {
                    (selectedId === project.id ||
                      selectedId === project.projectId) && props?.edit && (
                      <div className="avatar-icon addTeamMiddle__projectSelectImageViewCross">
                        <div>
                          {" "}
                          <CrossIcon
                            onClick={() => handleSelectedProjects(project)}
                            className="addTeamMiddle__crossSize"
                          />
                        </div>
                        <div>
                          {project?.project?.name
                            ? (project?.project?.name)
                            : (project.name)}
                        </div>
                      </div>
                    )}
                </div>
                <div className="addTeamMiddle__select">
                  {
                    <div
                    className={selectedId === project.id ||
                      selectedId === project.projectId ? "addTeamMiddle__crossProjectVisible" :"addTeamMiddle__crossProjectHidden" }
                      style={{
                        fontSize: 12,
                        color: "#c4c4c4",
                        visibility:
                          selectedId === project.id ||
                          selectedId === project.projectId
                            ? "hidden"
                            : "inherit",
                      }}
                    >
                      {project?.project?.name
                        ? project?.project?.name
                        : project?.name}
                    </div>
                  }
                  <Select
                  disabled={!canUpdateProjects()}
                   MenuProps={{
                    anchorOrigin: {
                      vertical: "bottom",
                      horizontal: "left",
                    },
                    transformOrigin: {
                      vertical: "top",
                      horizontal: "left",
                    },
                    getContentAnchorEl: null,
                  }}
                    id="custom-dropdown"
                    fullWidth
                    autoComplete='off'
                    value={role[project?.role] || ""}
                  >
                    {props.projectRole.length !== 0 &&
                      props.projectRole.map((item: any, i: number) =>
                      !item.deleted ? (
                        <MenuItem className="mat-menu-item-sm"
                          key={item.id}
                          onClick={() =>
                            handleSelectedProjectRole(item, project)
                          }
                          value={role[item.id]}
                        >
                          {item?.role}
                        </MenuItem>
                      )
                      :
                      item.deleted &&  project?.role == item.id && 
                       <MenuItem className="mat-menu-item-sm"
                          onClick={() =>
                            handleSelectedProjectRole(item, project)
                          }
                          key={i}
                          value={role[item.id]}
                        >
                          {item?.role}
                        </MenuItem>
                      )}
                     
                  </Select>
                  {project?.error && (
            <div className="addTeamMiddle__error">
              * Please select a project role
            </div>
          )}
                </div>
              </div>
            )
        )}
      <div
       
        className="addTeamMiddle__dummySelect"
      
      >
        <div style={{ position: "relative" }}>
          <IconButton  onClick={() => handleSelectedTypeOfView()} className="addTeamMiddle__plus_small">+</IconButton>
        </div>
        <div style={{ width: "100%", marginLeft: 16 }}>
          {
            <div
        className="addTeamMiddle__dummySelectText"
            >
              Add new project
            </div>
          }
          <TextField
            disabled
            fullWidth
            autoComplete='off'
            placeholder="Select project role"
          />
        </div>
      </div>
    </div>
  );
}
