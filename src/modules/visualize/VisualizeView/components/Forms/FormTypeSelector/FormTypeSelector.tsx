import { Button, Popover } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Theme } from 'src/modules/visualize/theme';

import { useProjectId } from '../../../hooks/useProjectId';
import { FormType } from '../../../models/formType';
import { useAnalytics } from '../../../utils/analytics';
import { useEventListener } from '../../../utils/useEventListener';
import { FormTypeGroup } from '../groupingWhiteList/FormTypeGroup';
import { FormTypeCheckBoxList } from './FormTypeCheckBoxList';
import { FormTypeGroupCheckBoxList } from './FormTypeGroupCheckBoxList';
import { SelectableFormTypeGroup } from './selectableFormTypeGroup';
import { SelectableFormType } from './selectableFormTypes';

const useStyles = makeStyles((theme: Theme) => ({
    container: {
        width: '100%',
    },

    button: {
        height: '50px',
        width: '100%',
        backgroundColor: `${theme.colors.blueColor} !important`,
    },

    buttonContents: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        fontSize: '16px',
        color: 'white',
        padding: '10px 20px',
        textTransform: 'capitalize',
    },

    arrow: {
        width: 0,
        height: 0,
        borderLeft: '7px solid transparent',
        borderRight: '7px solid transparent',
        borderTop: '7px solid #fff',
        marginRight: '10px',
        transform: 'rotate(0deg)',
    },

    arrowRotate: {
        transform: 'rotate(180deg)',
    },

    selectDeselectAllContainer: {
        borderBottom: 'solid rgba(224, 224, 224, 1) 1px',
        padding: '20px',
    },

    selectDeselectAll: {
        fontSize: '14px',
        color: 'rgba(10, 148, 158, 1)',
        cursor: 'pointer',
        fontWeight: 600,
    },

    checkBoxListContainer: {
        padding: '18px 20px 20px 20px',
        overflow: 'auto',
    },

    selectDataToDisplayMessage: {
        textTransform: 'none',
    },

    title: {
        textAlign: 'left',
        lineHeight: 1.2,
        fontSize: '16px',
    },
}));

interface FormTypeSelectorProps {
    formTypes?: FormType[];
    formTypeGroups?: FormTypeGroup[];
    setSelectedFormTypes: (selcetedFormTypes: FormType[]) => void;
}

const anchorHeightOffset = 170;

const heightOffsettForFeatureTypesCheckList = 321;

