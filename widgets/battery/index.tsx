import { Gtk } from "ags/gtk4";
import AstalBattery from "gi://AstalBattery";
import { createBinding } from "ags";
import { BatteryPopup } from "./popup";

export const Battery = () => {
  const battery = AstalBattery.get_default();

  const icon = createBinding(battery, "batteryIconName");
  const label = createBinding(battery, "percentage").as(
    (level) => `${(level * 100).toFixed(0)}%`,
  );

  return (
    <menubutton class="icon invisible">
      <box spacing={4}>
        <image iconName={icon} iconSize={Gtk.IconSize.NORMAL} />
        <label label={label} />
      </box>
      <popover hasArrow={false}>
        <BatteryPopup battery={battery} />
      </popover>
    </menubutton>
  );
};
