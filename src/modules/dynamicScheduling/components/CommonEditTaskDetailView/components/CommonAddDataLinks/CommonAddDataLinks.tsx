import Button from '@material-ui/core/Button';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import React from 'react';
import { Link, TabType } from '../../../../models/link';
// import FormLinkOption from '../FormLinkOption/FormLinkOption';
import './CommonAddDataLinks.scss';
import CommonFormLinks from './components/CommonFormLinks/CommonFormLinks';
// import FormLinks from './components/FormLinks/FormLinks';
interface IProps {
  isOpen: boolean;
  setValues: (argValue: Array<Link>) => void;
  close: () => void;
  draftSelectedFormLinks: any;
  setDraftSelectedFormLinks: (arg: any) => any;
  currentTaskLinkedForm: any;
  formFeatures: any;
  selectedFeature: any;
  selectFeature: (param: any) => any;
  fetchFormData: () => any;
  fetchFormFeatures: (task: any) => any;
  currentTask: any;
  projectTokens: any;
  selectedFeatureFormsList: any;
  setSelectedFeatureFormList: any;
}

const CommonAddDataLinks = ({
  isOpen,
  setValues,
  close,
  draftSelectedFormLinks,
  setDraftSelectedFormLinks,
  currentTaskLinkedForm,
  formFeatures,
  selectedFeature,
  selectFeature,
  fetchFormData,
  fetchFormFeatures,
  projectTokens,
  currentTask,
  selectedFeatureFormsList,
  setSelectedFeatureFormList,
}: IProps) => {
  const [fullWidth] = React.useState(true);
  const [maxWidth] = React.useState<DialogProps['maxWidth']>('md');
  const [currentTab, setCurrentTab] = React.useState(TabType.forms);

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
        className="commonAddDataLinks"
        fullWidth={fullWidth}
        maxWidth={maxWidth}
        disableBackdropClick={true}
        open={isOpen}
        onClose={handleClose}
        aria-labelledby="max-width-dialog-title"
      >
        <DialogTitle
          data-testid="add-data-link-popup-add-link-title"
          className="commonAddDataLinks__header"
          id="max-width-dialog-title"
        >
          Add links
        </DialogTitle>
        <DialogContent
          className="commonAddDataLinks__body"
          data-testid="add-data-link-popup-content"
        >
          <div className="commonAddDataLinks__body__tabs">
            <div
              className={`commonAddDataLinks__body__tabs__item commonAddDataLinks__body__tabs__item-1 ${
                currentTab === TabType.forms
                  ? 'commonAddDataLinks__body__tabs__active'
                  : ''
              }`}
              onClick={() => setCurrentTab(TabType.forms)}
            >
              Forms
              {(draftSelectedFormLinks.length > 0 ||
                currentTaskLinkedForm.length > 0) && (
                <span
                  data-testid="add-data-link-popup-form-count"
                  className="commonAddDataLinks__body__tabs__item__form-count"
                >
                  {draftSelectedFormLinks.length + currentTaskLinkedForm.length}
                </span>
              )}
            </div>
          </div>
          <div
            className="commonAddDataLinks__body__tabsSection"
            data-testid="add-data-link-popup-tab-section"
          >
            {currentTab === TabType.forms && (
              <CommonFormLinks
                formFeatures={formFeatures}
                selectedFeature={selectedFeature}
                selectFeature={selectFeature}
                fetchFormData={fetchFormData}
                fetchFormFeatures={fetchFormFeatures}
                projectTokens={projectTokens}
                currentTask={currentTask}
                selectedFeatureFormsList={selectedFeatureFormsList}
                draftSelectedFormLinks={draftSelectedFormLinks}
                setDraftSelectedFormLinks={setDraftSelectedFormLinks}
                setSelectedFeatureFormList={setSelectedFeatureFormList}
              />
            )}
            form data
          </div>
        </DialogContent>
        <DialogActions className="commonAddDataLinks__footer">
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

export default CommonAddDataLinks;
