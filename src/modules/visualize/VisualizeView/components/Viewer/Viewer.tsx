import { useTheme } from '@mui/styles';
import { styled } from '@mui/system';
import {
    DisplayStyle,
    LocationIntelligenceViewerV2,
    Project,
    SmartProjectSite,
    ViewerController,
} from 'location-intelligence-viewer';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import { Theme } from 'src/modules/visualize/theme';
import { useIsPCL } from 'src/modules/visualize/VisualizeRouting/PCL';

import { useIsMounted } from '../../hooks/useIsMounted';
import { SmartNodes } from '../../models/SmartNodes';
import { useAnalytics } from '../../utils/analytics';
import { LocationFormStatusFilters } from '../LocationTreeFormStatus/LocationFormStatusFilters';
import { LocationTreeFormStatus } from '../LocationTreeFormStatus/LocationTreeFormStatus';

const LocationIntelligenceViewerContainer = styled('div')(({theme}: {theme: Theme}) => ({
    position: 'relative',
    width: '100%',
    zIndex: 1,

    '& .attribution-link': {
        color: theme.colors.lightGrey,
    },

    '& .location-intelligence-mapbox-attribution-mapboxLogo': {
        marginLeft: '8px',
    },
}));

const FormStatus = styled('div')(({theme}) => ({
    position: 'absolute',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    paddingRight: '0px',
    zIndex: 2,
    top: '12px',
    pointerEvents: 'none',

    [(theme as Theme).breakpoints.down('sm')]: {
        justifyContent: 'flex-end',
        paddingRight: '4px',
    },
}));

interface ViewerProps {
    project: Project;
    onProjectInitialized: (projectSite: SmartProjectSite) => void;
    onNodeClick: (node: SmartNodes) => void;
    selectedMapNode: SmartNodes;
    onBuildingLeave: () => void;
    setFormStatusFilter: (formStatusFilter: LocationFormStatusFilters) => void;
}

export function Viewer({project, onProjectInitialized, onNodeClick, selectedMapNode, onBuildingLeave, setFormStatusFilter}: ViewerProps) {
    const theme = useTheme<Theme>();
    const {tilesets} = useIsPCL();
    const {track, timeEvent} = useAnalytics();

    const [viewerController, setViewerController] = useState<ViewerController>();
    const isMounted = useIsMounted();

    const {state: navMenuState} = useContext(stateContext);

    useEffect(() => {
        setTimeout(() => {
            if (Boolean(viewerController) && isMounted.current) {
                viewerController!.resize();
            }
        }, 0);
    }, [navMenuState.isDrawerOpen, viewerController]);

    useEffect(() => {
        if (Boolean(project)) {
            timeEvent('Visualize-Smart-Project-Loaded');
        }
    }, [project]);

    function _onProjectInitialized(smartProjectSite: SmartProjectSite) {
        smartProjectSite.jumpTo();
        onProjectInitialized(smartProjectSite);

        track('Visualize-Smart-Project-Loaded');
    }

    return (
        <>
            <LocationIntelligenceViewerContainer theme={theme}>
                <LocationIntelligenceViewerV2
                    project={project}
                    onProjectInitialized={_onProjectInitialized}
                    onViewerInitialized={setViewerController}
                    onNodeClick={(node) => onNodeClick(node as SmartNodes)}
                    selectedNode={selectedMapNode}
                    onBuildingLeave={onBuildingLeave}
                    mapboxInfo={{token: process.env["REACT_APP_MAPBOX_KEY"], tilesets: tilesets}}
                    displayStyle={DisplayStyle.Greyscale}
                    defaultLocation={[0, 0]}
                />
            </LocationIntelligenceViewerContainer>

            <FormStatus>
                <LocationTreeFormStatus onActiveStatusSwitch={setFormStatusFilter}/>
            </FormStatus>
        </>
    )
}