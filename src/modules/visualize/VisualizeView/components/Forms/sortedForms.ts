import { SmartNodes } from '../../models/SmartNodes';
import { Form } from '../../models/form';
import { FormStatuses } from '../../models/form/formStatuses';
import { LocationTree } from '../../models/locationTree';
import { ChildNode } from '../../models/locationTree/childNode';

export class SortedForms {
    public value: Form[];

    constructor(forms: Form[], locationTree: LocationTree, selectedMapNode: SmartNodes | undefined) {
        this.value = Boolean(forms) && Boolean(locationTree) ? this.sort(forms, locationTree, selectedMapNode) : [];
    }

    // The forms should be sorted by tree depth, then days overdue, then open, then closed, the form feature type, then form id.
    private sort(forms: Form[], locationTree: LocationTree, selectedMapNode : SmartNodes | undefined) {
        return [...forms].sort((formA, formB) => {
            const nodeA = Boolean(formA.isLinkedToLocation) ? locationTree.get(formA.preferedLocationId(selectedMapNode)!) : undefined;
            const nodeB = Boolean(formB.isLinkedToLocation) ? locationTree.get(formB.preferedLocationId(selectedMapNode)!) : undefined;

            const nodesAreAtSameTreeDepth = Boolean(nodeA) && Boolean(nodeB) && nodeA!.treeDepth === nodeB!.treeDepth;
            const nodesAreNotInTree = !Boolean(nodeA) && !Boolean(nodeB);

            if (nodesAreAtSameTreeDepth || nodesAreNotInTree) {
                if (formA.daysOverdue === formB.daysOverdue || !formA.isBimForm || !formB.isBimForm) {
                    const formAStatusSortValue = getStatusSortValue(formA.status);
                    const formBStatusSortValue = getStatusSortValue(formB.status);

                    if (formAStatusSortValue === formBStatusSortValue) {
                        if (formA.featureId === formB.featureId) {
                            return idSort(formA, formB);
                        }

                        return formTypeSort(formA, formB);
                    }
                    
                    return statusSort(formAStatusSortValue, formBStatusSortValue);
                }

                return daysOverdueSort(formA, formB);
            }

            return treeDepthSort(nodeA, nodeB);
        });
    }
}

function treeDepthSort(nodeA?: ChildNode, nodeB?: ChildNode) {
    if (!Boolean(nodeA) || !Boolean(nodeB)) {
        return undefinedLocationFirstSort(nodeA, nodeB);
    } else {
        return nodeA!.treeDepth - nodeB!.treeDepth;
    }
}

function undefinedLocationFirstSort(nodeA?: ChildNode, nodeB?: ChildNode) {
    return Boolean(nodeA) > Boolean(nodeB) ? -1 : 1;
}

function daysOverdueSort(formA: Form, formB: Form) {
    return formB.daysOverdue - formA.daysOverdue;
}

function statusSort(formAStatusSortValue: number, formBStatusSortValue: number) {
    return formAStatusSortValue - formBStatusSortValue;
}

function getStatusSortValue(status: FormStatuses) {
    switch(status) {
        case FormStatuses.Open: return 1;
        case FormStatuses.Closed: return 10;
        default: return 1000;
    }
}

function formTypeSort(formA: Form, formB: Form) {
    return formA.featureId - formB.featureId;
}

function idSort(formA: Form, formB: Form) {
    return formA.formTypeInstanceId - formB.formTypeInstanceId;
}