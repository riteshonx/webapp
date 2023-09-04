import { Button, Typography } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { gantt } from 'dhtmlx-gantt';
import React, { useContext, useEffect, useState } from 'react';
import { match, useRouteMatch } from 'react-router-dom';
import { FETCH_PROJECT_BY_ID } from 'src/graphhql/queries/projects';
import { Carbon } from 'src/modules/baseService/projectSettings/components/ProjectMaterialMaster/MaterialMasterActions';
import ActiveIndianRupeeIcon from '../../../../../../assets/images/active-indian-rupee.svg';
import ActiveMaterialIcon from '../../../../../../assets/images/active-material.svg';
import ActiveMonetizationIcon from '../../../../../../assets/images/active-monetization_on.svg';
import ActivePoundIcon from '../../../../../../assets/images/active-pound.svg';
import MaterialIcon from '../../../../../../assets/images/material.svg';
import MonetizationIcon from '../../../../../../assets/images/monetization_on.svg';
import NonActiveIndianRupeeIcon from '../../../../../../assets/images/NonActiveIndianRupee.svg';
import NonActivePoundIcon from '../../../../../../assets/images/NonActivePound.svg';
import DeleteIcon from '../../../../../../assets/images/task_details_constraint_delete.svg';
import {
  decodeExchangeToken,
  decodeProjectExchangeToken,
} from '../../../../../../services/authservice';
import { client } from '../../../../../../services/graphql';
import { materialHeaderInfo } from '../../../../../../utils/MaterialConstant';
import { stateContext } from '../../../../../root/context/authentication/authContext';
import ConfirmDialog from '../../../../../shared/components/ConfirmDialog/ConfirmDialog';
import CustomToolTip from '../../../../../shared/components/CustomToolTip/CustomToolTip';
import CommonEditProjectPlanContext from '../../../../context/commonEditProjectPlan/commonEditProjectPlanContext';
import { permissionKeysByAssigneeAndToken } from '../../../../permission/scheduling';
import CommonAddMaterialTable from '../../../CommonAddMaterialTable/CommonAddMaterialTable';
import TextFieldCustom from '../../../TextFieldCustom/TextFieldCustom';
import './CommonEditTaskDetailsViewResources.scss';

export interface Params {
  id: string;
}

