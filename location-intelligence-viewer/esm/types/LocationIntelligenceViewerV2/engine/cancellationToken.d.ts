export declare class CancellationToken {
    private cancellableActions;
    private _cancelled;
    onCancel(cancellableAction: () => void): void;
    cancel(): void;
    get isCancelled(): boolean;
}
