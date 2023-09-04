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
import React from 'react';
import PMM from 'src/assets/images/ProjectMaterialMaster.jpg';
import CustomToolTip from '../../../../shared/components/CustomToolTip/CustomToolTip';

const ClassificationCodeTable = (props: any) => {
  return props.classificationCodes.length > 0 ? (
    <TableContainer>
      <Table stickyHeader className="ClassificationCodeTable">
        <TableHead className="ClassificationCodeTable__tableHead">
          <TableRow className="ClassificationCodeTable__tableRow">
            <TableCell className="ClassificationCodeTableHeader">
              <div className="ClassificationCodeTableHeader__text-cell">
                Classification Code
              </div>
            </TableCell>
            <TableCell className="ClassificationCodeTableHeader">
              <div className="ClassificationCodeTableHeader__text-cell">
                Classification Code Name
              </div>
            </TableCell>
            <TableCell className="ClassificationCodeTableHeader">
              <div className="ClassificationCodeTableHeader__text-cell">
                Parent Classification Code
              </div>
            </TableCell>
            <TableCell className="ClassificationCodeTableHeader">
              <div className="ClassificationCodeTableHeader__text-cell">
                UOM
              </div>
            </TableCell>
            <TableCell className="ClassificationCodeTableHeader">
              <div className="ClassificationCodeTableHeader__text-cell">
                Classification Code Type
              </div>
            </TableCell>

            <TableCell className="ClassificationCodeTableHeader">
              <div className="ClassificationCodeTableHeader__text-cell">
                Description
              </div>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.classificationCodes.map((el: any, index: any) => {
            return (
              <TableRow key={el.id}>
                <TableCell>
                  <CustomToolTip
                    element={el.classificationCode}
                    textLength={25}
                    className={'ClassificationCodeTableHeader__text-cell'}
                  />
                </TableCell>
                <TableCell>
                  <CustomToolTip
                    element={el.classificationCodeName}
                    textLength={25}
                    className={'ClassificationCodeTableHeader__text-cell'}
                  />
                </TableCell>
                <TableCell>{el.parentClassificationCode}</TableCell>
                <TableCell>
                  <div className="unitWidth d-flex">{el.UOM}</div>
                </TableCell>
                <TableCell>{el.classificationCodeType}</TableCell>
                <TableCell>{el.description}</TableCell>
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
        No Classification Code found in your project
      </Typography>
    </Box>
  );
};

export default ClassificationCodeTable;
