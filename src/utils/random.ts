export const randomRangeInt = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.round(Math.random()*(max-min)) + min;
}
export const randomRangeFloat = (min: number, max: number) => {
  return Math.random()*(max-min) + min;
}