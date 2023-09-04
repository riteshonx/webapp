import { Button, Tooltip } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import React, { useContext, useEffect, useState } from 'react';
import { Carbon } from 'src/modules/baseService/projectSettings/components/ProjectMaterialMaster/MaterialMasterActions';
import { decodeExchangeToken } from 'src/services/authservice';
import DeleteIcon from '../../../../../../assets/images/task_details_constraint_delete.svg';
import ConfirmDialog from '../../../../../shared/components/ConfirmDialog/ConfirmDialog';
import TextFieldCustom from '../../../../components/TextFieldCustom/TextFieldCustom';
import EditRecipeTaskContext from '../../../../context/editRecipeTask/editRecipeTaskContext';
import RecipeContext from '../../../../context/Recipe/RecipeContext';
// import AddMaterialTable from '../AddMaterialTable/AddMaterialTable';
import AddRecipeMaterialTable from '../AddRecipeMaterialTable/AddRecipeMaterialTable';
import './EditRecipeTaskResources.scss';

export interface Params {
  id: string;
}
interface EditRecipetaskResources {
  isEditingRecipe: boolean;
}

const EditRecipeTaskResources = (props: EditRecipetaskResources) => {
  const editRecipeTaskContext = useContext(EditRecipeTaskContext);
  const recipeContext = useContext(RecipeContext);
  const [activeTab, setActiveTab] = useState('material');

  const {
    addBulkMaterialToRecipeTask,
    getRecipeTaskMaterial,
    currentTaskMaterial,
    deleteRecipeTaskMaterial,
    updateRecipeTaskMaterial,
  } = editRecipeTaskContext;
  const { isEditingRecipe } = props;
  const { currentTask, recipeMetaData } = recipeContext;
  const [addMaterialPop, setAddMaterialPop] = useState(false);
  const [deleteConfirmationPop, setDeleteConfirmationPop] = useState(false);
  // const [projectId, setProjectId] = useState<any | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<any | null>({
    id: '',
  });

  useEffect(() => {
    if (currentTask.id) {
      getRecipeTaskMaterial(currentTask.id);
    }
    // setTaskCosts({
    //   commitmentCost: currentTask.commitmentCost,
    //   payoutCost: currentTask.payoutCost,
    // });
  }, [currentTask]);

  const addMaterial = (selectedMaterial: any) => {
    const tempMaterial = selectedMaterial.map((material: any) => ({
      materialId: material.id,
      quantity: material.quantityAllocated ? material.quantityAllocated : 0,
      recipeTaskId: currentTask.id,
      recipeId: recipeMetaData.id,
    }));
    addBulkMaterialToRecipeTask(tempMaterial);
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
      updateRecipeTaskMaterial(tempSelectedMaterial);
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
      setSelectedMaterial({
        ...row,
        quantityAllocated: row.quantityAllocated,
      });
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

    // if (e.key === 'Escape' && cost === 'commitmentCost') {
    //   e.stopPropagation();
    //   setTaskCosts({
    //     ...taskCosts,
    //     commitmentCost: currentTask.commitmentCost,
    //   });
    // }
    // if (e.key === 'Escape' && cost === 'payoutCost') {
    //   e.stopPropagation();
    //   setTaskCosts({ ...taskCosts, payoutCost: currentTask.payoutCost });
    // }

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

  // const onCostChange = (event: any) => {
  //   if (event.target.value < 0) {
  //     setTaskCosts({ ...taskCosts, [event.target.name]: '' });
  //     event.target.value = '';
  //   } else {
  //     let costValue = event.target.value;
  //     costValue =
  //       event.target.value.indexOf('.') >= 0
  //         ? event.target.value.substr(0, event.target.value.indexOf('.')) +
  //           event.target.value.substr(event.target.value.indexOf('.'), 3)
  //         : event.target.value;
  //     setTaskCosts({ ...taskCosts, [event.target.name]: costValue });
  //   }
  // };

  // const saveCosts = (e: any, type: any) => {
  //   // if (e.target.value < 0 || e.target.value == '') {
  //   //   setTaskCosts({
  //   //     commitmentCost: currentTask.commitmentCost,
  //   //     payoutCost: currentTask.payoutCost,
  //   //   });
  //   //   return;
  //   // }
  //   if (type === 'commitmentCost') {
  //     const cC = e.target.value == '' ? null : e.target.value;
  //     gantt.updateTask(currentTask.id, {
  //       ...currentTask,
  //       commitmentCost: cC,
  //     });
  //     //   updateCommitmentCost(currentTask.id, cC);
  //   }

  //   if (type === 'payoutCost') {
  //     const pC = e.target.value == '' ? null : e.target.value;
  //     gantt.updateTask(currentTask.id, {
  //       ...currentTask,
  //       payoutCost: pC,
  //     });
  //     //   updatePayoutCost(currentTask.id, pC);
  //   }
  // };

  // const fetchProjectDetail = async () => {
  //   try {
  //     authContext.dispatch(setIsLoading(true));
  //     const role = 'viewMyProjects';

  //     const projectsResponse = await client.query({
  //       query: FETCH_PROJECT_BY_ID,
  //       variables: {
  //         id: Number(pathMatch?.params?.id),
  //         userId: decodeExchangeToken().userId,
  //       },
  //       fetchPolicy: 'network-only',
  //       context: { role },
  //     });

  //     if (projectsResponse.data.project.length > 0) {
  //       projectsResponse.data.project?.forEach((project: any) => {
  //         let address = '';
  //         let countryCode = '';
  //         if (project?.addresses.length > 0) {
  //           address = `${project?.addresses[0]?.fullAddress}`;
  //           countryCode = project.addresses[0]?.countryShortCode;
  //         }

  //         const newItem = {
  //           name: project.name,
  //           status: project.status,
  //           id: project.id,
  //           address,
  //           type: project.config.type,
  //           stage: project.config.stage,
  //           projectCode: project.config.projectCode,
  //           currency:
  //             project.metrics.currency == '' ? 'GBP' : project.metrics.currency,
  //           countryCode: countryCode,
  //         };
  //         setProjectDetails(newItem);
  //       });
  //     }
  //     authContext.dispatch(setIsLoading(false));
  //   } catch (error) {
  //     console.log(error);
  //     authContext.dispatch(setIsLoading(false));
  //   }
  // };

  // const getTotalBaseline = () => {
  //   let total = 0;
  //   if (currentTaskMaterial.length > 0) {
  //     const filtered = currentTaskMaterial.filter((value: any) => {
  //       if (value?.carbonCategory && value?.carbonCategory) {
  //         return value;
  //       }
  //     });
  //     filtered.forEach((el: any) => {
  //       if (el.quantityAllocated) {
  //         total += getBaselineValue(el.carbonCategory) * el.quantityAllocated;
  //       }
  //     });
  //   }
  //   return total?.toFixed(2);
  // };

  // const getTotalDesign = () => {
  //   let total = 0;
  //   if (currentTaskMaterial.length > 0) {
  //     const filtered = currentTaskMaterial.filter((value: any) => {
  //       if (value?.carbonCategory && value?.carbonCategory) {
  //         return value;
  //       }
  //     });
  //     filtered.forEach((el: any) => {
  //       if (el.quantityAllocated) {
  //         total += getDesignValue(el.carbonCategory) * el.quantityAllocated;
  //       }
  //     });
  //   }
  //   return total?.toFixed(2);
  // };

  const getBaselineValue = (carbon: Carbon) => {
    if (carbon) {
      // if (projectDetails?.countryCode === 'US') {
      //   return carbon?.baselineValueImperial;
      // } else {
      return carbon?.baselineValue;
      // }
    } else {
      return 0;
    }
  };

  const getUnit = (carbon: Carbon) => {
    // if (projectDetails?.countryCode === 'US') {
    //   return carbon?.unitImperial;
    // } else {
    return carbon?.unit;
    // }
  };

  const getDesignValue = (carbon: Carbon) => {
    if (carbon) {
      const average = carbon?.averageValue?.filter((el) => {
        // if (
        //   projectDetails?.countryCode &&
        //   (projectDetails?.countryCode === 'US' ||
        //     projectDetails?.countryCode === 'GB')
        // ) {
        //   return el.region === projectDetails?.countryCode;
        // } else {
        return el.region === 'Global';
        // }
      })[0];

      // if (projectDetails?.countryCode === 'US') {
      //   return average?.average_imperial;
      // } else {
      return average?.average_si;
      // }
    } else {
      return 0;
    }
  };

  const isMaterialAlreadySelected = (text: any) => {
    for (let i = 0; i < currentTaskMaterial.length; i++) {
      if (
        currentTaskMaterial[i].name
          .toLowerCase()
          .includes(text.toLowerCase()) ||
        currentTaskMaterial[i].materialId
          .toLowerCase()
          .includes(text.toLowerCase())
      ) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="edit-recipe-task-resource">
      {/* <div className="edit-recipe-task-resource__action-menu">
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
            className="edit-recipe-task-resource__action-menu-material"
          ></img>
        </a> */}
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
            className="edit-recipe-task-resource__action-menu-monetization"
          ></img>
        </a> */}
      {/* <a
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
                className="edit-recipe-task-resource__action-menu-monetization"
              ></img>
            ) : projectDetails?.currency == 'GBP' ? (
              <img
                src={
                  activeTab === 'cost' ? ActivePoundIcon : NonActivePoundIcon
                }
                alt="monetization"
                className="edit-recipe-task-resource__action-menu-monetization"
              ></img>
            ) : projectDetails?.currency == 'INR' ? (
              <img
                src={
                  activeTab === 'cost'
                    ? ActiveIndianRupeeIcon
                    : NonActiveIndianRupeeIcon
                }
                alt="monetization"
                className="edit-recipe-task-resource__action-menu-monetization"
              ></img>
            ) : (
              ''
            )}
          </span>
        </a> */}
      {/* </div> */}
      <span
        className="edit-recipe-task-resource__material-heading"
        id="material"
      >
        Material
      </span>
      {currentTaskMaterial.length === 0 && (
        <div className="edit-recipe-task-resource__empty">
          <div className="edit-recipe-task-resource__empty-materials">
            {/* {currentTask.type !== 'wbs' &&
              permissionKeys(currentTask?.assignedTo).create && ( */}
            {!isEditingRecipe &&
              decodeExchangeToken().allowedRoles.includes(
                'updateTenantTask'
              ) && (
                <Button
                  data-testid="edit-recipe-task-resource-add-material"
                  variant="outlined"
                  className="edit-recipe-task-resource__empty-materials-add-material"
                  onClick={() => {
                    setAddMaterialPop(true);
                  }}
                >
                  Add Materials
                </Button>
              )}
            {/* )} */}
            <span className="edit-recipe-task-resource__empty-materials-msg">
              Add some materials to the task and get going!
            </span>
          </div>
          {/* <hr className="edit-recipe-task-resource__line"></hr> */}

          {/* <span className="edit-recipe-task-resource__cost-heading">Cost</span>
          <div className="edit-recipe-task-resource__empty-costs">
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
                className="edit-recipe-task-resource__empty-costs-commitment-field"
                placeholder="Enter Amount"
                name="commitmentCost"
                type="number"
                label="Commitment Cost"
                value={taskCosts.commitmentCost + ''}
                onKeyDown={(e) => onKeyDownCosts(e, 'commitmentCost')}
                onChange={onCostChange}
                onBlur={(e) => saveCosts(e, 'commitmentCost')}
                disabled={!permissionKeys(currentTask?.assignedTo).update}
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
                className="edit-recipe-task-resource__empty-costs-cost-field"
                placeholder="Enter Amount"
                name="payoutCost"
                type="number"
                min={0}
                label="Payout Cost"
                value={taskCosts.payoutCost + ''}
                onKeyDown={(e) => onKeyDownCosts(e, 'payoutCost')}
                onChange={onCostChange}
                onBlur={(e) => saveCosts(e, 'payoutCost')}
                disabled={!permissionKeys(currentTask?.assignedTo).update}
              ></TextFieldCustom>
            </span>
          </div> */}
        </div>
      )}

      {currentTaskMaterial.length > 0 && (
        <div className="edit-recipe-task-resource__data">
          <TableContainer className="edit-recipe-task-resource__data-table-container">
            <Table
              stickyHeader
              aria-labelledby="tableTitle"
              aria-label="enhanced table"
            >
              <TableHead>
                <TableRow>
                  <TableCell className="edit-recipe-task-resource__data__table-head-cell edit-recipe-task-resource__data__table-head-cell-1">
                    Name
                  </TableCell>
                  <TableCell className="edit-recipe-task-resource__data__table-head-cell edit-recipe-task-resource__data__table-head-cell-2 ">
                    ID
                  </TableCell>
                  <TableCell className="edit-recipe-task-resource__data__table-head-cell edit-recipe-task-resource__data__table-head-cell-3">
                    Qty Assigned
                  </TableCell>
                  <TableCell className="edit-recipe-task-resource__data__table-head-cell edit-recipe-task-resource__data__table-head-cell-4">
                    Total Baseline EC (kgCO2e)
                  </TableCell>
                  <TableCell className="edit-recipe-task-resource__data__table-head-cell edit-recipe-task-resource__data__table-head-cell-4">
                    Total Design EC (kgCO2e)
                  </TableCell>
                  <TableCell className="edit-recipe-task-resource__data__table-head-cell edit-recipe-task-resource__data__table-head-cell-5"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody className="edit-recipe-task-resource__data__table-body">
                {currentTaskMaterial.map((row: any, index: any) => {
                  return (
                    <TableRow
                      hover
                      tabIndex={-1}
                      key={row.id}
                      className="edit-recipe-task-resource__data__table-body-row"
                    >
                      <TableCell
                        className="edit-recipe-task-resource__data__table-body-cell edit-recipe-task-resource__data__table-body-cell-1"
                        component="th"
                        scope="row"
                        padding="none"
                      >
                        <Tooltip title={row.name}>
                          <span>
                            {row.name.length > 50
                              ? row.name.slice(0, 50) + '...'
                              : row.name}
                          </span>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="edit-recipe-task-resource__data__table-body-cell edit-recipe-task-resource__data__table-body-cell-2">
                        {row.materialId}
                      </TableCell>
                      <TableCell className="edit-recipe-task-resource__data__table-body-cell edit-recipe-task-resource__data__table-body-cell-3">
                        <div>
                          <TextFieldCustom
                            data-testid="material-quantity-allocated"
                            className="edit-recipe-task-resource__data__table-body-cell-3-input"
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
                              !decodeExchangeToken().allowedRoles.includes(
                                'updateTenantTask'
                              )
                            }
                          />
                          <span className="edit-recipe-task-resource__data__table-body-cell-unit">
                            {row?.carbonCategory
                              ? getUnit(row.carbonCategory)
                              : row.unit}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="edit-recipe-task-resource__data__table-body-cell edit-recipe-task-resource__data__table-body-cell-5">
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
                      <TableCell className="edit-recipe-task-resource__data__table-body-cell edit-recipe-task-resource__data__table-body-cell-6">
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

                      <TableCell className="edit-recipe-task-resource__data__table-body-cell edit-recipe-task-resource__data__table-body-cell-7">
                        {decodeExchangeToken().allowedRoles.includes(
                          'deleteTenantTask'
                        ) &&
                          !isEditingRecipe &&
                          decodeExchangeToken().allowedRoles.includes(
                            'updateTenantTask'
                          ) && (
                            <img
                              className="edit-recipe-task-resource__data__table-body-cell-delete"
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
          {decodeExchangeToken().allowedRoles.includes('createTenantTask') &&
            !isEditingRecipe && (
              <Button
                className="edit-recipe-task-resource__data__add-material"
                onClick={() => {
                  setAddMaterialPop(true);
                }}
              >
                + Add Material
              </Button>
            )}
          {/*
          <div className="edit-recipe-task-resource__footer">
            <div>
              <div className="edit-recipe-task-resource__cost-title" id="cost">
                Cost
              </div>
              <div className="edit-recipe-task-resource__costsFields-costs">
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
                    className="edit-recipe-task-resource__costsFields-costs-commitment-field"
                    placeholder="Enter Amount"
                    name="commitmentCost"
                    type="number"
                    min={0}
                    label="Commitment Cost"
                    value={taskCosts.commitmentCost + ''}
                    onKeyDown={(e) => onKeyDownCosts(e, 'commitmentCost')}
                    onChange={onCostChange}
                    onBlur={(e) => saveCosts(e, 'commitmentCost')}
                    disabled={!permissionKeys(currentTask?.assignedTo).update}
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
                    className="edit-recipe-task-resource__costsFields-costs-cost-field"
                    placeholder="Enter Amount"
                    name="payoutCost"
                    type="number"
                    min={0}
                    label="Payout Cost"
                    value={taskCosts.payoutCost + ''}
                    onKeyDown={(e) => onKeyDownCosts(e, 'payoutCost')}
                    onChange={onCostChange}
                    onBlur={(e) => saveCosts(e, 'payoutCost')}
                    disabled={!permissionKeys(currentTask?.assignedTo).update}
                  ></TextFieldCustom>
                </span>
              </div>
            </div> */}

          {/* <div className="edit-recipe-task-resource__footer__carbon">
              <div
                className="edit-recipe-task-resource__cost-title"
                id="carbon"
              >
                Carbon
              </div>

              <div className="edit-recipe-task-resource__footer__total">
                <label>Total Baseline EC (kgCO2e)</label>
                <Typography>{getTotalBaseline()}</Typography>
              </div>
              <div className="edit-recipe-task-resource__footer__total">
                <label>Total Design EC (kgCO2e)</label>
                <Typography>{getTotalDesign()}</Typography>
              </div>
            </div>
          </div> */}
        </div>
      )}

      {/* {addMaterialPop && (
        <AddMaterialTable
          open={addMaterialPop}
          setAddMaterialPop={setAddMaterialPop}
          addMaterial={addMaterial}
          countryCode={projectDetails?.countryCode}
        ></AddMaterialTable>
      )} */}

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
            deleteRecipeTaskMaterial(selectedMaterial.id);
            setDeleteConfirmationPop(false);
          }}
        />
      )}

      {addMaterialPop && (
        <AddRecipeMaterialTable
          open={addMaterialPop}
          setAddMaterialPop={setAddMaterialPop}
          addMaterial={addMaterial}
          isMaterialAlreadySelected={isMaterialAlreadySelected}
        ></AddRecipeMaterialTable>
      )}
    </div>
  );
};

export default EditRecipeTaskResources;
