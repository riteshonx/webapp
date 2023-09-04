import 'mapbox-gl/dist/mapbox-gl.css';
import { IMapboxInfo } from '../LocationIntelligenceViewer/interfaces/external/IMapboxInfo';
import { DisplayStyle } from '../LocationIntelligenceViewer/materials/displayStyle';
import { Project } from '../LocationIntelligenceViewer/model/external';
import { SmartNodeCollection, SmartProjectSite } from '../LocationIntelligenceViewer/model/external/smart';
import { SmartNode } from '../LocationIntelligenceViewer/model/external/smart/smartNode';
import { SmartViewer } from '../LocationIntelligenceViewer/model/external/smart/smartViewer';
import { ViewerController } from '../LocationIntelligenceViewer/model/external/viewerController';
interface LocationIntelligenceViewerProps {
    project?: Project;
    onProjectInitialized?: (smartProjectSite: SmartProjectSite) => void;
    onViewerInitialized?: (viewer: ViewerController) => void;
    selectedNode?: SmartNode | SmartNodeCollection;
    onNodeClick?: (node: SmartNode) => void;
    onNodeHoverEnter?: (node: SmartNode) => void;
    onNodeHoverExit?: (node: SmartNode) => void;
    onViewersChange?: (viewers: SmartViewer[]) => void;
    onBuildingLeave?: () => void;
    mapboxInfo?: IMapboxInfo;
    displayStyle?: DisplayStyle;
    debugging?: boolean;
    defaultLocation: [number, number];
    updateSelectedRoomLabel?: number;
}
export declare function MuiSeededLocationIntelligenceViewer(props: LocationIntelligenceViewerProps): JSX.Element;
export {};
