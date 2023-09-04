import React, { useState, useContext, useEffect, useRef } from 'react';
import MomentUtils from '@date-io/moment';
import moment from 'moment';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
// import CloseIcon from '../../assets/images/icons/closeIcon.svg';
import CloseIcon from '../../assets/images/icons/closeIcon.svg';
import {DateRangeSelector,GridViewDocument,ListViewDocument} from './index'
import './documentlibrary.scss';
import { setIsLoading } from 'src/modules/root/context/authentication/action';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import { client } from 'src/services/graphql';
import {
	GET_ALL_DOCUMENTS,
	GET_ALL_UPLOAD_DATES,
} from '../../api/queries/documentQuery';
import Notification, {
	AlertTypes,
} from '../../../modules/shared/components/Toaster/Toaster';
import { postApi } from 'src/services/api';
import ImageCarousel from './ImageCarousel';
export default function DocumentLibrary(props: any) {
	const { dispatch, state }: any = useContext(stateContext);
	const [viewType, setViewType] = useState('grid');
	const [selectedDate, setSelectedDate]: any = useState(null);
	const [pageLimitAndOffset, setPageLimitAndOffset]: any = useState({
		limit: 25,
		offset: 0,
	});
	const [documentResponse, setDocumentResponse] = useState<any>([]);
	const [displayData, setDisplayData] = useState<any>([]);
	const [uploadedDates, setUploadedDates] = useState(null);
	const [carouselFile,setCarouselFile] = useState([]);
	const [openCarousel,setOpenCarousel] = useState(false);
	const fieldRef = useRef<HTMLInputElement>(null);

	const { closeDocumentLibrary } = props;
	const selectedProjectToken = sessionStorage.getItem('ProjectToken');

	//API Call to get the data whenever dates are changed
	useEffect(() => {
		getAllDocuments();
	}, [selectedDate]);

	useEffect(() => {
		selectedProjectToken && getAllUploadDates();
	}, [selectedProjectToken]);

	//get all uploadaded dates to show to on UI
	const getAllUploadDates = async () => {
		try {
			dispatch(setIsLoading(true));
			const documentsResponse = await client.query({
				query: GET_ALL_UPLOAD_DATES,
				fetchPolicy: 'network-only',
				context: {
					role: 'viewDocument',
					token: selectedProjectToken,
				},
			});
			const allDates = documentsResponse?.data?.documents.map((item: any) =>
				moment(item.createdAt).format('DD/MMM/YYYY ddd')
			);

			setUploadedDates(allDates);
		} catch (error: any) {
			dispatch(setIsLoading(false));
			console.log(error);
		}
	};

	// get all documents
	const getAllDocuments = async (pageChange?: boolean) => {
		try {
			dispatch(setIsLoading(true));
			const response = await client.query({
				query: GET_ALL_DOCUMENTS,
				fetchPolicy: 'network-only',
				context: {
					role: 'viewDocument',
					token: selectedProjectToken,
				},
				variables: {
					from: selectedDate
						? moment(selectedDate).startOf('day').format()
						: moment('2018-01-01').startOf('day').format(),
					to: selectedDate
						? moment(selectedDate).endOf('day').format()
						: moment().endOf('day').format(),
					limit: pageLimitAndOffset.limit,
					offset: pageLimitAndOffset.offset,
					qry: `%${''}%`,
				},
			});

			formatData(response);
			setDocumentResponse(response);

			dispatch(setIsLoading(false));
		} catch (err) {
			Notification.sendNotification('failed fetching data', AlertTypes.warn);
			dispatch(setIsLoading(false));
		}
	};

	const formatData = async (documentsResponse: any) => {
		const payload: any = [];
		documentsResponse?.data?.documents?.forEach((item: any) => {
			payload.push({
				fileName: `${item?.name}.${item?.mimeType?.split('/')[1]}`,
				key: item?.fileKey,
				expiresIn: 1000,
			});
		});
		try {
			dispatch(setIsLoading(true));
			const fileUploadResponse = await postApi('V1/S3/downloadLink', payload);
			const temp: any = [];
			documentsResponse?.data?.documents?.forEach((item: any) => {
				const data = fileUploadResponse?.success.find(
					(res: any) => res.key === item?.fileKey
				);
				if (data) {
					temp.push({ ...item, url: data.url });
				}
			});
			setDisplayData(temp);
			dispatch(setIsLoading(false));
		} catch (error) {
			dispatch(setIsLoading(false));
		}
	};
	const handleViewType = (type: string) => {
		setViewType(type);
	};
	const fetchData = () => {
		setPageLimitAndOffset({
			limit: 25,
			offset: pageLimitAndOffset.offset + 25,
		});
	};

	const handleFromDateChange = (date: any) => {
		if (
			moment(date).format('DD MM YY') ===
			moment(selectedDate).format('DD MM YY')
		) {
			setSelectedDate(null);
		} else {
			setSelectedDate(new Date(date));
		}
	};
	const getImageCarouselFile=(file:any)=>{
   setCarouselFile(file)
	 setOpenCarousel(true)
	}
	const closeImageCarousel=()=>{
		setCarouselFile([]);
		setOpenCarousel(false);
}
	return (
		<div className="v2-document-library">
			<div className="v2-document-library-contentbox">
				<div className="v2-document-library-header">
					<div className="v2-document-library-header-title">
						Document library
					</div>
					<div className="v2-document-library-header-rightbox">
						<div className="v2-document-library-header-gallery-icon">
							<GridViewIcon
								className="v2-document-library-header-icons"
								onClick={() => handleViewType('grid')}
							/>
						</div>
						<div className="v2-document-library-header-gallery-icon">
							<ViewListIcon
								className="v2-document-library-header-icons"
								onClick={() => handleViewType('list')}
							/>
						</div>
						<div className="v2-document-library-header-gallery-icon">
							<img
								src={CloseIcon}
								alt="close icon"
								className="v2-document-library-header-icons"
								onClick={() => closeDocumentLibrary()}
							/>
						</div>
					</div>
				</div>

				<DateRangeSelector
					fieldRef={fieldRef}
					startDate={moment('01/01/2018')}
					selectedDate={selectedDate}
					handleDateChange={handleFromDateChange}
					uploadDates={uploadedDates}
				/>
				{viewType == 'grid' ? (
					<GridViewDocument
						documentResponse={documentResponse}
						fetchData={fetchData}
						displayData={displayData}
						getImageCarouselFile={getImageCarouselFile}
					/>
				) : (
					<ListViewDocument
						files={displayData}
						fetchData={fetchData}
						documentResponse={documentResponse}
						getImageCarouselFile={getImageCarouselFile}
					/>
				)}
				{openCarousel && <div className=' v2-document-library-carousel'>
					<div className="v2-document-library-carousel-content">
           <ImageCarousel
					 closeImageCarousel={closeImageCarousel}
					 carouselFile={carouselFile}
					 />

					</div>
					
					
					</div>}
			</div>
		</div>
	);
}
