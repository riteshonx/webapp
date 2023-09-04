import { Entity } from '../../../Viewer';
export declare class PlayerClient extends Entity {
    playerClientId: string;
    private _focusedNodeId;
    private _color;
    private _displayName;
    private label;
    recievedFirstPositionUpdate: Boolean;
    private body;
    constructor(playerClientId: string);
    set focusedNodeId(focusedNodeId: number);
    get focusedNodeId(): number;
    set color(color: string);
    get color(): string;
    set displayName(displayName: string);
    get displayName(): string;
}
