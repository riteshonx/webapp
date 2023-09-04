import { gantt } from 'dhtmlx-gantt';
import Notification, {
  AlertTypes,
} from 'src/modules/shared/components/Toaster/Toaster';
import { v4 as uuidv4 } from 'uuid';
interface TaskValueMapType {
  newValue: string;
  hasChild: boolean;
  source: string[];
  target: string[];
}
interface LinkValueMapType {
  newValue: string;
  source: string;
  target: string;
}
export const taskActionObj = {
  action: '',
  tasks: new Map<string, TaskValueMapType>(),
  links: new Map<string, LinkValueMapType>(),
};

interface TaskAction {
  action: string;
  tasks: Map<string, TaskValueMapType>;
  links: Map<string, LinkValueMapType>;
}

// Below Code is commented to resolve error coming due to keyboardNavigation: true in Gantt.tsx
// Please unComment below code once keyboardNavigation is enabled in gantt.tsx file.

// export function doKeyboardNavigationTasks(): void {
//   function doShortcutAction(action: string, hotKey: string, cb?: () => void) {
//     gantt.ext.keyboardNavigation.addShortcut(
//       hotKey,
//       function () {
//         if (gantt.config.readonly) return;
//         doSelectTasks(taskActionObj, action, cb);
//       },
//       'taskRow'
//     );
//   }
//   doShortcutAction('copy', 'ctrl+c');
//   doShortcutAction('delete', 'delete', handleDeleteTasks);
//   gantt.ext.keyboardNavigation.addShortcut(
//     'ctrl+v',
//     function () {
//       if (gantt.config.readonly) return;
//       doPasteTasks(taskActionObj);
//     },
//     'taskRow'
//   );
// }
function getLinks(
  source: string[],
  sourceMap: Map<string, string>,
  targetMap: Map<string, string>,
  target: string[]
) {
  source.forEach((ele) => {
    if (targetMap.has(ele)) {
      target.push(ele);
      sourceMap.delete(ele);
    } else {
      sourceMap.set(ele, '1');
    }
  });
}
export function doSelectTasks(
  taskAction: TaskAction,
  action: string,
  cb?: () => void
): void {
  const taskSelected = new Map<string, TaskValueMapType>();
  const newLinks: string[] = [];
  const newLinksMap = new Map<string, LinkValueMapType>();
  const sourceLinkMap = new Map<string, string>();
  const targetLinkMap = new Map<string, string>();
  taskAction.action = action;
  gantt.eachSelectedTask(function (taskId: string) {
    const task = gantt.getTask(taskId);
    if (taskSelected.has(task.parent)) {
      const values = taskSelected.get(task.parent) as TaskValueMapType;
      taskSelected.set(task.parent, {
        ...values,
        hasChild: true,
      });
    }
    getLinks(task.$source, sourceLinkMap, targetLinkMap, newLinks);
    getLinks(task.$target, targetLinkMap, sourceLinkMap, newLinks);
    taskSelected.set(taskId, {
      newValue: uuidv4(),
      hasChild: false,
      source: [],
      target: [],
    });
  });
  for (const link of newLinks) {
    if (!gantt.isLinkExists(link)) return;
    const { source, target } = gantt.getLink(link);
    if (taskSelected.has(source) && taskSelected.has(target)) {
      const newValue = uuidv4();
      const { newValue: sourcevalue, source: $source } = taskSelected.get(
        source
      ) as TaskValueMapType;
      const { newValue: targetValue, target: $target } = taskSelected.get(
        target
      ) as TaskValueMapType;
      $source.push(newValue);
      $target.push(newValue);
      newLinksMap.set(link, {
        newValue,
        source: sourcevalue,
        target: targetValue,
      });
    }
  }
  taskAction.tasks = taskSelected;
  taskAction.links = newLinksMap;
  if (cb) cb();
}

export function doPasteTasks(taskAction: TaskAction): void {
  const { tasks, links } = taskAction;
  taskAction.action = '';
  const targetParent = gantt.getSelectedId();
  const targetParentInfo = gantt.getTask(targetParent);
  if (targetParentInfo.type === 'milestone') {
    Notification.sendNotification('Invalid operation', AlertTypes.warn);
    return;
  }

  tasks.forEach((value, key, map) => {
    const copyTask = gantt.copy(gantt.getTask(key));
    copyTask.id = value.newValue;
    copyTask.$has_child = value.hasChild;
    copyTask.$source = value.source;
    copyTask.$target = value.target;
    copyTask.externalId = '-';
    recAddingTask(copyTask, map, targetParent);
  });
  links.forEach((value, key) => {
    const linkData = gantt.copy(gantt.getLink(key));
    linkData.id = value.newValue;
    linkData.source = value.source;
    linkData.target = value.target;
    gantt.addLink(linkData);
  });
  gantt.getTask(targetParent).$open = true;
  gantt.render();
}

function recAddingTask(
  task: any,
  map: Map<string, TaskValueMapType>,
  targetParent: string
): void {
  if (gantt.isTaskExists(task.id)) return;
  const parentTask = gantt.copy(gantt.getTask(task.parent));
  task.parent = map.get(task.parent)?.newValue || targetParent;
  if (task.parent !== targetParent) {
    parentTask.id = map.get(parentTask.id)?.newValue;
    parentTask.$source = map.get(parentTask.id)?.source;
    parentTask.$target = map.get(parentTask.id)?.target;
    parentTask.externalId = '-';
    recAddingTask(parentTask, map, targetParent);
  }
  gantt.addTask(task);
}

export function handleDeleteTasks(): void {
  const { tasks, links } = taskActionObj;
  tasks.forEach((value, key) => {
    if (gantt.isTaskExists(key)) gantt.deleteTask(key);
  });
  links.forEach((value, key) => {
    if (gantt.isLinkExists(key)) gantt.deleteLink(key);
  });
}
