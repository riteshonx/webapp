import {
    HoverHighlightMode,
    SmartBuilding,
    SmartLevel,
    SmartNodeCollection,
    SmartProjectSite,
    SmartRoom,
    SmartZone,
} from 'location-intelligence-viewer';
import { useEffect, useMemo } from 'react';

import {
    modelHighlightClosedColor,
    modelHighlightDefaultColor,
    modelHighlightMixedColor,
    modelHighlightOpenColor,
    modelHighlightReadyColor
} from '../../theme';
import { FormTypeTask } from '../components/Forms/groupingWhiteList/FormTypeTask';
import { LocationFormStatusFilters } from '../components/LocationTreeFormStatus/LocationFormStatusFilters';
import { Form } from '../models/form';
import { FormStatus } from '../models/formStatus';
import { FormType } from '../models/formType';
import { LocationTree } from '../models/locationTree';
import { ChildNode } from '../models/locationTree/childNode';
import { ProjectTreeAndSmartObjectNodeMap } from '../models/projectTreeAndSmartObjectNodeMap';
import { SmartNodes } from '../models/SmartNodes';
import { useDataMode } from '../utils/DataMode';
import { useLocationFormStatus } from './useLocationFormStatus';

interface ColorAndStrength {
    color: string;
    strength: number;
}

const openColor: ColorAndStrength = {color: modelHighlightOpenColor, strength: .6};
const closedColor: ColorAndStrength = {color: modelHighlightClosedColor, strength: .6};
const mixedColor: ColorAndStrength = {color: modelHighlightMixedColor, strength: .5};
const readyColor: ColorAndStrength = {color: modelHighlightReadyColor, strength: .6};

// TODO - This is the default highlight color used by the location intelligence viewer
// In the future knowledge of this color should be abstracted out and there should probably be a "set persistant default color" function on
// the smart objects.
const defaultHighlightColor = modelHighlightDefaultColor;

