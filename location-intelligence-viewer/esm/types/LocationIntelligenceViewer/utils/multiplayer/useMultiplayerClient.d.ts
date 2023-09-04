import { Vector3 } from 'three';
import { PlayerClient } from './playerClient';
export declare function useMultiplayerClient(onOtherPlayersSettingsChanged: (otherPlayers: PlayerClient[]) => void): {
    readonly onJoinMultiplayerSessionClick: () => Promise<void>;
    readonly changeMultiplayerName: (name: string) => void;
    readonly onPlayerUpdate: ({ position }: {
        position: Vector3;
    }) => void;
    readonly multiplayerConnected: boolean;
    readonly otherPlayers: PlayerClient[];
    readonly multiplayerColor: string;
    readonly onMultiplayerColorChange: (hexColor: string) => void;
    readonly onMultiplayerFocusedNodeChanged: (focusedNodeId: number) => void;
};
