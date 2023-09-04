import { ReactElement } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import DescriptionIcon from "@material-ui/icons/Description";
import VideoIcon from "@material-ui/icons/Videocam";
import DeleteIcon from "@material-ui/icons/DeleteOutlineOutlined";
import DownloadIcon from "@material-ui/icons/GetApp";
import AudioIcon from "@material-ui/icons/Audiotrack";
import { Tooltip } from "@material-ui/core";
import "./GridView.scss";
import { canDeleteUploads } from "src/modules/root/components/Sidebar/permission";

function GridView({
  uploadedFiles,
  fetchData,
  totalDocumentCount,
  openImageCarousel,
  handleFileDelete,
}: any): ReactElement {
  return (
    <>
      <InfiniteScroll
        dataLength={uploadedFiles?.length ? uploadedFiles?.length : 0} //This is important field to render the next data
        next={fetchData}
        hasMore={true}
        loader={
          uploadedFiles?.length === totalDocumentCount ? (
            ""
          ) : (
            <h4>Loading...</h4>
          )
        }
      >
        <div className="gridView">
          <div className="gridView__docList">
            {uploadedFiles?.length !== 0 &&
              uploadedFiles?.map((file: any, i: any) => (
                <div key={i} className="gridView__docList__container">
                  <div
                    className="gridView__docList__fileContainer"
                    onClick={() => openImageCarousel(file)}
                  >
                    {file.documentType.name === "image" && (
                      <img
                        className="gridView__docList__fileContainer__img"
                        src={file.url}
                        alt={"..."}
                      />
                    )}
                    {file.documentType.name === "docs" && (
                      <DescriptionIcon className="gridView__docList__fileContainer__docsAndVideo"></DescriptionIcon>
                    )}
                    {file.documentType.name === "video" && (
                      <VideoIcon
                        className={
                          "gridView__docList__fileContainer__docsAndVideo"
                        }
                      />
                    )}
                    {file.documentType.name === "audio" && (
                      <AudioIcon
                        className={
                          "gridView__docList__fileContainer__docsAndVideo"
                        }
                      />
                    )}
                    <div className="gridView__docList__textContainer">
                      <Tooltip title={file?.name} placement="top">
                        <span className="gridView__docList__textContainer__fileName">
                          {/* {file?.name} */}
                          {file?.name && file?.name?.length > 20
                            ? `${file?.name.slice(0, 20)}...`
                            : file?.name}
                        </span>
                      </Tooltip>
                      <span className="gridView__docList__iconContainer">
                        <Tooltip title={"Download"} placement="top">
                          <DownloadIcon
                            className="gridView__docList__iconContainer__icon"
                            onClick={(e: any) => {
                              e.stopPropagation();
                              window.open(file.url, "_blank");
                            }}
                          />
                        </Tooltip>
                        {canDeleteUploads() && (
                          <Tooltip title={"Delete"} placement="top">
                            <DeleteIcon
                              className="gridView__docList__iconContainer__icon"
                              onClick={(e: any) => handleFileDelete(e, file.id)}
                            />
                          </Tooltip>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </InfiniteScroll>
      {uploadedFiles?.length === 0 && (
        <div className="gridView__noContent">No data available</div>
      )}
    </>
  );
}

export default GridView;
