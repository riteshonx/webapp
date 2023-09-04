interface MultiplayerSettingsProps {
    multiplayerConnected: boolean;
    changeMultiplayerName: (name: string) => void;
    onJoinMultiplayerSessionClick: () => void;
    multiplayerColor: string;
    onMultiplayerColorChange: (color: string) => void;
}
export declare function MultiplayerSettings({ multiplayerConnected, changeMultiplayerName, onJoinMultiplayerSessionClick, multiplayerColor, onMultiplayerColorChange }: MultiplayerSettingsProps): JSX.Element;
export {};
