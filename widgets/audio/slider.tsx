import { Accessor, createBinding } from "ags";
import { Gtk } from "ags/gtk4";
import Wp from "gi://AstalWp";

type Props = {
  volume: Accessor<number>;
  isMuted: Accessor<boolean>;
  icon: Accessor<string>;
  changeVolume: (volume: number) => void;
  setMute: (mute: boolean) => void;
};

export const VolumeSlider = ({
  volume,
  isMuted,
  icon,
  changeVolume,
  setMute,
}: Props) => {
  const label = volume.as((value) => `${(value * 100).toFixed(0)}%`);
  const marks = [0.25, 0.5, 0.75, 1.0, 1.25];

  return (
    <box spacing={4}>
      <label label={label} width_chars={5} xalign={1} />
      <slider
        value={volume}
        min={0}
        max={1.5}
        hexpand={true}
        onChangeValue={({ value }) => changeVolume(value)}
        $={(self) =>
          marks.forEach((mark) =>
            self.add_mark(mark, Gtk.PositionType.TOP, null),
          )
        }
      />
      <togglebutton
        iconName={icon}
        active={isMuted}
        onToggled={({ active }) => setMute(active)}
      />
    </box>
  );
};

type EndpointProps = {
  endpoint: Wp.Endpoint;
};

export const VolumeSliderEndpoint = ({ endpoint }: EndpointProps) =>
  VolumeSlider({
    volume: createBinding(endpoint, "volume"),
    isMuted: createBinding(endpoint, "mute"),
    icon: createBinding(endpoint, "volumeIcon"),
    changeVolume: (volume) => endpoint.set_volume(volume),
    setMute: (mute) => endpoint.set_mute(mute),
  });

type NodeProps = {
  node: Wp.Node;
};

export const VolumeSliderNode = ({ node }: NodeProps) =>
  VolumeSlider({
    volume: createBinding(node, "volume"),
    isMuted: createBinding(node, "mute"),
    icon: createBinding(node, "volumeIcon"),
    changeVolume: (volume) => node.set_volume(volume),
    setMute: (mute) => node.set_mute(mute),
  });
