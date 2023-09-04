import React,{useState, useEffect} from 'react';
import LinkIcon from '@material-ui/icons/Link';
import { TaskTypeEnum } from './taskLinksConstant';
import './TaskLinks.scss';

interface LinkType {
	name: string;
	__typename: string;
}
interface ProjectTask {
	id: string;
	taskName: string;
	__typename: string;
}

interface TaskLink {
	linktype: LinkType;
	projectTask?: ProjectTask;
	form?:any,
	formsData?:any,
	__typename: string;
}

interface TaskType{
	form:string;
	task:string;
}

export const TaskLinks = (props: { formTaskLinks: Array<TaskLink> }): React.ReactElement => {
  const { formTaskLinks } = props;
  const [taskType, setTaskType] = useState<TaskType>({ form: '', task: '' });


  const renderTaskLinks = formTaskLinks?.map((formTask: TaskLink, index: number) => {
    // Calculate the taskType for each formTask separately
    const currentTaskType: TaskType = {
      form: formTask.form ? formTask.form.projectFeature.feature : '',
      task: formTask.projectTask ? 'Task' : '',
    };
    const mappedFormFeature =
      currentTaskType.form && TaskTypeEnum[currentTaskType.form.toUpperCase() as keyof typeof TaskTypeEnum];


    return (
      <div key={`${formTask?.projectTask?.id}-${index}`} className="v2-task-link-wrapper-link-item">
        <LinkIcon className="v2-task-link-wrapper-link-item-icon" />
        <div className="v2-task-link-wrapper-link-item-name">
          <span>{`${mappedFormFeature ? mappedFormFeature  : currentTaskType?.task} - `}</span>
          <span>{formTask?.form ? formTask?.form?.formsData[0]?.valueString : formTask?.projectTask?.taskName}</span>
        </div>
      </div>
    );
  });

  return (
    <>
      {formTaskLinks?.length > 0 && (
        <div className="v2-task-link">
          <div className="v2-task-link-label">Links:</div>
          <div className="v2-task-link-wrapper">{renderTaskLinks}</div>
        </div>
      )}
    </>
  );
};

