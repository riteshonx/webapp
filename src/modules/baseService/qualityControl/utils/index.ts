export const filter = (cb: any) => (arr: Array<any>) => arr.filter(cb);
export const map = (cb: any) => (arr: Array<any>) => arr.map(cb);
export const sort = (cb: any) => (arr: Array<any>) => arr.sort(cb);
export const some = (cb: any) => (arr: Array<any>) => arr.some(cb);

export const compose =
  (...functions: any) =>
  (args: any) =>
    functions.reduceRight((arg: any, fn: any) => fn(arg), args);
