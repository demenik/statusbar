import GLib from "gi://GLib";
import { Accessor, createComputed, createState } from "ags";
import { Gtk } from "ags/gtk4";
import { createDropDown } from "../../utils/createDropdown";
import { months, weekDaysShort } from "./const";

const getDaysInMonth = (date: GLib.DateTime) => {
  const year = date.get_year();
  const month = date.get_month();
  return GLib.Date.get_days_in_month(month, year);
};

const getFirstDayOfMonth = (date: GLib.DateTime) => {
  const year = date.get_year();
  const month = date.get_month();
  const firstDay = GLib.DateTime.new_local(year, month, 1, 0, 0, 0);
  return firstDay.get_day_of_week();
};

const isValidYear = (year: string) => /^\d{4}$/.test(year.trim());

type Props = {
  today: Accessor<GLib.DateTime>;
};

export const MonthCalendar = ({ today }: Props) => {
  const [date, setDate] = createState(today.get());
  const dateOrToday = createComputed((get) => `${get(date)}, ${get(today)}`);

  const prevMonth = () => setDate(date.get().add_months(-1)!);
  const nextMonth = () => setDate(date.get().add_months(1)!);

  const setMonth = (month: number) =>
    setDate(
      GLib.DateTime.new_local(
        date.get().get_year(),
        month,
        date.get().get_day_of_month(),
        0,
        0,
        0,
      ),
    );

  const [yearInput, setYearInput] = createState(
    date.get().get_year().toString(),
  );
  const yearInputValid = yearInput.as((year) => isValidYear(year));
  yearInputValid.subscribe(() => {
    if (yearInputValid.get()) {
      setDate(
        GLib.DateTime.new_local(
          parseInt(yearInput.get()),
          date.get().get_month(),
          date.get().get_day_of_month(),
          0,
          0,
          0,
        ),
      );
    }
  });

  const monthDropDown = createDropDown<number>({
    entries: months.map((month, i) => ({
      label: month,
      value: i + 1,
    })),
    selected: date.as((date) => date.get_month()),
    onChange: (month) => setMonth(month.value),
  });

  return (
    <box class="calendar" orientation={Gtk.Orientation.VERTICAL} spacing={12}>
      <box spacing={4}>
        <button
          class="invisible"
          iconName="pan-start-symbolic"
          onClicked={prevMonth}
        />
        <box spacing={4} hexpand={true} halign={Gtk.Align.CENTER}>
          {monthDropDown}
          <entry
            placeholderText="Year"
            text={date.as((date) => date.get_year().toString())}
            onNotifyText={({ text }) => setYearInput(text)}
            maxWidthChars={5}
            maxLength={5}
            inputPurpose={Gtk.InputPurpose.DIGITS}
            xalign={0.5}
            class={yearInputValid.as((v) => (v ? "" : "invalid"))}
          />
        </box>
        <button
          class="invisible"
          iconName="pan-end-symbolic"
          onClicked={nextMonth}
        />
      </box>
      <Gtk.Grid
        onRealize={(self) => {
          const update = () => {
            let child: Gtk.Widget | null;
            while ((child = self.get_first_child())) {
              self.remove(child);
            }

            const year = date.get().get_year();
            const month = date.get().get_month();

            for (let i = 0; i < 7; i++) {
              const isSunday = i === 6;

              self.attach(
                new Gtk.Label({
                  label: weekDaysShort[i],
                  css_classes: ["calendar-weekday"].concat(
                    isSunday ? ["sunday"] : [],
                  ),
                }),
                i,
                0,
                1,
                1,
              );
            }

            const daysInMonth = getDaysInMonth(date.get());
            const firstDayOfMonth = getFirstDayOfMonth(date.get());

            let day = 1;
            for (let row = 1; row <= 6; row++) {
              for (let col = 1; col <= 7; col++) {
                if ((row === 1 && col < firstDayOfMonth) || day > daysInMonth)
                  continue;

                const isCurrent =
                  day === date.get().get_day_of_month() &&
                  month === date.get().get_month() &&
                  year === date.get().get_year();

                const isToday =
                  day === today.get().get_day_of_month() &&
                  month === today.get().get_month() &&
                  year === today.get().get_year();

                const isSunday = col === 7;

                const dayLabel = new Gtk.ToggleButton({
                  label: `${day}`,
                  css_classes: ["calendar-day"].concat(
                    isToday ? ["today"] : [],
                    isSunday ? ["sunday"] : [],
                  ),
                  hexpand: true,
                  active: isCurrent,
                });

                dayLabel.connect("clicked", (self) =>
                  setDate(
                    GLib.DateTime.new_local(
                      date.get().get_year(),
                      date.get().get_month(),
                      parseInt(self.label),
                      0,
                      0,
                      0,
                    ),
                  ),
                );

                self.attach(dayLabel, col - 1, row, 1, 1);
                day++;
              }
            }
            self.show();
          };

          dateOrToday.subscribe(() => update());
          update();
        }}
      />
    </box>
  );
};
