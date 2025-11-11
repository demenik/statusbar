import { Gtk } from "ags/gtk4";
import Wp from "gi://AstalWp?version=0.1";
import { createBinding, For } from "ags";
import { AppRoutingApp } from "./app";

type Props = {
  audio: Wp.Audio;
};

export const AppRouting = ({ audio }: Props) => {
  const streams = createBinding(audio, "streams");

  return (
    <box orientation={Gtk.Orientation.VERTICAL} spacing={8}>
      <box spacing={4}>
        <image iconName="audio-card" iconSize={Gtk.IconSize.NORMAL} />
        <label label="App Mixer" css="font-weight: 700;" />
      </box>
      <For each={streams}>{(stream) => <AppRoutingApp stream={stream} />}</For>
    </box>
  );
};
