import { Gtk } from "ags/gtk4";
import AstalBattery from "gi://AstalBattery";
import { createBinding, createComputed, With } from "ags";

export const Battery = () => {
  const battery = AstalBattery.get_default();
  const isBattery = createBinding(battery, "isBattery");

  const icon = createBinding(battery, "batteryIconName");
  const batteryLabel = createBinding(battery, "percentage").as(
    (level) => `${(level * 100).toFixed(0)}%`,
  );
  const label = createComputed(() => (isBattery() ? batteryLabel() : null));

  return (
    <menubutton class="icon invisible">
      <box spacing={4}>
        <image iconName={icon} iconSize={Gtk.IconSize.NORMAL} />
        <With value={label}>{(value) => value && <label label={value} />}</With>
      </box>
      <popover hasArrow={false}>
        {/*<BatteryPopup battery={battery} />*/}
      </popover>
    </menubutton>
  );
};
