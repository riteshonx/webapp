import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  InputAdornment,
  Icon,
  OutlinedInput,
  Alert,
} from '@mui/material';
import { Search } from '@material-ui/icons';
import { useState } from 'react';

export default function SearchResultNotFoundDialog({
  searchKeywords,
  handleKeywordsChange,
  open,
  onClose,
  inputRef,
}) {
  const [searchCount, setSearchCount] = useState(0);
  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchCount(searchCount + 1);
  };
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Search Result</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <OutlinedInput
            inputRef={inputRef}
            fullWidth
            value={searchKeywords}
            size="small"
            onChange={handleKeywordsChange}
            endAdornment={
              <InputAdornment position="end">
                <Icon>
                  <Search />
                </Icon>
              </InputAdornment>
            }
          />
        </form>

        <Typography style={{ marginTop: '20px' }}>
          {`<!-- Suggeted Content Here (${searchCount}) -->`}
        </Typography>
        <Alert severity="info" style={{ marginTop: '20px' }}>
          Suggeted Content will be here, including
          <ul>
            <li>company properties (buiding locations, equipment locations)</li>
            <li>Company assets (pictures, Tasks, Drawings)</li>
            <li>Google suggested locations</li>
            <li>Google suggested result</li>
            <li>Wikipedia etc</li>
          </ul>
        </Alert>
        <img
          src="https://ganda.com/wp-content/uploads/2017/05/robot-gif-3-1.gif"
          width="100%"
        />
      </DialogContent>
    </Dialog>
  );
}
