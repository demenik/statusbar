import { Gtk } from "ags/gtk4";
import Cava from "gi://AstalCava";
import { createBinding } from "ags";
import { Props } from "../../utils/types";

// TODO: displays nothing

export const CavaVisualizer = (
  props: Props<Gtk.DrawingArea, Gtk.DrawingArea.ConstructorProps>,
) => {
  const cava = Cava.get_default() ?? new Cava.Cava();
  const values = createBinding(cava, "values");

  const barSpacing = 2;
  const minBarHeight = 2;

  const draw: Gtk.DrawingAreaDrawFunc = (self, cr, w, h) => {
    const vals = values.get();
    if (!vals || vals.length === 0) return;
    const barWidth = (w - (vals.length - 1) * barSpacing) / vals.length;

    const ctx = self.get_style_context();
    const color = ctx.get_color();
    cr.setSourceRGBA(color.red, color.green, color.blue, color.alpha);

    for (let i = 0; i < vals.length; i++) {
      const value = vals[i];
      if (value === undefined) continue;

      let barHeight = value * h;
      if (barHeight < minBarHeight) barHeight = minBarHeight;

      const x = i * (barWidth + barSpacing);
      const y = h - barHeight;

      cr.rectangle(x, y, barWidth, barHeight);
    }

    cr.fill();
  };

  return <drawingarea {...props} $={(self) => self.set_draw_func(draw)} />;
};
