import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import { Box } from '@mui/system';
import moment from 'moment';
import React from 'react';
import PMM from 'src/assets/images/ProjectMaterialMaster.jpg';
import CustomToolTip from '../../../../shared/components/CustomToolTip/CustomToolTip';

const ChangeOrderTable = (props: any) => {
  return props.changeOrder.length > 0 ? (
    <TableContainer>
      <Table stickyHeader className="ChangeOrder">
        <TableHead className="ChangeOrder__tableHead">
          <TableRow className="ChangeOrder__tableRow">
            <TableCell className="ChangeOrderHeader">
              <div className="ChangeOrderHeader__text-cell">
                Change Order Number
              </div>
            </TableCell>
            <TableCell className="ChangeOrderHeader">
              <div className="ChangeOrderHeader__text-cell">Title</div>
            </TableCell>
            <TableCell className="ChangeOrderHeader">
              <div className="ChangeOrderHeader__text-cell">Description</div>
            </TableCell>
            <TableCell className="ChangeOrderHeader" width="10%">
              <div className="ChangeOrderHeader__text-cell">Date</div>
            </TableCell>
            <TableCell className="ChangeOrderHeader">
              <div className="ChangeOrderHeader__text-cell">Linked Budget</div>
            </TableCell>

            <TableCell className="ChangeOrderHeader">
              <div className="ChangeOrderHeader__text-cell">Quoted Amount</div>
            </TableCell>

            <TableCell className="ChangeOrderHeader">
              <div className="ChangeOrderHeader__text-cell">
                Estimated Amount
              </div>
            </TableCell>
            <TableCell className="ChangeOrderHeader">
              <div className="ChangeOrderHeader__text-cell">
                Approved Amount
              </div>
            </TableCell>
            <TableCell className="ChangeOrderHeader">
              <div className="ChangeOrderHeader__text-cell">Status</div>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.changeOrder.map((el: any, index: any) => {
            return (
              <TableRow key={index}>
                <TableCell>
                  <CustomToolTip
                    element={el.changeOrderNumber}
                    textLength={25}
                    className={'ChangeOrderHeader__text-cell'}
                  />
                </TableCell>
                <TableCell>{el.title}</TableCell>
                <TableCell>
                  {el.description?.length > 25 ? (
                    <CustomToolTip
                      element={el.description}
                      textLength={25}
                      className={'ChangeOrderHeader__text-cell'}
                    />
                  ) : (
                    <span>{el.description}</span>
                  )}
                </TableCell>
                <TableCell width="10%">
                  <div className="unitWidth d-flex">
                    {el.dateOfRequest
                      ? moment(el.dateOfRequest).format('DD MMM yyyy')
                      : '-'}
                  </div>
                </TableCell>
                <TableCell>{el.budgetLineItemTitle}</TableCell>
                <TableCell>{el.quotedAmount}</TableCell>
                <TableCell>{el.estimatedAmount}</TableCell>
                <TableCell>{el.approvedAmount}</TableCell>
                <TableCell>{el.status}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  ) : (
    <Box
      display="flex"
      flexDirection="column"
      gap="1.5rem"
      alignItems="center"
      height="100%"
      justifyContent="center"
    >
      <Box component="img" src={PMM} />

      <Typography color="textSecondary">
        No Change Order found in your project
      </Typography>
    </Box>
  );
};

export default ChangeOrderTable;
