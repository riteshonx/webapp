import { Vector3 } from 'three';
import { Label } from '../../../../Viewer/models/label';
export declare class LabelManager {
    private labelOwners;
    private labels;
    classes: any;
    constructor();
    createLabelTextElement(text: string, issueCount?: number): Element;
    setLabel(contents: Element, owner: {
        id: number;
    }, position: Vector3): void;
    removeLabel(ownerId: number): void;
    removeAllLabels(): void;
    removeAllLabelsExcept(ownerIds: number[]): void;
    private get labelIds();
    setLabelsAsArray: (labels: Label[]) => void;
}
