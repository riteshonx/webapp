import Box from "@material-ui/core/Box";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import Skeleton from "@material-ui/lab/Skeleton";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
      height: "100%",
      overflowY: "auto",
    },
    list: {
      paddingTop: 0,
    },
    listItemText: {
      fontSize: "1.3rem",
      fontWeight: "inherit",
    },
    listItemSelected: {
      fontWeight: "bold",
    },
    heading: {
      position: "sticky",
      top: 0,
      padding: "16px",
      fontWeight: "bold",
      backgroundColor: "white",
      fontSize: "2rem",
      zIndex: 100,
      borderBottom: "1px solid #0000001f",
    },
    errorSkeleton: {
      background: "#ffe6e0",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "2rem",
      textAlign: "center",
      color: "#ff3c3c",
    },
    noDataSkeleton: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "2rem",
      textAlign: "center",
    },
  })
);

interface SideContentProps {
  listOfItems: Array<any>;
  handleSelectedItem: (e: any) => void;
  selectedItemId?: number;
  indicators: any;
}

const SideContent: React.FC<SideContentProps> = ({
  listOfItems,
  handleSelectedItem,
  selectedItemId,
  indicators,
}) => {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Typography classes={{ root: classes.heading }}>Buildings</Typography>

      {indicators.isLoading ? (
        <Skeleton variant="rect" width="100%" height="calc(100% - 63px)" />
      ) : indicators.isError ? (
        <Skeleton
          classes={{ root: classes.errorSkeleton }}
          variant="rect"
          width="100%"
          height="calc(100% - 63px)"
          animation={false}
        >
          Something went wrong :(
        </Skeleton>
      ) : indicators.hasDataAfterFetch ? (
        <List classes={{ root: classes.list }} component="nav">
          {listOfItems.map((item: any, index: number) => (
            <div key={item.id}>
              <ListItem
                button
                selected={selectedItemId == item.id}
                onClick={() => handleSelectedItem(item)}
                classes={{ selected: classes.listItemSelected }}
              >
                <ListItemText
                  classes={{ primary: classes.listItemText }}
                  primary={`Building ${item.id}`}
                />
              </ListItem>
              {index < listOfItems.length - 1 && <Divider />}
            </div>
          ))}
        </List>
      ) : (
        <Skeleton
          classes={{ root: classes.noDataSkeleton }}
          variant="rect"
          width="100%"
          height="calc(100% - 63px)"
          animation={false}
        >
          Nothing to show here ٩(͡๏̯͡๏)۶
        </Skeleton>
      )}
    </Box>
  );
};

export default SideContent;
