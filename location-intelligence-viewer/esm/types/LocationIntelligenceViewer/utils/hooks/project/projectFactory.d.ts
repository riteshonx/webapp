import { VisualizeFocus } from '../../../../LocationIntelligenceViewerV2/engine/core/visualizeFocus';
import { VisualizeRenderer } from '../../../../LocationIntelligenceViewerV2/engine/core/visualizeRenderer';
import { VisualizeScene } from '../../../../LocationIntelligenceViewerV2/engine/core/visualizeScene';
import { SmartProjectSite } from '../../../model/external';
import { ProjectOutline } from '../../../model/external/project/projectOutline';
import { Project } from '../../../model/project/project';
export declare class ProjectFactory {
    static createProject(projectOutline: ProjectOutline, renderer: VisualizeRenderer, scene: VisualizeScene): Promise<Project>;
    static createSmartProjectSite(project: Project, focus: VisualizeFocus): SmartProjectSite;
}
