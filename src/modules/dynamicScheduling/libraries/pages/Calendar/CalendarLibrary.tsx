import React, { ReactElement, useContext, useState } from 'react';
import { useDebounce } from '../../../../../customhooks/useDebounce';
import { stateContext } from '../../../../root/context/authentication/authContext';
import NoDataMessage from '../../../../shared/components/NoDataMessage/NoDataMessage';
import { viewTenantCalendar } from '../../../permission/scheduling';
import CalendarContext from '../../../context/calendar/calendarContext';
import CalendarAction from '../../components/CalendarAction/CalendarAction';
import CalendarGrid from '../../components/CalendarGrid/CalendarGrid';
import CalendarTable from '../../components/CalendarTable/CalendarTable';
import LibraryHeader from '../../components/LibraryHeader/LibraryHeader';
import './CalendarLibrary.scss';
import { useHistory } from 'react-router-dom';
import CommonHeader from "../../../../shared/components/CommonHeader/CommonHeader"
interface librarayHeader {
  name: string;
}
const noDataMessage = 'No calendars were found.';
const noPermissionMessage = "You don't have permission to view calendar template";
export default function CalendarLibrary(): ReactElement {
  const { state }: any = useContext(stateContext);
  const history: any = useHistory();
  const [viewType, setViewType] = useState('gallery');
  const calendarContext = useContext(CalendarContext);
  const { calendars, getCalendars, deleteCalendar } = calendarContext;
  const [searchText, setsearchText] = useState('');
  const debounceName = useDebounce(searchText, 1000);
  //useEffect(() => {
  //getCalendars();
  //},[calendars]);
  const toggleView = (type: string) => {
    setViewType(type);
  };
  const headerInfo: librarayHeader = {
    name: 'Calendar Configuration',
  };
  const deleteTask = (id: number) => {
    if (id) {
      //deleteQuery
    }
  };
  const refreshList = () => {
    getCalendars();
  };
  return (
    <div className="calendar-lib">
          <CommonHeader headerInfo={headerInfo}/>

          {viewTenantCalendar ? (
          <>
            <CalendarAction toggleView={toggleView} view={viewType} />
            <div className="calendar-lib__main">
            {viewType === 'gallery' ? (
                calendars && calendars.length > 0 ? (
                  <div className="calendar-lib__main__grid-view">
                    <CalendarGrid deleteTask={deleteTask} refresh={refreshList} />
                  </div>
                ) : !state.isLoading ? (
                  <div className="no-data-wrapper">
                    <NoDataMessage message={noDataMessage} />
                  </div>
                ) : (
                  ''
                )
            ) : (
              <div className="calendar-lib__main__list-view">
                <CalendarTable deleteTask={deleteTask} refresh={refreshList} />
              </div>
            )}
          </div>
          </>
          ) : (
          <div className="no-data-wrapper"> 
            <NoDataMessage message={noPermissionMessage} />
        </div>
      )}
    </div>
  );
}