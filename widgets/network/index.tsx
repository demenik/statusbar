import AstalNetwork from "gi://AstalNetwork";
import { createBinding, With } from "ags";
import { WiredSettings } from "./wired";
import { WifiSettings } from "./wifi";
import { constantAccessor, flattenAccessor } from "../../utils/accessor";
import { Gtk } from "ags/gtk4";
import { HSeparator } from "../separator";
import { WifiConnect } from "./connect";

export const Network = () => {
  const network = AstalNetwork.get_default();

  const primary = createBinding(network, "primary");
  const icon = flattenAccessor(
    primary.as((primary) => {
      switch (primary) {
        case AstalNetwork.Primary.WIRED:
          return createBinding(network.wired, "iconName");
        case AstalNetwork.Primary.WIFI:
          return createBinding(network.wifi, "iconName");
        default:
          return constantAccessor("network-error-symbolic");
      }
    }),
  );

  return (
    <menubutton class="invisible">
      <image class="icon" iconName={icon} />
      <popover hasArrow={false}>
        <box orientation={Gtk.Orientation.VERTICAL} spacing={8}>
          <WiredSettings wired={network.wired} />
          <HSeparator />
          <WifiSettings wifi={network.wifi} />
          <HSeparator />
          <WifiConnect wifi={network.wifi} />
        </box>
      </popover>
    </menubutton>
  );
};