const CommonEditTaskDetailsViewResources = (props: any) => {
  const commonEditProjectPlanContext = useContext(CommonEditProjectPlanContext);
  const [activeTab, setActiveTab] = useState('material');

  const {
    projectTokens,
    addBulkMaterialToTask,
    getProjectTaskMaterial,
    currentTaskMaterial,
    deleteProjectTaskAssociatedMaterial,
    updateProjectTaskAssociatedMaterial,
    updateCommitmentCost,
    updatePayoutCost,
    projectMaterials,
    getProjectMaterials,
    clearProjectMaterials,
  } = commonEditProjectPlanContext;
  commonEditProjectPlanContext;
  const { currentTask } = props;
  const [addMaterialPop, setAddMaterialPop] = useState(false);
  const [deleteConfirmationPop, setDeleteConfirmationPop] = useState(false);
  const [projectId, setProjectId] = useState<any | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<any | null>({
    id: '',
  });

  const [taskCosts, setTaskCosts] = useState({
    commitmentCost: 0,
    payoutCost: 0,
  });

  const authContext: any = useContext(stateContext);
  const [projectDetails, setProjectDetails] = useState<any>();
  const pathMatch: match<Params> = useRouteMatch();

  useEffect(() => {
    setProjectId(
      Number(
        decodeProjectExchangeToken(authContext.state.selectedProjectToken)
          .projectId
      )
    );
  }, []);

  useEffect(() => {
    if (currentTask && projectTokens[currentTask.projectId]) {
      fetchProjectDetail();
    }
  }, [currentTask, projectTokens]);

  useEffect(() => {
    if (currentTask.id) {
      getProjectTaskMaterial(currentTask.id);
    }
    setTaskCosts({
      commitmentCost: currentTask.commitmentCost,
      payoutCost: currentTask.payoutCost,
    });
  }, [currentTask]);

  const addMaterial = (selectedMaterial: any) => {
    const tempMaterial = selectedMaterial.map((material: any) => ({
      projectMaterialId: material.id,
      projectId: currentTask.projectId,
      quantityAllocated: material.quantityAllocated,
      quantityConsumed: material.quantityConsumed
        ? material.quantityConsumed
        : null,
      taskId: currentTask.id,
    }));
    addBulkMaterialToTask(tempMaterial);
  };

  const onMaterialQuantityChange = (e: any, row: any, index: any) => {
    if (!e.target.value) {
      e.target.value = '';
      setSelectedMaterial({ ...row, [e.target.name]: null });
    } else {
      setSelectedMaterial({ ...row, [e.target.name]: e.target.value });
    }
  };

  const updateMaterial = () => {
    if (selectedMaterial.id) {
      const tempSelectedMaterial = {
        ...selectedMaterial,
        quantityAllocated:
          selectedMaterial.quantityAllocated == ''
            ? 0
            : parseFloat(selectedMaterial.quantityAllocated),
        quantityConsumed:
          selectedMaterial.quantityConsumed == ''
            ? 0
            : parseFloat(selectedMaterial.quantityConsumed),
      };
      updateProjectTaskAssociatedMaterial(tempSelectedMaterial);
      setSelectedMaterial({ id: '' });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmationPop(false);
    setSelectedMaterial({ id: '' });
  };

  const onKeyDown = (e: any, row: any, type: any) => {
    if (e.key === 'Escape' && type === 'quantityConsumed') {
      e.stopPropagation();
      setSelectedMaterial({ ...row, quantityConsumed: row.quantityConsumed });
    }
    if (e.key === 'Escape' && type === 'quantityAllocated') {
      e.stopPropagation();
      setSelectedMaterial({ ...row, quantityAllocated: row.quantityAllocated });
    }
    if (e.charCode === 45 || e.charCode === 46) {
      e.preventDefault();
      return false;
    }

    // try {
    // if (e.charCode === 48 && e.target.value < 0) {
    //   e.preventDefault();
    //   return false;
    // }
    // if (e.target.value < 0) {
    //   e.target.value = null;
    // }
    // } catch (e) {}
  };

  const onKeyDownCosts = (e: any, cost: string) => {
    if (e.charCode === 45) {
      e.preventDefault();
      return false;
    }

    if (e.key === 'Escape' && cost === 'commitmentCost') {
      e.stopPropagation();
      setTaskCosts({
        ...taskCosts,
        commitmentCost: currentTask.commitmentCost,
      });
    }
    if (e.key === 'Escape' && cost === 'payoutCost') {
      e.stopPropagation();
      setTaskCosts({ ...taskCosts, payoutCost: currentTask.payoutCost });
    }

    try {
      if (e.charCode === 48 && e.target.value < 0) {
        e.preventDefault();
        return false;
      }
      // if (e.target.value <= 0) {
      //   e.target.value = '';
      // }
    } catch (e) {}
  };

  const getQuantity = (row: any, quantityType: string) => {
    if (selectedMaterial.id && selectedMaterial.id === row.id) {
      return selectedMaterial[quantityType] == null
        ? ''
        : selectedMaterial[quantityType];
    } else {
      return row[quantityType] == null ? '' : row[quantityType];
    }
  };

  const onCostChange = (event: any) => {
    if (event.target.value < 0) {
      setTaskCosts({ ...taskCosts, [event.target.name]: '' });
      event.target.value = '';
    } else {
      let costValue = event.target.value;
      costValue =
        event.target.value.indexOf('.') >= 0
          ? event.target.value.substr(0, event.target.value.indexOf('.')) +
            event.target.value.substr(event.target.value.indexOf('.'), 3)
          : event.target.value;
      setTaskCosts({ ...taskCosts, [event.target.name]: costValue });
    }
  };

  const saveCosts = (e: any, type: any) => {
    // if (e.target.value < 0 || e.target.value == '') {
    //   setTaskCosts({
    //     commitmentCost: currentTask.commitmentCost,
    //     payoutCost: currentTask.payoutCost,
    //   });
    //   return;
    // }
    if (type === 'commitmentCost') {
      const cC = e.target.value == '' ? null : e.target.value;
      gantt.updateTask(currentTask.id, {
        ...currentTask,
        commitmentCost: cC,
      });
      updateCommitmentCost(currentTask.id, cC);
    }

    if (type === 'payoutCost') {
      const pC = e.target.value == '' ? null : e.target.value;
      gantt.updateTask(currentTask.id, {
        ...currentTask,
        payoutCost: pC,
      });
      updatePayoutCost(currentTask.id, pC);
    }
  };

  const fetchProjectDetail = async () => {
    try {
      // authContext.dispatch(setIsLoading(true));
      const role = 'viewMyProjects';

      const projectsResponse = await client.query({
        query: FETCH_PROJECT_BY_ID,
        variables: {
          id: Number(currentTask.projectId),
          userId: decodeExchangeToken(projectTokens[currentTask.projectId])
            .userId,
        },
        fetchPolicy: 'network-only',
        context: { role },
      });

      if (projectsResponse.data.project.length > 0) {
        projectsResponse.data.project?.forEach((project: any) => {
          let address = '';
          let countryCode = '';
          if (project?.addresses.length > 0) {
            address = `${project?.addresses[0]?.fullAddress}`;
            countryCode = project.addresses[0]?.countryShortCode;
          }

          const newItem = {
            name: project.name,
            status: project.status,
            id: project.id,
            address,
            type: project.config.type,
            stage: project.config.stage,
            projectCode: project.config.projectCode,
            currency:
              project.metrics.currency == '' ? 'GBP' : project.metrics.currency,
            countryCode: countryCode,
          };
          setProjectDetails(newItem);
        });
      }
      // authContext.dispatch(setIsLoading(false));
    } catch (error) {
      console.log(error);
      // authContext.dispatch(setIsLoading(false));
    }
  };

  const getTotalBaseline = () => {
    let total = 0;
    if (currentTaskMaterial.length > 0) {
      const filtered = currentTaskMaterial.filter((value: any) => {
        if (value?.carbonCategory && value?.carbonCategory) {
          return value;
        }
      });
      filtered.forEach((el: any) => {
        if (el.quantityAllocated) {
          total += getBaselineValue(el.carbonCategory) * el.quantityAllocated;
        }
      });
    }
    return total?.toFixed(2);
  };

  const getTotalDesign = () => {
    let total = 0;
    if (currentTaskMaterial.length > 0) {
      const filtered = currentTaskMaterial.filter((value: any) => {
        if (value?.carbonCategory && value?.carbonCategory) {
          return value;
        }
      });
      filtered.forEach((el: any) => {
        if (el.quantityAllocated) {
          total += getDesignValue(el.carbonCategory) * el.quantityAllocated;
        }
      });
    }
    return total?.toFixed(2);
  };

  const getBaselineValue = (carbon: Carbon) => {
    if (carbon) {
      if (projectDetails?.countryCode === 'US') {
        return carbon?.baselineValueImperial;
      } else {
        return carbon?.baselineValue;
      }
    } else {
      return 0;
    }
  };

  const getUnit = (carbon: Carbon) => {
    if (projectDetails?.countryCode === 'US') {
      return carbon?.unitImperial;
    } else {
      return carbon?.unit;
    }
  };

  const getDesignValue = (carbon: Carbon) => {
    if (carbon) {
      const average = carbon?.averageValue?.filter((el) => {
        if (
          projectDetails?.countryCode &&
          (projectDetails?.countryCode === 'US' ||
            projectDetails?.countryCode === 'GB')
        ) {
          return el.region === projectDetails?.countryCode;
        } else {
          return el.region === 'Global';
        }
      })[0];

      if (projectDetails?.countryCode === 'US') {
        return average?.average_imperial;
      } else {
        return average?.average_si;
      }
    } else {
      return 0;
    }
  };

  return (
    <div className="common-edit-task-details-view-resources">
      <div className="common-edit-task-details-view-resources__action-menu">
        <a
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('material');
            const element = document.getElementById('material');
            element?.scrollIntoView(true);
          }}
        >
          <img
            src={activeTab === 'material' ? ActiveMaterialIcon : MaterialIcon}
            alt="material"
            className="common-edit-task-details-view-resources__action-menu-material"
          ></img>
        </a>
        {/* <a
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('cost');
            const element = document.getElementById('cost');
            element?.scrollIntoView(true);
          }}
        >
          <img
            src={
              activeTab === 'cost' ? ActiveMonetizationIcon : MonetizationIcon
            }
            alt="monetization"
            className="common-edit-task-details-view-resources__action-menu-monetization"
          ></img>
        </a> */}
        <a
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('cost');
            const element = document.getElementById('cost');
            element?.scrollIntoView(true);
          }}
        >
          <span>
            {projectDetails && projectDetails?.currency == 'USD' ? (
              <img
                src={
                  activeTab === 'cost'
                    ? ActiveMonetizationIcon
                    : MonetizationIcon
                }
                alt="monetization"
                className="common-edit-task-details-view-resources__action-menu-monetization"
              ></img>
            ) : projectDetails?.currency == 'GBP' ? (
              <img
                src={
                  activeTab === 'cost' ? ActivePoundIcon : NonActivePoundIcon
                }
                alt="monetization"
                className="common-edit-task-details-view-resources__action-menu-monetization"
              ></img>
            ) : projectDetails?.currency == 'INR' ? (
              <img
                src={
                  activeTab === 'cost'
                    ? ActiveIndianRupeeIcon
                    : NonActiveIndianRupeeIcon
                }
                alt="monetization"
                className="common-edit-task-details-view-resources__action-menu-monetization"
              ></img>
            ) : (
              ''
            )}
          </span>
        </a>
      </div>
      <span
        className="common-edit-task-details-view-resources__material-heading"
        id="material"
      >
        Material
      </span>
      {currentTaskMaterial.length === 0 && (
        <div className="common-edit-task-details-view-resources__empty">
          <div className="common-edit-task-details-view-resources__empty-materials">
            {currentTask.type !== 'wbs' &&
              permissionKeysByAssigneeAndToken(
                currentTask?.assignedTo,
                projectTokens[currentTask.projectId]
              ).create && (
                <Button
                  data-testid="edit-task-details-view-data-add-link"
                  variant="outlined"
                  className="btn-text common-edit-task-details-view-resources__empty-materials-add-material "
                  onClick={() => {
                    setAddMaterialPop(true);
                  }}
                >
                  Add Materials
                </Button>
              )}
            <span className="common-edit-task-details-view-resources__empty-materials-msg">
              Add some materials to the task and get going!
            </span>
          </div>
          <hr className="common-edit-task-details-view-resources__line"></hr>

          <span className="common-edit-task-details-view-resources__cost-heading">
            Cost
          </span>
          <div className="common-edit-task-details-view-resources__empty-costs">
            <span
              className={`${
                projectDetails?.currency === 'GBP'
                  ? 'input-euro'
                  : projectDetails?.currency === 'USD'
                  ? 'input-dollar'
                  : 'input-rupee'
              } left`}
            >
              <TextFieldCustom
                data-testid="commitment-cost"
                className="common-edit-task-details-view-resources__empty-costs-commitment-field"
                placeholder="Enter Amount"
                name="commitmentCost"
                type="number"
                label="Commitment Cost"
                value={taskCosts.commitmentCost + ''}
                onKeyDown={(e) => onKeyDownCosts(e, 'commitmentCost')}
                onChange={onCostChange}
                onBlur={(e) => saveCosts(e, 'commitmentCost')}
                disabled={
                  !permissionKeysByAssigneeAndToken(
                    currentTask?.assignedTo,
                    projectTokens[currentTask.projectId]
                  ).update
                }
              ></TextFieldCustom>
            </span>
            <span
              className={`${
                projectDetails?.currency == 'GBP'
                  ? 'input-euro'
                  : projectDetails?.currency == 'USD'
                  ? 'input-dollar'
                  : 'input-rupee'
              } left`}
            >
              <TextFieldCustom
                data-testid="payout-cost"
                className="common-edit-task-details-view-resources__empty-costs-cost-field"
                placeholder="Enter Amount"
                name="payoutCost"
                type="number"
                min={0}
                label="Payout Cost"
                value={taskCosts.payoutCost + ''}
                onKeyDown={(e) => onKeyDownCosts(e, 'payoutCost')}
                onChange={onCostChange}
                onBlur={(e) => saveCosts(e, 'payoutCost')}
                disabled={
                  !permissionKeysByAssigneeAndToken(
                    currentTask?.assignedTo,
                    projectTokens[currentTask.projectId]
                  ).update
                }
              ></TextFieldCustom>
            </span>
          </div>
        </div>
      )}

      {currentTaskMaterial.length > 0 && (
        <div className="common-edit-task-details-view-resources__data">
          <TableContainer className="common-edit-task-details-view-resources__data-table-container">
            <Table
              stickyHeader
              aria-labelledby="tableTitle"
              aria-label="enhanced table"
            >
              <TableHead>
                <TableRow>
                  <TableCell className="common-edit-task-details-view-resources__data__table-head-cell common-edit-task-details-view-resources__data__table-head-cell-1">
                    <CustomToolTip
                      element={materialHeaderInfo?.materialName}
                      textLength={materialHeaderInfo?.CUSTOM_TEXT_LENGTH}
                    />
                  </TableCell>
                  <TableCell className="common-edit-task-details-view-resources__data__table-head-cell common-edit-task-details-view-resources__data__table-head-cell-2 ">
                    <CustomToolTip
                      element={materialHeaderInfo?.materialId}
                      textLength={materialHeaderInfo?.CUSTOM_TEXT_LENGTH}
                    />
                  </TableCell>
                  <TableCell className="common-edit-task-details-view-resources__data__table-head-cell common-edit-task-details-view-resources__data__table-head-cell-3">
                    <CustomToolTip
                      element={materialHeaderInfo?.quantityAssigned}
                      textLength={materialHeaderInfo?.CUSTOM_TEXT_LENGTH}
                    />
                  </TableCell>
                  <TableCell className="common-edit-task-details-view-resources__data__table-head-cell common-edit-task-details-view-resources__data__table-head-cell-4">
                    <CustomToolTip
                      element={materialHeaderInfo?.quantityConsumed}
                      textLength={materialHeaderInfo?.CUSTOM_TEXT_LENGTH}
                    />
                  </TableCell>
                  <TableCell className="common-edit-task-details-view-resources__data__table-head-cell common-edit-task-details-view-resources__data__table-head-cell-4">
                    <CustomToolTip
                      element={materialHeaderInfo?.totalBaseline}
                      textLength={materialHeaderInfo?.CUSTOM_TEXT_LENGTH}
                    />
                  </TableCell>
                  <TableCell className="common-edit-task-details-view-resources__data__table-head-cell common-edit-task-details-view-resources__data__table-head-cell-4">
                    <CustomToolTip
                      element={materialHeaderInfo?.totalDesignEmbodiedCarbon}
                      textLength={materialHeaderInfo?.CUSTOM_TEXT_LENGTH}
                    />
                  </TableCell>
                  <TableCell className="common-edit-task-details-view-resources__data__table-head-cell common-edit-task-details-view-resources__data__table-head-cell-5"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody className="common-edit-task-details-view-resources__data__table-body">
                {currentTaskMaterial.map((row: any, index: any) => {
                  return (
                    <TableRow
                      hover
                      tabIndex={-1}
                      key={row.id}
                      className="common-edit-task-details-view-resources__data__table-body-row"
                    >
                      <TableCell
                        className="common-edit-task-details-view-resources__data__table-body-cell common-edit-task-details-view-resources__data__table-body-cell-1"
                        component="th"
                        scope="row"
                        padding="none"
                      >
                        <CustomToolTip
                          element={row.name}
                          textLength={
                            materialHeaderInfo?.CUSTOM_TEXT_LENGTH_MATERIAL_NAME
                          }
                          className="common-edit-task-details-view-resources__data__table-body-row__item-1"
                        />
                      </TableCell>
                      <TableCell className="common-edit-task-details-view-resources__data__table-body-cell common-edit-task-details-view-resources__data__table-body-cell-2">
                        <CustomToolTip
                          element={row.materialId}
                          textLength={materialHeaderInfo?.CUSTOM_TEXT_LENGTH}
                          className="common-edit-task-details-view-resources__data__table-body-row__item"
                        />
                      </TableCell>
                      <TableCell className="common-edit-task-details-view-resources__data__table-body-cell common-edit-task-details-view-resources__data__table-body-cell-3">
                        <div>
                          <TextFieldCustom
                            data-testid="material-quantity-allocated"
                            className="common-edit-task-details-view-resources__data__table-body-cell-3-input"
                            name="quantityAllocated"
                            tooltip=""
                            value={getQuantity(row, 'quantityAllocated')}
                            onKeyDown={(e) =>
                              onKeyDown(e, row, 'quantityAllocated')
                            }
                            type="number"
                            min={0}
                            placeholder="Enter Qty"
                            onChange={(e: any) => {
                              onMaterialQuantityChange(e, row, index);
                            }}
                            onBlur={updateMaterial}
                            disabled={
                              !permissionKeysByAssigneeAndToken(
                                currentTask?.assignedTo,
                                projectTokens[currentTask.projectId]
                              ).update
                            }
                          />
                          <span className="common-edit-task-details-view-resources__data__table-body-cell-unit">
                            {row?.carbonCategory
                              ? getUnit(row.carbonCategory)
                              : row.unit}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="common-edit-task-details-view-resources__data__table-body-cell common-edit-task-details-view-resources__data__table-body-cell-4">
                        <div>
                          <TextFieldCustom
                            data-testid="material-quantity-allocated"
                            className="common-edit-task-details-view-resources__data__table-body-cell-4-input"
                            name="quantityConsumed"
                            value={getQuantity(row, 'quantityConsumed')}
                            placeholder="Enter Qty"
                            onKeyDown={(e) =>
                              onKeyDown(e, row, 'quantityConsumed')
                            }
                            type="number"
                            tooltip=""
                            min={0}
                            onChange={(e: any) => {
                              onMaterialQuantityChange(e, row, index);
                            }}
                            onBlur={updateMaterial}
                            disabled={
                              !permissionKeysByAssigneeAndToken(
                                currentTask?.assignedTo,
                                projectTokens[currentTask.projectId]
                              ).update
                            }
                          />
                          <span className="common-edit-task-details-view-resources__data__table-body-cell-unit">
                            {row?.carbonCategory
                              ? getUnit(row.carbonCategory)
                              : row.unit}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="common-edit-task-details-view-resources__data__table-body-cell common-edit-task-details-view-resources__data__table-body-cell-5">
                        {row.quantityAllocated &&
                        !isNaN(row.quantityAllocated) &&
                        getBaselineValue(row.carbonCategory) &&
                        !isNaN(getDesignValue(row.carbonCategory))
                          ? (
                              getBaselineValue(row.carbonCategory) *
                              row.quantityAllocated
                            )?.toFixed(2)
                          : 0.0}
                      </TableCell>
                      <TableCell className="common-edit-task-details-view-resources__data__table-body-cell common-edit-task-details-view-resources__data__table-body-cell-6">
                        {row.quantityAllocated &&
                        !isNaN(row.quantityAllocated) &&
                        !isNaN(getDesignValue(row.carbonCategory)) &&
                        getDesignValue(row.carbonCategory)
                          ? (
                              getDesignValue(row.carbonCategory) *
                              row.quantityAllocated
                            )?.toFixed(2)
                          : 0.0}
                      </TableCell>

                      <TableCell className="common-edit-task-details-view-resources__data__table-body-cell common-edit-task-details-view-resources__data__table-body-cell-7">
                        {permissionKeysByAssigneeAndToken(
                          currentTask?.assignedTo,
                          projectTokens[currentTask.projectId]
                        ).delete && (
                          <img
                            className="common-edit-task-details-view-resources__data__table-body-cell-delete"
                            src={DeleteIcon}
                            alt="delete"
                            onClick={() => {
                              setDeleteConfirmationPop(true);
                              setSelectedMaterial(row);
                            }}
                          ></img>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          {permissionKeysByAssigneeAndToken(
            currentTask?.assignedTo,
            projectTokens[currentTask.projectId]
          ).create && (
            <Button
              className="btn-text common-edit-task-details-view-resources__data__add-material "
              onClick={() => {
                setAddMaterialPop(true);
              }}
            >
              {' '}
              + Add Material
            </Button>
          )}

          <div className="common-edit-task-details-view-resources__footer">
            <div>
              <div
                className="common-edit-task-details-view-resources__cost-title"
                id="cost"
              >
                Cost
              </div>
              <div className="common-edit-task-details-view-resources__costsFields-costs">
                <span
                  className={`${
                    projectDetails?.currency === 'GBP'
                      ? 'input-euro'
                      : projectDetails?.currency === 'USD'
                      ? 'input-dollar'
                      : 'input-rupee'
                  } left`}
                >
                  <TextFieldCustom
                    data-testid="commitment-cost"
                    className="common-edit-task-details-view-resources__costsFields-costs-commitment-field"
                    placeholder="Enter Amount"
                    name="commitmentCost"
                    type="number"
                    min={0}
                    label="Commitment Cost"
                    value={taskCosts.commitmentCost + ''}
                    onKeyDown={(e) => onKeyDownCosts(e, 'commitmentCost')}
                    onChange={onCostChange}
                    onBlur={(e) => saveCosts(e, 'commitmentCost')}
                    disabled={
                      !permissionKeysByAssigneeAndToken(
                        currentTask?.assignedTo,
                        projectTokens[currentTask.projectId]
                      ).update
                    }
                  ></TextFieldCustom>
                </span>
                <span
                  className={`${
                    projectDetails?.currency === 'GBP'
                      ? 'input-euro'
                      : projectDetails?.currency === 'USD'
                      ? 'input-dollar'
                      : 'input-rupee'
                  } left`}
                >
                  <TextFieldCustom
                    data-testid="payout-cost"
                    className="common-edit-task-details-view-resources__costsFields-costs-cost-field"
                    placeholder="Enter Amount"
                    name="payoutCost"
                    type="number"
                    min={0}
                    label="Payout Cost"
                    value={taskCosts.payoutCost + ''}
                    onKeyDown={(e) => onKeyDownCosts(e, 'payoutCost')}
                    onChange={onCostChange}
                    onBlur={(e) => saveCosts(e, 'payoutCost')}
                    disabled={
                      !permissionKeysByAssigneeAndToken(
                        currentTask?.assignedTo,
                        projectTokens[currentTask.projectId]
                      ).update
                    }
                  ></TextFieldCustom>
                </span>
              </div>
            </div>

            <div className="common-edit-task-details-view-resources__footer__carbon">
              <div
                className="common-edit-task-details-view-resources__cost-title"
                id="carbon"
              >
                Carbon
              </div>

              <div className="common-edit-task-details-view-resources__footer__total">
                <label>Total Baseline EC (kgCO2e)</label>
                <Typography>{getTotalBaseline()}</Typography>
              </div>
              <div className="common-edit-task-details-view-resources__footer__total">
                <label>Total Design EC (kgCO2e)</label>
                <Typography>{getTotalDesign()}</Typography>
              </div>
            </div>
          </div>
        </div>
      )}

      {addMaterialPop && (
        <CommonAddMaterialTable
          open={addMaterialPop}
          setAddMaterialPop={setAddMaterialPop}
          addMaterial={addMaterial}
          countryCode={projectDetails?.countryCode}
          projectMaterials={projectMaterials}
          getProjectMaterials={getProjectMaterials}
          clearProjectMaterials={clearProjectMaterials}
          currentTaskMaterial={currentTaskMaterial}
        ></CommonAddMaterialTable>
      )}

      {deleteConfirmationPop && (
        <ConfirmDialog
          data-testid="delete-material"
          open={deleteConfirmationPop}
          message={{
            text: 'Are you sure you want to delete this material?',
            cancel: 'Cancel',
            proceed: 'Delete',
          }}
          close={cancelDelete}
          proceed={() => {
            deleteProjectTaskAssociatedMaterial(selectedMaterial.id);
            setDeleteConfirmationPop(false);
          }}
        />
      )}
    </div>
  );
};

export default CommonEditTaskDetailsViewResources;
