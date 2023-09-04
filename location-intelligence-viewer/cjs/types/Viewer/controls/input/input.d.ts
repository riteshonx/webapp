import { Vector2 } from 'three';
import { Keys } from './keys';
export declare class Input {
    static mouseOffset: Vector2;
    private static pointerLockEnabled;
    private static mouseOverCanvas;
    private static previousFrameMouseOffset;
    private static upInputs;
    private static downInputs;
    private static inputs;
    private static canvas;
    private static mouseMovementTotal;
    static initialize(canvas: HTMLCanvasElement): void;
    static startPointerLock(): void;
    static endPointerLock(): void;
    static onMouseMove(event: MouseEvent): void;
    private static onKeyDown;
    private static onKeyUp;
    static keyDown(key: Keys): boolean;
    static keyHeld(key: Keys): boolean;
    static keyUp(key: Keys): boolean;
    static onFrameStart(): void;
    static onFrameEnd(): void;
}
