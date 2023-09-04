import React, { useContext, useEffect, useState } from 'react';
import EquipmentMasterContext from '../../context/EquipmentMaster/equipmentMasterContext';
import AddEquipmentMaster from './components/AddEquipmnentMaster/AddEquipmentMaster';
import EquipmentMasterHeader from './components/EquipmentMasterHeader/EquipmentMasterHeader';
import EquipmentMasterTable from './components/EquipmentMasterTable/EquipmentMasterTable';
import { useDebounce } from 'src/customhooks/useDebounce';
import './EquipmentMaster.scss';
const EquipmentMaster = () => {
  const [searchText, setsearchText] = useState('');
  const debouncedSearchTerm = useDebounce(searchText, 500);
  const [viewType, setViewType] = useState('gallery');
  const [addEquipmentMaster, setAddEquipmentMaster] = useState(false);
  const equipmentMasterContext = useContext(EquipmentMasterContext);

  const { getEquipmentMaster,updateEquipmentMaster,getEquipmentNameSearch } = equipmentMasterContext;
  const [editEquipment, setEditEquipmentMaster] = useState<any>(null);

  useEffect(() => {
    getEquipmentMaster();
  }, []);

  useEffect(() => {
    if(debouncedSearchTerm){
      getEquipmentNameSearch(debouncedSearchTerm);
    }
    else{
      getEquipmentNameSearch()
    }
  }, [debouncedSearchTerm]);

  const searchEquipmentMasterByName = (value: string) => {
    setsearchText(value);
  };

  const toggleView = (type: string) => {
    setViewType(type);
  };

  const refreshList = (updated?: boolean) => {
    console.log('updated: ', updated);
    getEquipmentMaster();
  };

  const editEquimentMaster = (e: any, equipment: any) => {
    setEditEquipmentMaster(equipment);
    setAddEquipmentMaster(true);
  };

  const discardAddEditEquipmentMaster = () => {
    setAddEquipmentMaster(false);
    setEditEquipmentMaster(null);
  };
  return (
    <div className="equipment-master">
      <EquipmentMasterHeader
        header={{ name: 'Equipment Master' }}
        search={searchEquipmentMasterByName}
        searchText={searchText}
        addEquipmentMaster={setAddEquipmentMaster}
      />
      <EquipmentMasterTable
        editEquimentMaster={editEquimentMaster}
        updateEquipmentMaster={updateEquipmentMaster}
      ></EquipmentMasterTable>
      {addEquipmentMaster && (
        <AddEquipmentMaster
          open={addEquipmentMaster}
          close={discardAddEditEquipmentMaster}
          editEquipment={editEquipment}
          addEquipmentMaster={(equipment: any) => {
            discardAddEditEquipmentMaster();
          }}
        ></AddEquipmentMaster>
      )}
    </div>
  );
};

export default EquipmentMaster;
