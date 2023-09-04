import React, {
  ReactElement,
  KeyboardEvent,
  useState,
  useEffect,
  useContext
} from 'react';
import useStateCallback from 'src/customhooks/useStateCallback';
import { InfoOutlined } from '@material-ui/icons';
import { cloneDeep } from '@apollo/client/utilities';

import { styled } from '@mui/material/styles';
import { Tooltip, TooltipProps } from "@material-ui/core";
import { tooltipClasses } from "@mui/material";
import './EditWeatherOnActivity.scss'

import {
  IProjectMetrics,
  IWeatherTemplate,
  IWeatherParameter,
  IWeatherConstraint,
  IWeatherTemplateMap
} from 'src/modules/dynamicScheduling/models/weather';

import { client } from '../../../../../../services/graphql';
import {
  FETCH_PROJECT_METRICS,
  FETCH_WEATHER_TEMPLATE,
  GET_WEATHER_CONSTRAINT,
  CREATE_WEATHER_CONSTRAINT,
  UPDATE_WEATHER_CONSTRAINT,
  DELETE_WEATHER_CONSTRAINT
} from '../../../../graphql/queries/weather'
import {
  stateContext
} from 'src/modules/root/context/authentication/authContext';
import { setIsLoading } from 'src/modules/root/context/authentication/action';
import ProjectPlanContext from
  'src/modules/dynamicScheduling/context/projectPlan/projectPlanContext';

import {
  decodeExchangeToken,
  getExchangeToken
} from 'src/services/authservice';
import { setResetValue } from 'src/modules/baseService/formConsumption/Context/link/linkAction';

const defaultParameterValues = {
  rain: false,
  wind: 0,
  windGust: 0,
  temperature_max: 0,
  temperature_min: 0
} as IWeatherParameter

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 300,
    fontSize: '12px',
  }
}));

