import {
  Button,
  Checkbox,
  IconButton,
  ListItemText,
  TextField,
} from "@material-ui/core";
import { ReactElement, useContext, useEffect, useRef, useState } from "react";
import SearchIcon from "@material-ui/icons/Search";
import FilterListIcon from "@material-ui/icons/FilterList";
import UploadIcon from "@material-ui/icons/CloudUpload";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import "./UploadView.scss";
import AppsIcon from "@material-ui/icons/Apps";
import ViewListIcon from "@material-ui/icons/ViewList";
import ArrowLeftIcon from "@material-ui/icons/ArrowLeft";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import SlideIcon from "@material-ui/icons/CollectionsRounded";
import ProjectFileUpload from "../components/projectFileUpload/ProjectFileUpload";
import ProjectFilesTable from "../components/projectFilesTable/ProjectFilesTable";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import moment from "moment";
import DateRangeSlider from "../components/dateRangeSlider/DateRangeSlider";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import { setIsLoading } from "src/modules/root/context/authentication/action";
import { postApi } from "src/services/api";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import {
  DELETE_DOCUMENT,
  DELETE_TAGS,
  FILTER_BY_DOCTYPE_AND_TAGS,
  FILTER_DOCUMENTS_BY_DOCTYPE,
  FILTER_DOCUMENTS_BY_TAG,
  GET_ALL_DOCUMENTS,
  GET_ALL_UPLOAD_DATES,
  GET_DOCUMENT_TYPE,
  GET_TAGS,
  UPDATE_DOCUMENT,
  UPDATE_TAGS,
} from "../graphql/graphql";
import { client } from "src/services/graphql";
import GridView from "../components/gridView/GridView";
import { useDebounce } from "../../../customhooks/useDebounce";
import { uploadContext } from "../contextAPI/context";
import {
  setTagsAndDocumentTypes,
  setUploadDates,
  setUploadFiles,
} from "../contextAPI/action";
import DocumentUpdateView from "../components/documentUpdateView/DocumentUpdateView";
import tagImage from "../../../assets/images/tag1.png";
import { canCreateUploads } from "src/modules/root/components/Sidebar/permission";
import GlobalKeyboardDatePicker from "src/modules/shared/components/GlobalDatePicker/GlobalKeyboardDatePicker";
import TimelineImageSlider from "../components/timelineImageSlider/TimelineImageSlider";
import { useQuery } from "src/modules/authentication/utils";
import { useHistory } from "react-router-dom";

