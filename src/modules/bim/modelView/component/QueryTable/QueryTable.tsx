import React, { useState, useContext, useEffect } from 'react'
import './QueryTable.scss'
import { attributeList, operatorsList, attributeType } from '../../../constants/query'
import { stateContext } from '../../../../root/context/authentication/authContext';
import { bimContext } from '../../../contextAPI/bimContext';
import { client } from '../../../../../services/graphql';
import { FETCH_BIM_QUERY_BY_MODEL } from '../../../graphql/bimQuery';
import { projectFeatureAllowedRoles } from '../../../../../utils/role';
import Dialog from '@mui/material/Dialog';
import { setIsLoading } from '../../../../root/context/authentication/action';
import { fetchElementName } from '../../../container/utils';

let elementNames: any = {};

export default function QueryTable(props: any) {
    const [queryList, setQueryList] = useState<any[]>([]);
    const [clauseCount, setClauseCount] = useState(1);
    const context: any = useContext(bimContext);
    const { dispatch, state }: any = useContext(stateContext);

    useEffect(() => {
        if (props.open) {
            fetchQuery()
        }
        return () => { elementNames = {}; }
    }, [props.open])

    async function fetchQuery() {
        dispatch(setIsLoading(true))
        const modelIds = (context.state.isAssembly) ? context.state.assemblyModelList : [context.state.activeModel]
        elementNames = await fetchElementName(state.selectedProjectToken, projectFeatureAllowedRoles.viewBimModel, modelIds);
        const queryList = await fetchData(FETCH_BIM_QUERY_BY_MODEL, { "modelId": context.state.activeModel });
        if (queryList && queryList.bimQuery) {
            setQueryList(queryList.bimQuery)
        }
        dispatch(setIsLoading(false))
    }

    useEffect(()=>{
        let max = 1;
        queryList.forEach((query)=>{
            const len = query.queryParams.length;
            if(len > max){
                max = len;
            }
        });
        setClauseCount(max)
    },[queryList,setClauseCount])

    function createClauseHead() {
        const clauseList= [];
        for (let index = 1; index <= clauseCount; index++) {
            clauseList.push(
                <React.Fragment key={index}>
                    <th colSpan={3}>{"Clause " + index}</th>
                    {index !== clauseCount && <th></th>}
                </React.Fragment>
            )
        }
        return clauseList;
    }

    function createAttrHead() {
        const headList= [];
        for (let index = 1; index <= clauseCount; index++) {
            headList.push(
                <React.Fragment key={index}>
                    <td>{"Attribute " + index}</td>
                    <td>Operator</td>
                    <td>{"Value of Attribute  " + index}</td>
                    {index !== clauseCount && <td></td>}
                </React.Fragment>
            )
        }
        return headList;
    }

    function createClauseList(queryParams: any) {
        const clauseList = [];
        for (let index = 0; index < clauseCount; index++) {
            const query = queryParams[index];
            let queryDetail;
            if(query){
                const attribute: attributeType  = (query.type === "non_priorty") ? 
                    {...attributeList[0], value: query.attribute, title: query.attribute }: 
                    attributeList.find(attrb => attrb.value === query.attribute) || attributeList[1]; 
                const joinOperator = queryParams[index + 1]?.joinOperator || "";
                const queryValue = getSanitizedQueryValues(query.values, query);
                queryDetail = (
                    <>
                        <td className="type2">{attribute.title}</td>
                        <td className="type3">{operatorsList[attribute.type].find((operator: any) => operator.value === query.attributeOperator)?.title}</td>
                        <td className="type4">{queryValue}</td>
                        { index + 1 !== clauseCount && <td className="type5">{joinOperator}</td> }
                    </>
                )
            }else{
                queryDetail = (
                    <>
                        <td className="type2"></td>
                        <td className="type3"></td>
                        <td className="type4"></td>
                        { index+1 !== clauseCount && <td className="type5"></td> }
                    </>
                )
            }
            clauseList.push(queryDetail);
        }
        return clauseList;
    }

    const getSanitizedQueryValues = (value: any, query: any) => {
        if (query.attribute === 'sourceId' && query.type !== "spatial" ) return value.map((a: any) => elementNames[a] || a).join(",");

        if (context.state.isAssembly) {
            return Array.isArray(value) ? value.join(",") : value
        } else {
            return Array.isArray(value) ?
                value.map((val: string) => val.replace("OST_", "")).join(",")
                : value.replace("OST_", "")
        }
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
            <Dialog className="query-table-dialog" onClose={props.handleClose} open={props.open} maxWidth={"lg"}>
                <table className="bimQueryTable">
                    <thead>
                        <tr className="bimClauseHead" key="bimClauseHead">
                            <th colSpan={2}></th>
                            {createClauseHead()}
                        </tr>
                        <tr className="bimTableHead" key="bimTableHead">
                            <td>
                                <div className="tableNoHeader">No.</div>
                            </td>
                            <td>Name</td>
                            {createAttrHead()}
                        </tr>
                    </thead>
                    <tbody>
                        {queryList.map((query: any, index: number) => {
                            return (
                                <tr title="Click on the row to add the query" className="query-row" key={query.id} onClick={() => {props.onSelectQuery(query.id, query.queryParams, query.queryname)}}>
                                    <td className="tableNo">{index + 1}</td>
                                    <td className="type1">{query.queryname}</td>
                                    {createClauseList(query.queryParams)}
                                </tr>
                            )
                        })}
                        {(queryList.length === 0) ? <tr><td colSpan={6}>No queries added under this model.</td></tr>: null}
                    </tbody>
                </table>
            </Dialog>
        </div>
    );
}