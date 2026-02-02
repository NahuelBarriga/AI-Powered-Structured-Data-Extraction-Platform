

const getMinuteWindow = () =>
    new Date().toISOString().slice(0, 16);

const getHourWindow = () =>
    new Date().toISOString().slice(0, 13);

const getDayWindow = () =>
    new Date().toISOString().slice(0, 10);

export const RATE_LIMITS = [
  { name: "minute", max: process.env.RATE_LIMIT_MINUTE ? parseInt(process.env.RATE_LIMIT_MINUTE) : 10, windowFn: getMinuteWindow },
  { name: "hour", max: process.env.RATE_LIMIT_HOUR ? parseInt(process.env.RATE_LIMIT_HOUR) : 100, windowFn: getHourWindow },
  { name: "day", max: process.env.RATE_LIMIT_DAY ? parseInt(process.env.RATE_LIMIT_DAY) : 1000, windowFn: getDayWindow },
];