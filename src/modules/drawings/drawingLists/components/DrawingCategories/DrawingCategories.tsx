import React, { ReactElement, useContext, useEffect, useState } from 'react';
import InputLabel from '@material-ui/core/InputLabel';
import './DrawingCategories.scss';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import TextField from '@material-ui/core/TextField';
import { DrawingLibDetailsContext } from '../../context/DrawingLibDetailsContext';
import { setDrawingCategoryDetails, setDrawingSheetsDetails, setIsAutoUpdate } from '../../context/DrawingLibDetailsAction';
import Notification, { AlertTypes } from '../../../../shared/components/Toaster/Toaster'
import { defaultCategory } from '../../../utils/drawingsConstant';
import { projectFeatureAllowedRoles } from 'src/utils/role';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import { match, useRouteMatch } from 'react-router-dom';
import { UPDATE_DRAWING_SHEET_CATEGORY } from '../../graphql/queries/drawing';
import { client } from 'src/services/graphql';

export interface Params {
    projectId: string;
    documentId: string;
}

export default function DrawingCategories(): ReactElement {

    const { state }: any = useContext(stateContext);
    const [value, setValue] = useState('show-all');
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
    const [newCategoryName, setNewCategoryName] = useState('')
    const [categoriesArray, setCategoriesArray] = useState<Array<any>>([]);
    const { DrawingLibDetailsState, DrawingLibDetailsDispatch }: any = useContext(DrawingLibDetailsContext);
    const [trimCategoryValue, setTrimCategoryValue] = useState('')
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;
    const [oldCategoryValue, setOldCategoryValue] = useState('');
    const pathMatch: match<Params> = useRouteMatch();

    useEffect(() => {
        if (DrawingLibDetailsState?.drawingCategoryDetails?.length > 0) {
            if (typeof DrawingLibDetailsState?.drawingCategoryDetails[0] === 'string') {
                mapCategory(DrawingLibDetailsState?.drawingCategoryDetails)
            } else {
                if (value === 'show-all') {
                    sortCategoryByName(DrawingLibDetailsState?.drawingCategoryDetails)
                }
            }
        }
    }, [DrawingLibDetailsState?.drawingCategoryDetails])

    //convert category: array of strings to array of objects
    const mapCategory = (data: any) => {
        const res = data.reduce((s: any, a: any) => {
            s.push({ name: a, status: '' });
            return s
        }, [])
        DrawingLibDetailsDispatch(setDrawingCategoryDetails(res));
    }

    // sort category list: order by asc name
    const sortCategoryByName = (data: any) => {
        const res = data?.sort((a: any, b: any) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
        const removeEmptyData = res.filter((category: any) => category.name.trim() !== '');
        const defaultCategoryList = removeEmptyData.filter((category: any) => category.name.trim() === 'NOT A DRAWING');
        const nonDefaultCategpryList = removeEmptyData.filter((category: any) => category.name.trim() !== 'NOT A DRAWING');
        setCategoriesArray([...nonDefaultCategpryList, ...defaultCategoryList]);
    }

    const handlePopOver = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    //close popover
    const handleClose = () => {
        setNewCategoryName('')
        setTrimCategoryValue('')
        setAnchorEl(null);
    };

    // add new category to the list
    const addNewCategory = () => {
        let newData: any = {
            name: trimCategoryValue.trim(),
            status: 'viewed'
        }
        let categoryList = [...categoriesArray];
        const res = categoryList.filter((item: any) => (item.name)?.toLowerCase() === trimCategoryValue?.toLowerCase()?.trim())
        if (res.length > 0) {
            Notification.sendNotification(`Category name '${trimCategoryValue.trim()}' is already exist in the list`, AlertTypes.warn)
        } else {
            categoryList.push(newData);
            setCategoriesArray(categoryList);
            DrawingLibDetailsDispatch(setDrawingCategoryDetails(categoryList));
            DrawingLibDetailsDispatch(setIsAutoUpdate(true));

            setNewCategoryName('')
            setTrimCategoryValue('')
            categoryList = [];
            newData = null;
        }
    }

    // sort the category list based on the status
    // const handleSortingChange = (event: any) => {
    //     setValue(event.target.value);
    //     if(event.target.value === 'not-viewed'){
    //         const cloneArray = [...categoriesArray]
    //         const filter1 = cloneArray.filter((item: any) => item.status !== 'viewed');
    //         const sortFilter1 = filter1?.sort((a: any, b: any) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
    //         const filter2 = cloneArray.filter((item: any) => item.status === 'viewed');
    //         const sortFilter2 = filter2?.sort((a: any, b: any) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));

    //         const res = [...sortFilter1, ...sortFilter2];

    //         const defaultCategoryList = res.filter((category: any) => category.name.trim() === 'NOT A DRAWING');
    //         const nonDefaultCategpryList = res.filter((category: any) => category.name.trim() !== 'NOT A DRAWING');
    //         setCategoriesArray([...nonDefaultCategpryList, ...defaultCategoryList]);

    //     }
    //     if(event.target.value === 'show-all'){
    //         sortCategoryByName(categoriesArray)
    //     }
    // };

    // mark as viewed function
    // const handleViewed = (index: number) => {
    //     const categoryList = [...categoriesArray];
    //     categoryList[index].status = 'viewed';
    //     setCategoriesArray(categoryList);
    //     DrawingLibDetailsDispatch(setDrawingCategoryDetails(categoryList));
    //     DrawingLibDetailsDispatch(setIsAutoUpdate(true));
    // }

    // add new category: input changes
    const handleCategoriesChange = (e: any) => {
        setTrimCategoryValue(e.target.value.trim())
        setNewCategoryName(e.target.value);
    }

    //update category name: onchange
    const handleDrawingCategory = (e: any, argIndex: number) => {
        e.stopPropagation();
        e.preventDefault();
        categoriesArray[argIndex].name = e.target.value;
        setCategoriesArray([...categoriesArray]);
    }

    // update category name to context
    const updateCategoryName = (e: any, argIndex: number) => {
        const category = [...categoriesArray]
        //validate duplicate catagory for edit
        const duplicateCount = category.filter((item: any) => (item.name)?.toLowerCase().trim() === e.target.value?.toLowerCase()?.trim())
        if (duplicateCount?.length > 1) {
            Notification.sendNotification(`Category name '${e.target.value?.trim()}' is already exist in the list`, AlertTypes.warn)
            updateSheetsCategory(oldCategoryValue)
            category[argIndex].name = oldCategoryValue;
            const removeEmptyData = category.filter((item: any) => item.name.trim() !== '');
            setCategoriesArray([...removeEmptyData]);
            DrawingLibDetailsDispatch(setDrawingCategoryDetails(removeEmptyData));
            DrawingLibDetailsDispatch(setIsAutoUpdate(true));
            setOldCategoryValue('')
        } else {
            updateSheetsCategory(e.target.value.trim())
            category[argIndex].name = e.target.value.trim();
            const removeEmptyData = category.filter((item: any) => item.name.trim() !== '');
            setCategoriesArray([...removeEmptyData]);
            DrawingLibDetailsDispatch(setDrawingCategoryDetails(removeEmptyData));
            DrawingLibDetailsDispatch(setIsAutoUpdate(true));
            setOldCategoryValue('');
            updateDrawingSheetCategory(oldCategoryValue, e.target.value.trim())
        }
        // handleViewed(argIndex);
    }

    const updateDrawingSheetCategory = async (oldValue: string, newValue: string) => {
        try {
            await client.mutate({
                mutation: UPDATE_DRAWING_SHEET_CATEGORY,
                variables: {
                    sourceId: pathMatch.params.documentId,
                    oldDrawingCategory: oldValue,
                    newDrawingCategory: newValue
                },
                context: { role: projectFeatureAllowedRoles.uploadDrawings, token: state.selectedProjectToken }
            })
        } catch (err: any) {
            Notification.sendNotification(err, AlertTypes.warn);
            console.log(err)
        }
    }

    const handleOnFocus = (e: any) => {
        setOldCategoryValue(e.target.value.trim());
    }

    const updateSheetsCategory = (newValue: string) => {
        let sheetsArray: any;
        if (DrawingLibDetailsState?.drawingSheetsDetails?.length > 0) {
            sheetsArray = [...DrawingLibDetailsState?.drawingSheetsDetails]
        }
        sheetsArray?.map((sheet: any) => {
            if (sheet.category && sheet.category === oldCategoryValue) {
                sheet.category = newValue
            }
        })
        DrawingLibDetailsDispatch(setDrawingSheetsDetails(sheetsArray));
        DrawingLibDetailsDispatch(setIsAutoUpdate(true));
    }

    return (
        <div className="categories">
            {/* <div className="categories__sort">
                <InputLabel required={false}>Sort by </InputLabel>
                <div className="categories__sort__radio-grouping">
                    <RadioGroup aria-label="sort-filter" name="catefories" value={value} onChange={handleSortingChange}>
                        <FormControlLabel value="show-all" control={<Radio color={'primary'} />} label="Show All" />
                        <FormControlLabel value="not-viewed" control={<Radio color={'primary'} />} label="Not Viewed" />
                        <FormControlLabel value="only-issues" disabled={true} control={<Radio color={'primary'} />} label="Issuses" />
                    </RadioGroup>
                </div>
            </div> */}
            <div className="categories__lists">
                {
                    categoriesArray?.length > 0 ? (
                        <>
                            <div className="categories__lists__header">
                                <div className="categories__lists__header__text">
                                    Item
                                </div>
                                <div className="categories__lists__header__add" onClick={(e: any) => handlePopOver(e)} >
                                    +Add Item
                                </div>
                            </div>

                            <div className="categories__lists__item">
                                {
                                    categoriesArray?.map((category: any, index: number) => (
                                        <div key={`category-name-${index}`}>
                                            {
                                                category.name !== defaultCategory.NOT_A_DRAWING ? (
                                                    <>
                                                        <div className="categories__lists__category">
                                                            <div className="categories__lists__category__name">
                                                                <Tooltip title={`${category.name}`} aria-label="delete category">
                                                                    <TextField
                                                                        className="categoryInput"
                                                                        type="text"
                                                                        fullWidth
                                                                        autoComplete="search"
                                                                        placeholder=''
                                                                        variant='outlined'
                                                                        value={category.name}
                                                                        onChange={(e: any) => { handleDrawingCategory(e, index) }}
                                                                        onBlur={(e: any) => { updateCategoryName(e, index) }}
                                                                        onFocus={(e: any) => { handleOnFocus(e) }}
                                                                    />
                                                                </Tooltip>
                                                            </div>
                                                            <div className="categories__lists__category__action">
                                                                <div className="categories__lists__category__action__delete">
                                                                </div>
                                                                {/* {
                                                                    category.name !== 'NOT A DRAWING' && (
                                                                        <div className="categories__lists__category__action__status">
                                                                            {
                                                                                category.status === 'viewed' ? (
                                                                                    <span>{category.status}</span>
                                                                                ) : (
                                                                                    <Tooltip title={'Mark as viewed'} aria-label="delete category">
                                                                                        <label>
                                                                                            <VisibilityOffIcon onClick={() =>  handleViewed(index)}/>
                                                                                        </label>
                                                                                    </Tooltip>
                                                                                )
                                                                            }
                                                                        </div>
                                                                    )

                                                                } */}
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="categories__lists__category">
                                                            <div className="categories__lists__category__name">
                                                                <Tooltip title={`${category.name}`} aria-label="delete category">
                                                                    <TextField
                                                                        className="categoryInput"
                                                                        type="text"
                                                                        fullWidth
                                                                        autoComplete="search"
                                                                        placeholder=''
                                                                        variant='outlined'
                                                                        value={category.name}
                                                                        disabled={category.name === defaultCategory.NOT_A_DRAWING}
                                                                    />

                                                                </Tooltip>
                                                            </div>
                                                            {/* {
                                                                 category.name !== 'NOT A DRAWING' && (
                                                                    <div className="categories__lists__category__action">
                                                                        <div className="categories__lists__category__action__status">
                                                                            {
                                                                                category.status === 'viewed' ? (
                                                                                    <span>{category.status}</span>
                                                                                ) : (
                                                                                    <Tooltip title={'Mark as viewed'} aria-label="delete category">
                                                                                        <label>
                                                                                            <VisibilityOffIcon onClick={() =>  handleViewed(index)}/>
                                                                                        </label>
                                                                                    </Tooltip>
                                                                                )
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                 )
                                                            } */}

                                                        </div>
                                                    </>
                                                )

                                            }

                                        </div>
                                    ))
                                }
                            </div>
                        </>
                    ) : (
                        <div className="categories__lists__no-data">
                            <div className="categories__lists__no-data__message">
                                Please add the drawing categories that you would like
                                to use to group the drawing sheets (Example:
                                Architectural, Structural, Mechanical, etc,.)
                            </div>
                            <div className="categories__lists__no-data__add">
                                <Button
                                    type="submit"
                                    data-testid={'add-category'}
                                    variant="outlined"
                                    className="btn-primary"
                                    onClick={(e: any) => handlePopOver(e)}
                                >
                                    Add Category
                                </Button>
                            </div>
                        </div>
                    )
                }
            </div>


            {/* popover */}
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <div className="add-category">
                    <InputLabel required={false}>Categories </InputLabel>
                    <TextField
                        type="text"
                        fullWidth
                        autoComplete="search"
                        placeholder='Enter set title'
                        variant='outlined'
                        value={newCategoryName}
                        onChange={(e) => handleCategoriesChange(e)}
                    />
                    <div className="add-category__action">
                        <div className="add-category__action__cancel" onClick={handleClose}>Cancel</div>
                        <Button
                            type="submit"
                            data-testid={'add-category'}
                            variant="outlined"
                            className="btn-primary"
                            onClick={addNewCategory}
                            size={'small'}
                            disabled={!newCategoryName}
                        >
                            Add
                        </Button>
                    </div>
                </div>
            </Popover>
        </div>
    )
}