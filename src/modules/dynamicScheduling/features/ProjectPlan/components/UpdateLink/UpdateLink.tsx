import { Button, FormControl } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import React, { useState } from 'react';
import NumberFormat from 'react-number-format';
import './UpdateLink.scss';

const UpdateLink = (props: any) => {
  const defaultType: any[] = [
    {
      label: 'Finish to Start',
      name: 'finish_to_start',
      id: '0',
    },
    {
      label: 'Start to Start',
      name: 'start_to_start',
      id: '1',
    },
    {
      label: 'Finish to Finish',
      name: 'finish_to_finish',
      id: '2',
    },

    {
      label: 'Start to Finish',
      name: 'start_to_finish',
      id: '3',
    },
  ];

  const tempData = props.linkData;

  const [defaultTypeDetails, setDefaultTypeDetails] = useState(defaultType);
  const [linkData, setLinkData] = React.useState(tempData);
  const [isLagValid, setIsLagValid] = React.useState(true);
  const MAX_VAL = 100;
  const MIN_VAL = -100;
  const withValueCap = (inputObj: any) => {
    const { value } = inputObj;

    if (value == '-') {
      return true;
    }

    if (value <= MAX_VAL && value >= MIN_VAL) {
      return true;
    }
    return false;
  };

  const handleClose = () => {
    props.close();
    setIsLagValid(true);
  };

  const handleChange = (event: any) => {
    const data = linkData;
    if (!event?.name) {
      data.lag = Number(event.value);
      setIsLagValid(true);
    } else {
      data.type = event.id;
      data.typeLabel = event.label;
    }
    setLinkData(data);
  };

  const handleProceed = () => {
    props.proceed(linkData);
    setIsLagValid(true);
  };

  return (
    <div>
      <Dialog
        open={props.open}
        onClose={handleClose}
        disableBackdropClick={true}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          <div className="updateLinkDialog">
            <div className="updateLinkDialog__header">
              <div className="updateLinkDialog__header">
                Predecessor:{' '}
                <span className="updateLinkDialog__header__text">
                  {props.linkData.predecessor}
                </span>
              </div>
              <div className="updateLinkDialog__header">
                Successor:{' '}
                <span className="updateLinkDialog__header__text">
                  {props.linkData.successor}
                </span>
              </div>
            </div>
            <div className="updateLinkDialog__body__dropdown">
              <InputLabel id="label">Type</InputLabel>
              <FormControl variant="outlined" fullWidth>
                <Select
                  name="type"
                  labelId={linkData.type}
                  //id="select"
                  className="addConstraint__fields__textField__select"
                  id="demo-simple-select-outlined"
                  MenuProps={{
                    anchorOrigin: {
                      vertical: 'bottom',
                      horizontal: 'left',
                    },
                    transformOrigin: {
                      vertical: 'top',
                      horizontal: 'left',
                    },
                    getContentAnchorEl: null,
                  }}
                  defaultValue={props.linkData.type}
                >
                  {defaultTypeDetails &&
                    defaultTypeDetails.map((item: any, index: any) => (
                      <MenuItem
                        value={index.toString()}
                        onClick={() => handleChange(item)}
                      >
                        {item.label}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </div>

            {!props.isRecipe && (
              <div className="updateLinkDialog__body__textField updateLinkDialog__body__dropdown">
                <InputLabel id="demo-simple-select-outlined-label">
                  Lag (days)
                </InputLabel>
                <NumberFormat
                  id="lag"
                  name="lag"
                  inputMode="numeric"
                  allowNegative={true}
                  allowLeadingZeros={false}
                  isAllowed={withValueCap}
                  customInput={TextField}
                  style={{ margin: '0px 0px 4px 0px' }}
                  fullWidth
                  value={linkData.lag}
                  margin="normal"
                  variant="outlined"
                  decimalScale={0}
                  onValueChange={handleChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  placeholder="Number"
                />
                {/* <TextField id="outlined-basic" variant="outlined" name='lag' onChange={handleChange} defaultValue={linkData.lag}/> */}

                <span className="updateLinkDialog__body__textField__note">
                  *The lag value will appear on the plan after rescheduling
                </span>
              </div>
            )}
            <div className="updateLinkDialog__footer">
              <Button
                data-testid={'cancel-action'}
                variant="outlined"
                type="submit"
                onClick={handleClose}
                className="btn-secondary"
              >
                Cancel
              </Button>
              <Button
                data-testid={'confirm-action'}
                variant="contained"
                type="submit"
                onClick={handleProceed}
                className="btn-primary"
                disabled={!isLagValid}
              >
                Apply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UpdateLink;
