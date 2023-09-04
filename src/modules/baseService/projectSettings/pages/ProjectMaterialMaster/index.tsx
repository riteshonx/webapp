import { ApolloError } from '@apollo/client';
import { Button } from '@material-ui/core';
import { Box } from '@mui/system';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDebounce } from 'src/customhooks/useDebounce';
import { FETCH_PROJECT_BY_ID } from 'src/graphhql/queries/projects';
import { projectDetailsContext } from 'src/modules/baseService/projects/Context/ProjectDetailsContext';
import { setIsLoading } from 'src/modules/root/context/authentication/action';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import NoDataMessage from 'src/modules/shared/components/NoDataMessage/NoDataMessage';
import Notification, {
  AlertTypes,
} from 'src/modules/shared/components/Toaster/Toaster';
import { decodeExchangeToken } from 'src/services/authservice';
import { client } from 'src/services/graphql';
import { myProjectRole } from 'src/utils/role';
import AddMaterialDialog from '../../components/ProjectMaterialMaster/AddMaterialDialog';
import MaterialHeader from '../../components/ProjectMaterialMaster/MaterialHeader';
import {
  Carbon,
  deleteProjectMaterialMaster,
  fetchProjectMaterialQuantities,
  ProjectMaterialMaster,
  refetchProjectMaterialMaster,
  refreshWidget,
  updateProjectMaterial,
} from '../../components/ProjectMaterialMaster/MaterialMasterActions';
import MaterialPage from '../../components/ProjectMaterialMaster/MaterialPage';
import './ProjectMaterialMaster.scss';

interface Params {
  projectId: string;
}
export interface MaterialDetail {
  material: string;
  materialid: string;
  unit: string;
  projectId: string;
  Qty: string;
  Notes: string;
  ID: number;
  supplier: string;
  carbonCategory: Carbon;
}

export const noPermissionMessage =
  "You don't have permission to view project material master settings";

