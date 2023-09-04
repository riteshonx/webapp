import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import './BimTable.scss'
import RevetImg from '../../../../../assets/images/rvt-file.svg';
import IfcImg from '../../../../../assets/images/ifc-file.svg';
import moment from 'moment';

export default function BimTable(props: any) {

    return (
        <TableContainer className="bimTableContainer" component={Paper}>
            <Table className="bimTable" aria-label="simple table">
                <TableHead className="bimTableHead">
                    <TableRow>
                        <TableCell>File Details</TableCell>
                        <TableCell align="left">Category Count</TableCell>
                        <TableCell align="left">Element Count</TableCell>
                        <TableCell align="left">Uploaded by</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow className="bimTableRow" key='bim-details'>
                        <TableCell className="fileNameCell" component="th" scope="row">
                            {(props.file.type !== '') ? 
                                <img src={props.file.type === 'ifc'? IfcImg : RevetImg } alt="file-icon"/>
                            : null}
                            <span>
                                <div>
                                    {props.file.fileName}<br />
                                    <span className="fileDetails">
                                        { props.file.fileLastModified ? <span className="file-property">
                                            <span className="file-property-key">Date modified</span>
                                            <span>{moment.utc(props.file.fileLastModified).format('DD-MMM-YYYY [at] h:mm:ss A')}</span>
                                        </span> : null }
                                        <span className="file-property">
                                            <span className="file-property-key">Size</span>
                                            <span>{props.file.size}</span>
                                        </span>
                                    </span>
                                </div>
                            </span>
                        </TableCell>
                        <TableCell align="left">{props.file.categoryCount}</TableCell>
                        <TableCell align="left">{props.file.elementCount}</TableCell>
                        <TableCell align="left">{props.file.uploadedBy}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    );
}