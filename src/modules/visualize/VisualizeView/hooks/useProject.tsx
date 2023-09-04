import { useMemo } from 'react';

import { ProjectFactory } from '../factories/project.factory';
import { useLocationModel } from './useLocationModel';
import { useProjectId } from './useProjectId';
import { useProjectLocationTree } from './useProjectLocationTree';

export function useProject() {
    const projectId = useProjectId();
    const {locationModels} = useLocationModel();
    const projectLocationTree = useProjectLocationTree();

    const project = useMemo(() =>
        ProjectFactory.create(projectId!, locationModels, projectLocationTree!), [projectId, locationModels, projectLocationTree]);

    return {project, projectLocationTree} as const;
}