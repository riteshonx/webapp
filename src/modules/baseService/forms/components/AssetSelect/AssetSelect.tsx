import React, { useState } from 'react';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { CustomPopOver } from '../../../../shared/utils/CustomPopOver';

const options = {
	children: [
		{
			name: 'Asset Type',
		},
	],
};

const AssetSelect = (props: any) => {
	const [value, setValue] = useState('');
	const popOverclasses = CustomPopOver();

	const handleChange = (event: SelectChangeEvent) => {
		setValue(event.target.value as string);
	};

	const renderOptions = (options: any) => {
		return options.map((item: any, itemIndex: any) => (
			<MenuItem
				key={itemIndex}
				value={item?.name}
			>
				<ListItemText primary={item.name} />
			</MenuItem>
		));
	};
	return (
		<React.Fragment>
			<FormControl fullWidth>
				<Select
					value={value}
					onChange={handleChange}
					autoComplete="off"
					variant="outlined"
					displayEmpty
					placeholder="Multi select"
					MenuProps={{
						classes: { paper: popOverclasses.root },
						anchorOrigin: {
							vertical: 'bottom',
							horizontal: 'left',
						},
						transformOrigin: {
							vertical: 'top',
							horizontal: 'left',
						},
					}}
					className="nested_select"
				>
					{renderOptions(options.children)}
				</Select>
			</FormControl>
		</React.Fragment>
	);
};

export default AssetSelect;
