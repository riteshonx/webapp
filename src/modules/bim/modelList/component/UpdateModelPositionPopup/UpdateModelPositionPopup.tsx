import { Button, Dialog, DialogContent, InputLabel, TextField } from '@material-ui/core';
import React, { useContext, useState } from 'react';
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';
import { ILocationModel } from 'src/modules/visualize/VisualizeView/models/locationModel';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import { graphqlMutation } from 'src/utils/helper';
import { projectFeatureAllowedRoles } from 'src/utils/role';
import { setIsLoading } from 'src/version2.0_temp/context';
import Notification, { AlertTypes } from 'src/modules/shared/components/Toaster/Toaster';
import { UPDATE_LOCATION_MODEL } from 'src/modules/bim/graphql/bimUpload';
import './UpdateModelPositionPopup.scss'

interface UpdateModelPositionPopupProps {
  onClose: () => void;
  model: ILocationModel;
}

const UpdateModelPositionPopup = ({ model, onClose }: UpdateModelPositionPopupProps): React.ReactElement => {
  const [show, setShow] = useState(true);
  const [selectedModel, setSelectedModel] = useState<ILocationModel>(model);
  const { dispatch, state }: any = useContext(stateContext);
  const [infoMsg, setInfoMsg] = useState('');

  const handleSubmit = async () => {
    try {
      dispatch(setIsLoading(true));
      setInfoMsg('')
      const { error: updateModelerr } = await graphqlMutation(UPDATE_LOCATION_MODEL, {
        "id": selectedModel?.id,
        "latitude": selectedModel?.latitude,
        "longitude": selectedModel?.longitude,
        "trueNorth": selectedModel?.trueNorth,
        "baseElevation": selectedModel?.baseElevation,
      }, projectFeatureAllowedRoles.updateBimModel, state.selectedProjectToken);
      if (updateModelerr)
        throw updateModelerr;
      setInfoMsg('Position updated Successfully')
      dispatch(setIsLoading(false));
    } catch (error: any) {
      dispatch(setIsLoading(false));
      Notification.sendNotification('Some error occured on update location', AlertTypes.error);
    }
  }

  const onValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedModel) return;
    const key = event.target.id as keyof typeof selectedModel;
    const newModel = { ...selectedModel };
    newModel[key] = event.target.value;
    key && setSelectedModel(newModel);
    setInfoMsg('');
  }

  return (
    <div>
      <Dialog className='bim-update-position-modal' onClose={onClose} open={show} fullWidth={true} maxWidth={'sm'} disableBackdropClick={true}>
        <DialogContent>
          <div>
            <div className="header">
              Update Visualize Model Position
              <CancelOutlinedIcon onClick={onClose} />
            </div>
            <form onSubmit={handleSubmit}>
              <div className='fileList'>
                <InputLabel htmlFor="attribute">Latitude</InputLabel>
                <TextField
                  id="latitude"
                  type="number"
                  placeholder={"Select"}
                  required={true}
                  className="textField"
                  fullWidth={true}
                  variant="outlined"
                  size='small'
                  value={selectedModel?.latitude || 0}
                  onChange={onValueChange}
                />
                <InputLabel htmlFor="attribute">Longitude</InputLabel>
                <TextField
                  id="longitude"
                  type="number"
                  placeholder={"Select"}
                  required={true}
                  className="textField"
                  fullWidth={true}
                  variant="outlined"
                  size='small'
                  value={selectedModel?.longitude || 0}
                  onChange={onValueChange}
                />
                <InputLabel htmlFor="attribute">True North</InputLabel>
                <TextField
                  id="trueNorth"
                  type="number"
                  placeholder={"Select"}
                  required={true}
                  className="textField"
                  fullWidth={true}
                  variant="outlined"
                  size='small'
                  value={selectedModel?.trueNorth || 0}
                  onChange={onValueChange}
                />
                <InputLabel htmlFor="attribute">Base Elevation</InputLabel>
                <TextField
                  id="baseElevation"
                  type="number"
                  placeholder={"Select"}
                  required={true}
                  className="textField"
                  fullWidth={true}
                  variant="outlined"
                  size='small'
                  value={selectedModel?.baseElevation || 0}
                  onChange={onValueChange}
                />
                <div className='info-msg'>{infoMsg}</div>
              </div>
              <div className="footer">
                <Button onClick={handleSubmit} variant="outlined" className="btn-secondary">
                  Submit
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UpdateModelPositionPopup;