import React, { ReactElement, useReducer, useContext, useState, useEffect } from 'react'
import { productivityMetricsContext } from 'src/modules/productivityMetrics/context/productivityMetricsContext';
import { productivityMetricsInitialState, productivityMetricsReducer } from 'src/modules/productivityMetrics/context/productivityMetricsReducer';
import { FETCH_PRODUCTIVITY_METRICS } from 'src/modules/productivityMetrics/graphql/queries';
import { client } from '../../../../../services/graphql';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { setIsLoading } from '../../../../root/context/authentication/action';

import './Main.scss'
import { IProductivityMetrics } from 'src/modules/productivityMetrics/models/productivityMetrics';
import { useLocation } from 'react-router-dom';
import ProductivityPopUp from 'src/modules/Dashboard/components/Dashboard3/Components/ProductivityPopUp/ProductivityPopUp';
export default function Main(): ReactElement {
  const [productivityMetricsState, productivityMetricsDispatch] = useReducer(productivityMetricsReducer, productivityMetricsInitialState);
  const { state, dispatch }: any = useContext(stateContext);
  const [productivityMetrics, setProductivityMetrics] = useState([] as Array<Array<IProductivityMetrics>>)
  const [classCodeProductivityMetrics, setClassCodeProductivityMetrics] = useState([] as Array<IProductivityMetrics>)
  const { search } = useLocation();
  const query = new URLSearchParams(search);

  const [open, setOpen] = useState(false);
  const [type, setType] = useState('');
  const [id, setId] = useState<any>(null);

  useEffect(() => {
    fetchProductivityMetrics()
  }, [])

  const fetchProductivityMetrics = async () => {
    dispatch(setIsLoading(true))
    try {
      const res = await client.query({
        query: FETCH_PRODUCTIVITY_METRICS,
        fetchPolicy: 'network-only',
        context: { role: 'viewMasterPlan', token: state?.selectedProjectToken }
      });
      const productivityMetricsList = JSON.parse(JSON.stringify(res.data.productivityMetrics))
      const classificationCodeIdQuery = query.get('classificationcode') || null
      const taskid = query.get('taskid') || null
      const classCodeProductivityMetricsTemp = productivityMetricsList.filter((element: IProductivityMetrics) => {
        if (taskid) {
          return element.dimension === 'TASK' && taskid === element.taskId
        } else if (classificationCodeIdQuery) {
          return element.dimension === 'CLASSCODE' && classificationCodeIdQuery === element.classificationCodeId.toString()
        } else {
          return element.dimension === 'CLASSCODE'
        }
      }).map((element: IProductivityMetrics) => {
        return {
          ...element,
          isOpen: false
        }
      })

      const productivityMetricsTemp = [] as Array<Array<IProductivityMetrics>>
      const taskProductivityMetricsTemp = productivityMetricsList.filter((element: IProductivityMetrics) => {
        if (taskid) {
          return element.dimension === 'TASK' && taskid === element.taskId
        } else {
          return element.dimension === 'TASK' 
        }
      })
      classCodeProductivityMetricsTemp.forEach((element: IProductivityMetrics, index: number) => {
        const classificationCodeId = element.classificationCodeId
        productivityMetricsTemp[index] = [] as Array<IProductivityMetrics>
        taskProductivityMetricsTemp.forEach((element2: IProductivityMetrics) => {
          if (element2.classificationCodeId === classificationCodeId) {
            productivityMetricsTemp[index].push(element2)
          }
        })
      })
      setClassCodeProductivityMetrics(classCodeProductivityMetricsTemp)
      setProductivityMetrics(productivityMetricsTemp)
      dispatch(setIsLoading(false))

    } catch (e) {
      console.log(e)
      dispatch(setIsLoading(false))
    }
  }

  const toggleOpenState = (index: number) => {
    classCodeProductivityMetrics[index].isOpen = !classCodeProductivityMetrics[index].isOpen
    setClassCodeProductivityMetrics([...classCodeProductivityMetrics])
  }

  const openPopupModal = (e:any, index: number) => {
    e.stopPropagation()
    const classificationCodeIdQuery = query.get('classificationcode') || null
    const taskid = query.get('taskid') || null
    if (taskid) {
      setOpen(true)
      setType('task')
      setId(taskid.toString())
    } else {
      const classificationCodeId = classCodeProductivityMetrics[index].classificationCode.classificationCode
      setOpen(true)
      setType('costCode')
      setId(classificationCodeId.toString())
    }
  }

  return <productivityMetricsContext.Provider value={{ productivityMetricsState, productivityMetricsDispatch }}>
    <div className="productivity-metrics">
      <div className="productivity-metrics__container">
        <div className="productivity-metrics__row productivity-metrics__title">
          <div></div>
          <div>Progress</div>
          <div>Labor Hours</div>
          <div>Duration</div>
          <div>Productivity</div>
        </div>
        <div className="productivity-metrics__row productivity-metrics__header">
          <div className="productivity-metrics__col-1">
            <div className="productivity-metrics__col-1-1">Cost Code</div>
            <div className="productivity-metrics__col-1-2">Schedule Activity</div>
            <div className="productivity-metrics__col-1-3">Linked Items</div>
          </div>
          <div className="productivity-metrics__col-2">
            <div className="productivity-metrics__col-2-1">Actual QTY</div>
            <div className="productivity-metrics__col-2-2">Planned QTY</div>
            <div className="productivity-metrics__col-2-3">UOM</div>
          </div>
          <div className="productivity-metrics__col-3">
            <div className="productivity-metrics__col-3-1">Actual</div>
            <div className="productivity-metrics__col-3-2">Planned</div>
            <div className="productivity-metrics__col-3-3">Forcasted at Completion</div>
            <div className="productivity-metrics__col-3-4">Delta</div>
          </div>
          <div className="productivity-metrics__col-4">
            <div className="productivity-metrics__col-4-1">Float</div>
            <div className="productivity-metrics__col-4-2">Actual</div>
            <div className="productivity-metrics__col-4-3">Scheduled</div>
            <div className="productivity-metrics__col-4-4">Forcasted at Completion</div>
            <div className="productivity-metrics__col-4-5">Delta</div>
          </div>
          <div className="productivity-metrics__col-5">
            <div className="productivity-metrics__col-5-1">Actual Units/LH</div>
            <div className="productivity-metrics__col-5-2">Planned Units/LH</div>
          </div>
        </div>
        {
          classCodeProductivityMetrics.map((element: IProductivityMetrics, index: number) => {
            return (
              <><div
                className="productivity-metrics__row productivity-metrics__body"
                onClick={() => {
                  toggleOpenState(index)
                }}
              >
                <div className="productivity-metrics__col-1">
                  <div className="productivity-metrics__col-1-1">
                    <svg
                      className={'productivity-metrics__toggle-icon ' + (element.isOpen ? 'open' : 'close')}
                      width="14"
                      height="9"
                      viewBox="0 0 14 9"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path d="M1.5 1.5L7 7.5L12.5 1.5" stroke="black" stroke-width="2" />
                    </svg>
                    <span className='cost-code' onClick={(e:any) => {
                      openPopupModal(e, index)
                    }} >
                      {element?.classificationCode.classificationCode}-{element?.classificationCode.classificationCodeName || '  '}
                    </span>
                  </div>
                  <div className="productivity-metrics__col-1-2">
                    {productivityMetrics[index]?.length + ' '}
                    Activity</div>
                  <div className="productivity-metrics__col-1-3">
                    {element?.linkedItemsCount || '  '}
                  </div>
                </div>
                <div className="productivity-metrics__col-2">
                  <div className="productivity-metrics__col-2-1">
                    {element?.actualQty || '  '}
                  </div>
                  <div className="productivity-metrics__col-2-2">
                    {element?.plannedQty || '  '}
                  </div>
                  <div className="productivity-metrics__col-2-3">
                    {element.classificationCode.UOM}
                  </div>
                </div>
                <div className="productivity-metrics__col-3">
                  <div className="productivity-metrics__col-3-1">
                    {element?.actualHrs || '  '}
                  </div>
                  <div className="productivity-metrics__col-3-2">
                    {element?.plannedHrs || '  '}
                  </div>
                  <div className="productivity-metrics__col-3-3">
                    {element?.projectedHrs || '  '}
                  </div>
                  <div className={`productivity-metrics__col-3-4 ${element?.deltaHrs > 0 ? 'success-color' : 'alert-color'}`}>
                    {element?.deltaHrs || '  '}
                  </div>
                </div>
                <div className="productivity-metrics__col-4">
                  <div className="productivity-metrics__col-4-1">
                    {element?.criticalFloatPercentage || '  '}
                  </div>
                  <div className="productivity-metrics__col-4-2">
                    {element?.actualDuration || '  '}
                  </div>
                  <div className="productivity-metrics__col-4-3">
                    {element?.plannedDuration || '  '}
                  </div>
                  <div className="productivity-metrics__col-4-4">
                    {element?.projectedDuration || '  '}
                  </div>
                  <div className="productivity-metrics__col-4-5">
                    {element?.deltaDuration || '  '}
                  </div>
                </div>
                <div className="productivity-metrics__col-5">
                  <div className="productivity-metrics__col-5-1">
                    {element?.actualProductivity || '  '}
                  </div>
                  <div className="productivity-metrics__col-5-2">
                    {element?.plannedProductivity || '  '}
                  </div>
                </div>
              </div>
                {
                  element.isOpen ?
                    productivityMetrics[index].map((element: IProductivityMetrics, index: number) => {
                      return <div
                        className="productivity-metrics__row productivity-metrics__expand"
                      >
                        <div className="productivity-metrics__col-1">
                          <div className="productivity-metrics__col-1-1">
                          </div>
                          <div className="productivity-metrics__col-1-2">
                            {element.projectTask?.taskName}
                          </div>
                          <div className="productivity-metrics__col-1-3">
                            {element?.linkedItemsCount}
                          </div>
                        </div>
                        <div className="productivity-metrics__col-2">
                          <div className="productivity-metrics__col-2-1">
                            {element?.actualQty || '  '}
                          </div>
                          <div className="productivity-metrics__col-2-2">
                            {element?.plannedQty || '  '}
                          </div>
                          <div className="productivity-metrics__col-2-3">
                            {element.classificationCode.UOM}
                          </div>
                        </div>
                        <div className="productivity-metrics__col-3">
                          <div className="productivity-metrics__col-3-1">
                            {element?.actualHrs || '  '}
                          </div>
                          <div className="productivity-metrics__col-3-2">
                            {element?.plannedHrs || '  '}
                          </div>
                          <div className="productivity-metrics__col-3-3">
                            {element?.projectedHrs || '  '}
                          </div>
                          <div className={`productivity-metrics__col-3-4 ${element?.deltaHrs > 0 ? 'success-color' : 'alert-color'}`}>
                            {element?.deltaHrs || '  '}
                          </div>
                        </div>
                        <div className="productivity-metrics__col-4">
                          <div className="productivity-metrics__col-4-1">
                            {element?.criticalFloatPercentage || '  '}
                          </div>
                          <div className="productivity-metrics__col-4-2">
                            {element?.actualDuration || '  '}
                          </div>
                          <div className="productivity-metrics__col-4-3">
                            {element?.plannedDuration || '  '}
                          </div>
                          <div className="productivity-metrics__col-4-4">
                            {element?.projectedDuration || '  '}
                          </div>
                          <div className="productivity-metrics__col-4-5">
                            {element?.deltaDuration || '  '}
                          </div>
                        </div>
                        <div className="productivity-metrics__col-5">
                          <div className="productivity-metrics__col-5-1">
                            {element?.actualProductivity || '  '}
                          </div>
                          <div className="productivity-metrics__col-5-2">
                            {element?.plannedProductivity || '  '}
                          </div>
                        </div>
                      </div>
                    }) : <></>
                }
              </>
            )
          })
        }
        <ProductivityPopUp onClose={() => {
          setOpen(false)
        }} open={open} type={type} id={id} projectId={state.currentProject.projectId} />
      </div>
    </div>
  </productivityMetricsContext.Provider>
}
