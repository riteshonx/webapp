import { useContext, useEffect, useState } from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	TextField,
	Checkbox,
	Button,
	IconButton,
	Tooltip,
	TableSortLabel,
} from '@mui/material';
import EditIcon from '@material-ui/icons/Edit';
import CloseIcon from '@material-ui/icons/Close';
import DoneIcon from '@material-ui/icons/Done';
import WeatherTemplateContext from '../context/weatherTemplateContext';
import { canUpdateCustomList } from '../../customList/utils/permission';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import './weatherTemplateTable.scss';
import NoDataMessage from 'src/modules/shared/components/NoDataMessage/NoDataMessage';
import CustomToolTip from 'src/modules/shared/components/CustomToolTip/CustomToolTip';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
interface WeatherTemplate {
	id: number;
	name: string;
	parameter: {
		rain: boolean;
		wind: number;
		windGust: number;
		temperature_max: number;
		temperature_min: number;
	};
}
const WeatherTemplateTable = (props: any) => {
	const [nameError, setNameError] = useState('');
	const [sorting, setSorting] = useState<any>({
		order: 'asc',
		orderBy: 'name',
	});
	const { getWeatherTemplateList, weatherTemplateList, updateWeatherTemplate } =
		useContext(WeatherTemplateContext);
	const { state } = useContext(stateContext);
	const {
		handleRainCheckboxChange,
		handleValueChange,
		editedWeatherTemplateData,
		setEditedWeatherTemplateData,
		handleUpdateButtonClick,
	} = props;
	const noDataMessage = 'No Data Available';

	const handleSortIconClick = async (property: string) => {
		const isAsc = sorting.orderBy === property && sorting.order === 'asc';
		const newOrder = isAsc ? 'desc' : 'asc';
		setSorting({ order: newOrder, orderBy: property });
		await getWeatherTemplateList('', property, newOrder);
	};

	const editListName = (argIndex: number) => {
		setEditedWeatherTemplateData((prevData: any) => {
			return prevData.map((item: any, index: number) => {
				if (index === argIndex) {
					return { ...item, isEdit: true };
				} else {
					return item;
				}
			});
		});
	};
	const preventInvalidInput = (e: any) => {
		const exceptThisSymbols = ['e', 'E', '+', '-', '.'];
		if (exceptThisSymbols.includes(e.key)) {
			e.preventDefault();
			return false;
		}
	};
	const handleCloseEditAndSave = (argIndex: any) => {
		if (editedWeatherTemplateData[argIndex].name.trim() === '') {
			setNameError('Name cannot be empty.');
		} else {
			setNameError('');
			handleUpdateButtonClick();
			setEditedWeatherTemplateData((prevData: any) => {
				return prevData.map((item: any, index: number) => {
					if (index === argIndex) {
						return { ...item, isEdit: false };
					} else {
						return item;
					}
				});
			});
		}
	};
	const handleClose = (index: any) => {
		setEditedWeatherTemplateData((prevData: any) => {
			return prevData.map((item: any, currentIndex: number) => {
				if (currentIndex === index) {
					return {
						...item,
						isEdit: false,
						name: weatherTemplateList[index].name,
					};
				} else {
					return item;
				}
			});
		});
		setNameError('');
	};

	return (
		<div>
			{editedWeatherTemplateData && editedWeatherTemplateData.length > 0 ? (
				<TableContainer
					component={Paper}
					className="weather-table-template"
				>
					<Table
						stickyHeader
						className="weather-table-template-table"
					>
						<TableHead className="weather-table-template-head">
							<TableRow className="weather-table-template-tablerow">
								<TableCell className="weather-table-template-tableHeader">
									<div className="sort-header">
										Constraint Name
										{sorting.orderBy === 'name' && (
											<div className="sort-icons">
												{sorting.order === 'asc' ? (
													<ArrowUpwardIcon
														className="sort-icon"
														onClick={() => handleSortIconClick('name')}
													/>
												) : (
													<ArrowDownwardIcon
														className="sort-icon"
														onClick={() => handleSortIconClick('name')}
													/>
												)}
											</div>
										)}
									</div>
								</TableCell>

								<TableCell
									align="center"
									className="weather-table-template-tableHeader"
								>
									Wind (mph)
								</TableCell>
								<TableCell
									align="center"
									className="weather-table-template-tableHeader"
								>
									Wind Gust (mph)
								</TableCell>
								<TableCell
									align="center"
									className="weather-table-template-tableHeader"
								>
									Max Temperature (°F)
								</TableCell>
								<TableCell
									align="center"
									className="weather-table-template-tableHeader"
								>
									Min Temperature (°F)
								</TableCell>
								<TableCell
									align="center"
									className="weather-table-template-tableHeader"
								>
									Impacted by Rain/snow
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{editedWeatherTemplateData.map((template: any, index: any) => (
								<TableRow key={template.id}>
									<TableCell className="weather-table-template-constraintname constraintname">
										{template.isEdit ? (
											<>
											<Tooltip
													title={<span style={{fontSize:'1rem'}}>{editedWeatherTemplateData[index]?.name}</span>}
												>
												<TextField
													value={editedWeatherTemplateData[index]?.name}
													onChange={(e) =>
														handleValueChange(
															index,
															'name',
															e.target.value,
															template.name
														)
													}
													error={
														nameError !== '' &&
														editedWeatherTemplateData[index]?.name.trim() === ''
													}
													helperText={
														nameError !== '' &&
														editedWeatherTemplateData[index]?.name.trim() === ''
															? nameError
															: null
													}
													className="weather-table-template-editableTextboxname"
													disabled={!canUpdateCustomList}
													FormHelperTextProps={{
														style: {
															fontSize: '1.3rem',
														},
													}}
												/>
												</Tooltip>
												<IconButton>
													<DoneIcon
														className="weather-table-template-actionicon"
														onClick={() => handleCloseEditAndSave(index)}
													/>
												</IconButton>
												<IconButton>
													<CloseIcon
														className="weather-table-template-actionicon"
														onClick={() => handleClose(index)}
													/>
												</IconButton>
											</>
										) : (
											<div className="weather-table-template-name">
												<CustomToolTip
													element={template?.name}
													textLength={100}
												/>
												<IconButton
													className="weather-table-template-icon"
													onClick={() => editListName(index)}
												>
													<EditIcon className="weather-table-template-editicon" />
												</IconButton>
											</div>
										)}
									</TableCell>
									<TableCell
										align="center"
										className="weather-table-template-editable"
									>
										<TextField
											value={editedWeatherTemplateData[index]?.parameter?.wind}
											onChange={(e) =>
												handleValueChange(
													index,
													'wind',
													e.target.value,
													template.name
												)
											}
											type="number"
											InputProps={{
												inputProps: { min: 0, style: { fontSize: '1.3rem' } },
											}}
											onKeyPress={preventInvalidInput}
											className="weather-table-template-editableTextbox"
											disabled={!canUpdateCustomList}
										/>
									</TableCell>
									<TableCell
										align="center"
										className="weather-table-template-editable"
									>
										<TextField
											value={
												editedWeatherTemplateData[index]?.parameter?.windGust
											}
											onChange={(e) =>
												handleValueChange(
													index,
													'windGust',
													e.target.value,
													template.name
												)
											}
											type="number"
											InputProps={{
												inputProps: { min: 0, style: { fontSize: '1.3rem' } },
											}}
											onKeyPress={preventInvalidInput}
											className="weather-table-template-editableTextbox"
											disabled={!canUpdateCustomList}
										/>
									</TableCell>
									<TableCell
										align="center"
										className="weather-table-template-editable"
									>
										<TextField
											value={
												editedWeatherTemplateData[index]?.parameter
													?.temperature_max
											}
											onChange={(e) =>
												handleValueChange(
													index,
													'temperature_max',
													e.target.value,
													template.name
												)
											}
											type="number"
											InputProps={{
												inputProps: { min: 0, style: { fontSize: '1.3rem' } },
											}}
											onKeyPress={preventInvalidInput}
											className="weather-table-template-editableTextbox"
											disabled={!canUpdateCustomList}
										/>
									</TableCell>
									<TableCell
										align="center"
										className="weather-table-template-editable"
									>
										<TextField
											value={
												editedWeatherTemplateData[index]?.parameter
													?.temperature_min
											}
											onChange={(e) =>
												handleValueChange(
													index,
													'temperature_min',
													e.target.value,
													template.name
												)
											}
											type="number"
											InputProps={{
												inputProps: { min: 0, style: { fontSize: '1.3rem' } },
											}}
											onKeyPress={preventInvalidInput}
											disabled={!canUpdateCustomList}
											className="weather-table-template-editableTextbox"
										/>
									</TableCell>
									<TableCell
										align="center"
										className="weather-table-template-editable"
									>
										<Checkbox
											checked={
												editedWeatherTemplateData[index]?.parameter?.rain
											}
											onChange={() =>
												handleRainCheckboxChange(index, template.name)
											}
											disabled={!canUpdateCustomList}
										/>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			) : !state.isLoading ? (
				<div className="weather-table-template-nodata">
					<NoDataMessage message={noDataMessage} />
				</div>
			) : null}
		</div>
	);
};

export default WeatherTemplateTable;
