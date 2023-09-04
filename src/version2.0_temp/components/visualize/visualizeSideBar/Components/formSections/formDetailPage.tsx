import { Form } from "src/modules/visualize/VisualizeView/models/form";
import { useDataMode } from "src/modules/visualize/VisualizeView/utils/DataMode";
import { OpenFormExternalButton } from "./OpenFormExternalButton";
import { BackButton } from "./BackButton";
import { useEffect, useRef } from "react";

interface FormDetailProps {
    form: Form;
    onBackButtonClick: () => void;
}

export function FormDetail({ form, onBackButtonClick }: FormDetailProps) {
    const { dataMode } = useDataMode();
    const bim360Mode = dataMode === 'BIM360' || form.sourceTemplateId;
    const containerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;

    useEffect(()=> {
        containerRef.current && containerRef.current.focus();
    }, [])

    function formatDate(date: Date) {
        const month = date.toLocaleString('en-US', { month: 'short' });
        const day = date.getDate();
        const year = date.getFullYear();

        return `${month} ${day}, ${year}`;
    }

    function formatDateWithTime(date: Date) {
        const dateString = formatDate(date);
        const timeString = date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        const zone = new Date().toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ')[2];

        return `${dateString} at ${timeString} ${zone}`;
    }

    return (
        <div className="v2-visualize-formDetailpage" ref={containerRef} tabIndex={0}>
            <div className="v2-visualize-formDetailpage-header">
                <div className="s-v-center v2-visualize-formDetailpage-header-item">
                    <BackButton onClick={onBackButtonClick} />

                    <OpenFormExternalButton
                        form={form}
                        sourceUrl={Boolean(form.sourceUrl) ? form.sourceUrl : undefined}
                    />
                </div>

                <div className="v2-visualize-formDetailpage-header-item title">
                    {form.subject} #{form.sourceId}  
                </div>
                <div className={"v2-visualize-formDetailpage-header-item  formStatus " + form.status.toLowerCase()}>
                    <span className="status-circle"></span>{form.sourceStatus?.replaceAll('_', ' ') || form.status}
                </div>
            </div>

            <div className="v2-visualize-formDetailpage-content">

                <div className="v2-visualize-formDetailpage-content-item description">
                    Description: {Boolean(form.bimDescription) ? form.bimDescription : '--'}
                </div>

                <div className="v2-visualize-formDetailpage-content-item">
                    Assigned To: {Boolean(form.assigneeNames) && form.assigneeNames.length > 0 ? form.assigneeNames : '--'}
                </div>

                {
                    form.isLinkedToLocation &&
                    <div className="v2-visualize-formDetailpage-content-item">
                        Location: {form.locationNames}
                    </div>
                }

                {
                    form.isBimForm &&
                    <div className="v2-visualize-formDetailpage-content-item">
                        Type: {Boolean(form.bimChecklistType) ? form.bimChecklistType : '--'}
                    </div>
                }

                {
                    form.isBimForm &&
                    <div className="v2-visualize-formDetailpage-content-item">
                        Description: {Boolean(form.bimDescription) ? form.bimDescription : '--'}
                    </div>
                }

                {
                    form.isOverdue &&
                    <div className="v2-visualize-formDetailpage-content-item">
                        Overdue By: {form.daysOverdue} days
                    </div>
                }

                {
                    !form.isBimForm &&
                    <div className="v2-visualize-formDetailpage-content-item">
                        Due Date: {Boolean(form.dueDate) ? formatDate(form.dueDate!) : '--'}
                    </div>
                }

                {
                    !form.isBimForm &&
                    <div className="v2-visualize-formDetailpage-content-item">
                        Created On: {Boolean(form.createdAt) ? formatDate(form.createdAt!) : '--'}
                    </div>
                }

                {
                    form.isBimForm &&
                    <div className="v2-visualize-formDetailpage-content-item">
                        Initial Sync: {Boolean(form.createdAt) ? formatDateWithTime(form.createdAt!) : '--'}
                    </div>
                }

                {
                    form.isBimForm &&
                    <div className="v2-visualize-formDetailpage-content-item">
                        Last Sync: {Boolean(form.bimLastSuccessfulSync) ? formatDateWithTime(form.bimLastSuccessfulSync!) : '--'}
                    </div>
                }

                {
                    !form.isBimForm &&
                    <div className="v2-visualize-formDetailpage-content-item">
                        Created By: {Boolean(form.createdBy) ? form.createdBy?.fullName : '--'}
                    </div>
                }

                {
                    !form.isBimForm &&
                    <div className="v2-visualize-formDetailpage-content-item">
                        Updated On: {Boolean(form.updatedAt) ? formatDate(form.updatedAt!) : '--'}
                    </div>
                }

                {
                    !form.isBimForm &&
                    <>
                        <div className="v2-visualize-formDetailpage-content-item">
                            Updated By: {Boolean(form.updatedBy) ? form.updatedBy?.fullName : '--'}
                        </div>

                        <div className="v2-visualize-formDetailpage-content-item">
                            Completed On: {Boolean(form.completedOn) ? formatDate(form.completedOn!) : '--'}
                        </div>
                        {/* TO-DO: Remove Comments from below code once we start getting value from BE */}
                        
                        {/* <div className="v2-visualize-formDetailpage-content-item">
                            Completed By: {Boolean(form.completedBy) ? form.completedBy?.fullName : '--'}
                        </div> */}
                    </>
                }
            </div>
        </div>
    );
}