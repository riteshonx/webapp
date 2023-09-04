export declare class CallbackOnTrueBehaviourSubject {
    private behaviourSubject;
    next(value: boolean): void;
    subscribe(callback: () => void): void;
}
