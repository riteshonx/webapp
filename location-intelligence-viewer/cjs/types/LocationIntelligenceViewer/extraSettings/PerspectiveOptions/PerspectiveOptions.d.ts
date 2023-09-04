import { ControlType } from '../../../Viewer/controls/controlType';
interface PerspectiveOptionProps {
    controlType: ControlType;
    setControlType: (newState: ControlType) => void;
}
export declare function PerspectiveOptions({ controlType, setControlType }: PerspectiveOptionProps): JSX.Element;
export {};
