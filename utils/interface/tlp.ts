import { readFile, writeFileAsync } from "ags/file";
import { createState } from "ags";

const tlpConfigPath = "/etc/tlp.conf";

export type PlatformProfile = "performance" | "balanced" | "low-power";
export const platformProfiles: PlatformProfile[] = [
  "performance",
  "balanced",
  "low-power",
];

export type RadeonDpmState = "performance" | "balanced" | "battery";
export const radeonDpmStates: RadeonDpmState[] = [
  "performance",
  "balanced",
  "battery",
];

export type CpuScalingGovernor = "performance" | "powersave";
export const cpuScalingGovernors: CpuScalingGovernor[] = [
  "performance",
  "powersave",
];

export type TlpConfig = Partial<{
  START_CHARGE_TRESH_BAT0: number;
  STOP_CHARGE_THRESH_BAT0: number;

  PLATFORM_PROFILE_ON_AC: PlatformProfile;
  PLATFORM_PROFILE_ON_BAT: PlatformProfile;

  RADEON_DPM_STATE_ON_AC: RadeonDpmState;
  RADEON_DPM_STATE_ON_BAT: RadeonDpmState;

  CPU_SCALING_GOVERNOR_ON_AC: CpuScalingGovernor;
  CPU_SCALING_GOVERNOR_ON_BAT: CpuScalingGovernor;

  CPU_BOOST_ON_AC: 1 | 0;
  CPU_BOOST_ON_BAT: 1 | 0;

  [key: string]: string | number;
}>;

const lines = readFile(tlpConfigPath)
  .split("\n")
  .filter((line) => !line.trim().startsWith("#"));

const readConfig = Object.fromEntries(
  lines.map((line) => {
    const [key, ...rest] = line.split("=");
    const value = rest.join("=");

    if (value.startsWith('"') && value.endsWith('"'))
      return [key, value.substring(1, lines.length - 1)];

    if (!isNaN(parseInt(value))) return [key, parseInt(value)];

    return [key, value];
  }),
) as TlpConfig;

export const [tlpConfig, setTlpConfig] = createState<TlpConfig>(readConfig);

tlpConfig.subscribe(() => {
  const output = Object.entries(tlpConfig.get())
    .map(([key, value]) => {
      if (typeof value === "string") return `${key}="${value}"`;
      else if (typeof value === "number") return `${key}=${value}`;
      return "";
    })
    .join("\n");

  console.log(output);

  writeFileAsync("/etc/tlp.conf", output).catch(console.error);
});
