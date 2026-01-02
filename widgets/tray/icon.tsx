import AstalTray from "gi://AstalTray?version=0.1";
import { createBinding } from "gnim";

type Props = {
  item: AstalTray.TrayItem;
};

export const TrayIcon = ({ item }: Props) => {
  return <image class="icon" gicon={createBinding(item, "gicon")} />;
};
