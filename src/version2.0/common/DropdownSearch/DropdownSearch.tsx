import { TextField, Tooltip } from '@material-ui/core';
import { ReactElement } from 'react';
import './DropdownSearch.scss';
import { Autocomplete } from '@material-ui/lab';

interface DropdownProps {
	selectedValue: string;
	handleDropDownClick: () => void;
	options: any;
	optionLabel: string;
	handleDropdownSelectionChange: any;
	isDisabled: boolean;
	transparent: boolean;
	type: string;
	isOnxTenant: boolean;
	open: boolean;
}

function DropdownSearch({
	selectedValue,
	handleDropDownClick,
	options,
	optionLabel,
	handleDropdownSelectionChange,
	isDisabled,
	type,
}: DropdownProps): ReactElement {
	return (
		<div
			className={
				isDisabled
					? 'project-container project-container_disable'
					: 'project-container'
			}
		>
			<div className={'project-container dropdown'}>
				{selectedValue && Object.keys(selectedValue).length > 0 && (
					<Autocomplete
						data-testid={`project-container-dropdown-input`}
						id="combo-box-demo"
						disabled={isDisabled}
						options={options}
						disablePortal
						renderOption={(option: any) => (
							<div>
								{option[optionLabel] ? (
									option[optionLabel].length <= 18 ? (
										option[optionLabel]
									) : (
										<Tooltip
											title={option[optionLabel]}
											placement="right-start"
										>
											<span>
												{option[optionLabel].slice(0, 18).trim() + '...'}
											</span>
										</Tooltip>
									)
								) : (
									''
								)}
							</div>
						)}
						getOptionSelected={(option: any, value: any) => {
							if (type === 'portfolio') {
								return value?.portfolioName === option?.portfolioName;
							} else {
								return value?.projectName === option?.projectName;
							}
						}}
						defaultValue={selectedValue}
						value={selectedValue}
						selectOnFocus
						className="dropdown-body"
						getOptionLabel={(option: any) =>
							option[optionLabel]
								? option[optionLabel].length <= 18
									? option[optionLabel]
									: option[optionLabel].slice(0, 18).trim() + '...'
								: ''
						}
						disableClearable
						noOptionsText={
							type === 'portfolio' ? 'No portfolios found' : 'No projects found'
						}
						onChange={(e, value) => handleDropdownSelectionChange(value)}
						renderInput={(params: any) => (
							<TextField
								{...params}
								placeholder={'Search'}
								variant="outlined"
								onBlur={() => handleDropDownClick()}
							/>
						)}
					/>
				)}
			</div>
		</div>
	);
}

export default DropdownSearch;