const ProjectMaterialMasterLanding: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [escapeKeyPressed, setEscapeKeyPressed] = useState(false);
  const [headerBtnVisible, setHeaderBtnVisible] = useState(false);
  const [search, setSearch] = useState<string>('');
  const debounce = useDebounce(search, 500);
  const { projectId } = useParams<Params>();
  const { projectDetailsState }: any = useContext(projectDetailsContext);
  const { dispatch, stateCont }: any = useContext(stateContext);
  const [projectMaterialMaster, setProjectMaterialMaster] = useState<
    Array<ProjectMaterialMaster>
  >(new Array<ProjectMaterialMaster>());
  const [tempMaterials, setTempMaterials] = useState<
    Array<ProjectMaterialMaster>
  >([]);
  const [hasCreateAccess, setCreateAccess] = useState(false);
  const [countryShortCode, setCountryShortCode] = useState();
  const addBtn = hasCreateAccess ? (
    <Button
      variant="outlined"
      onClick={() => setModalOpen(true)}
      className="btn-primary btnAdd"
    >
      Add Material
    </Button>
  ) : null;

  const fetchProjectById = async () => {
    const projectsResponse = await client.query({
      query: FETCH_PROJECT_BY_ID,
      variables: {
        id: Number(projectId),
        userId: decodeExchangeToken().userId,
      },
      fetchPolicy: 'network-only',
      context: { role: myProjectRole.viewMyProjects },
    });
    setCountryShortCode(
      projectsResponse.data.project[0]?.addresses[0]?.countryShortCode
    );
  };

  useEffect(() => {
    fetchData();
    fetchProjectById();
  }, [debounce]);

  useEffect(() => {
    setCreateAccess(
      decodeExchangeToken(
        projectDetailsState.projectToken
      ).allowedRoles.includes('createProjectMaterial')
    );
  }, [projectDetailsState]);

  const fetchQuantites = async () => {
    dispatch(setIsLoading(true));
    const res = await fetchProjectMaterialQuantities(
      projectDetailsState.projectToken
    );
    res.sort((a, b) =>
      parseFloat(a.materialId) < parseFloat(b.materialId) ? 1 : -1
    );
    setProjectMaterialMaster((ps) => {
      return ps.map((el, index) => {
        return {
          ...el,
          quantityAllocated: res.filter(
            (item: any) =>
              item.materialId == el.materialMaster.externalMaterialId
          )[0]?.quantityAllocated,
          quantityAvailable: res.filter(
            (item: any) =>
              item.materialId == el.materialMaster.externalMaterialId
          )[0]?.quantityAvailable,
          quantityConsumed: res.filter(
            (item: any) =>
              item.materialId == el.materialMaster.externalMaterialId
          )[0]?.quantityConsumed,
          quantityRequired: res.filter(
            (item: any) =>
              item.materialId == el.materialMaster.externalMaterialId
          )[0]?.quantityRequired,
        };
      });
    });
    setTempMaterials((ps) => {
      return ps.map((el, index) => {
        return {
          ...el,
          quantityAllocated: res[index]?.quantityAllocated,
          quantityAvailable: res[index]?.quantityAvailable,
          quantityConsumed: res[index]?.quantityConsumed,
          quantityRequired: res[index]?.quantityRequired,
        };
      });
    });
    dispatch(setIsLoading(false));
  };

  const fetchData = async () => {
    if (projectDetailsState.projectPermission.canViewProjectMaterial)
      try {
        dispatch(setIsLoading(true));
        setLoading(true);
        const res = await refetchProjectMaterialMaster(
          projectDetailsState.projectToken,
          parseInt(projectId),
          debounce
        );
        const arr = res.slice();
        arr.sort((a, b) =>
          parseFloat(a.materialMaster.externalMaterialId) <
          parseFloat(b.materialMaster.externalMaterialId)
            ? 1
            : -1
        );
        setProjectMaterialMaster(arr);
        setTempMaterials(arr);

        if (res.length > 0) {
          setHeaderBtnVisible(true);
        } else {
          setHeaderBtnVisible(false);
        }
        if (res && res.length > 0) await fetchQuantites();
      } catch (err) {
        Notification.sendNotification(
          'An error occured while fetching Materials',
          AlertTypes.warn
        );
      } finally {
        setLoading(false);
        dispatch(setIsLoading(false));
      }
  };

  const handleEdit = (event: any) => {
    const editColumn = event.target.id.split('-')[0];
    const index = parseInt(event.target.id.split('-')[1]);
    const str = 'string';
    setProjectMaterialMaster((ps) => {
      return ps.map((pmm, i) => {
        if (i === index) {
          if (editColumn === 'QtyReq') {
            const qr = parseFloat(parseFloat(event.target.value).toFixed(2));
            return {
              ...pmm,
              quantityRequired: qr,
            };
          } else if (editColumn === 'QtyAvl') {
            const qa = parseFloat(parseFloat(event.target.value).toFixed(2));
            return {
              ...pmm,
              quantityAvailable: qa,
            };
          } else if (editColumn === 'Notes') {
            return {
              ...pmm,
              notes:
                escapeKeyPressed == true
                  ? tempMaterials?.filter(
                      (item: any) =>
                        item?.materialMaster?.materialId ==
                        pmm.materialMaster?.externalMaterialId
                    )[0]?.notes
                  : event.target.value,
            };
          } else {
            return pmm;
          }
        } else {
          return pmm;
        }
      });
    });

    setEscapeKeyPressed(true);
  };

  const handleEditSave: any = async (event: any, rowIndex: any) => {
    let skipFetch = false;
    try {
      let index: any;
      if (rowIndex !== undefined) {
        index = rowIndex;
      } else if (event.target.name) index = parseInt(event.target.name);
      else index = parseInt(event.target.id.split('-')[1]);

      if (index === undefined) {
        skipFetch = true;
        return;
      }

      let QtyAvl = projectMaterialMaster[index].quantityAvailable;
      let QtyReq = projectMaterialMaster[index].quantityRequired;
      const supplier = projectMaterialMaster[index].supplier;
      const notes = projectMaterialMaster[index].notes;
      const prevQtyAvl = tempMaterials[index].quantityAvailable;
      const prevQtyReq = tempMaterials[index].quantityRequired;
      const prevsupplier = tempMaterials[index].supplier;
      const prevNotes = tempMaterials[index].notes;

      if (!isNaN(QtyAvl)) {
        if (QtyAvl < 0) {
          QtyAvl = 0;
        }
        if (QtyAvl > 2000000000) {
          QtyAvl = 2000000000;
        }
        setProjectMaterialMaster((ps) => {
          return ps.map((pmm, i) => {
            if (i === index) {
              return {
                ...pmm,
                quantityAvailable: QtyAvl,
              };
            } else {
              return pmm;
            }
          });
        });
      }
      if (QtyReq || QtyReq < 1 || isNaN(QtyReq)) {
        if (isNaN(QtyReq) || QtyReq < 1) {
          QtyReq = 1;
        }
        if (QtyReq > 2000000000) {
          QtyReq = 2000000000;
        }
        setProjectMaterialMaster((ps) => {
          return ps.map((pmm, i) => {
            if (i === index) {
              return {
                ...pmm,
                quantityRequired: QtyReq,
              };
            } else {
              return pmm;
            }
          });
        });
      }
      if (
        QtyAvl != prevQtyAvl ||
        QtyReq != prevQtyReq ||
        supplier != prevsupplier ||
        notes != prevNotes
      ) {
        await updateProjectMaterial(
          projectDetailsState.projectToken,
          parseInt(projectId),
          projectMaterialMaster[index].id,
          QtyAvl,
          QtyReq,
          supplier,
          notes
        );
        Notification.sendNotification(
          'Successfully updated materials',
          AlertTypes.success
        );
      } else {
        skipFetch = true;
      }
    } catch (err) {
      console.log(err);
      Notification.sendNotification(
        'Something went wrong while updating materials',
        AlertTypes.error
      );
    } finally {
      if (!skipFetch) await fetchData();
      refreshWidget();
    }
  };

  const handleSelectDropDown: any = (
    event: React.ChangeEvent<{ name?: string; value: any }>
  ) => {
    let index = 0;
    if (event.target.name) index = parseInt(event.target.name);

    setProjectMaterialMaster((ps) => {
      return ps.map((pmm, i) => {
        if (i === index) {
          return {
            ...pmm,
            supplier: event.target.value
              .filter((el: string) => el && el !== '' && el.length > 0 && el)
              .join(','),
          };
        } else {
          return pmm;
        }
      });
    });
  };

  interface SelectionType {
    all: boolean;
    selected: Array<number>;
  }

  const [selection, setSelection] = useState<SelectionType>({
    all: false,
    selected: [],
  });
  const handleSelect = (selection: 'all' | number, checked: boolean) => {
    if (selection === 'all') {
      if (checked === true) {
        setSelection({
          all: true,
          selected: projectMaterialMaster
            ?.filter((item) => item.projectTaskMaterialAssociations.length <= 0)
            ?.map((item) => item.id),
        });
      } else {
        setSelection({
          all: false,
          selected: [],
        });
      }
    } else {
      if (checked) {
        setSelection((ps) => {
          return {
            all: false,
            selected: [...ps.selected, selection],
          };
        });
      } else {
        setSelection((ps) => {
          return {
            all: false,
            selected: ps.selected.filter((item) => item !== selection),
          };
        });
      }
    }
  };

  const handleDelete = async () => {
    try {
      dispatch(setIsLoading(true));
      await deleteProjectMaterialMaster(
        projectDetailsState.projectToken,
        parseInt(projectId),
        selection.selected
      );
      setSelection({
        all: false,
        selected: [],
      });
      Notification.sendNotification(
        'Materials deleted successfully.',
        AlertTypes.success
      );
    } catch (error) {
      if (error instanceof ApolloError) {
        if (error.message.includes('Foreign key violation.')) {
          Notification.sendNotification(
            "Material can't be deleted as its being used in activities.",
            AlertTypes.error
          );
        } else {
          Notification.sendNotification(
            'Error while deleting Materials from project.',
            AlertTypes.error
          );
        }
      } else
        Notification.sendNotification(
          'Error while deleting Materials from project.',
          AlertTypes.error
        );
    } finally {
      await fetchData();
      await fetchProjectById();
      refreshWidget();
      dispatch(setIsLoading(false));
    }
  };

  return (
    //added fixed height to make the table scrollable
    //Height calculated by factoring in "Header" - 80px, padding of project__rightside settings - 30px, Margin of Root component body  - 20px
    <Box
      display="flex"
      flexDirection="column"
      gap="3%"
      width="100%"
      sx={{ height: 'calc(100vh - 130px)' }}
    >
      {projectDetailsState.projectPermission
        ?.canViewProjectCalendarAssociation ? (
        <>
          <MaterialHeader
            searchText={search}
            SearchVisible
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            addButton={addBtn}
            searchPlaceHolder="Search Material Name, Material Id"
            deleteButtonVisible={selection && selection.selected.length > 0}
            addButtonVisible={headerBtnVisible}
            onCancel={() => {
              setSelection({
                all: false,
                selected: [],
              });
            }}
            onDelete={handleDelete}
            title="Project Material Master"
          />
          <MaterialPage
            onSelect={handleSelect}
            countryCode={countryShortCode}
            selectDropDown={handleSelectDropDown}
            setEscapeKeyPressed={setEscapeKeyPressed}
            handleEditSave={handleEditSave}
            handleEdit={handleEdit}
            btnProps={{ addBtn, setHeaderBtnVisible }}
            MaterialData={projectMaterialMaster}
            loading={loading}
            selected={selection}
            searchText={debounce}
          />
          {hasCreateAccess && (
            <AddMaterialDialog
              countryCode={countryShortCode}
              visible={modalOpen}
              onClose={() => {
                setModalOpen(false);
              }}
              onSave={async () => {
                dispatch(setIsLoading(true));
                await fetchData();
                await fetchProjectById();
                dispatch(setIsLoading(false));
              }}
            />
          )}
        </>
      ) : (
        <div className="noCreatePermission-material">
          <div className="no-permission-material">
            <NoDataMessage message={noPermissionMessage} />
          </div>
        </div>
      )}
    </Box>
  );
};

export default ProjectMaterialMasterLanding;
