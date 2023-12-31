import { filter, sort, map, compose } from "../utils";

export function extractConfigListIds(data: Array<any>) {
  const itemsWithConfigListId = filter((item: any) => item.configListId);
  const collectConfigListIds = map((item: any) => item.configListId);
  return compose(collectConfigListIds, itemsWithConfigListId)(data);
}

export function composeTemplateData(data: any) {
  const nonAutoGeneratedFields = filter((item: any) => !item.autoGenerated);
  //increasing order of sequence
  const sortOnSequenceId = sort((a: any, b: any) => a?.sequence - b?.sequence);
  return compose(sortOnSequenceId, nonAutoGeneratedFields)(data);
}

export function enrichFormTemplateWithCustomListValue(
  templateData: any,
  customListValues: any
) {
  const data = JSON.parse(JSON.stringify(templateData));
  return data.map((item: any) => {
    item.configListValue = [];
    Object.entries(customListValues).forEach(
      ([configListId, configListValue]) => {
        if (item.configListId == configListId) {
          item.configListValue = configListValue;
        }
      }
    );
    return item;
  });
}
