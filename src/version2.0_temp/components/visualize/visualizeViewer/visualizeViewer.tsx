import { DisplayStyle, LocationIntelligenceViewerV2, SmartProjectSite, ViewerController } from 'location-intelligence-viewer';
import React, { useEffect, useState } from 'react';
import { LocationFormStatusFilters } from 'src/modules/visualize/VisualizeView/components/LocationTreeFormStatus/LocationFormStatusFilters';
import { LocationModel } from 'src/modules/visualize/VisualizeView/models/locationModel';
import { LocationTree } from 'src/modules/visualize/VisualizeView/models/locationTree';
import { SmartNodes } from 'src/modules/visualize/VisualizeView/models/SmartNodes';
import { useAnalytics } from 'src/modules/visualize/VisualizeView/utils/analytics';
import { useProject } from 'src/version2.0_temp/hooks/visualize/useProject';
import { FormStatusSelector } from '../visualizeHeader/components/formStatusSelector';
import './visualizeViewer.scss';
import { useIsPCL } from 'src/modules/visualize/VisualizeRouting/PCL';

interface ViewerProps {
  locationModels: LocationModel[];
  projectId: string;
  onProjectInitialized: (smartProjectSite: SmartProjectSite, loactionTree?: LocationTree) => void;
  onNodeClickInViewer: (node: SmartNodes) => void;
  selectedNode: SmartNodes | undefined;
  onBuildingLeave: () => void;
  setFormStatusFilter: (formStatusFilter: LocationFormStatusFilters[]) => void;
  defaultLocation: [number, number];
  updateSelectedRoomLabel?:  number;
}

export const VisualizeViewer = ({ locationModels, projectId, onProjectInitialized, onNodeClickInViewer, selectedNode, onBuildingLeave, setFormStatusFilter, defaultLocation, updateSelectedRoomLabel}: ViewerProps): React.ReactElement => {
  const [viewerController, setViewerController] = useState<ViewerController>();
  const { project, projectLocationTree } = useProject({ locationModels, projectId });
  const { track, timeEvent } = useAnalytics();
  const {tilesets} = useIsPCL();

  useEffect(() => {
    if (Boolean(project)) {
      timeEvent('Visualize-Smart-Project-Loaded');
    }
  }, [project]);

  useEffect(() => {
    setTimeout(() => {
        if (Boolean(viewerController)) {
            viewerController!.resize();
        }
    }, 0);
  }, [viewerController]);

  function _onProjectInitialized(smartProjectSite: SmartProjectSite) {
    smartProjectSite?.jumpTo();
    onProjectInitialized(smartProjectSite, projectLocationTree);
    track('Visualize-Smart-Project-Loaded');
  }

  return (
    <div className="v2-visualize-viewer">
      <div className='v2-visualize-viewer-status-contsiner'>
        <FormStatusSelector setFormStatusFilter={setFormStatusFilter}/>
      </div>
      <LocationIntelligenceViewerV2
        project={project}
        onViewerInitialized={setViewerController}
        onProjectInitialized={_onProjectInitialized}
        onNodeClick={(node) => onNodeClickInViewer(node as SmartNodes)}
        selectedNode={selectedNode}
        mapboxInfo={{ token: process.env["REACT_APP_MAPBOX_KEY"], tilesets: tilesets}}
        onBuildingLeave={onBuildingLeave}
        defaultLocation={defaultLocation}
        displayStyle={DisplayStyle.Greyscale}
        updateSelectedRoomLabel={updateSelectedRoomLabel}
      />
    </div>
  );
};