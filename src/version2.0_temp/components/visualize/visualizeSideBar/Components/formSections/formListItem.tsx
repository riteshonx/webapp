import { Form } from 'src/modules/visualize/VisualizeView/models/form';
import { useDataMode } from 'src/modules/visualize/VisualizeView/utils/DataMode';

interface FormListItemProps {
  form: Form;
  onClick: () => void;
}

export function FormListItem({ form, onClick }: FormListItemProps) {
  const { dataMode } = useDataMode();
  const bim360Mode = dataMode === 'BIM360' || form.sourceTemplateId;

  function formatDate(date: Date) {
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();

    return `${month} ${day}, ${year}`;
  }

  return (
    <div 
      onClick={onClick} 
      className="v2-visualize-formListItem" 
      tabIndex={0}
      onKeyDown={(e: any)=>{e.keyCode == '13' &&  onClick();}}
      >
      <div className='details-row title'>
        <div>
          {form.subject}
        </div>
        {
          <div className='idSection'>
            #{form.sourceId}
          </div>
        }
      </div>

      <div className='details-row'>
        <div>
          Due Date: {Boolean(form.dueDate) ? formatDate(form.dueDate!) : '--'}
        </div>
        <div className={"formStatus " + form.status.toLowerCase()}>
          {form.sourceStatus?.replaceAll('_', ' ') || form.status}
        </div>
      </div>

      <div className='details-row'>
        <div>
          Assigned To: {Boolean(form.assigneeNames) && form.assigneeNames.length > 0 ? form.assigneeNames : '--'}
        </div>
      </div>

      <div className='details-row'>
        {
          form.isLinkedToLocation &&
          <div>
            Location: {form.locationNames}
          </div>
        }

        {
          form.isOverdue &&
          <div>
            Overdue By: {form.daysOverdue} days
          </div>
        }
      </div>

      {
        form.isBimForm &&
        <div className="details-row">
          Description: {Boolean(form.bimDescription) ? form.bimDescription : ''}
        </div>
      }

    </div>
  );
}