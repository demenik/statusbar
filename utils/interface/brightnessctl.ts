import { execAsync } from "ags/process";
import { createPoll } from "ags/time";
import { stateFromAccessor } from "../accessor";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

type BrightnessProps = {
  class?: string;
  device?: string;
  interval?: number;
};

export const createBrightness = ({
  class: clazz,
  device,
  interval = 30 * 1000,
}: BrightnessProps) => {
  const filter = clazz ? `c ${clazz}` : `d ${device!}`;

  const [percent, setPercent] = stateFromAccessor(
    createPoll(1, interval, () =>
      execAsync(`brightnessctl -m${filter} info`)
        .then((value) =>
          clamp(parseInt(value.split(",")[3].substring(0, 3)) / 100, 0, 1),
        )
        .catch((e) => {
          console.error(e);
          return 0;
        }),
    ),
  );

  percent.subscribe(() => {
    execAsync(
      `brightnessctl -${filter} set ${(percent.get() * 100).toFixed(0)}%`,
    ).catch((e) => console.error(e));
  });

  return [percent, setPercent] as const;
};
