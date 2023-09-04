import React, { useEffect, useState } from "react";
import Grid from "@material-ui/core/Grid";
import UploadButton from "../Micro/UploadButton";
import { Badge } from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import {
  createStyles,
  makeStyles,
  Theme,
  styled,
} from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import TextContent from "../Micro/TextContent";
import CircularProgress from "@material-ui/core/CircularProgress";

interface PhotoGridProps {
  photos: Array<any>;
  readOnly?: boolean;
  taskId: string;
  timeSheetId: number | string;
}

const MAX_IMAGES_ALLOWED = 20;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      border: "1px solid #ddd",
      borderRadius: "4px",
      padding: "5px",
      width: "80px",
      height: "80px",
      objectFit: "cover",
      "&:hover": {
        boxShadow: "0 0 2px 1px rgba(0, 140, 186, 0.5)",
      },
      "&::before": {
        backgroundImage: 'url("http://placehold.it/100x100")',
      },
    },
  })
);

const StyledDialog = styled(Dialog)(() => ({
  "& .MuiPaper-root": {
    borderRadius: "1rem",
  },
  "& .MuiFormControl-root": {
    width: "100%",
  },
  "& .MuiInputLabel-outlined ": {
    fontSize: "1.5rem",
    fontWeight: "200",
  },
}));

const HoverBox = styled(Box)(() => ({
  "&": {
    "&:hover": {
      cursor: "pointer",
    },
  },
}));

const PhotoCarousel = ({
  open,
  handleCloseCarousel,
  showIndex,
  photos = [],
}: any) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(showIndex);
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <StyledDialog open={open}>
      <Box padding="2rem" width="600px" overflow="hidden" position="relative">
        <Box marginBottom="2rem">
          <Typography variant="h5" style={{ fontWeight: "bold" }}>
            Photo Gallery
          </Typography>
        </Box>
        {photos.length ? (
          <Box marginBottom="2rem">
            {imageLoading && (
              <Box
                height="400px"
                bgcolor="#edecec"
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <CircularProgress style={{ color: "black" }} />
              </Box>
            )}
            <img
              src={photos[selectedPhotoIndex]?.url}
              alt="photo"
              height="400px"
              width="100%"
              style={{
                objectFit: "contain",
                background: "#edecec",
                display: imageLoading ? "none" : "block",
              }}
              onLoad={() => setImageLoading(false)}
            />
          </Box>
        ) : (
          <Box display="flex" justifyContent="center" marginBottom="2rem">
            Uh ho! Nothing to show here!
          </Box>
        )}
        {photos.length > 0 && (
          <Box display="flex" justifyContent="space-between">
            <Button
              variant="outlined"
              disabled={selectedPhotoIndex === 0}
              onClick={() => {
                setImageLoading(true);
                setSelectedPhotoIndex((p: any) => {
                  if (p === 0) return photos.length - 1;
                  return p - 1;
                });
              }}
            >
              Previous
            </Button>
            <TextContent
              content={`${selectedPhotoIndex + 1} / ${photos.length}`}
            />
            <Button
              variant="outlined"
              disabled={selectedPhotoIndex === photos.length - 1}
              onClick={() => {
                setImageLoading(true);
                setSelectedPhotoIndex((p: any) => {
                  if (p === photos.length - 1) return 0;
                  return p + 1;
                });
              }}
            >
              Next
            </Button>
          </Box>
        )}
        <IconButton
          onClick={handleCloseCarousel}
          style={{ position: "absolute", top: "10px", right: 0 }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
    </StyledDialog>
  );
};

const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  readOnly,
  taskId,
  timeSheetId,
}) => {
  const [attachments, setAttachments] = useState<Array<any>>(photos);
  const [showCarousel, setShowCarousel] = useState({ value: false, index: 0 });
  const classes = useStyles();
  useEffect(() => {
    if (photos.length) {
      const pictureGallery = photos.map((item: any) => {
        return { ...item, url: item.url, name: item.fileName };
      });
      setAttachments(pictureGallery);
    }
  }, [photos]);

  const handleCloseCarousel = () => {
    setShowCarousel({ value: false, index: 0 });
  };

  return (
    <Grid container spacing={4} alignItems="center">
      {attachments && attachments.length <= 3
        ? attachments.map(
            (photo, index) =>
              photo.url && (
                <Grid key={index} item xs={2}>
                  <HoverBox
                    onClick={() =>
                      setShowCarousel({ value: true, index: index })
                    }
                  >
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className={classes.root}
                    />
                  </HoverBox>
                </Grid>
              )
          )
        : attachments.map((photo, index) =>
            index < 2
              ? photo.url && (
                  <Grid key={index} item xs={2}>
                    <HoverBox
                      onClick={() =>
                        setShowCarousel({ value: true, index: index })
                      }
                    >
                      <img
                        src={photo.url}
                        alt={photo.name}
                        className={classes.root}
                      />
                    </HoverBox>
                  </Grid>
                )
              : index == 2
              ? photo.url && (
                  <Grid key={index} item xs={2}>
                    <Badge
                      badgeContent={attachments.length}
                      max={attachments.length - 3}
                      color="primary"
                    >
                      <HoverBox
                        onClick={() =>
                          setShowCarousel({ value: true, index: index })
                        }
                      >
                        <img
                          src={photo.url}
                          alt={photo.name}
                          className={classes.root}
                        />
                      </HoverBox>
                    </Badge>
                  </Grid>
                )
              : ""
          )}
      {!readOnly && (
        <Grid item xs={2}>
          <UploadButton
            taskId={taskId}
            timeSheetId={timeSheetId}
            disabled={photos.length >= MAX_IMAGES_ALLOWED}
          />
        </Grid>
      )}
      {showCarousel.value && (
        <PhotoCarousel
          photos={attachments}
          open={showCarousel.value}
          showIndex={showCarousel.index}
          handleCloseCarousel={handleCloseCarousel}
        />
      )}
    </Grid>
  );
};

export default PhotoGrid;
