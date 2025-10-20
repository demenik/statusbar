import { createPoll } from "ags/time";
import { SystemStat } from "./stat";
import { execAsync } from "ags/process";

type Props = {
  pollingInterval?: number;
};

export const CpuUsage = ({ pollingInterval = 5000 }: Props) => {
  const value = createPoll("?%", pollingInterval, () =>
    execAsync(["bash", "-c", "scripts/cpu_idle.sh"])
      .then((idle) => {
        return `${(100 - parseFloat(idle.replace(",", "."))).toFixed(1)}%`;
      })
      .catch((err) => {
        console.error(err);
        return "?%";
      }),
  );

  return <SystemStat icon="" value={value} />;
};
