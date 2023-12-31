import { Building } from '../../LocationIntelligenceViewer/model/building/building';
import { SmartProjectSite } from '../../LocationIntelligenceViewer/model/external';
import { ProjectOutline } from '../../LocationIntelligenceViewer/model/external/project/projectOutline';
import { Project } from '../../LocationIntelligenceViewer/model/project';
import { VisualizeController } from './core/visualizeController';
import { VisualizeFocus } from './core/visualizeFocus';
import { VisualizeMapboxMap } from './core/visualizeMapboxMap';
import { VisualizeRenderer } from './core/visualizeRenderer';
import { VisualizeScene } from './core/visualizeScene';
export declare class VisualizeProjectManager {
    projects: Map<number, Project>;
    smartProjects: Map<number, SmartProjectSite>;
    private projectsShowing;
    private _renderer;
    private _mapboxMap;
    private _controller;
    private _focus;
    private _scene;
    constructor(renderer: VisualizeRenderer, mapboxMap: VisualizeMapboxMap, controller: VisualizeController, focus: VisualizeFocus, scene: VisualizeScene);
    dispose(): void;
    private _addProject;
    addProject: (projectOutline: ProjectOutline) => Promise<SmartProjectSite>;
    private _onProjectClick;
    private onProjectClick;
    private _removeProject;
    removeProject: (projectId: number) => void;
    private _addBuildingToProject;
    addBuildingToProject: (building: Building, projectId: number) => void;
    private _findProjectContainingNodeId;
    findProjectContainingNodeId: (nodeId: number) => Project;
    private _findSmartProjectContainingNodeId;
    findSmartProjectContainingNodeId: (nodeId: number) => SmartProjectSite;
    private _findNodeInSmartProjectsById;
    findNodeInSmartProjectsById: (nodeId: number) => import("../../LocationIntelligenceViewer/model/external/smart/smartNode").SmartNode;
    private _activeBuildings;
    activeBuildings: () => Building[];
    private _setupListeners;
    private setupListeners;
    private _update;
    update: () => void;
    private _showProjectsThatAreCloseEnough;
    private showProjectsThatAreCloseEnough;
}
