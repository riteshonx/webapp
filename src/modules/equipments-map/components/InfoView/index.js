import { useEffect, useState } from 'react';
import { Container, List, ListItem, Typography } from '@mui/material';
import InfoVideo from './InfoVideo';

export default function InfoView({ infoObj = {}, containerProp = {}, style }) {
  // console.log("InfoView infoObj", infoObj);
  const [currentState, setCurrentState] = useState();
  const [equipments, setEquipments] = useState([]);

  // const builder = new XMLBuilder();
  // const xmlContent = builder.build(jObj);

  // console.log(xmlReader(apiFeed));
  // // console.log('xmlContent', xmlContent);

  // console.log(xmlParser(apiFeed));
  // console.log(apiFeed);
  // useEffect(() => {

  //   axios
  //     .get(apiFeed, {
  //       "Content-Type": "application/xml; charset=utf-8",
  //     })
  //     .then((response) => {
  //       // console.log('Your xml file as string', response.data);
  //       const parser = new XMLParser();
  //       const { Fleet: fleet } = parser.parse(response.data);
  //       console.log("fleet.Equipment", fleet);
  //       console.log("fleet.Equipment", fleet.Equipment);
  //       setEquipments(fleet.Equipment);
  //     })
  //     .then(() => {
  //       console.log("equipments", equipments);
  //     });
  // }, []);

  // useEffect(() => {
  //   const equipmentSet = new Set();
  //   equipments.length &&
  //     equipments.forEach((item) => {
  //       equipmentSet.add(item.EquipmentHeader.oemName);
  //     });
  //   console.log("equipmentSet", equipmentSet);
  // }, [equipments]);

  return (
    <Container
      style={Object.assign(
        { paddingTop: 20, paddingBottom: 20 },
        { ...style },
        { ...containerProp.style }
      )}
    >
      <Typography variant="h3" style={{ fontSize: 20 }}>
        Info View
      </Typography>
      <Typography color="gray" variant="body2">
        Display {infoObj?.name || 'object'} detail here.
      </Typography>
      <List>
        {infoObj &&
          Object.keys(infoObj)
            .filter((item) => !['camera'].includes(item))
            .map((item, idx) => (
              <ListItem
                key={idx}
                style={{ display: 'flex', justifyContent: 'space-between' }}
              >
                <span>{item}</span>
                <span style={{ display: 'block-inline', float: 'right' }}>
                  {infoObj[item].toString()}
                </span>
              </ListItem>
            ))}
        {infoObj['center'] && (
          <>
            <ListItem>lat: {infoObj['center']['lat']}</ListItem>
            <ListItem>lng: {infoObj['center']['lng']}</ListItem>
          </>
        )}
      </List>
      {infoObj.camera && (
        <InfoVideo
          style={{
            width: '100%',
            height: '200px',
          }}
          src={infoObj?.camera}
        />
      )}
    </Container>
  );
}
