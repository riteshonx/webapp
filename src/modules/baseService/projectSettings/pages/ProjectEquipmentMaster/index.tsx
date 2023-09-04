import { ApolloError } from '@apollo/client';
import { Button } from '@material-ui/core';
import { Box } from '@mui/system';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDebounce } from 'src/customhooks/useDebounce';
import { projectDetailsContext } from 'src/modules/baseService/projects/Context/ProjectDetailsContext';
import { setIsLoading } from 'src/modules/root/context/authentication/action';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import NoDataMessage from 'src/modules/shared/components/NoDataMessage/NoDataMessage';
import Notification, {
  AlertTypes,
} from 'src/modules/shared/components/Toaster/Toaster';
import { decodeExchangeToken } from 'src/services/authservice';
import AddEquipmentDialog from '../../components/ProjectEquipmentMaster/AddEquipmentDialog';
import EquipmentHeader from '../../components/ProjectEquipmentMaster/EquipmentHeader';
import {
  deleteProjectEquipmentMaster,
  ProjectEquipmentMaster,
  refetchProjectEquipmentMaster,
} from '../../components/ProjectEquipmentMaster/EquipmentMasterAction';
import EquipmentPage from '../../components/ProjectEquipmentMaster/EquipmentPage';
import './ProjectEquipmentMaster.scss';

interface Params {
  projectId: string;
}

export interface EquipmentDetail {
  baselineHours: string;
  capacity: string;
  description: string;
  documentation: string;
  equipmentCategory: string;
  equipmentId: string;
  equipmentType: string;
  id: string;
  metadata: string;
  model: string;
  oemName: string;
  status: string;
  supplier: string;
  tenantId: string;
  projectId: string;
  startDate: any;
  endDate: any;
  startDateOpen: boolean;
  endDateOpen: boolean;
}
export const noPermissionMessage =
  "You don't have permission to view project equipment master settings";

const ProjectEquipmentMasterLanding: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [headerBtnVisible, setHeaderBtnVisible] = useState(false);
  const [search, setSearch] = useState<string>('');
  const debounce = useDebounce(search, 500);
  const { projectId } = useParams<Params>();
  const { projectDetailsState }: any = useContext(projectDetailsContext);
  const { dispatch, stateCont }: any = useContext(stateContext);
  const [projectEquipmentMaster, setProjectEquipmentMaster] = useState<
    Array<ProjectEquipmentMaster>
  >(new Array<ProjectEquipmentMaster>());
  const [hasCreateAccess, setCreateAccess] = useState(false);
  const addBtn = hasCreateAccess ? (
    <Button
      variant="outlined"
      onClick={() => setModalOpen(true)}
      className="btn-primary equipmentbtn"
    >
      Add Equipment
    </Button>
  ) : null;
  useEffect(() => {
    fetchData();
  }, [debounce]);

  useEffect(() => {
    setCreateAccess(
      decodeExchangeToken(
        projectDetailsState.projectToken
      ).allowedRoles.includes('createProjectMaterial')
    );
  }, [projectDetailsState]);

  const fetchData: any = async () => {
    if (projectDetailsState.projectPermission.canViewProjectMaterial)
      try {
        dispatch(setIsLoading(true));
        setLoading(true);
        const res = await refetchProjectEquipmentMaster(
          projectDetailsState.projectToken,
          projectId,
          debounce.trim()
        );
        const arr = res.slice();
        arr.sort((a: any, b: any) =>
          parseFloat(a.equipmentId) < parseFloat(b.equipmentId) ? 1 : -1
        );
        setProjectEquipmentMaster(arr);
        if (res.length > 0) setHeaderBtnVisible(true);
      } catch (err) {
        console.log('error in fetching equipment', err);
        Notification.sendNotification(
          'An error occured while fetching Equipments',
          AlertTypes.warn
        );
      } finally {
        setLoading(false);
        dispatch(setIsLoading(false));
      }
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
          selected: projectEquipmentMaster?.map(
            (item: any) => item?.equipmentId
          ),
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
            selected: ps.selected.filter((item: any) => item !== selection),
          };
        });
      }
    }
  };

  const handleDelete = async () => {
    try {
      dispatch(setIsLoading(true));
      await deleteProjectEquipmentMaster(
        projectDetailsState.projectToken,
        selection.selected
      );
      setSelection({
        all: false,
        selected: [],
      });
      Notification.sendNotification(
        'Equipments deleted successfully.',
        AlertTypes.success
      );
    } catch (error) {
      if (error instanceof ApolloError) {
        if (error.message.includes('Foreign key violation.')) {
          Notification.sendNotification(
            "Equipment can't be deleted as its being used in activities.",
            AlertTypes.error
          );
        } else {
          Notification.sendNotification(
            'Error while deleting Equipment from project.',
            AlertTypes.error
          );
        }
      } else
        Notification.sendNotification(
          'Error while deleting Equipment from project.',
          AlertTypes.error
        );
    } finally {
      await fetchData();
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
          <EquipmentHeader
            searchText={search}
            SearchVisible
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            addButton={addBtn}
            deleteButtonVisible={selection && selection.selected.length > 0}
            addButtonVisible={headerBtnVisible}
            onCancel={() => {
              setSelection({
                all: false,
                selected: [],
              });
            }}
            onDelete={handleDelete}
            title="Project Equipment Master"
          />
          <EquipmentPage
            onSelect={handleSelect}
            btnProps={{ addBtn, setHeaderBtnVisible }}
            EquipmentData={projectEquipmentMaster}
            loading={loading}
            selected={selection}
            searchText={debounce}
            projectId={projectId}
            projectToken={projectDetailsState.projectToken}
            fetchData={fetchData}
          />
          {hasCreateAccess && (
            <AddEquipmentDialog
              visible={modalOpen}
              projectEquipmentMaster={projectEquipmentMaster}
              onClose={() => {
                setModalOpen(false);
              }}
              onSave={async () => {
                dispatch(setIsLoading(true));
                await fetchData();
                dispatch(setIsLoading(false));
              }}
            />
          )}
        </>
      ) : (
        <div className="noCreatePermission-equipment">
          <div className="no-permission-equipment">
            <NoDataMessage message={noPermissionMessage} />
          </div>
        </div>
      )}
    </Box>
  );
};

export default ProjectEquipmentMasterLanding;
