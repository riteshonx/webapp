import { VisualizeFocusType } from "../../LocationIntelligenceViewerV2/engine/internal/enum/visualizeFocusType";
import { FocusableObject } from "./focusableObject";
export interface GlobeFocusableObject extends FocusableObject {
    focusableType: VisualizeFocusType.GLOBE;
}
