import { Icon, InputAdornment, OutlinedInput } from '@mui/material';
import { Search } from '@material-ui/icons';

export default function SearchInput(props) {
  return (
    <OutlinedInput
      {...props}
      size="small"
      endAdornment={
        <InputAdornment position="end">
          <Icon style={{ height: '24px', width: '24px' }}>
            <Search />
          </Icon>
        </InputAdornment>
      }
    />
  );
}
