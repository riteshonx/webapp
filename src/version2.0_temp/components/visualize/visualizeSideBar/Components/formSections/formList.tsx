import React, { useEffect, useMemo, useState } from 'react';
import { Pagination } from '@mui/material';
import { v4 as uuid } from 'uuid';
import { FormListItem } from 'src/version2.0_temp/components/visualize/visualizeSideBar/Components/formSections/formListItem';
import { Form } from 'src/modules/visualize/VisualizeView/models/form';
import { SmartNodes } from 'src/modules/visualize/VisualizeView/models/SmartNodes';
import useMediaQuery from '@material-ui/core/useMediaQuery';

interface FormListProps {
  forms: Form[];
  selectedMapNode?: SmartNodes;
  loading: boolean;
  onFormClick: (form: Form) => void;
  noFormTypesSelected: boolean;
  doFormsExistForAnyFeatureType: boolean;
}
const formsPerPage = 60;

export const FormList = ({ forms, selectedMapNode, loading, onFormClick, noFormTypesSelected, doFormsExistForAnyFeatureType }: FormListProps): React.ReactElement => {
  const showPaginator = forms.length > formsPerPage;
  const matches = useMediaQuery('(max-width:1200px)');

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
    <div className="v2-visualize-formList">
      {
        Boolean(formsOnPage) && formsOnPage.map((form) =>
          <div key={`form_${form.formId}_${uuid()}`}>
            <FormListItem form={form} onClick={() => onFormClick(form)} />
          </div>
        )
      }

      {
        noFormTypesSelected &&
        <div className='formMessage'>
          Selected data will display here
        </div>
      }

      {
        forms.length === 0 && !noFormTypesSelected &&
        <div className='formMessage'>
          No items exist for this data type
        </div>
      }
      {
        showPaginator &&
        <div className='formPagination'>
          <Pagination size={matches? 'small' : 'medium'} page={page} onChange={(event, value) => setPage(value)} count={pageCount} shape={'rounded'} variant="outlined" />
        </div>
      }
    </div>
  );
};