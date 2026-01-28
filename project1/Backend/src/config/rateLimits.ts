

const getMinuteWindow = () =>
    new Date().toISOString().slice(0, 16);

const getHourWindow = () =>
    new Date().toISOString().slice(0, 13);

const getDayWindow = () =>
    new Date().toISOString().slice(0, 10);

export const RATE_LIMITS = [
  { name: "minute", max: 10, windowFn: getMinuteWindow },
  { name: "hour", max: 100, windowFn: getHourWindow },
  { name: "day", max: 1000, windowFn: getDayWindow },
];