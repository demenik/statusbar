import { getBrightnessIcon } from "./icon";
import { Gtk } from "ags/gtk4";
import { BrightnessSlider } from "./slider";
import { createBrightness } from "../../utils/interface/brightnessctl";
import { HSeparator } from "../separator";

export const BrightnessSettings = () => {
  const [percent, setPercent] = createBrightness({ class: "backlight" });
  const icon = percent.as(getBrightnessIcon);

  const [kbd, setKbd] = createBrightness({ device: "tpacpi::kbd_backlight" });
  const kbdOff = kbd.as((value) => value === 0);
  const kbdLow = kbd.as((value) => value === 0.5);
  const kbdHigh = kbd.as((value) => value === 1);

  return (
    <menubutton class="invisible">
      <image iconName={icon} />
      <popover css="min-width: 400px;" hasArrow={false}>
        <box orientation={Gtk.Orientation.VERTICAL} spacing={8}>
          <box spacing={4}>
            <image iconName="computer-laptop-symbolic" />
            <label label="Laptop screen" class="title" />
          </box>
          <BrightnessSlider percent={percent} setPercent={setPercent} />
          <HSeparator />
          <box spacing={4}>
            <image iconName="input-keyboard-symbolic" />
            <label label="Keyboard backlight" class="title" />
          </box>
          <box spacing={4}>
            <togglebutton
              iconName="display-brightness-low-symbolic"
              hexpand
              active={kbdOff}
              onClicked={() => setKbd(0)}
            >
              <box spacing={4} halign={Gtk.Align.CENTER}>
                <image iconName="display-brightness-low-symbolic" />
                <label label="Off" />
              </box>
            </togglebutton>
            <togglebutton
              iconName="display-brightness-medium-symbolic"
              hexpand
              active={kbdLow}
              onClicked={() => setKbd(0.5)}
            >
              <box spacing={4} halign={Gtk.Align.CENTER}>
                <image iconName="display-brightness-low-symbolic" />
                <label label="Low" />
              </box>
            </togglebutton>
            <togglebutton
              iconName="display-brightness-high-symbolic"
              hexpand
              active={kbdHigh}
              onClicked={() => setKbd(1)}
            >
              <box spacing={4} halign={Gtk.Align.CENTER}>
                <image iconName="display-brightness-low-symbolic" />
                <label label="High" />
              </box>
            </togglebutton>
          </box>
        </box>
      </popover>
    </menubutton>
  );
};
