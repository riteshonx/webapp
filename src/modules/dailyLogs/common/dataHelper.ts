import { postApiWithEchange } from "src/services/api";

const enrichWithLinks = (data: any, downloadResponse: any) => {
  const parsedData = JSON.parse(JSON.stringify(data));
  const { success: response } = downloadResponse;
  parsedData.forEach((item: any, index: number) => {
    if (item?.attachments.length > 0) {
      item.attachments.forEach((key1: any, index1: number) => {
        response.forEach((key2: any) => {
          if (key2.key === key1.blobKey) {
            item.attachments[index1] = { ...key1, url: key2.url };
          }
        });
      });
    }
  });
  return parsedData;
};

const enrichDataWithLinks = async (data: any) => {
  const payload: any = [];
  data.forEach((item: any) => {
    if (item.attachments.length) {
      item.attachments.forEach((item1: any) => {
        const obj = {
          key: item1?.blobKey,
          fileName: item1.fileName,
          expiresIn: 1209600,
          processed: false,
        };
        payload.push(obj);
      });
    }
  });
  try {
    if (payload.length) {
      const downloadLinksResponse = await postApiWithEchange(
        "V1/S3/downloadLink",
        payload
      );
      if (downloadLinksResponse?.success.length) {
        const withLinks = enrichWithLinks(data, downloadLinksResponse);
        return withLinks;
      }
    }
    return data;
  } catch (e) {
    console.error("Something went wrong while downloading links", e);
    throw e;
  }
};

export { enrichDataWithLinks };
