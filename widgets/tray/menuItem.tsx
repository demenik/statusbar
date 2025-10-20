import AstalTray from "gi://AstalTray?version=0.1";
import { createBinding, With } from "ags";
import { Gtk } from "ags/gtk4";

type Props = {
  item: AstalTray.TrayItem;
};

export const TrayMenuItem = ({ item }: Props) => {
  const iconName = createBinding(item, "iconName");
  const imageIconName = iconName.as((icon) =>
    Gtk.Image.new_from_icon_name(icon),
  );

  const iconPixBuf = createBinding(item, "iconPixbuf");
  const imagePixBuf = iconPixBuf.as((pixBuf) =>
    Gtk.Image.new_from_pixbuf(pixBuf),
  );

  const tooltip = createBinding(item, "tooltipMarkup");

  const menuModel = createBinding(item, "menuModel");
  const popover = menuModel.as((model) =>
    Gtk.PopoverMenu.new_from_model(model),
  );

  return (
    <menubutton class="invisible" tooltipMarkup={tooltip}>
      {iconName.get() === null ? (
        <With value={imagePixBuf}>{(value) => value}</With>
      ) : (
        <With value={imageIconName}>{(value) => value}</With>
      )}
      <With value={popover}>{(popover) => popover}</With>
    </menubutton>
  );
};
