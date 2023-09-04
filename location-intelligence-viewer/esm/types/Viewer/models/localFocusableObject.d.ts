import { VisualizeFocusType } from "../../LocationIntelligenceViewerV2/engine/internal/enum/visualizeFocusType";
import { FocusableObject } from "./focusableObject";
export interface LocalFocusableObject extends FocusableObject {
    focusableType: VisualizeFocusType.LOCAL;
    show?(): void;
}
