import AstalCava from "gi://AstalCava?version=0.1";
import { createBinding } from "ags";
import { Gtk } from "ags/gtk4";
import { Props } from "../../../../utils/types";
import Cairo from "gi://cairo";

type AudioWaveProps = {
  cava?: AstalCava.Cava;
} & Partial<Props<Gtk.DrawingArea, Gtk.DrawingArea.ConstructorProps>>;

export const AudioWave = ({
  cava = AstalCava.get_default()!,
  ...props
}: AudioWaveProps) => {
  const values = createBinding(cava, "values");

  const draw: Gtk.DrawingAreaDrawFunc = (_, cr, width, height) => {
    const vals = values.get();

    if (!vals || vals.length === 0) return;

    const envelopeY = new Array(width).fill(height);
    const bandWidth = width / vals.length;
    const waveWidth = 2 * bandWidth;

    for (let i = 0; i < vals.length; i++) {
      const amplitude = Math.pow(vals[i], 2) * height;
      if (amplitude <= 1) continue;

      const centerX = i * 0.5 * bandWidth;
      const startX = Math.max(0, Math.floor(centerX - waveWidth / 2));
      const endX = Math.min(width, Math.ceil(centerX + waveWidth / 2));

      for (let x = startX; x < endX; x++) {
        const relativeX = x - centerX;
        const angle = (relativeX / (waveWidth / 2)) * (Math.PI / 2);

        const factorY = Math.cos(angle);
        const y = height - amplitude * factorY;

        envelopeY[x] = Math.min(envelopeY[x], y);
      }
    }

    // @ts-ignore
    const gradient = new Cairo.LinearGradient(0, 0, 0, height);
    gradient.addColorStopRGBA(0.0, 0.2, 0.5, 0.9, 1.0);
    gradient.addColorStopRGBA(1.0, 0.5, 0.2, 0.8, 1.0);
    cr.setSource(gradient);

    cr.moveTo(0, height);
    for (let x = 0; x < width; x++) {
      cr.lineTo(x, envelopeY[x]);
    }
    cr.lineTo(width, height);
    cr.closePath();

    cr.fill();
  };

  return (
    <drawingarea
      {...props}
      $={(self) => {
        self.set_draw_func(draw);

        let unsubscribe: (() => void) | null;
        self.connect("realize", () => {
          unsubscribe = values.subscribe(() => {
            const newValues = values.get();
            if (!newValues || newValues.length === 0) return;
            self.queue_draw();
          });
        });

        self.connect("unrealize", () => {
          if (unsubscribe) {
            unsubscribe();
            unsubscribe = null;
          }
        });
      }}
    />
  );
};
