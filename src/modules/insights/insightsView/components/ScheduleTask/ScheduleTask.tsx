import React, { ReactElement, useState, useContext, useEffect } from 'react'
import { KeyboardArrowDown, KeyboardArrowUp } from '@material-ui/icons'
import { stateContext } from '../../../../root/context/authentication/authContext';
import { LOAD_TASK_IMPACT_INSIGHT } from 'src/modules/insights/graphql/queries/schedule'
import { client } from '../../../../../services/graphql';
import './ScheduleTask.scss'

function ScheduleTask(props: any): ReactElement {
  const [open, setOpen] = useState(false)
  const [loader, setLoader] = useState(false)
  const [openTab, setOpenTab] = useState('dailyLog')
  const [dailyLog, setDailyLog] = useState([])
  const [rfi, setRfi] = useState([])
  const [weather, setWeather] = useState([])
  const [materialShortage, setMaterialShortage] = useState([])
  const [constraintslog, setConstraintslog] = useState([])

  const { state }: any = useContext(stateContext);

  useEffect(() => {
    if (dailyLog.length) {
      setOpenTab('dailyLog')
    } else if (rfi.length) {
      setOpenTab('rfi')
    } else if (weather.length) {
      setOpenTab('weather')
    } else if (materialShortage.length) {
      setOpenTab('meterialSortage')
    } else if (constraintslog.length) {
      setOpenTab('constraintslog')
    }
  }, [dailyLog, rfi, weather, materialShortage, constraintslog])
  
  const togglePanel = async (value: boolean) => {
    if (value) {
      setLoader(true)
      try {
        const loadTaskImpactInsight = await client.query({
          query: LOAD_TASK_IMPACT_INSIGHT,
          variables: { taskId: props.taskId },
          fetchPolicy: 'network-only',
          context: {
            role: 'viewMasterPlan',
            token: state?.selectedProjectToken
          }
        });
        loadTaskImpactInsight.data.projectScheduleImpactInsight
          .forEach((impactInsight: any) => {
            if (impactInsight.type === 'dailylogs') {
              setDailyLog(impactInsight.messages_web.msgs)
            } else if (impactInsight.type === 'weather') {
              setWeather(impactInsight.messages_web.msgs)
            } else if (impactInsight.type === 'rfi') {
              setRfi(impactInsight.messages_web.msgs)
            } else if (impactInsight.type === 'material') {
              setMaterialShortage(impactInsight.messages_web.msgs)
            } else if (impactInsight.type === 'constraintlogs') {
              setConstraintslog(impactInsight.messages_web.msgs)
            }
          })
      } catch (e) { console.log(e) }
      setLoader(false)
    } else {
      setDailyLog([])
      setRfi([])
      setWeather([])
      setMaterialShortage([])
      setConstraintslog([])
    }
    setOpen(value)
  }
  const msgsList = (tabName: string) => {
    switch (tabName) {
      case 'dailyLog': return dailyLog
      case 'rfi': return rfi
      case 'weather': return weather
      case 'meterialSortage': return materialShortage
      case 'constraintslog': return constraintslog
      default : return []
    }
  }

  const getClassName = (tabName: string) => {
    let name = ''
    if (tabName === openTab) {
      name += 'active'
    }
    switch (tabName) {
      case 'dailyLog': !dailyLog.length ? name += 'disable' : ''; break;
      case 'rfi': !rfi.length ? name += 'disable' : ''; break;
      case 'weather': !weather.length ? name += 'disable' : ''; break;
      case 'meterialSortage':
        !materialShortage.length ? name += 'disable' : ''; break;
      case 'constraintslog': !constraintslog.length ? name += 'disable' : ''
        break;
    }
    return name.trim()
  }
  return <section className={'schedule-task ' + (open ? 'open' : 'close')}>
    <div className="schedule-task__header"
      onClick={() => { togglePanel(!open) }}
    >
      <span className='schedule-task__header__taskname' >
        {props.taskName || '-'}
      </span>
      <span className='schedule-task__header__plandate'>
        {props.plannedStartDate || '-'}
      </span>
      <span className='schedule-task__header__float' >
        {props.floatValue === 0
          ? <span className='critical'>Critical 0 Float</span>
          : <span className={props.priority === 'High' ? 'critical' : 'normal'}>
              Float {props.floatValue || '-'} Days
            </span>
        }
      </span>
      <span>
        {open ?
          <KeyboardArrowUp/>
          : <KeyboardArrowDown/>
        }
      </span>
    </div>
    {
      open ? <div className={
        (props.priority === 'High' ||
        props.floatValue === 0)
          ? 'schedule-task__tab critical'
          : 'schedule-task__tab'
      }>
        <div className="schedule-task__tab__header">
          <span
            onClick={() => { dailyLog.length && setOpenTab('dailyLog') }}
            className={getClassName('dailyLog')}
          >
            Daily Log ({dailyLog.length})
          </span>
          <span
            onClick={() => { rfi.length && setOpenTab('rfi') }}
            className={getClassName('rfi')}
          >
            RFI ({rfi.length})
          </span>
          <span
            onClick={() => { weather.length && setOpenTab('weather') }}
            className={getClassName('weather')}
          >
            Weather ({weather.length})
          </span>
          <span
            onClick={() => { materialShortage.length
              && setOpenTab('meterialSortage') }}
            className={getClassName('meterialSortage')}
          >
            Material Shortage ({materialShortage.length})
          </span>
          <span
            onClick={() => { constraintslog.length
              && setOpenTab('constraintslog') }}
            className={getClassName('constraintslog')}
          >
            Open Constraints ({constraintslog.length})
          </span>
        </div>
        <div className="schedule-task__table">
          {msgsList(openTab).map((msg: string) => {
            const msgUi = React.createRef()
            msgUi.current
            return <div
              className="schedule-task__table__row"
              dangerouslySetInnerHTML= {{__html: msg}} />
          })}
        </div>
      </div> : loader
        ? <div className="schedule-task__loader" />
        : <></>
    }
  </section>
}

export default ScheduleTask
