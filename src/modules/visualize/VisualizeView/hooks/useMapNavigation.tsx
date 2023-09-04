import {
    SmartBuilding,
    SmartLevel,
    SmartNodeCollection,
    SmartProjectSite,
    SmartRoom,
    SmartZone,
} from 'location-intelligence-viewer';
import { useEffect, useRef, useState } from 'react';

import { Form } from '../models/form';
import { SmartNodes } from '../models/SmartNodes';
import { NodeTrackingEvents, useAnalytics } from '../utils/analytics';

export function useMapNavigation(projectSite: SmartProjectSite) {
    const {track} = useAnalytics();
    const [selectedMapNode, setSelectedMapNode] = useState<SmartNodes>();
    const [selectedMapNodeForViewer, setSelectedMapNodeForViewer] = useState<SmartNodes>();
    const previouslySelectedMapNode = useRef<SmartNodes>();

    const lastSelectedRoom = useRef<SmartRoom | SmartZone>();

    useEffect(() => {
        trackNode('Selected-Map-Node-Changed', selectedMapNode);
    }, [selectedMapNode]);

    useEffect(() => {
        trackNode('Selected-Viewer-Node-Changed', selectedMapNode);
    }, [selectedMapNodeForViewer]);

    function onExteriorClicked() {
        if (Boolean(projectSite)) {
            setSelectedMapNode(undefined);
            setSelectedMapNodeForViewer(undefined);
            previouslySelectedMapNode.current = undefined;
            projectSite.focus();
            projectSite.show();
            projectSite.unHighlightAll();
            // projectSite.showMap();
            projectSite.setBuildingContext();
    
            track('Exterior-Selected');
        }
    }

    function onMapNavNodeClicked(node: SmartNodes, isIntialLoading = false) {
        if (node.nodeType === 'Building') {
            projectSite.jumpTo();
            (node as SmartBuilding).show();
            (node as SmartBuilding).setLevelContext();
        }

        if (node.nodeType === 'Building' || node.nodeType === 'Level') {
            node.focus();
        }

        if (isIntialLoading && node.nodeType !== 'Building') {
            (node.nodeType === 'Level') ?  setSelectedMapNodeForViewer((node as SmartLevel).parentBuilding)
                : setSelectedMapNodeForViewer((node as SmartZone | SmartRoom).parentLevel.parentBuilding);
        }

        if ((node.nodeType === 'Zone' || node.nodeType === 'Room') && previouslySelectedMapNode.current !== (node as SmartZone | SmartRoom).parentLevel) {
            (node as SmartZone | SmartRoom).parentLevel.focus();
        }

        if (node.nodeType === 'Room' || node.nodeType === 'Zone') {
            lastSelectedRoom.current = (node as SmartRoom | SmartZone);
        } else {
            lastSelectedRoom.current = undefined;
        }

        setSelectedMapNode(node);
        (!isIntialLoading) ? setSelectedMapNodeForViewer(node) : setTimeout(() => setSelectedMapNodeForViewer(node), 1500);
        previouslySelectedMapNode.current = node;
        trackNode('Node-Selected-In-Map-Nav', node);
    }

    function onNodeClickInViewer(node: SmartNodes) {
        let selectedNode = node;

        if (!Boolean(node) && Boolean(previouslySelectedMapNode.current)) {
            const previousNode = previouslySelectedMapNode.current!;
            
            switch(previousNode.nodeType) {
                case 'Building': selectedNode = previousNode;
                    break;
                case 'Level': selectedNode = previousNode;
                    break;
                case 'Zone': selectedNode = (previousNode as SmartZone).parentLevel;
                    break;
                case 'Room':
                    selectedNode = (previousNode as SmartRoom).parentLevel;
                    break;
                case 'NodeCollection': {
                        if (Boolean(previousNode.parentLevel)) {
                            selectedNode = previousNode.parentLevel!;
                        }
                    }
                    break;
            }
        }

        if (Boolean(selectedNode) && (selectedNode.nodeType === 'Room' || selectedNode.nodeType === 'Zone')) {
            lastSelectedRoom.current = (selectedNode as SmartRoom | SmartZone);
        } else {
            lastSelectedRoom.current = undefined
        }

        setSelectedMapNode(selectedNode);
        setSelectedMapNodeForViewer(selectedNode);
        previouslySelectedMapNode.current = selectedNode;

        trackNode('Node-Selected-In-Viewer', selectedNode);
    }

    function onSelectedFormChanged(selectedForm?: Form) {
        if (Boolean(selectedForm)) {
            const nodeTiedToForm = projectSite.findNodeByExternalId(selectedForm!.locationId!) as SmartNodes;

            if (nodeTiedToForm && nodeTiedToForm.nodeType == 'NodeCollection' && previouslySelectedMapNode.current) {
                (nodeTiedToForm as SmartNodeCollection).updateParentNode((previouslySelectedMapNode.current).externalReferenceId)
            }

            let parentBuilding: SmartBuilding;

            if (Boolean(nodeTiedToForm)) {            
                switch(nodeTiedToForm.nodeType) {
                    case 'Building':
                        nodeTiedToForm.focus();
                        parentBuilding = nodeTiedToForm as SmartBuilding;
                        projectSite.setBuildingContext();
                        break;
                    case 'Level':
                        nodeTiedToForm.focus();
                        parentBuilding = (nodeTiedToForm as SmartLevel).parentBuilding;
                        (nodeTiedToForm as SmartLevel).hideOtherLevels();
                        (nodeTiedToForm as SmartLevel).setContext();
                        break;
                    case 'Zone':
                    case 'Room':
                        const parentLevel = (nodeTiedToForm as SmartRoom).parentLevel;
                        parentBuilding = (nodeTiedToForm as SmartRoom).parentBuilding;
                        parentLevel.hideOtherLevels();
                        parentLevel.setRoomContext();
                        parentLevel.focus();
                        break;
                    case 'NodeCollection':
                        // TODO - right now the node collections are limited to being either rooms under zones, or rooms under levels
                        // This logic will need to change to accomodate other nodes being put into the node collection.
                        if(!nodeTiedToForm.parentLevel) 
                            return
                        nodeTiedToForm.focusOnLevel();
                        break;
                }

                // projectSite.hideMap();

                if (Boolean(parentBuilding!)) {
                    projectSite.buildings.forEach((building) => {
                        if (building !== parentBuilding) {
                            building.hide();
                        }
                    });
                }

                (nodeTiedToForm.nodeType !== 'NodeCollection' || nodeTiedToForm.parentNode) && setSelectedMapNode(nodeTiedToForm);

                if (nodeTiedToForm.nodeType === 'Room' || nodeTiedToForm.nodeType === 'Zone' || nodeTiedToForm.nodeType === 'Level' || nodeTiedToForm.nodeType === 'NodeCollection') {
                    setSelectedMapNodeForViewer(nodeTiedToForm);
                }

                trackNode('Node-Selected-By-Form', nodeTiedToForm);
                
                previouslySelectedMapNode.current = nodeTiedToForm;
            }
        } else {
            if (Boolean(previouslySelectedMapNode.current)
                    && (previouslySelectedMapNode.current!.nodeType === 'Room' || previouslySelectedMapNode.current!.nodeType === 'Zone')
                    && !Boolean(lastSelectedRoom.current)
                ) {
                const parentLevel = (previouslySelectedMapNode.current as SmartRoom).parentLevel;
                setSelectedMapNode(parentLevel);
                setSelectedMapNodeForViewer(parentLevel);

                trackNode('Node-Selected-By-Form-Being-Unset', parentLevel);
            }

            if (Boolean(previouslySelectedMapNode.current) && previouslySelectedMapNode.current!.nodeType === 'NodeCollection') {
                let parentLevel!: SmartLevel;
                const previousNodeAsNodeCollection = (previouslySelectedMapNode.current as SmartNodeCollection);

                if (Boolean(previousNodeAsNodeCollection.parentLevel)) {
                    parentLevel = previousNodeAsNodeCollection.parentLevel!;
                }

                if (Boolean(parentLevel)) {
                    setSelectedMapNode(parentLevel);
                    setSelectedMapNodeForViewer(parentLevel);

                    trackNode('Node-Selected-By-Form-Being-Unset', parentLevel);
                    previouslySelectedMapNode.current = parentLevel;
                }
            }

            if (Boolean(previouslySelectedMapNode.current) && previouslySelectedMapNode.current!.nodeType === 'Level') {
                (previouslySelectedMapNode.current as SmartLevel).setRoomContext();
            }
        }
    }

    function onFormsBackButtonClicked() {
        if (Boolean(lastSelectedRoom.current) && (previouslySelectedMapNode.current?.nodeType === 'Room' || previouslySelectedMapNode.current?.nodeType === 'Zone')) {
            setSelectedMapNode(lastSelectedRoom.current);
            setSelectedMapNodeForViewer(lastSelectedRoom.current);

            trackNode('Node-Selected-By-Form-Back-Button', lastSelectedRoom.current!);
        } else {
            track('Node-Unselected-By-Form-Back-Button');
        }
    }

    function trackNode(event: NodeTrackingEvents, node?: SmartNodes) {
        track(event, {
            nodeName: node?.name,
            id: node?.externalReferenceId,
            projectId: projectSite?.id,
            nodeType: node?.nodeType,
        });
    }

    return {
        selectedMapNode,
        selectedMapNodeForViewer,
        onExteriorClicked,
        onMapNavNodeClicked,
        onNodeClickInViewer,
        onSelectedFormChanged,
        onFormsBackButtonClicked,
    } as const;
}