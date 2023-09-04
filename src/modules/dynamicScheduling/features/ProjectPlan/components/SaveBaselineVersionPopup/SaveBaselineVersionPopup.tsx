import { Button, DialogTitle, Tooltip } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import moment from 'moment';
import React, { useState } from 'react';
import TextFieldCustom from '../../../../components/TextFieldCustom/TextFieldCustom';
import './SaveBaselineVersionPopup.scss';
const SaveBaselineVersionPopup = (props: any) => {
  const { open, close, saveVersionBaseLine, currentVersionList } = props;
  const [errors, setErrors] = useState<any>({ versionName: '' });
 const [isDisabled, setIsDisabled] = useState<boolean>(false);
  // const [open, setOpen] = useState(false);
  const [baseline, setBaseline] = useState<any>({
    versionName: '',
    description: '',
    isBaseline: false,
  });

  const onChange = (e: any) => {
    if (e.target.name == 'isBaseline') {
      setBaseline({ ...baseline, [e.target.name]: e.target.checked });
    } else {
      setBaseline({ ...baseline, [e.target.name]: e.target.value });
    }

    if (e.target.name == 'versionName' && e.target.value.trim().length > 0) {
     if(currentVersionList.filter((item:any)=>item.baselineName.trim().toLowerCase() == e.target.value.trim().toLowerCase()).length>0){
     setErrors({ versionName: 'Version name must be unique' });
     setIsDisabled(true);
     }
     else{
      setErrors({ versionName: '' });
      setIsDisabled(false);
     }
    }
  };

  // const onBlur = (e: any) => {
  //   if (e.target.name == 'versionName' && e.target.value.trim().length == 0) {
  //     setErrors({ versionName: 'Name is required' });
  //   } else {
  //     setErrors({ versionName: '' });
  //   }
  // };

  const getLastSaveVersion = () => {
    if (currentVersionList.length > 0) {
      return moment(
        currentVersionList[currentVersionList.length - 1].createdAt
      ).format('DD MMM YY');
    }

    return '';
  };
  const saveVersion = () => {
    saveVersionBaseLine(baseline);
    setBaseline({
      versionName: '',
      description: '',
      isBaseline: false,
    });
    close(false);
  };
  return (
    <Dialog
      data-test-id="save-baseline-version-popup"
      open={open}
      onClose={() => {
        close(false);
      }}
      maxWidth="md"
      fullWidth={true}
      disableBackdropClick={true}
      className="save-baseline-version-popup"
    >
      <DialogTitle className="save-baseline-version-popup__title">
        <div className="save-baseline-version-popup__title-empty"></div>
        <div className="save-baseline-version-popup__title-text">
          <span>Save Version As</span>
        </div>

        <div className="save-baseline-version-popup__title-close">
          <Button
            className="btn-secondary save-baseline-version-popup__title-close-button"
            variant="outlined"
            onClick={() => {
              close(false);
            }}
          >
            X
          </Button>
        </div>
      </DialogTitle>

      <DialogContent className="save-baseline-version-popup__content">
        <div className="save-baseline-version-popup__content__name">
          <label className="save-baseline-version-popup__content__name_label">
            Name*
          </label>
          <TextFieldCustom
            data-testid="baseline-name"
            className="save-baseline-version-popup__content__name-input"
            placeholder="Enter Name"
            name="versionName"
            onChange={onChange}
            value={baseline.versionName}
            // onBlur={onBlur}
            error={errors.versionName}
          ></TextFieldCustom>
          {baseline.versionName.trim().length > 1000 && (
            <span className="save-baseline-version-popup__content__name-input-error">
              {' '}
            Please use 1000 characters or less for version name
            </span>
          )}
        </div>
        <div className="save-baseline-version-popup__content__description">
          <label className="save-baseline-version-popup__content__description-label">
            Description
          </label>
          <textarea
            data-testid="baseline-description"
            className="save-baseline-version-popup__content__description-input"
            placeholder="Enter Description"
            name="description"
            onChange={onChange}
            value={baseline.description}
          ></textarea>
        </div>
        {currentVersionList.length > 0 && (
          <span className="save-baseline-version-popup__content__last-save-version-text">
            {`Last Saved Version ${getLastSaveVersion()}`}
          </span>
        )}

        <div className="save-baseline-version-popup__content__baseline-this-version">
          <Tooltip title="Baselining will mark this version for all time comparisons">
            <input
              type="checkbox"
              className="save-baseline-version-popup__content__baseline-this-version-checkbox"
              name="isBaseline"
              checked={baseline.isBaseline}
              onChange={onChange}
            ></input>
          </Tooltip>

          <span className="save-baseline-version-popup__content__baseline-this-version-text">
            Baseline This Version
          </span>
        </div>

        <div className="save-baseline-version-popup__content__footer">
          <Button
            className="btn-text
            save-baseline-version-popup__content__footer-cancel"
            variant="outlined"
            onClick={() => {
              close(false);
            }}
          >
            {' '}
            Cancel
          </Button>
          <Button
            className="btn-primary"
            onClick={saveVersion}
            disabled={
              baseline.versionName.trim() == 0 ||
              baseline.versionName.trim().length > 1000 ||
              isDisabled
            }
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SaveBaselineVersionPopup;
