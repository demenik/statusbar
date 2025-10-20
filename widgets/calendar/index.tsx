import { Gtk } from "ags/gtk4";
import { createPoll } from "ags/time";
import GLib from "gi://GLib";
import { MonthCalendar } from "./month";

const shortFormat = "%a, %-e. %b, %H:%M";
const longTimeFormat = "%H:%M:%S";

export const Calendar = () => {
  const dateTime = createPoll(GLib.DateTime.new_now_local(), 1000, () =>
    GLib.DateTime.new_now_local(),
  );
  const shortDateTime = dateTime.as(
    (dateTime) => dateTime.format(shortFormat) ?? "",
  );
  const longTime = dateTime.as(
    (dateTime) => dateTime.format(longTimeFormat) ?? "",
  );

  return (
    <menubutton class="invisible">
      <label label={shortDateTime} />
      <popover hasArrow={false}>
        <box orientation={Gtk.Orientation.VERTICAL} spacing={8}>
          <label label={longTime} />
          <MonthCalendar today={dateTime} />
        </box>
      </popover>
    </menubutton>
  );
};
