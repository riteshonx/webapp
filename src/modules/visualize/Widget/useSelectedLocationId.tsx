import { SmartProjectSite } from 'location-intelligence-viewer';
import { useEffect } from 'react';

import { SmartNodes } from '../VisualizeView/models/SmartNodes';

export function useSelectedLocationId(
    selectedLocationId: string,
    smartProjectSite: SmartProjectSite,
    setSelectedMapNode: (selectedMapNode: SmartNodes) => void
) {
    useEffect(() => {
        if (Boolean(smartProjectSite) && Boolean(selectedLocationId)) {
            const locationNode = smartProjectSite?.findNodeByExternalId(selectedLocationId!);

            if (Boolean(locationNode)) {
                setSelectedMapNode(locationNode! as SmartNodes);
            }
        }
    }, [selectedLocationId, smartProjectSite]);
}