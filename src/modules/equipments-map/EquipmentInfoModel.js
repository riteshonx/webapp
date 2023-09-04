import { Modal, Box, Typography } from '@mui/material';
import InfoVideo from './components/InfoView/InfoVideo';
import VehicleDetailInfoImage from '../../assets/images/equipments-map-vehicle-detail-info.png';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  minWidth: 400,
  maxWidth: 800,
  bgcolor: 'background.paper',
  border: '1px solid #ccc',
  borderRadius: '3px',
  boxShadow: 24,
  p: 4,
};

export default function EquipmentInfoModal({ open, onClose }) {
  const handleModalClose = (e) => {
    onClose(e);
  };
  return (
    <Modal open={open} onClose={handleModalClose}>
      <Box sx={style}>
        <Typography variant="title">Equipment Information</Typography>
        <img src={VehicleDetailInfoImage} style={{ width: '100%' }} />
        <center style={{ marginTop: '20px' }}>
          <InfoVideo src="https://www.youtube.com/embed/oLhiOj27DMc?mute=1" />
        </center>
      </Box>
    </Modal>
  );
}
