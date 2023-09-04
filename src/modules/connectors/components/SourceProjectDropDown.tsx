import {
  FormControl,
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { SelSourceProjectContext } from './ThirdPartyProjects';
import React, { useContext } from 'react';
import { ConnRowData } from '../utils/types';

import { stateContext } from 'src/modules/root/context/authentication/authContext';

interface Props {
  row: ConnRowData;
}
export default function SourceProjectDropDown({
  row,
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
      [row.id]: { value: row.sourceProject[idx], idx },
    }));
  };
  let findIdx = '';
  if (sourceSystem?.name === row.source) {
    findIdx = row.sourceProject
      .findIndex((ele) => ele.agaveProjectId === row.agaveProjectId)
      .toString();
    if (findIdx === '-1') findIdx = '';
  }
  return (
    <Grid container direction="row" alignItems="center">
      <FormControl fullWidth>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          onChange={handleChange}
          value={selSourceProject?.[row.id]?.idx?.toString() ?? findIdx}
          variant="standard"
          sx={{
            height: '32px',
            width: '90%',
            fontSize: '1.4rem',
            '&:hover::before': {
              borderBottom: '1px solid var(--onx-btn-primary) !important',
            },
            '&::after': {
              borderColor: 'transparent',
            },
          }}
        >
          {row.sourceProject.map((project, idx) => (
            <MenuItem
              key={project.projectId}
              value={idx.toString()}
              sx={{ fontSize: '1.2rem' }}
            >
              {project.project.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>
  );
}
