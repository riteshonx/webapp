import { ILocationModelLink } from '../ILocationModelLink';
import { ChildNodeType } from './childNodeType';
import { IChildNode } from './IChildNode';

export class ChildNode {
    public childNodeId: string;
    public parentId: string;
    public name: string;

    public childNodes: ChildNode[];

    public sourceId?: string;
    public isLinkedToLocation = false;
    public childNodeType: ChildNodeType = ChildNodeType.NA;

    public totalOpenFormCount = 0;
    public totalClosedFormCount = 0;

    public treeDepth = 0;

    public openFormCount = 0;
    public closedFormCount = 0;
    public openIssueCount = 0;
    public readyIssueCount = 0;

    private parent?: ChildNode;

    constructor(childNode: IChildNode, treeDepth: number, onCreate: (self: ChildNode) => void, parent?: ChildNode) {
        this.childNodeId = childNode.id;
        this.parentId = childNode.parentId;
        this.name = childNode.name;

        this.treeDepth = treeDepth;
        this.parent = parent;

        this.childNodes = Boolean(childNode.childNodes) ? childNode.childNodes.map((childNode) => new ChildNode(childNode, this.treeDepth + 1, onCreate, this)) : [];
        
        if (Boolean(childNode.locationModelLink)) {
            this.buildLocationLink(childNode.locationModelLink!);
        }

        onCreate(this);
    }

    public traverse(callback: (child: ChildNode) => void) {
        callback(this);

        this.childNodes.forEach((childNode) => childNode.traverse(callback));
    }

    public updateFormStatus(openFormCount: number, closedFormCount: number, openIssueCount: number, readyIssueCount: number) {
        const oldOpenFormCount = this.openFormCount;
        const oldClosedFormCount = this.closedFormCount;

        this.openFormCount = openFormCount;
        this.closedFormCount = closedFormCount;
        this.openIssueCount = openIssueCount;
        this.readyIssueCount = readyIssueCount;

        const diffOpenFormCount = this.openFormCount - oldOpenFormCount;
        const diffClosedFormCount = this.closedFormCount - oldClosedFormCount;

        this.totalOpenFormCount += diffOpenFormCount;
        this.totalClosedFormCount += diffClosedFormCount;

        if (Boolean(this.parent)) {
            this.parent!.updateTotalFormCount(diffOpenFormCount, diffClosedFormCount);
        }
    } 

    public updateTotalFormCount(diffOpenFormCount: number, diffClosedFormCount: number) {
        this.totalOpenFormCount += diffOpenFormCount;
        this.totalClosedFormCount += diffClosedFormCount;

        if (Boolean(this.parent)) {
            this.parent!.updateTotalFormCount(diffOpenFormCount, diffClosedFormCount);
        }
    }

    public get locationId() {
        return this.isLinkedToLocation ? this.childNodeId : undefined;
    }

    public get linkedLevels() {
        return this.childNodes.filter((childNode) => childNode.childNodeType === ChildNodeType.Level);
    }

    public get linkedZones() {
        return this.childNodes.filter((childNode) => childNode.childNodeType === ChildNodeType.Zone);
    }

    public get linkedRooms() {
        return this.childNodes.filter((childNode) => childNode.childNodeType === ChildNodeType.Room);
    }

    private buildLocationLink(locationModelLink: ILocationModelLink) {
        this.isLinkedToLocation = true;
        
        if (Boolean(locationModelLink.locationBuildingId)) {
            this.childNodeType = ChildNodeType.Building;
        }

        if (Boolean(locationModelLink.locationLevelId)) {
            this.sourceId = locationModelLink.locationLevel.sourceId;
            this.childNodeType = ChildNodeType.Level;
        }

        if (Boolean(locationModelLink.locationZoneId)) {
            this.sourceId = locationModelLink.locationZone?.sourceId;
            this.childNodeType = ChildNodeType.Zone;
        }

        if (Boolean(locationModelLink.locationRoomId)) {
            this.sourceId = locationModelLink.locationRoom?.sourceId;
            this.childNodeType = ChildNodeType.Room;
        }
    }
}