export function FormTypeSelector({formTypes, formTypeGroups, setSelectedFormTypes}: FormTypeSelectorProps) {
    const projectId = useProjectId();
    const {track, timeEvent} = useAnalytics();
    const classes = useStyles();

    const [popOverAnchor, setPopOverAnchor] = useState<HTMLButtonElement | undefined>(undefined);
    const [anchorWidth, setAnchorWidth] = useState<number>();

    const selectedFormTypesRef = useRef<FormType[]>([]);

    const [selectableFormTypes, setSelectableFormTypes] = useState<SelectableFormType[]>([]);
    const [selectableFormTypeGroups, setSelectableFormTypeGroups] = useState<SelectableFormTypeGroup[]>([]);

    const open = Boolean(popOverAnchor);

    useEffect(() => {
        window.addEventListener('beforeunload', onUnload);

        return () => {
            window.removeEventListener('beforeunload', onUnload);
            onUnload();
        }
    }, []);

    useEffect(() => {
        if (Boolean(formTypes)) {
            const selectableFormTypes = formTypes!.map((formType) => new SelectableFormType(formType, true));
            setSelectableFormTypes(selectableFormTypes);
        } else {
            setSelectableFormTypes([]);
        }

        if (Boolean(formTypeGroups)) {
            const selectableFormTypeGroups = formTypeGroups!.map((formTypeGroup) => new SelectableFormTypeGroup(formTypeGroup, true));
            
            setSelectableFormTypeGroups(selectableFormTypeGroups);
        } else {
            setSelectableFormTypeGroups([]);
        }
    }, [formTypes, formTypeGroups]);

    useEffect(() => {
        if (Boolean(selectableFormTypes) && selectableFormTypes.length > 0) {
            const selectedFormTypes = selectableFormTypes
                .filter((selectableFormType) => selectableFormType.selected)
                .map((selectableFormTypes) => selectableFormTypes.formType);
                
            setSelectedFormTypes(selectedFormTypes);
        }
    }, [selectableFormTypes]);

    useEffect(() => {
        if (Boolean(selectableFormTypeGroups) && selectableFormTypeGroups.length > 0) {
            const selectableFormTypes = selectableFormTypeGroups.map((formTypeGroup) => formTypeGroup.selectableFormTypes).flat();
            const selectedFormTypes = selectableFormTypes
                .filter((selectableFormType) => selectableFormType.selected)
                .map((selectableFormTypes) => selectableFormTypes.formType);

            setSelectedFormTypes(selectedFormTypes);
        }
    }, [selectableFormTypeGroups]);

    useEventListener('resize', () => setAnchorWidth(popOverAnchor?.clientWidth));

    function onUnload() {
        trackSelectedFormTypes();
    }

    function onOpenClick(element: HTMLButtonElement) {
        trackSelectedFormTypes();

        setAnchorWidth(element.clientWidth);
        setPopOverAnchor(element);
    }

    function onClose() {
        const selectedFormTypes = selectableFormTypes.filter((formType) => formType.selected).map((formType) => formType.formType);
        selectedFormTypesRef.current = selectedFormTypes;

        if (Boolean(selectedFormTypesRef.current) && selectedFormTypesRef.current.length > 0) {
            timeEvent('Form-Types-Selected');
        }
        
        setPopOverAnchor(undefined);
    }

    function trackSelectedFormTypes() {
        if (Boolean(selectedFormTypesRef.current) && selectedFormTypesRef.current.length > 0) {
            track('Form-Types-Selected', {
                formTypes: selectedFormTypesRef.current,
                projectId: projectId,
            });
        }
    }

    function setAllSelectableFormTypes(selected: boolean) {
        if (Boolean(selectableFormTypes)) {
            selectableFormTypes.forEach((selectableFormType) => selectableFormType.selected = selected);
            setSelectableFormTypes([...selectableFormTypes]);
        }

        if (Boolean(selectableFormTypeGroups)) {
            selectableFormTypeGroups.forEach((selectableFormTypeGroup) => selectableFormTypeGroup.selected = selected);
            setSelectableFormTypeGroups([...selectableFormTypeGroups]);
        }
    }

    const title = useMemo(() => {
        const selectableFormTypesFromGroups = selectableFormTypeGroups.map((selectableFormTypeGroup) => selectableFormTypeGroup.selectableFormTypes).flat();
        const _selectableFormTypes = [...selectableFormTypes, ...selectableFormTypesFromGroups];

        const selectedFormTypes = _selectableFormTypes.filter((selectableFormType) => selectableFormType.selected).map((selectableFormType) => selectableFormType.formTypeName);

        if (selectedFormTypes.length === 1) {
            return `${selectedFormTypes[0]}`;
        }

        if (selectedFormTypes.length > 1) {
            return `${selectedFormTypes.length} Selected`;
        }

        return <span className={classes.selectDataToDisplayMessage}>{'Select Data to Display'}</span>;
    }, [selectableFormTypes, selectableFormTypeGroups]);

    return (
        <>
            <div className={classes.container}>
                <Button style={{padding: '0px'}} className={classes.button} onClick={(event) => onOpenClick(event.currentTarget)}>
                    <div className={classes.buttonContents}>
                        <div className={`${classes.arrow} ${open ? classes.arrowRotate : ''}`} />

                        <div className={classes.title}>
                            {title}
                        </div>
                    </div>
                </Button>
            </div>

            <Popover
                open={open}
                anchorEl={popOverAnchor}
                onClose={onClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <div style={{width: `${anchorWidth}px`, maxHeight: `calc(100vh - ${anchorHeightOffset}px)`}}>
                    <div className={classes.selectDeselectAllContainer}>
                        <span
                            className={classes.selectDeselectAll}
                            onClick={() => setAllSelectableFormTypes(true)}
                            style={{marginRight: '30px'}}
                        >
                            Select All
                        </span>
                        
                        <span
                            className={classes.selectDeselectAll}
                            onClick={() => setAllSelectableFormTypes(false)}
                        >
                            Deselect All
                        </span>
                    </div>

                    {
                        Boolean(selectableFormTypes) && selectableFormTypes.length > 0 && (!Boolean(selectableFormTypeGroups) || selectableFormTypeGroups.length === 0) &&
                            <div className={classes.checkBoxListContainer} style={{maxHeight: `calc(100vh - ${heightOffsettForFeatureTypesCheckList}px)`}}>
                                <FormTypeCheckBoxList selectableFormTypes={selectableFormTypes} setSelecteableFormTypes={setSelectableFormTypes} />
                            </div>
                    }

                    {
                        // Convert above to only show if there are no groups, convert below to only show if there are groups,
                        // Add selectablegroup version of all the selectable form types above,
                    }
                    {
                        Boolean(selectableFormTypeGroups) && selectableFormTypeGroups.length > 0 && (!Boolean(selectableFormTypes) || selectableFormTypes.length === 0) &&
                            <div className={classes.checkBoxListContainer} style={{maxHeight: `calc(100vh - ${heightOffsettForFeatureTypesCheckList}px)`}}>
                                <FormTypeGroupCheckBoxList selectableFormTypeGroups={selectableFormTypeGroups} setSelecteableFormTypeGroups={setSelectableFormTypeGroups} />
                            </div>
                    }
                </div>
            </Popover>
        </>
    );
}