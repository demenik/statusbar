import { Gtk } from "ags/gtk4";
import AstalNetwork from "gi://AstalNetwork?version=0.1";
import { createBinding, createComputed } from "ags";
import { formatInternet, formatState, getInternetIcon } from "./format";

type Props = {
  wifi: AstalNetwork.Wifi;
};

export const WifiSettings = ({ wifi }: Props) => {
  const icon = createBinding(wifi, "iconName");
  const ssid = createBinding(wifi, "ssid");

  const state = createBinding(wifi, "state").as(formatState);
  const speed = createBinding(wifi, "bandwidth").as(
    (speed) => `${speed.toFixed(0)}Mbit/s`,
  );
  const stateLabel = createComputed((get) => `${get(state)}, ${get(speed)}`);

  const internet = createBinding(wifi, "internet");
  const internetIcon = internet.as(getInternetIcon);
  const internetLabel = internet.as(formatInternet);

  return (
    <box orientation={Gtk.Orientation.VERTICAL} spacing={8}>
      <box spacing={4} halign={Gtk.Align.START}>
        <image iconName={icon} iconSize={Gtk.IconSize.NORMAL} />
        <label label={ssid} css="font-weight: 700;" />
      </box>
      <label label={stateLabel} halign={Gtk.Align.START} />
      <box spacing={4} halign={Gtk.Align.START}>
        <image iconName={internetIcon} iconSize={Gtk.IconSize.NORMAL} />
        <label label={internetLabel} halign={Gtk.Align.START} />
      </box>
    </box>
  );
};
