import { MutableRefObject } from 'react';
import { Scene } from 'three';
import { Label } from '../models/label';
export declare function useLabels(scene: MutableRefObject<Scene>, labelsThatShouldBeInScene: Label[]): void;
