import { ViewerController } from 'location-intelligence-viewer';
import { useContext, useEffect, useState } from 'react';
import { stateContext } from 'src/modules/root/context/authentication/authContext';

import { useIsMounted } from './useIsMounted';

export function useViewerResizeOnNavMenuChange(viewerController: ViewerController) {
    const {state: navMenuState} = useContext(stateContext);

    const isMounted = useIsMounted();

    useEffect(() => {
        setTimeout(() => {
            if (Boolean(viewerController) && isMounted.current) {
                viewerController!.resize();
            }
        }, 0);
    }, [navMenuState.isDrawerOpen, viewerController]);
}