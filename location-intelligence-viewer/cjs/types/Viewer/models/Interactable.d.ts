import { BufferGeometry, Material, Mesh, Object3D } from 'three';
interface _Interactable {
    geometry?: BufferGeometry;
    material?: Material | Material[];
    interactableId?: string;
}
export interface IInteractable extends Object3D {
    onHoverEnter: () => void;
    onHoverExit: () => void;
    onClick: () => void;
}
export declare class Interactable extends Mesh implements IInteractable {
    managerId: string;
    interactableId: string;
    type: 'Interactable';
    interactable: boolean;
    objectBeingInteracted: IInteractable;
    constructor(interactable?: _Interactable);
    onHoverEnter(): void;
    onHoverExit(): void;
    onClick(): void;
    static convertMeshToInteractable(mesh: Mesh, interactableId: string, onHover: () => void, onUnHover: () => void, onClick: () => void, objectBeingInteracted?: IInteractable): void;
}
export {};
