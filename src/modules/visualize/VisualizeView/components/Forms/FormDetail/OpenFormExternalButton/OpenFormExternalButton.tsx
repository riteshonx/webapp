import ListAltIcon from '@material-ui/icons/ListAlt';
import { makeStyles } from '@mui/styles';
import { useParams } from 'react-router-dom';
import { LocationIntelligenceRouteParams } from 'src/modules/visualize/VisualizeRouting';
import { Form } from 'src/modules/visualize/VisualizeView/models/form';
import { useAnalytics } from 'src/modules/visualize/VisualizeView/utils/analytics';

const useStyles = makeStyles(({
    openFormExternalButtonContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        color: 'rgba(10, 148, 158, 1)',
        cursor: 'pointer',
    },
}));

function buildSlateFormURL(projectId: string, featureTypeId: number, formId: number) {
    return `/base/projects/${projectId}/form/${featureTypeId}/edit/${formId}`
}

interface OpenFormExternalButtonProps {
    form: Form;
    sourceUrl?: string;
}

export function OpenFormExternalButton({form, sourceUrl}: OpenFormExternalButtonProps) {
    const classes = useStyles();
    const {projectId} = useParams<LocationIntelligenceRouteParams>();
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
        <div className={classes.openFormExternalButtonContainer} onClick={onClick}>
            <ListAltIcon />

            <div style={{marginLeft: '4px', fontSize: '16px'}}>
                Edit/Open
            </div>
        </div>
    )
}