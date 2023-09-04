import { Vector3 } from 'three';
import { PlayerClient } from './playerClient';
export declare class MultiplayerClient {
    private static socket;
    private static playerName;
    private static color;
    private static focusedNodeId;
    private static _onOtherPlayersJoinedOrDisconnected;
    private static _onOtherPlayersSettingsUpdated;
    static otherPlayers: PlayerClient[];
    static emitPosition(position: Vector3): void;
    static setName(name: string): void;
    static emitName(): void;
    static setColor(color: string): void;
    static emitColor(): void;
    static setFocusedNodeId(focusedNodeId: number): void;
    static emitFocusedNodeId(): void;
    static connect(onOtherPlayersJoinedOrDisconnected: () => void, onOtherPlayersSettingsUpdated: () => void): Promise<void>;
    static get connected(): boolean;
    private static setupListeners;
    private static onNameRecieved;
    private static onPositionRecieved;
    static onColorRecieved(hexColor: string, playerId: string): void;
    static onFocusNodeRecieved(nodeId: number, playerId: string): void;
    private static onPlayerDisconnected;
    private static onPlayerJoined;
}
