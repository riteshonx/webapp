import React, { useState, useContext, useEffect } from 'react';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { formStateContext } from '../../Context/projectContext';
import { CustomPopOver } from '../../../../shared/utils/CustomPopOver';
import './AssetData.scss';

interface AssetTypesProps {
	field: any;
	formData: Any;
	isEditAllowed?: boolean;
}

const AssetData = (props: AssetTypesProps): React.ReactElement => {
	const [values, setValues] = useState<any>([]);
	const [currentValue, setcurrentValue] = useState<any>(null);
	const { getValues }: any = useContext(formStateContext);
	const [optionData, setOptionData] = useState<any>([]);
	const popOverclasses = CustomPopOver();

	const getAssetOptions = () => {
		return optionData.map((value) => {
			let assetOptionValue = '';
			value.locationValue.forEach((item, index) => {
				assetOptionValue = `${
					index + 1 === value.locationValue?.length ? item : `> ${item}`
				} ${assetOptionValue}`;
			});
			return assetOptionValue;
		});
	};
	useEffect(() => {
		setValues(getAssetOptions());
	}, [optionData]);

	useEffect(() => {
		try {
			const value = getValues(props.field.name);
			if (!value) {
				return;
			}
			if (typeof value === 'string') {
				return;
			} else {
				if (value.length > 0) {
					setOptionData(value);
				}
			}
		} catch (error: any) {
			console.log(error);
		}
	}, [props.field]);

	const handleChange = (event: SelectChangeEvent) => {
		setcurrentValue(event.target.value);
	};

	const renderOptions = () => {
		return optionData?.length > 0 ? (
			<ul className="asset__data__value">
			  {optionData.map((lists: any) => (
				  <li key={lists.locationReferenceId}>
				  {[...lists.locationValue].reverse().join(">")}
				</li>
			  ))}
			</ul>
		  ) : (
			"-"
		  );
	};

	return (
		<React.Fragment>
			{/* <FormControl fullWidth>
				<Select
					value={currentValue}
					onChange={handleChange}
					variant="outlined"
					displayEmpty
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
				>
					<MenuItem value="">-- Select asset type --</MenuItem>
					{renderOptions()}
				</Select>
			</FormControl> */}

         {renderOptions()}
		</React.Fragment>
	);
};

export default AssetData;
