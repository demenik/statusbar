import AstalNetwork from "gi://AstalNetwork?version=0.1";
import { createBinding, createComputed } from "ags";
import { Gtk } from "ags/gtk4";
import { formatInternet, formatState, getInternetIcon } from "./format";

type Props = {
  wired: AstalNetwork.Wired;
};

export const WiredSettings = ({ wired }: Props) => {
  const icon = createBinding(wired, "iconName");

  const state = createBinding(wired, "state").as(formatState);
  const speed = createBinding(wired, "speed").as(
    (speed) => `${speed.toFixed(0)}Mbit/s`,
  );
  const stateLabel = createComputed((get) => `${get(state)}, ${get(speed)}`);

  const internet = createBinding(wired, "internet");
  const internetIcon = internet.as(getInternetIcon);
  const internetLabel = internet.as(formatInternet);

  return (
    <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
      <box spacing={4} halign={Gtk.Align.START}>
        <image iconName={icon} iconSize={Gtk.IconSize.NORMAL} />
        <label label="Ethernet" css="font-weight: 700;" />
      </box>
      <label label={stateLabel} halign={Gtk.Align.START} />
      <box spacing={4} halign={Gtk.Align.START}>
        <image iconName={internetIcon} iconSize={Gtk.IconSize.NORMAL} />
        <label label={internetLabel} halign={Gtk.Align.START} />
      </box>
    </box>
  );
};
