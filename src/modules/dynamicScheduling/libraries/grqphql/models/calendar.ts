export interface HolidayModel {
  holidayName: string;
  year: number;
  date: Date;
}

export interface CalendarModel {
  id: number;
  calendarName: string;
  tenantId: string;
  description: string;
  workingDays: string[];
  workingHours: number;
  isEditable: boolean;
  createdAt: Date;
  createdBy: number;
  updatedBy: number;
  updatedAt: Date;
  holidayList: HolidayModel[];
  tenantAssociation: TenantAssociation;
}
export interface TenantAssociation {
  user: User;
}
export interface User {
  firstName: string;
  lastName: string;
}

export abstract class Calendar {
  static modelName = 'calendars';
  static selector = {
    id: 'id',
    calendarName: 'calendarName',
    tenantId: 'tenantId',
    description: 'description',
    workingDays: 'workingDays',
    workingHours: 'workingHours',
    isEditable: 'isEditable',
    createdAt: 'createdAt',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy',
    updatedAt: 'updatedAt',
    holidayList: 'holidayList',
    tenantAssociation: 'tenantAssociation',
    user: 'user',
    firstName: 'firstName',
    lastName: 'lastName',
    isDefault: 'isDefault'
  };
}
