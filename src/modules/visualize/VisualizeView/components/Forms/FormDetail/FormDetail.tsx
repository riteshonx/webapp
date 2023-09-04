import { makeStyles } from '@mui/styles';

import { BackButton } from '../../../controls/BackButton';
import { Form } from '../../../models/form';
import { useDataMode } from '../../../utils/DataMode';
import { StatusCircle } from '../../StatusCircle';
import { useFormStyles } from '../formStyles';
import { FormSyncStatusMessage } from '../FormSyncStatus';
import { OpenFormExternalButton } from './OpenFormExternalButton';

const oldDataAgeInHours = 12;

const syncDetailsHeight = 50;
const backEditLineHeight = 24;
const backEditLineMarginBottom = 30;

const useStyles = makeStyles(({
    formDetailContainer: {
        paddingTop: '12px',
        paddingLeft: '12px',
        height: '100%',
    },

    backAndEditLine: {
        display: 'flex',
        flexDirection: 'row',
        paddingRight: '20px',
        marginBottom: `${backEditLineMarginBottom}px`,
        justifyContent: 'space-between',
    },

    formDetailContent: {
        paddingRight: '20px',
        boxSizing: 'border-box',
        paddingBottom: '6px',
        height: ({inBim360Mode}: {inBim360Mode: boolean}) => `calc(100% - (${backEditLineHeight}px + ${backEditLineMarginBottom}px + ${inBim360Mode ? syncDetailsHeight : 0}px))`,
        overflow: 'auto',
    },
    
    formSyncStatusContainer: {
        height: `${syncDetailsHeight}px`
    },
}));

interface FormDetailProps {
    form: Form;
    onBackButtonClick: () => void;
}

export function FormDetail({form, onBackButtonClick}: FormDetailProps) {
    const {dataMode} = useDataMode();
    const bim360Mode = dataMode === 'BIM360';

    const classes = {...useStyles({inBim360Mode: Boolean(bim360Mode)}), ...useFormStyles()};

    function formatDate(date: Date) {
        const month = date.toLocaleString('en-US', { month: 'short' });
        const day = date.getDate();
        const year = date.getFullYear();

        return `${month} ${day}, ${year}`;
    }

    function formatDateWithTime(date: Date) {
        const dateString = formatDate(date);
        const timeString = date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        const zone = new Date().toLocaleTimeString('en-US',{timeZoneName:'short'}).split(' ')[2];

        return `${dateString} at ${timeString} ${zone}`;
    }

    return (
        <div className={classes.formDetailContainer}>
            {  
                bim360Mode && Boolean(form?.bimLastSuccessfulSync) &&
                    <div className={classes.formSyncStatusContainer}>
                        <FormSyncStatusMessage
                            label={"This item's last sync:"}
                            lastSyncDate={form!.bimLastSuccessfulSync!}
                            oldDataAgeInHours={oldDataAgeInHours}
                        />
                    </div>
            }

            <div className={classes.backAndEditLine}>
                <BackButton onClick={onBackButtonClick}/>

                <OpenFormExternalButton
                    form={form}
                    sourceUrl={Boolean(form.bimSourceUrl) ? form.bimSourceUrl : undefined}
                />
            </div>

            <div className={classes.formDetailContent}>
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
                    bim360Mode &&
                        <div className={classes.section}>
                            Type: {Boolean(form.bimChecklistType) ? form.bimChecklistType : '--'}
                        </div>
                }
                
                {
                    bim360Mode &&
                        <div className={classes.section}>
                            Description: {Boolean(form.bimDescription) ? form.bimDescription : '--'}
                        </div>
                }
                
                {
                    form.isOverdue &&
                        <div className={`${classes.section} ${classes.overdue}`}>
                            Overdue By: {form.daysOverdue} days
                        </div>
                }

                {
                    !form.isBimForm &&
                        <div className={classes.section}>
                            Due Date: {Boolean(form.dueDate) ? formatDate(form.dueDate!) : '--'}
                        </div>
                }

                {
                    !form.isBimForm &&
                        <div className={classes.section}>
                            Created On: {Boolean(form.createdAt) ? formatDate(form.createdAt!) : '--'}
                        </div>
                }

                {
                    form.isBimForm &&
                        <div className={classes.section}>
                            Initial Sync: {Boolean(form.createdAt) ? formatDateWithTime(form.createdAt!) : '--'}
                        </div>
                }

                {
                    form.isBimForm &&
                        <div className={classes.section}>
                            Last Sync: {Boolean(form.bimLastSuccessfulSync) ? formatDateWithTime(form.bimLastSuccessfulSync!) : '--'}
                        </div>
                }

                {
                    !form.isBimForm &&
                        <div className={classes.section}>
                            Created By: {Boolean(form.createdBy) ? form.createdBy?.fullName : '--'}
                        </div>
                }

                {
                    !form.isBimForm &&
                        <div className={classes.section}>
                            Updated At: {Boolean(form.updatedAt) ? formatDate(form.updatedAt!) : '--'}
                        </div>
                }

                {
                    !form.isBimForm &&
                        <>
                            <div className={classes.section}>
                                Updated By: {Boolean(form.updatedBy) ? form.updatedBy?.fullName : '--'}
                            </div>

                            <div className={classes.section}>
                                Completed On: {Boolean(form.completedOn) ? formatDate(form.completedOn!) : '--'}
                            </div>

                            <div className={classes.section}>
                                Completed By: {Boolean(form.completedBy) ? form.completedBy?.fullName : '--'}
                            </div>
                        </>
                }
            </div>
        </div>
    );
}