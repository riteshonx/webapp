import { useEffect } from 'react';
import { useDataMode } from 'src/modules/visualize/VisualizeView/utils/DataMode';

import { Form } from '../../../../models/form';
import { StatusCircle } from '../../../StatusCircle';
import { useFormStyles } from '../../formStyles';

interface FormListItemProps {
    form: Form;
    onClick: () => void;
}

export function FormListItem({form, onClick}: FormListItemProps) {
    const {dataMode} = useDataMode();
    const bim360Mode = dataMode === 'BIM360';
    
    const classes = useFormStyles();

    return (
        <div className={`${classes.formlistItem}`} onClick={onClick}>
            <div className={classes.formType}>
                {form.featureName}&nbsp;&nbsp;{!bim360Mode && <>[ID {form.formTypeInstanceId}]</>}
            </div>

            <div className={`${classes.subjectLine} ${classes.section}`}>
                <div className={classes.subject}>
                    {form.subject} 
                </div>
                {
                    bim360Mode &&
                        <div className={classes.bimChecklistId}>
                            #{form.formTypeInstanceId}
                        </div>
                }
            </div>

            <div className={`${classes.status} ${classes.section}`}>
                <StatusCircle status={form.status} /> &nbsp; / {form.activeWorkFlowStepName}
            </div>

            <div className={classes.section}>
                Assigned To: {Boolean(form.assigneeNames) && form.assigneeNames.length > 0 ? form.assigneeNames : '--'}
            </div>

            {
                form.isLinkedToLocation &&
                    <div className={classes.section}>
                        Location: {form.locationNames}
                    </div>
            }

            {
                form.isOverdue &&
                    <div className={`${classes.section} ${classes.overdue}`}>
                        Overdue By: {form.daysOverdue} days
                    </div>
            }
        </div>
    );
}