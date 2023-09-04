import { IMapboxInfo } from './interfaces/external/IMapboxInfo';
import { DisplayStyle } from './materials/displayStyle';
import { Project } from './model/external/project';
import { SmartNodeCollection, SmartProjectSite } from './model/external/smart';
import { SmartNode } from './model/external/smart/smartNode';
import { SmartViewer } from './model/external/smart/smartViewer';
import { ViewerController } from './model/external/viewerController';
interface LocationIntelligenceViewerProps {
    project: Project;
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
}
export declare function MuiSeededLocationIntelligenceViewer(props: LocationIntelligenceViewerProps): JSX.Element;
export {};