export function useModelStatusColors(
        forms: Form[] | undefined,
        projectTreeMap: ProjectTreeAndSmartObjectNodeMap,
        locationTree: LocationTree,
        projectSite: SmartProjectSite,
        statusFilter: LocationFormStatusFilters[],
        selectedMapNode: SmartNodes,
        activeFormTypes: FormType[],
        selectedForm: Form,
        featureTypeTasks: FormTypeTask[],
        activeFormTemplate: FormType[],
        activeAssigneeToFormTypes: string[],
        activeIssueTypes: string[],
        onUpdateSelectedRoomLabel: ()=> void
    ) {
    
    const {dataMode} = useDataMode();

    const formStatusMap = useLocationFormStatus(forms, activeFormTypes, featureTypeTasks, statusFilter, activeFormTemplate, activeAssigneeToFormTypes, activeIssueTypes);
    
    useEffect(() => {
        if (Boolean(formStatusMap) && Boolean(locationTree)) {
            updateMapStatusesNewLogic(formStatusMap, locationTree, statusFilter, dataMode, featureTypeTasks);
        }

        if (Boolean(projectTreeMap) && Boolean(projectSite) && statusFilter !== undefined) {
            clear();

            if (Boolean(selectedMapNode) && Boolean(selectedForm) && Boolean(selectedForm.isLinkedToLocation)) {
                if (selectedMapNode.nodeType !== 'NodeCollection' && selectedMapNode.parentNode?.nodeType !== 'Zone') {
                    paintModel(selectedMapNode.parentNode as SmartNodes);
                } else {
                    paintModel(selectedMapNode);
                }

                paintNodeBySelectedForm(selectedForm);
            } else {
                paintModel(selectedMapNode);
            }
        }

        if (statusFilter === undefined || statusFilter[0] === LocationFormStatusFilters.None) {
            clear();
            if (Boolean(selectedForm) && selectedForm.isLinkedToLocation) {
                const nodeTiedToForm = projectSite.findNodeByExternalId(selectedForm!.locationId!);
                nodeTiedToForm.highlight(defaultHighlightColor);
            }

            if (Boolean(selectedMapNode)) {
                selectedMapNode.highlight(defaultHighlightColor)
            }
        }
    }, [
        projectTreeMap,
        projectSite,
        statusFilter,
        selectedMapNode,
        locationTree,
        formStatusMap,
        selectedForm,
        featureTypeTasks,
        dataMode,
    ]);

    // function updateMapStatuses(formStatusMap: Map<string, FormStatus>, locationTree: LocationTree, statusFilter: LocationFormStatusFilters, inBim360Mode: boolean, featureTypeTasks?: FormTypeTask[]) {
    //     locationTree.traverse((childNode) => {
    //         const formStatus = formStatusMap.get(childNode.childNodeId);

    //         const adjustedOpenForms = formStatus?.openForms ?? 0;
    //         const adjustedClosedForms = formStatus?.closedForms ?? 0;

    //         // TODO - If Testing Fails Try Re-Adding Some Of The Old Requirements To Run This Logic
    //         // if (inBim360Mode && adjustedClosedForms > 0 && statusFilter === LocationFormStatusFilters.Mixed) {
    //         //     // Get the total difference between the current open count and the active form types (counting each group as only one, if there are no groups count each form type as a group);
    //         //     const activeFormTypesAsGroups = featureTypeTasks?.map((task) => task.getGroupFromFeatureTypes(activeFormTypes)).filter((activeFormTypeGroups) => activeFormTypeGroups.length > 0) ?? activeFormTypes;
    //         //     console.log(activeFormTypesAsGroups)
    //         //     adjustedOpenForms += activeFormTypesAsGroups.length - (adjustedOpenForms + adjustedClosedForms);
    //         // }

    //         if (Boolean(formStatus)) {
    //             childNode.updateFormStatus(adjustedOpenForms, adjustedClosedForms, formStatus?.openIssueCount ?? 0);
    //         } else {
    //             childNode.updateFormStatus(0, 0, 0);
    //         }
    //     });        
    // }

    function updateMapStatusesNewLogic(formStatusMap: Map<string, FormStatus>, locationTree: LocationTree, statusFilter: LocationFormStatusFilters[], dataMode?: string, featureTypeTasks?: FormTypeTask[]) {
        if (!activeFormTypes) return; 
        const activeFormTypesAsGroups = featureTypeTasks?.map((task) => task.getGroupFromFeatureTypes(activeFormTypes)).filter((activeFormTypeGroups) => activeFormTypeGroups.length > 0) ?? activeFormTypes;
        locationTree.traverse((childNode) => {

            const formStatus = formStatusMap.get(childNode.childNodeId);

            if (!Boolean(formStatus)) {
                childNode.updateFormStatus(0, 0, 0, 0);
                return;
            }

            const adjustedClosedForms = formStatus?.closedForms ?? 0;
            let adjustedOpenForms = formStatus?.openForms ?? 0;
            const adjustedReadyForms = formStatus?.readyFormsCount ?? 0;

            if (adjustedClosedForms > 0 && adjustedClosedForms < activeFormTypesAsGroups.length && dataMode === 'Checklist' && adjustedOpenForms === 0 && statusFilter[0] === LocationFormStatusFilters.Mixed) {
                adjustedOpenForms += 1;
            }
             
            childNode.updateFormStatus(adjustedOpenForms, adjustedClosedForms, formStatus?.openIssueCount ?? 0, adjustedReadyForms);
        });        
    }

    function clear() {
        projectSite.traverse((node) => node.unHighlight(true));
    }

    function paintNodeBySelectedForm(selectedForm: Form) {
        if (Boolean(selectedForm)) {
            if (selectedForm.isLinkedToLocation) {
                const nodeTiedToForm = projectSite.findNodeByExternalId(selectedForm.locationId!) as SmartNodes;
                
                if (Boolean(nodeTiedToForm) && (nodeTiedToForm.nodeType !== 'NodeCollection' || nodeTiedToForm.parentLevel)) {
                    nodeTiedToForm.unHighlight(true);
                    nodeTiedToForm.highlight(defaultHighlightColor, {persist: true});
                }
            }
        }
    }

    function paintModel(mapNodeToPaint: SmartNodes) {
        if (!Boolean(mapNodeToPaint)) {
            paintBuildings();
            return;
        }

        switch(mapNodeToPaint.nodeType) {
            case 'Building': paintLevels(mapNodeToPaint as SmartBuilding);
                break;
            case 'Level': paintLevelRooms(mapNodeToPaint as SmartLevel);
                break;
            case 'Zone': paintZoneRooms(mapNodeToPaint as SmartZone);
                paintLevelRooms((mapNodeToPaint as SmartZone).parentLevel);
                mapNodeToPaint.unHighlight(true);
                mapNodeToPaint.highlight(defaultHighlightColor, {persist: true})
                break;
            case 'Room':
                const roomParentLevel = (mapNodeToPaint as SmartRoom).parentLevel;
                paintLevelRooms(roomParentLevel);
                mapNodeToPaint.unHighlight(true);
                mapNodeToPaint.highlight(defaultHighlightColor, {persist: true})
                break;
            case 'NodeCollection':
                paintNodeCollection(mapNodeToPaint);
                break;
        }
    }
    
    function paintBuildings() {
        projectSite.buildings.forEach((building) => {
            const {projectNode} = projectTreeMap.get(building.externalReferenceId)!;
            const color = getStatusColor(projectNode);
            
            if (Boolean(color)) {
                highlightNode(building, color!);
            }
        });
    }

    function paintLevels(building: SmartBuilding) {
        building.levels.forEach((level) => {
            const {projectNode} = projectTreeMap.get(level.externalReferenceId)!;
            const color = getStatusColor(projectNode);
            
            if (Boolean(color)) {
                highlightNode(level, color!);
            }
        });
    }

    function paintLevelRooms(level: SmartLevel) {
        level.rooms.forEach((room) => {
            const {projectNode} = projectTreeMap.get(room.externalReferenceId)!;
            room.setIssueCount(projectNode.openIssueCount);
            (room.id === selectedMapNode.id) && onUpdateSelectedRoomLabel();
            const color = getStatusColor(projectNode);

            if (Boolean(color)) {
                highlightNode(room, color!)
            }
        });

        level.zones.forEach(paintZoneRooms);
    }

    function paintZoneRooms(zone: SmartZone) {
        zone.zones.forEach(paintZoneRooms);

        zone.rooms.forEach((room) => {
            const {projectNode} = projectTreeMap.get(room.externalReferenceId)!;
            room.setIssueCount(projectNode.openIssueCount);
            (room.id === selectedMapNode.id) && onUpdateSelectedRoomLabel();
            const color = getStatusColor(projectNode);

            if (Boolean(color)) {
                highlightNode(room, color!)
            }
        });
    }

    // TODO -Implement Other Possible Collections Of Nodes
    function paintNodeCollection(nodeCollection: SmartNodeCollection) {

        switch(nodeCollection.parentNode.nodeType) {
            case 'Building':
                // Not Implemented
                break;
            case 'Level': {
                    const parentLevel = nodeCollection.parentNode as SmartLevel;
                    paintLevelRooms(parentLevel);
                    nodeCollection.highlight();
                    break;
                }
            case 'Zone': {
                    const parentLevel = (nodeCollection.parentNode as SmartZone).parentLevel;
                    paintLevelRooms(parentLevel);
                    nodeCollection.highlight();
                    break;
                }
            case 'Room':
                // Not Possible?
                break;
            case 'NodeCollection':
                // Not Implemented
                break;
        }
    }

    function highlightNode(node: SmartNodes, {color, strength}: ColorAndStrength) {
        node.highlight(color, {persist: true, strength: strength, hoverHighlightMode: HoverHighlightMode.Replace});
    }

    function getIssueStatusColor(projectNode: ChildNode) {
        const totalOpenForms = projectNode.totalOpenFormCount;
        const totalClosedForms = projectNode.totalClosedFormCount;

        if (statusFilter.includes(LocationFormStatusFilters.Open) && (totalOpenForms + projectNode.readyIssueCount) > 5) {
            return openColor;
        }

        if (statusFilter.includes(LocationFormStatusFilters.lessOpen) && totalOpenForms > 0 && (totalOpenForms + projectNode.readyIssueCount) <= 5) {
            return mixedColor;
        }

        if (statusFilter.includes(LocationFormStatusFilters.Ready) && projectNode.readyIssueCount > 0) {
            return readyColor;
        }

        if (statusFilter.includes(LocationFormStatusFilters.Closed) && totalClosedForms > 0) {
            return closedColor;
        }
    }

    function getStatusColor(projectNode: ChildNode) {
        if (dataMode === 'Issues')
            return getIssueStatusColor(projectNode);
        
        const totalOpenForms = projectNode.totalOpenFormCount;
        const totalClosedForms = projectNode.totalClosedFormCount;

        if (statusFilter[0] === LocationFormStatusFilters.Mixed) {
            if (totalOpenForms > 0 && totalClosedForms > 0) {
                return mixedColor;
            }

            if (totalOpenForms > 0) {
                return openColor;
            }

            if (totalClosedForms > 0) {
                return closedColor;
            }
        }

        if (statusFilter[0] === LocationFormStatusFilters.Open) {
            if (totalOpenForms > 0) {
                return openColor;
            }
        }

        if (statusFilter[0] === LocationFormStatusFilters.Closed) {
            if (totalClosedForms > 0) {
                return closedColor;
            }
        }
    }
}