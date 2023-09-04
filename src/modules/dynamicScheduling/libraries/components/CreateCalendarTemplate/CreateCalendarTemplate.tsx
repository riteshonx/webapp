import { Button } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputLabel from '@material-ui/core/InputLabel';
import {
  createStyles,
  makeStyles,
  Theme,
  useTheme,
} from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useContext, useEffect, useState } from 'react';
import { updateTenantCalendar, viewTenantCalendar } from '../../../permission/scheduling';
import WarningRoundedIcon from '@material-ui/icons/WarningRounded';
import CalendarContext from '../../../context/calendar/calendarContext';
import HolidayList from '../HolidayList/HolidayList';
import './CreateCalendarTemplate.scss';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    selectEmpty: {
      marginTop: '4px',
    },
  })
);
const CreateCalendarTemplate = (props: any) => {
  const classes = useStyles();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));
  const [open, setOpen] = useState(false);
  const [isUniqueCalendarName, setIsUniqueCalendarName] = useState(false);
  const [exceedCalendarName, setIsExceedCalendarName] = useState(false);
  const [hasWorkingHours, setHasWorkingHours] = useState(false);
  const [maxWorkingHoursEntered, setMaxWorkingHoursEntered] = useState(false);
  //  calendar context
  const calendarContext = useContext(CalendarContext);
  const [disableSubmitButton, setDisableSubmitButton] = useState(true);
  const [workingDaysCount, setworkingDaysCount] = useState(0);
  const [editLoadFirstTime, setEditLoadFirstTime] = useState(false);
  const {
    getCalendars,
    createCalendar,
    updateCalendar,
    currentCalendar,
    holidayList,
    setCurrentCalendar,
    calendarAction,
    calendars,
  } = calendarContext;

  const [calendar, setCalendar] = useState({
    calendarName: '',
    description: '',
    workingDays: [],
    holidayList: [],
    isEditable: true,
    workingHours: '00',
  });

  useEffect(() => {
    //getCalendars();
    if (currentCalendar !== null) {
      setCalendar(currentCalendar);
      if (calendarAction === 'duplicate') {
        generateCalendarName(currentCalendar.calendarName);
      }
      setEditLoadFirstTime(true);
      const tempWorkingDays: any[] = [];
      workingDays.forEach((day: any) => {
        tempWorkingDays.push({
          ...day,
          active: currentCalendar.workingDays.includes(day.value),
        });
      });
      setWorkingDays(tempWorkingDays);
      setDisableSubmitButton(false);
      setHasWorkingHours(true);
      setIsUniqueCalendarName(true);
      setMaxWorkingHoursEntered(true);
    } else {
      setCalendar({
        calendarName: '',
        description: '',
        workingDays: [],
        holidayList: [],
        isEditable: true,
        workingHours: '00',
      });
      setIsExceedCalendarName(false);
      setDisableSubmitButton(true);
      setHasWorkingHours(true);
      setIsUniqueCalendarName(true);
      setWorkingDays(defaultWorkingDays);
      setMaxWorkingHoursEntered(true);
    }
    // eslint-disable-next-line
  }, [currentCalendar]);

  const { calendarName, workingHours } = calendar;
  const defaultWorkingDays = [
    {
      label: 'M',
      value: 'Monday',
      active: true,
    },
    {
      label: 'T',
      value: 'Tuesday',
      active: true,
    },
    {
      label: 'W',
      value: 'Wednesday',
      active: true,
    },
    {
      label: 'T',
      value: 'Thursday',
      active: true,
    },
    {
      label: 'F',
      value: 'Friday',
      active: true,
    },
    {
      label: 'S',
      value: 'Saturday',
      active: false,
    },
    {
      label: 'S',
      value: 'Sunday',
      active: false,
    },
  ];
  const [workingDays, setWorkingDays] = useState(defaultWorkingDays);

  useEffect(() => {
    const count= workingDays.filter(item=>item.active);
    setworkingDaysCount(count.length);
  }, [workingDays])


  const onSubmit = (e: any) => {
    e.preventDefault();
    const tempWorkingDays: string[] = [];
    workingDays.forEach((workingDay) => {
      if (workingDay.active) tempWorkingDays.push(workingDay.value);
    });

    if (calendarAction === 'edit') {
      updateCalendar({
        ...calendar,
        workingDays: `{${tempWorkingDays}}`,
        holidayList,
      });
    } else {
      createCalendar({
        ...calendar,
        workingDays: `{${tempWorkingDays}}`,
        holidayList,
      });
    }

    handleClickDialogClose();
  };

  const generateCalendarName = (name: string, count = 1) => {
    let tempName: string;
    let flag = true;

    if (name.length > 16) {
      tempName = name.substring(0, 20);
    } else {
      tempName = name;
    }
    calendars.forEach((calendar: any) => {
      if (calendar.calendarName === tempName + `[${count}]`) {
        flag = false;
      }
    });

    if (!flag) {
      generateCalendarName(tempName, ++count);
    } else {
      const nameCheck = tempName + `[${count}]`;
      if(nameCheck.length > 20 ) {
        setIsExceedCalendarName(true);
      } else {
        setIsExceedCalendarName(false);
      }

     if(nameCheck.length <= 20) {
        setCalendar({
         ...currentCalendar,
         calendarName: tempName + `[${count}]`,
        });
        setDisableSubmitButton(false);
      } else {
        setCalendar({
          ...currentCalendar,
          calendarName: tempName + `[${count}]`,
         });
      setDisableSubmitButton(true);
      }
      
    }
  };

  const isNumeric = (value: any): boolean => {
      if(!isNaN(value - parseFloat(value)) && value.indexOf('.') == -1) {
        return true;
      } else {
        return false;
      }
     //return true;
  }
 
  const onChangeHandler = async (e: any) => {
    setCalendar({ ...calendar, [e.target.name]: e.target.value });
  
    if(e.target.name == 'workingHours') {
      let workingHoursSet = false;
      let maxWorkingHoursEnteredTemp = false;
      if(+e.target.value >= 1 && isNumeric(e.target.value)) {
        workingHoursSet = true;
        setHasWorkingHours(workingHoursSet);
      } else if (+e.target.value == 0 || +e.target.value < 0 || !isNumeric(e.target.value)) {
        workingHoursSet = false;
        setHasWorkingHours(workingHoursSet);
       }
       // else {
      //   workingHoursSet = true;
      //   setHasWorkingHours(workingHoursSet);
      // }

      if(+e.target.value > 12) {
        maxWorkingHoursEnteredTemp = false;
        setMaxWorkingHoursEntered(maxWorkingHoursEnteredTemp);
      } else {
        maxWorkingHoursEnteredTemp = true;
        setMaxWorkingHoursEntered(maxWorkingHoursEnteredTemp);
      }

      if(workingHoursSet && calendar.calendarName.length > 0 && maxWorkingHoursEnteredTemp) {
        setDisableSubmitButton(false);
      } else {
        setDisableSubmitButton(true);
      }
    } else {
        let duplicateCalendarNames = [];
        if(calendarAction == 'edit') {
          duplicateCalendarNames = calendars.filter((item )=> item.calendarName.trim().toLowerCase() == e.target.value.trim().toLowerCase() && currentCalendar.id != item.id) 
        } else {
          duplicateCalendarNames = calendars.filter((item )=> item.calendarName.trim().toLowerCase() == e.target.value.trim().toLowerCase() ) 
        }

        if(duplicateCalendarNames.length == 0) {
          setIsUniqueCalendarName(true);
          // setHasWorkingHours(!hasWorkingHours);
        } else {
          setIsUniqueCalendarName(false);
        }

        if(e.target.value.length > 20 ) {
          setIsExceedCalendarName(true);
        } else {
          setIsExceedCalendarName(false);
        }

       if(e.target.value.length > 0 && duplicateCalendarNames.length == 0 && +calendar.workingHours > 0 && e.target.value.length <= 20) {
        setDisableSubmitButton(false);
      } else {
        setDisableSubmitButton(true);
      }
    }

    for(let i = 0; i < holidayList.length; i++) {
      if(holidayList[i].holidayName.length == 0 || holidayList[i].date == null) {
        setDisableSubmitButton(true);
        break;
      }
    }
  };

  const handleClickDialogOpen = () => {
    setOpen(true);
  };

  const handleClickDialogClose = () => {
    // setOpen(false);
    setCurrentCalendar(null);
    setIsExceedCalendarName(false);
    setCalendar({
      calendarName: '',
      description: '',
      workingDays: [],
      holidayList: [],
      isEditable: true,
      workingHours: '00',
    });
    props.close();
  };

  const handleWeekButtonClick = (event: any, index: any) => {
    event.preventDefault();
    if(calendarAction == 'edit') {
      return;
    }
    const newBtnArr = [...workingDays];
    newBtnArr[index].active = !newBtnArr[index].active;
    const activeWorkingDay = newBtnArr.filter(ele => ele.active == true);

    if(activeWorkingDay.length == 0){
      newBtnArr[index].active =true;
      return; }  
    
    setWorkingDays(newBtnArr);
  };

  const disabledButton = (disable: any, deleting?: any) => {
    if (calendarAction === 'edit' || calendarAction === 'duplicate') {
      if(exceedCalendarName) {
        setDisableSubmitButton(true);
      } 
      // else if((deleting == false || deleting == undefined)) {
      //   setDisableSubmitButton(true);
      // } 
      else  {
        setDisableSubmitButton(disable);
      }
    } else {
      if(Number(workingHours) > 0 && Number(workingHours) < 13 && isUniqueCalendarName && calendar.calendarName.length <= 20) {
        setDisableSubmitButton(disable);
      } else {
        setDisableSubmitButton(true);
      }
    }
  };
  
  return (
    <div className="create-template">
      <Dialog
        open={props.open}
        onClose={handleClickDialogClose}
        area-labelledby="form-dialog-title"
        fullScreen={fullScreen}
        maxWidth="md"
        disableBackdropClick={true}
      >
        <DialogTitle id="form-dialog-title">
          <h4 style={{ marginBottom: '0px' }}>
            {calendarAction === 'edit'
              ? 'Update Calendar Template'
              : 'Add New Calendar Template'}{' '}
          </h4>
          <p
            style={{ margin: '0px 0px' }}
            className="create-template__title-subheading"
          >
            Create a name for this new calendar template and select calendar you
            want.
          </p>
        </DialogTitle>
        <DialogContent>
          <form onSubmit={onSubmit}>
            <div className="create-template__content">
              <div className="create-template__content-left">
                <InputLabel shrink>Name <span>*</span></InputLabel>
                <input
                  type="text"
                  id="name"
                  name="calendarName"
                  className={`input create-template__content-left__calendarName ${!updateTenantCalendar  ? 'create-template__content-left__workingHours__disabled' : ''}`}
                  placeholder="Enter Name"
                  value={calendarName}
                  onChange={onChangeHandler}
                />
                  <div className="error-wrap">
                    <p className="error-wrap__message">
                        {!isUniqueCalendarName ? <span>Calendar Name must be unique</span> : ''}
                    </p>
                  </div> 
                  <div className="error-wrap">
                    <p className="error-wrap__message">
                        {exceedCalendarName ? <span>Calendar Name must be less than or equal to 20</span> : ''}
                    </p>
                  </div> 
                <div className="create-template__content-left__weekdays">
                  <p className="u-margin-bottom-small">
                  <InputLabel shrink>Pick the  working days <span>*</span></InputLabel>
                    
                  </p>

                  {workingDays.map((workday: any, i: any) => (
                    <button
                      key={i}
                      name={workday.label}
                      onClick={(e) => {
                        handleWeekButtonClick(e, i);
                      }}
                      className={`
                      create-template__content-left__weekdays-button
                     ${
                       workday.active
                         ? ' create-template__content-left__weekdays-active'
                         : 'create-template__content-left__weekdays-inactive'
                     } ${calendarAction == 'edit' ? 'create-template__content-left__workingHours__disabled' : '' }`}
                    >
                      {workday.label}
                    </button>
                  ))}
                  {workingDaysCount == 1 ?
                  <span className="create-template__content-left__weekdays-note">
                  {workingDaysCount} day working 
                  </span> :
                      <span className="create-template__content-left__weekdays-note">
                      {workingDaysCount}  days working
                      </span> }
                </div>
                <div className="create-template__content-left__time">

                  <InputLabel shrink> Working hours in a day <span>*</span></InputLabel>

                  <div className="create-template__content-left__time__input-field">
                    <input
                      type="text"
                      id="workingHours"
                      className= {`create-template__content-left__workingHours  ${calendarAction == 'edit' ? 'create-template__content-left__workingHours__disabled' : '' }`}
                      placeholder="00"
                      value={workingHours}
                      name="workingHours"
                      onChange={onChangeHandler}
                    />
                    <InputLabel shrink htmlFor="workingHours" style={{margin: '0px 5px' }}>
                      hrs
                    </InputLabel>
                  </div>
                  {/* <div className="error-wrap">
                      <p className="error-wrap__message">
                        { !hasWorkingHours ? <span>Working hours should not be less than 1</span> : ''}
                      </p>
                  </div> */}
                  <div className="error-wrap">
                      <p className="error-wrap__message">
                        { !maxWorkingHoursEntered || !hasWorkingHours ? <span>Working hours should  be between 1 and  12</span> : ''}
                      </p>
                  </div>
                </div>
                {calendarAction === 'edit' ?
                <div className="create-template__content-left__warningMessageContainer">
                  <div style={{display: 'flex'}}>
                    <WarningRoundedIcon></WarningRoundedIcon>
                    <p className="create-template__content-left__warningMessageContainer__warningMessage">The changes made will only apply to all updates made henceforth in all projects associated to this calendar. Completed tasks will not be impacted by this change.</p>
                  </div>
                </div>
                : null}
              </div>
              <div className="create-template__content-middle"></div>
              <div className="create-template__content-right">
                <HolidayList disableButton={disabledButton} calendarAction={calendarAction}></HolidayList>
              </div>
              <div className="create-template__content-bottom">
                <Button
                  variant="outlined"
                  className="btn-secondary"
                  onClick={handleClickDialogClose}
                >
                 { updateTenantCalendar &&
                  'Discard' }
                 { !updateTenantCalendar && viewTenantCalendar &&
                  'Cancel' }
                </Button>
                { updateTenantCalendar ? 
                 
                <Button
                  variant="outlined"
                  className='btn-primary'
                  type="submit"
                  style={{textTransform: 'none'}}
                  disabled={disableSubmitButton || !isUniqueCalendarName || !hasWorkingHours}
                >
                  {calendarAction === 'edit'
                    && 'Update'
                  }
                  {calendarAction === 'duplicate'
                    && 'Save'
                  }
                  {calendarAction !== 'duplicate' && calendarAction !== 'edit'
                    && 'Create New Template'
                  }
                    
                </Button>
                : '' }
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateCalendarTemplate;
