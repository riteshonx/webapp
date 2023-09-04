import { gql, QueryHookOptions, useLazyQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { myProjectRole } from 'src/utils/role';

import { useLoginQueryOptions } from '../../../hooks/useQueryOptions';
import { FormType } from '../../../models/formType';
import { FormTypeGroup } from './FormTypeGroup';
import { FormTypeTask } from './FormTypeTask';

interface GroupedWhiteListedFormTemplateNode {
    nodeName: string;
    parentNodeId: string;
    nodeId: string;
}

interface GroupedwhiteListedFormTemplateGroup {
    whiteListedFormTemplateNodes: GroupedWhiteListedFormTemplateNode[];
}

const whiteListName = 'visualize_grouped_checklist_white_list';

const LIST_GROUPED_WHITE_LISTED_FEATURE_TYPES = gql `
    query ListWhiteListedForms($whiteListName: String!) {
            whiteListedFormTemplateNamesList: configurationLists(where: {name: {_eq: $whiteListName}}) {
            name
            whiteListedFormTemplateNodes: configurationValues {
                nodeName
                parentNodeId: parentId
                nodeId: id
            }
        }
    }
`;

export function useFeatureTypeGroupingWhiteList(featureTypes: FormType[]) {
    const queryOptions = useLoginQueryOptions(myProjectRole.viewMyProjects);
    
    const [groupedWhiteListedFormTemplateList, setGroupedWhiteListedFormTemplateList] = useState<GroupedWhiteListedFormTemplateNode[]>();
    const [whiteListedFormTypeGroups, setWhiteListedFormTypeGroups] = useState<FormTypeGroup[]>([]);
    
    const [retrieveWhiteListedFormTemplateGroups] = useLazyQuery<{whiteListedFormTemplateNamesList: GroupedwhiteListedFormTemplateGroup[]}>(LIST_GROUPED_WHITE_LISTED_FEATURE_TYPES);

    useEffect(() => {
        if (Boolean(queryOptions)) {
            queryOptions!.variables = {
                whiteListName,
            }

            getGroupedWhiteListedFormTemplates(queryOptions!)
        }
    }, [queryOptions]);

    useEffect(() => {
        if (Boolean(featureTypes) && Boolean(groupedWhiteListedFormTemplateList)) {
            buildFormTypeGroups(featureTypes, groupedWhiteListedFormTemplateList!);
        } else if (Boolean(featureTypes)) {
            buildDefualtFormTypeGroups(featureTypes);
        }
    }, [featureTypes, groupedWhiteListedFormTemplateList]);

    async function getGroupedWhiteListedFormTemplates(queryOptions: QueryHookOptions) {
        const {data} = await retrieveWhiteListedFormTemplateGroups(queryOptions);
        
        if (Boolean(data) && Boolean(data!.whiteListedFormTemplateNamesList) && data!.whiteListedFormTemplateNamesList.length > 0) {
            const {whiteListedFormTemplateNamesList} = data!;
            setGroupedWhiteListedFormTemplateList(whiteListedFormTemplateNamesList[0].whiteListedFormTemplateNodes);
        }
    }

    function buildFormTypeGroups(featureTypes: FormType[], groupedWhiteListedFormTemplateList: GroupedWhiteListedFormTemplateNode[]) {
        const groupTemplateListAsMap = new Map<string, GroupedWhiteListedFormTemplateNode>([]);

        const groupMap = new Map<string, FormTypeGroup>([]);
        const taskMap = new Map<string, FormTypeTask>([]);

        // Build Maps
        groupedWhiteListedFormTemplateList.forEach((groupedNode) => {
            groupTemplateListAsMap.set(groupedNode.nodeId, groupedNode);
        });

        groupedWhiteListedFormTemplateList.forEach((node) => {
            const nodeParent = groupTemplateListAsMap.get(node.parentNodeId);

            const isNodeAGroup = !Boolean(nodeParent); // No Parent.
            const isNodeATask = Boolean(nodeParent) && !Boolean(nodeParent!.parentNodeId); // Parent But No Grandparent.

            if (isNodeAGroup) {
                groupMap.set(node.nodeId, new FormTypeGroup(node.nodeId, node.nodeName));
            }

            if (isNodeATask) {
                taskMap.set(node.nodeId, new FormTypeTask(node.nodeId, node.nodeName, node.parentNodeId));
            }
        });

        // Assign Feature Types To Tasks
        groupedWhiteListedFormTemplateList.forEach((node) => {
            const nodeParent = groupTemplateListAsMap.get(node.parentNodeId);

            const isNodeAFeatureType = Boolean(nodeParent) && Boolean(nodeParent!.parentNodeId); // Parent And Grandparent.

            if (isNodeAFeatureType) {
                const parentTask = taskMap.get(node.parentNodeId);

                // assign that feature type to a task
                const featureTypeInNode = featureTypes.find((featureType) => removeDoubleSpaces(featureType.formType).trim().toLowerCase() === removeDoubleSpaces(node.nodeName).trim().toLowerCase());

                if (Boolean(parentTask) && Boolean(featureTypeInNode)) {
                    parentTask?.addFeatureType(featureTypeInNode!);
                }
            }
        });

        // Assign Tasks To Groups

        const tasks = Array.from(taskMap.values());
        const tasksWithChildren = tasks.filter((task) => task.hasChildren);
        
        tasksWithChildren.forEach((task) => {
            const parentGroup = groupMap.get(task.parentGroupId);

            if (Boolean(parentGroup)) {
                parentGroup!.addTask(task);
            }
        });

        const groups = Array.from(groupMap.values());
        const groupsWithChildren = groups.filter((group) => group.hasChildren);

        setWhiteListedFormTypeGroups(groupsWithChildren);
    }

    function removeDoubleSpaces(featureType: string) {
        const featureTypeWithoutDoubleSpaces = featureType.replace(/ +(?= )/g,'');

        return featureTypeWithoutDoubleSpaces
    }

    function buildDefualtFormTypeGroups(featureTypes: FormType[]) {
        const groupMap = new FormTypeGroup('templates', 'Templates');
        const taskGroup = new FormTypeTask('linked', 'linked1', 'templates');
        groupMap.addTask(taskGroup)
        featureTypes.map((type) => taskGroup.addFeatureType(type));
        setWhiteListedFormTypeGroups([groupMap]);
    }

    return whiteListedFormTypeGroups;
}