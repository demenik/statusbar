import { Gtk } from "ags/gtk4";
import { Accessor, createState } from "ags";
import { timeout, type Timer } from "ags/time";
import Pango from "gi://Pango";
import { isAccessor } from "../utils/accessor";
import { Props } from "../utils/types";
import { FadeBox } from "./fade";

type MarqueeProps = {
  label: string | Accessor<string>;
  marqueeSpeed?: number;
  marqueePause?: number;
  marqueeGap?: number;
  maxWidth?: number;
  labelProps?: Props<Gtk.Label, Gtk.Label.ConstructorProps>;
} & Props<Gtk.Box, Gtk.Box.ConstructorProps>;

export const MarqueeLabel = ({
  marqueeSpeed = 25,
  marqueePause = 3000,
  marqueeGap = 30,
  maxWidth,

  label: text,
  labelProps = {},
  ...rest
}: MarqueeProps) => {
  let marqueeTimer: Timer | null = null;
  let fadeTimer: Timer | null = null;

  const [boxCss, setBoxCss] = createState(
    "transition: none; transform: translateX(0);",
  );
  const [fadeSides, setFadeSides] = createState([Gtk.PositionType.RIGHT]);

  const [width, setWidth] = createState(maxWidth ?? -1);
  const [height, setHeight] = createState(-1);

  const updateMarquee = (container: Gtk.Overlay, label: Gtk.Label) => {
    if (marqueeTimer) {
      marqueeTimer.cancel();
      marqueeTimer = null;
    }
    if (fadeTimer) {
      fadeTimer.cancel();
      fadeTimer = null;
    }

    setBoxCss("transition: none; transform: translateX(0);");
    setWidth(maxWidth ?? -1);

    const pangoCtx = label.get_pango_context();
    const layout = Pango.Layout.new(pangoCtx);
    layout.set_text(isAccessor(text) ? text.get() : text, -1);
    const [labelWidth, labelHeight] = layout.get_pixel_size();
    const containerWidth = container.get_preferred_size()[0]?.width ?? -1;

    setHeight(labelHeight);

    if (labelWidth > containerWidth) {
      const scrollAmount = labelWidth + marqueeGap;
      const duration = (scrollAmount / marqueeSpeed) * 1000;

      setFadeSides([Gtk.PositionType.RIGHT]);

      const animate = () => {
        setBoxCss(`
          transition: transform ${duration}ms linear;
          transform: translateX(-${scrollAmount}px);
        `);
        setFadeSides([Gtk.PositionType.LEFT, Gtk.PositionType.RIGHT]);

        fadeTimer = timeout(duration * 0.95, () =>
          setFadeSides([Gtk.PositionType.RIGHT]),
        );

        marqueeTimer = timeout(duration, () => {
          setBoxCss(`
            transition: none;
            transform: translateX(0);
          `);

          marqueeTimer = timeout(marqueePause, animate);
        });
      };

      marqueeTimer = timeout(marqueePause, animate);
    } else {
      setWidth(labelWidth);
      setFadeSides([]);
    }
  };

  return (
    <FadeBox fadeSides={fadeSides} fadeWidth={20} {...rest}>
      <overlay
        class="marquee-container"
        css="min-width: 0;"
        overflow={Gtk.Overflow.HIDDEN}
        halign={Gtk.Align.BASELINE_CENTER}
        $={(self) => {
          const box = self.get_last_child()! as Gtk.Box;
          const label = box.get_first_child()! as Gtk.Label;

          if (isAccessor(text)) {
            text.subscribe(() => {
              timeout(1, () => updateMarquee(self, label));
            });
          }

          self.connect("realize", () => updateMarquee(self, label));
        }}
      >
        <box widthRequest={width} heightRequest={height} vexpand={true} />
        <box $type="overlay" css={boxCss}>
          <label {...labelProps} label={text} />
          <box widthRequest={marqueeGap} />
          <label {...labelProps} label={text} />
        </box>
      </overlay>
    </FadeBox>
  );
};
