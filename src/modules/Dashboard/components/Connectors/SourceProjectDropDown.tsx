import {
  FormControl,
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { SelSourceProjectContext } from "../DashboardSlate2/Components/ConnectorsScreen/ConnectorsScreen";
import React, { useContext, useEffect, useState } from "react";
import { ConnRowData } from "./utils/types";
import { stateContext } from "src/modules/root/context/authentication/authContext";

interface Props {
  row: ConnRowData;
  data: any;
}
export default function SourceProjectDropDown({
  row,
  data,
}: Props): React.ReactElement {
  const {
    selSourceProjectState: [selSourceProject, setSelSourceProject],
  } = useContext(SelSourceProjectContext);
  const {
    state: { sourceSystem },
  } = useContext(stateContext);

  const handleChange = (evt: SelectChangeEvent) => {
    const idx = Number(evt.target.value);
    setSelSourceProject((prev) => ({
      ...prev,
      [row.featureId]: { value: row.sourceProject[idx], idx },
    }));
  };
  let findIdx = "";
  if (sourceSystem?.name) {
    findIdx = row.sourceProject
      .findIndex(
        (ele) =>
          ele?.agaveProjectId === row?.agaveProjectId ||
          ele?.metadata?.id === row?.metadata?.id
      )
      .toString();
    if (findIdx === "-1") findIdx = "";
  }

  const importFormCriteria = sourceSystem
    ? [
        "RFI",
        "Manpower Log",
        "Timecard Entries",
        "Manpower Logs",
        "Productivity Log",
        "Procore RFI",
        "Productivity Logs",
      ].includes(data?.artifactsIngested)
      ? ["BIM 360"].includes(sourceSystem?.name)
      : ["Procore"].includes(sourceSystem?.name)
    : false;

  return (
    <Grid container direction="row" alignItems="center">
      <FormControl fullWidth>
        {row?.sourceProject?.length &&
        !importFormCriteria &&
        data?.connectedSystem !== "PM4" &&
        data?.connectedSystem !== "P6" &&
        data?.artifactsIngested !== "Schedule" ? (
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            onChange={handleChange}
            value={
              selSourceProject?.[row.featureId]?.idx?.toString() ?? findIdx
            }
            variant="standard"
            sx={{
              height: "32px",
              width: "90%",
              fontSize: "1.2rem",
              color: "#fff",
              "&:hover::before": {
                borderBottom: "1px solid #fff !important",
              },
              "&::before": {
                borderColor: "#fff",
              },
              "&::after": {
                borderColor: "#fff",
              },
              ".MuiSvgIcon-root ": {
                fill: "white !important",
              },
            }}
          >
            {row.sourceProject.map((project, idx) => (
              <MenuItem
                key={project.projectId}
                value={idx.toString()}
                sx={{ fontSize: "1.2rem" }}
              >
                {project.project.name}
              </MenuItem>
            ))}
          </Select>
        ) : (
          data?.sourceProject?.project?.name || "_"
        )}
      </FormControl>
    </Grid>
  );
}
