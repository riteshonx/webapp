import { Interactable } from '../models/Interactable';
declare class InteractableObjectsManager {
    interactableObjects: Map<string, Interactable>;
    interactableObjectsAsArray: Interactable[];
    add(interactable: Interactable): void;
    remove(interactable: Interactable): void;
    clear(): void;
    get activeInteractables(): Interactable[];
}
export declare const interactableObjectsManager: InteractableObjectsManager;
export {};
