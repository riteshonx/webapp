import moment from "moment";
import React, { ReactElement, useContext, useEffect, useState } from "react";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import {
  decodeExchangeToken,
  getExchangeToken,
} from "src/services/authservice";
import axios from "axios";
import { CircularProgress } from "@material-ui/core";
import { postApi } from "src/services/api";
import ImageDetailsPopup from "../../Shared/ImageDetailsPopup/ImageDetailsPopup";
import "./GalleryView.scss";

const DASHBOARD_URL: any = `${process.env["REACT_APP_DASHBOARD_URL"]}`;

const GalleryView = (): ReactElement => {
  const { state }: any = useContext(stateContext);
  const [isLoading, setIsLoading] = useState(false);
  const [photos, setPhotos]: any = useState(null);
  const [openCarousel, setOpenCarousel] = useState(false);
  const [selectedFile, setSelectedFile]: any = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setPhotos(null);
    if (
      state?.currentLevel === "portfolio" &&
      state?.currentPortfolio?.portfolioId
    ) {
      fetchPhotosByPortfolio();
    } else if (
      state?.currentLevel === "project" &&
      state?.currentProject?.projectId
    ) {
      fetchPhotosByProject();
    } else {
      setIsLoading(false);
    }
  }, [state?.currentLevel]);

  const fetchPhotosByPortfolio = async () => {
    try {
      const token = getExchangeToken();
      const response: any = await axios.get(
        `${DASHBOARD_URL}dashboard/v1/getPhotos?portfolioId=${state?.currentPortfolio?.portfolioId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response?.data?.cube?.length) {
        let data = await generateImageUrl(response?.data?.cube);
        data = data?.map((item: any) => {
          if (state?.selectedPreference?.lPImages?.includes(item?.id)) {
            return {
              ...item,
              isClicked: true,
            };
          } else {
            return item;
          }
        });
        setPhotos(data);

        setIsLoading(false);
      } else {
        setPhotos(response?.data?.cube);
        setIsLoading(false);
      }
    } catch (err) {
      setIsLoading(false);
      console.log("fetchPhotosByPortfolio err", err);
    }
  };

  const fetchPhotosByProject = async () => {
    try {
      const token = getExchangeToken();
      const response: any = await axios.get(
        `${DASHBOARD_URL}dashboard/v1/getPhotos?portfolioId=${state?.currentPortfolio?.portfolioId}&projectId=${state?.currentProject?.projectId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response?.data?.cube?.length) {
        let data = await generateImageUrl(response?.data?.cube);
        data = data?.map((item: any) => {
          if (state?.selectedPreference?.lPImages?.includes(item?.id)) {
            return {
              ...item,
              isClicked: true,
            };
          } else {
            return item;
          }
        });
        setPhotos(data);
        setIsLoading(false);
      } else {
        setPhotos(response?.data?.cube);
        setIsLoading(false);
      }
    } catch (err) {
      setIsLoading(false);
      console.log("fetchPhotosByProject err", err);
    }
  };

  const generateImageUrl = async (photosData: any) => {
    const payload: any = [];
    photosData?.forEach((item: any) => {
      payload.push({
        fileName: `${item?.name}.${item?.mimeType?.split("/")[1]}`,
        key: item?.fileKey,
        expiresIn: 1000,
      });
    });
    try {
      const fileUploadResponse = await postApi("V1/S3/downloadLink", payload);
      const temp: any = [];
      photosData?.forEach((item: any) => {
        const data = fileUploadResponse?.success.find(
          (res: any) => res.key === item?.fileKey
        );
        if (data) {
          temp.push({
            ...item,
            url: data.url,
            documentType: {
              id: 1,
              name: "image",
              __typename: "documentType",
            },
            documentTagAssociations: JSON.parse(item?.tags)?.map((val: any) => {
              return {
                tag: {
                  id: val?.id,
                  name: val?.name,
                  __typename: "tags",
                },
                __typename: "documentTagAssociation",
              };
            }),
            createdByUser: JSON.parse(item?.createdBy),
            updatedByUser: JSON.parse(item?.updatedBy),
          });
        }
      });
      return temp;
    } catch (err) {
      setIsLoading(false);
      console.log("err generateImageUrl", err);
    }
  };

  const savePreference = async (imageId: any) => {
    const payload: any = {
      tenantId: Number(decodeExchangeToken().tenantId),
      userId: decodeExchangeToken().userId,
      preferencesJson:
        state?.selectedPreference?.lPImages &&
        state?.selectedPreference?.lPImages?.length
          ? {
              ...state?.selectedPreference,
              lPImages: [...state?.selectedPreference?.lPImages, imageId],
            }
          : {
              ...state?.selectedPreference,
              lPImages: [imageId],
            },
    };
    const token = getExchangeToken();
    try {
      const response = await axios.post(
        `${DASHBOARD_URL}dashboard/savePreferences`,
        payload,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response?.status === 200) {
        const data = photos?.map((item: any) => {
          if (item?.id === imageId) {
            return {
              ...item,
              isClicked: true,
            };
          } else {
            return item;
          }
        });
        setPhotos(data);
      }
    } catch (error) {
      console.log("err savePreference", error);
    }
  };

  const openImageCarousel = (file: any) => {
    !file?.isClicked && savePreference(file?.id);
    setSelectedFile(file);
    setOpenCarousel(true);
  };

  return (
    <div className="galleryView-main">
      <div className="galleryView-main__headContainer">
        <span className="galleryView-main__headContainer__head">Photos</span>
      </div>
      <div className="galleryView-main__photosContainer">
        {!isLoading && photos?.length ? (
          photos.map((item: any, i: number) => (
            <img
              key={i}
              src={item?.url}
              className={
                item?.isClicked
                  ? "galleryView-main__photosContainer__photo"
                  : "galleryView-main__photosContainer__photo galleryView-main__photosContainer__photo__notClicked"
              }
              style={{
                width: photos?.length > 9 ? `${92 / 10}%` : "",
                minWidth: photos?.length <= 9 ? `${92 / 10}%` : "",
                maxWidth: photos?.length <= 9 ? `${92 / 10}%` : "",
              }}
              onClick={() => openImageCarousel(item)}
            />
          ))
        ) : (
          <div className="galleryView-main__noDataContainer">
            {photos?.length === 0 && (
              <div className="galleryView-main__noDataContainer__text">
                No Photos available!
              </div>
            )}

            {photos === null && (
              <CircularProgress className="galleryView-main__noDataContainer__circularProgress" />
            )}
          </div>
        )}
      </div>
      <ImageDetailsPopup
        open={openCarousel}
        close={() => {
          setOpenCarousel(false);
          setSelectedFile(null);
        }}
        selectedFile={selectedFile}
      />
    </div>
  );
};

export default GalleryView;
