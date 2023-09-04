import TreeView from '@mui/lab/TreeView';
import { SmartBuilding, SmartLevel, SmartNodeCollection, SmartRoom, SmartZone } from 'location-intelligence-viewer';
import * as React from 'react';
import { MutableRefObject, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { SmartNodes } from 'src/modules/visualize/VisualizeView/models/SmartNodes';
import { MapTreeItem } from './MapTreeItem';

interface MapTreeProps {
    buildings: SmartBuilding[];
    onNodeClick: (node: SmartNodes) => void;
    selectedNode: SmartNodes;
    showRoomsAndZones: boolean;
    treeContainerRef: MutableRefObject<HTMLDivElement>;
}

export function MapTree({buildings, onNodeClick, selectedNode, showRoomsAndZones, treeContainerRef}: MapTreeProps) {
    const [ancestors, setAncestors] = useState<SmartNodes[]>([]);
    const previousSelectedNode = useRef<SmartNodes>();
    const clickedNode = useRef<SmartNodes>();
    const [expandSelectedNode, setExpandSelectedNode] = useState<boolean>();
    function _onNodeClick(node: SmartNodes) {
        clickedNode.current = node;

        // If there was no previous node or the previous node is different then always keep selected node expanded.
        if (!Boolean(previousSelectedNode.current) || previousSelectedNode.current!.id !== node.id) {
            setExpandSelectedNode(true);
            onNodeClick(node);
        }
    
        // If there was a previous node and the previous node is the same as the recently clicked one then toggle the expanded state.
        if (Boolean(previousSelectedNode.current) && previousSelectedNode.current!.id === node.id) {
            setExpandSelectedNode(!expandSelectedNode);
        }
        
        buildAncestors(node);
        previousSelectedNode.current = node;
    }

    useEffect(() => {
        // Whenever the outside changes the selected node we want to keep the node expanded.
        setExpandSelectedNode(true);
        buildAncestors(selectedNode);
        previousSelectedNode.current = selectedNode;
    }, [selectedNode]);

    useLayoutEffect(() => {
        // If the user has selected a node through a method other than clicking inside this map nav tree
        if (clickedNode.current?.externalReferenceId !== selectedNode?.externalReferenceId) {
            clickedNode.current = undefined;
        }
    }, [selectedNode, showRoomsAndZones]);

    function buildAncestors(selectedNode: SmartNodes) {
        const expandedAncestors: SmartNodes[] = [];

        if (Boolean(selectedNode)) {
            selectedNode.traverseAncestors((ancestor) => {
                if (ancestor.id !== selectedNode.id) {
                    expandedAncestors.push(ancestor as SmartNodes);
                }
            });
        }

        const uniqueAncestors = Array.from(new Set(expandedAncestors));
        setAncestors(uniqueAncestors);
    }

    const expandedNodeIds = useMemo(() => {
        const ancestorIds = ancestors.map((ancestor) => ancestor.id.toString());

        if (expandSelectedNode && Boolean(selectedNode)) {
            return [...ancestorIds, selectedNode.id.toString()];
        } else {
            return [...ancestorIds];
        }
    }, [expandSelectedNode, ancestors, selectedNode]);

    const selectedNodeIds = useMemo(() => Boolean(selectedNode) ? [selectedNode.id.toString()] : [], [selectedNode]);

    function isNodeExpanded(nodeId: string) {
        return expandedNodeIds.includes(nodeId);
    }

    const NodeCollection = (nodeCollection: SmartNodeCollection) => (
        <MapTreeItem
            isExpanded={isNodeExpanded(nodeCollection.id.toString())}
            showRoomsAndZones={showRoomsAndZones}
            node={nodeCollection}
            onClick={_onNodeClick}
            selectedNode={selectedNode}
            clickedNode={clickedNode}
            showDeselect={selectedNode?.id === nodeCollection.id}
            treeContainerRef={treeContainerRef}
            onDeselect={(node) => {
                if ((node as SmartNodeCollection).parentLevel) {
                    _onNodeClick((node as SmartNodeCollection).parentLevel!);
                }
            }}
            key={`tree_node_${nodeCollection.id}`}
        />
    );

    const SingleNodeCollectionZone = (zone: SmartZone, nodeCollection: SmartNodeCollection) => (
        <MapTreeItem
            isExpanded={isNodeExpanded(zone.id.toString())}
            showRoomsAndZones={showRoomsAndZones}
            node={zone}
            selectedNode={selectedNode}
            clickedNode={clickedNode}
            onClick={_onNodeClick}
            showDeselect={selectedNode?.id === zone.id}
            treeContainerRef={treeContainerRef}
            onDeselect={(node) => _onNodeClick((node as SmartZone).parentLevel)}
            key={`tree_node_${nodeCollection.id}`}
        >
            {
                Boolean(nodeCollection) && NodeCollection(nodeCollection)
            }
        </MapTreeItem>
    );

    const Room = (room: SmartRoom) => (
        <MapTreeItem
            isExpanded={isNodeExpanded(room.id.toString())}
            showRoomsAndZones={showRoomsAndZones}
            node={room}
            onClick={_onNodeClick}
            selectedNode={selectedNode}
            clickedNode={clickedNode}
            showDeselect={selectedNode?.id === room.id}
            treeContainerRef={treeContainerRef}
            onDeselect={(node) => _onNodeClick((node as SmartRoom).parentLevel)}
            key={`tree_node_${room.id}`} 
        />
    );

    const Zone = (zone: SmartZone) => (
        <MapTreeItem
            isExpanded={isNodeExpanded(zone.id.toString())}
            showRoomsAndZones={showRoomsAndZones}
            node={zone}
            selectedNode={selectedNode}
            clickedNode={clickedNode}
            onClick={_onNodeClick}
            showDeselect={selectedNode?.id === zone.id}
            treeContainerRef={treeContainerRef}
            onDeselect={(node) => _onNodeClick((node as SmartZone).parentLevel)}
            key={`tree_node_${zone.id}`}
        >
            {
                Boolean(selectedNode) &&
                selectedNode.nodeType === 'NodeCollection' &&
                (selectedNode as SmartNodeCollection).parentNode.nodeType === 'Zone' &&
                (selectedNode as SmartNodeCollection).parentNode.id === zone.id && NodeCollection(selectedNode)
            }
            {
                showRoomsAndZones && zone.zones.map((_zone) => zone.isVisibleOnTree && Zone(_zone))
            }

            {
                showRoomsAndZones && zone.rooms.map((room) => room.isVisibleOnTree && Room(room))
            }
        </MapTreeItem>
    );

    // TODO - Change To Node And Parent That Can Call Itself Recursively If Zones within Zones are needed.
    const SingleRoomZone = (zone: SmartZone, room: SmartRoom) => (
        <MapTreeItem
            isExpanded={isNodeExpanded(zone.id.toString())}
            showRoomsAndZones={showRoomsAndZones}
            node={zone}
            selectedNode={selectedNode}
            clickedNode={clickedNode}
            onClick={_onNodeClick}
            showDeselect={selectedNode?.id === zone.id}
            treeContainerRef={treeContainerRef}
            onDeselect={(node) => _onNodeClick((node as SmartZone).parentLevel)}
            key={`tree_node_${selectedNode.id}`}
        >
            {
                Boolean(room) && Room(room)
            }
        </MapTreeItem>
    );

    const Level = (level: SmartLevel) => (
        <MapTreeItem
            isExpanded={isNodeExpanded(level.id.toString())}
            showRoomsAndZones={showRoomsAndZones}
            key={`tree_node_${level.id}`}
            node={level}
            selectedNode={selectedNode}
            clickedNode={clickedNode}
            onClick={_onNodeClick}
            treeContainerRef={treeContainerRef}
        >
            {
                Boolean(selectedNode) &&
                selectedNode.nodeType === 'NodeCollection' &&
                (selectedNode as SmartNodeCollection).parentNode.nodeType === 'Level' &&
                (selectedNode as SmartNodeCollection).parentNode.id === level.id && NodeCollection(selectedNode)
            }
            {
                showRoomsAndZones ?
                    <>
                        {
                            level.zones.map((zone) => zone.isVisibleOnTree &&  Zone(zone))
                        }

                        {
                            level.rooms.map((room) => room.isVisibleOnTree && Room(room))
                        }
                    </> :
                    <>
                        {
                            Boolean(selectedNode) &&
                            selectedNode.nodeType === 'Room' &&
                            (selectedNode as SmartRoom).parentLevel.id === level.id &&
                            (selectedNode as SmartRoom).parentNode.nodeType !== 'Zone' && Room(selectedNode as SmartRoom)
                        }
                        {
                            Boolean(selectedNode) &&
                            selectedNode.nodeType === 'Room' &&
                            (selectedNode as SmartRoom).parentLevel.id === level.id &&
                            (selectedNode as SmartRoom).parentNode.nodeType === 'Zone' &&
                                SingleRoomZone(selectedNode.parentNode as SmartZone, selectedNode as SmartRoom)
                        }
                        {
                            Boolean(selectedNode) &&
                            selectedNode.nodeType === 'NodeCollection' &&
                            (selectedNode as SmartNodeCollection).parentNode.nodeType === 'Zone' &&
                            (selectedNode as SmartNodeCollection).parentNode.parentNode.id === level.id && SingleNodeCollectionZone(selectedNode.parentNode as SmartZone, selectedNode)
                        }
                        {
                            Boolean(selectedNode) && selectedNode.nodeType === 'Zone' && (selectedNode as SmartZone).parentLevel.id === level.id && Zone(selectedNode as SmartZone)
                        }
                    </>
            }
        </MapTreeItem>
    );

    const Building = (building: SmartBuilding) => (
        <MapTreeItem
            isExpanded={isNodeExpanded(building.id.toString())}
            showRoomsAndZones={showRoomsAndZones}
            node={building}
            selectedNode={selectedNode}
            clickedNode={clickedNode}
            onClick={_onNodeClick}
            treeContainerRef={treeContainerRef}
            key={`tree_node_${building.id}`}
        >
            {building.levels.map((level) => level.isVisibleOnTree &&  Level(level) )}
        </MapTreeItem>  
    );

    return (
        <>
            <TreeView
                selected={selectedNodeIds}
                expanded={expandedNodeIds}
                tabIndex={-1}
            >
                {
                    Boolean(buildings) && buildings.map((building) => building.isVisibleOnTree && Building(building))
                }
            </TreeView>
        </>
    );
}