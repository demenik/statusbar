import { Gtk } from "ags/gtk4";
import AstalBattery from "gi://AstalBattery";
import { createBinding, createComputed } from "ags";
import { formatSecDefaultPadding } from "../../utils/formatSec";
import { HSeparator } from "../separator";
import {
  cpuScalingGovernors,
  platformProfiles,
  radeonDpmStates,
} from "../../utils/interface/tlp";
import { ProfileSettings } from "./profile";

type Props = {
  battery: AstalBattery.Device;
};

export const BatteryPopup = ({ battery }: Props) => {
  const batteryIcon = createBinding(battery, "iconName");
  const charging = createBinding(battery, "charging");
  const rate = createBinding(battery, "energy_rate").as((rate) =>
    Math.abs(rate).toFixed(1),
  );
  const chargingLabel = createComputed((get) =>
    get(charging)
      ? `Charging with ${get(rate)}W`
      : `Discharging with ${get(rate)}W`,
  );
  const timeToFull = createBinding(battery, "timeToFull");
  const timeToEmpty = createBinding(battery, "timeToEmpty");
  const timeLabel = createComputed((get) =>
    get(charging)
      ? `${formatSecDefaultPadding(get(timeToFull))} for full charge`
      : `${formatSecDefaultPadding(get(timeToEmpty))} left`,
  );

  const profilesAc = Object.entries({
    PLATFORM_PROFILE_ON_AC: platformProfiles,
    RADEON_DPM_STATE_ON_AC: radeonDpmStates,
    CPU_SCALING_GOVERNOR_ON_AC: cpuScalingGovernors,
    CPU_BOOST_ON_AC: [1, 0],
  } as const);
  const profilesBat = Object.entries({
    PLATFORM_PROFILE_ON_BAT: platformProfiles,
    RADEON_DPM_STATE_ON_BAT: radeonDpmStates,
    CPU_SCALING_GOVERNOR_ON_BAT: cpuScalingGovernors,
    CPU_BOOST_ON_BAT: [1, 0],
  } as const);

  const getProfileLabel = (key: string) => {
    if (key.startsWith("PLATFORM_PROFILE")) return "Platform profile";
    else if (key.startsWith("RADEON_DPM_STATE")) return "Radeon DPM state";
    else if (key.startsWith("CPU_SCALING_GOVERNOR"))
      return "CPU scaling governor";
    else if (key.startsWith("CPU_BOOST")) return "CPU Boost";
  };

  // TODO: grid

  return (
    <box
      halign={Gtk.Align.START}
      orientation={Gtk.Orientation.VERTICAL}
      spacing={8}
    >
      <box spacing={4}>
        <image iconName={batteryIcon} iconSize={Gtk.IconSize.NORMAL} />
        <label label={chargingLabel} />
      </box>
      <label label={timeLabel} halign={Gtk.Align.START} />
      <HSeparator />
      <box spacing={4}>
        <image
          iconName="power-profile-performance-symbolic"
          iconSize={Gtk.IconSize.NORMAL}
        />
        <label label="Power Profile" />
      </box>
      <box spacing={8}>
        <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
          <label label=" " class="title" />
          {profilesAc.map(([key]) => (
            <label label={getProfileLabel(key)} />
          ))}
        </box>
        <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
          <label label="On AC" class="title" halign={Gtk.Align.START} />
          {profilesAc.map(([key, profiles]) => (
            <ProfileSettings
              configKey={key}
              profiles={profiles as (string | number)[]}
            />
          ))}
        </box>
        <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
          <label label="On battery" class="title" halign={Gtk.Align.START} />
          {profilesBat.map(([key, profiles]) => (
            <ProfileSettings
              configKey={key}
              profiles={profiles as (string | number)[]}
            />
          ))}
        </box>
      </box>
    </box>
  );
};
