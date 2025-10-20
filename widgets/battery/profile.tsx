import { setTlpConfig, tlpConfig, TlpConfig } from "../../utils/interface/tlp";
import { createDropDown } from "../../utils/createDropdown";
import { capitalizeAll } from "../../utils/capitalize";

type Props<K extends keyof TlpConfig> = {
  configKey: K;
  profiles: TlpConfig[K][];
};

export const ProfileSettings = <K extends keyof TlpConfig>({
  configKey,
  profiles,
}: Props<K>) => {
  const value = tlpConfig.as((config) => config[configKey] as TlpConfig[K]);
  const setValue = (newValue: TlpConfig[K]) =>
    setTlpConfig((prev) => {
      prev[configKey] = newValue;
      return prev;
    });

  const getLabel = (value: TlpConfig[K]): string => {
    if (typeof value === "string") return capitalizeAll(value.replace("-", ""));
    else if (typeof value === "number") return value ? "Enabled" : "Disabled";
    return "Unknown";
  };

  const dropdown = createDropDown<TlpConfig[K]>({
    entries: profiles.map((profile) => ({
      label: getLabel(profile),
      value: profile,
    })),
    selected: value,
    onChange: ({ value }) => setValue(value),
  });

  return dropdown;
};
