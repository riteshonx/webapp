import React, { ReactElement, useRef, useState, useContext, useEffect } from "react";

// Components
import SearchIcon from "@material-ui/icons/Search";
import { Button, FormControl, Radio, RadioGroup } from "@material-ui/core";
import { FilterListSharp, SortSharp } from "@material-ui/icons";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import OutsideClickHandler from "react-outside-click-handler";

// Context
import { insightsContext } from '../../../context/insightsContext'
import {
    setLessonsLearnedSearchKeyword,
    setLessonsLearnedFilter,
    setScheduleSearchKeyword,
    setScheduleImpactSearchKeyword,
    setLessonsLearnedSortBy,
    setScheduleImpactSortBy,
    setScheduleImpactFilter
} from "../../../context/insightsAction";

// Model
import { IInsightsContext, FilterGroup, FilterObject, SortByObject } from "src/modules/insights/models/insights";

// Constant
import { LESSONS_LEARNED_TAB, SCHEDULE_TAB, SCHEDULE_IMPACT_TAB, SCHEDULE_IMPACT_TYPES } from '../../../constant/index';

// Style
import './Filter.scss'

function Filter(props: any): ReactElement {
    const searchInput = useRef<HTMLInputElement>(null);
    const [openFilter, setOpenFilter] = useState(false)
    const [filterList, setFilterList]: any = useState([])
    const [sortByList, setSortByList]: any = useState([])
    const [openSort, setOpenSort] = useState(false)
    const { insightsState, insightsDispatch } = useContext(insightsContext) as IInsightsContext;

    useEffect(() => {
        if (searchInput.current?.value) {
            searchInput.current.value = ''
        }
        insightsDispatch(setLessonsLearnedSearchKeyword(''))
        insightsDispatch(setScheduleSearchKeyword(''))
        insightsDispatch(setScheduleImpactSearchKeyword(''))
        setOpenFilter(false)
        setOpenSort(false)
        setFilterList(getFilterList())
        setSortByList(getSortByList())
    }, [insightsState.openTab])

    const getSortByList = () => {
        switch (insightsState.openTab) {
            case LESSONS_LEARNED_TAB:
                return insightsState.lessonsLearnedSortBy
            case SCHEDULE_IMPACT_TAB:
                return insightsState.scheduleImpactSortBy
            default: return []
        }
    }

    const getFilterList = () => {
        switch (insightsState.openTab) {
            case LESSONS_LEARNED_TAB:
                return insightsState.lessonsLearnedFilters
            case SCHEDULE_IMPACT_TAB:
                return insightsState.scheduleImpactFilters
            default: return []
        }
    }

    const scheduleImpactFiltersCount = () => {
        let count = 0
        filterList.forEach((filterGroup: FilterGroup) => {
            const filterListKey = filterGroup.options.map((filterObject: FilterObject) => {
                if (filterObject.value) {
                    return filterObject.name
                } else {
                    return ''
                }
            }).filter((name: string) => name !== '')
            count += filterListKey.length
        })
        return count
    }

    const updateLessonsLearndFilter = (filterGroupIndex: number, filterIndex: number, value: boolean) => {
        filterList[filterGroupIndex].options[filterIndex].value = !value
        setFilterList([...filterList])
        insightsDispatch(setLessonsLearnedFilter([...filterList]))
    }

    const updateScheduleImpactFilter = (filterGroupIndex: number, filterIndex: number, value: boolean) => {
        filterList[filterGroupIndex].options[filterIndex].value = !value
        setFilterList([...filterList])
        insightsDispatch(setScheduleImpactFilter([...filterList]))
    }

    const updateLessonsLearnedSortBy = (sortByIndex: number) => {
        sortByList.forEach((sortBy: SortByObject, index: number) => {
            if (index === sortByIndex) {
                sortByList[index].value = true
            } else {
                sortByList[index].value = false
            }
        });
        setSortByList([...sortByList])
        insightsDispatch(setLessonsLearnedSortBy([...sortByList]))
    }

    const updateScheduleImpactSortBy = (sortByIndex: number) => {
        sortByList.forEach((sortBy: SortByObject, index: number) => {
            if (index === sortByIndex) {
                sortByList[index].value = true
            } else {
                sortByList[index].value = false
            }
        });
        setSortByList([...sortByList])
        insightsDispatch(setScheduleImpactSortBy([...sortByList]))
    }

    const SCHEDULE_IMPACT_FILTER_MAP = {
        [SCHEDULE_IMPACT_TYPES.RFI]: 'RFI',
        [SCHEDULE_IMPACT_TYPES.DAILY_LOGS]: 'Site Update',
        [SCHEDULE_IMPACT_TYPES.WEATHER]: 'Weather',
        [SCHEDULE_IMPACT_TYPES.MATERIAL]: 'Material Shortage',
        [SCHEDULE_IMPACT_TYPES.CONSTRAINT_LOGS]: 'Constraints'
    } as { [key: string]: string }

    return (
        <div className="insight-filter">
            {/* Search Box Start */}
            <div className="insight-filter__search">
                <label htmlFor="insights__search">
                    <SearchIcon />
                </label>
                <input
                    ref={searchInput}
                    onChange={e => {
                        if (insightsState.openTab === LESSONS_LEARNED_TAB) {
                            insightsDispatch(setLessonsLearnedSearchKeyword(e.target.value))
                        } else if (insightsState.openTab === SCHEDULE_TAB) {
                            insightsDispatch(setScheduleSearchKeyword(e.target.value))
                        } else if (insightsState.openTab === SCHEDULE_IMPACT_TAB) {
                            insightsDispatch(setScheduleImpactSearchKeyword(e.target.value))
                        }
                    }}
                    type="search"
                    id="insights__search"
                    placeholder="Search"
                />
            </div>
            {/* Search Box End */}
            {/* Filter Section Start */}
            <OutsideClickHandler onOutsideClick={() => {
                setOpenFilter(false)
            }}>
                <div className="insight-filter__sort">
                    <Button
                        onClick={() => { setOpenFilter(true) }}
                        disabled={insightsState.openTab === SCHEDULE_TAB}
                        className="insight-filter__button"
                        variant="contained"
                        startIcon={<FilterListSharp />}
                    >
                        Filter
                        {(insightsState.openTab === LESSONS_LEARNED_TAB &&
                            insightsState.lessonsLearnedFiltersCount)
                            ? <div className="insight-filter__button__badge">
                                {insightsState.lessonsLearnedFiltersCount}
                            </div>
                            : <></>
                        }
                        {(insightsState.openTab === SCHEDULE_IMPACT_TAB &&
                            scheduleImpactFiltersCount())
                            ? <div className="insight-filter__button__badge">
                                {scheduleImpactFiltersCount()}
                            </div>
                            : <></>
                        }
                    </Button>
                    {openFilter && <div className="insight-filter__sort__popover">
                        {
                            insightsState.openTab === LESSONS_LEARNED_TAB
                                ? filterList.map((filterGroup: FilterGroup, filterGroupIndex: number) =>
                                    filterGroup.options.map((filter: FilterObject, filterIndex: number) =>
                                        <div key={'filter-' + filter.name} >
                                            <FormControlLabel
                                                key={`filter-${filterIndex}`}
                                                control={<Checkbox
                                                    checked={filter.value as boolean}
                                                    onChange={() => {
                                                        updateLessonsLearndFilter(filterGroupIndex, filterIndex, filter.value as boolean)
                                                    }}
                                                />}
                                                label={filter.name}
                                            />
                                        </div>
                                    )) : <></>
                        }
                        {
                            insightsState.openTab === SCHEDULE_IMPACT_TAB
                                ? filterList.map((filterGroup: FilterGroup, filterGroupIndex: number) =>
                                    filterGroup.options.map((filter: FilterObject, filterIndex: number) =>
                                        <div key={'filter-' + filter.name} >
                                            <FormControlLabel
                                                key={`filter-${filterIndex}`}
                                                control={<Checkbox
                                                    checked={filter.value as boolean}
                                                    onChange={() => {
                                                        updateScheduleImpactFilter(filterGroupIndex, filterIndex, filter.value as boolean)
                                                    }}
                                                />}
                                                label={SCHEDULE_IMPACT_FILTER_MAP[filter.name || 'rfi']}
                                            />
                                        </div>
                                    )) : <></>
                        }
                    </div>}
                </div>
            </OutsideClickHandler>
            {/* Filter Section END */}

            {/* Sort By Section Start */}
            <OutsideClickHandler onOutsideClick={() => {
                setOpenSort(false);
            }}>
                <div className="insight-filter__sort">
                    <Button
                        onClick={() => { setOpenSort(true) }}
                        disabled={insightsState.openTab === SCHEDULE_TAB}
                        variant="contained"
                        startIcon={<SortSharp />}>
                        Sort by
                    </Button>
                    {(openSort
                        && insightsState.openTab === LESSONS_LEARNED_TAB)
                        && <div className="insight-filter__sort__popover">
                            {
                                insightsState.lessonsLearnedSortBy
                                    .map((sortBy: SortByObject, index: number) =>
                                        <FormControlLabel
                                            key={`sort-by-${index}`}
                                            control={<Radio
                                                checked={sortBy.value}
                                                onChange={() => {
                                                    updateLessonsLearnedSortBy(index)
                                                }}
                                            />}
                                            label={sortBy.name}
                                        />
                                    )
                            }
                        </div>}
                    {(openSort
                        && insightsState.openTab === SCHEDULE_IMPACT_TAB)
                        && <div className="insight-filter__sort__popover">
                            {
                                insightsState.scheduleImpactSortBy
                                    .map((sortBy: SortByObject, index: number) =>
                                        <FormControlLabel
                                            key={`sort-by-${index}`}
                                            control={<Radio
                                                checked={sortBy.value}
                                                onChange={() => {
                                                    updateScheduleImpactSortBy(index)
                                                }}
                                            />}
                                            label={sortBy.name}
                                        />
                                    )
                            }
                        </div>}
                </div>
            </OutsideClickHandler>
            {/* Sort By Section End */}
        </div>
    )
}

export default Filter