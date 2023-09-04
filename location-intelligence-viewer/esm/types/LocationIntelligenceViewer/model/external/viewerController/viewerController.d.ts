import { CancellationToken } from '../../../../LocationIntelligenceViewerV2/engine/cancellationToken';
import { Project } from '../project';
import { SmartProjectSite } from '../smart';
import { SmartNode } from '../smart/smartNode';
export declare class ViewerController {
    addProject: (project: Project) => Promise<SmartProjectSite>;
    flyTo: ({ lat, lon, zoom, cancellationToken }: {
        lat: number;
        lon: number;
        zoom: number;
        cancellationToken?: CancellationToken;
    }) => Promise<void>;
    resize: () => void;
    setSelectedObject: (smartNode: SmartNode) => Promise<void>;
}
