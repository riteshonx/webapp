export interface IProjectMetrics {
  currency: string;
  timeZone: string;
  temprature: string;
  unitOfMeasurement: string;
}
export interface IWeatherParameter {
  rain: boolean,
  wind: number,
  windGust: number,
  temperature_max: number,
  temperature_min: number
}
export interface IWeatherTemplate {
  name: string;
  id: number;
  parameter: IWeatherParameter
}

export interface IWeatherTemplateMap {
  [key: string]: IWeatherTemplate
}

export interface IWeatherConstraint {
  createdAt: string,
  createdBy: string,
  id: number,
  name: string,
  parameter: IWeatherParameter,
  projectId: number,
  taskId: string,
  templateId: number,
  tenantId: number,
  updatedAt: string,
  updatedBy: string
}