import DateFnsUtils from '@date-io/date-fns';
import { Button, MenuItem } from '@material-ui/core';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import DeleteIcon from '@material-ui/icons/Delete';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import Holidays from 'date-holidays';
import React, {
  Fragment,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { updateTenantCalendar } from '../../../permission/scheduling';
import CalendarWithoutYear from '../../../components/CalendarWithoutYear/CalendarWithoutYear';
import CalendarContext from '../../../context/calendar/calendarContext';
import './HolidayList.scss';
import TextField from '@material-ui/core/TextField';

const TextFieldComponent = (props: any) => {
  return <TextField {...props} disabled={true} />
}


const HolidayList = (props: any) => {
  const calendarContext = useContext(CalendarContext);
  const { currentCalendar, getHolidayListByYear, setHolidayList } =
    calendarContext;
  // const [countryList] = useState(new Holidays().getCountries());
  const countryList: any = {
    AU: 'Holidays in Australia',
    CA: 'Holidays in Canada',
    GB: 'Holidays in United Kingdom',
    US: 'Holidays in USA',
  };

  const [HolidayDetails, setHolidayDetails] = useState({
    countryId: '',
    year: new Date(),
    list: [] as any,
  });
  const [disableAddHoliday, setDisableAddHoliday] = useState(true);
  const [deletion, setDeletion] = useState(false);
  const [yearList, setYearList] = useState([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const { countryId, year, list } = HolidayDetails;
  const [hasCountryId, sethasCountryId] = useState(false);
  const [isCountrySelected, setIsCountrySelected] = useState(true);
  const holidayListRef = useRef<HTMLDivElement>(null);

  const executeHolidayListScroll = () =>
    null !== holidayListRef.current
      ? holidayListRef.current.scrollIntoView()
      : null;

  useEffect(() => {
    if (props.calendarAction == 'edit' || props.calendarAction == 'duplicate') {
      if (currentCalendar.holidayList && currentCalendar.holidayList.length > 0) {
        sethasCountryId(true);
      } else {
        sethasCountryId(false);
      }
    }

    if (currentCalendar) {
      //if()
      //  const tempList = getHolidayListByYear(year.getFullYear().toString());
      let countryId = '';

      if (currentCalendar.holidayList && currentCalendar.holidayList.length > 0) {
        countryId = currentCalendar.holidayList[0].countryId;
      }

      setHolidayDetails({
        ...HolidayDetails,
        list: JSON.parse(JSON.stringify(currentCalendar.holidayList)) || [],
        countryId: countryId,
      });
    } else {
      setHolidayDetails({
        ...HolidayDetails,
        list: [],
      });
    }

    const yearListTemp: any = [];
    for (let i = currentYear; i < currentYear + 3; i++) {
      yearListTemp.push(i);
    }
    setYearList(yearListTemp);
  }, []);

  useEffect(() => {
    updateHolidayList();
    if (list.length != 0) {
      setDisableAddHoliday(
        !list.every((d: any) => {
          return d.holidayName.length != 0 && d.date != null;
        })
      );
    } else {
      if(isCountrySelected) {
        props.disableButton(true);
      } else {
        props.disableButton(false);
        setDisableAddHoliday(false);
      }
    }
  }, [list]);

  useEffect(() => {
    if(deletion ==  false) {
      props.disableButton(disableAddHoliday);
    }
    else {
      props.disableButton(disableAddHoliday, true);
    }
  }, [disableAddHoliday]);

  const onClickYearHandler = (e: any) => {
    setCurrentYear(e.target.value);
  //  let tempholiDayList = getHolidayListByYear(e.target.value);
    let list: any = [];


    const retainHoliday =  HolidayDetails.list.findIndex(
        (elem: any) => new Date(elem.date).getFullYear() === e.target.value
    );

    list =
      HolidayDetails.countryId.length > 0 && retainHoliday == -1 
        ? new Holidays(HolidayDetails.countryId).getHolidays(e.target.value)
        : [];

    for (let i = 0; i < HolidayDetails.list.length; i++) {
      list.push(HolidayDetails.list[i]);
    }

    list.forEach((e: any) => {
      if (e.name) {
        e.holidayName = e.name;
      }
    });

    const listTemp = list.filter(
      (ele: any, ind: any) =>
        ind ===
        list.findIndex(
          (elem: any) => elem.date === ele.date
        )
    );

    setHolidayDetails({
      ...HolidayDetails,
      year: e.target.value,
      list: listTemp,
    });
  };

  const onClickCountryNameHandler = (event: any) => {
    setCurrentYear(new Date().getFullYear());
    if(event.target.value == "") {
      setIsCountrySelected(false);
    } else{
      setIsCountrySelected(true);
    }
    const list = new Holidays(event.target.value).getHolidays().map((h) => {
      return {
        ...h,
        countryId: event.target.value,
      };
    });

    list.forEach((e: any) => {
      e.holidayName = e.name;
    });

    setHolidayDetails({
      ...HolidayDetails,
      [event.target.name]: event.target.value,
      list: list,
    });
  };

  const onClickDateHandler = (h: any, date: Date | null) => {
    h.date = date;
    if(h.date == "Invalid Date") {
      props.disableButton(true);
      return;
    }

    setHolidayDetails({ ...HolidayDetails, list });
    // /setDeletion(false);
    updateHolidayList();
    setDisableAddHoliday(
      !list.every((d: any) => {
        return d.holidayName.length != 0 && d.date != null;
      })
    );
  };

  const onChangeNameHandler = (h: any, event: any) => {
    h.holidayName = event.target.value;
    h.name = event.target.value;
    setDeletion(true);
    setHolidayDetails({ ...HolidayDetails, list });
    updateHolidayList();

    setDisableAddHoliday(
      !list.every((d: any) => {
        return d.holidayName.length != 0 && d.date != null;
      })
    );
  };

  const onDeleteHandler = (holiday: any) => {
    setHolidayDetails({
      ...HolidayDetails,
      list: list.filter((e: any) => holiday.date !== e.date),
    });
    setDeletion(true);
  };

  // update all details in holiday list
  const updateHolidayList = () => {

    const tempList = HolidayDetails.list.map((h: any) => {
      return {
        countryId: countryId,
        holidayName: h.holidayName,
        date: h.date,
        year: new Date(h.date).getFullYear(),
      };
    });

    let t: any = [];
    let count = 0;
    if (props.calendarAction !== 'duplicate' &&
      props.calendarAction !== 'edit'
    ) {
      t = currentCalendar
        ? [...currentCalendar.holidayList, ...tempList]
        : tempList;

        for(let i = 0; i < tempList.length; i++) {
          if(tempList[i].holidayName == "" || tempList[i].date == null) {
            props.disableButton(true);
            count = 1;
            break;
          }
        }

      if(count == 0) {
        props.disableButton(false);
      }
    } else {
      t = tempList;

      for(let i = 0; i < tempList.length; i++) {
        if(tempList[i].holidayName == "" || tempList[i].date == null) {
          props.disableButton(true);
          break;
        }
      }
    }

    const tp = t.filter(
      (ele: any, ind: any) =>
        ind ===
        t.findIndex(
          (elem: any) => elem.date === ele.date && elem.year === ele.year
        )
    );

    if(t.length == 0 && isCountrySelected) {
      setDisableAddHoliday(false);
      props.disableButton(true);
    } else {
      props.disableButton(false, deletion);
     // setDisableAddHoliday(true);
    }

    // setHolidayDetails({
    //   ...HolidayDetails,
    //   list: tp,
    // });

    tp.forEach((element: any) => {
      if(element.holidayName == "" ||  element.date == null) {
        props.disableButton(true);
      }
    });
        
    t = Array.from(new Set(tp));

    setHolidayList(t);
  };

  const addHoliday = () => {
  //  const  temp = new Date(new Date().setFullYear(currentYear));
    setHolidayDetails({
      ...HolidayDetails,
      list: [...list, { holidayName: '', year: '', date: new Date(new Date(new Date(new Date().setFullYear(currentYear))).setDate(new Date(new Date(new Date().setFullYear(currentYear))).getDate() +1)), countryId: '' }],
    });
    setTimeout(() => {
      executeHolidayListScroll();
    }, 500);
  };

  return (
    <Fragment>
      <InputLabel shrink> Holiday List 
        {list && list.filter((item: any) => (new Date(item.date).getFullYear() == currentYear)).length>0?(
          <span title={'No of Holidays in ' + currentYear}>
             &nbsp;({list.filter((item: any) => (new Date(item.date).getFullYear() == currentYear)).length})
              </span>
        ):("")}
      </InputLabel>
      <div className="create-template__content-right__calendar">
        <Select
          id="demo-simple-select-placeholder-label"
          value={countryId}
          className="create-template__content-right__calendar__country"
          onChange={onClickCountryNameHandler}
          name="countryId"
          style={{ background: '#f3f3f3', width: '320px', marginRight: '5px' }}
          displayEmpty
          disabled={
            (props.calendarAction !== 'edit' &&
              props.calendarAction !== 'duplicate') ||
            !hasCountryId
              ? false
              : true
          }
        >
          <MenuItem value="">Select a country</MenuItem>
          {countryList
            ? Object.keys(countryList).map((key) => {
                return (
                  <MenuItem key={key} value={key}>
                    {countryList[key]}
                  </MenuItem>
                );
              })
            : null}
        </Select>

        <Select
          id="demo-simple-select-placeholder-label"
          value={currentYear}
          className={`create-template__content-right__calendar__country ${ !updateTenantCalendar ? 
            'create-template__content-right__calendar-list-table__delete__disabled' : '' }`}
          onChange={onClickYearHandler}
          name="currentYear"
          style={{ background: '#f3f3f3', width: '100px' }}
          defaultValue={currentYear}
        >
          {yearList.map((key: any) => (
            <MenuItem key={key} value={key}>
              {key}
            </MenuItem>
          ))}
        </Select>
      </div>

      <div className="create-template__content-right__calendar-list">
        <table className=" create-template__content-right__calendar-list-table">
          <tbody>
            {list && 
              list.map((item: any, index: any) => ( 
                ((new Date(item.date).getFullYear() == currentYear || item.date == null || item.date == "Invalid Date") &&
                <tr key={index}>
                  <td
                    className="
                  create-template__content-right__calendar-list-table__name u-margin-left-small"
                    data-testid="calendarName"
                  >
                    <input
                      type="text"
                      id={item.holidayName}
                      name="name"
                      className={`input create-template__content-right__calendar-list-table__name__holidayName ${(new Date(item.date) <= new Date() && item.date != null) || !updateTenantCalendar? 'create-template__content-right__calendar-list-table__delete__disabled' : '' }`}
                      placeholder="Enter a Holiday"
                      value={item.holidayName}
                      onChange={(e) => {
                        onChangeNameHandler(item, e);
                      }}
                    />
                  </td>
                  <td className=" create-template__content-right__calendar-list-table__calendar">
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                      <CalendarWithoutYear
                        data_testid="date"
                        className={`create-template__content-right__calendar__year ${(new Date(item.date) <= new Date() && item.date != null) || !updateTenantCalendar? 'create-template__content-right__calendar-list-table__delete__disabled' : '' }`}
                        views={['date']}
                        value={item.date}
                        onChange={(date: any) => {
                          onClickDateHandler(item, date);
                        }}
                        format="dd MMM yyyy"
                        name="date"
                        maxDate={new Date(new Date().getFullYear() + 2, 11, 31)}
                        minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
                        disabled={(new Date(item.date) <= new Date() &&  item.date != null) || !updateTenantCalendar }
                        minDateMessage={''}
                        placeholder="Pick date"
                        KeyboardButtonProps={{
                          'aria-label': 'change date',
                        }}
                        TextFieldComponent={TextFieldComponent}
                      />

                      {/* <KeyboardDatePicker
                        data-testid="date"
                        className="create-template__content-right__calendar__year"
                        views={['date']}
                        value={item.date}
                        onChange={(date) => {
                          onClickDateHandler(item, date);
                        }}
                        format="dd MMM yyyy"
                        name="date"
                        maxDate={new Date(new Date().getFullYear() + 2, 11, 31)}
                        minDate={new Date()}
                        minDateMessage={''}
                        placeholder="Pick date"
                        KeyboardButtonProps={{
                          'aria-label': 'change date',
                        }}
                      />*/}
                    </MuiPickersUtilsProvider>
                  </td>
                  <td className=" create-template__content-right__calendar-list-table__delete">
                    <DeleteIcon
                      data-testid={`delete-task-${index}`}
                      className={`calendar-grid-view__card__info__action__icon ${(new Date(item.date) <= new Date() &&  item.date != null) || !updateTenantCalendar? 'create-template__content-right__calendar-list-table__delete__disabled' : '' }`}
                      onClick={() => onDeleteHandler(item)}
                    />
                  </td>
                </tr>)
              ))}
          </tbody>
        </table>
        <div ref={holidayListRef}></div>
      </div>
      <Button
        onClick={addHoliday}
        className="btn-text"
        disabled={disableAddHoliday}
      >
        <span className="tags__action__btn__text">+Add a Holiday</span>
      </Button>
    </Fragment>
  );
};

export default HolidayList;
