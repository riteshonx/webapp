import { styled } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import MuiTreeItem from '@mui/lab/TreeItem';
import { makeStyles } from '@mui/styles';
import { SmartBuilding, SmartLevel, SmartZone } from 'location-intelligence-viewer';
import { Children, memo, MutableRefObject, ReactNode, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { MouseEvent } from 'react';
import { Theme } from 'src/modules/visualize/theme';

import { SmartNodes } from '../../models/SmartNodes';

const treeItemStyles = ({
    '& .Mui-selected': {
        backgroundColor: 'transparent !important',

        '& .MuiTreeItem-label': {
            fontWeight: '700 !important',
        },
    },

    '& .MuiTreeItem-content': {
        padding: '5px 8px',
    },

    '& .MuiTreeItem-label': {
        fontSize: '14px !important',
        'line-height': '1.2 !important',
    },
});

const StyledTreeItem = styled(MuiTreeItem)(treeItemStyles);

const useStyles = makeStyles((theme: Theme) => ({
    arrow: {
        transform: 'rotate(0deg)',
        color: theme.colors.mediumGrey,
    },

    expanded: {
        transform: 'rotate(90deg)',
        color: 'black',
    }
}));

const Label = styled('div')({
    display: 'flex',
    fontFamily: "'Poppins', sans-serif",
});

const NodeNameInLabel = styled('span')({
    width: '100%',
    wordBreak: 'break-word',
});

interface MapTreeItemProps {
    children?: ReactNode | ReactNode[];
    isExpanded: boolean;
    showDeselect?: boolean;
    showRoomsAndZones?: boolean;
    selectedNode: SmartNodes;
    clickedNode: MutableRefObject<SmartNodes | undefined>;
    node: SmartNodes;
    onClick: (node: SmartNodes) => void;
    onDeselect?: (node: SmartNodes) => void;
    treeContainerRef: MutableRefObject<HTMLDivElement>;
}

function CustomMapTreeItem({children, isExpanded, showDeselect, showRoomsAndZones, selectedNode, clickedNode, node, onClick, onDeselect, treeContainerRef}: MapTreeItemProps) {
    const classes = useStyles();

    const containerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;
    const labelContainerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;


    function _onDeselect(event: MouseEvent) {
        event.stopPropagation();
        
        if (Boolean(onDeselect)) {
            onDeselect!(node);
        }
    }

    const showIcon = useMemo(() => {
        switch(node.nodeType) {
            case 'Building': return (node as SmartBuilding).levels?.length > 0;
            case 'Level': {
                const isSelectedNodeInLevel = Boolean(selectedNode) && Boolean((node as SmartLevel).findNodeByExternalId(selectedNode.externalReferenceId)) && node.id !== selectedNode.id;
                const shouldRoomsAndZonesBeVisible = showRoomsAndZones && ((node as SmartLevel).zones?.length > 0 || (node as SmartLevel).rooms?.length > 0);
                
                return shouldRoomsAndZonesBeVisible || isSelectedNodeInLevel;
            }
            case 'Zone': {
                const isSelectedNodeInZone = Boolean(selectedNode) && Boolean((node as SmartZone).findNodeByExternalId(selectedNode.externalReferenceId)) && node.id !== selectedNode.id;
                const shouldRoomsBeVisisble = showRoomsAndZones && ((node as SmartZone).zones?.length > 0 || (node as SmartZone).rooms?.length > 0);
                
                return shouldRoomsBeVisisble || isSelectedNodeInZone;
            }
            case 'Room': return false;
        }
    }, [node, showRoomsAndZones, selectedNode]);

    const label = useMemo(() => {
        return (
            <Label ref={labelContainerRef}>
                <NodeNameInLabel>{node.name}</NodeNameInLabel>
                {
                    showDeselect &&
                        <span style={{height: '16px'}} onClick={(event) => _onDeselect(event as MouseEvent)}>
                            <Close style={{marginTop: '-2px'}} fontSize='small' />
                        </span>
                }
            </Label>
        )
    }, [node, showDeselect]);

    useLayoutEffect(() => {
        if (Boolean(clickedNode.current) && Boolean(node) && clickedNode.current?.externalReferenceId === node?.externalReferenceId) {
            const treeContainerBoundingRect = treeContainerRef.current.getBoundingClientRect();
            const labelBoundingRect = labelContainerRef.current.getBoundingClientRect();
            
            const topOfLabelUnderTopOfTreeContainer = labelBoundingRect.top > treeContainerBoundingRect.top;
            const bottomOfLabelAboveBottomOfTreeContainer = labelBoundingRect.bottom < treeContainerBoundingRect.bottom;

            if (!topOfLabelUnderTopOfTreeContainer || !bottomOfLabelAboveBottomOfTreeContainer) {
                containerRef.current!.scrollIntoView();
            }
        }

        if (clickedNode.current?.externalReferenceId !== selectedNode?.externalReferenceId) {
            setTimeout(() => {
                if (Boolean(containerRef.current) && node.id === selectedNode?.id) {
                    containerRef.current!.scrollIntoView();
                }
            }, 1e3 / 60);
        }
    }, [selectedNode, showRoomsAndZones, node]);

    return (
        <div
            ref={containerRef}
        >
            <StyledTreeItem
                icon={showIcon && <KeyboardArrowRightIcon className={`${classes.arrow} ${isExpanded ? classes.expanded : ''}`} />}
                nodeId={node.id.toString()}
                id={`map_node_${node.id.toString()}`}
                label={label}
                onClick={() => onClick(node)}
            >
                {Boolean(children) && children}
            </StyledTreeItem>
        </div>
    )
}

export const MapTreeItem = memo(CustomMapTreeItem) 