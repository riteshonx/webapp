import React, { useContext, useState, useEffect } from 'react';
import './BimProps.scss'
import { stateContext } from '../../../../../root/context/authentication/authContext';
import { bimContext } from '../../../../contextAPI/bimContext';
import DraggableComponent from '../../../component/DraggableComponent/DraggableComponent';
import { FETCH_ELEMENT_PROPS_BY_ID } from '../../../../graphql/bimQuery';
import { projectFeatureAllowedRoles } from '../../../../../../utils/role';
import { client } from '../../../../../../services/graphql';
import { Close } from "@material-ui/icons";
import Tooltip from '@material-ui/core/Tooltip';
import { CircularProgress } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { findAssmbyElmnt } from '../../../../container/utils';

const draggableStyle = {
    position: "absolute",
    right: "15%",
    top: "50px",
    background: "#F9F9F9",
    border: "1px solid #EDEDED",
    boxSizing: "border-box",
    boxShadow: "0px 0px 8px rgba(0, 0, 0, 0.25)"
};

export default function BimProps(props: any) {
    const { dispatch, state }: any = useContext(stateContext);
    const context: any = useContext(bimContext);
    const [elementData, setElementData] = useState<any>(null);
    const [showLoading, setShowLoading] = useState<any>(false);

    useEffect(() => {
        (context.state.highLightedElementId) ? fetchElmentData() : setElementData(null);
    }, [context.state.highLightedElementId])

    const fetchElmentData = async () => {
        document.getElementById('bimProps-table')?.scrollTo(0,0);
        setShowLoading(true);
        let elementId = context.state.highLightedElementId;
        let modelId = context.state.activeModel;
        if (context.state.isAssembly) {
           [elementId, modelId] = findAssmbyElmnt(elementId, context.state.assemblyModelList);
        }
        const elemtData = await fetchData(FETCH_ELEMENT_PROPS_BY_ID, { "_sourceId": elementId, "modelId":  modelId});
        (elemtData?.bimElementProperties[0]?.sourceProperties) ?
            setElementData(elemtData?.bimElementProperties[0]?.sourceProperties) : setElementData(null);
        setShowLoading(false);
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
        <DraggableComponent styles={draggableStyle}>
            <div className="bimProps">
                <div className='title'>
                    <div>Properties</div>
                    <Tooltip title={"Close"} aria-label={"Close to Properties"}>
                        <Close onClick={() => props.onClose()} fontSize="small" className='bimCloseButton' />
                    </Tooltip>
                </div>
                {showLoading ? <div className='loadingIndctor'><CircularProgress color="inherit" /></div> :
                    <div className='content' id="bimProps-table" >
                        <div className='info'>
                            {!context.state.highLightedElementId && (context.state.querySelectedElements?.length > 1 ? "Multiple elements are selected. Please select one element to view properties." : "No element is selected.")}
                            {context.state.highLightedElementId && !elementData && "No data found for selected element."}
                        </div>
                        {elementData &&
                            <Table size="small">
                                <TableBody>
                                    <TableRow>
                                        <TableCell align="left" width={"40%"}>ElementId</TableCell>
                                        <TableCell align="left" width={"60%"}>{elementData.handle}</TableCell>
                                    </TableRow>
                                    {Object.keys(elementData).sort().map((key, index) => {
                                        return key !== 'handle' && <TableRow key={index}>
                                            <TableCell align="left">{key}</TableCell>
                                            <TableCell align="left">{elementData[key]}</TableCell>
                                        </TableRow>
                                    })}
                                </TableBody>
                            </Table>
                        }
                    </div>
                }
            </div>
        </DraggableComponent>
    );
}
