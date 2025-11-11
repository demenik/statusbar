import { Gtk } from "ags/gtk4";
import Wp from "gi://AstalWp?version=0.1";
import { createBinding, With } from "ags";
import { createDropDown } from "../../utils/createDropdown";
import { VolumeSliderEndpoint } from "./slider";
import { constantAccessor, flattenAccessor } from "../../utils/accessor";
import { createBrightness } from "../../utils/interface/brightnessctl";

type Props = {
  audio: Wp.Audio;
};

export const SpeakerSettings = ({ audio }: Props) => {
  const speakers = createBinding(audio, "speakers");
  const current = speakers.as((speakers) =>
    speakers.find((value) => value.isDefault),
  );

  const dropdown = createDropDown<Wp.Endpoint>({
    entries: speakers.as((speakers) =>
      speakers.map((speaker) => ({
        label: speaker.get_device()?.get_description() ?? "Unknown",
        value: speaker,
      })),
    ),
    selected: current,
    onChange: (selected) => selected.value.set_is_default(true),
  });

  const isMuted = flattenAccessor(
    current.as((current) =>
      current ? createBinding(current, "mute") : constantAccessor(false),
    ),
  );
  const [_, setMuteBrightness] = createBrightness({
    device: "platform::mute",
  });

  isMuted.subscribe(() => {
    if (isMuted.get()) {
      setMuteBrightness(1);
    } else {
      setMuteBrightness(0);
    }
  });

  return (
    <box orientation={Gtk.Orientation.VERTICAL} spacing={8}>
      <box spacing={4}>
        <image iconName="audio-volume-high" iconSize={Gtk.IconSize.NORMAL} />
        <label label="Speaker" css="font-weight: 700;" />
      </box>

      {dropdown}
      <With value={current}>
        {(value) => value && <VolumeSliderEndpoint endpoint={value} />}
      </With>
    </box>
  );
};
