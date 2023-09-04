import { IconButton } from "@material-ui/core";
import moment from "moment";
import { ReactElement, useEffect, useRef, useState } from "react";
import {
  ArrowBackIosRounded,
  ArrowForwardIosRounded,
} from "@material-ui/icons";
import "./DateRangeSlider.scss";

function DateRangeSlider({
  startDate,
  selectedDate,
  handleDateChange,
  uploadDates,
}: any): ReactElement {
  const [listOfDates, setListOfDates]: any = useState([]);
  const scrollRef = useRef<HTMLInputElement>(null);
  const fieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fieldRef?.current &&
      fieldRef.current.scrollIntoView({
        behavior: "auto",
      });
  }, [listOfDates, startDate, selectedDate]);

  useEffect(() => {
    const getDaysBetweenDates = function (startDate: any, endDate: any) {
      const now = startDate.clone();
      const dates = [];
      while (now.isSameOrBefore(endDate)) {
        dates.push(now.format("DD/MMM/YYYY ddd"));
        now.add(1, "days");
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

  return (
    <div className="dateRangeSlider">
      <IconButton onClick={() => handleScroll(-(window.innerWidth * 0.8))}>
        <ArrowBackIosRounded />
      </IconButton>
      <div ref={scrollRef} className="dateRangeSlider__scrollContainer">
        {listOfDates.map((date: any, i: number) => (
          <div
            id={date}
            key={i}
            className="dateRangeSlider__scrollContainer__dateList"
            ref={
              date.includes(moment(selectedDate).format("DD/MMM/YYYY")) ||
              date.includes(moment().format("DD/MMM/YYYY"))
                ? fieldRef
                : null
            }
          >
            <div
              className={
                date.split("/")[0] === "01" ||
                (date.includes(moment(selectedDate).format("DD/MMM/YYYY")) &&
                  date.split("/")[0] !== "02")
                  ? "dateRangeSlider__scrollContainer__monthAndYearLabel"
                  : "dateRangeSlider__scrollContainer__monthAndYearLabelHide"
              }
            >
              <div className="dateRangeSlider__scrollContainer__monthAndYearLabel__monthStyle">
                {date.split("/")[1]}{" "}
              </div>
              <div className="dateRangeSlider__scrollContainer__monthAndYearLabel__yearStyle">
                {date.split("/")[2].split(" ")[0]}
              </div>
            </div>
            <div
              className={
                uploadDates.includes(date) &&
                !date.includes(moment(selectedDate).format("DD/MMM/YYYY"))
                  ? "dateRangeSlider__scrollContainer__uploadedDatesMark"
                  : "dateRangeSlider__scrollContainer__uploadedDatesMarkHide"
              }
            ></div>
            <div
              className={
                date.includes(moment(selectedDate).format("DD/MMM/YYYY"))
                  ? "dateRangeSlider__scrollContainer__dateList__dates" +
                    " dateRangeSlider__scrollContainer__dateList__dates dateRangeSlider__scrollContainer__dateList__dates__selectedDate"
                  : date.includes(moment().format("DD/MMM/YYYY"))
                  ? "dateRangeSlider__scrollContainer__dateList__dates" +
                    " dateRangeSlider__scrollContainer__dateList__dates dateRangeSlider__scrollContainer__dateList__dates__currentDate"
                  : "dateRangeSlider__scrollContainer__dateList__dates"
              }
              onClick={() => {
                handleDateChange(new Date(date.split(" ")[0]));
              }}
            >
              <div className="dateRangeSlider__scrollContainer__dateList__dates__dayAndDateStyle">
                {date.split(" ")[1]}
              </div>
              <div className="dateRangeSlider__scrollContainer__dateList__dates__dayAndDateStyle">
                {date.split("/")[0]}
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
        <ArrowForwardIosRounded />
      </IconButton>
    </div>
  );
}

export default DateRangeSlider;
