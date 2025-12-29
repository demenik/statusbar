import AstalTray from "gi://AstalTray?version=0.1";
import { createBinding } from "ags";
import { TrayIcon } from "./icon";

type Props = {
  item: AstalTray.TrayItem;
};

export const TrayMenuItem = ({ item }: Props) => {
  const tooltip = createBinding(item, "tooltipMarkup");
  const menuModel = createBinding(item, "menuModel");

  return (
    <menubutton
      class="invisible"
      tooltipMarkup={tooltip}
      menuModel={menuModel}
      $={(self) => {
        self.insert_action_group("dbusmenu", item.actionGroup);
      }}
    >
      <TrayIcon item={item} />
    </menubutton>
  );
};
