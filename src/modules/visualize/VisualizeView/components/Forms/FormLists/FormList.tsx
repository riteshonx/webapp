import { Pagination as PaginationBase, styled } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useEffect, useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';

import { Form } from '../../../models/form';
import { FormType } from '../../../models/formType';
import { SmartNodes } from '../../../models/SmartNodes';
import { WithLoadingSpinner } from '../../../utils/WithLoadingSpinner';
import { useFormStyles } from '../formStyles';
import { FormListItem, MissingFormListItem } from './FormListItem';

const Pagination = styled(PaginationBase)({
    '& .MuiPaginationItem-icon': {
        fontSize: '14px',
    },

    '& .MuiPaginationItem-root': {
        fontSize: '14px',
        height: '30px',
        minWidth: '30px',
    }
});

const formsPaginationContainerHeight = 38;

interface StyleProps {
    showPaginator: boolean;
}

const useStyles = makeStyles(({
    formListContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: ({showPaginator}: StyleProps) => showPaginator ? `calc(100% - ${formsPaginationContainerHeight}px)` : '100%',
        overflow: 'auto',
    },

    formsPaginationContainer: {
        height: `${formsPaginationContainerHeight}px`,
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0px 2px 1px -1px rgba(180, 179, 189, 0.25), 2px 0px 1px rgba(180, 179, 189, 0.04), 0px 2px 8px rgba(0, 0, 0, 0.5)',
        clipPath: 'inset(-6px 0px 0px 0px)',
    },

    noDataMessageContainer: {
        marginLeft: '15px',
        marginTop: '44px',
    },
}));

interface FormListProps {
    forms: Form[];
    selectedMapNode?: SmartNodes;
    loading: boolean;
    onFormClick: (form: Form) => void;
    noFormTypesSelected: boolean;
    doFormsExistForAnyFeatureType: boolean;
    activeFormTypes?: FormType[];
    missingFormTypes?: FormType[];
}

const formsPerPage = 60;

export function FormList({forms, selectedMapNode, loading, onFormClick, noFormTypesSelected, doFormsExistForAnyFeatureType, activeFormTypes, missingFormTypes}: FormListProps) {
    const showPaginator = forms.length > formsPerPage;
    
    const classes = {...useStyles({showPaginator}), ...useFormStyles()};
    
    const [page, setPage] = useState<number>(1);
    const pageCount = useMemo(() => Math.ceil(forms.length / formsPerPage), [forms]);

    useEffect(() => {
        setPage(1);
    }, [forms]);

    const formsOnPage = useMemo(() => {
        const startIndex = (page - 1) * formsPerPage;
        const endIndex = startIndex + formsPerPage;

        return [...forms.slice(startIndex, endIndex)];
    }, [forms, page]);

    return (
        <WithLoadingSpinner loading={loading}>
            <div style={{height: '100%', overflow: 'hidden'}}>
                <div className={classes.formListContainer}>
                    {
                        Boolean(missingFormTypes) && missingFormTypes!.length > 0 &&
                            <MissingFormListItem activeFormTypes={activeFormTypes!} missingFormTypes={missingFormTypes!} selectedMapNode={selectedMapNode!} />
                    }

                    {
                        Boolean(formsOnPage) && formsOnPage.map((form) =>
                            <div key={`form_${form.formId}_${uuid()}`}>
                                <FormListItem form={form} onClick={() => onFormClick(form)} />
                            </div>
                        )
                    }

                    {
                        noFormTypesSelected &&
                            <div className={`${classes.noDataMessageContainer} ${classes.noDataMessage}`}>
                                Selected data will display here
                            </div>
                    }

                    {
                        forms.length === 0 && !noFormTypesSelected && doFormsExistForAnyFeatureType &&
                            <div className={`${classes.noDataMessageContainer} ${classes.noDataMessage}`}>
                                No results
                            </div>
                    }

                    {
                        !doFormsExistForAnyFeatureType && !noFormTypesSelected &&
                            <div className={`${classes.noDataMessageContainer} ${classes.noDataMessage}`}>
                                No items exist for this data type
                            </div>
                    }
                </div>

                {
                    showPaginator &&
                        <div className={classes.formsPaginationContainer}>
                            <Pagination size={'small'} page={page} onChange={(event, value) => setPage(value)} count={pageCount} shape={'rounded'} />
                        </div>
                }
            </div>
            
        </WithLoadingSpinner>
    )
}