import { createPoll } from "ags/time";
import { SystemStat } from "./stat";
import { execAsync } from "ags/process";

type Props = {
  pollingInterval?: number;
};

export const CpuUsage = ({ pollingInterval = 5000 }: Props) => {
  const value = createPoll("N/A%", pollingInterval, () =>
    execAsync(["bash", "-c", `${SRC}/scripts/hardware/cpu_idle.sh`])
      .then((idle) => {
        return `${(100 - parseFloat(idle.replace(",", "."))).toFixed(1)}%`;
      })
      .catch((err) => {
        console.error(err);
        return "N/A%";
      }),
  );

  return <SystemStat icon="" value={value} />;
};

export const CpuTemp = ({ pollingInterval = 5000 }: Props) => {
  const value = createPoll("N/A°C", pollingInterval, () =>
    execAsync(["bash", "-c", `${SRC}/scripts/hardware/cpu_temp.sh`])
      .then((temp) => {
        return `${temp}`;
      })
      .catch((err) => {
        console.error(err);
        return "N/A°C";
      }),
  );

  return <SystemStat icon="" value={value} />;
};
