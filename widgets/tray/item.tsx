import AstalTray from "gi://AstalTray";
import { createBinding, With } from "ags";
import { Gdk, Gtk } from "ags/gtk4";

type Props = {
  item: AstalTray.TrayItem;
};

export const TrayItem = ({ item }: Props) => {
  const iconName = createBinding(item, "iconName");
  const imageIconName = iconName.as((value) =>
    Gtk.Image.new_from_icon_name(value),
  );

  const iconPixbuf = createBinding(item, "iconPixbuf");
  const imagePixbuf = iconPixbuf.as((value) =>
    Gtk.Image.new_from_pixbuf(value),
  );

  const tooltip = createBinding(item, "tooltipMarkup");

  const getPosition = (self: Gtk.Widget) => {
    const toplevel = self.get_ancestor(Gtk.Window.$gtype);
    if (!toplevel) return null;

    const w = self.get_size(Gtk.Orientation.HORIZONTAL);
    const h = self.get_size(Gtk.Orientation.VERTICAL);
    const [s1, x, y] = self.translate_coordinates(toplevel, w * 0.5, h);
    if (!s1) return null;

    const surface = (toplevel as Gtk.Window).get_surface();
    if (!surface) return null;

    const device = Gdk.Display.get_default()?.get_default_seat()?.get_pointer();
    if (!device) return null;

    const [s2, winX, winY] = surface!.get_device_position(device);
    if (!s2) return null;

    return [winX + x, winY + y];
  };

  const open = (x: number, y: number, primary: boolean) => {
    item.about_to_show();

    if (primary) {
      item.activate(x, y);
    } else {
      item.secondary_activate(x, y);
    }
  };

  return (
    <button
      class="invisible"
      onClicked={(self) => {
        const pos = getPosition(self);
        if (!pos) return console.error("Error getting position");
        const [x, y] = pos;

        open(x, y, true);
      }}
      tooltipMarkup={tooltip}
      $={(self) => {
        const gesture = new Gtk.GestureClick();
        gesture.set_button(3);
        gesture.connect("pressed", () => {
          const pos = getPosition(self);
          if (!pos) return console.error("Error getting position");
          const [x, y] = pos;

          open(x, y, false);
        });
        self.add_controller(gesture);
      }}
    >
      {iconName.get() === null ? (
        <With value={imagePixbuf}>{(value) => value}</With>
      ) : (
        <With value={imageIconName}>{(value) => value}</With>
      )}
    </button>
  );
};
