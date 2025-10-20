import { Accessor } from "ags";
import { isAccessor } from "./accessor";
import { Gtk } from "ags/gtk4";

export type DropDownEntry<T> = {
  value: T;
  label: string;
};

type Props<T> = {
  entries: DropDownEntry<T>[] | Accessor<DropDownEntry<T>[]>;
  selected?: T | Accessor<T | undefined> | undefined;
  onChange?: ((selected: DropDownEntry<T>) => void) | undefined;
};

export const createDropDown = <T>({
  entries,
  selected,
  onChange,
}: Props<T>) => {
  let ignoreCallback = false;
  let currentEntries: DropDownEntry<T>[] = [];

  const model = new Gtk.StringList();
  const dropdown = new Gtk.DropDown({ model });

  const updateSelection = (selectedValue: T | undefined) => {
    if (selectedValue === undefined) {
      ignoreCallback = true;
      dropdown.selected = Gtk.INVALID_LIST_POSITION;
      ignoreCallback = false;
      return;
    }

    const index = currentEntries.findIndex(
      (entry) => entry.value === selectedValue,
    );

    ignoreCallback = true;
    dropdown.selected = index !== -1 ? index : Gtk.INVALID_LIST_POSITION;
    ignoreCallback = false;
  };

  const updateModel = (newEntries: DropDownEntry<T>[]) => {
    ignoreCallback = true;
    currentEntries = newEntries;

    while (model.get_n_items() > 0) {
      model.remove(0);
    }
    currentEntries.forEach((entry) => model.append(entry.label));

    updateSelection(isAccessor(selected) ? selected.get() : selected);
    ignoreCallback = false;
  };

  dropdown.connect("notify::selected", () => {
    if (ignoreCallback) return;
    const current = dropdown.selected;
    if (current >= 0 && currentEntries[current]) {
      onChange?.(currentEntries[current]);
    }
  });

  if (isAccessor(entries)) {
    updateModel(entries.get());
    entries.subscribe(() => updateModel(entries.get()));
  } else {
    updateModel(entries);
  }

  if (selected !== undefined) {
    if (isAccessor(selected)) {
      updateSelection(selected.get());
      selected.subscribe(() => updateSelection(selected.get()));
    } else {
      updateSelection(selected);
    }
  }

  return dropdown;
};
