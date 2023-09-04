import { TextField } from '@material-ui/core';
import React from 'react';

export const SearchPanel = (): React.ReactElement => {

  return (
    <div className="v2-visualize-header-searchPanel">
      <TextField id="outlined-basic" placeholder='search' variant="outlined" fullWidth disabled size='small' />
    </div>
  );
};