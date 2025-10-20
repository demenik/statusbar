import AstalNetwork from "gi://AstalNetwork";
import {
  Accessor,
  createBinding,
  createComputed,
  createState,
  With,
} from "ags";
import { Gtk } from "ags/gtk4";
import { MarqueeLabel } from "../../marquee";
import { formatFrequency } from "../format";
import { WifiAPConnect } from "./connect";

type Props = {
  ap: AstalNetwork.AccessPoint;
  activeAp: Accessor<AstalNetwork.AccessPoint>;
};

export const WifiAP = ({ ap, activeAp }: Props) => {
  const icon = createBinding(ap, "iconName");
  const authIcon = createBinding(ap, "requiresPassword").as((p) =>
    p ? "system-lock-screen-symbolic" : "dialog-warning-symbolic",
  );
  const authCss = authIcon.as((icon) =>
    icon == "dialog-warning-symbolic" ? "color: var(--accent-yellow);" : "",
  );

  const ssid = createBinding(ap, "ssid");
  const hidden = ssid.as((ssid) => !ssid);
  const active = activeAp.as((active) => active.bssid == ap.bssid);
  const classes = createComputed((get) => {
    const classes = ["wifi-ap"];

    if (get(hidden)) classes.push("hidden-ap");
    if (get(active)) classes.push("active-ap");
    if (get(connecting)) classes.push("connecting-ap");

    return classes;
  });

  const frequency = createBinding(ap, "frequency").as(formatFrequency);

  const [connecting, setConnecting] = createState(false);

  return (
    <box
      spacing={4}
      orientation={Gtk.Orientation.VERTICAL}
      cssClasses={classes}
    >
      <button
        onClicked={() => setConnecting(!connecting.get())}
        halign={Gtk.Align.FILL}
        class="invisible"
        css="min-width: 250px;"
      >
        <box spacing={4}>
          <image iconName={icon} />
          <image iconName={authIcon} css={authCss} />
          <MarqueeLabel
            label={ssid.as((ssid) => ssid || "Hidden SSID")}
            maxWidth={200}
          />
          <box hexpand />
          <label
            label={frequency}
            halign={Gtk.Align.END}
            css="font-weight: 600; font-size: 12px;"
          />
        </box>
      </button>

      <With value={connecting}>
        {(value) =>
          value && <WifiAPConnect ap={ap} close={() => setConnecting(false)} />
        }
      </With>
    </box>
  );
};
