import app from "ags/gtk4/app";
import { Astal, Gdk, Gtk } from "ags/gtk4";
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

const PREFERRED_MONITORS = ["eDP-1", "HDMI-A-1"];

const App = (monitor: number) => {
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;

  return (
    <window
      visible
      class="statusbar"
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP | LEFT | RIGHT}
      monitor={monitor}
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
  ) as unknown as Gtk.Window;
};

app.start({
  css: scss,
  main() {
    const display = Gdk.Display.get_default();
    if (!display) return;

    const bars = new Map<number, Gtk.Window>();

    const syncMonitors = () => {
      const monitorList = display.get_monitors();
      const n = monitorList.get_n_items();
      if (n === 0) return;

      const monitors: Gdk.Monitor[] = [];
      for (let i = 0; i < n; i++) {
        monitors.push(monitorList.get_item(i) as Gdk.Monitor);
      }

      let mainMonitorIndex = 0;
      for (const name of PREFERRED_MONITORS) {
        const index = monitors.findIndex((m) => m.connector === name);
        if (index > 0) {
          mainMonitorIndex = index;
          console.log(`Found preferred monitor: ${name}`);
          break;
        }
      }

      for (const [index, win] of bars) {
        if (index !== mainMonitorIndex) {
          win.close();
          bars.delete(index);
        }
      }

      if (!bars.has(mainMonitorIndex)) {
        const bar = App(mainMonitorIndex);
        bars.set(mainMonitorIndex, bar);
      }
    };

    display.get_monitors().connect("items-changed", syncMonitors);
    syncMonitors();
  },
});
