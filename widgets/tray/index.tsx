import AstalTray from "gi://AstalTray";
import { createBinding, For } from "ags";
import { TrayItem } from "./item";
import { TrayMenuItem } from "./menuItem";

export const Tray = () => {
  const tray = AstalTray.get_default();

  const items = createBinding(tray, "items");

  return (
    <box spacing={4}>
      <For each={items}>
        {(item) =>
          item.isMenu ? <TrayMenuItem item={item} /> : <TrayItem item={item} />
        }
      </For>
    </box>
  );
};
