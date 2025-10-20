import { Gtk } from "ags/gtk4";
import { dialogConfirm } from "../../utils/dialog";
import { exec } from "ags/process";

export const PowerMenu = () => {
  const lock = () => exec("hyprlock");

  const reboot = () =>
    dialogConfirm({
      title: "Reboot",
      text: "Are you sure you want to reboot?",
    }).then((response) => {
      if (response) {
        exec("sudo reboot now");
      }
    });

  const shutdown = () =>
    dialogConfirm({
      title: "Shutdown",
      text: "Are you sure you want to shutdown?",
    }).then((response) => {
      if (response) {
        exec("sudo shutdown now");
      }
    });

  return (
    <menubutton class="invisible">
      <image
        iconName="system-shutdown-symbolic"
        iconSize={Gtk.IconSize.NORMAL}
      />
      <popover hasArrow={false}>
        <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
          <button onClicked={lock}>
            <box spacing={4}>
              <image
                iconName="system-lock-screen-symbolic"
                iconSize={Gtk.IconSize.NORMAL}
              />
              <label label="Lock" />
            </box>
          </button>
          <button onClicked={reboot}>
            <box spacing={4}>
              <image
                iconName="system-reboot-symbolic"
                iconSize={Gtk.IconSize.NORMAL}
              />
              <label label="Reboot" />
            </box>
          </button>
          <button onClicked={shutdown}>
            <box spacing={4}>
              <image
                iconName="system-shutdown-symbolic"
                iconSize={Gtk.IconSize.NORMAL}
              />
              <label label="Shutdown" />
            </box>
          </button>
        </box>
      </popover>
    </menubutton>
  );
};
