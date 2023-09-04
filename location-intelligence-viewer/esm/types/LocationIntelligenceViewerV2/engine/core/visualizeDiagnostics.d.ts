import Stats from 'three/examples/jsm/libs/stats.module';
export declare class VisualizeDiagnostics {
    private _stats;
    constructor();
    private positionStats;
    get stats(): Stats;
    dispose(): void;
}
