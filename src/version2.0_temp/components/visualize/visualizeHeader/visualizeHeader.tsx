import React from 'react';
import { LocationFormStatusFilters } from 'src/modules/visualize/VisualizeView/components/LocationTreeFormStatus/LocationFormStatusFilters';
import { FormStatusSelector } from './components/formStatusSelector';
import { SearchPanel } from './components/searchPanel';
import { SyncInfo } from './components/syncInfo';
import './visualizeHeader.scss';

interface VisualizeHeaderProps {
  setFormStatusFilter: (formStatusFilter: LocationFormStatusFilters) => void;
}

export const VisualizeHeader = ({setFormStatusFilter}: VisualizeHeaderProps): React.ReactElement => {

  return (
    <div className="v2-visualize-header">
      <SearchPanel />
      <div className='s-v-center'>
        <FormStatusSelector setFormStatusFilter={setFormStatusFilter}/>
        <SyncInfo />
      </div>
    </div>
  );
};