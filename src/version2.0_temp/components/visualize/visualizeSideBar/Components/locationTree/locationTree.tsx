import { SmartBuilding } from 'location-intelligence-viewer';
import React, { useRef, useState } from 'react';
import './locationTree.scss';
import { LocationTree as PojectLocationTree } from 'src/modules/visualize/VisualizeView/models/locationTree';
import { MapTree } from './MapTree';
import { SmartNodes } from 'src/modules/visualize/VisualizeView/models/SmartNodes';
import { Button, Switch } from '@material-ui/core';

interface LocationTreeProps {
  projectLocationTree: PojectLocationTree | undefined;
  buildings: SmartBuilding[] | undefined;
  onMapNavNodeClicked: (node: SmartNodes) => void;
  selectedMapNode: SmartNodes | undefined;
  onHomeViewClicked: () => void;
}

export const LocationTree = ({ projectLocationTree, buildings, onMapNavNodeClicked, onHomeViewClicked,  selectedMapNode }: LocationTreeProps): React.ReactElement => {

  const treeContainerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;
  const [useAdvanced, setUseAdvanced] = useState<boolean>(false);

  return (
    <div className="v2-visualize-locationtree">
      <div className="v2-visualize-locationtree-header">
        LOCATION
      </div>
      <div className="v2-visualize-locationtree-content"  ref={treeContainerRef}>
        <div className='v2-visualize-locationtree-content-allSwitch'>
          <Switch checked={useAdvanced} onChange={(event) => setUseAdvanced(event.target.checked)} />
          List All Navigation Areas
        </div>
        <Button className='v2-visualize-locationtree-content-allExtrBtn' onClick={onHomeViewClicked}>
          Exterior 
        </Button>
        <MapTree
          buildings={buildings!}
          onNodeClick={onMapNavNodeClicked}
          selectedNode={selectedMapNode!}
          showRoomsAndZones={useAdvanced}
          treeContainerRef={treeContainerRef}
        />
      </div>
    </div>
  );
};