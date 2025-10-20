import { Gtk } from "ags/gtk4";
import Wp from "gi://AstalWp";
import { createBinding, With } from "ags";
import { createDropDown } from "../../utils/createDropdown";
import { VolumeSliderEndpoint } from "./slider";
import { constantAccessor, flattenAccessor } from "../../utils/accessor";
import { createBrightness } from "../../utils/interface/brightnessctl";

type Props = {
  audio: Wp.Audio;
};

export const MicrophoneSettings = ({ audio }: Props) => {
  const microphones = createBinding(audio, "microphones");
  const current = microphones.as((mics) =>
    mics.find((value) => value.isDefault === true),
  );

  const dropdown = createDropDown<Wp.Endpoint>({
    entries: microphones.as((mics) =>
      mics.map((mic) => {
        const device = mic.get_device();
        const name = device?.get_description() ?? "Unknown Device";

        return {
          label: name,
          value: mic,
        };
      }),
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
    device: "platform::micmute",
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
        <image
          iconName="audio-input-microphone"
          iconSize={Gtk.IconSize.NORMAL}
        />
        <label label="Microphone" css="font-weight: 700;" />
      </box>

      {dropdown}
      <With value={current}>
        {(value) => value && <VolumeSliderEndpoint endpoint={value} />}
      </With>
    </box>
  );
};
