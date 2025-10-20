export const capitalizeFirst = (value: string) =>
  `${value.charAt(0).toUpperCase()}${value.slice(1, value.length)}`;

export const capitalizeAll = (value: string) =>
  value
    .split(" ")
    .map((s) => capitalizeFirst(s))
    .join(" ");
