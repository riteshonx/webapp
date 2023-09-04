import moment from "moment";

const map = (cb: any) => (arr: Array<any>) => arr.map(cb);
const filter = (cb: any) => (arr: Array<any>) => arr.filter(cb);
const find = (cb: any) => (arr: Array<any>) => arr.find(cb);
const some = (cb: any) => (arr: Array<any>) => arr.some(cb);
const reducer = (cb: any) => (arr: Array<any>) => arr.reduce(cb);

const compose =
  (...functions: any) =>
  (args: any) =>
    functions.reduceRight((arg: any, fn: any) => fn(arg), args);

const isValidDate = (date: string) => moment(date).isValid();

const formatDateWithDay = (date: string) => {
  if (isValidDate(date)) return moment(date).format("dddd, MMM DD, YYYY");
  return "--";
};

const formatDate = (date: string) => {
  if (isValidDate(date)) return moment(date).format("MMM DD, YYYY");
  return "--";
};

const formatDateForAssignedActivity = (date: string) => {
  if (isValidDate(date)) return moment(date).format("DD MMM, YYYY");
  return "--";
};

const groupByKey = (array: Array<any>, key: any) => {
  return array.reduce((hash: any, obj: any) => {
    if (obj[key] === undefined) return hash;
    return Object.assign(hash, {
      [obj[key]]: (hash[obj[key]] || []).concat(obj),
    });
  }, {});
};

const findUnique = (array: Array<any>, key: any) => {
  const uniqueSet = new Set();
  array.forEach((item) => uniqueSet.add(item[key]));
  const nonEmpty = filter((i: any) => i);
  return compose(nonEmpty)(Array.from(uniqueSet));
};

const generateDateFilterData = (name: string, value: string) => {
  return { name, type: "date", value };
};

const generateUserFilterData = (name: string, value: boolean, key: string) => {
  return { name, type: "checkbox", value, key };
};

export {
  map,
  filter,
  reducer,
  find,
  some,
  compose,
  formatDate,
  formatDateWithDay,
  groupByKey,
  findUnique,
  generateDateFilterData,
  generateUserFilterData,
  formatDateForAssignedActivity,
};
