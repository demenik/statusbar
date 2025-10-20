import { Gtk } from "ags/gtk4";
import Wp from "gi://AstalWp";
import { Accessor, createBinding, With } from "ags";
import { MicrophoneSettings } from "./microphone";
import { SpeakerSettings } from "./speaker";
import { HSeparator } from "../separator";
import { createOptionalBinding, flattenAccessor } from "../../utils/accessor";
import { AppRouting } from "./routing";

export const AudioSettings = () => {
  const { audio } = Wp.get_default();

  const speakers = createBinding(audio, "speakers");
  const current = speakers.as((speakers) =>
    speakers.find((value) => value.isDefault),
  );
  const icon = flattenAccessor(
    current.as((current) => createOptionalBinding(current, "volumeIcon")),
  ).as((icon) => icon ?? "");

  const hasStreams = createBinding(audio, "streams").as(
    (streams) => streams.length > 0,
  );

  return (
    <menubutton class="invisible icon" iconName={icon}>
      <popover hasArrow={false} css="min-width: 400px;">
        <box orientation={Gtk.Orientation.VERTICAL} spacing={8}>
          <MicrophoneSettings audio={audio} />
          <HSeparator />
          <SpeakerSettings audio={audio} />
          <With value={hasStreams}>
            {(hasStreams) =>
              hasStreams && (
                <>
                  <HSeparator />
                  <AppRouting audio={audio} />
                </>
              )
            }
          </With>
        </box>
      </popover>
    </menubutton>
  );
};
