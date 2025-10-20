import { Gtk } from "ags/gtk4";
import { Props } from "../utils/types";
import {
  joinClasses,
  OptionalAccessor,
  optionalAccessorAs,
} from "../utils/accessor";

export const PasswordEntry = ({
  valid,
  cssClasses,
  ...props
}: Props<Gtk.Entry, Gtk.Entry.ConstructorProps> & {
  valid?: OptionalAccessor<boolean>;
}) => (
  <entry
    {...props}
    secondary_icon_name="view-conceal-symbolic"
    secondaryIconActivatable
    onIconPress={(self, position) => {
      if (position !== Gtk.EntryIconPosition.SECONDARY) return;

      const isVisible = !self.get_visibility();
      self.set_visibility(isVisible);

      self.set_icon_from_icon_name(
        Gtk.EntryIconPosition.SECONDARY,
        isVisible ? "view-reveal-symbolic" : "view-conceal-symbolic",
      );
    }}
    cssClasses={joinClasses(
      cssClasses,
      optionalAccessorAs(valid, (value) => (value !== true ? ["invalid"] : [])),
    )}
  />
);
