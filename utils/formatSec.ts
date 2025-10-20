export const formatSecDefaultPadding = (seconds: number) => {
  const needMinPad = seconds > 10 * 60;
  const needHours = seconds > 60 * 60;
  return formatSec(seconds, needMinPad, needHours);
};

export const formatSec = (
  seconds: number,
  needMinPad: boolean,
  needHours: boolean,
) => {
  if (seconds <= 0) return "0:00";

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const pad = (n: number) => String(n).padStart(2, "0");

  if (needHours) {
    return `${h}:${pad(m)}:${pad(s)}`;
  } else if (needMinPad) {
    return `${pad(m)}:${pad(s)}`;
  } else {
    return `${m}:${pad(s)}`;
  }
};
