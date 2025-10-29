import { execAsync } from "ags/process";
import { createPoll } from "ags/time";
import { SystemStat } from "./stat";

type Props = {
  pollingInterval?: number;
};

export const DiskReadWrite = ({ pollingInterval = 5000 }: Props) => {
  const value = createPoll(" 0B/s  0B/s", pollingInterval, () =>
    execAsync([
      "bash",
      "-c",
      `${SRC}/scripts/hardware/disk_usage.sh ${pollingInterval / 1000}`,
    ])
      .then((usage) => usage)
      .catch((err) => {
        console.error(err);
        return " 0B/s  0B/s";
      }),
  );

  return <SystemStat icon="󰋊" value={value} />;
};
