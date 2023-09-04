import { MutableRefObject } from 'react';
import { Label } from '../../../../Viewer/models/label';
import { LabelManager } from './labelManager';
export declare function useLabels(): {
    readonly labels: Label[];
    readonly labelManager: MutableRefObject<LabelManager>;
};
