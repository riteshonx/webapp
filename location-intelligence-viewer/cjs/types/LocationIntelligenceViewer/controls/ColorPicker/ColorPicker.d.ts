interface ColorPickerProps {
    color: string;
    onColorChange: (color: string) => void;
    colors: string[];
}
export declare function ColorPicker({ color, onColorChange, colors }: ColorPickerProps): JSX.Element;
export {};
