// @ts-ignore

/**
 * @descripiotn user could use connection tool to track the status of websocket
 */

const ConnectControlButton = ({ context }) => {
  const [isConnected, setIsConnected] = useState(false);

  const handleConnectionConnect = (apiURL, authorization) => (_e) => {
    console.log("apiURL", apiURL);
  };

  return (
    <EquipmentsMapContext.Consumer>
      {({ graphAPIURL, authorization }) => (
        <IconButton
          onClick={handleConnectionConnect(graphAPIURL, authorization)}
        >
          {isConnected ? <LinkIcon /> : <LinkOff />}
        </IconButton>
      )}
    </EquipmentsMapContext.Consumer>
  );
};

export default ConnectControlButton;