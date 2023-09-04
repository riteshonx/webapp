import React, { ReactElement, useState, useEffect } from "react";
import { TextField } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import {
  TeammateAddEditCompanies,
  TeammateAddProjects,
} from "./addTeammateMiddle";
import "../pages/TeammatesLanding/teammateslanding.scss";
import "./addTeammateRight.scss";
export default function TeammateAddEditRight(props: any): ReactElement {
  const [selected, setSelected] = useState("companies");


  useEffect(() => {
    if(props.typeView){
      setSelected(props.typeView)
    }
  },[props.typeView])

  const handleViewStyle = (type: string) => {
    props?.handleSelectedTypeOfView(type)
    setSelected(type);
  };

  const handleSearch = (event: any) => {
    props.handleSearch && props.handleSearch(event.target.value);
  };

  return (
    <div className="addTeamRight__parentView">
      <div
        style={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        <div
          onClick={() => handleViewStyle("companies")}
          className={`addTeamRight__companies ${selected === "companies"?'addTeamRight__selected':''}`}
        >
          Companies
        </div>
        <div
          onClick={() => handleViewStyle("projects")}
          className={`addTeamRight__projects ${selected === "projects"?'addTeamRight__selected':''}`}
        >
          Projects
        </div>
      </div>
      <div className="addTeamRight__search">
        <TextField
          onChange={() => handleSearch(event)}
          id="project-list-search-text"
          type="text"
          fullWidth
          placeholder="Search"
          autoComplete='off'
          variant="outlined"
        />
        <SearchIcon className="addTeamRight__search__icon" />
      </div>
      <div style={{ marginTop: 10, overflow:"auto" }}>
        {selected === "companies" ? (
          <TeammateAddEditCompanies
          handleAddNewCompany={() => props.handleAddNewCompany()}
       
            selectedCompanies={props.selectedCompanies}
            handleSelectedCompanies={(companies: any) =>
              props.handleSelectedCompanies(companies)
            }
            companies={props.companies}
          />
        ) : (
          <TeammateAddProjects
            selectedProjects={props.selectedProjects}
            handleAddNewProject={()=> props.handleAddNewProject()}
            handleSelectedProjects={(project: any) =>
              props.handleSelectedProjects(project)
            }
            projects={props.projects}
          />
        )}
      </div>
    </div>
  );
}
