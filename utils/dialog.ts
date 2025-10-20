import { Gtk } from "ags/gtk4";

type DialogPasswordProps = {
  transientFor?: Gtk.Window;
  title: string;
  prompt?: string;
  cancelLabel?: string;
  confirmLabel?: string;
};

export const dialogPassword = ({
  transientFor,
  title,
  prompt = "Enter password",
  cancelLabel = "Cancel",
  confirmLabel = "Login",
}: DialogPasswordProps): Promise<string> => {
  return new Promise((resolve, reject) => {
    const dialog = new Gtk.MessageDialog({
      transientFor,
      title,
      modal: true,
      buttons: Gtk.ButtonsType.OK_CANCEL,
      messageType: Gtk.MessageType.QUESTION,
      text: prompt,
    });

    const contentArea = dialog.get_content_area();

    const passwordEntry = new Gtk.Entry({
      visibility: false,
      margin_bottom: 10,
    });

    passwordEntry.set_icon_from_icon_name(
      Gtk.EntryIconPosition.SECONDARY,
      "view-conceal-symbolic",
    );
    passwordEntry.set_icon_activatable(Gtk.EntryIconPosition.SECONDARY, true);

    passwordEntry.connect("icon-press", (self, _) => {
      const isVisible = !self.get_visibility();
      self.set_visibility(isVisible);

      self.set_icon_from_icon_name(
        Gtk.EntryIconPosition.SECONDARY,
        isVisible ? "view-reveal-symbolic" : "view-conceal-symbolic",
      );
    });

    contentArea.append(passwordEntry);

    dialog.connect("response", (_, response) => {
      if (response === Gtk.ResponseType.OK) {
        resolve(passwordEntry.get_text());
      } else {
        reject("Cancelled by user");
      }

      dialog.destroy();
    });

    dialog.present();
  });
};

type DialogErrorProps = {
  transientFor?: Gtk.Window;
  title: string;
  text?: string;
};

export const dialogError = ({
  transientFor,
  title,
  text,
}: DialogErrorProps) => {
  const dialog = new Gtk.MessageDialog({
    transientFor,
    title,
    modal: true,
    buttons: Gtk.ButtonsType.CLOSE,
    messageType: Gtk.MessageType.ERROR,
    text,
  });

  dialog.present();
};

type DialogConfirmProps = {
  transientFor?: Gtk.Window;
  title: string;
  text?: string;
};

export const dialogConfirm = ({
  transientFor,
  title,
  text,
}: DialogConfirmProps) =>
  new Promise<boolean>((resolve) => {
    const dialog = new Gtk.MessageDialog({
      transientFor,
      title,
      text,
      modal: true,
      buttons: Gtk.ButtonsType.YES_NO,
    });

    dialog.connect("response", (_, response) => {
      if (response === Gtk.ResponseType.YES) {
        resolve(true);
      } else {
        resolve(false);
      }
    });

    dialog.present();
  });
