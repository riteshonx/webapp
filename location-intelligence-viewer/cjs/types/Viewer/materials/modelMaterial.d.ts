import { Color, ColorRepresentation, Plane, ShaderMaterial } from 'three';
import { DisplayStyle } from '../../LocationIntelligenceViewer/materials/displayStyle';
interface IModelMaterial {
    bottomHighlightLimit: number;
    topHighlightLimit: number;
    color: ColorRepresentation;
    highlightColor: ColorRepresentation;
    highlightStrength: number;
    clippingPlanes: Plane[];
    opacity: number;
}
export declare class ModelMaterial extends ShaderMaterial {
    private defaultColor;
    private greyscaleColor;
    flatShading: boolean;
    static fromMeshStandardMaterial({ bottomHighlightLimit, topHighlightLimit, color, highlightColor, highlightStrength, clippingPlanes, opacity }: IModelMaterial): ModelMaterial;
    set bottomHighlightLimit(min: number);
    set topHighlightLimit(max: number);
    set color(color: Color | ColorRepresentation);
    set highlight(color: Color | ColorRepresentation);
    set highlightStrength(strength: number);
    set displayStyle(displayStyle: DisplayStyle);
    private static toGreyscale;
}
export {};
