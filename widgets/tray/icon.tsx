import AstalTray from "gi://AstalTray?version=0.1";

type Props = {
  item: AstalTray.TrayItem;
};

export const TrayIcon = ({ item }: Props) => {
  return (
    <image
      class="icon"
      $={(self) => {
        const update = () => {
          if (item.iconPixbuf) {
            self.set_from_pixbuf(item.iconPixbuf);
          } else if (item.iconName) {
            self.set_from_icon_name(item.iconName);
          } else if (item.gicon) {
            self.set_from_gicon(item.gicon);
          } else {
            self.set_from_icon_name("image-missing");
          }
        };
        update();

        const id1 = item.connect("notify::icon-pixbuf", update);
        const id2 = item.connect("notify::icon-name", update);
        const id3 = item.connect("notify::gicon", update);

        self.connect("destroy", () => {
          item.disconnect(id1);
          item.disconnect(id2);
          item.disconnect(id3);
        });
      }}
    />
  );
};
