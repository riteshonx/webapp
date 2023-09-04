import { ProjectOutline } from '../../../model/external/project/projectOutline';
export declare class ProjectRepository {
    retrieveProject(projectOutline: ProjectOutline): Promise<void>;
    private getProjectMeta;
}
