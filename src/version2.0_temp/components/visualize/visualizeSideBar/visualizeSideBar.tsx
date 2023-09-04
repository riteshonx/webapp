import { SmartProjectSite } from 'location-intelligence-viewer';
import React from 'react';
import { FormSections } from './Components/formSections/formSections';
import { LocationTree } from './Components/locationTree/locationTree';
import './visualizeSideBar.scss';
import { SmartNodes } from 'src/modules/visualize/VisualizeView/models/SmartNodes';
import { LocationFormStatusFilters } from 'src/modules/visualize/VisualizeView/components/LocationTreeFormStatus/LocationFormStatusFilters';
import { ProjectTreeAndSmartObjectNodeMap } from 'src/modules/visualize/VisualizeView/models/projectTreeAndSmartObjectNodeMap';
import { LocationTree as  ProjectLocationTree } from 'src/modules/visualize/VisualizeView/models/locationTree';
import { Form } from 'src/modules/visualize/VisualizeView/models/form';

interface VisualizesideBarProps {
  projectLocationTree: ProjectLocationTree | undefined;
  projectSite: SmartProjectSite | undefined;
  onMapNavNodeClicked: (node: SmartNodes) => void;
  selectedMapNode: SmartNodes | undefined;
  formStatusFilter: LocationFormStatusFilters[];
  formSearchKey: string;
  projectTreeAndSmartNodeMap: ProjectTreeAndSmartObjectNodeMap;
  selectedForm: Form;
  setSelectedForm: (form?: Form) => void;
  onActiveTemplateChanged: () => void;
  onBackButtonClick: () => void;
  onHomeViewClicked: () => void;
  onUpdateSelectedRoomLabel: () => void;
}

export const VisualizesideBar = ({ projectLocationTree, projectSite, onMapNavNodeClicked, selectedMapNode, formSearchKey, formStatusFilter, projectTreeAndSmartNodeMap, selectedForm, setSelectedForm, onActiveTemplateChanged, onBackButtonClick, onHomeViewClicked, onUpdateSelectedRoomLabel }: VisualizesideBarProps): React.ReactElement => {

  return (
    <div className="v2-visualize-sidebar">
      <LocationTree
        buildings={projectSite?.buildings}
        projectLocationTree={projectLocationTree}
        onMapNavNodeClicked={onMapNavNodeClicked}
        selectedMapNode={selectedMapNode!}
        onHomeViewClicked={onHomeViewClicked}
      />
      <FormSections
        projectSite={projectSite}
        projectLocationTree={projectLocationTree}
        selectedMapNode={selectedMapNode!}
        formStatusFilter={formStatusFilter}
        formSearchKey= {formSearchKey}
        projectTreeAndSmartNodeMap={projectTreeAndSmartNodeMap}
        selectedForm={selectedForm}
        setSelectedForm={setSelectedForm}
        onActiveTemplateChanged={onActiveTemplateChanged}
        onBackButtonClick={onBackButtonClick}
        onUpdateSelectedRoomLabel={onUpdateSelectedRoomLabel}
      />
    </div>
  );
};