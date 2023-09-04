import ListAltIcon from '@material-ui/icons/ListAlt';
import { useProjectId } from 'src/modules/visualize/VisualizeView/hooks/useProjectId';
import { Form } from 'src/modules/visualize/VisualizeView/models/form';
import { useAnalytics } from 'src/modules/visualize/VisualizeView/utils/analytics';

function buildSlateFormURL(projectId: string | undefined, featureTypeId: number, formId: number) {
    return `/base/projects/${projectId}/form/${featureTypeId}/edit/${formId}`
}

interface OpenFormExternalButtonProps {
    form: Form;
    sourceUrl?: string;
}

export function OpenFormExternalButton({form, sourceUrl}: OpenFormExternalButtonProps) {
    const projectId = useProjectId();
    const {track} = useAnalytics();

    function onClick() {
        const url = Boolean(sourceUrl) ? sourceUrl : buildSlateFormURL(projectId, form.featureId, form.formId);
        window.open(url, '_blank');

        track('Form-Link-Clicked', {
            external: Boolean(sourceUrl),
            url: url,
            formId: form.formId,
            slateFormId: form.slateFormId,
            projectId: projectId,
            featureTypeId: form.featureId,
            featureTypeName: form.featureName,
        });
    }

    return (
        <div 
            className={"openFormExternalButtonContainer"} 
            tabIndex={0} 
            onClick={onClick}
            onKeyDown={(e: any)=>{e.keyCode == '13' &&  onClick();}}
            >
            <ListAltIcon fontSize='small'/>
            <div>
                Edit/Open
            </div>
        </div>
    )
}