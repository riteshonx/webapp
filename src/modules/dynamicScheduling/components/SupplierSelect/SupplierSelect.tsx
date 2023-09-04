import { Tooltip } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import CancelIcon from '@material-ui/icons/Cancel';
import { ClickAwayListener } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { useDebounce } from 'src/customhooks/useDebounce';
import ProjectPlanContext from 'src/modules/dynamicScheduling/context/projectPlan/projectPlanContext';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import editIcon from '../../../../assets/images/task_details_constraint_edit.svg';
import { client } from '../../../../services/graphql';
import { FETCH_SUPPLIERS } from '../../libraries/grqphql/queries/material';
import { permissionKeys } from '../../permission/scheduling';
import './SupplierSelect.scss';

export default function SupplierSelect(props: any) {
  const { state, dispatch }: any = useContext(stateContext);
  const [allSupplierList, setAllSupplierList] = useState<any>([]);
  const projectPlanContext = useContext(ProjectPlanContext);
  const { currentTask } = projectPlanContext;
  const [searchName, setSearchName] = useState('');
  const [showResponsibleContractor, setShowResponsibleContractor] =
    useState(false);
  const [editbox, setEditBox] = useState(false);
  const debounceName = useDebounce(searchName, 200);
  const [noData, setNodata] = useState(false);
  const { updateContractor } = props;

  useEffect(() => {
    if (debounceName.trim()) {
      fetchSuplliers(searchName.toLowerCase());
    } else {
      setAllSupplierList([]);
      setShowResponsibleContractor(false);
    }
  }, [debounceName]);
  useEffect(() => {
    if (currentTask.tenantCompanyAssociation != null) {
      setSearchName(currentTask.tenantCompanyAssociation?.name);
    } else {
      setSearchName('');
    }
  }, []);
  const fetchSuplliers = async (searchText: any) => {
    try {
      const response: any = await client.query({
        query: FETCH_SUPPLIERS,
        variables: {
          search: `%${searchText}%`,
        },
        fetchPolicy: 'network-only',
        context: { token: state?.selectedProjectToken, role: 'viewMasterPlan' },
      });
      setAllSupplierList(response?.data?.tenantCompanyAssociation);
      if (response?.data?.tenantCompanyAssociation.length == 0) {
        setNodata(true);
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const selectSupplier = (item: any) => {
    updateContractor(item);
    setSearchName('');
    setShowResponsibleContractor(false);
    setEditBox(false);
  };
  const searchSupplier = (e: any) => {
    setSearchName(e.target.value);
    setShowResponsibleContractor(true);
  };
  const removeSupplier = (e: any) => {
    if (e.target.value == '' || e.target.value == null) {
      updateContractor(null);
    }
  };

  return (
    <ClickAwayListener
      onClickAway={() => {
        setEditBox(false);
        setShowResponsibleContractor(false);
      }}
    >
      <div className="supplier-select">
        <>
          {!editbox ? (
            <Tooltip title="Responsible Company">
              <div className="supplier-select__contactordetails">
                <div>
                  <p className="supplier-select__contractorlabel">
                    Responsible Company
                  </p>
                  <div className="supplier-select__imagecontainer">
                    <p className="supplier-select__contractorname">
                      {currentTask.tenantCompanyAssociation
                        ? currentTask?.tenantCompanyAssociation?.name
                        : '-'}
                    </p>
                    {permissionKeys(currentTask?.assignedTo).create && (
                      <div className="supplier-select__editbtnwrapper">
                        <img
                          data-testid="supplier-select-btn-edit"
                          src={editIcon}
                          alt="edit responsible contractor"
                          className="supplier-select__edit"
                          onClick={() => {
                            setEditBox(true);
                            setSearchName(
                              currentTask?.tenantCompanyAssociation?.name || ''
                            );
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Tooltip>
          ) : (
            <div className="supplier-select__inputbox">
              <input
                value={searchName}
                className="supplier-select__search"
                data-testid="supplier-search"
                type="text"
                id="supplier-searchbox"
                placeholder="Search Company"
                onChange={searchSupplier}
                onBlur={removeSupplier}
              />
              <div>
                <IconButton
                  data-testid="select-supplier-close"
                  className="supplier-select__close"
                  onClick={(e) => setSearchName('')}
                >
                  <CancelIcon className="supplier-select__closeicon" />
                </IconButton>
              </div>
            </div>
          )}
        </>

        <div className="supplier-select__option">
          {showResponsibleContractor && (
            <div className="supplier-select__option__list">
              {allSupplierList.map((supplier: any, searchIndex: number) => {
                return (
                  <div
                    className="supplier-select__option__single__option"
                    style={{
                      borderBottom: `${
                        allSupplierList.length - 1 === searchIndex ? 'none' : ''
                      }`,
                    }}
                    onClick={() => selectSupplier(supplier)}
                    key={supplier.id}
                  >
                    {supplier.name}
                  </div>
                );
              })}
              {noData && allSupplierList.length === 0 ? (
                <div className="supplier-select__nodata">No data found</div>
              ) : (
                ''
              )}
            </div>
          )}
        </div>
      </div>
    </ClickAwayListener>
  );
}
