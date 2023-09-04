import { Button, Typography } from '@material-ui/core';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import React, { useContext, useEffect, useState } from 'react';
import TextFieldCustom from 'src/modules/dynamicScheduling/components/TextFieldCustom/TextFieldCustom';
import {
	GET_TENANT_PASSWORD_CONFIGURATION,
	UPDATE_PASSWORD_CONFIGURATION,
} from '../../../graphql/queries';
import { client } from 'src/services/graphql';
import {
	decodeExchangeToken,
	getExchangeToken,
} from 'src/services/authservice';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import Notification, {
	AlertTypes,
} from '../../../../../shared/components/Toaster/Toaster';
import './passwordconfigure.scss';
import CloseButton from '../components/CloseButton';
import axios from 'axios';

interface PasswordConfigureProps {
	open?: boolean;
	handleCloseModal: () => void;
}
export const PasswordConfigure: React.FC<PasswordConfigureProps> = ({
	open = false,
	handleCloseModal,
}) => {
	const [passwordConfiguration, setPasswordConfiguration] = useState<any>({
		minLength: 8,
		maxLength: 12,
		minUpperCase: 0,
		minNumeric: 0,
		minSpecialChar: 0,
	});
	const [error, setError] = useState({
		minLengthError: '',
		maxLengthError: '',
		minUpperCaseError: '',
		minNumericError: '',
		minSpecialCharError: '',
		totalCountError: '',
	});
	const [loading, setIsLoading] = useState(false);
	const {
		state: { dashboardType, selectedProjectToken},
		dispatch,
	} = useContext(stateContext) || {};
	useEffect(() => {
		getPasswordConfiguration();
	}, [selectedProjectToken]);

	const getPasswordConfiguration = async () => {
		try {
			const token = getExchangeToken();
			const AUTH_URL = process.env['REACT_APP_ENVIRONMENT'];
			const { tenantId } = decodeExchangeToken();
			const response = await axios.post(
				`https://authentication.service.${AUTH_URL}.slate.ai/V1/getPasswordFormat`,
				{ tenantId },
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			const responseData = response?.data.success?.Data.passwordFormat;
			setPasswordConfiguration(responseData);
		} catch (err) {
			console.log('error while fetching the password configuration', err);
		}
	};
	const updatePassword = async (passwordFormat: any) => {
		try {
			setIsLoading(true);
			const { tenantId } = decodeExchangeToken();
			const updatePasswordConfig = await client.mutate({
				mutation: UPDATE_PASSWORD_CONFIGURATION,
				variables: {
					tenantId,
					passwordFormat,
				},
				fetchPolicy: 'network-only',
				context: {
					role: 'updateTenantAssociationRole',
				},
			});
			Notification.sendNotification('Updated successfully', AlertTypes.success);
			setIsLoading(false);
		} catch (err) {
			setIsLoading(false);
			Notification.sendNotification(
				'Error occurred while updating the password configuration',
				AlertTypes.warn
			);
			console.log('error in updating password', err);
		}
	};
	const validateTotalCount = (updatedData: any) => {
		const { minNumeric, minSpecialChar, minUpperCase, maxLength } = updatedData;
		const parsedMinNumeric = parseInt(minNumeric) || 0;
		const parsedMinSpecialChar = parseInt(minSpecialChar) || 0;
		const parsedMinUpperCase = parseInt(minUpperCase) || 0;
		const totalCount =
			parsedMinNumeric + parsedMinSpecialChar + parsedMinUpperCase;

		if (totalCount > maxLength) {
			setError({
				...error,
				totalCountError:
					'Maximum length of password cannot exceed sum of individual criteria below',
			});
		} else {
			setError({ ...error, totalCountError: '' });
		}
	};

	const handleChangePassword = (e: any) => {
		const { name, value } = e.target;
		const updatedData = { ...passwordConfiguration, [name]: value };
		if (
			['minNumeric', 'minSpecialChar', 'minUpperCase', 'maxLength'].includes(
				name
			)
		) {
			validateTotalCount(updatedData);
		}
		// updating state with new password config
		setPasswordConfiguration(updatedData);
		switch (name) {
			case 'minLength':
				if (parseInt(e.target.value) > parseInt(updatedData.maxLength)) {
					setError({
						...error,
						minLengthError: `Min Length cannot be more than maxLength`,
					});
				} else if (parseInt(e.target.value) < 6 || e.target.value.trim() < 6) {
					setError({
						...error,
						minLengthError: 'Min Length cannot be less than 6',
					});
				} else {
					setError({ ...error, minLengthError: '', maxLengthError: '' });
				}
				break;

			case 'maxLength':
				if (parseInt(e.target.value) < parseInt(updatedData.minLength)) {
					setError({
						...error,
						maxLengthError: 'cannot be less than minLength',
					});
				} else if (e.target.value.trim() < 1) {
					setError((prevError) => ({
						...prevError,
						maxLengthError: 'Cannot be empty',
					}));
				} else if (e.target.value > 50) {
					setError((prevError) => ({
						...prevError,
						maxLengthError: 'Cannot exceed 50',
					}));
				} else {
					setError((prevError) => ({
						...prevError,
						maxLengthError: '',
						minLengthError: '',
					}));
				}
				break;

			case 'minUpperCase':
				if (e.target.value.trim() == '' || e.target.value < 1) {
					setPasswordConfiguration({
						...passwordConfiguration,
						minUpperCase: 1,
					});
				}
				break;

			case 'minNumeric':
				if (e.target.value < 1) {
					setPasswordConfiguration({ ...passwordConfiguration, minNumeric: 1 });
				}
				break;

			case 'minSpecialChar':
				if (e.target.value < 1) {
					setPasswordConfiguration({
						...passwordConfiguration,
						minSpecialChar: 1,
					});
				}
				break;

			default:
				break;
		}
	};
	const onKeyDown = (e: any) => {
		const restrictedKeys = [45, 101, 46, 43];

		if (restrictedKeys.includes(e.charCode)) {
			e.preventDefault();
			return false;
		}
	};
	const updatePasswordConfig = async () => {
		await updatePassword(passwordConfiguration);
	};

	const isUpdateDisabled =
		error.minLengthError !== '' ||
		error.maxLengthError !== '' ||
		error.minUpperCaseError !== '' ||
		error.minNumericError !== '' ||
		error.minSpecialCharError !== '' ||
		error.totalCountError !== '' ||
		passwordConfiguration.minLength == ''||
		passwordConfiguration.minLength < 6;

	return (
		<Modal
			keepMounted={false}
			open={open}
			aria-labelledby="modal-modal-title"
			aria-describedby="modal-modal-description"
		>
			<Box
				className={
					dashboardType == 'slate2.0'
						? 'password-configuration-container v2-password-configuration'
						: 'password-configuration-container'
				}
			>
				{loading && (
					<div className="password-configuration-loader-overlay">
						<CircularProgress />
					</div>
				)}
				<div
					className={
						dashboardType == 'slate2.0'
							? 'password-configuration-header v2-password-configuration-header'
							: 'password-configuration-header'
					}
				>
					<h2>Password Configuration</h2>
					<CloseButton
						onHandleClose={handleCloseModal}
						color={dashboardType == 'slate2.0' ? 'white' : ''}
					/>
				</div>
				<div className="password-configuration-body">
					<div className="password-configuration-input">
						<Typography className="password-configuration-label">
							Minimum Length
						</Typography>
						<div className="password-configuration-input-box">
							<TextFieldCustom
								type="number"
								name="minLength"
								min={6}
								placeholder="Enter min Length"
								error={error.minLengthError}
								value={passwordConfiguration.minLength}
								onChange={(e: any) => {
									handleChangePassword(e);
								}}
								onKeyDown={onKeyDown}
								errorColor={true}
								errorIconVisible={true}
								className="password-configuration-input-container"
							/>
						</div>
					</div>
					<div className="password-configuration-input">
						<Typography className="password-configuration-label">
							Maximum Length
						</Typography>
						<div className="password-configuration-input-box">
							<TextFieldCustom
								type="number"
								name="maxLength"
								min={0}
								placeholder="Enter max Length"
								error={error.maxLengthError || error.totalCountError}
								value={passwordConfiguration.maxLength}
								onChange={(e: any) => {
									handleChangePassword(e);
								}}
								onKeyDown={onKeyDown}
								errorColor={true}
								errorIconVisible={true}
								className="password-configuration-input-container"
							/>
						</div>
					</div>
					<div className="password-configuration-input">
						<Typography className="password-configuration-label">
							Mandatory number of upper case characters
						</Typography>
						<div className="password-configuration-input-box">
							<TextFieldCustom
								type="number"
								name="minUpperCase"
								min={0}
								placeholder="Enter min number of upperCase character"
								error={error.minUpperCaseError}
								value={passwordConfiguration.minUpperCase}
								onChange={(e: any) => {
									handleChangePassword(e);
								}}
								onKeyDown={onKeyDown}
								errorColor={true}
								errorIconVisible={true}
								className="password-configuration-input-container"
							/>
						</div>
					</div>
					<div className="password-configuration-input">
						<Typography className="password-configuration-label">
							Mandatory number of numeric characters
						</Typography>
						<div className="password-configuration-input-box">
							<TextFieldCustom
								type="number"
								name="minNumeric"
								min={0}
								placeholder="Enter min number of Numeric character"
								error={error.minNumericError}
								value={passwordConfiguration.minNumeric}
								onChange={(e: any) => {
									handleChangePassword(e);
								}}
								onKeyDown={onKeyDown}
								errorColor={true}
								errorIconVisible={true}
								className="password-configuration-input-container"
							/>
						</div>
					</div>
					<div className="password-configuration-input">
						<Typography className="password-configuration-label">
							Mandatory number of special case characters
						</Typography>
						<div className="password-configuration-input-box">
							<TextFieldCustom
								type="number"
								name="minSpecialChar"
								min={0}
								placeholder="Enter min Special Character"
								error={error.minSpecialCharError}
								value={passwordConfiguration.minSpecialChar}
								onChange={(e: any) => {
									handleChangePassword(e);
								}}
								onKeyDown={onKeyDown}
								errorColor={true}
								errorIconVisible={true}
								className="password-configuration-input-container"
							/>
						</div>
					</div>
					{/* <div className="v2-password-configuration-msg">
						<p>*At least 6 characters and cannot exceed 50 characters</p>
					</div> */}
				</div>
				<div
					className={
						dashboardType == 'slate2.0'
							? 'password-configuration-footer v2-password-configuration-footer'
							: 'password-configuration-footer'
					}
				>
					<Button
						className="v2-password-configuration-btn"
						variant="outlined"
						onClick={updatePasswordConfig}
						disabled={isUpdateDisabled}
					>
						Update
					</Button>
				</div>
			</Box>
		</Modal>
	);
};
