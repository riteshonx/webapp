import Button from '@material-ui/core/Button';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import React, { useContext } from 'react';
import EditProjectPlanLinkContext from '../../../../context/editProjectPlanLinks/editProjectPlanLinksContext';
import { Link, TabType } from '../../../../models/link';
// import FormLinkOption from '../FormLinkOption/FormLinkOption';
import './AddDataLinks.scss';
import FormLinks from './components/FormLinks/FormLinks';
interface IProps {
  isOpen: boolean;
  setValues: (argValue: Array<Link>) => void;
  close: () => void;
}

const AddDataLinks = ({ isOpen, setValues, close }: IProps) => {
  const [fullWidth] = React.useState(true);
  const [maxWidth] = React.useState<DialogProps['maxWidth']>('md');
  const [currentTab, setCurrentTab] = React.useState(TabType.forms);
  const editProjectPlanLinksContext: any = useContext(
    EditProjectPlanLinkContext
  );

  const {
    draftSelectedFormLinks,
    setDraftSelectedFormLinks,
    currentTaskLinkedForm,
  } = editProjectPlanLinksContext;

  const handleClose = () => {
    close();
    setDraftSelectedFormLinks([]);
  };

  const saveChanges = () => {
    setValues(draftSelectedFormLinks);
    setDraftSelectedFormLinks([]);
  };

  return (
    <React.Fragment>
      <Dialog
        data-testid="add-data-link-popup"
        className="addDataLinks"
        fullWidth={fullWidth}
        maxWidth={maxWidth}
        disableBackdropClick={true}
        open={isOpen}
        onClose={handleClose}
        aria-labelledby="max-width-dialog-title"
      >
        <DialogTitle
          data-testid="add-data-link-popup-add-link-title"
          className="addDataLinks__header"
          id="max-width-dialog-title"
        >
          Add links
        </DialogTitle>
        <DialogContent
          className="addDataLinks__body"
          data-testid="add-data-link-popup-content"
        >
          <div className="addDataLinks__body__tabs">
            <div
              className={`addDataLinks__body__tabs__item addDataLinks__body__tabs__item-1 ${
                currentTab === TabType.forms
                  ? 'addDataLinks__body__tabs__active'
                  : ''
              }`}
              onClick={() => setCurrentTab(TabType.forms)}
            >
              Forms
              {(draftSelectedFormLinks.length > 0 ||
                currentTaskLinkedForm.length > 0) && (
                <span
                  data-testid="add-data-link-popup-form-count"
                  className="addDataLinks__body__tabs__item__form-count"
                >
                  {draftSelectedFormLinks.length + currentTaskLinkedForm.length}
                </span>
              )}
            </div>
          </div>
          <div
            className="addDataLinks__body__tabsSection"
            data-testid="add-data-link-popup-tab-section"
          >
            {currentTab === TabType.forms && <FormLinks />}
            {/* form data */}
          </div>
        </DialogContent>
        <DialogActions className="addDataLinks__footer">
          <Button
            data-testid="add-data-link-popup-close-btn"
            onClick={handleClose}
            className="btn-secondary"
          >
            Close
          </Button>
          <Button
            onClick={saveChanges}
            className="btn-primary"
            data-testid="add-data-link-popup-save-btn"
            disabled={draftSelectedFormLinks.length === 0 ? true : false}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default AddDataLinks;
