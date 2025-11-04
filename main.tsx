import app from "ags/gtk4/app";
import { Astal, Gtk } from "ags/gtk4";
import { Workspaces } from "./widgets/workspaces";
import { Music } from "./widgets/music";
import { PowerMenu } from "./widgets/power";
import scss from "./app.scss";
import { AudioSettings } from "./widgets/audio";
import { Battery } from "./widgets/battery";
import { Calendar } from "./widgets/calendar";
import { Network } from "./widgets/network";
import { BrightnessSettings } from "./widgets/brightness";
import { Tray } from "./widgets/tray";
import { Bluetooth } from "./widgets/bluetooth";
import { CpuUsage, CpuTemp } from "./widgets/hardware/cpu";
import { RamUsage } from "./widgets/hardware/ram";
import { NetworkSpeed } from "./widgets/hardware/network";

app.start({
  css: scss,
  main() {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;

    return (
      <window
        visible
        class="statusbar"
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
        anchor={TOP | LEFT | RIGHT}
      >
        <centerbox class="statusbar-container">
          <box $type="start" spacing={4} valign={Gtk.Align.CENTER}>
            <Workspaces />
            <box spacing={8}>
              <CpuUsage />
              <CpuTemp />
              <RamUsage />
              <NetworkSpeed />
            </box>
            <Tray />
          </box>
          <box $type="center" spacing={4} valign={Gtk.Align.CENTER}>
            <Music />
          </box>
          <box $type="end" spacing={4} valign={Gtk.Align.CENTER}>
            <BrightnessSettings />
            <Battery />
            <AudioSettings />
            <Bluetooth />
            <Network />
            <PowerMenu />
            <Calendar />
          </box>
        </centerbox>
      </window>
    );
  },
});
