import { LocationIntelligenceViewerV2, SmartProjectSite, ViewerController } from 'location-intelligence-viewer';
import { useContext, useEffect, useState } from 'react';

import { useMountedState } from '../VisualizeView/hooks/useMountedState';
import { useProject } from '../VisualizeView/hooks/useProject';
import { useViewerResizeOnNavMenuChange } from '../VisualizeView/hooks/useViewerResizeOnNavMenuChange';
import { SmartNodes } from '../VisualizeView/models/SmartNodes';
import { ColoredLocation } from './coloredLocation';
import { useColoredLocations } from './useColoredLocations';
import { useSelectedLocationId } from './useSelectedLocationId';

interface VisualizeWidgetProps {
    selectedLocationId?: string;
    onLocationSelected?: (locationId: string) => void;
    coloredLocations?: ColoredLocation[];
}

export function VisualizeWidget({selectedLocationId, onLocationSelected = () => {return}, coloredLocations}: VisualizeWidgetProps) {
    const [viewerController, setViewerController] = useMountedState<ViewerController>();
    const [selectedMapNode, setSelectedMapNode] = useMountedState<SmartNodes>();
    const [smartProjectSite, setSmartProjectSite] = useMountedState<SmartProjectSite>();

    const {project} = useProject();

    useViewerResizeOnNavMenuChange(viewerController!);
    useSelectedLocationId(selectedLocationId!, smartProjectSite!, setSelectedMapNode);
    useColoredLocations(coloredLocations!, smartProjectSite!);

    function onNodeClick(node: SmartNodes) {
        onLocationSelected(node?.externalReferenceId);
        setSelectedMapNode(node);

        if (!Boolean(node)) {
            smartProjectSite?.show();
            smartProjectSite?.setBuildingContext();
        }
    }

    return (
        <LocationIntelligenceViewerV2
            project={project!}
            onProjectInitialized={setSmartProjectSite}
            onViewerInitialized={setViewerController}
            onNodeClick={(node) => onNodeClick(node as SmartNodes)}
            selectedNode={selectedMapNode}
            mapboxInfo={{token: process.env["REACT_APP_MAPBOX_KEY"]}}
            defaultLocation={[0, 0]}
        />
    )
}