function EditWeatherOnActivity(): ReactElement {
  const didMount = React.useRef(false);
  const projectPlanContext = useContext(ProjectPlanContext)
  const { state, dispatch }: any = useContext(stateContext);
  const { currentTask } = projectPlanContext;

  const [weatherTemplates, setWeatherTemplate] = useStateCallback({} as IWeatherTemplateMap)
  const [initialRender, setInitialRender] = useStateCallback(true)
  const [projectMetrics, setProjectMetrics] = useStateCallback({} as IProjectMetrics)
  const [weatherConstraint, setWeatherConstraint] = useStateCallback(defaultParameterValues)
  const [weatherConstraintObj, setWeatherConstraintObj] = useStateCallback({} as IWeatherConstraint)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [constraintCreated, setConstraintCreated] = useState(false)
  const [disabledInput, setDisabledInput] = useState(true)


  const projectId = state.currentProject.projectId
  const tenantId = +decodeExchangeToken().tenantId
  const userId = decodeExchangeToken().userId
  const taskId = currentTask.id


  useEffect(() => {
    setInitialRender(true)
    dispatch(setIsLoading(true))
    fetchProjctMetrics()
  }, [])

  useEffect(() => {
    checkEnableInput()
  }, [selectedTemplate, weatherConstraint, initialRender])

  const getProjectMetrics = () => {
    try {
      return JSON.parse(localStorage.getItem('projectMetrics') || '{}')
    } catch {
      return {
        temprature: "",
        unitOfMeasurement: ""
      }
    }
  }

  const fetchProjctMetrics = async () => {
    const fetchProjectMetrics = await client.query({
      query: FETCH_PROJECT_METRICS,
      fetchPolicy: 'network-only',
      variables: {
        projectId
      },
      context: { role: 'viewMyProjects', token: getExchangeToken() },
    })
    const projectMetricsStatic = fetchProjectMetrics.data.project[0]?.metrics || {
      temprature: "",
      unitOfMeasurement: ""
    }
    localStorage.setItem('projectMetrics', JSON.stringify(projectMetricsStatic))
    setProjectMetrics(projectMetricsStatic, () => {
      fetchWeatherConstraintTemplate()
    })
  }

  const fetchWeatherConstraintTemplate = async () => {
    const weatherTemplate = await client.query({
      query: FETCH_WEATHER_TEMPLATE,
      fetchPolicy: 'network-only',
      context: { role: 'viewMasterPlan', token: state?.selectedProjectToken },
    })
    const templateMap = {} as IWeatherTemplateMap
    weatherTemplate
      .data
      .weatherConstraintTemplate
      .forEach((ele: IWeatherTemplate) => {
        templateMap[ele.id] = {
          ...ele,
          parameter: siToLocalUnitConversion(ele.parameter)
        }
      })
    setWeatherTemplate(templateMap, () => {
      loadWeatherConstraint()
    })
  }

  const loadWeatherConstraint = async () => {
    const weatherConstraintData = await client.query({
      query: GET_WEATHER_CONSTRAINT,
      fetchPolicy: 'network-only',
      variables: {
        taskId: taskId,
        projectId: projectId
      },
      context: { role: 'viewMasterPlan', token: state?.selectedProjectToken },
    })

    const data = weatherConstraintData.data.projectTaskWeatherConstraint
    if (data.length) {
      setWeatherConstraintObj(data[0])
      setWeatherConstraint(siToLocalUnitConversion(data[0]?.parameter))
      setSelectedTemplate(data[0]?.templateId?.toString())
      setConstraintCreated(true)
    } else {
      setConstraintCreated(false)
    }
    setInitialRender(false)
    dispatch(setIsLoading(false))
  }

  const publishParameterValues = async (
    templateId: string,
    constraint: IWeatherParameter
  ) => {
    const weatherParameterSIValues = localToSiUnitConversion(constraint)
    if (!constraintCreated) {
      try {
        await client.mutate({
          mutation: CREATE_WEATHER_CONSTRAINT,
          variables: {
            name: weatherTemplates[templateId].name,
            externalId:currentTask.externalId,
            parameter: {
              rain: weatherParameterSIValues.rain,
              wind: weatherParameterSIValues.wind,
              windGust: weatherParameterSIValues.windGust,
              temperature_max: weatherParameterSIValues.temperature_max,
              temperature_min: weatherParameterSIValues.temperature_min
            },
            projectId: projectId,
            tenantId: tenantId,
            taskId: taskId,
            templateId: templateId,
            createdBy: userId,
            updatedBy: userId
          },
          context: {
            role: 'viewMasterPlan',
            token: state?.selectedProjectToken
          }
        })
        setConstraintCreated(true)
      } catch (e) {
        console.log(e)
      }
    } else {
      const updateParameter = await client.mutate({
        mutation: UPDATE_WEATHER_CONSTRAINT,
        variables: {
          name: weatherTemplates[templateId].name,
          parameter: {
            rain: weatherParameterSIValues.rain,
            wind: weatherParameterSIValues.wind,
            windGust: weatherParameterSIValues.windGust,
            temperature_max: weatherParameterSIValues.temperature_max,
            temperature_min: weatherParameterSIValues.temperature_min
          },
          taskId: taskId,
          templateId: templateId,
          updatedBy: userId
        },
        context: { role: 'viewMasterPlan', token: state?.selectedProjectToken },
      })
    }
  }

  const deleteWeatherConstraint = async () => {
    await client.mutate({
      mutation: DELETE_WEATHER_CONSTRAINT,
      variables: {
        taskId: taskId
      },
      context: { role: 'viewMasterPlan', token: state?.selectedProjectToken },
    })
    setConstraintCreated(false)
  }

  const changeTemplate = (value: string) => {
    setSelectedTemplate(value)
    if (!(value in weatherTemplates)) {
      setWeatherConstraint(
        cloneDeep(defaultParameterValues), () => {
          deleteWeatherConstraint()
        })
    } else {
      setWeatherConstraint(
        cloneDeep(weatherTemplates[value].parameter),
        (constraint) => {
          publishParameterValues(value, constraint)
        })
    }
  }

  const siToLocalUnitConversion = (parameter: any) => {
    const projectMetricsStatic = getProjectMetrics()
    const tempParameter = { ...parameter }
    if (projectMetricsStatic.temprature === 'Celsius') {
      tempParameter.temperature_max =
        parameter.temperature_max === ''
          ? ''
          : (parameter.temperature_max - 32) * 5 / 9;
      tempParameter.temperature_min =
        parameter.temperature_min === ''
          ? ''
          : (parameter.temperature_min - 32) * 5 / 9;
    }
    if (projectMetricsStatic.unitOfMeasurement === 'Metrics') {
      tempParameter.wind =
        parameter.wind === ''
          ? ''
          : parameter.wind * 1.609344
      tempParameter.windGust =
        parameter.windGust === ''
          ? ''
          : parameter.windGust * 1.609344
    }
    return tempParameter
  }

  const localToSiUnitConversion = (parameter: any) => {
    const projectMetricsStatic = getProjectMetrics()
    const tempParameter = { ...parameter }
    if (projectMetricsStatic.temprature === 'Celsius') {
      tempParameter.temperature_max =
        parameter.temperature_max === ''
          ? '' : (parameter.temperature_max * 1.8) + 32
      tempParameter.temperature_min =
        parameter.temperature_min === ''
          ? '' : (parameter.temperature_min * 1.8) + 32
    }
    if (projectMetricsStatic.unitOfMeasurement === 'Metrics') {
      tempParameter.wind = parameter.wind === ''
        ? '' : parameter.wind / 1.609344
      tempParameter.windGust = parameter.windGust === ''
        ? '' : parameter.windGust / 1.609344
    }
    return tempParameter
  }

  const checkEnableInput = () => {
    setDisabledInput(selectedTemplate === '')
  }

  const changeValue = (value: number | boolean | string, key: string) => {
    const tempWeatherConstraint = cloneDeep(weatherConstraint)
    switch (key) {
      case 'rain':
        tempWeatherConstraint.rain = value as boolean
        break
      case 'wind':
        tempWeatherConstraint.wind = value as number
        break
      case 'windGust':
        tempWeatherConstraint.windGust = value as number
        break
      case 'temperature_max':
        tempWeatherConstraint.temperature_max = value as number
        break
      case 'temperature_min':
        tempWeatherConstraint.temperature_min = value as number
        break
    }
    setWeatherConstraint(tempWeatherConstraint, (constraint) => {
      publishParameterValues(selectedTemplate, constraint)
    })
  }

  const getInputValue = (value: string, max = Infinity, min = -Infinity): string | number => {
    if (value === '') {
      return ''
    } else {
      if (+value > max || +value < min) {
        return getInputValue(value.slice(0, -1), max, min)
      }
      if (+value === NaN) {
        return 0
      }
      return Math.floor(+value * 100) / 100
    }
  }

  const temperatureUnitConversion = (value: number) => {
    const projectMetricsStatic = getProjectMetrics()
    if (projectMetricsStatic.temprature === 'Celsius') {
      return (value - 32) * 5 / 9;
    } else {
      return value
    }
  }

  const speedUnitConversion = (value: number) => {
    const projectMetricsStatic = getProjectMetrics()
    if (projectMetricsStatic.unitOfMeasurement === 'Metrics') {
      return value * 1.609344
    } else {
      return value
    }
  }

  const resetValue = (e: KeyboardEvent<HTMLInputElement>, property: string) => {
    if (e.key === "Escape" && weatherConstraintObj.templateId) {
      e.preventDefault()
      e.stopPropagation()
      setWeatherConstraint(cloneDeep(weatherConstraintObj?.parameter))
      setSelectedTemplate(weatherConstraintObj?.templateId?.toString())
      publishParameterValues(
        weatherConstraintObj?.templateId?.toString(),
        weatherConstraintObj.parameter
      )
    }
  }

  return <div className="weather-activity">
    <div className="weather-activity__template">
      <label htmlFor="weather_template_type">Select Template</label>
      <div className="weather-activity__template__group">
        <select id="weather_template_type"
          value={selectedTemplate}
          onChange={(e) => {
            changeTemplate(e.target.value)
          }}
        >
          <option value="">Select Template</option>
          {
            Object.values(weatherTemplates)
              .map((weatherTemplate: IWeatherTemplate) => {
                return <option
                  key={weatherTemplate.id}
                  value={weatherTemplate.id}>
                  {weatherTemplate.name}
                </option>
              })
          }
        </select>
        <HtmlTooltip
          placement="right-start"
          arrow
          title={
            <React.Fragment>
              Please select a template to apply values.
              You will be able to override each
              weather parameter once a template is selected.
            </React.Fragment>
          }
        >
          <InfoOutlined className='weather-activity__info' />
        </HtmlTooltip>
      </div>
    </div>
    <div className="weather-activity__parameter">
      <div className="weather-activity__parameter__label">Rain/Snow</div>
      <div className="weather-activity__parameter__value">
        <input
          type='checkbox'
          disabled={disabledInput}
          checked={weatherConstraint.rain}
          onChange={() => { changeValue(!weatherConstraint.rain, 'rain') }}
        />
        <span className='weather-activity__parameter__value__label' >
          Impacted?
        </span>
      </div>
    </div>
    <div className="weather-activity__parameter">
      <div className="weather-activity__parameter__label">Wind</div>
      <div className="weather-activity__parameter__value">
        <input
          type="number"
          placeholder='No Maximum Threshold'
          disabled={disabledInput}
          value={getInputValue(weatherConstraint?.wind?.toString())}
          onChange={(e) => {
            changeValue(
              getInputValue(
                e.target.value,
                speedUnitConversion(999),
                speedUnitConversion(0)
              ), 'wind')
          }}
          onKeyDown={(e) => {resetValue(e, 'wind')}}
        />
        <span className="weather-activity__parameter__value__unit">
          {projectMetrics.unitOfMeasurement === 'Metrics' ? 'kmph' : 'mph'}
        </span>
      </div>
    </div>
    <div className="weather-activity__parameter">
      <div className="weather-activity__parameter__label">Wind Gust</div>
      <div className="weather-activity__parameter__value">
        <input
          type="number"
          placeholder='No Maximum Threshold'
          disabled={disabledInput}
          value={getInputValue(weatherConstraint?.windGust?.toString())}
          onChange={(e) => {
            changeValue(
              getInputValue(
                e.target.value,
                speedUnitConversion(999),
                speedUnitConversion(0)
              ), 'windGust')
          }}
          onKeyDown={(e) => {resetValue(e, 'windGust')}}
        />
        <span className="weather-activity__parameter__value__unit">
          {projectMetrics.unitOfMeasurement === 'Metrics' ? 'kmph' : 'mph'}
        </span>
      </div>
    </div>
    <div className="weather-activity__parameter">
      <div className="weather-activity__parameter__label">Temperature</div>
      <div className="weather-activity__parameter__value temperature__value">
        <span className="weather-activity__parameter__value__range" >Min</span>
        <input
          type="number"
          disabled={disabledInput}
          value={getInputValue(weatherConstraint?.temperature_min?.toString())}
          onChange={(e) => {
            changeValue(
              getInputValue(e.target.value,
                temperatureUnitConversion(999),
                temperatureUnitConversion(-50)), 'temperature_min')
          }}
          onKeyDown={(e) => {resetValue(e, 'temperature_min')}}
        />
        <span className="weather-activity__parameter__value__range">Max</span>
        <input
          type="number"
          disabled={disabledInput}
          value={getInputValue(weatherConstraint?.temperature_max?.toString())}
          onChange={(e) => {
            changeValue(
              getInputValue(
                e.target.value,
                temperatureUnitConversion(999),
                temperatureUnitConversion(-50)),
              'temperature_max')
          }}
          onKeyDown={(e) => {resetValue(e, 'temperature_max')}}
        />
        {
          projectMetrics.temprature === 'Celsius'
            ? <span className="weather-activity__parameter__value__unit">
              &#8451;
            </span>
            : <span className="weather-activity__parameter__value__unit">
              &#8457;
            </span>
        }
      </div>
    </div>
    <p className='weather-activity__msg' >
      **Leave blank when threshold not applicable
    </p>
  </div>
}

export default EditWeatherOnActivity