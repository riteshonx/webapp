import { SmartProjectSite } from 'location-intelligence-viewer';

import { LocationTree } from './locationTree';
import { ChildNode } from './locationTree/childNode';
import { SmartNodes } from './SmartNodes';

interface ProjectTreeAndSmartObject {
    projectNode: ChildNode;
    smartObject: SmartNodes | undefined;
}

export class ProjectTreeAndSmartObjectNodeMap {
    private map = new Map<string, ProjectTreeAndSmartObject>([]);

    constructor(projectTree: LocationTree, projectSite: SmartProjectSite) {
        this.buildMap(projectTree, projectSite);
    }

    private buildMap(projectTree: LocationTree, projectSite: SmartProjectSite) {
        projectTree.traverse((childNode) => {
            let linkedSmartNode: SmartNodes | undefined = undefined;
            
            if (childNode.isLinkedToLocation) {
                linkedSmartNode = projectSite.findNodeByExternalId(childNode.locationId!) as SmartNodes;
            }

            this.map.set(childNode.childNodeId, {projectNode: childNode, smartObject: linkedSmartNode});
        });
    }

    public get(id: string) {
        return this.map.get(id);
    }
}