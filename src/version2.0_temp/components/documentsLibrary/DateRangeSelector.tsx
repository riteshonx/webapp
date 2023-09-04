import React, { useRef, useState, useEffect } from 'react';
import { IconButton } from '@material-ui/core';
import moment from 'moment';
import {
	ArrowBackIosRounded,
	ArrowForwardIosRounded,
} from '@material-ui/icons';
import './daterangeselector.scss';

export default function DateRangeSelector(props: any) {
	const { startDate, selectedDate, handleDateChange,uploadDates } = props;

	const [listOfDates, setListOfDates]: any = useState([]);
	const scrollRef = useRef<HTMLInputElement>(null);
	const fieldRef = useRef<HTMLInputElement>(null);
	useEffect(() => {
		fieldRef?.current &&
			fieldRef.current.scrollIntoView({
				behavior: 'auto',
			});
	}, [listOfDates, startDate, selectedDate]);
	useEffect(() => {
		const getDaysBetweenDates = function (startDate: any, endDate: any) {
			const now = startDate.clone();
			const dates = [];
			while (now.isSameOrBefore(endDate)) {
				dates.push(now.format('DD/MMM/YYYY ddd'));
				now.add(1, 'days');
			}
			return dates;
		};
		const endDate: any = moment();
		const dateList = getDaysBetweenDates(moment(startDate), endDate);
		setListOfDates(dateList);
	}, []);
	const handleScroll = (scrollType: any) => {
		if (scrollRef?.current) {
			scrollRef?.current.scrollTo(
				scrollRef?.current?.scrollLeft + scrollType,
				0
			);
		}
	};
   const getMonths = (date: string) => {
    const monthAndYear = date.split('/')[1];
    return monthAndYear;
  };

  const getYears = (date: string) => {
    const year = date.split('/')[2].split(' ')[0];
    return year;
  };
	return (
		<div className="v2-dateRangeSlider">
			<IconButton onClick={() => handleScroll(-(window.innerWidth * 0.8))}>
				<ArrowBackIosRounded style={{ color: 'white' }} />
			</IconButton>
			<div
				ref={scrollRef}
				className="v2-dateRangeSlider-scrollContainer"
			>
				{listOfDates.map((date: any, i: number) => (
					<div
						id={date}
						key={i}
						className="v2-dateRangeSlider-scrollContainer-dateList"
						ref={
							date.includes(moment(selectedDate).format('DD/MMM/YYYY')) ||
							date.includes(moment().format('DD/MMM/YYYY'))
								? fieldRef
								: null
						}
					>
						<div
							className={
								date.split('/')[0] === '01' ||
								(date.includes(moment(selectedDate).format('DD/MMM/YYYY')) &&
									date.split('/')[0] !== '02')
									? 'v2-dateRangeSlider-scrollContainer-monthAndYearLabel'
									: 'v2-dateRangeSlider-scrollContainer-monthAndYearLabelHide'
							}
						>
							<div className="v2-dateRangeSlider-scrollContainer-monthAndYearLabel-monthStyle">
								{getMonths(date)}{' '}
							</div>
							<div className="v2-dateRangeSlider-scrollContainer-monthAndYearLabel-yearStyle">
								{getYears(date)}
							</div>
						</div>
						<div
						className={
						uploadDates &&  uploadDates.includes(date) &&
						  !date.includes(moment(selectedDate).format("DD/MMM/YYYY"))
						    ? "v2-dateRangeSlider-scrollContainer-uploadedDatesMark"
						    : "v2-dateRangeSlider-scrollContainer-uploadedDatesMarkHide"
						}
						></div>
						<div
							className={
								date.includes(moment(selectedDate).format('DD/MMM/YYYY'))
									? 'v2-dateRangeSlider-scrollContainer-dateList-dates' +
									  ' v2-dateRangeSlider-scrollContainer-dateList-dates v2-dateRangeSlider-scrollContainer-dateList-dates-selectedDate'
									: date.includes(moment().format('DD/MMM/YYYY'))
									? 'v2-dateRangeSlider-scrollContainer-dateList-dates' +
									  'v2- dateRangeSlider-scrollContainer-dateList-dates v2-dateRangeSlider-scrollContainer-dateList-dates-currentDate'
									: 'v2-dateRangeSlider-scrollContainer-dateList-dates'
							}
							onClick={() => {
								handleDateChange(new Date(date.split(' ')[0]));
							}}
						>
							<div className="v2-dateRangeSlider-scrollContainer-dateList-dates-dayAndDateStyle">
								{date.split(' ')[1]}
							</div>
							<div className="v2-dateRangeSlider-scrollContainer-dateList-dates-dayAndDateStyle">
								{date.split('/')[0]}
							</div>
						</div>
					</div>
				))}
			</div>
			<IconButton
				onClick={() => {
					handleScroll(window.innerWidth * 0.8);
				}}
			>
				<ArrowForwardIosRounded style={{ color: 'white' }} />
			</IconButton>
		</div>
	);
}
