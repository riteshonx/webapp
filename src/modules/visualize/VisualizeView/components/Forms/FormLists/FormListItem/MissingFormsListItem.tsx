import { makeStyles } from '@mui/styles';
import { useMemo } from 'react';
import { FormStatuses } from 'src/modules/visualize/VisualizeView/models/form/formStatuses';
import { FormType } from 'src/modules/visualize/VisualizeView/models/formType';
import { SmartNodes } from 'src/modules/visualize/VisualizeView/models/SmartNodes';

import { StatusCircle } from '../../../StatusCircle';
import { useFormStyles } from '../../formStyles';
import { PCLRwcName, PCLSameJobCheckListNames, PCLSuncoName } from '../../PCLSameJobCheckListNames';

const useStyles = makeStyles(({
    missingChecklistMessageContainer: {
        marginLeft: '12px',
    },

    missingFormType: {
        fontWeight: 500,
    },
}));

interface MissingFormListItemProps {
    activeFormTypes: FormType[];
    missingFormTypes: FormType[];
    selectedMapNode: SmartNodes;
}

export function MissingFormListItem({activeFormTypes, missingFormTypes, selectedMapNode}: MissingFormListItemProps) {
    const classes = {...useFormStyles(), ...useStyles()};

    // TODO - the following is all temporary to attempt to handle a specific use case for PCL that does not currently have a more dynamic solution available.
    // There may be more rules to add to this involving when Sunco and Rwc will appear in the misssing form types list.
    const missingFormTypeNames = useMemo(() => {
        const formTypesWithoutSuncoOrRwc = missingFormTypes.filter((formType) => !Boolean(PCLSameJobCheckListNames.find((formTypeName) => formTypeName === formType.formType)));

        const formTypeNames = formTypesWithoutSuncoOrRwc.map((formType) => formType.formType);

        const isSuncoMissing = missingFormTypes.find((formType) => formType.formType === PCLSuncoName);
        const isRwcMissing = missingFormTypes.find((formType) => formType.formType === PCLRwcName);

        const areBothSuncoAndRwcInTheMissingFormTypes = activeFormTypes.filter((formType) => Boolean(PCLSameJobCheckListNames.find((formTypeName) => formType.formType === formTypeName))).length === 2;
        
        if (isSuncoMissing && isRwcMissing) {
            formTypeNames.push(`${PCLRwcName} [OR] ${PCLSuncoName}`);
        }

        if (isSuncoMissing && !areBothSuncoAndRwcInTheMissingFormTypes) {
            formTypeNames.push(PCLSuncoName);
        }

        if (isRwcMissing && !areBothSuncoAndRwcInTheMissingFormTypes) {
            formTypeNames.push(PCLRwcName);
        }

        return formTypeNames;
    }, [missingFormTypes]);

    const show = false; //useMemo(() => missingFormTypeNames.length > 0, [missingFormTypeNames]);

    const MissingFormTypeNamesSection = () =>
        <div className={classes.missingChecklistMessageContainer}>
            {
                missingFormTypeNames.map((formTypeName) => 
                    <li key={`Missing_Form_Type_${formTypeName}`} className={classes.missingFormType}>
                        {formTypeName} <br />
                    </li>
                )
            }
        </div>

    return (
        <>
            {
                show &&
                    <div className={`${classes.formlistItem}`} style={{cursor: 'default'}}>
                        <div className={`${classes.status} ${classes.section}`}>
                            <StatusCircle status={FormStatuses.NotFound} />
                        </div>

                        <div className={`${classes.section}`}>
                            These checklists haven’t been created for this location yet: <br />
                        </div>

                        <div className={`${classes.section}`}>
                            <MissingFormTypeNamesSection />
                        </div>
                        
                        <div className={`${classes.section}`}>
                            Location: {selectedMapNode?.name}
                        </div>
                    </div>
            }
        </>
    );
}