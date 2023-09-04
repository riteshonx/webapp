import {Tooltip } from '@material-ui/core';
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog/ConfirmDialog';

import CalendarContext from '../../../context/calendar/calendarContext';
import { CalendarModel } from '../../grqphql/models/calendar';
import CalenderOption from '../calendarActionOption/calendarActionOption';
import CreateCalendarTemplate from '../CreateCalendarTemplate/CreateCalendarTemplate';
import {
  createTenantCalendar,
  deleteTenantCalendar,
  updateTenantCalendar,
} from '../../../permission/scheduling';

import defualt from '../../../../../assets/images/defualt.svg';
import star from '../../../../../assets/images/star.svg';

import './CalendarGrid.scss';


interface nameBtn {
  name: string;
  submit: string;
}
interface calendarLib {
  calendarName: string;
  description: string;
  workingDays: string;
  workingDaysLength: number;
  workingHours: number;
  isEditable: string;
  id: number;
  createdBy: string;
  action: string;
  holidayList: number;
}
interface message {
  header: string;
  text: string;
  cancel: string;
  proceed: string;
}

const confirmMessage: message = {
  header: 'Are you sure?',
  text: "If you delete this calendar, you'll loose all the data related to the calendar.",
  cancel: 'Cancel',
  proceed: 'Proceed',
};


export default function CalendarGrid(props: any): ReactElement {

  const calendarContext = useContext(CalendarContext);
  const { calendars, setCurrentCalendar, setCalendarAction } = calendarContext;
  const [GridData, setGridData] = useState(calendars);
  const [selectedItem, setSelectedItem] = useState<any>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  // Action to display confirmation popup for edit or delete values 'edit'/'delete'
  const [action, setAction] = useState('delete');

  // Set confirmation messages header, messages, button title
  const [confirmMessage, setConfirmMessage] = useState({});

  const { deleteCalendar, makeCalendarDefault, associatedCalendar, getProjectCalendar } = calendarContext;

  useEffect(() => {
    setGridData(calendars);
  }, [GridData]);

  useEffect(() => {
    const calendarIds: any = [];
    if(calendars.length > 0) {
      calendars.forEach(element => {
        calendarIds.push(element.id);
      });
      getProjectCalendar(calendarIds);
    }

   
  }, [associatedCalendar]);
  
  const handleDialogOpen = (calendar: CalendarModel, action: string) => {
    setDialogOpen(true);
    setCurrentCalendar(calendar);
    setCalendarAction(action);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setCalendarAction('create');
  };
  
  const handleConfirmBoxOpen = (row: any, action: string) => {
    if (action === 'edit') {
      setConfirmMessage({
        header: 'Are you sure?',
        text: 'The changes made will only apply to all upcoming tasks in all projects associated to this calendar. Tasks in past will not be impacted by this change.',
        cancel: 'Cancel',
        proceed: 'Proceed',
      });
      setAction('edit');
    }
    if (action === 'delete') {
      setConfirmMessage({
        header: 'Are you sure?',
        text: 'If you delete this calendar, all data related to this calendar will be lost.',
        cancel: 'Cancel',
        proceed: 'Proceed',
      });
      setAction('delete');
    }
    setSelectedItem(row);
    setConfirmOpen(true);
  };

  const handleConfirmBoxClose = () => {
    setAction('delete');
    setConfirmOpen(false);
  };

  const proceedConfirm = () => {
    if (action === 'edit') {
      handleDialogOpen(selectedItem, action);
    }

    if (action === 'delete') {
      deleteCalendar(selectedItem.id);
    }
    setConfirmOpen(false);
  };

  const makeDefault = (calendarId: any) => {
    makeCalendarDefault(calendarId);
  }

  return (
    <>
      {calendars.map((item: any,index: number) => (
          <div className="calendar-grid-view__card" key={item.id}>
            <Tooltip title={item.calendarName}  style={{display: "flex"}} aria-label="caption">
            <div>
              <div className="calendar-grid-view__card__name"  onClick={() => handleDialogOpen(item, 'edit')}>
                {item.calendarName.length > 15 ? item.calendarName.slice(0,15)+'. . .': item.calendarName}
              </div>

                {item.isDefault ? <div className="calendar-grid-view__card__name__default">
                  <img className="img-responsive" src={defualt}/>
                  <img className="img-responsive calendar-grid-view__card__name__default__star" src={star}/>
                  </div>: <div></div> }
              </div>
            </Tooltip>
            {/* <div className="calendar-grid-view__card__description">{item.description}</div> */}
            <div className="calendar-grid-view__card__info">
              <div className="calendar-grid-view__card__info__weekdays">
                {item.workingDays.map((x: any) => x.substring(0, 3)).join(', ')}
              </div>
              <div className="calendar-grid-view__card__info__days-hours">
                {item.workingDays.length} days, {item.workingHours} hours
              </div>
            </div>

            <div className="calendar-grid-view__card__info__action">

            { /* do not remove*/}
              <div className="calendar-grid-view__card__info__action__type">
                <div className="calendar-grid-view__card__info__action__duration">
                
                </div>
              </div>
              { /* end do not remove*/}
              <div className={`calendar-grid-view__card__info__action__actionButton ${item.isDefault ? "calendar-grid-view__card__info__action__actionButton__defaultActionButton" : ''}`}>
                  { (createTenantCalendar || deleteTenantCalendar || updateTenantCalendar) ?
                (<CalenderOption  
                    item={item} 
                    key={item.id}
                    isAssociated = {!associatedCalendar.every((d: any) => {
                      return d.calendarId != item.id;
                    })}
                    index={index}
                    handleDialogOpen={handleDialogOpen}
                    confirmDelete={handleConfirmBoxOpen}
                    makeCalendarDefault={makeDefault}/>) : ('')}
              </div>
            </div>
          </div>
      ))}
      {dialogOpen ? (
        <CreateCalendarTemplate open={dialogOpen} close={handleDialogClose} />
      ) : (
        ''
      )}
      {confirmOpen ? (
        <ConfirmDialog
          open={confirmOpen}
          message={confirmMessage}
          close={handleConfirmBoxClose}
          proceed={proceedConfirm}
        />
      ) : (
        ''
      )}
  
    </>
  );
}
