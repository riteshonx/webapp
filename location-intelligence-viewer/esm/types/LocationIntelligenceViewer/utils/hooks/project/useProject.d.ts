/// <reference types="react" />
import { FocusableObject } from '../../../../Viewer/models/focusableObject';
import { ProjectOutline } from '../../../model/external/project/projectOutline';
import { SmartProjectSite } from '../../../model/external/smart';
import { Project } from '../../../model/project';
declare type OnProjectInitialized = (smartProjectSite: SmartProjectSite) => void;
declare type SetFocusdObject = (focusableObject: FocusableObject) => Promise<void>;
export declare function useProject(projectOutline: ProjectOutline, onProjectInitialized: OnProjectInitialized, focusOn: SetFocusdObject): {
    readonly project: Project;
    readonly smartProject: import("react").MutableRefObject<SmartProjectSite>;
};
export {};
