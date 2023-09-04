import { useMemo } from 'react';
import { ProjectFactory } from 'src/modules/visualize/VisualizeView/factories/project.factory';
import { useProjectLocationTree } from 'src/modules/visualize/VisualizeView/hooks/useProjectLocationTree';
import { LocationModel } from 'src/modules/visualize/VisualizeView/models/locationModel';

interface ProjectProps {
    locationModels: LocationModel[];
    projectId: string;
  }

export function useProject({locationModels, projectId}: ProjectProps):any {
    const projectLocationTree = useProjectLocationTree();
    const project = useMemo(() =>
        ProjectFactory.create(projectId!, locationModels, projectLocationTree!), [projectId, locationModels, projectLocationTree]);

    return {project, projectLocationTree} as const;
}