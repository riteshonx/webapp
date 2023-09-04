import React, { useState, useContext, useEffect } from 'react'
import './ElementTable.scss'
import { elementPropList } from '../../../constants/query'
import { stateContext } from '../../../../root/context/authentication/authContext';
import { client } from '../../../../../services/graphql';
import { FETCH_BIM_VIEW_BY_VIEW, FETCH_ELEM_PROP_BY_VIEW_OFFSET } from '../../../graphql/bimQuery';
import { projectFeatureAllowedRoles } from '../../../../../utils/role';
import Dialog from '@material-ui/core/Dialog';
import CloseIcon from '@material-ui/icons/Close';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { setIsLoading } from '../../../../root/context/authentication/action';
import InfiniteScroll from "react-infinite-scroll-component";
import { bimContext } from '../../../contextAPI/bimContext';
import { useBimQueryUpdater } from "../../../container/queryResultUpdaterHook"
import { createFilterList } from '../../../container/utils';


export default function ElementTable(props: any) {
    const [elementList, setElementList] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [pageNum, setPageNum] = useState(0);
    const [isSchedule, setIsSchedule] = useState(false);
    const { dispatch, state }: any = useContext(stateContext);
    const context: any = useContext(bimContext);
    const [resUpdateViewId, setResUpdateViewId] = useState<string | null>(null);
    const [resUpdateFilterSet, setResUpdateFilterSet] = useState<[] | null>(null);

    useEffect(() => {
        if (props.open) {
            dispatch(setIsLoading(true))
            const isSystemViewImport = context.state.systemViewList.find((view: any) => props.id === view.id && view.isImport);
            const isSavedViewImport = context.state.savedViewList.find((view: any) => props.id === view.id && view.isImport);
            isSystemViewImport ? setIsSchedule(true) : null;
            (isSystemViewImport || isSavedViewImport) ? importViewFilters() : fetchQuery()
        }

        return (()=> {setElementList([]); setTotalCount(0); setPageNum(0)})
    }, [props.open])

    async function importViewFilters() {
        const data = await fetchData(FETCH_BIM_VIEW_BY_VIEW, {"id": props.id})
        if(data.bimView.length > 0 && data.bimView[0].bimViewFilterAssociations) {
            const filterSet = createFilterList(data.bimView[0].bimViewFilterAssociations);
            setResUpdateFilterSet(filterSet);
            setResUpdateViewId(props.id);
        }
    }

    async function fetchQuery(pageNo = 0, offset = 0, limit = 100) {
        const elemtData = await fetchData(FETCH_ELEM_PROP_BY_VIEW_OFFSET, { 
            "viewId": props.id,
            "offset": offset,
            "limit": limit,
        });
        if (elemtData && elemtData.getElementPropertiesByView_query?.data?.elements) {
            setElementList([...elementList, ...elemtData.getElementPropertiesByView_query?.data?.elements])
            setTotalCount(elemtData.getElementPropertiesByView_query?.data?.totalCount);
            setPageNum(pageNo);
        }
        dispatch(setIsLoading(false))
    }

    function createAttrHead() {
        return elementPropList.map((prop, index) => <td key={index}>{prop.tittle}</td>);
    }

    function createClauseList(elementParams: any) {
        return elementPropList.map((prop, index) => 
            prop.parent ? <td key={index} className="type5">{(elementParams[prop.parent] && elementParams[prop.parent][prop.key]) || '-'}</td> 
                :<td key={index} className="type5">{elementParams[prop.key] || '-'}</td>
        )
    }

    const fetchData = async (query: any, variables: any) => {
        let responseData;
        try {
            responseData = await client.query({
                query: query,
                variables: variables,
                fetchPolicy: 'network-only',
                context: { role: projectFeatureAllowedRoles.viewBimModel, token: state.selectedProjectToken }
            });

        } catch (error: any) {
            console.log(error)
        } finally {
            return (responseData?.data) ? responseData.data : null;
        }
    }

    return (
        <div>
            {useBimQueryUpdater(resUpdateViewId, resUpdateFilterSet, () => fetchQuery(), isSchedule)}
            <Dialog className="element-table-dialog" onClose={props.handleClose} open={props.open} maxWidth={"xl"} disableBackdropClick={true} onKeyDown={(e: any)=>{e.stopPropagation()}}>
            <DialogTitle id="scroll-dialog-title" className="dialogTitle">
                {`Showing ${ elementList.length === totalCount ? totalCount : 100  * (pageNum + 1)} of ${totalCount} entries`}
                <CloseIcon onClick={props.handleClose} />
            </DialogTitle>
                <DialogContent id="scrollable_list" dividers={false}>    
                    <InfiniteScroll
                        dataLength={elementList.length}
                        next={() => fetchQuery(pageNum + 1, 100 * (pageNum + 1))}
                        hasMore={props.open}
                        loader={elementList.length === totalCount ? "" : <h4>Loading...</h4>}
                        scrollableTarget="scrollable_list"
                        height={500}
                    >
                        <table className="bimElementTable">
                            <thead>
                                <tr className="bimTableHead" key="bimTableHead">
                                    <td key="no">No.</td>
                                    {createAttrHead()}
                                </tr>
                            </thead>
                            <tbody>
                                {elementList.map((element: any, index: number) => {
                                    return (
                                        <tr className="query-row" key={element.id}>
                                            <td  key="tableNo" className="tableNo">{index + 1}</td>
                                            {createClauseList(element)}
                                        </tr>
                                    )
                                })}
                                {(elementList.length === 0) ? <tr><td colSpan={6}>No Element added under this view.</td></tr>: null}
                            </tbody>
                        </table>
                    </InfiniteScroll>
                </DialogContent>
            </Dialog>
        </div>
    );
}