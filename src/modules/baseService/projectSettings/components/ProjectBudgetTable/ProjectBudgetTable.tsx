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

const ProjectBudgetTable = (props: any) => {
  return props.projectBudget.length > 0 ? (
    <TableContainer>
      <Table stickyHeader className="ProjectBudget">
        <TableHead className="ProjectBudget__tableHead">
          <TableRow className="ProjectBudget__tableRow">
            <TableCell className="ProjectBudgetHeader">
              <div className="ProjectBudgetHeader__text-cell">Budget Title</div>
            </TableCell>
            <TableCell className="ProjectBudgetHeader">
              <div className="ProjectBudgetHeader__text-cell">Description</div>
            </TableCell>
            <TableCell className="ProjectBudgetHeader">
              <div className="ProjectBudgetHeader__text-cell">Date</div>
            </TableCell>
            <TableCell className="ProjectBudgetHeader">
              <div className="ProjectBudgetHeader__text-cell">Cost Type</div>
            </TableCell>
            <TableCell className="ProjectBudgetHeader">
              <div className="ProjectBudgetHeader__text-cell">Total Cost</div>
            </TableCell>

            <TableCell className="ProjectBudgetHeader">
              <div className="ProjectBudgetHeader__text-cell">Allowance</div>
            </TableCell>

            <TableCell className="ProjectBudgetHeader">
              <div className="ProjectBudgetHeader__text-cell">Contingency</div>
            </TableCell>
            <TableCell className="ProjectBudgetHeader">
              <div className="ProjectBudgetHeader__text-cell">Total Budget</div>
            </TableCell>
            <TableCell className="ProjectBudgetHeader">
              <div className="ProjectBudgetHeader__text-cell">
                Classification Code
              </div>
            </TableCell>
            <TableCell className="ProjectBudgetHeader">
              <div className="ProjectBudgetHeader__text-cell">UOM</div>
            </TableCell>
            <TableCell className="ProjectBudgetHeader">
              <div className="ProjectBudgetHeader__text-cell">
                Original Budget Amount
              </div>
            </TableCell>
            <TableCell className="ProjectBudgetHeader">
              <div className="ProjectBudgetHeader__text-cell">
                Modification Amount
              </div>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.projectBudget.map((el: any, index: any) => {
            return (
              <TableRow key={index}>
                <TableCell>
                  <CustomToolTip
                    element={el.budgetLineItemTitle}
                    textLength={25}
                    className={'ProjectBudgetHeader__text-cell'}
                  />
                </TableCell>
                <TableCell>
                  {el.description?.length > 25 ? (
                    <CustomToolTip
                      element={el.description}
                      textLength={25}
                      className={'ProjectBudgetHeader__text-cell'}
                    />
                  ) : (
                    <span>{el.description}</span>
                  )}
                </TableCell>
                <TableCell>{el.date}</TableCell>
                <TableCell>
                  <div className="unitWidth d-flex">{el.costType}</div>
                </TableCell>
                <TableCell>{el.totalCost}</TableCell>
                <TableCell>{el.allowance}</TableCell>
                <TableCell>{el.contingency}</TableCell>
                <TableCell>{el.totalBudget}</TableCell>
                <TableCell>{el.classificationCode}</TableCell>
                <TableCell>{el.UOM}</TableCell>
                <TableCell>{el.originalBudgetAmount}</TableCell>
                <TableCell>{el.modificationAmount}</TableCell>
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
        No Project Budget found in your project
      </Typography>
    </Box>
  );
};

export default ProjectBudgetTable;
