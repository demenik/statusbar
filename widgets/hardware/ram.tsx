import { execAsync } from "ags/process";
import { createPoll } from "ags/time";
import { SystemStat } from "./stat";

type Props = {
  pollingInterval?: number;
};

export const RamUsage = ({ pollingInterval = 5000 }: Props) => {
  const value = createPoll("N/A GB", pollingInterval, () =>
    execAsync(["bash", "-c", `${SRC}/scripts/hardware/ram_usage.sh`])
      .then((usage) => usage)
      .catch((err) => {
        console.error(err);
        return "N/A GB";
      }),
  );

  return <SystemStat icon="" value={value} />;
};
