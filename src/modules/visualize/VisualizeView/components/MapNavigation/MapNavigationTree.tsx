import { makeStyles } from '@mui/styles';
import { SmartBuilding } from 'location-intelligence-viewer';
import { useEffect, useRef, useState } from 'react';
import { Theme } from 'src/modules/visualize/theme';

import { Switch } from '../../controls/ToggleSwitches';
import { SmartNodes } from '../../models/SmartNodes';
import { ExteriorButton } from './Exterior.button';
import { MapTree } from './MapTree';

const sectionHeight = 53;
const advancedToggleUISectionHeight = 84;

const useStyles = makeStyles((theme: Theme) => ({
    mapNavigationContainer: {
        width: '100%',
        height: '100%',
        paddingTop: '14px',
        overflow: 'hidden',
        borderRight: `solid 1px ${theme.colors.lightGrey}`,
        boxSizing: 'border-box',
    },

    section: {
        boxSizing: 'border-box',
        borderBottom: 'solid 1px',
        minHeight: `${sectionHeight}px`,
        height: `${sectionHeight}px`,
        maxHeight: `${sectionHeight}px`,
    },

    mapTreeContainer: {
        overflow: 'auto',
        height: `calc(100% - ${advancedToggleUISectionHeight}px)`,
    },

    advancedUIToggleContainer: {
        
        paddingLeft: '23px',
        paddingBottom: '27px',
        paddingRight: '4px',
    },
}));

interface MapNavigationTreeProps {
    buildings: SmartBuilding[];
    onHomeViewClicked: () => void;
    onMapNavNodeClicked: (node: SmartNodes) => void;
    selectedNode: SmartNodes;
}

export function MapNavigationTree({buildings, onHomeViewClicked, onMapNavNodeClicked, selectedNode}: MapNavigationTreeProps) {
    const classes = useStyles();

    const [useAdvanced, setUseAdvanced] = useState<boolean>(true);

    const treeContainerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;

    return (
        <div className={classes.mapNavigationContainer}>
            <div className={classes.advancedUIToggleContainer}>
                <Switch defaultToggle={true} datatestid='Use-Advanced-Nav' onToggle={setUseAdvanced} label={'List All Navigation Areas'}/>
            </div>

            <div
                className={classes.mapTreeContainer}
                ref={treeContainerRef}
            >
                <span style={{marginLeft: '24px'}}>
                    <ExteriorButton onClick={onHomeViewClicked} selected={!Boolean(selectedNode)} />
                </span>

                <MapTree
                    buildings={buildings}
                    onNodeClick={onMapNavNodeClicked}
                    selectedNode={selectedNode!}
                    showRoomsAndZones={useAdvanced}
                    treeContainerRef={treeContainerRef}
                />
            </div>
        </div>
    );
}