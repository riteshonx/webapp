import { Button } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { LocationFormStatusFilters } from 'src/modules/visualize/VisualizeView/components/LocationTreeFormStatus/LocationFormStatusFilters';
import { useDataMode } from 'src/modules/visualize/VisualizeView/utils/DataMode';

interface VisualizeHeaderProps {
  setFormStatusFilter: (formStatusFilter: LocationFormStatusFilters[]) => void;
}

export const FormStatusSelector = ({ setFormStatusFilter }: VisualizeHeaderProps): React.ReactElement => {

  const [openActive, setOpenActive] = useState<boolean>(true);
  const [closedActive, setClosedActive] = useState<boolean>(true);
  const [readyActive, setReadyActive] = useState<boolean>(false);
  const [lessOpenActive, setLessOpenActiveActive] = useState<boolean>(false);

  const {dataMode} = useDataMode();

  useEffect(() => {
    if (dataMode === 'Issues') {
      setOpenActive(true)
      setClosedActive(true)
      setReadyActive(true)
      setLessOpenActiveActive(true)
    } else {
      setOpenActive(true)
      setClosedActive(true)
      setReadyActive(false)
      setLessOpenActiveActive(false)
      setFormStatusFilter([LocationFormStatusFilters.Mixed])
    }
  }, [dataMode]);

  useEffect(() => {
    if (dataMode === 'Issues') {
      const issueFilters = getIssueFilters(); 
      setFormStatusFilter(issueFilters);
    } else {
      if (openActive && closedActive) {
        setFormStatusFilter([LocationFormStatusFilters.Mixed]);
        return;
      }

      if (openActive) {
        setFormStatusFilter([LocationFormStatusFilters.Open]);
        return;
      }

      if (closedActive) {
        setFormStatusFilter([LocationFormStatusFilters.Closed]);
        return;
      }

      setFormStatusFilter([LocationFormStatusFilters.None]);
    }
  }, [openActive, closedActive, readyActive, lessOpenActive]);

  function onClickClosedOpen() {
    if (openActive && closedActive) {
      setOpenActive(false)
      setClosedActive(false)
    } else {
      setOpenActive(true)
      setClosedActive(true)
    }
  }

  function getIssueFilters() {
    const issueFilters = []
    openActive && issueFilters.push(LocationFormStatusFilters.Open);
    lessOpenActive && issueFilters.push(LocationFormStatusFilters.lessOpen);
    readyActive && issueFilters.push(LocationFormStatusFilters.Ready);
    closedActive && issueFilters.push(LocationFormStatusFilters.Closed);
    (issueFilters.length === 0) && issueFilters.push(LocationFormStatusFilters.None);
    return issueFilters;
  }

  return (
    <div className="v2-visualize-header-formStatusSelector">
      Status&emsp;
      <Button className='openStatus' variant="contained" onClick={() =>setOpenActive(!openActive)}>
        <input type="checkbox" checked={openActive} readOnly tabIndex={-1}/>
        <span></span>
        {dataMode === 'Issues' ? '6+ Open' : 'Open'}
      </Button>
      {
        dataMode === 'Issues' && <>
          <Button className='mixedStatus' variant="contained" onClick={() =>setLessOpenActiveActive(!lessOpenActive)}>
            <input type="checkbox" checked={lessOpenActive} readOnly tabIndex={-1}/>
            <span></span>
            1-5 Open
          </Button>
          <Button className='readyStatus' variant="contained" onClick={() =>setReadyActive(!readyActive)}>
            <input type="checkbox" checked={readyActive} readOnly tabIndex={-1}/>
            <span></span>
            Review
          </Button>
        </>
      }
      <Button className='closedStatus' variant="contained" onClick={() =>setClosedActive(!closedActive)}>
        <input type="checkbox" checked={closedActive} readOnly tabIndex={-1}/>
        <span></span>
        Closed
      </Button>
      {
        dataMode !== 'Issues' && <Button className='mixedStatus' disabled={!openActive || !closedActive} variant="contained" tabIndex={-1}>
        Open/Closed
        </Button>
      }
    </div>
  );
};