function UploadView(): ReactElement {
  const { dispatch, state }: any = useContext(stateContext);
  const history = useHistory();
  const isOpenUpload: any = useQuery().get("upload");
  const { uploadDispatch, uploadState }: any = useContext(uploadContext);
  const [viewType, setViewType] = useState("grid");
  const [openFileZone, setOpenFileZone] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { innerWidth: width } = window;
  const [openCarousel, setOpenCarousel] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [selectedDate, setSelectedDate]: any = useState(null);
  const [filterOption, setFilterOption]: any = useState({
    tags: {},
  });
  const [docFilterOption, setDocFilterOption]: any = useState({
    documentType: {},
  });
  const [pageLimitAndOffset, setPageLimitAndOffset]: any = useState({
    limit: 25,
    offset: 0,
  });
  const [searchValue, setSearchValue] = useState("");
  const [selectedFile, setSelectedFile]: any = useState(null);
  const [openImageSlide, setOpenImageSlide]: any = useState(false);
  const debounceSearchName = useDebounce(searchValue, 700);
  const fieldRef = useRef<HTMLInputElement>(null);
  const tagScrollRef = useRef<HTMLInputElement>(null);

  // Get All uploadedDates, tags and documentTypes
  useEffect(() => {
    state.selectedProjectToken && getAllTagsAndDocumentTypes();
    state.selectedProjectToken && getAllUploadDates();
  }, [state.selectedProjectToken]);

  // Reset page offset to zero
  useEffect(() => {
    setPageLimitAndOffset({ limit: 25, offset: 0 });
  }, [debounceSearchName, selectedDate, filterOption, docFilterOption]);

  // Based on page offset value get documents either by concat or replacing
  useEffect(() => {
    if (pageLimitAndOffset.offset === 0) {
      state.selectedProjectToken && getDocumentsBasedOnFilter();
    } else state.selectedProjectToken && getDocumentsBasedOnFilter(true);
  }, [state.selectedProjectToken, pageLimitAndOffset]);

  // getting uploaded dates
  const getAllUploadDates = async () => {
    try {
      dispatch(setIsLoading(true));
      const documentsResponse = await client.query({
        query: GET_ALL_UPLOAD_DATES,
        fetchPolicy: "network-only",
        context: {
          role: "viewDocument",
          token: state.selectedProjectToken,
        },
      });
      const uploadedDates = documentsResponse?.data?.documents.map(
        (item: any) => moment(item.createdAt).format("DD/MMM/YYYY ddd")
      );
      uploadDispatch(setUploadDates(uploadedDates));
    } catch (error: any) {
      dispatch(setIsLoading(false));
      console.log(error);
    }
  };

  // getting documents based on filter applied (documentFilter or tagFilter or documentFilter & tagFilter or all docs)
  const getDocumentsBasedOnFilter = (pageChange?: boolean) => {
    const documentFilter = Object.keys(docFilterOption.documentType).filter(
      (item: any) => docFilterOption.documentType[item] && item
    );

    const tagFilter = Object.keys(filterOption.tags).filter(
      (item: any) => filterOption.tags[item] && item
    );

    dispatch(setIsLoading(true));

    if (documentFilter.length && tagFilter.length) {
      getFilterByTagsAndDocType(documentFilter, tagFilter, pageChange);
    } else if (documentFilter.length) {
      getDocumentsFilterByDocType(documentFilter, pageChange);
    } else if (tagFilter.length) {
      getDocumentsFilterByTags(tagFilter, pageChange);
    } else {
      getAllDocuments(pageChange);
    }
  };

  // get all tags and docTypes
  const getAllTagsAndDocumentTypes = async () => {
    try {
      dispatch(setIsLoading(true));
      const documentTypeResponse = await client.query({
        query: GET_DOCUMENT_TYPE,
        fetchPolicy: "network-only",
        context: {
          role: "viewDocument",
          token: state.selectedProjectToken,
        },
      });
      const tagsResponse = await client.query({
        query: GET_TAGS,
        fetchPolicy: "network-only",
        context: {
          role: "viewDocument",
          token: state.selectedProjectToken,
        },
      });
      const docTypesFilter: any = {};
      documentTypeResponse.data?.documentType?.forEach((item: any) => {
        docTypesFilter[item.id] = false;
      });
      setDocFilterOption({ documentType: docTypesFilter });
      uploadDispatch(
        setTagsAndDocumentTypes({
          tags: tagsResponse.data?.tags,
          documentTypes: documentTypeResponse.data?.documentType,
        })
      );
    } catch (error: any) {
      dispatch(setIsLoading(false));
      console.log(error);
    }
  };

  // get all docs
  const getAllDocuments = async (pageChange?: boolean) => {
    try {
      dispatch(setIsLoading(true));
      const documentsResponse = await client.query({
        query: GET_ALL_DOCUMENTS,
        fetchPolicy: "network-only",
        context: {
          role: "viewDocument",
          token: state.selectedProjectToken,
        },
        variables: {
          from: selectedDate
            ? moment(selectedDate).startOf("day").format()
            : moment("2018-01-01").startOf("day").format(),
          to: selectedDate
            ? moment(selectedDate).endOf("day").format()
            : moment().endOf("day").format(),
          limit: pageLimitAndOffset.limit,
          offset: pageLimitAndOffset.offset,
          qry: `%${debounceSearchName}%`,
        },
      });
      formatDocumentData(documentsResponse, pageChange);
    } catch (err) {
      console.log("err", err);
      dispatch(setIsLoading(false));
    }
  };

  // filter by documentFilter & tagFilter
  const getFilterByTagsAndDocType = async (
    docIds: any,
    tagIds: any,
    pageChange?: boolean
  ) => {
    try {
      const documentsResponse = await client.query({
        query: FILTER_BY_DOCTYPE_AND_TAGS,
        fetchPolicy: "network-only",
        context: {
          role: "viewDocument",
          token: state.selectedProjectToken,
        },
        variables: {
          tagId: tagIds,
          documentType: docIds,
          from: selectedDate
            ? moment(selectedDate).startOf("day").format()
            : moment("2018-01-01").startOf("day").format(),
          to: selectedDate
            ? moment(selectedDate).endOf("day").format()
            : moment().endOf("day").format(),
          limit: pageLimitAndOffset.limit,
          offset: pageLimitAndOffset.offset,
          qry: `%${debounceSearchName}%`,
        },
      });
      formatDocumentData(documentsResponse, pageChange);
    } catch (error) {
      dispatch(setIsLoading(false));
    }
  };

  // filter by tags
  const getDocumentsFilterByTags = async (
    tagIds: any,
    pageChange?: boolean
  ) => {
    try {
      const documentsResponse = await client.query({
        query: FILTER_DOCUMENTS_BY_TAG,
        fetchPolicy: "network-only",
        context: {
          role: "viewDocument",
          token: state.selectedProjectToken,
        },
        variables: {
          tagId: tagIds,
          from: selectedDate
            ? moment(selectedDate).startOf("day").format()
            : moment("2018-01-01").startOf("day").format(),
          to: selectedDate
            ? moment(selectedDate).endOf("day").format()
            : moment().endOf("day").format(),
          limit: pageLimitAndOffset.limit,
          offset: pageLimitAndOffset.offset,
          qry: `%${debounceSearchName}%`,
        },
      });
      formatDocumentData(documentsResponse, pageChange);
    } catch (error) {
      dispatch(setIsLoading(false));
    }
  };

  // filter by docTypes
  const getDocumentsFilterByDocType = async (
    docIds: any,
    pageChange?: boolean
  ) => {
    try {
      const documentsResponse = await client.query({
        query: FILTER_DOCUMENTS_BY_DOCTYPE,
        fetchPolicy: "network-only",
        context: {
          role: "viewDocument",
          token: state.selectedProjectToken,
        },
        variables: {
          documentType: docIds,
          from: selectedDate
            ? moment(selectedDate).startOf("day").format()
            : moment("2018-01-01").startOf("day").format(),
          to: selectedDate
            ? moment(selectedDate).endOf("day").format()
            : moment().endOf("day").format(),
          limit: pageLimitAndOffset.limit,
          offset: pageLimitAndOffset.offset,
          qry: `%${debounceSearchName}%`,
        },
      });
      formatDocumentData(documentsResponse, pageChange);
    } catch (error) {
      setIsLoading(false);
    }
  };

  // format data and add download url
  const formatDocumentData = async (
    documentsResponse: any,
    pageChange?: boolean
  ) => {
    const payload: any = [];

    documentsResponse?.data?.documents?.forEach((item: any) => {
      payload.push({
        fileName: `${item?.name}.${item?.mimeType?.split("/")[1]}`,
        key: item?.fileKey,
        expiresIn: 1000,
      });
    });

    try {
      const fileUploadResponse = await postApi("V1/S3/downloadLink", payload);
      const temp: any = [];
      documentsResponse?.data?.documents?.forEach((item: any) => {
        const data = fileUploadResponse?.success.find(
          (res: any) => res.key === item?.fileKey
        );

        if (data) {
          temp.push({ ...item, url: data.url });
        }
      });
      dispatch(setIsLoading(false));
      if (isOpenUpload) {
        setOpenFileZone(true);
      }

      !pageChange && pageLimitAndOffset.offset === 0
        ? uploadDispatch(
            setUploadFiles({
              data: temp,
              totalCount:
                documentsResponse?.data?.documents_aggregate?.aggregate.count,
            })
          )
        : uploadDispatch(
            setUploadFiles({
              data: [...uploadState.uploadFiles, ...temp],
              totalCount:
                documentsResponse?.data?.documents_aggregate?.aggregate.count,
            })
          );

      selectedFile &&
        setSelectedFile(temp.find((item: any) => item.id === selectedFile.id));
    } catch (error) {
      dispatch(setIsLoading(false));
    }
  };

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const openImageCarousel = (file: any) => {
    setSelectedFile(file);
    setOpenCarousel(true);
  };

  const handleClose = (item: any) => {
    if (item) {
      setDocFilterOption({
        ...docFilterOption,
        [item.__typename]: {
          ...docFilterOption[item.__typename],
          [item.id]: !docFilterOption[item.__typename][item.id],
        },
      });
    }
  };

  const handleViewType = (type: string) => {
    setViewType(type);
  };

  const openFileUpload = () => {
    setOpenFileZone(true);
  };

  const closeFileZone = () => {
    setOpenFileZone(false);
  };

  const handleFromDateChange = (date: any) => {
    if (
      moment(date).format("DD MM YY") ===
      moment(selectedDate).format("DD MM YY")
    ) {
      setSelectedDate(null);
    } else {
      setSelectedDate(new Date(date));
    }
  };

  const handleFromMonthAndYearChange = (date: any) => {
    setSelectedDate(new Date(date));
  };

  const handleSaveChanges = async (data: any) => {
    try {
      await client.mutate({
        mutation: UPDATE_DOCUMENT,
        variables: {
          fileId: data.id,
          name: data.name,
          description: data.description,
          coordinates: data.coordinates,
          viewOnDashboard: data.viewOnDashboard,
        },
        context: {
          role: "updateDocument",
          token: state.selectedProjectToken,
        },
      });
      const tagData = data.documentTagAssociations.map((item: any) => {
        return { tagId: item.tag.id, documentId: data.id };
      });
      await client.mutate({
        mutation: DELETE_TAGS,
        variables: {
          documentId: data.id,
        },
        context: {
          role: "updateDocument",
          token: state.selectedProjectToken,
        },
      });

      await client.mutate({
        mutation: UPDATE_TAGS,
        variables: { data: tagData },
        context: {
          role: "updateDocument",
          token: state.selectedProjectToken,
        },
      });
      setPageLimitAndOffset({
        limit: 25,
        offset: 0,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleFileDelete = async (e: any, fileId: any) => {
    e.stopPropagation();
    try {
      dispatch(setIsLoading(true));
      await client.mutate({
        mutation: DELETE_DOCUMENT,
        variables: { fileId: fileId },
        context: {
          role: "deleteDocument",
          token: state.selectedProjectToken,
        },
      });
      setPageLimitAndOffset({
        limit: 25,
        offset: 0,
      });
      dispatch(setIsLoading(false));
    } catch (error) {
      dispatch(setIsLoading(false));
      console.log(error);
    }
  };

  const fetchData = () => {
    setPageLimitAndOffset({
      limit: 25,
      offset: pageLimitAndOffset.offset + 25,
    });
  };

  const handleTagScroll = (scrollType: any) => {
    if (tagScrollRef?.current) {
      tagScrollRef?.current.scrollTo(
        tagScrollRef?.current?.scrollLeft + scrollType,
        0
      );
    }
  };

  const goBack = () => {
    history.goBack();
  };

  return (
    <div className="uploadView">
      <div className="uploadView__topContainer">
        <div className="uploadView__header">
          <div className="uploadView__header__navBack">
            <ArrowBackIosIcon onClick={goBack} />
          </div>
          <div className="uploadView__header__text">
            <h2>
              <label>Library</label>
            </h2>
          </div>
        </div>
        <div className="uploadView__viewStyle">
          <div className="uploadView__view-btn">
            {viewType === "grid" ? (
              <>
                <Button
                  data-testid={"grid-view"}
                  variant="outlined"
                  className="toggle-primary"
                  onClick={() => handleViewType("grid")}
                  startIcon={<AppsIcon />}
                >
                  Gallery view
                </Button>
                <div className="l-view" onClick={() => handleViewType("list")}>
                  <ViewListIcon /> List view
                </div>
              </>
            ) : (
              <>
                <div className="g-view" onClick={() => handleViewType("grid")}>
                  <AppsIcon />
                  Gallery view
                </div>
                <Button
                  data-testid={"list-view"}
                  variant="outlined"
                  className="toggle-primary"
                  onClick={() => handleViewType("list")}
                  startIcon={<ViewListIcon />}
                >
                  List view
                </Button>
                <Button
                  data-testid={"list-view"}
                  variant="outlined"
                  className="toggle-primary"
                  onClick={() => setOpenImageSlide(true)}
                  startIcon={<ViewListIcon />}
                >
                  Slide view
                </Button>
              </>
            )}
          </div>
          <div className="uploadView__right">
            <div className="uploadView__right__search">
              <TextField
                id="project-list-search-text"
                type="text"
                fullWidth
                placeholder="Search"
                autoComplete="off"
                variant="outlined"
                value={searchValue}
                onChange={(e: any) => {
                  setSearchValue(e.target.value);
                }}
              />
              <SearchIcon className="uploadView__right__search__icon" />
            </div>
            <div>
              <MuiPickersUtilsProvider libInstance={moment} utils={MomentUtils}>
                <GlobalKeyboardDatePicker
                  data-testid="startDate"
                  className="uploadView__picker"
                  variant="inline"
                  value={selectedDate}
                  onChange={handleFromMonthAndYearChange}
                  format="DD-MMM-yyyy"
                  name="startDate"
                  minDate={"01/01/2018"}
                  disableFuture={true}
                  InputProps={{ disableUnderline: true, disabled: true }}
                  InputAdornmentProps={{ position: "start" }}
                />
              </MuiPickersUtilsProvider>
            </div>
            <IconButton onClick={handleClick}>
              <FilterListIcon />
            </IconButton>
            <Menu
              id="simple-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              getContentAnchorEl={null}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              onClose={() => setAnchorEl(null)}
            >
              {uploadState.documentTypes?.map((item: any) => (
                <MenuItem key={item.id} onClick={() => handleClose(item)}>
                  <Checkbox
                    className="uploadView__checkbox"
                    checked={docFilterOption[item.__typename][item.id]}
                    color="primary"
                  />
                  <ListItemText
                    primary={
                      item.name.slice(0, 1).toUpperCase() + item.name.slice(1)
                    }
                  />
                  {docFilterOption[item.__typename][item.id]}
                </MenuItem>
              ))}
            </Menu>
            {canCreateUploads() && (
              <IconButton
                onClick={() => openFileUpload()}
                className="uploadView__right__add-btn"
              >
                <UploadIcon />
              </IconButton>
            )}
            <IconButton
              onClick={() => setOpenImageSlide(true)}
              className="uploadView__right__add-btn"
            >
              <SlideIcon />
            </IconButton>
          </div>
        </div>

        <div
          style={{
            width:
              sessionStorage.getItem("stateView") === "fourth"
                ? ""
                : width * 0.938,
          }}
        >
          <DateRangeSlider
            fieldRef={fieldRef}
            startDate={moment("01/01/2018")}
            selectedDate={selectedDate}
            handleDateChange={handleFromDateChange}
            uploadDates={uploadState.uploadDates}
          />
        </div>
        <div
          style={{
            width:
              sessionStorage.getItem("stateView") === "fourth"
                ? ""
                : width * 0.938,
          }}
          className="uploadView__tags-container"
        >
          <div
            className="uploadView__tags-container__showTagButton"
            onClick={() =>
              uploadState.tags?.length ? setShowTags(!showTags) : undefined
            }
          >
            <img
              src={tagImage}
              className="uploadView__tags-container__showTagButton__img"
            ></img>
            Tags
          </div>
          {showTags && (
            <>
              <IconButton
                className="uploadView__tags-container__iconButton"
                onClick={() => handleTagScroll(-(window.innerWidth * 0.8))}
              >
                <ArrowLeftIcon />
              </IconButton>
              <div
                className="uploadView__tags-container__scrollContainer"
                ref={tagScrollRef}
              >
                {uploadState.tags?.map((item: any, i: number) => (
                  <span
                    className={
                      filterOption[item.__typename][item.id]
                        ? "uploadView__tags-container__tagStyles uploadView__tags-container__selectedTagStyles"
                        : "uploadView__tags-container__tagStyles uploadView__tags-container__nonSelectedTagStyles"
                    }
                    key={i}
                    onClick={() => {
                      setFilterOption({
                        ...filterOption,
                        [item.__typename]: {
                          ...filterOption[item.__typename],
                          [item.id]: !filterOption[item.__typename][item.id],
                        },
                      });
                    }}
                  >
                    {item.name.slice(0, 1).toUpperCase() + item.name.slice(1)}
                  </span>
                ))}
              </div>
              <IconButton
                className="uploadView__tags-container__iconButton"
                onClick={() => handleTagScroll(+(window.innerWidth * 0.8))}
              >
                <ArrowRightIcon />
              </IconButton>
            </>
          )}
        </div>
      </div>

      {openFileZone && (
        <>
          <ProjectFileUpload
            openFileZone={openFileZone}
            closeFileZone={closeFileZone}
            documentTypes={uploadState.documentTypes}
            getDocumentsBasedOnFilter={getDocumentsBasedOnFilter}
            getAllUploadDates={getAllUploadDates}
          />
        </>
      )}

      {viewType == "grid" ? (
        <GridView
          uploadedFiles={uploadState.uploadFiles}
          fetchData={fetchData}
          totalDocumentCount={uploadState.totalDocumentCount}
          openImageCarousel={openImageCarousel}
          handleFileDelete={handleFileDelete}
        />
      ) : (
        <ProjectFilesTable
          files={uploadState.uploadFiles}
          tags={uploadState.tags}
          fetchData={fetchData}
          handleDeleteRow={handleFileDelete}
          handleCarouselOpen={openImageCarousel}
          totalDocumentCount={uploadState.totalDocumentCount}
        />
      )}
      <DocumentUpdateView
        open={openCarousel}
        close={() => {
          setOpenCarousel(false);
          setSelectedFile(null);
        }}
        selectedFile={selectedFile}
        tags={uploadState.tags}
        handleSaveChanges={handleSaveChanges}
      />
      <TimelineImageSlider
        open={openImageSlide}
        uploadedFiles={uploadState.uploadFiles}
        close={() => setOpenImageSlide(false)}
      />
    </div>
  );
}

export default UploadView;
