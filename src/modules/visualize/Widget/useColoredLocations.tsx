import { HoverHighlightMode, SmartProjectSite } from 'location-intelligence-viewer';
import { useEffect, useRef } from 'react';

import { SmartNodes } from '../VisualizeView/models/SmartNodes';
import { ColoredLocation } from './coloredLocation';

const highlightStrength = 0.35;

export function useColoredLocations(coloredLocations: ColoredLocation[], smartProjectSite: SmartProjectSite) {
    const currentlyColoredDict = useRef<Map<string, SmartNodes>>(new Map([])); 

    useEffect(() => {
        if (Boolean(coloredLocations) && Boolean(smartProjectSite)) {
            clear();
            coloredLocations.forEach(colorNode);
        }
    }, [coloredLocations, smartProjectSite]);

    function clear() {
        currentlyColoredDict.current.forEach((node) => {
            node.unHighlight(true);
        });

        currentlyColoredDict.current.clear();
    }

    function colorNode({locationId, color}: ColoredLocation) {
        const nodeToColor = smartProjectSite.findNodeByExternalId(locationId);
        nodeToColor.highlight(color, {persist: true, strength: highlightStrength, hoverHighlightMode: HoverHighlightMode.Replace});
        currentlyColoredDict.current.set(locationId, nodeToColor as SmartNodes);
    }

}