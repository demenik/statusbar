import { Accessor, Setter } from "ags";
import { Gtk } from "ags/gtk4";

const marks = [0.25, 0.5, 0.75];

type Props = {
  percent: Accessor<number>;
  setPercent: Setter<number>;
};

export const BrightnessSlider = ({ percent, setPercent }: Props) => {
  return (
    <box spacing={4}>
      <label
        label={percent.as((value) => `${(value * 100).toFixed(0)}%`)}
        widthChars={5}
        xalign={1.0}
      />
      <slider
        hexpand
        value={percent}
        min={0}
        max={1}
        onChangeValue={({ value }) => setPercent(value)}
        $={(self) =>
          marks.forEach((mark) =>
            self.add_mark(mark, Gtk.PositionType.TOP, null),
          )
        }
      />
    </box>
  );
};
