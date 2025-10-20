import { Gtk } from "ags/gtk4";
import AstalNetwork from "gi://AstalNetwork";
import { createBinding, createComputed, For } from "ags";
import { WifiAP } from "./ap";
import { stateFromAccessor } from "../../../utils/accessor";

type Props = {
  wifi: AstalNetwork.Wifi;
};

export const WifiConnect = ({ wifi }: Props) => {
  const activeAp = createBinding(wifi, "activeAccessPoint");
  const [accessPoints, setAccessPoints] = stateFromAccessor(
    createBinding(wifi, "accessPoints"),
  );
  const sortedAPs = createComputed((get) => {
    const bssid = get(activeAp).bssid;
    const aps = get(accessPoints);

    return aps.sort((a, b) => {
      if (a.bssid == bssid) return -99999;
      if (b.bssid == bssid) return 99999;

      return b.strength - a.strength;
    });
  });

  const refresh = () => setAccessPoints(wifi.get_access_points());

  return (
    <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
      <box spacing={4} halign={Gtk.Align.START}>
        <button class="icon" iconName="view-refresh" onClicked={refresh} />
        <label label="Connect to Wifi" css="font-weight: 700;" />
      </box>
      <scrolledwindow
        vscrollbarPolicy={Gtk.PolicyType.AUTOMATIC}
        hscrollbarPolicy={Gtk.PolicyType.NEVER}
        maxContentHeight={300}
        propagateNaturalHeight
      >
        <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
          <For each={sortedAPs}>
            {(ap) => <WifiAP ap={ap} activeAp={activeAp} />}
          </For>
        </box>
      </scrolledwindow>
    </box>
  );
};
