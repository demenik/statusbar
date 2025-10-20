import AstalBluetooth from "gi://AstalBluetooth";
import { createBinding, createComputed, With } from "ags";
import { Gtk } from "ags/gtk4";
import { MarqueeLabel } from "../marquee";
import { BTDeviceDetails } from "./details";

type Props = {
  device: AstalBluetooth.Device;
};

export const BluetoothDevice = ({ device }: Props) => {
  const name = createBinding(device, "alias");
  const icon = createBinding(device, "icon").as(
    (icon) => icon ?? "dialog-question-symbolic",
  );

  // rssi is always 0, idk why
  const rssi = createBinding(device, "rssi").as((rssi) => {
    if (rssi >= 80) return "network-cellular-signal-excellent-symbolic";
    else if (rssi >= 60) return "network-cellular-signal-good-symbolic";
    else if (rssi >= 40) return "network-cellular-signal-ok-symbolic";
    else if (rssi >= 20) return "network-cellular-signal-weak-symbolic";
    else return "network-cellular-signal-none-symbolic";
  });

  const isConnected = createBinding(device, "connected");
  const isConnecting = createBinding(device, "connecting");
  const connectionIcon = createComputed((get) => {
    if (get(isConnected)) return "network-wireless-connected-symbolic";
    else if (get(isConnecting)) return "network-wireless-acquiring-symbolic";
    else return get(rssi);
  });

  const isBlocked = createBinding(device, "blocked");
  const isTrusted = createBinding(device, "trusted");
  const trustIcon = createComputed((get) => {
    if (get(isBlocked)) return "bluetooth-disabled-symbolic";
    else if (get(isTrusted)) return "emblem-ok-symbolic";
    else return null;
  });

  const battery = createBinding(device, "batteryPercentage").as(
    (percentage) => {
      if (percentage >= 90) return "battery-good-symbolic";
      else if (percentage >= 70) return "battery-good-symbolic";
      else if (percentage >= 40) return "battery-low-symbolic";
      else if (percentage >= 10) return "battery-caution-symbolic";
      else return "battery-empty-symbolic";
    },
  );

  return (
    <menubutton class="invisible" hexpand direction={Gtk.ArrowType.LEFT}>
      <box spacing={4}>
        <image iconName={icon} class="icon" iconSize={Gtk.IconSize.NORMAL} />
        <MarqueeLabel label={name} maxWidth={300} />
        <box hexpand />
        <With value={trustIcon}>
          {(icon) =>
            icon && <image iconName={icon} iconSize={Gtk.IconSize.NORMAL} />
          }
        </With>
        <image iconName={connectionIcon} iconSize={Gtk.IconSize.NORMAL} />
        <image iconName={battery} iconSize={Gtk.IconSize.NORMAL} />
      </box>
      <popover hasArrow={false}>
        <BTDeviceDetails device={device} />
      </popover>
    </menubutton>
  );
};
