import { createBinding, For } from "ags";
import Hyprland from "gi://AstalHyprland";
import { Workspace } from "./workspace";
import { Gtk } from "ags/gtk4";

export const Workspaces = () => {
  const hyprland = Hyprland.get_default();

  const workspaces = createBinding(hyprland, "workspaces").as((workspaces) =>
    workspaces.sort((a, b) => a.id - b.id),
  );
  const focused = createBinding(hyprland, "focusedWorkspace");

  return (
    <button class="workspaces small pill invisible">
      <box spacing={5} valign={Gtk.Align.CENTER}>
        <For each={workspaces}>
          {(w) => <Workspace isFocused={focused.as((f) => f.id == w.id)} />}
        </For>
      </box>
    </button>
  );
};
