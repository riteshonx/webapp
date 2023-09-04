import { styled } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';import MuiTreeItem from '@mui/lab/TreeItem';
import { SmartBuilding, SmartLevel, SmartZone } from 'location-intelligence-viewer';
import { memo, MutableRefObject, ReactNode, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { MouseEvent } from 'react';
import { SmartNodes } from 'src/modules/visualize/VisualizeView/models/SmartNodes';

const Label = styled('div')({
    display: 'flex',
    alignItems: 'center',
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
            <Label ref={labelContainerRef} tabIndex={-1}>
                <NodeNameInLabel tabIndex={-1}>{node.name}</NodeNameInLabel>
                {
                    showDeselect &&
                        <span style={{height: '16px'}} onClick={(event) => _onDeselect(event as MouseEvent)} tabIndex={-1}>
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

        if(selectedNode?.externalReferenceId === node.externalReferenceId) {
            containerRef.current.focus();
        }
    }, [selectedNode, showRoomsAndZones, node]);

    const onKeyDown = (e: any, node: SmartNodes) => {
        if (e.keyCode == '13') {
            onClick(node);
            e.stopPropagation();
        }
    }

    return (
        <div
            className='v2-visualize-locationtree-container'
            onKeyDown={(e) => onKeyDown(e, node)} 
            tabIndex={0}
            ref={containerRef}
        >
            <MuiTreeItem
                className='v2-visualize-locationtree-item'
                icon={showIcon && <ArrowRightIcon className={`${isExpanded ? 'expanded' : 'arrow'}`} />}
                nodeId={node.id.toString()}
                id={`map_node_${node.id.toString()}`}
                label={label}
                onClick={() => onClick(node)}
                tabIndex={-1}
            >
                {Boolean(children) && children}
            </MuiTreeItem>
        </div>
    )
}

export const MapTreeItem = memo(CustomMapTreeItem) 