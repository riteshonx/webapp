export const nFormatter = (num: number, fixed = 1): any => {
  if (num >= 1000000000) {
    return (
      parseFloat((num / 1000000000).toFixed(fixed).replace(/\.0$/, "")) + "B"
    );
  }
  if (num >= 1000000) {
    return parseFloat((num / 1000000).toFixed(fixed).replace(/\.0$/, "")) + "M";
  }
  if (num >= 1000) {
    return parseFloat((num / 1000).toFixed(fixed).replace(/\.0$/, "")) + "K";
  }
  // if (num >= 1000) {
  //   return parseFloat((num / 1000).toFixed(fixed).replace(/\.0$/, "")) + "K";
  // }
  return Number(Number(num).toFixed(fixed));
};

export function randomIntFromInterval(min: any, max: any) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}
