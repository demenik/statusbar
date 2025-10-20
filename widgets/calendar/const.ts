import GLib from "gi://GLib?version=2.0";

const now = GLib.DateTime.new_now_local();

export const months = (() => {
  const months: string[] = [];
  const year = now.get_year();

  for (let i = 1; i <= 12; i++) {
    const date = GLib.DateTime.new_local(year, i, 1, 0, 0, 0);
    months.push(date.format("%B")!);
  }

  return months;
})();

const weekDays = (format: string) => {
  const weekdays: string[] = [];
  const weekday = now.get_day_of_week();
  let currentDay = now.add_days(-(weekday - 1));

  for (let i = 0; i < 7; i++) {
    weekdays.push(currentDay!.format(format)!);
    currentDay = currentDay!.add_days(1);
  }

  return weekdays;
};

export const weekDaysShort = (() => weekDays("%a"))();
export const weekDaysLong = (() => weekDays("%A"))();
