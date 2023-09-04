import React, { useContext, useEffect, useState } from 'react';
import WeatherTemplateHeader from './WeatherTemplateHeader';
import CommonHeader from '../../../shared/components/CommonHeader/CommonHeader';
import WeatherTemplateTable from './WeatherTemplateTable';
import WeatherTemplateContext from '../context/weatherTemplateContext';
import { canViewCustomList } from '../../customList/utils/permission';
import NoDataMessage from 'src/modules/shared/components/NoDataMessage/NoDataMessage';
import { useDebounce } from 'src/customhooks/useDebounce';
import './weatherTemplate.scss';

const WeatherTemplate = () => {
	const { getWeatherTemplateList, weatherTemplateList, updateWeatherTemplate } =
		useContext(WeatherTemplateContext);
	const [searchName, setSearchName] = useState('');
	const debounceName = useDebounce(searchName, 300);
	const [editedWeatherTemplateData, setEditedWeatherTemplateData] =
		useState<any>([]);
	const [modifiedData, setModifiedData] = useState<number[]>([]);
	useEffect(() => {
		getWeatherTemplateList(debounceName);
	}, [debounceName]);
	useEffect(() => {
		setEditedWeatherTemplateData(
			weatherTemplateList?.map((template: any) => ({
				...template,
				isEdit: false,
			})) || []
		);
	}, [weatherTemplateList]);
	const headerInfo = {
		name: 'Weather Template',
		description: '',
	};
	const noPermissionMessage =
		"You don't have permission to view the Weather templates.";
	const handleRainCheckboxChange = (index: number, name: string) => {
		setEditedWeatherTemplateData((prevData: any) => {
			const updatedData = [...prevData];
			updatedData[index] = {
				...updatedData[index],
				parameter: {
					...updatedData[index]?.parameter,
					rain: !updatedData[index]?.parameter?.rain,
				},
			};
			return updatedData;
		});

		// Tracking the modified indexes to only send the modified data to the api
		if (!modifiedData.includes(index)) {
			setModifiedData((prevModifiedData) => [...prevModifiedData, index]);
		}
	};

	const handleValueChange = (index: number, parameter: string, value: any) => {
		setEditedWeatherTemplateData((prevData: any) => {
			const updatedData = [...prevData];
			const templateToUpdate = updatedData[index];
			if (parameter === 'name') {
				templateToUpdate.name = value;
			} else {
				templateToUpdate.parameter = {
					...templateToUpdate.parameter,
					[parameter]: value,
				};
			}
			updatedData[index] = templateToUpdate;
			return updatedData;
		});

		if (!modifiedData.includes(index)) {
			setModifiedData((prevModifiedData) => [...prevModifiedData, index]);
		}
	};

	const handleUpdateButtonClick = async () => {
		const editedData = modifiedData.map(
			(item) => editedWeatherTemplateData[item]
		);
		if (editedData && editedData?.length) {
			await updateWeatherTemplate(editedData);
			setModifiedData([]);
		}
	};

	return (
		<>
			{canViewCustomList ? (
				<div className="weather-template">
					<CommonHeader headerInfo={headerInfo} />
					<WeatherTemplateHeader
						searchName={searchName}
						setSearchName={setSearchName}
						handleUpdateButtonClick={handleUpdateButtonClick}
						disabled={modifiedData.length === 0}
					/>
					<WeatherTemplateTable
						setEditedWeatherTemplateData={setEditedWeatherTemplateData}
						handleRainCheckboxChange={handleRainCheckboxChange}
						handleValueChange={handleValueChange}
						editedWeatherTemplateData={editedWeatherTemplateData}
						handleUpdateButtonClick={handleUpdateButtonClick}
					/>
				</div>
			) : (
				<NoDataMessage message={noPermissionMessage} />
			)}
		</>
	);
};

export default WeatherTemplate;
