import { Gtk } from "ags/gtk4";
import { CCProps } from "gnim";

export type Props<T extends Gtk.Widget, Props> = CCProps<T, Partial<Props>>;
