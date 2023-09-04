import { FilterGroup, FilterObject, ScheduleImpactMsgs, ScheduleImpactTask, SortByObject } from "../models/insights";
const SORT_BY_PRIORITY = 'priority'
const SORT_BY_PLANNED_START_DATE = 'plannedStartDate'
export const scheduleImpactSortFilterAndSearch = (
  scheduleTaskList: Array<ScheduleImpactTask>,
  searchKeyword: string,
  sortObject: SortByObject,
  filterList: Array<FilterGroup>
): Array<ScheduleImpactTask> => {
  let scheduleImpactList = JSON.parse(
    JSON.stringify(scheduleTaskList))

  // Search filter start
  scheduleImpactList = scheduleImpactList.filter(
    (scheduleTask: ScheduleImpactTask) => {
      return scheduleTask.taskName.toLocaleLowerCase().includes(
        searchKeyword.toLocaleLowerCase()
      )
    })
  // Search filter end
  if (sortObject.query) {
    const [field, order] = sortObject.query.split(' ')
    scheduleImpactList = scheduleImpactList
      .sort((ele: ScheduleImpactTask, nextEle: ScheduleImpactTask) => {
        if (field === SORT_BY_PRIORITY) {
          if (ele.priority !== nextEle.priority) {
            return parseInt(order) * (
              ele.priority.localeCompare(nextEle.priority)
            )
          } else {
            if (ele.floatValue !== nextEle.floatValue) {
              return parseInt(order) * (ele.floatValue - nextEle.floatValue)
            } else {
              return parseInt(order) * (new Date(nextEle.plannedStartDate).valueOf()
                -
                new Date(ele.plannedStartDate).valueOf())
            }
          }
        } else if (field === SORT_BY_PLANNED_START_DATE) {
          if (nextEle.plannedStartDate !== ele.plannedStartDate) {
            return parseInt(order) * (
              new Date(nextEle.plannedStartDate).valueOf()
              -
              new Date(ele.plannedStartDate).valueOf()
            )
          } else if (ele.priority !== nextEle.priority) {
            return parseInt(order) * (
              ele.priority.localeCompare(nextEle.priority)
            )
          } else {
            return parseInt(order) * (ele.floatValue - nextEle.floatValue)
          }
        }
        return 1
      })
  }

  //Filter start
  filterList.forEach((filterGroup: FilterGroup) => {
    const filterListKey = filterGroup.options.map((filterObject: FilterObject) => {
      if (filterObject.value) {
        return filterObject.name
      } else {
        return ''
      }
    }).filter((name: string) => name !== '')

    if (filterListKey.length) {
      scheduleImpactList = scheduleImpactList.map((scheduleTask: ScheduleImpactTask) => {
        scheduleTask.msgs = scheduleTask.msgs.filter((scheduleImpactMsgs: ScheduleImpactMsgs) => {
          const type = scheduleImpactMsgs.type
          if (filterListKey.includes(type)) {
            return true
          } else {
            return false
          }
        })
        return scheduleTask
      }).filter((scheduleTask: ScheduleImpactTask) => scheduleTask.msgs.length)
    }
  })
  // Filter End
  scheduleImpactList = scheduleImpactList
  return scheduleImpactList
}