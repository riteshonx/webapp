import React from 'react';
import WeatherTemplate from './components/WeatherTemplate';
import WeatherTemplateState from './reducer/WeatherTemplateState';

export default function index() {
  return (
   <WeatherTemplateState>
   <WeatherTemplate/>
   </WeatherTemplateState>
  )
}
