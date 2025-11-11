import Wp from "gi://AstalWp?version=0.1";
import { createBinding, With } from "ags";
import { Gtk } from "ags/gtk4";
import { getAppIcon } from "../../../utils/icons";
import { VolumeSliderNode } from "../slider";
import { capitalizeAll } from "../../../utils/capitalize";

type Props = {
  stream: Wp.Stream;
};

export const AppRoutingApp = ({ stream }: Props) => {
  const name = createBinding(stream, "description");
  const icon = name.as((name) => getAppIcon(name));

  return (
    <box spacing={4}>
      <With value={icon}>
        {(value) =>
          value && (
            <image
              iconName={value}
              iconSize={Gtk.IconSize.NORMAL}
              class="color-icon"
            />
          )
        }
      </With>
      <label label={name.as((name) => capitalizeAll(name))} />
      <VolumeSliderNode node={stream} />
    </box>
  );
};
