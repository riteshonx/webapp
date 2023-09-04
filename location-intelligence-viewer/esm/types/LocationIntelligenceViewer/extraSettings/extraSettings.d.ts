import { ControlType } from '../../Viewer/controls/controlType';
interface ExtraSettingsProps {
    multiplayerConnected: boolean;
    onJoinMultiplayerSessionClick: () => void;
    changeMultiplayerName: (name: string) => void;
    onMultiplayerColorChange: (color: string) => void;
    multiplayerColor: string;
    controlType: ControlType;
    setControlType: (controlType: ControlType) => void;
}
export declare function ExtraSettings({ multiplayerColor, onJoinMultiplayerSessionClick, changeMultiplayerName, multiplayerConnected, onMultiplayerColorChange, controlType, setControlType }: ExtraSettingsProps): JSX.Element;
export {};
